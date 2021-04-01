import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";
import * as JSZip from "jszip";
import GeoResponse from "./GeoResponse";
import FindRoomFields from "./FindRoomFields";
import {JSZipObject} from "jszip";
import * as http from "http";

const parse5 = require("parse5");

export default class RoomsDatasetHelper {
    public datasets: InsightDataset[] = [];
    public fields = new FindRoomFields();

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public getDataset(root: JSZip): Promise<any[]> {
        let validRooms: any[] = [];
        return new Promise((resolve, reject) => {
            // added a return here
            return this.getAllBuildingsHTML(root).then((buildingsHTML) => {
                let promiseArray: Array<Promise<any[]>> = [];
                for (let buildingHTML of buildingsHTML) {
                    const buildingElement = this.parseBuildingHTML(buildingHTML);
                    let table = this.findRoomTable(buildingElement);
                    if (table === -1) {
                        continue;
                    } else {
                        let promiseGetFieldsBuilding: Promise<any[]> = this.getFieldsBuilding(buildingElement, table);
                        promiseArray.push(promiseGetFieldsBuilding);
                    }
                }
                return Promise.all(promiseArray).then((validRoomsArray: any[]) => {
                    for (let iValidRooms of validRoomsArray) {
                        for (let validRoom of iValidRooms) {
                            validRooms.push(validRoom);
                        }
                    }
                }).then(() => {
                    if (validRooms.length < 1) {
                        return reject(new InsightError("No valid rooms."));
                    } else {
                        return resolve(validRooms);
                    }
                }); // TODO: need a catch here
            }).catch((e) => {
                return reject(new InsightError());
            });
        });
    }

    public getFieldsBuilding(buildingElement: any, table: any): Promise<any[]> {
        let validRooms: any[] = [];
        return new Promise((resolve, reject) => {
            const bShortName = this.fields.findShortName(buildingElement);
            const buildingInfo = this.fields.findBuildingInfo(buildingElement);
            const bFullName = this.fields.findFullName(buildingInfo);
            const bAddress = this.fields.findAddress(buildingInfo);
            this.fields.getLatLon(bAddress).then((geoResponse) => {
                if (geoResponse.error) {
                    return reject("geoResponse Error");
                }
                for (let singleRoom of table) {
                    if (singleRoom.nodeName === "tr") {
                        let room: any = {};
                        room["shortname"] = bShortName;
                        room["fullname"] = bFullName;
                        room["address"] = bAddress;
                        room["lat"] = geoResponse.lat;
                        room["lon"] = geoResponse.lon;
                        room["number"] = this.fields.findNumber(singleRoom);
                        room["name"] = room["shortname"] + "_" + room["number"];
                        room["seats"] = this.fields.findSeats(singleRoom);
                        if (room["seats"] === -1 ) {
                            room["seats"] = 0;
                        }
                        room["type"] = this.fields.findType(singleRoom);
                        room["furniture"] = this.fields.findFurniture(singleRoom);
                        room["href"] = this.fields.findHref(singleRoom);
                        validRooms.push(room);
                    }
                }
                return resolve(validRooms);
            }); // TODO: need a catch here
        });
    }

    public getAllBuildingsHTML(root: JSZip): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let asyncPromise = root.file("rooms/index.htm").async("string");
            return asyncPromise.then(this.parseHTML).then((parsedHTML) => {
                const buildingPathArray: string[] = [];
                const tableRows = this.findTable(parsedHTML);
                for (let tableRow of tableRows) {
                    if (tableRow.nodeName === "tr") {
                        let buildingPath: string = this.fields.findBuildingPath(tableRow);
                        if (!(buildingPath === "")) {
                            buildingPathArray.push(buildingPath);
                        }
                    }
                }
                return this.getBuildingHTMLArray(root, buildingPathArray).then((allBuildingsHTMLArray) => {
                    return resolve(allBuildingsHTMLArray);
                }).catch((e) => {
                    return reject(new InsightError("No rooms."));
                });
            }).catch((e) => {
                return reject(new InsightError("Parsing error."));
            });
        });
    }

    private parseHTML(html: string): Promise<any> {
        return Promise.resolve(parse5.parse(html));
    }

    private parseBuildingHTML(html: string): any {
        return parse5.parse(html);
    }

    public findTable(element: any): any {
        if (element.nodeName === "table"
            && element.attrs[0].value === "views-table cols-5 table"
            && element.childNodes.length > 2
            && element.childNodes[3].nodeName === "tbody") {
            element = element.childNodes[3].childNodes;
            return element;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleTable = this.findTable(child);
                if (possibleTable !== -1) {
                    return possibleTable;
                }
            }
        }
        return -1;
    }

    public findRoomTable(element: any): any {
        // TODO return multiple?
        if (element.nodeName === "table"
            && element.attrs[0].value === "views-table cols-5 table"
            && element.childNodes.length > 2
            && element.childNodes[3].nodeName === "tbody") {
            element = element.childNodes[3].childNodes;
            return element;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleTable = this.findRoomTable(child);
                if (possibleTable !== -1) {
                    return possibleTable;
                }
            }
        }
        return -1;
    }

    public getBuildingHTMLArray(root: JSZip, pathArray: string[]): Promise<string[]> {
        const fs = require("fs");
        let promiseArray: Array<Promise<string>> = [];
        return new Promise((resolve, reject) => {
            const rootDir: JSZip = root.folder("rooms");
            pathArray.forEach((path) => {
                const splittedPath: string[] = path.split("/");
                let almostRoom: JSZip = rootDir;
                for (let i = 1; i < splittedPath.length - 1; i++) {
                    const folder: string = splittedPath[i];
                    almostRoom = almostRoom.folder(folder);
                }
                const room: JSZipObject = almostRoom.file(splittedPath[splittedPath.length - 1]);
                let asyncPromiseReadFile: Promise<string> = room.async("string");
                promiseArray.push(asyncPromiseReadFile);
            });
            return Promise.all(promiseArray).then((htmlArray: string[]) => {
                return resolve(htmlArray);
            }).catch((e) => {
                return reject(new InsightError("No buildings."));
            });
        });
    }
}

