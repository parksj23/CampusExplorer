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

export default class ValidationHelper {
    private static GROUP: string = "GROUP";
    private static APPLY: string = "APPLY";

    public transformations: any;
    public data: any[];
    public id: string;

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

    public applyTokens: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];
    public mApplyTokens: string[] = ["MAX", "MIN", "AVG", "SUM"];

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public validateTransformations(transformations: any,
                                   performQueryDatasetIds: string[],
                                   applyKeys: string[],
                                   groupKeys: string[]): boolean {
        if (transformations === undefined || transformations === null) {
            return false;
        }

        if (typeof transformations !== "object") {
            return false;
        }

        if (transformations !== undefined || transformations !== null) {
            let transProp = Object.getOwnPropertyNames(transformations);
            if (transProp.length !== 2) {
                return false;
            }
            if (typeof transProp[0] !== "string" || transProp[0] !== "GROUP") {
                return false;
            }
            if (typeof transProp[1] !== "string" || transProp[1] !== "APPLY") {
                return false;
            }
            if (!this.validateGroup(transformations.GROUP, performQueryDatasetIds, groupKeys)) {
                return false;
            }
            if (!this.validateApply(transformations.APPLY, performQueryDatasetIds, applyKeys)) {
                return false;
            }
        }
        return true;
    }

    public validateGroup(group: any, performQueryDatasetIds: string[], groupKeys: string[]): boolean {
        if (group === undefined || group === null) {
            return false;
        }
        if (!Array.isArray(group)) {
            return false;
        }
        if (group.length === 0) {
            return false;
        }
        for (let key of group) {
            if (typeof key !== "string") {
                return false;
            }
            if (key === undefined || key === null) {
                return false;
            }
            if (!key.includes("_")) {
                return false;
            }
            let splitKey = key.split("_");
            let id = splitKey[0];
            let smfield = splitKey[1];

            if (splitKey.length !== 2) {
                return false;
            }

            if (!this.sfields.includes(smfield) && (!this.mfields.includes(smfield))) {
                return false;
            }

            if (!performQueryDatasetIds.includes(id)) {
                performQueryDatasetIds.push(id);
            }
            groupKeys.push(key);
        }
        return true;
    }


    public validateApply(apply: any,
                         performQueryDatasetIds: string[],
                         applyKeys: string[]): boolean {
        if (apply === undefined || apply === null) {
            return false;
        }

        if (!Array.isArray(apply)) {
            return false;
        }

        for (let applyOuterObj of apply) {
            if (typeof applyOuterObj !== "object") {
                return false;
            }

            if (applyOuterObj === undefined || applyOuterObj === null) {
                return false;
            }

            let applyKeyString = Object.getOwnPropertyNames(applyOuterObj);
            let applyKey = applyKeyString[0];

            if (applyKeys.includes(applyKey)) { // check if duplicate applykeys
                return false;
            }

            if (typeof applyKey !== "string") {
                return false;
            }

            if (applyKey.includes("_")) {
                return false;
            }

            if (applyKey.length === 0) {
                return false;
            }

            if (this.applyInnerObjValidation(applyKeyString, applyOuterObj, performQueryDatasetIds)) {
                applyKeys.push(applyKey);
            } else {
                return false;
            }
        }
        return true;
    }

    private applyInnerObjValidation(applyKeyString: string[],
                                    applyOuterObj: any,
                                    performQueryDatasetIds: string[]): boolean {
        for (let applyInnerObjKey of applyKeyString) {
            let applyInnerObj = applyOuterObj[applyInnerObjKey];
            if (typeof applyInnerObj !== "object") {
                return false;
            }
            if (applyInnerObj === undefined || applyInnerObj === null) {
                return false;
            }
            let applyTokenString = Object.getOwnPropertyNames(applyInnerObj);
            let applyToken = applyTokenString[0];
            if (applyTokenString.length !== 1) {
                return false;
            }
            if (!this.applyTokens.includes(applyToken)) {
                return false;
            }
            let applyTargetKeyStrArray = Object.entries(applyInnerObj);
            let applyTargetKeyArr = applyTargetKeyStrArray[0];
            let applyTargetKey = applyTargetKeyArr[1];
            if (applyTargetKeyArr.length !== 2) {
                return false;
            }
            if (typeof applyTargetKey !== "string" || applyTargetKey === undefined || applyTargetKey === null) {
                return false;
            }
            if (!applyTargetKey.includes("_")) {
                return false;
            }
            let splitKey = applyTargetKey.split("_");
            let id = splitKey[0];
            let smfield = splitKey[1];
            if (splitKey.length !== 2) {
                return false;
            }
            if (!this.sfields.includes(smfield) && (!this.mfields.includes(smfield))) {
                return false;
            }
            if (this.mApplyTokens.includes(applyToken)) {
                if (!this.mfields.includes(smfield)) {
                    return false;
                }
            }
            if (!performQueryDatasetIds.includes(id)) {
                performQueryDatasetIds.push(id);
            }
        }
        return true;
    }
}
