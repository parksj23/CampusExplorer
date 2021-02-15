import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import {fail} from "assert";

import {
    Course,
} from "./Course";

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
