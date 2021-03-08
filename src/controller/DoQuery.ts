import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Column from "./Column";
import Order from "./Order";

export default class DoQuery {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";

    public queryObj: any;
    public data: any[];
    public id: string;

    constructor(query: any, data: any[]) {
        this.queryObj = query;
        this.data = data;
    }

    public doInitialQuery(query: any): any[] {
        let queriedSections = this.doQuery(query[DoQuery.WHERE], this.data);

        let column = new Column(query[DoQuery.OPTIONS], queriedSections);
        let columnedSections = column.doColumns(query[DoQuery.OPTIONS], queriedSections);

        let order = new Order(query[DoQuery.OPTIONS], columnedSections);
        let orderedSections = order.doOrder(query[DoQuery.OPTIONS], columnedSections);

        return orderedSections;
    }

    public doQuery(filter: any, sections: any[]): any[] {
        let result: any[] = [];
        let operatorString = (Object.getOwnPropertyNames(filter));
        let operator = operatorString[0];
        let next = filter[operator];
        switch (operator) {
            case "AND":
            case "OR":
                return this.doLogic(next, operator, sections);
                break;
            case "NOT":
                return this.doNegation(next, operator, sections);
                break;
            case "IS":
                return this.doSCOMP(next, operator, sections);
                break;
            case "EQ":
            case "GT":
            case "LT":
                return this.doMCOMP(next, operator, sections);
                break;
        }
        return result;
    }

    private doMCOMP(next: any, operator: string, sections: any[]): any[] {
        let result: any[] = [];
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let smfield = splitKey[1];
        switch (operator) {
            case "EQ":
                for (let section of sections) {
                    if (section[smfield] === compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "GT":
                for (let section of sections) {
                    if (section[smfield] > compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "LT":
                for (let section of sections) {
                    if (section[smfield] < compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
        }
        return result;
    }

    private doSCOMP(next: any, operator: string, sections: any[]): any[] {
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

    private doNegation(next: any, operator: string, sections: any[]): any[] {
        let notResult: any[] = [];
        let notTemp: any[] = [];
        notTemp.push(this.doQuery(next, sections));
        notResult.push(notTemp);
        let notArr = notResult[0];
        // Filter goes through the array and if the callback function is true, then it adds the element to a new array
        let not = sections.filter((section: any) => !notArr[0].includes(section));
        return not;
    }

    private doLogic(next: any, operator: string, sections: any[]): any[] {
        switch (operator) {
            case "AND":
                let andResult: any[] = [];
                for (let filter of next) {
                    let andTemp: any[] = [];
                    andTemp.push(this.doQuery(filter, sections));
                    andResult.push(andTemp);
                }
                let flattenedAndResult = this.flattenANDResult(andResult);
                andResult = flattenedAndResult;
                let intersection: any[] = [];
                let intersectionHelper = this.intersectionHelper(andResult);
                intersection = intersectionHelper;
                return intersection;
                break;
            case "OR":
                let orResult: any[] = [];
                for (let filter of next) {
                    let orTemp: any[] = [];
                    orTemp.push(this.doQuery(filter, sections));
                    orResult.push(orTemp);
                }
                let union: any[] = [];
                if (orResult.length === 2) {
                    for (let i = 0; i < orResult.length - 1; i++) {
                        union = orResult[i].concat(orResult[i + 1]);
                    }
                    // https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
                    let flat = union.reduce((acc, val) => acc.concat(val), []);
                    union = flat;
                } else if (orResult.length > 2) {
                    union = orResult;
                    let flat = union.reduce((acc, val) => acc.concat(val), []);
                    let flatAgain = flat.reduce((acc: any, val: any) => acc.concat(val), []);
                    union = flatAgain;
                }
                return union;
                break;
        }
    }

    private flattenANDResult(andResult: any[]): any[] {
        let flattenedAndResult: any[] = [];
        for (let result of andResult) {
            let flatten = result.reduce((acc: any, val: any) => acc.concat(val), []);
            flattenedAndResult.push(flatten);
        }
        return flattenedAndResult;
    }

    private intersectionHelper(andResult: any[]): any[] {
        let intersection: any[] = [];
        if (andResult.length === 2) { // if there are 2 AND keys
            for (let section of andResult[0]) {
                for (let section2 of andResult[1]) {
                    if (section === section2) {
                        intersection.push(section);
                    }
                }
            }
        } else if (andResult.length > 2) { // TODO: if there are more than 2 AND keys...this should be recursive
            let temp: any[] = [];
            for (let section of andResult[0]) {
                for (let section2 of andResult[1]) {
                    if (section === section2) {
                        temp.push(section); // temp = AND of first two arrays
                    }
                }
            }
            for (let section of temp) {
                for (let section2 of andResult[2]) {
                    if (section === section2) {
                        intersection.push(section);
                    }
                }
            }
        }
        return intersection;
    }
}

// TODO: are we not supposed to save anything to the data directory
// TODO: read c2 specs
// TODO: refactor Dataset helper functions
