import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Log from "../Util";
import {type} from "os";

export default class Group {
    private static GROUP: string = "GROUP";

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

    public doGroup(query: any, data: any[]): Map<string, any[]> {
        let group = query[Group.GROUP];

        const groupMap: Map<string, any[]> = new Map<string, any[]>();

        for (let section of data) {
            let mapKey: string = "";

            for (let groupKey of group) {
                let splitKey = groupKey.split("_");
                let smfield = splitKey[1];

                mapKey = mapKey.concat(section[smfield].toString());
            }

            if (groupMap.has(mapKey)) {
                const value: any[] = groupMap.get(mapKey);
                value.push(section);
                groupMap.set(mapKey, value);
            } else {
                groupMap.set(mapKey, [section]);
            }
        }

        let result: any[] = [];

        // groupMap.forEach((value) => {
        //     result.push(value);
        // });

        // for (let entry of Array.from(group.entries())) {
        //     let key = entry[0];
        //     let value = entry[1];
        // }

        // let getArr = Array.from(groupMap, ([key, value]) => {
        //     result.push([key, value]);
        // });

        return groupMap;
    }

    // private doSingleGroup(group: any, data: any[]) {
    //     let groupResult: any = {};
    //     let groupResultArr: any[] = [];
    //     let result: any[] = [];
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
    //     groupResultArr = Object.entries(groupResult);
    //     for (let g of groupResultArr) {
    //         let obj: any = {};
    //         obj["key"] = g[0];
    //         obj["arr"] = g[1];
    //         result.push(obj);
    //     }
    //     return result;
    // }
    //
    // private doMultipleGroup(group: any, data: any[]) {
    //     let groupResultArr: any[] = [];
    //
    //     let compositeKey = this.makeCompositeKey(group);
    //
    //     let dataCopy = JSON.parse(JSON.stringify(data));
    //     let seenCompositeKeyValues: any = [];
    //
    //     for (let i = 0; i < data.length; i) {
    //         let firstSectionValues: any[] = [];
    //         let sectionArrays: any[] = [];
    //
    //         for (let cKey of compositeKey) {
    //             firstSectionValues.push(data[i][cKey]);
    //         }
    //
    //         if (seenCompositeKeyValues.map(String).includes(firstSectionValues.toString())) {
    //             continue;
    //         }
    //
    //         if (!seenCompositeKeyValues.map(String).includes(firstSectionValues.toString())) {
    //             seenCompositeKeyValues.push(firstSectionValues);
    //         }
    //
    //         for (let section of dataCopy) {
    //             let otherSectionValues: any[] = [];
    //
    //             for (let cKey of compositeKey) {
    //                 otherSectionValues.push(section[cKey]);
    //             }
    //
    //             if (firstSectionValues.toString() === otherSectionValues.toString()) {
    //                 sectionArrays.push(section);
    //                 let index = data.findIndex((s) => {
    //                     let values = [];
    //                     for (let c of compositeKey) {
    //                         values.push(s[c]);
    //                     }
    //                     return values.toString() === otherSectionValues.toString();
    //                 });
    //                 data.splice(index, 1);
    //             }
    //         }
    //         let obj: any = {};
    //         obj["key"] = firstSectionValues;
    //         obj["arr"] = sectionArrays;
    //         groupResultArr.push(obj);
    //     }
    //     return groupResultArr;
    // }
    //
    // private makeCompositeKey(group: any): string[] {
    //     let compositeKey: string[] = [];
    //
    //     for (let key of group) { // make composite key from multiple group keys
    //         let splitKey = key.split("_");
    //         let smfield = splitKey[1];
    //         compositeKey.push(smfield);
    //     }
    //     return compositeKey;
    // }
}
