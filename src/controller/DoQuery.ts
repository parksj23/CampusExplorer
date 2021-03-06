import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

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
        let orderedSectionsWithRelevantColumns = this.doOptions(query[DoQuery.OPTIONS]);
        return this.doQuery(query[DoQuery.WHERE], orderedSectionsWithRelevantColumns);
    }

    private doOptions(query: any): any[] {
        let sectionsWithRelevantColumns = this.doColumns(query);
        let orderedSectionsWithRelevantColumns = this.doOrder(query, sectionsWithRelevantColumns);
        return orderedSectionsWithRelevantColumns;
    }

    private doColumns(query: any): any[] {
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

    private doOrder(query: any, sections: any[]): any[] {
        let optionsKeys = Object.getOwnPropertyNames(query);
        if (optionsKeys.includes(DoQuery.ORDER)) {
            let order = query[DoQuery.ORDER];
            if (typeof order === "string") {
                // sections.sort((a, b) => (a[order] < b[order] ? -1 : 1));
                let ascending = sections.sort((a: any, b: any) => {
                    if (a[order] < b[order]) {
                        return -1;
                    }
                    if (a[order] > b[order]) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                sections = ascending;
            }

            if (Array.isArray(order)) { // if there is >1 key in order, then we sort by the last one
                let lastOrderKey = order[order.length - 1];
                order = lastOrderKey;
                let ascending = sections.sort((a: any, b: any) => {
                    if (a[order] < b[order]) {
                        return -1;
                    }
                    if (a[order] > b[order]) {
                        return 1;
                    } else {
                        return 0;
                    }
                });
                sections = ascending;
            }
        }
        return sections;
    }

    public doQuery(filter: any, sections: any[]): any[] {
        let result: any[] = [];
        let operatorString = (Object.getOwnPropertyNames(filter));
        let operator = operatorString[0];
        let next = filter[operator];
        switch (operator) {
            case "AND":
                return this.doLogic(next, operator, sections);
                break;
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
                return this.doMCOMP(next, operator, sections);
                break;
            case "GT":
                return this.doMCOMP(next, operator, sections);
                break;
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
        let id = splitKey[0];
        let mfield = splitKey[1];
        switch (operator) {
            case "EQ":
                for (let section of sections) {
                    if (section[key] === compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "GT":
                for (let section of sections) {
                    if (section[key] > compValue) {
                        result.push(section);
                    }
                }
                return result;
                break;
            case "LT":
                for (let section of sections) {
                    if (section[key] < compValue) {
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
        let id = splitKey[0];
        let sfield = splitKey[1];
        for (let section of sections) {
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

    private doNegation(next: any, operator: string, sections: any[]): any[] {
        // let notResult: any[] = [];
        // let notTemp: any[] = [];
        // notTemp.push(this.doQuery(next, sections));
        // notResult.push(notTemp);
        // let not = notResult[0].filter((section: any) => !sections.includes(section));
        // return not;
        return this.doQuery(next, sections);
    }

    private doLogic(next: any, operator: string, sections: any[]): any[] {
        return [];
        switch (operator) {
            case "AND":
                let andResult: any[] = [];
                for (let filter of next) {
                    let andTemp: any[] = [];
                    andTemp.push(this.doQuery(filter, sections));
                    andResult.push(andTemp);
                }
                // for (let i = 0; i < andResult.length; i++) {
                //     let intersection = andResult[i].filter((section: any) => andResult[i + 1].includes(section));
                // }
                let intersection: any[] = [];
                if (andResult.length === 2) {
                    for (let a of andResult[0]) {
                        for (let section of a) {
                            for (let b of andResult[1]) {
                                for (let section2 of b) {
                                    if (section === section2) {
                                        intersection.push(section);
                                    }
                                }
                            }
                        }
                    }
                } else if (andResult.length > 2) {
                    return null;
                }
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
                for (let i = 0; i < orResult.length - 1; i++) {
                    union = orResult[i].concat(orResult[i + 1]);
                    // union = [].concat(orResult[i], orResult[i + 1]);
                }
                // https://stackoverflow.com/questions/56544572/flatten-array-of-arrays-in-typescript
                let flat = union.reduce((acc, val) => acc.concat(val), []);
                union = flat;
                return union;
                break;
        }
    }
}
