import {InsightError} from "./IInsightFacade";
// TODO: https://github.com/jjw2995/InsightFacade/blob/main/Where.ts

export default class Where {
    private clause: any;
    private filter: string;
    private id: string;
    private isEmpty: boolean = false;
    private datasetKind: any;

    constructor(where: any, datasetKind: any) {
        this.datasetKind = datasetKind;
        this.clause = where;

        if (where.constructor !== Object) {
            throw new InsightError("WHERE needs an object");
        }
        if (Object.keys(where).length > 0) {
            this.isEmpty = false;
            this.validateFilter();
        }
    }

    private validateFilter() {
        this.filter = this.recursiveFilter(this.clause);
    }

    private recursiveFilter(body: any): string {
        let operator: string = Object.keys(body)[0];
        switch (operator) {
            case "AND":
                break;
            case "OR":
                break;
            case "NOT":
                break;
            case "IS":
                break;
            case "EQ":
                break;
            case "GT":
                break;
            case "LT":
                break;
            default:
                return null;
                break;
        }
    }
}
