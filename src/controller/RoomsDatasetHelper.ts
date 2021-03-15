import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";

export default class RoomsDatasetHelper {
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public getLatLong(address: string): number[] {
        // 0 = latitude, 1= longitude
        return [];
        throw new Error("latitude and longitude could not be found");
    }

    public checkFieldTypeRoom (room: any): boolean {
        if (typeof room["fullname"] === "string" && typeof room["shortname"] === "string"
            && typeof room["number"] === "string" && typeof room["name"] === "string"
            && typeof room["address"] === "string" && typeof room["lat"] === "number"
            && typeof room["long"] === "number" && typeof room["type"] === "string"
            && typeof room["furniture"] === "string" && typeof room["href"] === "string") {
            return true;
        }
        return false;
    }

    public getBuildingAddress(): string {
        return "";
    }
}
