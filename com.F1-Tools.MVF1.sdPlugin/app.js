/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

/// <reference path="graphql.js" />

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
});


const SyncToDialogue = new Action('com.F1-Tools.MVF1.SyncToDialogue');
SyncToDialogue.onKeyUp(({ action, context, device, event, payload }) => {
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
});

const PlayPauseAll = new Action('com.F1-Tools.MVF1.PlayPauseAll');
PlayPauseAll.onKeyUp(({ action, context, device, event, payload }) => {
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
});