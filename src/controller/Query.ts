import {
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {split} from "ts-node";

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
        let operatorString = (Object.getOwnPropertyNames(filter));
        let operator = operatorString[0];
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
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let sfield = splitKey[1];
        if (typeof key !== "string") {
            return false;
        } else if (!key.includes("_")) {
            return false;
        } else if (splitKey.length !== 2) {
            return false;
        } else if (typeof compValue !== "string") {
            return false;
        } else if (!this.sfields.includes(sfield)) {
            return false;
        }
        if (compValue.includes("*")) {
            let zerothChar: string = compValue.charAt(0);
            let endChar: string = compValue.charAt(compValue.length - 1);
            return false;
        }

        return true;
    }

    private validateMCOMP(next: any, operator: string): boolean {
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let mfield = splitKey[1];
        if (typeof key !== "string") {
            return false;
        } else if (!key.includes("_")) {
            return false;
        } else if (splitKey.length !== 2) {
            return false;
        } else if (typeof compValue !== "number") {
            return false;
        } else if (!this.mfields.includes(mfield)) {
            return false;
        }
        switch (operator) {
            // TODO: implement once addDataset is done
            case "EQ":
                return true;
                break;
            case "GT":
                return true;
                break;
            case "LT":
                return true;
                break;
        }
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

    private filterAndKeys(operator: string): boolean {
        return null;
    }

    private validateOptions(options: any) {
        if ("ORDER" in options) {
            const order = options["ORDER"];
            if (typeof order !== "object") {
                return false;
            }
        }
        return false;
    }
}

