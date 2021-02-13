import {
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";

export default class Query {
    private queryObj: any;

    constructor(query: any) {
        this.queryObj = query;
        let options = this.queryObj["OPTIONS"];
    }

    public validWhere(body: any): boolean {
        if (body === null || typeof body !== "object") {
            return false;
        }
        // Object.keys() returns an array of a given object's own enumerable property names,
        // iterated in the same order that a normal loop would
        let keys: string[] = Object.keys(body);
        if (keys.length === 0 || keys.length === 1) {
            return true;
        }
        if (keys.length > 1) {
            return false;
        }
        return this.validFilter(body);
    }

    private validFilter(filter: any): boolean {
        if (filter === null || typeof filter !== "object") {
            return false;
        }
        let keys: string[] = Object.keys(filter);
        if (keys === null || keys === undefined || keys.length !== 1) {
            return false;
        }
        for (let key of keys) {
            if (key === "IS") {
                return null;
                // return this.validSCOMP(filter[key]);
            }
            if (key === "EQ") {
                return null;
            }
            if (key === "GT") {
                return null;
            }
            if (key === "LT") {
                return null;
            }
        }
    }
}
