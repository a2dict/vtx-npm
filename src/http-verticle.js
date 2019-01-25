const CONFIG_WIKIDB_QUEUE = "wikidb.queue"
const Router = require("vertx-web-js/router")
const StaticHandler = require("vertx-web-js/static_handler")
const CookieHandler = require("vertx-web-js/cookie_handler");
const BodyHandler = require("vertx-web-js/body_handler");


const router = Router.router(vertx);
router.route().handler(CookieHandler.create().handle);
router.route().handler(BodyHandler.create().handle);

// import java class
const Processor = Java.type("com.github.rjeschke.txtmark.Processor")

router.get("/app/*").handler(StaticHandler.create().handle);
router.get("/").handler(context => context.reroute("/app/index.html"));

router.post("/app/markdown").handler(context => {
    let html = Processor.process(context.getBodyAsString());
    context.response()
        .putHeader("Content-Type", "text/html")
        .setStatusCode(200)
        .end(html);
});

router.get("/api/pages").handler(context => {
    let options = { headers: { "action": "all-pages" } }
    vertx.eventBus().send(CONFIG_WIKIDB_QUEUE, {}, options, (reply, reply_err) => {
        if (reply_err == null) {
            apiResponse(context, 201, "pages", reply.body().map(x => {
                let t = { id: x["_id"], name: x["name"] }
                return t;
            }));
        } else {
            apiFailure(context, reply_err.getMessage())
        }
    })
});

router.get("/api/pages/:id").handler(context => {
    let id = context.request().getParam("id")
    let options = { headers: { "action": "get-page" } }
    vertx.eventBus().send(CONFIG_WIKIDB_QUEUE, { id: id }, options, (reply, reply_err) => {
        if (reply_err == null) {
            apiResponse(context, 201, "page", reply.body().map(x => {
                let t = {
                    "id": x["_id"],
                    "name": x["name"],
                    "markdown": x["content"],
                    "html": Processor.process(x["content"])
                }
                return t;
            })[0]);
        } else {
            apiFailure(context, reply_err.getMessage())
        }
    })

})

// router.post().handler(BodyHandler.create().handle);
router.post("/api/test").handler(context => {
    console.log('--------')
    console.log(context.getBodyAsString())
    console.log(context.getBodyAsJson())
    apiResponse(context, 200)
})

router.post("/api/pages").handler(context => {
    let body = context.getBodyAsJson()
    let options = { headers: { "action": "add-page" } }
    vertx.eventBus().send(CONFIG_WIKIDB_QUEUE, body, options, (reply, reply_err) => {
        if (reply_err == null) {
            apiResponse(context, 201, null, null);
        } else {
            apiFailure(context, 500, reply_err.getMessage())
        }
    })

})

router.put("/api/pages/:id").handler(context =>{
    let id = context.request().getParam("id");
    let body = context.getBodyAsJson();
    body["id"] = id;
    let options = { headers: { "action": "update-page" } }
    vertx.eventBus().send(CONFIG_WIKIDB_QUEUE, body, options, (reply, reply_err) => {
        if (reply_err == null) {
            apiResponse(context, 201, null, null);
        } else {
            apiFailure(context, 500, reply_err.getMessage())
        }
    })
})
router.delete("/api/pages/:id").handler(context =>{
    let id = context.request().getParam("id");
    let options = { headers: { "action": "delete-page" } }
    vertx.eventBus().send(CONFIG_WIKIDB_QUEUE, body, options, (reply, reply_err) => {
        if (reply_err == null) {
            apiResponse(context, 201, null, null);
        } else {
            apiFailure(context, 500, reply_err.getMessage())
        }
    })
})
vertx.createHttpServer().requestHandler(router.accept).listen(8080)
console.log('Server listening: http://127.0.0.1:8080/')


function apiResponse(context, statusCode, field, data) {
    let res = { "success": true }
    if (field != null) {
        res[field] = data
    }
    context.response().setStatusCode(statusCode)
        .putHeader("Content-Type", "application/json")
        .end(JSON.stringify(res));
}

function apiFailure(context, statusCode, error_msg) {
    let res = { "success": false, "error": error_msg }
    context.response().setStatusCode(statusCode)
        .putHeader("Content-Type", "application/json")
        .end(JSON.stringify(res));
}


