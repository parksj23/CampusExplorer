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

    // public doApply(query: any, data: any[]): any[] {
    //     let apply = query[Apply.APPLY];
    //     for (let group of data) {
    //         let groupApplyResult = this.startApply(query, group);
    //     }
    // }

    public doApply(query: any, data: any[]): any[] {
        let apply = query[Apply.APPLY];
        let columnName: string = "";

        if (apply.length === 0) {
            return data;
        }

        if (apply.length === 1) {
            for (let applyOuterObj of apply) {
                let applyKeyString = Object.getOwnPropertyNames(applyOuterObj);
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
                            return this.doMAX(applyInnerObj, applyTargetKey, columnName, data);
                            break;
                        case "MIN":
                            return this.doMIN(applyInnerObj, applyTargetKey, columnName, data);
                            break;
                        case "AVG":
                            return this.doAVG(applyInnerObj, applyTargetKey, columnName, data);
                            break;
                        case "SUM":
                            return this.doSUM(applyInnerObj, applyTargetKey, columnName, data);
                            break;
                        case "COUNT":
                            return this.doCOUNT(applyInnerObj, applyTargetKey, columnName, data);
                            break;
                    }
                }
            }
        } else {
            return this.multipleApplyObj(apply, columnName, data);
        }
    }

    private multipleApplyObj(apply: any, columnName: string, data: any[]): any[] {
        let temp: any[] = [];

        for (let applyOuterObj of apply) {
            let applyKeyString = Object.getOwnPropertyNames(applyOuterObj);
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
                        let maxTemp = this.doMAX(applyInnerObj, applyTargetKey, columnName, data);
                        temp.push(maxTemp);
                        break;
                    case "MIN":
                        let minTemp = this.doMIN(applyInnerObj, applyTargetKey, columnName, data);
                        temp.push(minTemp);
                        break;
                    case "AVG":
                        let avgTemp = this.doAVG(applyInnerObj, applyTargetKey, columnName, data);
                        temp.push(avgTemp);
                        break;
                    case "SUM":
                        let sumTemp = this.doSUM(applyInnerObj, applyTargetKey, columnName, data);
                        temp.push(sumTemp);
                        break;
                    case "COUNT":
                        let countTemp = this.doCOUNT(applyInnerObj, applyTargetKey, columnName, data);
                        temp.push(countTemp);
                        break;
                }
            }
        }
        let applyResult = this.makeFinalSection(temp);
        return applyResult;
    }

    private makeFinalSection(temp: any[]): any[] {
        let applyResult: any[] = [];
        let applyColLabels: any[] = [];
        for (let array of temp) {
            let objKeys = Object.getOwnPropertyNames(array[0]);
            let applyColLabel = objKeys[2];
            applyColLabels.push(applyColLabel);
        }

        let sectionCount: number = 0;
        let arrLength = temp[0].length;
        for (let arrCount = 0; arrCount < arrLength; arrCount++) {
            let tValues: any[] = [];
            for (let arr of temp) {
                let section = arr[sectionCount];
                if (!tValues.includes(section["key"]) || !tValues.includes(section["key"])) {
                    tValues.push(section["key"], section["arr"]);
                }
                for (let appLabel of applyColLabels) {
                    let sKeys = Object.getOwnPropertyNames(section);
                    if (sKeys.includes(appLabel)) {
                        tValues.push(section[appLabel]);
                    }
                }
            }
            let finalSection: any = {};
            finalSection["key"] = tValues[0];
            finalSection["arr"] = tValues[1];
            let k = 2;
            for (let aLabel of applyColLabels) {
                finalSection[aLabel] = tValues[k];
                k++;
            }
            applyResult.push(finalSection);
            sectionCount++;
        }
        return applyResult;
    }

    private doMAX(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let max = 0;
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[mfield]);
            }
            max = Math.max(...temp);
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup[columnName] = max;
            result.push(newGroup);
        }
        return result;
    }

    private doMIN(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let min = 0;
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[mfield]);
            }
            min = Math.min(...temp);
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup[columnName] = min;
            result.push(newGroup);
        }
        return result;
    }

    private doAVG(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[mfield]);
            }
            let total = new Decimal(0);
            for (let val of temp) {
                let newVal = new Decimal(val);
                let t = Decimal.add(total, newVal);
                total = t;
            }
            let avg = total.toNumber() / temp.length;
            avg = Number(avg.toFixed(2));

            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup[columnName] = avg;
            result.push(newGroup);
        }
        return result;
    }

    private doSUM(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let mfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let sum = 0;
            let temp: any[] = [];
            for (let section of group["arr"]) {
                temp.push(section[mfield]);
            }
            temp.forEach((val) => {
                sum = sum + val;
            });
            sum = Number(sum.toFixed(2));
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup[columnName] = sum;
            result.push(newGroup);
        }
        return result;
    }

    private doCOUNT(applyInnerObj: any, applyTargetKey: string, columnName: string, sections: any[]): any[] {
        let result: any[] = [];
        let splitKey = (applyTargetKey as string).split("_");
        let smfield = splitKey[1];
        for (let group of sections) {
            let newGroup: any = {};
            let count = 0;
            let temp: any[] = [];
            let temp2: any[] = [];
            for (let section of group["arr"]) {
                let str = section[smfield].toString();
                temp.push(str);
            }
            for (let i of temp) {
                if (!temp2.includes(i)) {
                    temp2.push(i);
                }
            }
            count = temp2.length;
            newGroup["key"] = group["key"];
            newGroup["arr"] = group["arr"];
            newGroup[columnName] = count;
            result.push(newGroup);
        }
        return result;
    }
}
