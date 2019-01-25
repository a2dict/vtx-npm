const MONGO_CONFIG = {
    "connection_string": "mongodb://localhost:27017",
    "db_name": "test",
    "useObjectId": true
}

const MongoClient = require("vertx-mongo-js/mongo_client");
const mongoClient = MongoClient.createShared(vertx, MONGO_CONFIG);

vertx.eventBus().consumer("wikidb.queue", onMessage);

function onMessage(message) {
    let action = message.headers().get("action")
    console.log(action)
    switch (action) {
        case "all-pages":
            fetchAllPages(message);
            break;
        case "get-page":
            fetchPageById(message);
            break;
        case "add-page":
            createPage(message);
            break;
        case "delete-page":
            deletePage(message);
            break;
        case "update-page":
            updatePage(message);
            break;
        default:
            message.fail(500, "cannot find action")
    }
}

/**
 *
 * @param message
 */
function fetchAllPages(message) {
    mongoClient.find("pages", {}, function (res, res_err) {
        if (res_err == null) {
            message.reply(res);
        } else {
            res_err.printStackTrace();
            message.fail(res.err)

        }
    })
}

function fetchPage(message) {
    mongoClient.findOne("pages", message.body(), function (res, res_err) {
        if (res_err == null) {
            message.reply(res);
        } else {
            message.fail(res_err);
        }
    })
}

function fetchPageById(message) {
    var id = message.body().id;
    mongoClient.find("pages", { "_id": id }, function (res, res_err) {
        console.log(res)
        if (res_err == null) {
            message.reply(res);
        } else {
            console.log("error")
            res_err.printStackTrace();
            message.fail(res_err);
        }
    })

}

function createPage(message) {
    var request = message.body();
    var t = {
        "name": request.name,
        "content": request.markdown
    }
    mongoClient.insert("pages", t, function (id, id_err) {
        if (id_err == null) {
            message.reply("ok");
        } else {
            message.fail(id_err);
        }
    })
}

function updatePage(message) {
    var request = message.body();
    var t = {
        "_id": request.id,
        "name": request.name,
        "content": request.markdown
    }
    mongoClient.save("pages", t, function (id, id_err) {
        if (id_err == null) {
            message.reply("ok");
        } else {
            message.fail(id_err);
        }
    })
}


function deletePage(message) {
    var id = message.body().id;
    mongoClient.remove("pages", { "_id": id }, function (res, res_err) {
        if (res_err == null) {
            message.reply("ok");
        } else {
            message.fail(res_err)
        }
    })

}