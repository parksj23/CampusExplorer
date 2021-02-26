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

import {
    Dataset,
} from "./Dataset";
import DoQuery from "./DoQuery";
import {rejects} from "assert";
import {expect} from "chai";

// let datasetArray: Dataset[] = [];
// let arrayOfPromises: any[] = [];

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {

    public datasetArray: Dataset[] = [];
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public cache: string;

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(
        id: string,
        content: string,
        kind: InsightDatasetKind,
    ): Promise<string[]> {
        // return Promise.reject("reject"); // Making addDataset a stub to test performQuery
        return new Promise<string[]>((resolve, reject) => {
            let promiseArray: Array<Promise<string>> = [];
            // check if id is valid
            if ((id === null) || (id === undefined)) {
                return reject(new InsightError("Invalid id."));
            } else if ((id.includes(" ")) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            // check if already added
            if (this.memory.includes(id)) {
                return Promise.reject(new InsightError("Dataset already added."));
            }

            let zip = new JSZip();
            let fileCount: number = 0;
            zip.loadAsync(content, {base64: true}).then((root) => {
                const courses: JSZip = root.folder("courses");
                courses.forEach((relativePath, course) => {
                    fileCount++;
                    // let promise1 = course.async("string").then((parsedCourse) => {
                    //     return JSON.parse(parsedCourse);
                    // }).catch((err: any) => {
                    //     expect(err).to.be.rejectedWith(InsightError);
                    // });
                    let asyncPromise = course.async("string");
                    promiseArray.push(asyncPromise);
                });

                if (fileCount === 0) {
                    reject(new InsightError("Empty courses folder."));
                }

                Promise.all(promiseArray).then((courseJSONs: any) => {
                    let validSections: any = [];
                    for (let i of courseJSONs) {
                        let iType = typeof i;
                        if (iType === "object") {
                            if (Object.keys(i).includes("result")) {
                                validSections = this.getSectionFields(i["result"], validSections);
                            }
                        }
                    }
                    if (validSections.length < 1) {
                        reject(new InsightError("No valid sections."));
                    } else {
                        this.saveData(id, InsightDatasetKind.Courses, validSections);
                        resolve(this.memory);
                    }
                    reject(new InsightError());
                });
            });
        });
    }

    private saveData(id: string, kind: InsightDatasetKind, validSections: any) {
        let fs = require("fs");
        let data: InsightDataset = {id, kind, numRows: validSections.length};
        this.datasets.push(data);
        this.memory.push(id);
        if (!fs.existsSync(this.cache)) {
            fs.mkdirSync(this.cache);
        }
        let fileName = this.cache + "/" + id + ".json";
        fs.writeFileSync(fileName, JSON.stringify(data));
    }

    private getSectionFields(result: any, sections: any[]): any[] {
        let smfields: string[] = ["dept", "id", "instructor", "title", "uuid", "avg", "pass", "fail", "audit", "year"];
        for (let i of result) {
            let section: any = {};
            let sectionFields = Object.keys(i);
            if (smfields.every((key) => {
                return sectionFields.indexOf(key) >= 0;
            })) {
                section["avg"] = i["Avg"];
                section["pass"] = i["Pass"];
                section["fail"] = i["Fail"];
                section["audit"] = i["Audit"];
                section["year"] = Number(i["Year"]);
                if (i["Section"] === "overall") {
                    section["year"] = 1900;
                }
                section["dept"] = i["Subject"];
                section["id"] = i["Course"];
                section["instructor"] = i["Professor"];
                section["title"] = i["Title"];
                section["uuid"] = i["id"].toString();
            }

            if (typeof section["avg"] === "number" && typeof section["pass"] === "number"
                && typeof section["fail"] === "number" && typeof section["audit"] === "number"
                && typeof section["year"] === "number" && typeof section["dept"] === "string"
                && typeof section["id"] === "string" && typeof section["instructor"] === "string"
                && typeof section["title"] === "string" && typeof section["uuid"] === "string") {
                sections.push(section);
            }
        }
        return sections;
    }

    public removeDataset(id: string):
        Promise<string> {
        return new Promise((resolve, reject) => {
            let fs = require("fs");
            let result: string = "";
            // check if id is valid
            if ((id === null) || (id === undefined)) {
                return reject(new InsightError("Invalid id."));
            } else if ((id.includes(" ")) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            try {
                if (!(this.memory.includes(id))) {
                    return reject(new NotFoundError("Failed to remove dataset."));
                } else {
                    for (let i = 0; i < this.memory.length; i++) {
                        if (this.memory[i] === id) {
                            result = this.memory[i];
                            this.memory.splice(i, 1);
                            this.datasets.splice(i, 1);
                            let filepath: string = "data/" + id;
                            fs.unlink(filepath, (e: any) => {
                                if (e) {
                                    return reject(new InsightError());
                                }
                            });
                            return resolve(result);
                        }
                    }
                    return reject(new NotFoundError());
                    // try {
                    //     let index: number = 0;
                    //     for (let i of this.datasets) {
                    //         if (i.id === id) {
                    //             this.datasets.splice(index, 1);
                    //         }
                    //         index++;
                    //     }
                    // } catch (e) {
                    //     return reject(new InsightError("Failed to remove dataset."));
                    // }
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    public performQuery(query: any):
        Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let validQuery = new ValidateQuery(query);
                // I had a break at validateQuery.validateQuery
                // let resultArray: Course[] = [];
                let doQuery = new DoQuery(query);
                if (validQuery.validateQuery(query)) {
                    let resultArray = doQuery.doInitialQuery(query);
                    if (resultArray.length > 5000) {
                        throw new ResultTooLargeError("Result too large.");
                    }
                    return resolve([resultArray]);
                } else {
                    throw new InsightError("Invalid query.");
                }
                // let queryObj = JSON.parse(JSON.stringify(query));
                // let where = (Object.getOwnPropertyDescriptor(queryObj, "WHERE")).value;
                // let options = (Object.getOwnPropertyDescriptor(queryObj, "OPTIONS")).value;
                // let columns = (Object.getOwnPropertyDescriptor(options, "COLUMNS")).value;
                // let order = (Object.getOwnPropertyDescriptor(options, "ORDER")).value;
                // let filter = (Object.getOwnPropertyNames(where));
                // if (typeof options === "undefined") {
                //     throw new InsightError("Invalid query. Missing OPTIONS block.");
                // }
                // if (typeof where === "undefined") {
                //     throw new InsightError("Invalid query. Missing WHERE block.");
                // }
                // resolve([resultArray]);
            } catch (e) {
                return reject(e);
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve(this.datasets);
    }
}
