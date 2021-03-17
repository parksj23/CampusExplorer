import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
// import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Log from "../Util";
import {type} from "os";

export default class Group {
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

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

    constructor(transformations: any, data: any[]) {
        Log.trace("InsightFacadeImpl::init()");
        this.transformations = transformations;
        this.data = data;
    }

    public doGroup(query: any, data: any[]): any[] {
        let group = query[Group.GROUP];
        let groupResult: any = {};
        if (group.length === 1) { // if there is only one group key
            for (let key of group) {
                let splitKey = key.split("_");
                let smfield = splitKey[1];
                // https://stackoverflow.com/questions/40774697/how-to-group-an-array-of-objects-by-key
                groupResult = data.reduce((groupedSections, section) => {
                    groupedSections[section[smfield]] = groupedSections[section[smfield]] || [];
                    groupedSections[section[smfield]].push(section);
                    return groupedSections;
                }, Object.create(null));
            }
        }

        // TODO: Change this to make group for first key, then split those groups into groups for 2nd key...
        for (let key of group) { // if we need to group by more than 1 key
            let splitKey = key.split("_");
            let smfield = splitKey[1];
            // https://stackoverflow.com/questions/40774697/how-to-group-an-array-of-objects-by-key
            groupResult = data.reduce((groupedSections, section) => {
                groupedSections[section[smfield]] = groupedSections[section[smfield]] || [];
                groupedSections[section[smfield]].push(section);
                return groupedSections;
            }, Object.create(null));
            let test = typeof groupResult;
            for (let [k, value] of Object.entries(groupResult)) {
                let a = k;
                let b = value;
                // for (let arr of value) {
                //     // how to iterate through each value???
                //     let help = 1;
                // }
            }
        }

        let groupResultArr = Object.entries(groupResult);
        return groupResultArr;
    }

    // private doGroupHelper(group: any, data: any[]) {
    //     let groupResult: any = {};
    //
    //     for (let key of group) {
    //         let splitKey = key.split("_");
    //         let smfield = splitKey[1];
    //         // https://stackoverflow.com/questions/40774697/how-to-group-an-array-of-objects-by-key
    //         groupResult = data.reduce((groupedSections, section) => {
    //             groupedSections[section[smfield]] = groupedSections[section[smfield]] || [];
    //             groupedSections[section[smfield]].push(section);
    //             return groupedSections;
    //         }, Object.create(null));
    //     }
    // }
}
