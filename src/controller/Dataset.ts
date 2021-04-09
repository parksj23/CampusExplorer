import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";

export default class Dataset {
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

    public getCoursesArray(): any[] {
        return this.coursesArray;
    }

}
