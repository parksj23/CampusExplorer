
import restify = require("restify");
import Log from "../Util";
import InsightFacade from "../controller/InsightFacade";
import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";

export default class RestHandler {
    // TODO move all restHandlers here
    public constructor() {
        Log.trace("RestHandler::init()");
    }

}
