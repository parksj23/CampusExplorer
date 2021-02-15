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

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */

let datasetArray: Dataset[] = [];

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
             let dataset = new Dataset(id);
             return zip.loadAsync(content, {base64: true}).then((root) => {
                 const courses: JSZip = root.folder("courses");
                 courses.forEach((relativePath, course) => {
                     // cCount works until here
                     course.async("string").then((parsedCourse) => {
                         const sections = JSON.parse(parsedCourse);
                         let coursesArray: Course[] = [];
                         let cCount: number = 0;
                         sections.result.forEach((section: any) => {
                             coursesArray[cCount] = new Course(section.Avg, section.Pass,
                                 section.Fail, section.Audit,
                                 section.Year, section.Subject,
                                 section.Section, section.Professor,
                                 section.Title, section.id);
                             cCount++;
                         });
                         // for some reason it only works until here...
                         const test1: number = 1;
                         dataset.setCoursesArray(coursesArray);
                         // this.updateDatasetArray();
                     });
                     // const test2: number = 1;
                 });
                 // const test3: number = 1;
                 resolve(["courses"]);
             });
        });
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
