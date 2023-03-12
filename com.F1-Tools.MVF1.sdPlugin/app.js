/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

const graphql = require("./graphql");

const SyncToDialogue = new Action('com.F1-Tools.MVF1.SyncToDialogue');

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	console.log('Stream Deck connected!');
});

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
