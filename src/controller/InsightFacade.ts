import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError, ResultTooLargeError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import {fail} from "assert";
import {
    Course,
} from "./Course";
import Query from "./Query";

import {
    Dataset,
} from "./Dataset";

let datasetArray: Dataset[] = [];
let arrayOfPromises: any[] = [];

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {

    // let datasetArray: Dataset[] = [];
    // let arrayOfPromises: any[] = [];

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
            let dataset = new Dataset(id);
            let cCount: number = 0;
            return zip.loadAsync(content, {base64: true}).then((root) => {
                const courses: JSZip = root.folder("courses");
                courses.forEach((relativePath, course) => {
                    course.async("string").then(async (parsedCourse) => {
                        const sections = JSON.parse(parsedCourse);
                        for (const section of sections.result) {
                            arrayOfPromises[cCount] = this.getCourseSection(section);
                            cCount++;
                            // eslint-disable-next-line no-console
                            console.log(cCount);
                            // promises not resolved
                            const test = 1;
                        }
                        return arrayOfPromises;
                    }).then(() => {
                        return Promise.all(arrayOfPromises);
                    });
                });
                // runs until 64612
                const test11 = 2;
            });
            // runs until 64612
            const test2 = 2;
            resolve(["courses"]);
        });
    }

    private getCourseSection(section: any): Promise<Course> {
        const num = 1;
        return Promise.resolve(new Course(section.Avg, section.Pass,
                section.Fail, section.Audit,
                section.Year, section.Subject,
                section.Section, section.Professor,
                section.Title, section.id));
    }

    /*private updateDatasetArray() {
    }*/


    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let validateQuery = new Query(query);
                let a = typeof validateQuery;
                validateQuery.validWhere(query);
                let queryObj = JSON.parse(JSON.stringify(query));
                let options = (Object.getOwnPropertyDescriptor(queryObj, "OPTIONS")).value;
                let where = (Object.getOwnPropertyDescriptor(queryObj, "WHERE")).value;
                if (typeof options === "undefined") {
                    throw new InsightError("Invalid query. Missing OPTIONS block.");
                }
                if (typeof where === "undefined") {
                    throw new InsightError("Invalid query. Missing WHERE block.");
                }
                if (queryObj.result.length > 5000) {
                    throw new ResultTooLargeError("Result too large.");
                }
                resolve(["hello"]);

            } catch (e) {
                reject(e);
            }
        });
    }


    public listDatasets():
        Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}


