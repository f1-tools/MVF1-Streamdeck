/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

let url = 'http://127.0.0.1:10101/api/graphql';

$SD.onDidReceiveGlobalSettings(({ payload }) => {
    url = payload.settings.url;
});
$SD.getGlobalSettings();

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
            return { errors: [response.statusText] };
        }
        const json = await response.json();
        if (json.errors) {
            return { errors: json.errors };
        }
        return json;
    } catch (error) {
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
            return false;
        }
        return true;
    }
    catch (error) {
        return false;
    }
}