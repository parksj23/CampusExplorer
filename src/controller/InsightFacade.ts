import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
} from "./IInsightFacade";
import {
    Course,
} from "./Course";

import * as JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(
        id: string,
        content: string,
        kind: InsightDatasetKind,
    ): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let zip = new JSZip();
            return zip.loadAsync(content, {base64: true}).then((root) => {
                const courses: JSZip = root.folder("courses");
                courses.forEach((relativePath, course) => {
                    course.async("string").then((parsedCourse) => {
                        // const hi = 1;
                        let c = new Course();
                        const sections = JSON.parse(parsedCourse);
                        if (sections.result.length > 0) {
                            let test = typeof sections;
                            let test2 = typeof sections.result;
                            const keys = sections.result.keys();
                            sections.result.forEach(() => {
                                for (const key of keys) {
                                    let test3 = key;
                                    const a = 1;
                                }
                            });
                            let relevantKeySectionsArray: string;
                            // sections.result.forEach(() => {
                            //     sections.result.keys();
                            //     });
                            // for (const field in sections.result) {
                            //     if (sections.result.hasOwnProperty(field)) {
                            //         const sectionObj = {};
                            //         sectionObj[field] = sections.result[field];
                            //         relevantKeySectionsArray.push(sectionObj);
                            //     }
                            // }
                        }
                    });
                });
                resolve(["hello"]);
            });
        });
    }

    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    // public performQuery(query: any): Promise<any[]> {
    //     return Promise.reject("Not implemented.");
    // }
    public performQuery(query: any): Promise<any[]> {
        // return new Promise(function (resolve, reject) {
        // Ensures that the query is a JSON string, and then constructs the Javascript object described by the string
        //     let QueryObj = JSON.parse(JSON.stringify(query));
        //     let options = (Object.getOwnPropertyDescriptor(QueryObj, "OPTIONS")).value;
        //     let where = (Object.getOwnPropertyDescriptor(QueryObj, "WHERE")).value;
        //     if (typeof options == "undefined") {
        //         throw "Invalid query. Missing OPTIONS block."
        //     }
        //     if (typeof where == "undefined") {
        //         throw "Invalid query. Missing WHERE block."
        //     }
        //
        // }
        return Promise.reject("Not implemented.");
    }

    public listDatasets():
        Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
