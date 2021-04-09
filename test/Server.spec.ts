import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";
import * as fs from "fs-extra";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        Log.test(`Before all`);
        facade = new InsightFacade();
        server = new Server(4321);
        server.start().then(function (val: boolean) {
            Log.info("Server started: " + val);
        }).catch(function (err: Error) {
            Log.error("Server - ERROR: " + err.message);
        });
    });

    after(function () {
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

    it("PUT test for courses dataset -- response code on success", function () {
        this.timeout(3000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result[0]).to.be.equal("courses");
                })
                .catch(function (err) {
                    Log.error("PUT - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("PUT test for rooms dataset -- response code on success", function () {
        this.timeout(3000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.status).to.be.equal(200);
                    expect(res.body.result[0]).to.be.equal("rooms");
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

    it("PUT test -- two consecutive requests", function () {
        this.timeout(5000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        const ZIP_FILE_DATA2 = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("rooms");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .put("/dataset/courses/courses")
                        .send(ZIP_FILE_DATA2)
                        .set("Content-Type", "application/x-zip-compressed")
                        .then(function (res: Response) {
                            Log.info("PUT - SUCCESS");
                            expect(res.body.result[1]).to.be.equal("courses");
                        }).catch(function (err) {
                            Log.error("PUT - ERROR: " + err.message);
                            expect.fail();
                        });
                }).catch(function (err) {
                    Log.error("PUT - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("PUT test for rooms dataset -- response code on fail -- Invalid ID", function () {
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/_rooms_/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect.fail();
                }).catch(function (err) {
                    Log.error("PUT - ERROR: " + err.message);
                    expect(err.response.res.body).to.be.deep.equal({error: "Invalid id."});
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("ECHO- succeeds silently!", function () {
        chai.request("http://localhost:4321")
            .get("/echo/hello")
            .end(function (err, res) {
                Log.info("SUCCESS");
                expect(res.status).to.be.equal(200);
            });
    });

    it("GET test for courses Dataset, success code", function () {
        chai.request("http://localhost:4321")
            .get("/datasets")
            .then(function (res: Response) {
                Log.info("GET - SUCCESS");
                expect(res).to.have.status(200);
            });
    });

    it("GET test for courses Dataset, empty array", function () {
        chai.request("http://localhost:4321")
            .get("/datasets")
            .then(function (res: Response) {
                Log.info("GET - SUCCESS");
                expect(res.body.length).to.be.equal(0);
            });
    });

    it("GET test for courses Dataset, success code after after PUT", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("rooms");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .get("/datasets")
                        .then(function (res: Response) {
                            Log.info("GET - SUCCESS");
                            expect(res.body.result[0].id).to.be.equal("rooms");
                        }).catch(function (err) {
                            Log.error("GET EXPECT- ERROR: " + err.message);
                            expect.fail();
                        });
                }).catch(function (err) {
                    Log.error("GET - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("DELETE test for rooms dataset -- response code on success", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("rooms");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .del("/dataset/rooms")
                        .then(function (res: Response) {
                            Log.info("PUT - SUCCESS");
                            expect(res.body.result).to.be.equal("rooms");
                        }).catch(function (err) {
                            Log.error("DELETE EXPECT- ERROR: " + err.message);
                            expect.fail();
                        });
                }).catch(function (err) {
                    Log.error("DELETE - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("DELETE test for rooms dataset -- response code and body on InsightError", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("rooms");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .del("/dataset/_rooms")
                        .then(function (res: Response) {
                            Log.info("PUT - SUCCESS");
                            expect.fail();
                        }).catch(function (err) {
                            Log.error("DELETE - ERROR: " + err.message);
                            expect(err.status).to.be.equal(400);
                            expect(err.response.res.body).to.be.deep.equal({error: "Invalid id."});
                        });
                }).catch(function (err) {
                    Log.error("DELETE - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("DELETE test for rooms dataset -- response code and body on NotFoundError", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("rooms");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .del("/dataset/courses")
                        .then(function (res: Response) {
                            Log.info("PUT - SUCCESS");
                            expect.fail();
                        }).catch(function (err) {
                            Log.error("DELETE - ERROR: " + err.message);
                            expect(err.status).to.be.equal(404);
                            expect(err.response.res.body).to.be.deep.equal({error: "Dataset not found."});
                        });
                }).catch(function (err) {
                    Log.error("DELETE - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("POST test for courses dataset -- response code on success", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        const QUERY_JSON = JSON.stringify({
            WHERE: {
                GT: {
                    courses_avg: 97
                }
            },
            OPTIONS: {
                ORDER: "courses_avg",
                COLUMNS: [
                    "courses_dept",
                    "courses_avg"
                ]
            }
        });
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("courses");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .post("/query")
                        .send(QUERY_JSON)
                        .set("Content-Type", "application/json")
                        .then(function (res: Response) {
                            Log.info("POST - SUCCESS");
                            expect(res.status).to.be.equal(200);
                            expect(res.body.result.length).to.be.equal(49);
                        }).catch(function (err) {
                            Log.error("POST - ERROR: " + err.message);
                            expect.fail();
                        });
                }).catch(function (err) {
                    Log.error("POST - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

    it("POST test for courses dataset -- response code on fail", function () {
        this.timeout(10000);
        const ZIP_FILE_DATA = fs.readFileSync("./test/data/courses.zip");
        const QUERY_JSON = JSON.stringify({
            OPTIONS: {}
        });
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(ZIP_FILE_DATA)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    Log.info("PUT - SUCCESS");
                    expect(res.body.result[0]).to.be.equal("courses");
                }).then(() => {
                    return chai.request("http://localhost:4321")
                        .post("/query")
                        .send(QUERY_JSON)
                        .set("Content-Type", "application/json")
                        .then(function (res: Response) {
                            Log.info("POST - SUCCESS");
                            expect.fail();
                        }).catch(function (err) {
                            Log.error("POST - ERROR: " + err.message);
                            expect(err.status).to.be.equal(400);
                            expect(err.response.res.body).to.be.deep.equal({error: "Invalid query."});
                        });
                }).catch(function (err) {
                    Log.error("POST - ERROR: " + err.message);
                    expect.fail();
                });
        } catch (err) {
            Log.error("PUT - ERROR: " + err.message);
            expect.fail();
        }
    });

});
