import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";

export default class FindRoomFields {

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public findAddress(element: any): string {
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

    public findShortName(element: any): string {
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

    public findLongName(element: any): string {
        if (element.nodeName === "a" && element.attrs[0].name === "href"
            && element.attrs[0].value.startsWith("./campus/discover/buildings-and-classrooms")
            && element.childNodes[0].nodeName === "#text" ) {
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

    public findNumber(element: any): string {
        if (element.nodeName === "a" && element.attrs[0].name === "href"
            && element.attrs.length > 1
            && element.attrs[1].value === "Room Details") {
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

    public findSeats(element: any): number {
        if (element.nodeName === "td" && element.attrs[0].value === "views-field views-field-field-room-capacity") {
            const numInString: string = element.childNodes[0].value;
            const num: number = Number(numInString);
            return num;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleSeats = this.findSeats(child);
                if (possibleSeats !== -1) {
                    return possibleSeats;
                }
            }
        }
        return -1;
    }

    public findType(element: any): string {
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

    public findFurniture(element: any): string {
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

    public findHref(element: any): string {
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
}
