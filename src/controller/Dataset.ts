import {
    Course,
} from "./Course";
import {InsightDataset} from "./IInsightFacade";
import Log from "../Util";

export class Dataset {
    private datasetId: string;
    private coursesArray: Course[] = [];

    public constructor(id: string) {
        Log.trace("InsightFacadeImpl::init()");
        this.datasetId = id;
        this.coursesArray = [];
    }

    public getCoursesArray(): Course[] {
        return this.coursesArray;
    }
    
    public setCoursesArray(array: Course[]) {
        this.coursesArray = array;
    }
    
    public getDatasetId(): string {
        return this.datasetId;
    }
    
    public setDatasetId(id: string) {
        this.datasetId = id;
    }
}
