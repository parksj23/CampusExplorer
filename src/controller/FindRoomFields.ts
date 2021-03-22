import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import GeoResponse from "./GeoResponse";

export default class FindRoomFields {

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public findBuildingPath(element: any): string {
        if (element.nodeName === "td"
            && element.attrs[0].value === "views-field views-field-field-building-image"
            && element.childNodes.length > 0
            && element.childNodes[1].nodeName === "a") {
            return element.childNodes[1].attrs[0].value;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possiblePath = this.findBuildingPath(child);
                if (!(possiblePath === "")) {
                    return possiblePath;
                }
            }
        }
        return "";
    }

    public findBuildingInfo(element: any): any {
        if (element.nodeName === "div"
            && element.attrs[0].value === "building-info"
            && element.childNodes.length > 1) {
            return element;
        }
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let possibleNode = this.findBuildingInfo(child);
                if (possibleNode !== -1) {
                    return possibleNode;
                }
            }
        }
        return -1;
    }

    public findAddress(element: any): string {
        let address: string = "";
        address = element.childNodes[3].childNodes[0].childNodes[0].value;
        return address;
    }

    public findShortName(element: any): string {
        if (element.nodeName === "link" && element.attrs[0].value === "canonical"
            && element.attrs.length > 0 ) {
            return element.attrs[1].value;
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

    public findFullName(element: any): string {
        let fullName = "";
        fullName = element.childNodes[1].childNodes[0].childNodes[0].value;
        return fullName;
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
            return (element.childNodes[0].value).trim();
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
            return (element.childNodes[0].value).trim();
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
            return element.attrs[0].value;
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