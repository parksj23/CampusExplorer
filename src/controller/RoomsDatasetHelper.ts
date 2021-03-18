import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";
import * as JSZip from "jszip";
import GeoResponse from "./GeoResponse";

const parse5 = require("parse5");

export default class RoomsDatasetHelper {
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    // public saveData(id: string, kind: InsightDatasetKind, validSections: any[]) {
    //     let fs = require("fs");
    //     let insightDataset: InsightDataset = {id, kind, numRows: validSections.length};
    //     this.datasets.push(insightDataset);
    //     this.memory.push(id);
    //     let datasetContent = new Dataset(id, validSections);
    //     this.addedDatasetContent.push(datasetContent);
    //     const directory = "./src/data/";
    //     try {
    //         if (!fs.existsSync(directory)) {
    //             fs.mkdirSync(directory);
    //         }
    //         const filePath: string = directory + id;
    //         fs.writeFileSync(filePath, JSON.stringify(datasetContent));
    //     } catch (e) {
    //         throw new InsightError("Data was parsed correctly but not saved");
    //     }
    // }

    public getBuildingAddress(fileContent: string): Promise<string> {
        // let address: string = "nothing found";
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let buildingAddress: string = (this.findAddress(parsedHTML)).trim();
                return buildingAddress;
            });
        });
    }

    private getHTMLString(file: string): Promise<string> {
        let zip = new JSZip();
        return new Promise((resolve, reject) => {
            zip.loadAsync(file, {base64: true}).then((root) => {
                root.file("rooms/index.htm").async("string").then((stringContent) => {
                    return resolve(stringContent);
                });
            });
        });
    }

    private parseHTML(html: string): Promise<any> {
        return Promise.resolve(parse5.parse(html));
    }

    private findAddress(element: any): string {
        if (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-building-address") {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleAddress = this.findAddress(child);
                if (!(possibleAddress === "")) {
                    return possibleAddress;
                }
            }
        }
        return "";
    }

    public getLatLong(address: string): GeoResponse {
        return {
            lat: 0,
            lon: 0,
            error: null,
        };
        if (Error) {
            return {
                lat: null,
                lon: null,
                error: "error- geoLocation not found",
            };
        }
    }

    public checkFieldTypeRoom (room: any): boolean {
        if (typeof room["fullname"] === "string" && typeof room["shortname"] === "string"
            && typeof room["number"] === "string" && typeof room["name"] === "string"
            && typeof room["address"] === "string" && typeof room["lat"] === "number"
            && typeof room["long"] === "number" && typeof room["type"] === "string"
            && typeof room["furniture"] === "string" && typeof room["href"] === "string") {
            return true;
        }
        return false;
    }

}
