/**
 * Created by rtholmes on 2016-06-19.
 */

import fs = require("fs");
import restify = require("restify");
import Log from "../Util";
import InsightFacade from "../controller/InsightFacade";
import RestHandler from "./RestHandler";

/**
 * This configures the REST endpoints for the server.
 */
export default class Server {

    private port: number;
    private rest: restify.Server;
    public static insightFacade = new InsightFacade();

    constructor(port: number) {
        Log.info("Server::<init>( " + port + " )");
        this.port = port;
    }

    /**
     * Stops the server. Again returns a promise so we know when the connections have
     * actually been fully closed and the port has been released.
     *
     * @returns {Promise<boolean>}
     */
    public stop(): Promise<boolean> {
        Log.info("Server::close()");
        const that = this;
        return new Promise(function (fulfill) {
            that.rest.close(function () {
                fulfill(true);
            });
        });
    }

    /**
     * Starts the server. Returns a promise with a boolean value. Promises are used
     * here because starting the server takes some time and we want to know when it
     * is done (and if it worked).
     *
     * @returns {Promise<boolean>}
     */
    public start(): Promise<boolean> {
        const that = this;
        return new Promise(function (fulfill, reject) {
            try {
                Log.info("Server::start() - start");

                that.rest = restify.createServer({
                    name: "insightUBC",
                });
                that.rest.use(restify.bodyParser({mapFiles: true, mapParams: true}));
                that.rest.use(
                    function crossOrigin(req, res, next) {
                        res.header("Access-Control-Allow-Origin", "*");
                        res.header("Access-Control-Allow-Headers", "X-Requested-With");
                        return next();
                    });

                // This is an example endpoint that you can invoke by accessing this URL in your browser:
                // http://localhost:4321/echo/hello
                that.rest.get("/echo/:msg", RestHandler.echo);

                // NOTE: your endpoints should go here
                that.rest.put("/dataset/:id/:kind", RestHandler.putDataset);
                that.rest.del("/dataset/:id", RestHandler.deleteDataset);
                that.rest.post("/query", RestHandler.postQuery);
                that.rest.get("/datasets", RestHandler.getDatasets);

                // This must be the last endpoint!
                that.rest.get("/.*", RestHandler.getStatic);

                that.rest.listen(that.port, function () {
                    Log.info("Server::start() - restify listening: " + that.rest.url);
                    fulfill(true);
                });

                that.rest.on("error", function (err: string) {
                    // catches errors in restify start; unusual syntax due to internal
                    // node not using normal exceptions here
                    Log.info("Server::start() - restify ERROR: " + err);
                    reject(err);
                });

            } catch (err) {
                Log.error("Server::start() - ERROR: " + err);
                reject(err);
            }
        });
    }

}
