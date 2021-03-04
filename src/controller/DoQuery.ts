import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";

export default class DoQuery {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";

    public queryObj: any;
    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mfields: string[] = ["avg", "pass", "fail", "audit", "year"];
    public data: any[];
    public id: string;

    constructor(query: any, data: any[]) {
        this.queryObj = query;
        this.data = data;
    }

    public doInitialQuery(query: any): any[] {
        let sectionsWithRelevantColumns = this.doOptions(query[DoQuery.OPTIONS]);
        return this.doQuery(query[DoQuery.WHERE], sectionsWithRelevantColumns);
    }

    private doOptions(query: any): any[] {
        let columns = query[DoQuery.COLUMNS];
        let sectionsWithRelevantColumns: any[] = [];
        for (let section of this.data) {
            let columnedSection: any = {};
            for (let key of columns) {
                let splitKey = key.split("_");
                let smfield = splitKey[1];
                columnedSection[key] = section[smfield];
            }
            sectionsWithRelevantColumns.push(columnedSection);
        }
        return sectionsWithRelevantColumns;
    }

    public doQuery(filter: any, relevantColumns: any[]): any[] {
        let result: any[] = [];
        let operatorString = (Object.getOwnPropertyNames(filter));
        let operator = operatorString[0];
        let next = filter[operator];
        switch (operator) {
            case "AND":
                return this.doLogic(next, operator, relevantColumns);
                break;
            case "OR":
                return this.doLogic(next, operator, relevantColumns);
                break;
            case "NOT":
                return this.doNegation(next, operator, relevantColumns);
                break;
            case "IS":
                return this.doSCOMP(next, operator, relevantColumns);
                break;
            case "EQ":
                return this.doMCOMP(next, operator, relevantColumns);
                break;
            case "GT":
                return this.doMCOMP(next, operator, relevantColumns);
                break;
            case "LT":
                return this.doMCOMP(next, operator, relevantColumns);
                break;
        }
        return result;
    }

    private doMCOMP(next: any, operator: string, relevantColumns: any[]): any[] {
        let result: any[] = [];
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let mfield = splitKey[1];
        // let queryingDataset = data.find((d) => d.id === id);
        // let datasetContent = queryingDataset.coursesArray;
        switch (operator) {
            case "EQ":
                for (let section of relevantColumns) {
                    if (section[key] === compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "GT":
                for (let section of relevantColumns) {
                    if (section[key] > compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "LT":
                for (let section of relevantColumns) {
                    if (section[key] < compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
        }
        return result;
    }

    private doSCOMP(next: any, operator: string, relevantColumns: any[]): any[] {
        let result: any[] = [];
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let sfield = splitKey[1];
        for (let section of relevantColumns) {
            if (compValue.includes("*")) {
                result = this.doWildcard(section, compValue, key, result);
            } else if (!compValue.includes("*")) {
                if (section[key] === compValue) {
                    result.push(section);
                }
            }
        }
        return result;
    }

    private doWildcard(section: any, compValue: string, key: string, result: any[]): any[] {
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
                if (section[key].endsWith(wildcardEndsWithInput)) {
                    result.push(section);
                    return result;
                }
                return result;
            } else if (lastChar === "*") {
                let wildcardStartsWithInput: string = compValue.substring(0, compValue.length - 1);
                if (section[key].startsWith(wildcardStartsWithInput)) {
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
            if (section[key].includes(wildcardContainsInput)) {
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

    private doNegation(next: any, operator: string, relevantColumns: any[]): any[] {
        return this.doQuery(next, relevantColumns);
    }

    private doLogic(next: any, operator: string, relevantColumns: any[]): any[] {
        switch (operator) {
            case "AND":
                // TODO: make sure that both conditions are met
                for (let filter of next) {
                    return this.doQuery(filter, relevantColumns);
                }
                break;
            case "OR":
                for (let filter of next) {
                    return this.doQuery(filter, relevantColumns);
                }
                break;
        }
    }
}
