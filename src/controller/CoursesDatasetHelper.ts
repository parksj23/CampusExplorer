import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";
import * as JSZip from "jszip";

export default class CoursesDatasetHelper {
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public getDataset(root: JSZip): Promise<any []> {
        let zip: JSZip = new JSZip();
        let fileCount: number = 0;
        let promiseArray: Array<Promise<string>> = [];
        let validSections: any[] = [];
        return new Promise((resolve, reject) => {
            const courses: JSZip = root.folder("courses");
            courses.forEach((relativePath, course) => {
                let asyncPromiseReadFile: Promise<string> = course.async("string");
                promiseArray.push(asyncPromiseReadFile);
                fileCount++;
            });
            // TODO error here not caught
            if (fileCount < 1) {
                throw new InsightError("Invalid dataset: Empty or non-existent courses root directory.");
            }
            return Promise.all(promiseArray).then((courseJSONs: any) => {
                for (let i of courseJSONs) {
                    let section = JSON.parse(i);
                    let sectionType: any = typeof section;
                    if (sectionType === "object") {
                        let objKeys: string[] = (Object.getOwnPropertyNames(section));
                        if (objKeys.includes("result")) {
                            validSections = this.getSectionFields(section["result"], validSections);
                        }
                    }
                }
                if (validSections.length < 1) {
                    return reject(new InsightError("No valid sections."));
                } else {
                    return resolve(validSections);
                }
            }).catch((err: any) => {
                return reject(new InsightError("data invalid, not in JSON format."));
            });
        });
    }

    public getSectionFields(result: any, sections: any[]): any[] {
        let resultLength = result.length;
        let initialDesiredFields: string[] = ["Avg", "Pass", "Fail", "Audit", "Year", "Subject", "Course", "Professor",
            "Title", "id", "Section"];
        if (!(resultLength < 1)) {
            for (let i of result) {
                let section: any = {};
                let validSectionFields: any[] = [];
                let initialSectionFields = Object.keys(i);
                for (let key of initialDesiredFields) {
                    let iKey = typeof i[key];
                    if (initialSectionFields.includes(key)) {
                        validSectionFields.push(i[key]);
                    }
                }
                section["avg"] = i["Avg"];
                section["pass"] = i["Pass"];
                section["fail"] = i["Fail"];
                section["audit"] = i["Audit"];
                section["year"] = Number(i["Year"]);
                if (i["Section"].toLowerCase() === "overall") {
                    section["year"] = 1900;
                }
                section["dept"] = i["Subject"];
                section["id"] = i["Course"];
                section["instructor"] = i["Professor"];
                section["title"] = i["Title"];
                section["uuid"] = i["id"].toString();

                if (typeof section["avg"] === "number" && typeof section["pass"] === "number"
                    && typeof section["fail"] === "number" && typeof section["audit"] === "number"
                    && typeof section["year"] === "number" && typeof section["dept"] === "string"
                    && typeof section["id"] === "string" && typeof section["instructor"] === "string"
                    && typeof section["title"] === "string" && typeof section["uuid"] === "string") {
                    sections.push(section);
                }
            }
        }
        return sections;
    }
}
