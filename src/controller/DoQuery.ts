import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";

export default class DoQuery {
    public queryObj: any;
    public datasetID: string;
    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid"];
    public mfields: string[] = ["avg", "pass", "fail", "audit", "year"];

    constructor(query: any) {
        this.queryObj = query;
    }

    public doQuery(query: any): Course[] {
        let result: Course[] = [];
        return result;
    }

    // TODO: implement MCOMP
    // switch (operator) {
    // case "EQ":
    //     return true;
    //     break;
    // case "GT":
    //     return true;
    //     break;
    // case "LT":
    //     return true;
    //     break;
    // }

    // TODO: implement SCOMP
//     if (compValue.includes("*")) {
//     let firstChar: string = compValue.charAt(0);
//     let lastChar: string = compValue.charAt(compValue.length - 1);
//     let wildcardCount = (compValue.match(/[^*]/g));
//     if (wildcardCount.length === 1 && compValue.length === 1) {
//     return true;
// } else if (wildcardCount.length === 1) {
//     if (firstChar === "*") {
//         let wildcardEndsWithInput: string = compValue.substring(1);
//     } else if (lastChar === "*") {
//         let wildcardStartsWithInput: string = compValue.substring(1);
//     }
// } else if (wildcardCount.length === 2) {
//     if (compValue.length === 2) {
//         return true;
//     } else if ((firstChar === "*") && (lastChar === "*")) {
//         let wildcardContainsInput: string = compValue.substring(1, compValue.length - 1);
//     }
// }
// return false;
// }
}
