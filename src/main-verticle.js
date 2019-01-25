vertx.deployVerticle("http-verticle.js", (res, res_err) => {
    if (res_err == null) {

        var deploymentID = res;

        console.log("Other verticle deployed ok, deploymentID = " + deploymentID);

    } else {
        res_err.printStackTrace();
    }
});

vertx.deployVerticle("mongo-verticle.js", (res, res_err) => {
    if (res_err == null) {

        var deploymentID = res;

        console.log("Other verticle deployed ok, deploymentID = " + deploymentID);

    } else {
        res_err.printStackTrace();
    }
});

const Processor = Java.type("com.github.rjeschke.txtmark.Processor")
console.log(Processor.process("# pr_title"));