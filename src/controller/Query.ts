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
        let operatorString = (Object.getOwnPropertyNames(filter));
        // TODO: push all filters in filter onto a list or array so we can go through them recursively later
        // let listFilters: any[];
        // while (typeof filter === "object") {
        //     for (let i of filter) {
        //         listFilters.push(i);
        //     }
        // }
        let operator = operatorString[0];
        switch (operator) {
            case "AND":
                return this.validateLogic(operator);
                break;
            case "OR":
                return this.validateLogic(operator);
                break;
            case "NOT":
                return this.validateNegation(operator);
                break;
            case "IS":
                return this.validateSCOMP(operator);
                break;
            case "EQ":
                return this.validateMCOMP(operator);
                break;
            case "GT":
                return this.validateMCOMP(operator);
                break;
            case "LT":
                return this.validateMCOMP(operator);
                break;
            default:
                return null;
                break;
        }
    }

    private validateSCOMP(operator: string) {
        this.filterAndKeys(operator);
        return false;

    }

    private validateNegation(operator: string) {
        return false;
    }

    private validateLogic(operator: string) {
        return false;
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

    private validateMCOMP(operator: string) {
        return false;
    }
}

