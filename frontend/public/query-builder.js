/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
coursesFields = ["dept", "id", "instructor", "title", "uuid", "avg", "pass", "fail", "audit", "year"];

roomsFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href", "lat", "lon", "seats"];

CampusExplorer.buildQuery = () => {
    let query = {};
    // TODO: implement!
    console.log("CampusExplorer.buildQuery not implemented yet.");
    console.log("Let's goooo");
    let active = document.getElementsByClassName("tab-panel active")[0];
    let datasetKind = active.getAttribute("data-type");
    console.log(datasetKind.toString());

    fields = [];
    if (datasetKind === "courses") {
        fields = coursesFields;
    }

    if (datasetKind === "rooms") {
        fields = roomsFields;
    }
    console.log(fields.toString());


    let where = {};
    let options = {};
    let transformations = {};
    let columns = [];
    let order = {};
    let group = [];
    let apply = [];

    where = buildWhere(datasetKind);

    query["WHERE"] = where;
    query["OPTIONS"] = options;
    options["COLUMNS"] = columns;

    if (!(order === null)) {
        options["ORDER"] = order;
    }

    if (!(group.length === 0)) {
        transformations["GROUP"] = group;
    }
    return query;
};

function buildWhere(datasetKind) {
    let a = document.getElementById("tab-" + datasetKind);
    console.log(a.toString());
}
