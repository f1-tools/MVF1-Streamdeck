const url = 'http://192.168.48.1:10102/api/graphql';

const fetchTimeout = async function (data) {
    const abortController = new AbortController();
    const timeout = setTimeout(() => {
        abortController.abort();
    }, 300);
    const response_promise = fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify(data),
        signal: abortController.signal
    });
    try {
        const response = await response_promise;
        clearTimeout(timeout);
        console.log("graphql response: " + response.url);
        return response;
    }
    catch (error) {
        clearTimeout(timeout);
        return { errors: [error] };
    }
}

const graphql = async function (query, variables) {
    const fetch_promise = await fetchTimeout({
        "query": query,
        "variables": variables
    });
    try {
        const response = await fetch_promise;
        if (!response.ok) {
            console.log("graphql error2: " + response.statusText);
            return { errors: [response.statusText] };
        }
        const json = await response.json();
        console.log("graphql response: " + JSON.stringify(response));
        if (json.errors) {
            console.log("graphql error3: " + json.errors);
            return { errors: json.errors };
        }
        return json;
    } catch (error) {
        console.log("graphql error4: " + error);
        return { errors: [error] };
    }
}

const testMVF1Connection = async function () {
    const result = await graphql(`
		query SystemInfo {
			systemInfo {
				arch
				platform
			}
			version
		}
	`);
    try {
        const response = await result;
        if (response.errors) {
            console.log("graphql error4: " + response.errors);
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
}

// testMVF1Connection().then((result) => {
//     console.log("result: " + result);
// });


// fetch(url)
//     .then((response) => {
//         if (response.ok) {
//             return response.arrayBuffer();
//         }
//         throw new Error('Network response was not ok.');
//     })
//     .then((data) => {
//         return "data:image/png;base64," + Buffer.from(data).toString('base64');
//     });