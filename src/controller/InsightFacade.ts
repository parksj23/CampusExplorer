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
import {Dataset} from "./Dataset";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {

    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

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
            if ((id === null) || (id === undefined) || (id.includes(" ")) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            // check if already added
            if (this.memory.includes(id)) {
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
                    reject(new InsightError("Empty courses folder."));
                }
                return Promise.all(promiseArray).then((courseJSONs: any) => {
                    let validSections: any[] = [];
                    for (let i of courseJSONs) { // I had a breakpoint here to test the sectionFields methods
                        let section = JSON.parse(i);
                        let sectionType = typeof section;
                        if (sectionType === "object") {
                            let objKeys = (Object.getOwnPropertyNames(section));
                            if (objKeys.includes("result")) {
                                validSections = this.getSectionFields(section["result"], validSections);
                            }
                        }
                    }
                    if (validSections.length < 1) {
                        return reject(new InsightError("No valid sections."));
                    } else {
                        try {
                            this.saveData(id, InsightDatasetKind.Courses, validSections);
                            return resolve(this.memory);
                        } catch (e) {
                            return reject(new InsightError());
                        }
                    }
                    return reject(new InsightError());
                });
            }).catch((err: any) => {
                return reject(new InsightError("Non-zip folder."));
            });
        });
    }

    private saveData(id: string, kind: InsightDatasetKind, validSections: any[]) {
        let fs = require("fs");
        let insightDataset: InsightDataset = {id, kind, numRows: validSections.length};
        this.datasets.push(insightDataset);
        // TODO: do we have to wipe memory? There's smth about not using global variables as memory...
        this.memory.push(id);
        let datasetContent = new Dataset(id, validSections);
        this.addedDatasetContent.push(datasetContent);
        let directory = "./data";
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory);
        }
        let fileName = directory + id;
        fs.writeFileSync(fileName, JSON.stringify(insightDataset));
    }

    private getSectionFields(result: any, sections: any[]): any[] {
        let a = typeof result;
        let resultLength = result.length;
        let initialDesiredFields: string[] = ["Avg", "Pass", "Fail", "Audit", "Year", "Subject", "Course", "Professor",
            "Title", "id", "Section"];
        if (!(resultLength < 1)) {
            for (let i of result) {
                let section: any = {};
                let validSectionFields: any[] = [];
                let initialSectionFields = Object.keys(i);
                for (let key of initialDesiredFields) {
                    let iKey = typeof i[key];
                    if (initialSectionFields.includes(key)) {
                        validSectionFields.push(i[key]);
                    }
                }
                section["avg"] = i["Avg"];
                section["pass"] = i["Pass"];
                section["fail"] = i["Fail"];
                section["audit"] = i["Audit"];
                section["year"] = Number(i["Year"]);
                if (i["Section"].toLowerCase() === "overall") {
                    section["year"] = 1900;
                }
                section["dept"] = i["Subject"];
                section["id"] = i["Course"];
                section["instructor"] = i["Professor"];
                section["title"] = i["Title"];
                section["uuid"] = i["id"].toString();

                if (typeof section["avg"] === "number" && typeof section["pass"] === "number"
                    && typeof section["fail"] === "number" && typeof section["audit"] === "number"
                    && typeof section["year"] === "number" && typeof section["dept"] === "string"
                    && typeof section["id"] === "string" && typeof section["instructor"] === "string"
                    && typeof section["title"] === "string" && typeof section["uuid"] === "string") {
                    sections.push(section);
                }
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
                    return reject(new NotFoundError("Dataset not found."));
                } else {
                    for (let index = 0; index < this.memory.length; index++) {
                        if (this.memory[index] === id) {
                            result = this.memory[index];
                            this.memory.splice(index, 1);
                            this.datasets.splice(index, 1);
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
                let doQuery = new DoQuery(query, this.addedDatasetContent);
                let fs = require("fs");
                let directory = "./data";
                // let diskData = fs.readFileSync(directory + )
                if (validQuery.validateQuery(query)) {
                    if ((this.memory.length > 0)) {
                        let resultArray = doQuery.doInitialQuery(query, this.addedDatasetContent);
                        if (resultArray.length > 5000) {
                            throw new ResultTooLargeError("Result too large.");
                        }
                        return resolve(resultArray);
                    }
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
