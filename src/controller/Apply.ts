import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";

export default class Apply {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";
    private static SORT: string = "SORT";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";
    private static GROUP: string = "GROUP";
    private static APPLY: string = "APPLY";

    public transformations: any;
    public data: any[];
    public id: string;

    constructor(transformations: any, data: any[]) {
        this.transformations = transformations;
        this.data = data;
    }

    public doApply(query: any, data: any[]): any[] {
        return [];
    }
}
