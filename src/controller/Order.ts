import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Order {
    private static ORDER: string = "ORDER";

    public options: any;
    public data: any[];
    public id: string;

    constructor(options: any, data: any[]) {
        this.options = options;
        this.data = data;
    }

    public doOrder(query: any, sections: any[]): any[] {
        let optionsKeys = Object.getOwnPropertyNames(query);
        if (optionsKeys.includes(Order.ORDER)) {
            let order = query[Order.ORDER];
            if (typeof order === "string") { // c1 sort
                let ascending = this.doAscendingSingleKey(order, sections);
                sections = ascending;
            }

            if (typeof order === "object") { // c2 sort
                let sorted = this.doOrderObj(order, sections);
                sections = sorted;
            }
        }
        return sections;
    }

    // private doStringOrder(order: string, sections: any[]): any[] {
    //     let ascending = sections.sort((a: any, b: any) => {
    //         if (a[order] < b[order]) {
    //             return -1;
    //         }
    //         if (a[order] > b[order]) {
    //             return 1;
    //         } else {
    //             return 0;
    //         }
    //     });
    //     return ascending;
    // }

    private doOrderObj(order: any, sections: any[]): any[] {
        let direction = order.dir;
        if (order.keys.length === 1) {
            let key = order.keys[0];
            if (direction === "UP") {
                sections = this.doAscendingSingleKey(key, sections);
            }
            if (direction === "DOWN") {
                sections = this.doDescendingSingleKey(key, sections);
            }
        }

        if (order.keys.length > 1) {
            sections = this.doSortMultipleKey(order, sections);
        }
        return sections;
    }

    private doAscendingSingleKey(key: any, sections: any[]) {
        let ascending = sections.sort((a: any, b: any) => {
            if (a[key] < b[key]) {
                return -1;
            }
            if (a[key] > b[key]) {
                return 1;
            } else {
                return 0;
            }
        });
        return ascending;
    }

    private doDescendingSingleKey(key: any, sections: any[]) {
        let descending = sections.sort((a: any, b: any) => {
            if (a[key] > b[key]) {
                return -1;
            }
            if (a[key] < b[key]) {
                return 1;
            } else {
                return 0;
            }
        });
        return descending;
    }

    private doSortMultipleKey(order: any, sections: any[]): any[] {
        let direction = order.dir;

        // const sortMap: Map<string, any[]> = new Map<string, any[]>();
        //
        // for (let section of sections) {
        //     let mapKey: string = "";
        //
        //     for (let orderKey of keys) {
        //         mapKey = mapKey.concat(section[orderKey].toString());
        //     }
        //
        //     if (sortMap.has(mapKey)) {
        //         const value: any[] = sortMap.get(mapKey);
        //         value.push(section);
        //         sortMap.set(mapKey, value);
        //     } else {
        //         sortMap.set(mapKey, [section]);
        //     }
        // }
        // const a = 1;
        // let b = sortMap;
        // let result: any[] = [];
        // let getArr = Array.from(sortMap, ([key, value]) => {
        //     result.push([key, value]);
        // });
        // let n = result;

        if (direction === "UP") {
            sections = this.doAscendingMultipleKey(order, sections);
        }
        if (direction === "DOWN") {
            sections = this.doDescendingMultipleKey(order, sections);
        }
        return sections;
    }

    private doAscendingMultipleKey(order: any, sections: any[]) {
        // this version gives 252 passing tests, while the old (timing out) version gives 261
        let keys = order.keys;
        let ascending = sections.sort((a: any, b: any) => {
            for (let key of keys) {
                if (a[key] < b[key]) {
                    return -1;
                }
                if (a[key] > b[key]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        return ascending;
        // let keys = order.keys;
        // let seenKeys: any[] = [];
        // for (let i = 0; i < keys.length; i++) {
        //     if (i === 0) {
        //         sections = this.doAscendingSingleKey(keys[0], sections);
        //         seenKeys.push(keys[0]);
        //     } else {
        //         sections = this.doAscendingRecursive(keys[i], seenKeys, sections);
        //         seenKeys.push(keys[i]);
        //     }
        // }
        // return sections;
    }

    // private doAscendingRecursive(key: any, seenKeys: any[], sections: any[]): any[] {
    //     let ascending: any[] = [];
    //     let recursiveSortingObjects: any[] = [];
    //
    //     for (let section of sections) { // get all seenKey values for each section
    //         let obj: any = {};
    //         let values: any[] = [];
    //         let seenKeyLabel: string = "";
    //         for (let seenKey of seenKeys) {
    //             values.push(section[seenKey]);
    //         }
    //         seenKeyLabel = values.toString();
    //         obj["seenKeys"] = seenKeyLabel;
    //         obj["section"] = section;
    //         recursiveSortingObjects.push(obj);
    //     }
    //
    //     let seenSeenKeys: any[] = [];
    //     for (let groupingObj of recursiveSortingObjects) {
    //         if (!seenSeenKeys.includes(groupingObj["seenKeys"])) { // gather all same seenKeys and sort
    //             let temp: any[] = [];
    //             for (let object of recursiveSortingObjects) {
    //                 if (groupingObj["seenKeys"] === object["seenKeys"]) {
    //                     temp.push(object);
    //                 }
    //             }
    //             let tempSorted = temp.sort((a: any, b: any) => {
    //                 if (a["section"][key] < b["section"][key]) {
    //                     return -1;
    //                 }
    //                 if (a["section"][key] > b["section"][key]) {
    //                     return 1;
    //                 } else {
    //                     return 0;
    //                 }
    //             });
    //             ascending.push(tempSorted);
    //             ascending = ascending.reduce((acc, val) => acc.concat(val), []);
    //             seenSeenKeys.push(groupingObj["seenKeys"]);
    //         }
    //     }
    //     let result: any = [];
    //     for (let sectionObj of ascending) {
    //         let s = sectionObj["section"];
    //         result.push(s);
    //     }
    //     return result;
    // }

    private doDescendingMultipleKey(order: any, sections: any[]) {
        let keys = order.keys;
        let descending = sections.sort((a: any, b: any) => {
            for (let key of keys) {
                if (a[key] > b[key]) {
                    return -1;
                }
                if (a[key] < b[key]) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        return descending;
        // let keys = order.keys;
        // let seenKeys: any[] = [];
        // for (let i = 0; i < keys.length; i++) {
        //     if (i === 0) {
        //         sections = this.doDescendingSingleKey(keys[0], sections);
        //         seenKeys.push(keys[0]);
        //     } else {
        //         sections = this.doDescendingRecursive(keys[i], seenKeys, sections);
        //         seenKeys.push(keys[i]);
        //     }
        // }
        // return sections;
    }

    // private doDescendingRecursive(key: any, seenKeys: any[], sections: any[]): any[] {
    //     let descending: any[] = [];
    //     let recursiveSortingObjects: any[] = [];
    //
    //     for (let section of sections) { // get all seenKey values for each section
    //         let obj: any = {};
    //         let values: any[] = [];
    //         let seenKeyLabel: string = "";
    //         for (let seenKey of seenKeys) {
    //             values.push(section[seenKey]);
    //         }
    //         seenKeyLabel = values.toString();
    //         obj["seenKeys"] = seenKeyLabel;
    //         obj["section"] = section;
    //         recursiveSortingObjects.push(obj);
    //     }
    //
    //     let seenSeenKeys: any[] = [];
    //     for (let groupingObj of recursiveSortingObjects) {
    //         if (!seenSeenKeys.includes(groupingObj["seenKeys"])) {// gather all same seenKeys and sort
    //             let temp: any[] = [];
    //             for (let object of recursiveSortingObjects) {
    //                 if (groupingObj["seenKeys"] === object["seenKeys"]) {
    //                     temp.push(object);
    //                 }
    //             }
    //             let tempSorted = temp.sort((a: any, b: any) => {
    //                 if (a["section"][key] > b["section"][key]) {
    //                     return -1;
    //                 }
    //                 if (a["section"][key] < b["section"][key]) {
    //                     return 1;
    //                 } else {
    //                     return 0;
    //                 }
    //             });
    //             descending.push(tempSorted);
    //             descending = descending.reduce((acc, val) => acc.concat(val), []);
    //             seenSeenKeys.push(groupingObj["seenKeys"]);
    //         }
    //     }
    //     let result: any = [];
    //     for (let sectionObj of descending) {
    //         let s = sectionObj["section"];
    //         result.push(s);
    //     }
    //     return result;
    // }
}
