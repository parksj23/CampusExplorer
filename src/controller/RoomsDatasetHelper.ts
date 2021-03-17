import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import * as JSZip from "jszip";
import GeoResponse from "./GeoResponse";
import {JSZipObject} from "jszip";
import FindRoomFields from "./FindRoomFields";

const parse5 = require("parse5");

export default class RoomsDatasetHelper {
    public datasets: InsightDataset[] = [];
    public fields = new FindRoomFields();

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public getDataset(root: JSZip): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let allRooms: any[] = [];
            let room: any = {};
            // TODO parse index --> I know I do that on all methods, but when i pieced it together the first time it
            let zip: JSZip = new JSZip();
            root.file("rooms/index.htm").async("string").then(this.parseHTML).then((parsedHTML) => {
                const hello = 1;
            });
            // TODO get building shortName, longName, address, geoLocation TODO forEach building, get HTML file TODO
            //  get number, seats, type, furniture, href TODO put name together (string) TODO check all fields
            if (this.checkFieldTypeRoom(room)) {
                // add to rooms
                allRooms.push(room);
            }
            return resolve(allRooms);
        });
    }

    public getAddress(fileContent: string): Promise<string> {
        // let address: string = "nothing found";
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let address: string = (this.fields.findAddress(parsedHTML)).trim();
                return resolve(address);
            });
        });
    }

    public getShortName(fileContent: string) {
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let shortName: string = (this.fields.findShortName(parsedHTML)).trim();
                return resolve(shortName);
            });
        });
    }

    public getLongName(fileContent: string) {
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let longName: string = (this.fields.findLongName(parsedHTML)).trim();
                return resolve(longName);
            });
        });
    }

    public getNumber(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let rNumber: string = this.fields.findNumber(parsedHTML);
                return resolve(rNumber);
            });
        });
    }

    public getSeats(root: JSZip, shortName: string): Promise<number> {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let seats: number = (this.fields.findSeats(parsedHTML));
                return resolve(seats);
            });
        });
    }

    public getType(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let type: string = (this.fields.findType(parsedHTML)).trim();
                return resolve(type);
            });
        });
    }

    public getFurniture(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let furniture: string = (this.fields.findFurniture(parsedHTML)).trim();
                return resolve(furniture);
            });
        });
    }

    public getHref(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let href: string = (this.fields.findHref(parsedHTML)).trim();
                return resolve(href);
            });
        });
    }

    public getRoomHTML(root: JSZip, shortName: string): Promise<string> {
        const fs = require("fs");
        return new Promise((resolve, reject) => {
            const room: JSZipObject = root.folder("rooms").folder("campus").folder("discover")
                .folder("buildings-and-classrooms").file(shortName);
            room.async("string").then((htmlContent) => {
                return resolve(htmlContent);
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

    private getLatLong(address: string): GeoResponse {
        return { lat: 0, lon: 0, error: null, };
        if (Error) {
            return { lat: null, lon: null, error: "error- geoLocation not found", };
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
