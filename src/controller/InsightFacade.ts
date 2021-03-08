import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import {
    Course,
} from "./Course";
import ValidateQuery from "./ValidateQuery";

import DoQuery from "./DoQuery";
import {rejects} from "assert";
import {expect} from "chai";
import Dataset from "./Dataset";
import DatasetHelper from "./DatasetHelper";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {
    public performQueryDatasetIds: string[] = [];

    public d = new DatasetHelper();

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(
        id: string,
        content: string,
        kind: InsightDatasetKind,
    ): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let promiseArray: Array<Promise<string>> = [];
            // check if id is valid
            if ((id === null) || (id === undefined) || (!id.trim().length) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            // check if already added
            if (this.d.memory.includes(id)) {
                return reject(new InsightError("Dataset already added."));
            }
            let zip = new JSZip();
            let fileCount: number = 0;
            return zip.loadAsync(content, {base64: true}).then((root) => {
                const courses: JSZip = root.folder("courses");
                courses.forEach((relativePath, course) => {
                    let asyncPromise = course.async("string");
                    promiseArray.push(asyncPromise);
                    fileCount++;
                });
                if (fileCount < 1) {
                    reject(new InsightError("Invalid dataset: Empty or non-existent courses root directory."));
                }
                return Promise.all(promiseArray).then((courseJSONs: any) => {
                    let validSections: any[] = [];
                    for (let i of courseJSONs) {
                        let section = JSON.parse(i);
                        let sectionType = typeof section;
                        if (sectionType === "object") {
                            let objKeys = (Object.getOwnPropertyNames(section));
                            if (objKeys.includes("result")) {
                                validSections = this.d.getSectionFields(section["result"], validSections);
                            }
                        }
                    }
                    if (validSections.length < 1) {
                        return reject(new InsightError("No valid sections."));
                    } else {
                        this.d.saveData(id, InsightDatasetKind.Courses, validSections);
                        return resolve(this.d.memory);
                    }
                    return reject(new InsightError());
                }).catch((err: any) => {
                    return reject(new InsightError("data invalid, not in JSON format."));
                });
            }).catch((err: any) => {
                return reject(new InsightError("Non-zip folder."));
            });
        });
    }

    public removeDataset(id: string):
        Promise<string> {
        return new Promise((resolve, reject) => {
            let fs = require("fs");
            let result: string = "";
            // check if id is valid
            if ((id === null) || (id === undefined)) {
                return reject(new InsightError("Invalid id."));
            } else if ((!(id.trim().length)) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            try {
                if (!(this.d.memory.includes(id))) {
                    return reject(new NotFoundError("Dataset not found."));
                } else {
                    for (let index = 0; index < this.d.memory.length; index++) {
                        if (this.d.memory[index] === id) {
                            result = this.d.memory[index];
                            this.d.memory.splice(index, 1);
                            this.d.datasets.splice(index, 1);
                            const directory = "./src/data/";
                            let filepath: string = directory + id;
                            fs.unlink(filepath, (e: any) => {
                                if (e) {
                                    return reject(new InsightError());
                                }
                            });
                            return resolve(result);
                        }
                    }
                    return reject(new NotFoundError());
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.performQueryDatasetIds = [];
            try {
                let validQuery = new ValidateQuery(query);
                if (validQuery.validateQuery(query)) {
                    this.performQueryDatasetIds = validQuery.performQueryDatasetIds;
                    if (this.performQueryDatasetIds.length > 1) {
                        throw new InsightError("References more than 1 dataset.");
                    }
                    let queryingDatasetId = this.performQueryDatasetIds[0];
                    let data = this.d.getData(queryingDatasetId);

                    let doQuery = new DoQuery(query, data);
                    let resultArray = doQuery.doInitialQuery(query);
                    if (resultArray.length > 5000) {
                        // throw new ResultTooLargeError("Result has >5000 sections.");
                        throw new InsightError("Result has >5000 sections.");
                    }
                    return resolve(resultArray);
                } else {
                    throw new InsightError("Invalid query.");
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve(this.d.datasets);
    }
}
