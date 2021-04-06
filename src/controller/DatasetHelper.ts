import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";

export default class DatasetHelper {
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public saveData(id: string, kind: InsightDatasetKind, validSections: any[]) {
        let fs = require("fs");
        let insightDataset: InsightDataset = {id, kind, numRows: validSections.length};
        this.datasets.push(insightDataset);
        this.memory.push(id);
        let datasetContent = new Dataset(id, validSections);
        this.addedDatasetContent.push(datasetContent);
        const directory = "./src/data/";
        try {
            if (!fs.existsSync(directory)) {
                fs.mkdirSync(directory);
            }
            const filePath: string = directory + id;
            fs.writeFileSync(filePath, JSON.stringify(datasetContent));
        } catch (e) {
            throw new InsightError("Data was parsed correctly but not saved.");
        }
    }

    public getData(queryingDatasetId: string): any[] {
        let data: any[] = [];
        let fs = require("fs");
        let directory = "./src/data/";

        if (fs.existsSync(directory)) {
            const filePath: string = directory + queryingDatasetId;
            try {
                let buffer = fs.readFileSync(filePath);
                let diskData = JSON.parse(buffer);
                if (diskData !== null || diskData !== undefined) {
                    // if (this.memory.length === 0) {
                    return data = diskData.coursesArray;
                    // }
                }

                if (diskData === null || diskData === undefined) {
                    if (this.memory.length === 0) {
                        throw new InsightError("There are no datasets added.");
                    }
                }
            } catch (e) {
                throw new InsightError("No datasets added to disk or memory.");
            }
        }

        if (!fs.existsSync(directory)) {
            if (this.memory.length > 0 && this.memory.includes(queryingDatasetId)) {
                for (let d of this.addedDatasetContent) {
                    if (d.getDatasetId() === queryingDatasetId) {
                        return data = d.getCoursesArray();
                    }
                }
            } else {
                throw new InsightError("Nothing on disk, nothing in local memory.");
            }
        }
    }
}
