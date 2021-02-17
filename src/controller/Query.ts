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
    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mfields: string[] = ["avg", "pass", "fail", "audit", "year"];
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

    public validateQuery(query: any): boolean {
        if (query === null || query === undefined || typeof query !== "object") {
            return false;
        }
        // Object.keys() returns an array of a given object's own enumerable property names,
        // iterated in the same order that a normal loop would
        let keys: string[] = Object.keys(query);
        if (keys.length === 0 || keys.length > 2) {
            return false;
        }
        return this.validateBody(query);
    }

    public validateBody(body: any): boolean {
        if (body === null || typeof body !== "object") {
            return false;
        }
        if (body["WHERE"] === undefined) {
            return this.validateOptions(body["OPTIONS"]);
        } else {
            return this.validateFilter(body["WHERE"]);
        }
    }

    private validateFilter(filter: any): boolean {
        if (filter === null || typeof filter !== "object") {
            return false;
        }
        // let where = (Object.getOwnPropertyDescriptor(filter, "WHERE")).value;
        // let filter = (Object.getOwnPropertyNames(where));
        // if (filter.length > 1) {
        //     return false;
        // }
        // let operator: string = filter[0];
        // if (filter.length !== 0 || filter.length !== 1) {
        //     return false;
        // }
        let operator = Object.keys(filter)[0];
        let next = filter[operator];
        switch (operator) {
            case "AND":
                return this.validateLogic(next, operator);
                break;
            case "OR":
                return this.validateLogic(next, operator);
                break;
            case "NOT":
                return this.validateNegation(next, operator);
                break;
            case "IS":
                return this.validateSCOMP(next, operator);
                break;
            case "EQ":
                return this.validateMCOMP(next, operator);
                break;
            case "GT":
                return this.validateMCOMP(next, operator);
                break;
            case "LT":
                return this.validateMCOMP(next, operator);
                break;
            default:
                return true;
                break;
        }
    }

    private validateSCOMP(next: any, operator: string): boolean {
        // this.filterAndKeys(operator);
        return false;
    }

    private validateMCOMP(next: any, operator: string): boolean {
        return false;
    }

    private validateNegation(next: any, operator: string): boolean {
        return !this.validateFilter(next);
    }

    private validateLogic(next: any, operator: string) {
        if (operator === "AND") {
            for (let filter of next) {
                if (this.validateFilter(filter) === false) {
                    return false;
                }
            }
            return true;
        } else if (operator === "OR") {
            for (let filter of next) {
                if (this.validateFilter(filter) === true) {
                    return true;
                }
                return false;
            }
        }
    }

    private validateKey(key: string): boolean {
        let splitKey = key.split("_");
        if (splitKey.length !== 2) {
            return false;
        }
        let datasetId = splitKey[0];
        let smField = splitKey[1];
        // if smField is part of sfields or mfields...
    }

    private filterAndKeys(operator: string): boolean {
        return null;
    }

    private validateOptions(bodyElement: any) {
        return false;
    }
}

