// collection of graphQL queries

const graphql = require("./graphql");

graphql(`
    query Players {
        players {
            streamData {
                title
            }
            id
        }
    }
`).then((json) => {
    const players = json.data.players;
    const player = players.find((p) => p.streamData.title === "INTERNATIONAL" || p.streamData.title === "F1 LIVE");
    if (player) {
        graphql(`
            mutation PlayerSync($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
            }
        `, { playerSyncId: player.id }).then((json) => {
            console.log(json);
        });
    }
});