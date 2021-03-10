import {
    InsightError,
    ResultTooLargeError
} from "./IInsightFacade";
import SCOMP from "./SCOMP";
import ValidationHelper from "./ValidationHelper";

export default class ValidateQuery {
    private static WHERE: string = "WHERE";
    private static OPTIONS: string = "OPTIONS";
    private static COLUMNS: string = "COLUMNS";
    private static ORDER: string = "ORDER";
    private static TRANSFORMATIONS: string = "TRANSFORMATIONS";
    private static GROUP: string = "GROUP";
    private static APPLY: string = "APPLY";

    public queryObj: any;

    public sfields: string[] = ["dept", "id", "instructor", "title", "uuid",
        "fullname", "shortname", "number", "name", "address", "type", "furniture", "href"];

    public mfields: string[] = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

    public performQueryDatasetIds: string[] = [];

    public applyKeys: string[] = [];

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
                this.applyKeys)) {
                return false;
            }
        }

        if (!keys.includes(ValidateQuery.WHERE)) {
            return false;
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
            return scomp.validateSCOMP(next, operator);
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

        if (keyString.length === undefined || keyString.length < 1) {
            return false;
        }
        if ((typeof key !== "string") || (key === undefined) || (key === null)) {
            return false;
        }
        if (!key.includes("_")) {
            return false;
        }
        if (splitKey.length !== 2) {
            return false;
        }
        if ((typeof compValue !== "number") || (compValue === undefined) || (compValue === null)) {
            return false;
        }
        if (!this.mfields.includes(mfield)) {
            return false;
        }
        // add to list of global dataset ids IF it has not been seen yet
        if (!this.performQueryDatasetIds.includes(id)) {
            this.performQueryDatasetIds.push(id);
        }
        return true;
    }

    private validateOptions(options: any): boolean {
        if (typeof options !== "object") {
            return false;
        }
        let optionsKeys: string[] = Object.keys(options);
        if (optionsKeys.length < 1 || optionsKeys.length > 2) {
            return false;
        }
        if (optionsKeys.length === 1 && optionsKeys.includes(ValidateQuery.COLUMNS)) {
            let columns = options[ValidateQuery.COLUMNS];
            return this.validateColumns(columns);
        }
        if (optionsKeys.length === 2 && optionsKeys.includes(ValidateQuery.COLUMNS)
            && optionsKeys.includes(ValidateQuery.ORDER)) {
            let columns = options[ValidateQuery.COLUMNS];
            let order = options[ValidateQuery.ORDER];
            if (this.validateColumns(columns) === true) {
                if (this.validateOrder(order, columns) === true) {
                    return true;
                }
            }
        }
        return false;
    }

    private validateColumns(columns: string[]): boolean {
        if (columns === undefined) {
            return false;
        }
        if (columns.length < 1) {
            return false;
        }

        for (let key of columns) {
            if (key === null || key === undefined) {
                return false;
            } else if (typeof key !== "string") {
                return false;
            }

            switch (key.includes("_")) {
                case true: // regular key
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
                    break;
                case false: // applykey
                    if (!this.applyKeys.includes(key)) {
                        return false;
                    }
                    break;
            }
        }
        return true;
    }

    private validateOrder(order: any, columns: any): boolean {
        if (order === undefined || order === null) {
            return false;
        }

        if (typeof order === "string") {
            if (!columns.includes(order)) {
                return false;
            }

            if (order.length > 1) {
                return true;
            } else {
                return false;
            }
        }

        if (typeof order !== "string") {
            if (Array.isArray(order)) {
                if (order !== undefined || order !== null) {
                    for (let key of order) {
                        if (key === null) {
                            return false;
                        }
                        if (!columns.includes(key)) {
                            return false;
                        }
                    }
                }
            }
        }

        if (typeof order !== "string") {
            if (typeof order === "object") {
                return this.validateOrderObject(order, columns);
            }
        }
        return false;
    }

    private validateOrderObject(order: any, columns: any): boolean {
        if (order !== undefined || order !== null) {
            let orderProp = Object.getOwnPropertyNames(order);
            if (orderProp.length !== 2) {
                return false;
            }
            if (orderProp[0] !== "dir") {
                return false;
            }
            if (orderProp[1] !== "keys") {
                return false;
            }
            let direction = order.dir;
            if (typeof direction !== "string") {
                return false;
            }
            if (direction !== "UP" && direction !== "DOWN") {
                return false;
            }
            for (let key of order.keys) {
                if (key === null) {
                    return false;
                }
                if (!columns.includes(key)) {
                    return false;
                }
            }
        }
        return true;
    }
}
