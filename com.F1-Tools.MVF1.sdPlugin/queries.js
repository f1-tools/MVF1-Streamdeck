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

graphql(`
		query Players {
            players {
                streamData {
                    title
                }
			    id
                state {
                    paused
                }
            }
		}
	`).then((json) => {
        const commentary = json.data.players.find((p) => p.streamData.title === "INTERNATIONAL" || p.streamData.title === "F1 LIVE");
        let new_state = !commentary.state.paused || !json.data.players[0].state.paused;

		for (const player of json.data.players) {
			graphql(`
				mutation PlayerSetPaused($playerSetPausedId: ID!, $paused: Boolean) {
					playerSetPaused(id: $playerSetPausedId, paused: $paused)
				}
			`, { playerSetPausedId: player.id, paused: new_state }).then((json) => {
				console.log(json);
			});
		}
	});