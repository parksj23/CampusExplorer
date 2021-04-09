
import restify = require("restify");
import Log from "../Util";
import InsightFacade from "../controller/InsightFacade";
import {InsightDatasetKind} from "../controller/IInsightFacade";
import fs = require("fs");

export default class RestHandler {

    public static insightFacade = new InsightFacade();

    // TODO move all restHandlers here
    public constructor() {
        Log.trace("RestHandler::init()");
    }

    public static echo(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        try {
            const response = RestHandler.performEcho(req.params.msg);
            Log.info("Server::echo(..) - responding " + 200);
            res.json(200, {result: response});
        } catch (err) {
            Log.error("Server::echo(..) - responding 400");
            res.json(400, {error: err});
        }
        return next();
    }

    private static performEcho(msg: string): string {
        if (typeof msg !== "undefined" && msg !== null) {
            return `${msg}...${msg}`;
        } else {
            return "Message not provided";
        }
    }

    public static putDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::putDataset(..) - params: " + JSON.stringify(req.params));
        const content = (req.body).toString("base64");
        const id: string = req.params.id;
        const kind: InsightDatasetKind = req.params.kind;
        return RestHandler.insightFacade.addDataset(id, content, kind).then((response) => {
            res.json(200, {result: response});
            return next();
        }).catch((err) => {
            res.json(400, {error: err.message});
            return next();
        });
    }

    public static deleteDataset(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::deleteDataset(..) - params: " + JSON.stringify(req.params));
        const id: string = req.params.id;
        return RestHandler.insightFacade.removeDataset(id).then((response) => {
            res.json(200, {result: response});
            return next();
        }).catch((err) => {
            if (err.constructor.name === "InsightError") {
                res.json(400, {error: err.message});
                return next();
            }
            if (err.constructor.name === "NotFoundError") {
                res.json(404, {error: err.message});
                return next();
            }
        });
    }

    public static postQuery(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::postQuery(..) - params: " + JSON.stringify(req.params));
        return RestHandler.insightFacade.performQuery(req.params).then((response) => {
            res.json(200, {result: response});
            return next();
        }).catch((err) => {
            res.json(400, {error: err.message});
            return next();
        });
    }

    public static getDatasets(req: restify.Request, res: restify.Response, next: restify.Next) {
        Log.trace("Server::echo(..) - params: " + JSON.stringify(req.params));
        Log.info("Server::echo(..) - responding " + 200);
        return RestHandler.insightFacade.listDatasets().then((response) => {
            res.json(200, {result: response});
            return next();
        });
    }

    public static getStatic(req: restify.Request, res: restify.Response, next: restify.Next) {
        const publicDir = "frontend/public/";
        Log.trace("RoutHandler::getStatic::" + req.url);
        let path = publicDir + "index.html";
        if (req.url !== "/") {
            path = publicDir + req.url.split("/").pop();
        }
        fs.readFile(path, function (err: Error, file: Buffer) {
            if (err) {
                res.send(500);
                Log.error(JSON.stringify(err));
                return next();
            }
            res.write(file);
            res.end();
            return next();
        });
    }

}
