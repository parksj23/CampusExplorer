import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";

export default class DoQuery {
    public queryObj: any;
    public datasetID: string;
    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mfields: string[] = ["avg", "pass", "fail", "audit", "year"];
    public data: any;

    constructor(query: any) {
        this.queryObj = query;
    }

    public doInitialQuery(query: any): Course[] {
        return this.doQuery(query["WHERE"]);
    }

    public doQuery(filter: any): Course[] {
        let result: Course[] = [];
        let operatorString = (Object.getOwnPropertyNames(filter));
        let operator = operatorString[0];
        let next = filter[operator];
        switch (operator) {
            case "AND":
                return this.doLogic(next, operator, this.data);
                break;
            case "OR":
                return this.doLogic(next, operator, this.data);
                break;
            case "NOT":
                return this.doNegation(next, operator, this.data);
                break;
            case "IS":
                return this.doSCOMP(next, operator, this.data);
                break;
            case "EQ":
                return this.doMCOMP(next, operator, this.data);
                break;
            case "GT":
                return this.doMCOMP(next, operator, this.data);
                break;
            case "LT":
                return this.doMCOMP(next, operator, this.data);
                break;
        }
        return result;
    }

    private doMCOMP(next: string, operator: string, data: any[]): any[] {
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let mfield = splitKey[1];
        switch (operator) {
            case "EQ":
                return [];
                break;
            case "GT":
                return [];
                break;
            case "LT":
                return [];
                break;
        }
        return [];
    }

    private doSCOMP(next: string, operator: string, data: any[]): any[] {
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let sfield = splitKey[1];
        if (compValue.includes("*")) {
            let firstChar: string = compValue.charAt(0);
            let lastChar: string = compValue.charAt(compValue.length - 1);
            let wildcardCount = (compValue.match(/[^*]/g));
            if (wildcardCount.length === 1 && compValue.length === 1) {
                return [];
            }
            if (wildcardCount.length === 1) {
                if (firstChar === "*") {
                    let wildcardEndsWithInput: string = compValue.substring(1);
                    return [];
                } else if (lastChar === "*") {
                    let wildcardStartsWithInput: string = compValue.substring(1);
                    return [];
                }
            }
            if (wildcardCount.length === 2) {
                if (compValue.length === 2) {
                    return [];
                } else if ((firstChar === "*") && (lastChar === "*")) {
                    let wildcardContainsInput: string = compValue.substring(1, compValue.length - 1);
                    return [];
                }
            }
        } else if (!compValue.includes("*")) {
            return [];
        }
    }

    private doNegation(next: string, operator: string, data: any[]): any[] {
        return this.doQuery(next);
    }

    private doLogic(next: string, operator: string, data: any[]): any[] {
        return [];
    }
}
