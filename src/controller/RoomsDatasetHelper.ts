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

    // public saveData(id: string, kind: InsightDatasetKind, validSections: any[]) {
    //     let fs = require("fs");
    //     let insightDataset: InsightDataset = {id, kind, numRows: validSections.length};
    //     this.datasets.push(insightDataset);
    //     this.memory.push(id);
    //     let datasetContent = new Dataset(id, validSections);
    //     this.addedDatasetContent.push(datasetContent);
    //     const directory = "./src/data/";
    //     try {
    //         if (!fs.existsSync(directory)) {
    //             fs.mkdirSync(directory);
    //         }
    //         const filePath: string = directory + id;
    //         fs.writeFileSync(filePath, JSON.stringify(datasetContent));
    //     } catch (e) {
    //         throw new InsightError("Data was parsed correctly but not saved");
    //     }
    // }

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
