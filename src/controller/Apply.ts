import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Log from "../Util";
import ValidateQuery from "./ValidateQuery";

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

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

    public applyTokens: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

    constructor(transformations: any, data: any[]) {
        Log.trace("InsightFacadeImpl::init()");
        this.transformations = transformations;
        this.data = data;
    }

    public doApply(query: any, data: any[]): any[] {
        let apply = query[Apply.APPLY];
        let applyResult: any[] = [];

        if (apply.length === 0) {
            return data;
        }

        for (let applyOuterObj of apply) {
            let applyKeyString = Object.getOwnPropertyNames(applyOuterObj);
            let applyKey = applyKeyString[0];
            for (let applyInnerObjKey of applyKeyString) {
                let applyInnerObj = applyOuterObj[applyInnerObjKey];
                let applyTokenString = Object.getOwnPropertyNames(applyInnerObj);
                let applyToken = applyTokenString[0];
                let applyTargetKeyStrArray = Object.entries(applyInnerObj);
                let applyTargetKeyArr = applyTargetKeyStrArray[0];
                let applyTargetKey = applyTargetKeyArr[1] as string;

                switch (applyToken) {
                    case "MAX":
                        return this.doMAX(applyInnerObj, applyTargetKey, data);
                        break;
                    case "MIN":
                        return this.doMIN(applyInnerObj, applyTargetKey, data);
                        break;
                    case "AVG":
                        return this.doAVG(applyInnerObj, applyTargetKey, data);
                        break;
                    case "SUM":
                        return this.doSUM(applyInnerObj, applyTargetKey, data);
                        break;
                    case "COUNT":
                        return this.doCOUNT(applyInnerObj, applyTargetKey, data);
                        break;
                }
                break;
            }
        }
        // TODO: If there are more than one apply objects? I guess just make a new column for it...?
    }

    private doMAX(applyInnerObj: any, applyTargetKey: string, sections: any[]): any[] {
        return [];
    }

    private doMIN(applyInnerObj: any, applyTargetKey: string, sections: any[]): any[] {
        return [];
    }

    private doAVG(applyInnerObj: any, applyTargetKey: string, sections: any[]): any[] {
        return [];
    }

    private doSUM(applyInnerObj: any, applyTargetKey: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let smfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let sum = 0;
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[smfield]);
            }
            temp.forEach((val) => {
                sum = sum + val;
            });
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup["apply"] = sum;
            result.push(newGroup);
        }
        return result;
    }

    private doCOUNT(applyInnerObj: any, applyTargetKey: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let smfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let count = 0;
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[smfield]);
            }
            count = temp.length;
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup["apply"] = count;
            result.push(newGroup);
        }
        return result;
    }
}
