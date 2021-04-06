import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as JSZip from "jszip";
import * as fs from "fs-extra";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        Log.test(`Before all`);
        facade = new InsightFacade();
        server = new Server(4321);
        // okTODO: start server here once and handle errors properly
        server.start().then(function (val: boolean) {
            Log.info("Server started: " + val);
        }).catch(function (err: Error) {
            Log.error("Server - ERROR: " + err.message);
        });
    });

    after(function () {
        // okTODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Sample on how to format PUT requests
    it("PUT test for courses dataset -- response code on success", function () {
        this.timeout(3000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.info("PUT - SUCCESS");
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.error("PUT - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    // // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
    it("PUT test for rooms dataset -- response code on success", function () {
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.info("PUT - SUCCESS");
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.error("PUT - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("PUT test for courses dataset -- response body on success", function () {
        this.timeout(3000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("courses");
                })
                .catch(function (err) {
                    Log.error("PUT - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("ECHO- succeeds silently!", function () {   // <= No done callback
        chai.request("http://localhost:4321")
            .get("/echo/hello")
            .end(function (err, res) {
                Log.info("SUCCESS");
                expect(res.status).to.be.equal(200);    // <= Test completes before this runs
            });
    });

    it("GET test for courses Dataset, success code", function () {
        chai.request("http://localhost:4321")
            .get("/datasets")
            .end(function (err, res) {
                expect(res).to.have.status(200);
            });
    });

    // it("GET test for courses Dataset, previous add", function () {
    //     const content = fs
    //         .readFileSync("./test/data/courses.zip")
    //         .toString("base64");
    //     return facade.addDataset("courses", content, InsightDatasetKind.Courses).then((reeee) => {
    //         chai.request("http://localhost:4321")
    //             .get("/datasets")
    //             .end(function (err, res) {
    //                 expect(res).to.have.status(200);
    //             });
    //     });
    // });
});
