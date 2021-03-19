import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
    ResultTooLargeError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import ValidateQuery from "./ValidateQuery";

import DoQuery from "./DoQuery";
import DatasetHelper from "./DatasetHelper";
import RoomsDatasetHelper from "./RoomsDatasetHelper";
import CoursesDatasetHelper from "./CoursesDatasetHelper";

const parse5 = require("parse5");

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */


export default class InsightFacade implements IInsightFacade {
    public performQueryDatasetIds: string[] = [];

    public d = new DatasetHelper();
    public cDataset = new CoursesDatasetHelper();
    public rDataset = new RoomsDatasetHelper();

    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(
        id: string,
        content: string,
        kind: InsightDatasetKind,
    ): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            let insightKind: InsightDatasetKind;
            let datasetArray: any[] = [];
            // check if id is valid
            if ((id === null) || (id === undefined) || (!id.trim().length) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            // check if already added
            if (this.d.memory.includes(id)) {
                return reject(new InsightError("Dataset already added."));
            }

            // TODO potentially split paths here
            let zip: JSZip = new JSZip();
            return zip.loadAsync(content, {base64: true}).then((root: JSZip) => {
                if (kind === "courses") {
                    return this.cDataset.getDataset(root).then((array) => {
                        insightKind = InsightDatasetKind.Courses;
                        datasetArray = array;
                        return datasetArray;
                    }).catch((e) => {
                        return reject(new InsightError("Course getDataset didn't work"));
                    });
                }

                if (kind === "rooms") {
                    return this.rDataset.getDataset(root).then((array) => {
                        insightKind = InsightDatasetKind.Rooms;
                        datasetArray = array;
                        return datasetArray;
                    }).catch ((e) => {
                        return reject(new InsightError("Rooms getDataset didn't work"));
                    });
                }
            }).then(() => {
                if (datasetArray.length < 1) {
                    return reject(new InsightError("No valid sections."));
                } else {
                    this.d.saveData(id, insightKind, datasetArray);
                    return resolve(this.d.memory);
                }
                return reject(new InsightError());
            }).catch((err: any) => {
                return reject(new InsightError("Non-zip folder."));
            });
            return reject(new InsightError());
        });
    }

    public removeDataset(id: string):
        Promise<string> {
        return new Promise((resolve, reject) => {
            let fs = require("fs");
            let result: string = "";
            // check if id is valid
            if ((id === null) || (id === undefined)) {
                return reject(new InsightError("Invalid id."));
            } else if ((!(id.trim().length)) || (id.includes("_")) || (id.length < 1)) {
                return reject(new InsightError("Invalid id."));
            }
            try {
                if (!(this.d.memory.includes(id))) {
                    return reject(new NotFoundError("Dataset not found."));
                } else {
                    for (let index = 0; index < this.d.memory.length; index++) {
                        if (this.d.memory[index] === id) {
                            result = this.d.memory[index];
                            this.d.memory.splice(index, 1);
                            this.d.datasets.splice(index, 1);
                            const directory: string = "./src/data/";
                            let filepath: string = directory + id;
                            fs.unlink(filepath, (e: any) => {
                                if (e) {
                                    return reject(new InsightError());
                                }
                            });
                            return resolve(result);
                        }
                    }
                    return reject(new NotFoundError());
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    public performQuery(query: any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.performQueryDatasetIds = [];
            try {
                let validQuery = new ValidateQuery(query);
                if (validQuery.validateQuery(query)) {
                    this.performQueryDatasetIds = validQuery.performQueryDatasetIds;
                    if (this.performQueryDatasetIds.length > 1) {
                        throw new InsightError("References more than 1 dataset.");
                    }
                    let queryingDatasetId = this.performQueryDatasetIds[0];
                    let data = this.d.getData(queryingDatasetId);

                    let doQuery = new DoQuery(query, data);
                    let resultArray = doQuery.doInitialQuery(query);
                    if (resultArray.length > 5000) {
                        throw new ResultTooLargeError("Result has >5000 sections.");
                    }
                    return resolve(resultArray);
                    // return resolve([]);
                } else {
                    throw new InsightError("Invalid query.");
                }
            } catch (e) {
                return reject(e);
            }
        });
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.resolve(this.d.datasets);
    }
}
