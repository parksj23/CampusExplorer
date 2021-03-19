import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Column from "./Column";
import Order from "./Order";
import Group from "./Group";
import Apply from "./Apply";
import SCOMP from "./SCOMP";

export default class DoQuery {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";

    public queryObj: any;
    public data: any[];
    public id: string;

    constructor(query: any, data: any[]) {
        this.queryObj = query;
        this.data = data;
    }

    public doInitialQuery(query: any): any[] {
        let columnedSections: any[] = [];
        let orderedSections: any[] = [];
        let queryKeys = Object.getOwnPropertyNames(query);

        let queriedSections = this.doQuery(query[DoQuery.WHERE], this.data);

        if (!queryKeys.includes(DoQuery.TRANSFORMATIONS)) { // For C1
            let column = new Column(query[DoQuery.OPTIONS], queriedSections);
            columnedSections = column.doC1Columns(query[DoQuery.OPTIONS], queriedSections);

            let order = new Order(query[DoQuery.OPTIONS], columnedSections);
            orderedSections = order.doOrder(query[DoQuery.OPTIONS], columnedSections);

            return orderedSections;
        }

        // if (queryKeys.includes(DoQuery.TRANSFORMATIONS)) {
        //     let group = new Group(query[DoQuery.TRANSFORMATIONS], queriedSections);
        //     let groupedSections = group.doGroup(query[DoQuery.TRANSFORMATIONS], queriedSections);
        //
        //     if (groupedSections.length > 5000) {
        //         throw new ResultTooLargeError("Result is >5000 hits.");
        //     }
        //
        //     let apply = new Apply(query[DoQuery.TRANSFORMATIONS], groupedSections);
        //     let applySections = apply.doApply(query[DoQuery.TRANSFORMATIONS], groupedSections);
        //
        //     let column = new Column(query[DoQuery.OPTIONS], applySections);
        //     columnedSections = column.c2ColumnsLauncher(query, applySections);
        //
        //     let order = new Order(query[DoQuery.OPTIONS], columnedSections);
        //     orderedSections = order.doOrder(query[DoQuery.OPTIONS], columnedSections);
        //
        //     return orderedSections;
        // }
    }

    public doQuery(filter: any, sections: any[]): any[] {
        let result: any[] = [];
        let operatorString = (Object.getOwnPropertyNames(filter));

        if (operatorString.length === 0) { // if the WHERE block is empty, just format and return all data
            return sections;
        }

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
                let scomp = new SCOMP(this.queryObj);
                return scomp.doSCOMP(next, operator, sections);
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

