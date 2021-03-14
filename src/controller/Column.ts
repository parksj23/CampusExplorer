import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Column {
    private static COLUMNS: string = "COLUMNS";
    private static GROUP: string = "GROUP";
    private static OPTIONS: string = "OPTIONS";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";

    public options: any;
    public data: any[];
    public id: string;

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

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

    public c2ColumnsLauncher(query: any, sections: any[]): any[] {
        let transformations = query[Column.TRANSFORMATIONS];
        let group = transformations[Column.GROUP];
        let columnedSections: any[] = [];

        if (group.length === 1) {
            columnedSections = this.doC2ColumnsSingleGroup(query[Column.OPTIONS], sections);
        }
        if (group.length > 1) {
            columnedSections = this.doC2ColumnsMultipleGroup(query[Column.OPTIONS], sections);
        }

        return columnedSections;
    }

    private doC2ColumnsSingleGroup(query: any, sections: any[]): any[] {
        let columns = query[Column.COLUMNS];
        let columnedSections: any[] = [];

        let groupValues: any[] = [];
        let groupedColumnedArr: any[] = [];

        for (let groupedArray of sections) {
            for (let section of groupedArray["arr"]) {
                let columnedSection: any = {};
                for (let key of columns) {
                    if (key.includes("_")) {
                        let splitKey = key.split("_");
                        let smfield = splitKey[1];
                        columnedSection[key] = section[smfield];
                    }
                    if (!key.includes("_")) {
                        columnedSection[key] = groupedArray["apply"];
                    }
                }
                columnedSections.push(columnedSection);
            }
        }
        // for (let i = 0; i < columnedSections.length; i++) {
        for (let s of columnedSections) {
            let value = Object.values(s)[0];
            if (!groupValues.includes(value)) {
                groupValues.push(value);
                groupedColumnedArr.push(s);
            }
        }
        return groupedColumnedArr;
    }

    private doC2ColumnsMultipleGroup (query: any, sections: any[]): any[] {
        let columns = query[Column.COLUMNS];
        let columnedSections: any[] = [];

        let seen: any[] = [];

        for (let groupedArray of sections) {
            for (let section of groupedArray["arr"]) {
                if (seen.map(String).includes(groupedArray["key"].toString())) {
                    continue;
                }
                let columnedSection: any = {};
                for (let key of columns) {
                    let splitKey = key.split("_");
                    let smfield = splitKey[1];
                    columnedSection[key] = section[smfield];
                }
                columnedSections.push(columnedSection);
                seen.push(groupedArray["key"]);
            }
        }
        return columnedSections;
    }
}
