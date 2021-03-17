import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";
import * as JSZip from "jszip";
import GeoResponse from "./GeoResponse";
import {JSZipObject} from "jszip";

const parse5 = require("parse5");

export default class RoomsDatasetHelper {
    public datasets: InsightDataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public getDataset(root: JSZip): Promise<any[]> {
        return new Promise((resolve, reject) => {
            let allRooms: any[] = [];
            let room: any = {};
            // TODO parse index --> I know I do that on all methods, but when i pieced it together the first time it
            //  did not work so I put them back for now
            // TODO get building shortName, longName, address, geoLocation
            // TODO forEach building, get HTML file
            // TODO get number, seats, type, furniture, href
            // TODO put name together (string)
            // TODO check all fields
            if (this.checkFieldTypeRoom(room)) {
                // add to rooms
                allRooms.push(room);
            }
            return resolve(allRooms);
        });
    }

    // public getHTMLForAll(fileContent: string): Promise<string> {
    //     return new Promise((resolve, reject) => {
    //         this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
    //             return parsedHTML;
    //         });
    //     });
    // }

    public getAddress(fileContent: string): Promise<string> {
        // let address: string = "nothing found";
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let address: string = (this.findAddress(parsedHTML)).trim();
                return address;
            });
        });
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

    public getShortName(fileContent: string) {
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let shortName: string = (this.findShortName(parsedHTML)).trim();
                return shortName;
            });
        });
    }

    private findShortName(element: any): string {
        if (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-building-code") {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleShortName = this.findShortName(child);
                if (!(possibleShortName === "")) {
                    return possibleShortName;
                }
            }
        }
        return "";
    }

    public getLongName(fileContent: string) {
        return new Promise((resolve, reject) => {
            this.getHTMLString(fileContent).then(this.parseHTML).then((parsedHTML) => {
                let longName: string = (this.findLongName(parsedHTML)).trim();
                return longName;
            });
        });
    }

    private findLongName(element: any): string {
        if (element.nodeName === "a" && element.attrs[0].name === "href"
            && element.attrs[0].value.startsWith("./campus/discover/buildings-and-classrooms")
            && element.childNodes[0].nodeName === "#text" ) {
            // && element.attrs[0].value.startsWith("./campus/discover/buildings-and-classrooms/")) {) {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleLongName = this.findLongName(child);
                if (!(possibleLongName === "")) {
                    return possibleLongName;
                }
            }
        }
        return "";
    }

    public getNumber(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let rNumber: string = (this.findNumber(parsedHTML)).trim();
                return rNumber;
            });
        });
    }

    private findNumber(element: any): string {
        if  (element.nodeName === "a" && element.attrs[0].name === "href"
            && element.attrs.length() > 1
            && element.attrs[0].value.startsWith("http://students.ubc.ca/campus/discover/buildings-and-classrooms/room")
            && element.attrs[2].value === "Room Details" ) {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleNumber = this.findNumber(child);
                if (!(possibleNumber === "")) {
                    return possibleNumber;
                }
            }
        }
        return "";
    }

    public getSeats(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let seats: number = (this.findSeats(parsedHTML));
                return seats;
            });
        });
    }

    private findSeats(element: any): number {
        if (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-room-capacity") {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleSeats = this.findSeats(child);
                if (!(possibleSeats = -1)) {
                    return possibleSeats;
                }
            }
        }
        return -1;
    }

    public getType(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let type: string = (this.findType(parsedHTML)).trim();
                return type;
            });
        });
    }

    private findType(element: any): string {
        if  (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-room-type" ) {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleType = this.findType(child);
                if (!(possibleType === "")) {
                    return possibleType;
                }
            }
        }
        return "";
    }

    public getFurniture(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let furniture: string = (this.findFurniture(parsedHTML)).trim();
                return furniture;
            });
        });
    }

    private findFurniture(element: any): string {
        if  (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-room-furniture" ) {
            return element.childNodes[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleFurniture = this.findFurniture(child);
                if (!(possibleFurniture === "")) {
                    return possibleFurniture;
                }
            }
        }
        return "";
    }

    public getHref(root: JSZip, shortName: string) {
        return new Promise((resolve, reject) => {
            this.getRoomHTML(root, shortName).then(this.parseHTML).then((parsedHTML) => {
                let href: string = (this.findHref(parsedHTML)).trim();
                return href;
            });
        });
    }

    private findHref(element: any): string {
        if  (element.nodeName === "a" && element.childNodes[0].value === "More info") {
            return element.atttrs[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleHref = this.findHref(child);
                if (!(possibleHref === "")) {
                    return possibleHref;
                }
            }
        }
        return "";
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
