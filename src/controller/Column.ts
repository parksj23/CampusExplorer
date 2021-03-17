import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
// import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Column {
    private static COLUMNS: string = "COLUMNS";

    public options: any;
    public data: any[];
    public id: string;

    constructor(options: any, data: any[]) {
        this.options = options;
        this.data = data;
    }

    public doC1Columns(query: any, sections: any[]): any[] {
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

    public doC2Columns(query: any, sections: any[]): any[] {
        let columns = query[Column.COLUMNS];
        let columnedSections: any[] = [];

        let groupValues: any[] = [];
        let groupedColumnedArr: any[] = [];

        // let groupedArray: any[] = [];

        for (let groupedArray of sections) {
            for (let section of groupedArray[1]) {
                let columnedSection: any = {};
                for (let key of columns) {
                    let splitKey = key.split("_");
                    let smfield = splitKey[1];
                    columnedSection[key] = section[smfield];
                }
                columnedSections.push(columnedSection);
            }
        }
        for (let s of columnedSections) {
            let value = Object.values(s)[0];

            if (!groupValues.includes(value)) {
                groupValues.push(value);
                groupedColumnedArr.push(columnedSections[i]);
            }
        }
        return groupedColumnedArr;
    }
}
