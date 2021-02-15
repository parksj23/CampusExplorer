import {
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";

export interface ITree {
    key: string;
    value: any[];
    node: any[];
}

export default class Query {
    public queryObj: any;
    public datasetID: string;
    public skeys: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mkeys: string[] = ["avg", "pass", "fail", "audit", "year"];
    public ast: ITree;

    constructor(query: any) {
        this.queryObj = query;
        let options = this.queryObj["OPTIONS"];
    }

    public buildAST(body: any): ITree {
        if (Object.keys(body).length === 0) {
            return this.ast;
        } else {
            let keys = Object.keys(body);
            for (let key of keys) {
                return null;
            }
        }
    }
    public validateBody(body: any): boolean {
        if (body === null || typeof body !== "object") {
            return false;
        }
        // Object.keys() returns an array of a given object's own enumerable property names,
        // iterated in the same order that a normal loop would
        let keys: string[] = Object.keys(body);
        if (keys.length === 0 || keys.length > 2) {
            return false;
        }
        return this.validateFilter(body);
    }

    private validateFilter(body: any): boolean {
        if (body === null || typeof body !== "object") {
            return false;
        }
        let where = (Object.getOwnPropertyDescriptor(body, "WHERE")).value;
        let filter = (Object.getOwnPropertyNames(where));
        if (filter.length > 1) {
            return false;
        }
        let operator: string = filter[0];
        switch (operator) {
            case "AND":
                break;
            case "OR":
                break;
            case "NOT":
                break;
            case "IS":
                // return this.validSCOMP(filter[operator]);
                break;
            case "EQ":
                break;
            case "GT":
                break;
            case "LT":
                break;
            default:
                return null;
                break;
        }
    }

    private validSCOMP(filter: any) {
        let key = Object.keys(filter);

    }
}

