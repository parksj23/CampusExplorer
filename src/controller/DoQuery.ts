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

        if (queryKeys.includes(DoQuery.TRANSFORMATIONS)) {
            let group = new Group(query[DoQuery.TRANSFORMATIONS], queriedSections);
            let groupMap = group.doGroup(query[DoQuery.TRANSFORMATIONS], queriedSections);

            let apply = new Apply();
            let applySections = apply.getGroupedData(query[DoQuery.TRANSFORMATIONS], groupMap);

            let column = new Column(query[DoQuery.OPTIONS], applySections);
            columnedSections = column.c2ColumnsLauncher(query, applySections);

            let order = new Order(query[DoQuery.OPTIONS], columnedSections);
            orderedSections = order.doOrder(query[DoQuery.OPTIONS], columnedSections);

            return orderedSections;
        }
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
        // Filter goes through the array and if the callback function is true, then it adds the element to a new array
        let notResult: any[] = this.doQuery(next, sections);
        let filtered: any[] = [];
        for (let section of sections) {
            if (!notResult.includes(section)) {
                filtered.push(section);
            }
            sections = filtered;
        }
        return sections;
    }

    private doLogic(next: any, operator: string, sections: any[]): any[] {
        switch (operator) {
            case "AND":
                for (let filter of next) {
                    let andResult: any[] = this.doQuery(filter, sections);
                    let filtered: any[] = [];
                    for (let section of sections) {
                        if (andResult.includes(section)) {
                            filtered.push(section);
                        }
                    }
                    sections = filtered;
                }
                return sections;
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

                let removeDupes = this.removeDupes(union);
                union = removeDupes;
                return union;
                break;
        }
    }

    private removeDupes(union: any[]): any[] {
        let set = new Set(union);
        let newUnion = Array.from(set.values());
        return newUnion;
    }
}
