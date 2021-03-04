import {
    Course,
} from "./Course";
import {InsightDataset} from "./IInsightFacade";
import Log from "../Util";

export class Dataset {
    public datasetId: string;
    public coursesArray: any[] = [];

    public constructor(id: string, coursesArray: any[]) {
        Log.trace("InsightFacadeImpl::init()");
        this.datasetId = id;
        this.coursesArray = coursesArray;
    }

    public getDatasetId(): string {
        return this.datasetId;
    }

    public setDatasetId(id: string) {
        this.datasetId = id;
    }

    public getCoursesArray(): any[] {
        return this.coursesArray;
    }

    public setCoursesArray(array: any[]) {
        this.coursesArray = array;
    }
}
