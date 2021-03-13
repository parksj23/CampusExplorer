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
import RoomsDatasetHelper from "../src/controller/RoomsDatasetHelper";

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
        rooms: "./test/data/rooms.zip",
        // TODO create mock datasets
        // oneValidRoom: "./test/data/oneValidRoom.zip",
        // noRoomsInBuilding: "./test/data/noRoomsInBuilding.zip",
        // geoLocationError: "./test/data/geoLocationError.zip",
        // noRoomsDir: "./test/data/noRoomsDir.zip",
        // roomsEmpty: "./test/data/roomsEmpty.zip",
        // roomsIncomplete: "./test/data/roomsIncomplete.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    let roomsDatasetHelper: RoomsDatasetHelper;
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

    // TODO getAddress tests
    it("Should get address - ACU Building ", function () {
        const expected: string = "2211 Wesbrook Mall";
        const id: string = "rooms";
        const fileContent: string = datasets[id];
        const futureResult: string = insightFacade.getBuildingAddress(fileContent);
        return expect(futureResult).deep.equal(expected);
    });

    // addDataset tests
    it("Should add a valid dataset of type rooms", function () {
        this.timeout( 10000);
        const id: string = "rooms";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add a valid dataset of type rooms -- one valid room", function () {
        // TODO
        const id: string = "oneValidRoom";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should add two valid datasets in a row -- rooms type", function () {
        this.timeout( 10000);
        // TODO
        const id1: string = "rooms";
        const id2: string = "oneValidRoom";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const futureResult1: Promise<string[]> = insightFacade.addDataset(id1, datasets[id1],
            InsightDatasetKind.Rooms);
        return expect(futureResult1).to.eventually.deep.equal(expected1).then(() => {
            const futureResult2: Promise<string[]> = insightFacade.addDataset(id2, datasets[id2],
                InsightDatasetKind.Rooms);
            return expect(futureResult2).to.eventually.deep.equal(expected2);
        });
    });
    // TODO
    it("Should add two valid datasets in a row -- course and room", function () {
        this.timeout( 10000);
        const id1: string = "courses";
        const id2: string = "rooms";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const futureResult1: Promise<string[]> = insightFacade.addDataset(id1, datasets[id1],
            InsightDatasetKind.Courses);
        return expect(futureResult1).to.eventually.deep.equal(expected1).then(() => {
            const futureResult2: Promise<string[]> = insightFacade.addDataset(id2, datasets[id2],
                InsightDatasetKind.Rooms);
            return expect(futureResult2).to.eventually.deep.equal(expected2);
        });
    });
    // TODO
    it("Fail to add dataset of building with no rooms", function () {
        const id: string = "noRoomsInBuilding";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // TODO
    it("Fail to add dataset of building with geoLocation error", function () {
        const id: string = "geoLocationError";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // TODO
    it("Fail to add duplicate dataset -- rooms", function () {
        const id: string = "oneValidRoom";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.eventually.deep.equal(expected)
            .then(() => {
                const futureResult2: Promise<string[]> = insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Rooms,
                );
                return expect(futureResult2).to.be.rejectedWith(InsightError);
            });
    });
    it("Fail to add dataset -- id is whitespace -- rooms type", function () {
        const id: string = "  ";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "rooms",
            datasets["rooms"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- id with underscore -- rooms type", function () {
        const id: string = "rooms_underscore";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "rooms",
            datasets["rooms"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- null id -- rooms type", function () {
        const id: string = null;
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "rooms",
            datasets["rooms"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- undefined id -- rooms type", function () {
        const id: string = undefined;
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            "rooms",
            datasets["rooms"],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // TODO
    it("Fail to add dataset -- zipped but no ./rooms root directory", function () {
        const id: string = "noRoomsDir";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // TODO
    it("Fail to add dataset -- empty folder -- rooms type", function () {
        const id: string = "roomsEmpty";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    it("Fail to add dataset -- invalid room (missing attributes)", function () {
        const id: string = "roomsIncomplete";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add id that has not been loaded -- rooms type", function () {
        const id: string = "hello";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    it("Fail to add dataset -- empty string id -- rooms type", function () {
        const id: string = "";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    it("Fail to add valid id but not loaded  -- rooms type", function () {
        const id: string = "rooms";
        const id2: string = "hello";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id2],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });
    // getAddress tests

    // removeDataset tests
    // TODO
    it("Should add a valid dataset after prev add & remove -- rooms type", function () {
        const id: string = "oneValidRoom";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
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
                            InsightDatasetKind.Rooms,
                        );
                        return expect(futureResult).to.eventually.deep.equal(
                            expected,
                        );
                    });
            });
    });
    it("should remove a valid dataset that exists -- rooms type", function () {
        this.timeout( 10000);
        const id: string = "rooms";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(futureResult).to.eventually.deep.equal(expected).then( () => {
            const removeResult: Promise<string> = insightFacade.removeDataset(id);
            const removeExpected: string = id;
            return expect(removeResult).to.eventually.deep.equal(removeExpected);
        });
    });

    it("Should remove a dataset with id that starts with whitespaces -- rooms type", function () {
        const id: string = "   rooms";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets["rooms"],
            InsightDatasetKind.Rooms,
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
    it("Should remove a dataset with id of whitespaces in the middle -- rooms type", function () {
        const id: string = "r    oo    m     s";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets["rooms"],
            InsightDatasetKind.Rooms,
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
    it("Should remove a dataset with id that ends with whitespace -- rooms type", function () {
        const id: string = "rooms    ";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets["rooms"],
            InsightDatasetKind.Rooms,
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
    it("Fail to remove a dataset that does not exist -- rooms type", function () {
        const id: string = "rooms";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(NotFoundError);
    });
    it("Fail to remove a dataset -- add and remove diff id's -- rooms type", function () {
        this.timeout( 10000);
        const id1: string = "rooms";
        const id2: string = "oneValidRoom";
        const expected: string[] = [id1];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id1,
            datasets[id1],
            InsightDatasetKind.Rooms,
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
    it("Fail to remove a dataset -- underscore id -- rooms type", function () {
        const validID: string = "rooms";
        const invalidID: string = "rooms_underscore";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Rooms,
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
    it("Fail to remove a dataset -- whitespace id -- rooms type", function () {
        const validID: string = "rooms";
        const invalidID: string = "     ";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Rooms,
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

    it("Fail to remove a dataset null id -- rooms type", function () {
        const validID: string = "rooms";
        const invalidID: string = null;
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Rooms,
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

    it("Fail to remove a dataset empty string id -- rooms type", function () {
        const validID: string = "rooms";
        const invalidID: string = "";
        const expected: string[] = [validID];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            validID,
            datasets[validID],
            InsightDatasetKind.Rooms,
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
    // listDataset tests
    it("Should return empty array -- no datasets added -- rooms type", function () {
        const expected: InsightDataset[] = [];
        const futureResult: Promise<
            InsightDataset[]
        > = insightFacade.listDatasets();
        return expect(futureResult).to.eventually.deep.equal(expected);
    });
    it("Should return empty array after removing the last dataset -- rooms type", function () {
        let id: string = "rooms";
        const expected: InsightDataset[] = [];
        const expectedAdd: string[] = [id];
        const expectedRemove: string = id;
        const addResult = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(addResult).to.eventually.deep.equal(expectedAdd).then(() => {
            const removeResult = insightFacade.removeDataset(id);
            return expect(removeResult).to.eventually.deep.equal(expectedRemove);
            }).then(() => {
                const listResult = insightFacade.listDatasets();
                return listResult.then((futureResult) => {
                    return expect(futureResult.length).to.deep.equal(0);
                });
            });
    });
    it("Should return array of 1 dataset -- 1 added -- rooms type", function () {
        this.timeout( 10000);
        let id: string = "rooms";
        const expectedString: string[] = [id];
        const expected: InsightDataset[] = [{id: "rooms", kind: InsightDatasetKind.Rooms, numRows: 364}];
        const addResult = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(addResult).to.eventually.deep.equal(expectedString).then(() => {
            const listResult = insightFacade.listDatasets();
            return listResult.then((futureResult) => {
                expect(futureResult.length).to.deep.equal(1);
                expect(futureResult[0].numRows).equal(364);
                return expect(futureResult[0].id).equal("rooms");
            });
        });
    });

    it("Should return array of 1 dataset -- 2 added, 1 removed", function () {
        let id1: string = "rooms";
        let id2: string = "oneValidRoom";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        const expected3: string[] = [id2];
        return insightFacade
            .addDataset(id1, datasets[id1], InsightDatasetKind.Rooms)
            .then((result1) => {
                expect(result1).to.deep.equal(expected1);
                return insightFacade
                    .addDataset(id2, datasets[id2], InsightDatasetKind.Rooms)
                    .then((result2) => {
                        expect(result2).to.deep.equal(expected2);
                        return insightFacade
                            .removeDataset(id1)
                            .then((resultDelete) => {
                                let result3: string[] = [];
                                for (let entry of result2) {
                                    if (!(entry === resultDelete)) {
                                        result3.push(entry);
                                    }
                                }
                                expect(result3).to.deep.equal(expected3);
                                return insightFacade
                                    .listDatasets()
                                    .then((futureResult) => {
                                        expect(
                                            futureResult.length,
                                        ).to.deep.equal(1);
                                        expect(futureResult[0].numRows).equal(
                                            1,
                                        );
                                        return expect(futureResult[0].id).equal(
                                            "oneValidRoom",
                                        );
                                    });
                            });
                    });
            });
    });
    it("Should return array of 1 dataset with 1 section -- rooms type", function () {
        let id: string = "oneValidRoom";
        const expectedString: string[] = [id];
        const addResult = insightFacade.addDataset(id, datasets[id], InsightDatasetKind.Rooms);
        return expect(addResult).to.eventually.deep.equal(expectedString).then(() => {
            const listResult = insightFacade.listDatasets();
            return listResult.then((futureResult) => {
                expect(futureResult.length).to.deep.equal(1);
                expect(futureResult[0].numRows).equal(1);
                return expect(futureResult[0].id).equal("oneValidRoom");
            });
        });
    });
    it("Should return array of 2 datasets", function () {
        this.timeout(10000);
        let id1: string = "rooms";
        let id2: string = "oneValidRoom";
        const expected1: string[] = [id1];
        const expected2: string[] = [id1, id2];
        return insightFacade
            .addDataset(id1, datasets[id1], InsightDatasetKind.Rooms)
            .then((result1) => {
                expect(result1).deep.equal(expected1);
                const hdi = 2;
                return insightFacade
                    .addDataset(id2, datasets[id2], InsightDatasetKind.Rooms).then((result2) => {
                        expect(result2).deep.equal(expected2);
                        return insightFacade
                            .listDatasets()
                            .then((futureResult) => {
                                expect(
                                    futureResult.length,
                                ).deep.equal(2);
                                expect(futureResult[0].numRows).equal(364);
                                expect(futureResult[1].numRows).equal(1);
                                expect(futureResult[0].id).equal("rooms");
                                expect(futureResult[1].id).equal("oneValidRoom");
                            });
                    });
            });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
// describe("InsightFacade PerformQuery", () => {
//     const datasetsToQuery: {
//         [id: string]: { path: string; kind: InsightDatasetKind };
//     } = {
//         courses: {
//             path: "./test/data/courses.zip",
//             kind: InsightDatasetKind.Courses,
//         },
//     };
//     let insightFacade: InsightFacade;
//     let testQueries: ITestQuery[] = [];
//
//     // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
//     before(function () {
//         Log.test(`Before: ${this.test.parent.title}`);
//
//         // Load the query JSON files under test/queries.
//         // Fail if there is a problem reading ANY query.
//         try {
//             testQueries = TestUtil.readTestQueries();
//         } catch (err) {
//             expect.fail(
//                 "",
//                 "",
//                 `Failed to read one or more test queries. ${err}`,
//             );
//         }
//         // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
//         // Will fail* if there is a problem reading ANY dataset.
//         const loadDatasetPromises: Array<Promise<string[]>> = [];
//         insightFacade = new InsightFacade();
//         for (const id of Object.keys(datasetsToQuery)) {
//             const ds = datasetsToQuery[id];
//             const data = fs.readFileSync(ds.path).toString("base64");
//             loadDatasetPromises.push(
//                 insightFacade.addDataset(id, data, ds.kind),
//             );
//         }
//         return Promise.all(loadDatasetPromises);
//     });
//
//     beforeEach(function () {
//         Log.test(`BeforeTest: ${this.currentTest.title}`);
//     });
//
//     after(function () {
//         Log.test(`After: ${this.test.parent.title}`);
//     });
//
//     afterEach(function () {
//         Log.test(`AfterTest: ${this.currentTest.title}`);
//     });
//     it("Should run test queries", function () {
//                         describe("Dynamic InsightFacade PerformQuery tests", function () {
//                             for (const test of testQueries) {
//                                 it(`[${test.filename}] ${test.title}`, function () {
//                                     const futureResult: Promise<
//                                         any[]
//                                         > = insightFacade.performQuery(test.query);
//                                     return TestUtil.verifyQueryResult(futureResult, test);
//                                 });
//             }
//         });
//     });
// });
