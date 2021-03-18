import SCOMP from "./SCOMP";
import ValidationHelper from "./ValidationHelper";
import {type} from "os";

export default class ValidateQuery {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";

    public queryObj: any;

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

    public performQueryDatasetIds: string[] = [];

    public applyKeys: string[] = [];
    public groupKeys: string[] = [];

    public applyTokens: string[] = ["MAX", "MIN", "AVG", "COUNT", "SUM"];

    constructor(query: any) {
        this.queryObj = query;
    }

    public validateQuery(query: any): boolean {
        if (query === null || query === undefined || typeof query !== "object") {
            return false;
        }
        let keys: string[] = Object.keys(query);
        if (!keys.includes(ValidateQuery.TRANSFORMATIONS)) {
            if (keys.length !== 2) {
                return false;
            }
        } else {
            if (keys.length !== 3) {
                return false;
            }
            if (!keys.includes(ValidateQuery.TRANSFORMATIONS)) {
                return false;
            }

            let vHelper = new ValidationHelper();
            if (!vHelper.validateTransformations(
                query[ValidateQuery.TRANSFORMATIONS],
                this.performQueryDatasetIds,
                this.applyKeys,
                this.groupKeys)) {
                return false;
            }
        }

        if (!keys.includes(ValidateQuery.WHERE)) {
            return false;
        }

        if (keys.includes(ValidateQuery.WHERE)) {
            let operatorString = (Object.getOwnPropertyNames(query[ValidateQuery.WHERE]));
            if (operatorString.length === 0) {
                return this.validateOptions(query[ValidateQuery.OPTIONS]);
            }
        }

        if (!keys.includes(ValidateQuery.OPTIONS)) {
            return false;
        }

        return this.validateFilter(query[ValidateQuery.WHERE]) && this.validateOptions(query[ValidateQuery.OPTIONS]);
    }

    private validateFilter(filter: any): boolean {
        if (typeof filter !== "object") {
            return false;
        }
        let operatorString = (Object.getOwnPropertyNames(filter));
        if (operatorString.length !== 1) {
            return false;
        }
        let operator = operatorString[0];
        let next = filter[operator];
        if (typeof next !== "object") {
            return false;
        }
        if (operator === "AND" || operator === "OR") {
            return this.validateLogic(next, operator);
        }
        if (operator === "NOT") {
            return this.validateNegation(next, operator);
        }
        if (operator === "IS") {
            let scomp = new SCOMP(this.queryObj);
            return scomp.validateSCOMP(next, operator, this.performQueryDatasetIds);
        }
        if (operator === "EQ" || operator === "GT" || operator === "LT") {
            return this.validateMCOMP(next, operator);
        }
        return false;
    }

    private validateNegation(next: any, operator: string): boolean {
        let nextKeys = (Object.getOwnPropertyNames(next));
        if (nextKeys.length !== 1) {
            return false;
        }
        return this.validateFilter(next);
    }

    private validateLogic(next: any, operator: string) {
        if (!Array.isArray(next) || next.length === 0) {
            return false;
        }
        for (let filter of next) {
            if (this.validateFilter(filter) === false) {
                return false;
            }
        }
        return true;
    }

    private validateMCOMP(next: any, operator: string): boolean {
        if (Object.keys(next).length !== 1) {
            return false;
        }
        let keyString = (Object.getOwnPropertyNames(next));
        let key = keyString[0];
        let compValue = next[key];
        let splitKey = key.split("_");
        let id = splitKey[0];
        let mfield = splitKey[1];

        if (keyString === undefined || keyString === null || keyString.length < 1) {
            return false;
        }
        if ((typeof key !== "string") || (key === undefined) || (key === null)) {
            return false;
        }
        if (!key.includes("_") || splitKey.length !== 2) {
            return false;
        }
        if ((typeof compValue !== "number") || (compValue === undefined) || (compValue === null)) {
            return false;
        }
        if (!this.mfields.includes(mfield)) {
            return false;
        }
        if (!this.performQueryDatasetIds.includes(id)) {
            this.performQueryDatasetIds.push(id);
        }
        return true;
    }

    private validateOptions(options: any): boolean {
        let columns = options[ValidateQuery.COLUMNS];
        let order = options[ValidateQuery.ORDER];

        if (typeof options !== "object" || columns === undefined || columns === null) {
            return false;
        }
        let optionsKeys: string[] = Object.keys(options);
        if (optionsKeys.length < 1 || optionsKeys.length > 2) {
            return false;
        }
        if (optionsKeys.length === 1 && optionsKeys.includes(ValidateQuery.COLUMNS)) {
            if (!this.validateColumns(columns)) {
                return false;
            }
        }
        if (optionsKeys.length === 2 && optionsKeys.includes(ValidateQuery.COLUMNS)
            && optionsKeys.includes(ValidateQuery.ORDER)) {
            if (!this.validateColumns(columns)) {
                return false;
            }
            if (!this.validateOrder(order, columns)) {
                return false;
            }
        }
        if (optionsKeys.length === 2 && optionsKeys.includes(ValidateQuery.COLUMNS)) {
            if (!optionsKeys.includes(ValidateQuery.ORDER)) {
                return false;
            }
        }
        return true;
    }

    private validateColumns(columns: string[]): boolean {
        if (columns === undefined || columns.length < 1) {
            return false;
        }

        for (let key of columns) {
            if (typeof key !== "string" || key === null || key === undefined) {
                return false;
            }

            if (!this.checkSplitKeyOrApplyKey(key, columns)) {
                return false;
            }
            // check if all keys in COLUMNS are in GROUP or APPLY when TRANSFORMATIONS is present
            let queryKeys: string[] = Object.keys(this.queryObj);
            if (queryKeys.includes(ValidateQuery.TRANSFORMATIONS)) {
                if (!this.applyKeys.includes(key) && !this.groupKeys.includes(key)) {
                    return false;
                }
            }
        }
        return true;
    }

    private validateOrder(order: any, columns: any): boolean {
        if (order === undefined || order === null || Array.isArray(order)) {
            return false;
        }

        if (typeof order !== "string" && typeof order !== "object") {
            return false;
        }

        if (typeof order === "string") {
            if (!columns.includes(order)) {
                return false;
            }
            if (!(order.length > 1)) {
                return false;
            }
        }

        if (typeof order === "object") {
            if (!this.validateOrderObject(order, columns)) {
                return false;
            }
        }
        return true;
    }

    private validateOrderObject(order: any, columns: any): boolean {
        let orderProp = Object.getOwnPropertyNames(order);
        if (orderProp.length !== 2) {
            return false;
        }
        if (orderProp[0] !== "dir" || orderProp[1] !== "keys") {
            return false;
        }
        let direction = order.dir;
        if (typeof direction !== "string") {
            return false;
        }
        if (direction !== "UP" && direction !== "DOWN") {
            return false;
        }
        if (order.keys.length === 0) {
            return false;
        }
        if (order.keys.length > 0) {
            for (let key of order.keys) {
                if (typeof key !== "string" || key === null || key === undefined) {
                    return false;
                }
                if (!columns.includes(key)) {
                    return false;
                }
                if (!this.checkSplitKeyOrApplyKey(key, columns)) {
                    return false;
                }
            }
        }
        return true;
    }

    private checkSplitKeyOrApplyKey(key: any, columns: any): boolean {
        if (key.includes("_")) {
            let splitKey = key.split("_");
            let id = splitKey[0];
            let smfield = splitKey[1];
            if (splitKey.length !== 2) {
                return false;
            }
            if (!this.sfields.includes(smfield) && (!this.mfields.includes(smfield))) {
                return false;
            }
            if (!this.performQueryDatasetIds.includes(id)) {
                this.performQueryDatasetIds.push(id);
            }
        }
        if (!key.includes("_")) {
            if (!this.applyKeys.includes(key)) {
                return false;
            }
        }
        return true;
    }
}
