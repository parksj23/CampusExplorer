import {
    InsightDataset,
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import {Course} from "./Course";
import InsightFacade from "./InsightFacade";
import {split} from "ts-node";
import Log from "../Util";
import Decimal from "decimal.js";

export default class Apply {
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

    public getGroupedData(query: any, data: any[]): any[] {
        let applyResult: any[] = [];

        let apply = query[Apply.APPLY];

        if (apply.length === 0) {
            return data;
        }

        for (let groupedData of data) {
            let groupedAppliedResult = this.getEachApplyRule(query, groupedData);
            applyResult.push(groupedAppliedResult);
        }
        return applyResult;
    }

    private getEachApplyRule(query: any, groupedData: any[]): any[] {
        let apply = query[Apply.APPLY];

        for (let applyOuterObj of apply) {
            groupedData = this.doApply(applyOuterObj, groupedData);
        }
        return groupedData;
    }

    private doApply(applyOuterObj: any, groupedData: any[]): any[] {
        groupedData = this.doDoApply(applyOuterObj, groupedData);
        return groupedData;
    }

    private doDoApply(applyOuterObj: any, groupedData: any[]): any[] {
        let applyKeyString = Object.getOwnPropertyNames(applyOuterObj);
        let columnName: string = "";

        for (let applyInnerObjKey of applyKeyString) {
            columnName = applyInnerObjKey;
            let applyInnerObj = applyOuterObj[applyInnerObjKey];
            let applyTokenString = Object.getOwnPropertyNames(applyInnerObj);
            let applyToken = applyTokenString[0];
            let applyTargetKeyStrArray = Object.entries(applyInnerObj);
            let applyTargetKeyArr = applyTargetKeyStrArray[0];
            let applyTargetKey = applyTargetKeyArr[1] as string;

            switch (applyToken) {
                case "MAX":
                    return this.doMAX(applyInnerObj, applyTargetKey, columnName, groupedData);
                    break;
                case "MIN":
                    return this.doMIN(applyInnerObj, applyTargetKey, columnName, groupedData);
                    break;
                case "AVG":
                    return this.doAVG(applyInnerObj, applyTargetKey, columnName, groupedData);
                    break;
                case "SUM":
                    return this.doSUM(applyInnerObj, applyTargetKey, columnName, groupedData);
                    break;
                case "COUNT":
                    return this.doCOUNT(applyInnerObj, applyTargetKey, columnName, groupedData);
                    break;
            }
        }
        return null;
    }

    private doMAX(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];

        let fieldValues: any[] = [];
        for (let section of sections) {
            let mfieldValue = section[mfield];
            fieldValues.push(mfieldValue);
        }
        let max = 0;
        max = Math.max(...fieldValues);

        for (let s of sections) {
            s[columnName] = max;
        }
        return sections;
    }

    private doMIN(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];

        let fieldValues: any[] = [];
        for (let section of sections) {
            let mfieldValue = section[mfield];
            fieldValues.push(mfieldValue);
        }
        let min = 0;
        min = Math.min(...fieldValues);

        for (let s of sections) {
            s[columnName] = min;
        }
        return sections;
    }

    private doAVG(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];

        let fieldValues: any[] = [];
        for (let section of sections) {
            let mfieldValue = section[mfield];
            fieldValues.push(mfieldValue);
        }
        let total = new Decimal(0);
        for (let val of fieldValues) {
            let newVal = new Decimal(val);
            let t = Decimal.add(total, newVal);
            total = t;
        }
        let avg = total.toNumber() / fieldValues.length;
        avg = Number(avg.toFixed(2));

        for (let s of sections) {
            s[columnName] = avg;
        }
        return sections;
    }

    private doSUM(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];

        let fieldValues: any[] = [];
        for (let section of sections) {
            let mfieldValue = section[mfield];
            fieldValues.push(mfieldValue);
        }
        let sum = 0;
        fieldValues.forEach((val) => {
            sum = sum + val;
        });
        sum = Number(sum.toFixed(2));

        for (let s of sections) {
            s[columnName] = sum;
        }
        return sections;
    }

    private doCOUNT(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let splitKey = (applyTargetKey as string).split("_");
        let smfield = splitKey[1];

        let rawValues: any[] = [];
        for (let section of sections) {
            let fieldValue = section[smfield].toString();
            rawValues.push(fieldValue);
        }
        let uniqueValues: any[] = [];
        for (let i of rawValues) {
            if (!uniqueValues.includes(i)) {
                uniqueValues.push(i);
            }
        }
        let count = 0;
        count = uniqueValues.length;

        for (let s of sections) {
            s[columnName] = count;
        }
        return sections;
    }
}
