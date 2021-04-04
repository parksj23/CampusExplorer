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
            let first = a[key];
            let second = b[key];

            if (typeof a[key] === "string") {
                first = a[key].toLowerCase();
            }
            if (typeof b[key] === "string") {
                second = b[key].toLowerCase();
            }

            if (first < second) {
                return -1;
            }
            if (first > second) {
                return 1;
            } else {
                return 0;
            }
        });
        return ascending;
    }

    private doDescendingSingleKey(key: any, sections: any[]) {
        let descending = sections.sort((a: any, b: any) => {
            let first = a[key];
            let second = b[key];

            if (typeof a[key] === "string") {
                first = a[key].toLowerCase();
            }
            if (typeof b[key] === "string") {
                second = b[key].toLowerCase();
            }

            if (first > second) {
                return -1;
            }
            if (first < second) {
                return 1;
            } else {
                return 0;
            }
        });
        return descending;
    }

    private doSortMultipleKey(order: any, sections: any[]): any[] {
        let direction = order.dir;

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
                let first = a[key];
                let second = b[key];

                if (typeof a[key] === "string") {
                    first = a[key].toLowerCase();
                }
                if (typeof b[key] === "string") {
                    second = b[key].toLowerCase();
                }

                if (first < second) {
                    return -1;
                }
                if (first > second) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        return ascending;
    }

    private doDescendingMultipleKey(order: any, sections: any[]) {
        let keys = order.keys;
        let descending = sections.sort((a: any, b: any) => {
            for (let key of keys) {
                let first = a[key];
                let second = b[key];

                if (typeof a[key] === "string") {
                    first = a[key].toLowerCase();
                }
                if (typeof b[key] === "string") {
                    second = b[key].toLowerCase();
                }

                if (first > second) {
                    return -1;
                }
                if (first < second) {
                    return 1;
                } else {
                    return 0;
                }
            }
        });
        return descending;
    }
}
