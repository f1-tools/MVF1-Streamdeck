/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

/// <reference path="graphql.js" />

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
	$SD.logMessage('Connected to Stream Deck');
	$SD.logMessage('actionInfo: ' + JSON.stringify(actionInfo));
	$SD.logMessage('appInfo: ' + JSON.stringify(appInfo));
	$SD.logMessage('connection: ' + JSON.stringify(connection));
	$SD.logMessage('messageType: ' + JSON.stringify(messageType));
	$SD.logMessage('port: ' + JSON.stringify(port));
	$SD.logMessage('uuid: ' + JSON.stringify(uuid));
	$SD.getGlobalSettings();
});

const connectionTester = async function(context, action) {
	$SD.getGlobalSettings();
	// $SD.logMessage('Testing connection to MVF1');
	const connected = await testMVF1Connection();
	if (!connected) {
		// $SD.logMessage('Not connected to MVF1. Check the url in global plugin settings.');
		$SD.sendToPropertyInspector(context, {"error": "Not connected to MVF1. Check the url in global plugin settings."}, action);
	} else {
		// $SD.logMessage('Successfully connected to the MVF1 app!');
		$SD.sendToPropertyInspector(context, {"message": "Successfully connected to the MVF1 app!"}, action);
	}
}

const SyncToDialogue = new Action('com.f1-tools.mvf1.sync-to-dialogue');
SyncToDialogue.onKeyUp(({ action, context, device, event, payload }) => {
	// $SD.logMessage('Syncing to dialogue');
	console.log("Syncing to dialogue");
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
				$SD.showOk(context);
			});
		} else {
			$SD.showAlert(context);
		}
	});
});
SyncToDialogue.onSendToPlugin(({ action, context, device, event, payload }) => {
	connectionTester(context, action);
});

const PlayPauseAll = new Action('com.f1-tools.mvf1.play-pause-all');
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
			});
		}
	});
});
PlayPauseAll.onSendToPlugin(({ action, context, device, event, payload }) => {
	connectionTester(context, action);
});

function seek(seconds) {
	graphql(`
		query Players {
			players {
				id
			}
		}
	`).then((json) => {
		const players = json.data.players;
		for (const player of players) {
			graphql(`
				mutation PlayerSeekTo($playerSeekToId: ID!, $relative: Float) {
					playerSeekTo(id: $playerSeekToId, relative: $relative)
			  	}
			`, { playerSeekToId: player.id, relative: seconds }).then((json) => {
			});
		}
	});
}

const RewindAll = new Action('com.f1-tools.mvf1.rewind-all');
RewindAll.isDown = false;
function rewind(seconds) {
	if (RewindAll.isDown) {
		setTimeout(() => {
			seek(-seconds);
			rewind(seconds);
		}, 200);
	}
}
RewindAll.onKeyDown(({ action, context, device, event, payload }) => {
	// get settings from payload
	const { settings } = payload;
	settings.rewindSeconds = parseInt(settings.rewindSeconds) || 10;

	// start rewinding
	RewindAll.isDown = true;
	rewind(settings.rewindSeconds);
});
RewindAll.onKeyUp(({ action, context, device, event, payload }) => {
	// stop rewinding
	RewindAll.isDown = false;
});
RewindAll.onSendToPlugin(({ action, context, device, event, payload }) => {
	connectionTester(context, action);
});

const FastForwardAll = new Action('com.f1-tools.mvf1.fast-forward-all');
FastForwardAll.isDown = false;
function fastForward(seconds) {
	if (FastForwardAll.isDown) {
		setTimeout(() => {
			seek(seconds);
			fastForward(seconds);
		}, 200);
	}
}
FastForwardAll.onKeyDown(({ action, context, device, event, payload }) => {
	// get settings from payload
	const { settings } = payload;
	settings.fastForwardSeconds = parseInt(settings.fastForwardSeconds) || 10;

	// start fast forwarding
	FastForwardAll.isDown = true;
	fastForward(settings.fastForwardSeconds);
});
FastForwardAll.onKeyUp(({ action, context, device, event, payload }) => {
	// stop fast forwarding
	FastForwardAll.isDown = false;
});
FastForwardAll.onSendToPlugin(({ action, context, device, event, payload }) => {
	connectionTester(context, action);
});

