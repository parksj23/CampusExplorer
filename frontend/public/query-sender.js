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
            request.setRequestHeader("Content-Type", "application/json");

            request.onload = (() => {
                // let result = JSON.parse(request.responseText);
                let result = request.response;
                if (request.status === 200) {
                    resolve(result);
                } else {
                    reject(result);
                }
            });

            request.onerror = (() => {
                reject("Failed.");
            });

            try {
                request.send(JSON.stringify(query));
            } catch (err) {
                reject(err);
            }
        } catch (err) {
            reject (err);
        }
    });
};
