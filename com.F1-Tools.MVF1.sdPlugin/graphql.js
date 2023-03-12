// take graphql query and return json using fetch

module.exports = async function (query, variables) {
    const response = await fetch('http://127.0.0.1:10101/api/graphql', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify({
            "query": query,
            "variables": variables
        })
    });
    const json = await response.json();
    return json;
}