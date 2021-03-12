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

    public queryObj: any;
    public data: any[];
    public id: string;

    constructor(query: any) {
        Log.trace("InsightFacadeImpl::init()");
        this.queryObj = query;
    }

    public validateSCOMP(next: any, operator: string, performQueryDatasetIds: string[]): boolean {
        let validateQuery = new ValidateQuery(this.queryObj);
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];

        if (Object.keys(next).length === 0) {
            return false;
        }

        if (keyString.length !== 1) {
            return false;
        }

        if ((typeof key !== "string") || (key === undefined) || (key === null)) {
            return false;
        }

        if (!key.includes("_")) {
            return false;
        }

        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let sfield = splitKey[1];
        if (splitKey.length !== 2) {
            return false;
        }

        if ((typeof compValue !== "string") || (compValue === undefined) || (compValue === null)) {
            return false;
        }

        if (!validateQuery.sfields.includes(sfield)) {
            return false;
        }

        if (compValue.includes("*")) {
            return this.validateWildcard(compValue);
        }

        if (!performQueryDatasetIds.includes(id)) {
            performQueryDatasetIds.push(id);
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

        if (wildcardCount.length === 1 && compValue.length === 1) { // * is valid
            return true;
        }

        if (wildcardCount.length === 1) {
            if (firstChar === "*" || lastChar === "*") { // *input or input* is valid
                return true;
            }
        }

        if ((wildcardCount.length === 2) && (compValue.length === 2)) { // ** is valid
            return true;
        }

        if ((wildcardCount.length === 2) && (firstChar === "*") && (lastChar === "*")) { // *input*
            return true;
        }

        if (wildcardCount.length > 2) { // *** is invalid
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
