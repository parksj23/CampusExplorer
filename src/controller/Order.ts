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
            if (typeof order === "string") { // if there is only 1 key in order, then we sort by that
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
}
