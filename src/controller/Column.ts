import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Column {
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

    public doColumns(query: any, sections: any[]): any[] {
        let columns = query[Column.COLUMNS];
        let columnedSections: any[] = [];
        for (let section of sections) {
            let columnedSection: any = {};
            for (let key of columns) {
                let splitKey = key.split("_");
                let smfield = splitKey[1];
                columnedSection[key] = section[smfield];
            }
            columnedSections.push(columnedSection);
        }
        return columnedSections;
    }
}
