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

        return groupMap;
    }
}
