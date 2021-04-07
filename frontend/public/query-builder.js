/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
coursesFields = ["dept", "id", "instructor", "title", "uuid", "avg", "pass", "fail", "audit", "year"];

roomsFields = ["fullname", "shortname", "number", "name", "address", "type", "furniture", "href", "lat", "lon", "seats"];

mfields = ["avg", "pass", "fail", "audit", "year", "lat", "lon", "seats"];

CampusExplorer.buildQuery = () => {
    try {
        let query = {};
        let active = document.getElementsByClassName("tab-panel active")[0];
        let datasetKind = active.getAttribute("data-type");

        fields = [];
        if (datasetKind === "courses") {
            fields = coursesFields;
        }

        if (datasetKind === "rooms") {
            fields = roomsFields;
        }

        let where = {};
        let options = {};
        let transformations = {};
        let columns = [];
        let order = {};
        let group = [];
        let apply = [];

        where = buildWhere(datasetKind);
        columns = buildColumns(datasetKind);
        order = buildOrder(datasetKind);
        group = buildGroup(datasetKind);
        apply = buildApply(datasetKind);

        query["WHERE"] = where;

        if (!(order === null) || !(order.keys.length < 0)) {
            query["OPTIONS"] = {
                COLUMNS: columns,
                ORDER: order
            };
        } else {
            query["OPTIONS"] = {
                COLUMNS: columns
            };
        }

        if (group.length > 0) {
            transformations = {
                GROUP: group,
                APPLY: apply
            }
            query["TRANSFORMATIONS"] = transformations;
        }

        return query;
    } catch (err) {
        return err;
    }
};

function buildWhere(datasetKind) {
    let active = document.getElementsByClassName("tab-panel active")[0];
    let condition = active.querySelector("input[checked]").id;

    if (condition.includes("all")) {
        condition = "AND";
    }

    if (condition.includes("any")) {
        condition = "OR";
    }

    if (condition.includes("none")) {
        condition = "NONE"; // OR and then NOT
    }

    let filters = getFilters(datasetKind);

    if (filters.length === 0) {
        return {};
    }

    if (filters.length === 1) {
        return filters[0];
    }

    if (condition === "AND") {
        return {AND: filters};
    }

    if (condition === "OR") {
        return {OR: filters};
    }

    if (condition === "NONE") {
        let orNot = {OR: filters};
        return {NOT: orNot};
    }
    return {};
}

function getFilters(datasetKind) {
    let filters = [];
    let active = document.getElementsByClassName("tab-panel active")[0];
    let condPanel = active.getElementsByClassName("form-group conditions")[0];
    let conditions = condPanel.getElementsByClassName("conditions-container")[0].children;

    for (let cond of conditions) {
        let isNotChecked = cond.getElementsByClassName("control not")[0].getElementsByTagName("input")[0].checked;

        // Get the dropdown smfield
        let smfield = "";
        let key = "";
        for (let field of cond.getElementsByClassName("control fields")[0].getElementsByTagName("option")) {
            if (field.selected) {
                smfield = field.value;
                key = datasetKind + "_" + smfield;
            }
        }

        // Get the dropdown logical operator (GT, LT, EQ, IS)
        let logicOp = "";
        for (let op of cond.getElementsByClassName("control operators")[0].getElementsByTagName("option")) {
            if (op.selected) {
                logicOp = op.value;
            }
        }

        // Get the input term that the user inputs as the filter they want
        let input = cond.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;
        if (mfields.includes(smfield)) {
            input = parseFloat(input);
        }

        // Decide on result
        let result = {};
        let outFilter = {};
        let inFilter = {};
        inFilter[key] = input;
        outFilter[logicOp] = inFilter;

        if (!isNotChecked) {
            result = outFilter;
        }

        if (isNotChecked) {
            let not = {};
            not["NOT"] = outFilter;
            result = not;
        }
        filters.push(result);
    }
    return filters;
}

function buildColumns(datasetKind) {
    let finalColumns = [];
    let active = document.getElementsByClassName("tab-panel active")[0];
    let columnsPanel = active.getElementsByClassName("form-group columns")[0];
    let columnInputs = columnsPanel.getElementsByClassName("control-group")[0].getElementsByTagName("input");

    for (let input of columnInputs) {
        if (input.checked) {
            if (fields.includes(input.value)) { // regular key
                let finalField = datasetKind + "_" + input.value;
                finalColumns.push(finalField);
            } else { // applykey
                finalColumns.push(input.value);
            }
        }
    }
    return finalColumns;
}

function buildOrder(datasetKind) {
    let orderArray = [];
    let active = document.getElementsByClassName("tab-panel active")[0];
    let orderPanel = active.getElementsByClassName("form-group order")[0];
    let orderMenu = orderPanel.getElementsByClassName("control order fields")[0].children[0];

    for (let item of orderMenu) {
        if (item.selected) {
            if (fields.includes(item.value)) { // regular key
                let finalField = datasetKind + "_" + item.value;
                orderArray.push(finalField);
            } else { // applykey
                orderArray.push(item.value);
            }
        }
    }

    let descendingButton = orderPanel.getElementsByClassName("control descending")[0]
        .getElementsByTagName("input")[0];
    let isDescendingSelected = descendingButton.checked;

    switch (orderArray.length) {
        case 0: {
            return [];
            break;
        }

        // case 1: {
        //     if (!isDescendingSelected) {
        //         // return orderArray[0];
        //         let dir = "UP";
        //         return {
        //             dir: dir,
        //             keys: orderArray
        //         }
        //     }
        //
        //     if (isDescendingSelected) {
        //         let dir = "DOWN";
        //         return {
        //             dir: dir,
        //             keys: orderArray
        //         }
        //     }
        //     break;
        // }

        default: {
            if (!isDescendingSelected) {
                let dir = "UP";
                return {
                    dir: dir,
                    keys: orderArray
                }
            }

            if (isDescendingSelected) {
                let dir = "DOWN";
                return {
                    dir: dir,
                    keys: orderArray
                }
            }
            break;
        }
    }
    return [];
}

function buildGroup(datasetKind) {
    let groupArray = [];
    let active = document.getElementsByClassName("tab-panel active")[0];
    let groupsPanel = active.getElementsByClassName("form-group groups")[0];
    let groupInputs = groupsPanel.getElementsByClassName("control-group")[0].getElementsByTagName("input");

    for (let input of groupInputs) {
        if (input.checked) {
            let finalField = datasetKind + "_" + input.value;
            groupArray.push(finalField);
        }
    }
    return groupArray;
}

function buildApply(datasetKind) {
    let applyArray = [];
    let active = document.getElementsByClassName("tab-panel active")[0];
    let transformationsPanel = active.getElementsByClassName("transformations-container")[0];
    let applyInputs = transformationsPanel.children;

    for (let input of applyInputs) {
        // Get the applykey that the user inputted
        let applykey = input.getElementsByClassName("control term")[0].getElementsByTagName("input")[0].value;

        // Get the dropdown token
        let applytokens = input.getElementsByClassName("control operators")[0].getElementsByTagName("option");
        let applytoken = "";
        for (let token of applytokens) {
            if (token.selected) {
                applytoken = token.value;
            }
        }

        // Get the dropdown smfield
        let smfields = input.getElementsByClassName("control fields")[0].getElementsByTagName("option");
        let key = "";
        for (let field of smfields) {
            if (field.selected) {
                key = datasetKind + "_" + field.value;
            }
        }

        // Make the apply object and push onto apply array
        let applyOuterObj = {};
        let applyInnerObj = {};
        applyInnerObj[applytoken] = key;
        applyOuterObj[applykey] = applyInnerObj;
        applyArray.push(applyOuterObj);
    }
    return applyArray;
}
