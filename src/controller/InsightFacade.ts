import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
} from "./IInsightFacade";
// import {InsightError, NotFoundError} from "./IInsightFacade";
// import * as JSZip from "jszip";

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
        return Promise.reject("Not implemented.");
        // TODO: This is the code I was writing but it was having issues
        //  so I'm commenting it out so at least you can see it
        // return new Promise<string[]>((resolve, reject) => {
        //     var zip = new JSZip();
        //
        //     zip.loadAsync(content, {base64: true}).then(function (zipper) {
        //         Object.keys(zip.files).forEach(function (fileName) {
        //             zipper.files[fileName].async("string").then((file: string) => {
        //                 let data = JSON.parse(file);
        //                 let courses = new Array<Object>();
        //
        //                 if (id === null || id === undefined) {
        //                     return reject(new InsightError());
        //                 } else if (data.result.length > 0) {
        //                     data.result.forEach(function() {
        //                         // let course = new Course();
        //                         // TODO: create Course class with getters, set fields
        //                     });
        //                 }
        //                 }
        //             }
        //         }
        //     }
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
