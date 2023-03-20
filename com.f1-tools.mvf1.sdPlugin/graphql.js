/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

let url = 'http://127.0.0.1:10101/api/graphql';
let timeout_delay = 300;

$SD.onDidReceiveGlobalSettings(({ payload }) => {
    if (payload.settings.url && payload.settings.url !== '') {
        url = payload.settings.url;
    }
    if (payload.settings.timeout_delay && payload.settings.timeout_delay !== '') {
        timeout_delay = parseInt(payload.settings.timeout_delay) || 300;
    }
});
$SD.getGlobalSettings();

const base64Image = async function (img_url) {
    const image_promise = fetch(img_url);
    try {
        const response = await image_promise;
        const data = await response.arrayBuffer();
        return "data:image/png;base64," + btoa(String.fromCharCode(...new Uint8Array(data)));
    }
    catch (error) {
        $SD.logMessage("error: " + error);
        return error;
    }
}

const fetchTimeout = async function (data) {
    const abortController = new AbortController();
    const timeout = setTimeout(() => {
        abortController.abort();
    }, timeout_delay);
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