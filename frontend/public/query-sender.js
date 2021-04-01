/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        try {
            let request = new XMLHttpRequest();
            request.open("POST", "/query", true);
            request.setRequestHeader("Content-Type", "application/JSON");

            request.onload = (() => {
                let result = JSON.parse(request.responseText);
                console.log(result);
                if (request.status = 200) {
                    return resolve(result);
                } else {
                    return reject(result);
                }
            });

            request.onerror = (() => {
                reject("The request cannot be made.");
            });

            request.send(JSON.stringify(query));
        } catch (err) {
            reject (err);
        }
    });
};
