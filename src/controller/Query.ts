import {
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {split} from "ts-node";
import {types} from "util";

export default class Query {
    public queryObj: any;
    public datasetID: string;
    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mfields: string[] = ["avg", "pass", "fail", "audit", "year"];

    constructor(query: any) {
        this.queryObj = query;
        let options = this.queryObj["OPTIONS"];
    }

    public validateQuery(query: any): boolean {
        if (query === null || query === undefined || typeof query !== "object") {
            return false;
        }
        let queryObj = JSON.parse(JSON.stringify(query));
        let keys: string[] = Object.keys(query);
        if (keys.length === 0 || keys.length > 2) {
            return false;
        } else if (keys.includes("WHERE")) {
            return this.validateBody(query);
        } else if (keys.includes("OPTIONS")) {
            return this.validateBody(query);
        }
    }

    public validateBody(body: any): boolean {
        if (body === null || typeof body !== "object") {
            return false;
        }
        if (body["WHERE"] === undefined) {
            return this.validateOptions(body["OPTIONS"]);
        } else {
            if (this.validateOptions(body["OPTIONS"]) === true) {
                return this.validateFilter(body["WHERE"]);
            } else {
                return this.validateFilter(body["WHERE"]);
            }
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
            let firstChar: string = compValue.charAt(0);
            let lastChar: string = compValue.charAt(compValue.length - 1);
            let wildcardCount = (compValue.match(/[^*]/g));
            if (wildcardCount.length === 1 && compValue.length === 1) {
                return true;
            } else if (wildcardCount.length === 1) {
                if (firstChar === "*") {
                    let wildcardEndsWithInput: string = compValue.substring(1);
                } else if (lastChar === "*") {
                    let wildcardStartsWithInput: string = compValue.substring(1);
                }
            } else if (wildcardCount.length === 2) {
                if (compValue.length === 2) {
                    return true;
                } else if ((firstChar === "*") && (lastChar === "*")) {
                    let wildcardContainsInput: string = compValue.substring(1, compValue.length - 1);
                    // TODO: How to make this return the matching sections?
                }
            }
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

    private validateOptions(options: any) {
        let columns = options["COLUMNS"];
        let order = options["ORDER"];
        if (typeof options !== "object") {
            return false;
        } else if (columns === undefined) {
            return false;
        } else if (order === undefined) {
            return false;
        }
        if (typeof order !== "string") {
            return false;
        }
        return this.validateColumns(columns);
    }

    private validateColumns(columns: string[]) {
        for (let str of columns) {
            if (typeof str !== "string") {
                return false;
            } else {
                // TODO: What else do I need to do to validate columns?
                return true;
            }
        }
    }
}

