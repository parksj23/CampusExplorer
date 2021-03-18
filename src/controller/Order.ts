import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Order {
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";
    private static SORT: string = "SORT";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";
    private static GROUP: string = "GROUP";
    private static APPLY: string = "APPLY";

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
                let ascending = this.doStringOrder(order, sections);
                sections = ascending;
            }

            // TODO: Save this for array order keys in order objects C2!!
            // if (Array.isArray(order)) { // if there is >1 key in order, then we sort by the last one
            //     let lastOrderKey = order[order.length - 1];
            //     order = lastOrderKey;
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
            //     sections = ascending;
            // }

            if (typeof order === "object") { // c2 sort
                let sorted = this.doOrderObj(order, sections);
                sections = sorted;
            }
        }
        return sections;
    }

    private doStringOrder(order: string, sections: any[]): any[] {
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
        return ascending;
    }

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

    private doSortMultipleKey(order: any, sections: any[]) {
        let direction = order.dir;
        for (let key of order.keys) {
            // TODO: fix this so it only resorts if the first key is a tie
            if (direction === "UP") {
                sections = this.doAscendingSingleKey(key, sections);
            }
            if (direction === "DOWN") {
                sections = this.doDescendingSingleKey(key, sections);
            }
        }
        return sections;
    }
}
