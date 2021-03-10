import * as chai from "chai";
import { expect } from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError,
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";

// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}

describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        coursesCopy: "./test/data/coursesCopy.zip",
        coursesEmpty: "./test/data/coursesEmpty.zip",
        coursesInvalid: "./test/data/coursesInvalid.zip",
        courses2: "./test/data/courses2.zip",
        noFolder: "./test/data/noFolder.zip",
        nonZipCourses: "./test/data/nonZipCourses.txt",
        noSections: "./test/data/noSections.zip",
        oneValidSection: "./test/data/oneValidSection.zip",
        rooms: "./test/data/rooms.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!

    // addDataset tests
    it("Should add a valid dataset", function () {
        this.timeout( 2000);
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add two valid datasets in a row", function () {
        this.timeout( 10000);
        const id1: string = "courses";
        const id2: string = "coursesCopy";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const futureResult1: Promise<string[]> = insightFacade.addDataset(id1, datasets[id1],
            InsightDatasetKind.Courses);
        return expect(futureResult1).to.eventually.deep.equal(expected1).then(() => {
            const futureResult2: Promise<string[]> = insightFacade.addDataset(id2, datasets[id2],
                InsightDatasetKind.Courses);
            return expect(futureResult2).to.eventually.deep.equal(expected2);
        });
    });

    it("SMALL Should add two valid datasets in a row", function () {
        const id1: string = "oneValidSection";
        const id2: string = "courses2";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const futureResult1: Promise<string[]> = insightFacade.addDataset(id1, datasets[id1],
            InsightDatasetKind.Courses);
        // arrays do equal but not enough time to write file into data ?
        return expect(futureResult1).to.eventually.deep.equal(expected1).then(() => {
             const futureResult2: Promise<string[]> = insightFacade.addDataset(id2, datasets[id2],
                 InsightDatasetKind.Courses);
             return expect(futureResult2).to.eventually.deep.equal(expected2);
         });
    });

    it("Should add a valid dataset with one section", function () {
        const id: string = "oneValidSection";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add a small valid dataset", function () {
        const id: string = "courses2";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should add a valid dataset after previously adding it and then removing it", function () {
        const id: string = "courses2";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const removeResult: Promise<string> = insightFacade.removeDataset(id);
                const removeExpected: string = id;
                return expect(removeResult).to.eventually.deep.equal(removeExpected)
                    .then(() => {
                        futureResult = insightFacade.addDataset(
                            id,
                            datasets[id],
                            InsightDatasetKind.Courses,
                        );
                        return expect(futureResult).to.eventually.deep.equal(
                            expected,
                        );
                    });
            });
    });

    it("Fail to add dataset -- id is whitespace", function () {
        const id: string = "  ";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- id with underscore", function () {
        const id: string = "courses_underscore";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- null id", function () {
        const id: string = null;
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- undefined id", function () {
        const id: string = undefined;
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- non-zip folder", function () {
        const id: string = "nonZipCourses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- zipped but no courses root directory", function () {
        const id: string = "noFolder";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- empty folder", function () {
        const id: string = "coursesEmpty";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- no course sections", function () {
        const id: string = "noSections";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- invalid dataset", function () {
        const id: string = "coursesInvalid";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add id that has not been loaded", function () {
        const id: string = "hello";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- empty string id", function () {
        const id: string = "";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add duplicate dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected)
            .then(() => {
                const futureResult2: Promise<string[]> = insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Courses,
                );
                return expect(futureResult2).to.be.rejectedWith(InsightError);
            });
    });

    // it("Fail to add duplicate dataset", function () {
    //     let id: string = "courses";
    //     const expected: string[] = [id];
    //     return insightFacade
    //         .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //         .then((result1) => {
    //             return insightFacade
    //                 .addDataset(id, datasets[id], InsightDatasetKind.Courses)
    //                 .then((futureResult) => {
    //                     expect.fail(
    //                         futureResult,
    //                         expected,
    //                         "Should be rejected.",
    //                     );
    //                 })
    //                 .catch((err: any) => {
    //                     expect(err).to.be.rejectedWith(InsightError);
    //                 });
    //         });
    // });

    it("Fail to add valid id but can not be found at the loaded databases", function () {
        const id: string = "courses";
        const id2: string = "hello";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id2],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // removeDataset tests
    it("Should be able to remove a dataset", function () {
        let id: string = "courses";
        const expected: string = id;
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1) => {
                return insightFacade
                    .removeDataset(id)
                    .then((futureResult) => {
                        expect(futureResult).to.eventually.deep.equal(expected);
                    })
                    .catch((err: any) => {
                        expect.fail(err, expected, "Should not have rejected.");
                    });
            });
    });

    it("Should remove a dataset with id that starts with whitespaces", function () {
        const id: string = "   courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const removeResult: Promise<
                    string
                > = insightFacade.removeDataset(id);
                const removeExpected: string = id;
                return expect(removeResult).to.eventually.deep.equal(
                    removeExpected,
                );
            });
    });
    it("Should remove a dataset with id that contains whitespaces in the middle", function () {
        const id: string = "co ur s  es";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const removeResult: Promise<
                    string
                > = insightFacade.removeDataset(id);
                const removeExpected: string = id;
                return expect(removeResult).to.eventually.deep.equal(
                    removeExpected,
                );
            });
    });
    it("Should remove a dataset with id that ends with whitespace", function () {
        const id: string = "courses    ";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const removeResult: Promise<
                    string
                > = insightFacade.removeDataset(id);
                const removeExpected: string = id;
                return expect(removeResult).to.eventually.deep.equal(
                    removeExpected,
                );
            });
    });

    it("Fail to remove a dataset because it does not exist", function () {
        const id: string = "courses";
        // const expected: string[] = [id];
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(NotFoundError);
    });

    it("Fail to remove a dataset -- add and remove diff id's", function () {
        const id1: string = "courses";
        const id2: string = "courses2";
        const expected: string[] = [id1];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    id2,
                );
                return expect(future2).to.be.rejectedWith(NotFoundError);
            });
    });

    it("Fail to remove a dataset -- add and remove diff id's -- version 2", function () {
        const id1: string = "courses";
        const id2: string = "coursesCopy";
        const expected: string[] = [id1];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    id2,
                );
                return expect(future2).to.be.rejectedWith(NotFoundError);
            });
    });

    it("Fail to remove a dataset -- underscore id", function () {
        const validID: string = "courses";
        const invalidID: string = "courses_underscore";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    invalidID,
                );
                return expect(future2).to.be.rejectedWith(InsightError);
            });
    });

    it("Fail to remove a dataset -- whitespace id", function () {
        const validID: string = "courses";
        const invalidID: string = "   ";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    invalidID,
                );
                return expect(future2).to.be.rejectedWith(InsightError);
            });
    });

    it("Fail to remove a dataset null id", function () {
        const validID: string = "courses";
        const invalidID: string = null;
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    invalidID,
                );
                return expect(future2).to.be.rejectedWith(InsightError);
            });
    });

    it("Fail to remove a dataset empty string id", function () {
        const validID: string = "courses";
        const invalidID: string = "";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const future2: Promise<string> = insightFacade.removeDataset(
                    invalidID,
                );
                return expect(future2).to.be.rejectedWith(InsightError);
            });
    });

    it("fail to remove an empty dataset", function () {
        const id: string = "courses";
        const removeResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(removeResult).to.be.rejectedWith(NotFoundError);
    });

    //
    //
    // listDataset tests
    it("Should return empty array -- no datasets added", function () {
        const expected: InsightDataset[] = [];
        const futureResult: Promise<
            InsightDataset[]
        > = insightFacade.listDatasets();
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    it("Should return empty array after removing the last dataset", function () {
        let id: string = "courses";
        // const expected: InsightDataset[] = [];
        const expectedAdd: string[] = [id];
        const expectedRemove: string = id;
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1) => {
                expect(result1).to.eventually.deep.equal(expectedAdd);
                return insightFacade.removeDataset(id).then((result2) => {
                    expect(result2).to.eventually.deep.equal(expectedRemove);
                    return insightFacade.listDatasets().then((futureResult) => {
                        expect(futureResult.length).to.eventually.deep.equal(0);
                    });
                });
            });
    });

    it("Should return array of 1 dataset -- 1 added", function () {
        let id: string = "courses";
        const expectedString: string[] = [id];
        // const expected: InsightDataset[] = [{id: "courses", kind: InsightDatasetKind.Courses, numRows: 64612}];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1) => {
                expect(result1).to.eventually.deep.equal(expectedString);
                return insightFacade.listDatasets().then((futureResult) => {
                    expect(futureResult.length).to.eventually.deep.equal(1);
                    expect(futureResult[0].numRows).equal(64612);
                    expect(futureResult[0].id).equal("courses");
                });
            });
    });

    it("Should return array of 1 dataset -- 2 added, 1 removed", function () {
        let id1: string = "courses";
        let id2: string = "oneSection";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const expected3: string[] = [id2];
        return insightFacade
            .addDataset(id1, datasets[id1], InsightDatasetKind.Courses)
            .then((result1) => {
                expect(result1).to.eventually.deep.equal(expected1);
                return insightFacade
                    .addDataset(id2, datasets[id2], InsightDatasetKind.Courses)
                    .then((result2) => {
                        expect(result2).to.eventually.deep.equal(expected2);
                        return insightFacade
                            .removeDataset(id1)
                            .then((result3) => {
                                expect(result3).to.eventually.deep.equal(
                                    expected3,
                                );
                                return insightFacade
                                    .listDatasets()
                                    .then((futureResult) => {
                                        expect(
                                            futureResult.length,
                                        ).to.eventually.deep.equal(1);
                                        expect(futureResult[0].numRows).equal(
                                            1,
                                        );
                                        expect(futureResult[0].id).equal(
                                            "oneSection",
                                        );
                                    });
                            });
                    });
            });
    });

    it("Should return array of 1 dataset with 1 section", function () {
        let id: string = "oneSection";
        const expected: string[] = [id];
        return insightFacade
            .addDataset(id, datasets[id], InsightDatasetKind.Courses)
            .then((result1) => {
                expect(result1).to.eventually.deep.equal(expected);
                return insightFacade.listDatasets().then((futureResult) => {
                    expect(futureResult.length).to.eventually.deep.equal(1);
                    expect(futureResult[0].numRows).equal(1);
                    expect(futureResult[0].id).equal("oneSection");
                });
            });
    });

    it("Should return array of 2 datasets", function () {
        let id1: string = "courses";
        let id2: string = "oneSection";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        return insightFacade
            .addDataset(id1, datasets[id1], InsightDatasetKind.Courses)
            .then((result1) => {
                expect(result1).to.eventually.deep.equal(expected1);
                return insightFacade
                    .addDataset(id2, datasets[id2], InsightDatasetKind.Courses)
                    .then((result2) => {
                        expect(result2).to.eventually.deep.equal(expected2);
                        return insightFacade
                            .listDatasets()
                            .then((futureResult) => {
                                expect(
                                    futureResult.length,
                                ).to.eventually.deep.equal(2);
                                expect(futureResult[0].numRows).equal(64612);
                                expect(futureResult[1].numRows).equal(1);
                                expect(futureResult[0].id).equal("courses");
                                expect(futureResult[1].id).equal("oneSection");
                            });
                    });
            });
    });
    // TODO: uncomment out all the tests above this line
    // it("Fail to remove a dataset -- whitespace ID -- returned array is the same", function () {
    //     const validID: string = "courses";
    //     const invalidID: string = "   ";
    //     const expected: string[] = [validID];
    //     const futureResult: Promise<string[]> = insightFacade.addDataset(
    //         validID,
    //         datasets[validID],
    //         InsightDatasetKind.Courses);
    //     return expect(futureResult).to.eventually.deep.equal(expected)
    //         .then(() => {
    //             const future2: Promise<string> = insightFacade.removeDataset(invalidID);
    //             return expect(future2).to.be.rejectedWith(InsightError);
    //         });
    // });
});
/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        },
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }
        // return Promise.all(loadDatasetPromises).catch((err) => {
        //     /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
        //      * for the purposes of seeing all your tests run.
        //      * TODO For C1, remove this catch block (but keep the Promise.all)
        //      */
        //     return Promise.resolve("HACK TO LET QUERIES RUN");
        // });
        return Promise.all(loadDatasetPromises);
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<
                        any[]
                    > = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
