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
    private testDataset: Course[];
    // private course1 = new Course(60, 50, 10, 2, 2019, "chem", "221", "smith",
    //     "intro to chem", "40521");
    // private course2 = new Course(70, 75, 8, 0, 2010, "engl", "121", "lee, tara",
    //     "english", "12354");
    // private course3 = new Course(40, 10, 22, 1, 2014, "chbe", "433", "smith",
    //     "engineering", "85742");
    // private course4 = new Course(88, 98, 15, 7, 2010, "engl", "330", "rochester, tina",
    //     "english", "85100");

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
        // this.testDataset.push(this.course1);
        // this.testDataset.push(this.course2);
        // this.testDataset.push(this.course3);
        // this.testDataset.push(this.course4);
    }
    public addDataset(
        id: string,
        content: string,
        kind: InsightDatasetKind,
    ): Promise<string[]> {
        return Promise.reject("reject"); // Making addDataset a stub to test performQuery
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
                // TODO: Figure out how you will push sections onto resultsArray
                let resultArray = [];
                let validateQuery = new Query(query);
                // let a = typeof validateQuery;
                // I had a break at validateQuery.validateQuery
                validateQuery.validateQuery(query);
                // // validateQuery.buildAST(query);
                let queryObj = JSON.parse(JSON.stringify(query));
                let where = (Object.getOwnPropertyDescriptor(queryObj, "WHERE")).value;
                let options = (Object.getOwnPropertyDescriptor(queryObj, "OPTIONS")).value;
                let columns = (Object.getOwnPropertyDescriptor(options, "COLUMNS")).value;
                let order = (Object.getOwnPropertyDescriptor(options, "ORDER")).value;
                let filter = (Object.getOwnPropertyNames(where));
                if (typeof options === "undefined") {
                    throw new InsightError("Invalid query. Missing OPTIONS block.");
                }
                if (typeof where === "undefined") {
                    throw new InsightError("Invalid query. Missing WHERE block.");
                }
                let results: any = validateQuery.validateQuery(query);
                resolve([results]);
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
