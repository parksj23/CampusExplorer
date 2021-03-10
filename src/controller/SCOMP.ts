import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Log from "../Util";
import ValidateQuery from "./ValidateQuery";

export default class SCOMP {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";
    private static SORT: string = "SORT";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";
    private static GROUP: string = "GROUP";
    private static APPLY: string = "APPLY";

    public queryObj: any;
    public data: any[];
    public id: string;

    constructor(query: any) {
        Log.trace("InsightFacadeImpl::init()");
        this.queryObj = query;
    }

    public validateSCOMP(next: any, operator: string): boolean {
        let validateQuery = new ValidateQuery(this.queryObj);

        if (Object.keys(next).length === 0) {
            return false;
        }
        let keyString = (Object.getOwnPropertyNames(next));
        if (keyString.length !== 1) {
            return false;
        }
        let key = keyString[0];
        if ((typeof key !== "string") || (key === undefined) || (key === null)) {
            return false;
        } else if (!key.includes("_")) {
            return false;
        }
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let sfield = splitKey[1];
        if (splitKey.length !== 2) {
            return false;
        } else if ((typeof compValue !== "string") || (compValue === undefined) || (compValue === null)) {
            return false;
        } else if (!validateQuery.sfields.includes(sfield)) {
            return false;
        } else if (compValue.includes("*")) {
            return this.validateWildcard(compValue);
        }
        if (!validateQuery.performQueryDatasetIds.includes(id)) {
            validateQuery.performQueryDatasetIds.push(id);
        }
        return true;
    }

    private validateWildcard(compValue: string): boolean {
        let firstChar: string = compValue.charAt(0);
        let lastChar: string = compValue.charAt(compValue.length - 1);
        let wildcardCount = compValue.match(/[*]/g);
        if (wildcardCount === null) {
            return false;
        }
        if (wildcardCount.length === 1 && compValue.length === 1) {
            return true;
        }
        if (wildcardCount.length === 1) {
            if (firstChar === "*") {
                return true;
            } else if (lastChar === "*") {
                return true;
            }
        }
        if ((wildcardCount.length === 2) && (compValue.length === 2)) {
            return true;
        }
        if ((wildcardCount.length === 2) && (firstChar === "*") && (lastChar === "*")) {
            return true;
        }
        if (wildcardCount.length > 2) {
            return false;
        }
        if ((compValue.substr(1, compValue.length - 2)).includes("*")) {
            return false;
        }
    }

    public doSCOMP(next: any, operator: string, sections: any[]): any[] {
        let result: any[] = [];
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let smfield = splitKey[1];
        for (let section of sections) {
            if (compValue.includes("*")) {
                result = this.doWildcard(section, compValue, smfield, result);
            } else if (!compValue.includes("*")) {
                if (section[smfield] === compValue) {
                    result.push(section);
                }
            }
        }
        return result;
    }

    private doWildcard(section: any, compValue: string, smfield: string, result: any[]): any[] {
        let firstChar: string = compValue.charAt(0);
        let lastChar: string = compValue.charAt(compValue.length - 1);
        let wildcardCount = compValue.match(/[*]/g);
        if (wildcardCount === null) {
            return result;
        }
        if (wildcardCount.length === 1 && compValue.length === 1) {
            result.push(section);
            return result;
        }
        if (wildcardCount.length === 1) {
            if (firstChar === "*") {
                let wildcardEndsWithInput: string = compValue.substring(1);
                if (section[smfield].endsWith(wildcardEndsWithInput)) {
                    result.push(section);
                    return result;
                }
                return result;
            } else if (lastChar === "*") {
                let wildcardStartsWithInput: string = compValue.substring(0, compValue.length - 1);
                if (section[smfield].startsWith(wildcardStartsWithInput)) {
                    result.push(section);
                    return result;
                }
                return result;
            }
        }
        if ((wildcardCount.length === 2) && (compValue.length === 2)) {
            result.push(section);
            return result;
        }
        if ((wildcardCount.length === 2) && (firstChar === "*") && (lastChar === "*")) {
            let wildcardContainsInput: string = compValue.substring(1, compValue.length - 1);
            if (section[smfield].includes(wildcardContainsInput)) {
                result.push(section);
                return result;
            }
            return result;
        }
        if (wildcardCount.length > 2) {
            return result;
        }
        if ((compValue.substr(1, compValue.length - 2)).includes("*")) {
            return result;
        }
        return result;
    }
}
