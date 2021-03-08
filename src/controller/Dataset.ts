import {
    Course,
} from "./Course";
import {InsightDataset, InsightError} from "./IInsightFacade";
import Log from "../Util";

export class Dataset {
    public datasetId: string;
    public coursesArray: any[] = [];

    public constructor(id: string, coursesArray: any[]) {
        Log.trace("InsightFacadeImpl::init()");
        this.datasetId = id;
        this.coursesArray = coursesArray;
    }

    public getDatasetId(): string {
        return this.datasetId;
    }

    public setDatasetId(id: string) {
        this.datasetId = id;
    }

    public getCoursesArray(): any[] {
        return this.coursesArray;
    }

    public setCoursesArray(array: any[]) {
        this.coursesArray = array;
    }

    public getData(queryingDatasetId: string, memory: any): any[] {
        let data: any[] = [];
        let fs = require("fs");
        let directory = "./src/data/";
        if (memory.length > 0 && memory.includes(queryingDatasetId)) {
            return data = this.getCoursesArray();
        } else {
            throw new InsightError("Cannot query a database that is not in memory.");
        }

        try {
            if (fs.existsSync(directory)) {
                let buffer = fs.readFileSync(directory + queryingDatasetId);
                let diskData = JSON.parse(buffer);
                let diskResult = diskData.result;
                if (memory.length === 0 && diskData === null) {
                    throw new InsightError("There are no datasets added.");
                }
                if (memory.length === 0 && diskData !== null) {
                    return data = diskData;
                }
            }
        } catch (err) {
            throw new InsightError("Cannot query a database that is not on disk.");
        }
    }
}
