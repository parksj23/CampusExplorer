import {
    Course,
} from "./Course";
import {InsightDataset, InsightDatasetKind, InsightError} from "./IInsightFacade";
import Log from "../Util";
import Dataset from "./Dataset";

export default class CoursesDatasetHelperDatasetHelper {
    public datasets: InsightDataset[] = [];
    public memory: string[] = [];
    public addedDatasetContent: Dataset[] = [];

    public constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }


}
