/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

/// <reference path="graphql.js" />

const ADDITIONAL_LIST = ['INTERNATIONAL', 'F1 LIVE', 'TRACKER', 'DATA', 'Next Page'];
const ICON_LIST = [
    'actions/assets/google_icons/public',
    'actions/assets/google_icons/videocam',
    'actions/assets/google_icons/location_on',
    'actions/assets/google_icons/query_stats',
	'actions/assets/google_icons/skip_next',
];
let devices = {};
let driver_images = {
	'INTERNATIONAL': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAN6SURBVGhD7ViBkeIwDPR9BdABHUAHQAUHFQAVQAeUwFABXAVABUAFQAVABdAB583bvCwriZP4j2HmdmYnjpJYlizJjj+UUg/Nt8Ufc31b/BrwakTLgVqtpobDoWo2m6rRaCT3uAL3+10dj8fkerlc1NfXV3KNBRhQinqQj+l0+jgcDo+i2G63ybdSvwUpCjNpB3673cxwqmE2m4l6AikKU9npdB7n89mojgc4o9friTpzKApFTiaTqF5frVbm7h9KhJUodIiQWSwWRkUcWG/rxPdmFPnBx5BBUegw9uAxi7pCOTrgeYoCRojCJxE2sZEWJggrisBwEoUJMc2xYh5AX3AIQlLSB/LZzkvs1IUMC5GeRtVqtYwkHFiwRqORufsLupjlQSe30gNP2ni/Xq8n7TR4VoE8JosASSn1WYQ0sXNCyRdiiquETgwDUJ0spKQn9IVVvA/EMAAMnAVfiBJWBbEM4LMgvaPpCnTSmk/KI7D8BZHOghRG3v+A3uuYVj5QVZbLpcN+v6/m87l5ozrW67VpqWdl4nAsonUYC0tWMsf0dBppPmLvxJ97M4D6b7Hf71W32w2q3f8Lp9PJtNTzB4nCM4AuXAgR8JVGQL9FkAEUdtCvNCJEpxNTNOb5ngUVqsoCB+D7orlDITx3BfT/FgPmz2MYAWSsrA7xnoW0vnghRKeMJrRFrHAKLdd0DJJOzwCaNDShKX4yJ2jiBhlwvV5NS6l2u21aPn7KiMFgYFpK7XY703LhxBQS1wKxzp9zls0J7HOk/jjpVkLKSU1P4HyU90cE0k1XKEIMgG4LFBfpHXEdoPsPXfJMKx0xjwkpxuOxaaWHD+BZRcMISJm6J3HYVRTY12A9APE975N6HyGaUXZFobOJytvfc4PLAIO0jkJ/dD3KWfhEYdIJzQVpJ0hZ5oCXwzqKHq/AMIyF6yMUhQl5aGQlHqa4TDXi4I7AMYykj1AUPskPm7KMgKfwfozZANCXpIdRFDrkh7B5XqH7l7KAzpzQsRSFHrkR8HJaZahqAA4VAgcPikKRPJwAyLghVQxAfwUGD4rCVNL6TAGv2ZqOclgUKAABCStRFOYy1qk1Bg7DC3qdUhQGEUqhnK4XoUAO4du0PArlh2lUBn5QdOioz8/P5F4PLCG225bYM2EbvtlsnP+OKohmwKuQeSrxDvg14LVQ6hujqipLack+BQAAAABJRU5ErkJggg==',
	'F1 LIVE': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAGcSURBVGhD7ZiNjYMwDIXDTcAIjNgNGKErsEG7QdmgI5QN6AZc3DPo2Qkc9+OkSPmkp4b3FLBbJVAq59zkdVg++POwlAZyUxrITWkgN9EG2rZ19/vdTdOURI/H43XN30I3skWn08mfMw90bV3PDknDfxt8uvSM4yhq2aPgUcKfh0fOVRXF9vzlmmUXyk1pIAV1XbvL5eL8ImdHsqxoEqIzKyE688VPvnhOozVJA9GZlRD0dfEE5ixpIDqzEjJ7seIJnMeSBqIzKyF0vFY8oed6SQPRmZWQreKJyHxpIDqzErJVPKHnvt2jxHfomsqNLDelgf+m73se7WdZ0SREZ1ZC6Ph2u/FRiJ7rJQ1EZ1ZCZm+tCZzHkgaiMysh6MeawJwlDURnVkJ0ppvQuZc0EJ1ZCYnl2EQklwaiMyshsZxETay8tZAGojMrIbF8VtM0gfd2z0LltcrRCBoYhoFHXz9tCs08n08e7Sdo4Hq98ig9Xdfx6Ge8VjOqbVv/xaSDtsfz+fz6OxmrZ0vBLnQ0yi6Um9JAbkoDuTl4A859As9ebjHhWyEkAAAAAElFTkSuQmCC',
	'TRACKER': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMfSURBVGhD7VqLjeowEPRdBZRAB0AFQAVAB5QAFVACJUAHQAXQAXQAHUAHeZ5g5y1mkqzzETqJkUaXGzbOrr27sRE/xpjE8s/i1/39s/gG8Gk0VgOdTsf0+30zHA7NaDRK/+92u+lnj8fDXC4Xc7vdzOFwMKfTKdWbAgKoTOtosl6vk/v9nsQA99gA6ZiRpGIpqzoeAmOw8SNIxULC+d1u51z4j/P5nKxWq8SmUGLTKbUDMdPT6TT9DDYhoNVYDSrmEo5dr1f36CeOx2OqM3tG2G42G3f3E1hJBM7sS0hFSsySTBlcz+dzaqshVkUC48VMhCMV34hUkMuPh8EBZhtDOCwnBauLZzHbHFLxjSg2j6ac90QQEkgvZpdDKr4wTJ3FYkHt6jBMp4iipuILZcGhYJlNE5SdLWIVqJgR+Shnv2KnUDFMJWUtUDGjXFoUMbNpkrJFazpc6Wau1+u5KxO1h7E5bGzwxjqR7Yk02O/37sqk+yoNaGSeMi+1nQczJ9MO0L4vKqw4FTPK3q95yYQdS0LTWZD3HhiH2UiWppAd0F09t8Vl8FtpBqRU02g8AI1NEeT9eRMhURpA7IB5hY5xcKgpgyx4HIDKEBWAppvAfjabuf+egLZcLlVdLHbFSwOQD51MJu6qGGiFg8EgdRocj8dmu926T4shn6FZMYBWt6dsa5quUJfYqngo2zYVM9oldcM9oX0XVCG2KR6YLE3btaTiC+Vmrs3thHxp4prZEFLxhZgJiTZWQc4+ELFppOIb5ey0UQsy9yNmH6TiG8NaaODrkIw4IHlgciLPxVSkxNciEk2cDcIzMZ7B7ApIxVyGB3usDLPTEPfK8XBdYTwq5jIs6DpdKayryNTxpGIh5csNqHJOlnkP1PiigIqlDL9Ziynq0PmaDYGKKsoUADSnrvC0homoU0eWVFRTFiFQFETofMWiDUlFNcNOArAgUDctOA9SMYplQbCZV27UNKRiNFkQKFawRedBKlYiC0KiBedBKtai3Jh5QGso50NSsTZli23R+aTVnxrYzpMe0nFG1hzQq+D7W4lP4xvAZ2HMPwpmcjXCV4YzAAAAAElFTkSuQmCC',
	'DATA': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAMxSURBVGhD7VqBjeIwEMx9BZRAB1ACJVACJUAFlAAdUAJ0AB1AB9ABdJDPBDtMNuPEfHLCSD/SiGTjOLvr8a51up8sy/KCX4s/7vdr8T+AT+OrAhiPx9loNHJ3L2ATJ8/FYpHf7/ccmE6n/Kw+MEUWWa+cBxAMPa8PTpGbzca5nufX67UMiJ7XB6fG+XzuXH/CZB+s3SRFZPp8PjvX83y/36txDUMyXK/XzvW83ANm83o2DEkQzvLGXS6XclxBafwoIZ3j8ehcz8trs3GZ0vhRItseWIXZbCbHOUrjYMTHsflQTdRzy6Lb1qSDfaDGEaVxEMJ5RmAT1ohgPUTNV5TG3rQ6BuCQGuuJGs/okI6nNPYm65gRqiYImKWD7qvGCUpjL1od25VQUuo4LrRRGiVjJ2Udo5NaOVkpRRwX2iiNDaIaIKsdNbnhjNcx3mGwlCKOC22UxhqtUwhCjYOT7IzVMTILG4JSScB3ID9r76A0VrROeahM2bNL20oNSGmsaJ1isFbfOLtURIADBCmNJZVTu93O3T3hOyxv0pDEQMyJpGBV/dz4xYpGdF1FaSzJTrFk2A5wCYQzoQaEBHBCFNreD1Aay495YFKu3aF9AYQaEJdWD8wbCuiNUto0xhyoEATqOSPUgDgZAFYQCfFj8Qsp2vk4aS1sGlnnbV0RH2CorNlkYIVC84EsT9vwAqwbQo0oRASBgENVh5MB59qcB/GcA46Q0usGL7c1on8ha99XrC5y6Y6oTK8bfhFZ6MpWDFnXsV2WVaAapuHzAlLgpQtJ4h0iAR6YW41R5L0FRagxntUfd4vsVH84PRwO2Xa7La/74PF4lAQwt5+/C/DF43a7uSuNKoDT6VQ6jt/VauWs/XG5XNxVlhXScFftmEwm7qo7AEAuzVC0XVqNYaLqsZQjeoE0DkbsA97IbaUUzvPYiA0MSuOghGMMZBgVD3ZkGFUHK8WZB9BD1HyG0jg47XEiFhG9SBp/hcg2S0QBErNH9o4gpPFXCclAQnAWdR5ah5O8Yd8IQhqTYGQQDUNSjAiidpMkbRDmTFUfnCo5CNPc6gNTpu8bbPtxF1+LL/9fiSz7C7owQY6CE5eAAAAAAElFTkSuQmCC',
	'Next Page': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAHdSURBVGhD7ZmBbcIwEEXTTsAIjMAIjMAIjMAGjMAIjMAIjMAIjAAbpHyI1V/rcUmIqFvJT3qKcj+oOccxRv1omqa9+W/57I7/ltpAaWoDpakNlKY2UJraQGn+TAObzaa5XC7341i0mRvkYrFod7tdO5/PMZ/i7eZboSPlgVhEz+fz/Y8INULXvKpDeSAW0ZzT6XR/KnTtWB3KA7GIPuM2b/H6MTqUB2IRjdDTmPJuOJQHYhF1NHV00znr9Ro/26dDeSAWUSfVttttV/nmeDy2s9nsx2f7dCgPxCLqeF1Pw1cooeVwzNNwKA/EIupQrqU1Z+hy61AeiEXUoVzS09D5crnE65MO5YFYRB3K3f1+3135oO8b1qH8mW/ZC91e4OZ6vXZnD3Su+jvAzkiHcqmpki+vGv3VaoXXJx3KA7GIOnmmZVMvbNqUJYYuqQ7lgVhEHa/Tl5oaGbPFcCgPxCLqpJpukkZ97LbCoTwQi6ijaXE4HLqzB2nUh0yZXIfyQCyiDo36lK21Q3kgFlFiyqi7DuWBWERz9OL2LY9DdSgPxCKa/6ScOuquQ3kgFlHNcW0R+vY1r5jQlKQ8EIu/rn5X6OY1QJQ/s/6PrDS1gdLUBkpTGyhNbaA0tYGyNM0XqX6IceQhwJ0AAAAASUVORK5CYII='
};

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(
    ({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
        // initialize the device storage objects
        for (const device of appInfo.devices) {
            devices[device.id] = {
                ...device,
            };
        }
        // initialize the driver image storage objects
        graphql(`
            query LiveTimingState {
                liveTimingState {
                    DriverList
                }
            }
        `).then((result) => {
            const driverList = result.data.liveTimingState.DriverList;
            for (const driver of Object.values(driverList)) {
                base64Image(driver.HeadshotUrl).then((base64ImageData) => {
                    driver_images[driver.HeadshotUrl] = base64ImageData;
                });
            }
        });

        $SD.logMessage('Connected to Stream Deck');
        $SD.logMessage('actionInfo: ' + JSON.stringify(actionInfo));
        $SD.logMessage('appInfo: ' + JSON.stringify(appInfo));
        $SD.logMessage('connection: ' + JSON.stringify(connection));
        $SD.logMessage('messageType: ' + JSON.stringify(messageType));
        $SD.logMessage('port: ' + JSON.stringify(port));
        $SD.logMessage('uuid: ' + JSON.stringify(uuid));
        $SD.getGlobalSettings();
    }
);

const connectionTester = async function (context, action) {
    $SD.getGlobalSettings();
    const connected = await testMVF1Connection();
    if (!connected) {
        $SD.sendToPropertyInspector(
            context,
            {
                error: 'Not connected to MVF1. Check the url in global plugin settings.',
            },
            action
        );
    } else {
        $SD.sendToPropertyInspector(
            context,
            { message: 'Successfully connected to the MVF1 app!' },
            action
        );
    }
};

function Syncer(playerId) {
    $SD.logMessage('Syncing to player ' + playerId);
    graphql(
        `
            mutation PlayerSync($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
            }
        `,
        { playerSyncId: playerId }
    ).then((json) => {});
}

function SyncStreams() {
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
        const player = players.find(
            (p) =>
                p.streamData.title === 'INTERNATIONAL' ||
                p.streamData.title === 'F1 LIVE'
        );
        if (player) {
            Syncer(player.id);
        }
    });
}

const SyncToDialogue = new Action('com.f1-tools.mvf1.sync-to-dialogue');
SyncToDialogue.onKeyUp(({ action, context, device, event, payload }) => {
    SyncStreams();
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
        const commentary = json.data.players.find(
            (p) =>
                p.streamData.title === 'INTERNATIONAL' ||
                p.streamData.title === 'F1 LIVE'
        );
        let new_state =
            !commentary.state.paused || !json.data.players[0].state.paused;

        for (const player of json.data.players) {
            graphql(
                `
                    mutation PlayerSetPaused(
                        $playerSetPausedId: ID!
                        $paused: Boolean
                    ) {
                        playerSetPaused(id: $playerSetPausedId, paused: $paused)
                    }
                `,
                { playerSetPausedId: player.id, paused: new_state }
            ).then((json) => {});
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
            graphql(
                `
                    mutation PlayerSeekTo(
                        $playerSeekToId: ID!
                        $relative: Float
                    ) {
                        playerSeekTo(id: $playerSeekToId, relative: $relative)
                    }
                `,
                { playerSeekToId: player.id, relative: seconds }
            ).then((json) => {});
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

const SpeedometerAll = new Action('com.f1-tools.mvf1.speedometers-all');
SpeedometerAll.onKeyUp(({ action, context, device, event, payload }) => {
    graphql(`
        query Players {
            players {
                id
                type
            }
        }
    `).then((json) => {
        const players = json.data.players;
        for (const player of players) {
            if (player.type === 'OBC') {
                graphql(
                    `
                        mutation PlayerSetSpeedometerVisibility(
                            $playerSetSpeedometerVisibilityId: ID!
                        ) {
                            playerSetSpeedometerVisibility(
                                id: $playerSetSpeedometerVisibilityId
                            )
                        }
                    `,
                    { playerSetSpeedometerVisibilityId: player.id }
                ).then((json) => {});
            }
        }
    });
});
SpeedometerAll.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

// Everything below this is with multi-profile actions

let multi_action_device_data = {};
const multi_action_data = {
    sorted_drivers: [],
    tiles: {
        pages: [],
    },
    tile_caller: '',
    tile_caller_payload: {},
    page: 0,
};

function exitTileScreen(device) {
    $SD.switchToProfile(device);
}

// iter: number of times we have waited for the player to sync
// id: id of the new player we want to wait for to sync
// oldPlayer: the player we have replaced
// oldest_id: the id of the oldest player
function waitToSync(iter, id, oldPlayer, oldest_id) {
    if (iter > 100) { // 10 seconds
        console.log('waitToSync timed out - MV issue');
        $SD.logMessage('waitToSync timed out - MV issue');
        return;
    }
    graphql(
        `
            query Player($playerId: ID!) {
                player(id: $playerId) {
                    state {
                        currentTime
                        interpolatedCurrentTime
                    }
                }
            }
        `,
        { playerId: id }
    ).then((json) => {
        let ct = null;
        let interpolatedCurrentTime = null;
        try {
            ct = json.data.player.state.currentTime || null;
            interpolatedCurrentTime = json.data.player.state.interpolatedCurrentTime || null; 
        } catch (e) {
            $SD.logMessage("not a bug, a timing \"feature\": ", e);
        }
        $SD.logMessage('CT: ' + ct);

        // if the player is not ready, wait and try again
        if ((ct == null || ct == 0 || ct == undefined) &&
            (interpolatedCurrentTime == null || interpolatedCurrentTime == 0 || interpolatedCurrentTime == undefined)) {
            setTimeout(() => {
                waitToSync(iter + 1, id, oldPlayer, oldest_id);
            }, 100);
        } else {
            // set volume and mute to match old player
            graphql(
                `
                    mutation PlayerSetMuted(
                        $playerSetMutedId: ID!
                        $muted: Boolean
                        $playerSetVolumeId: ID!
                        $volume: Float!
                    ) {
                        playerSetMuted(id: $playerSetMutedId, muted: $muted)
                        playerSetVolume(id: $playerSetVolumeId, volume: $volume)
                    }
                `,
                {
                    playerSetMutedId: id,
                    muted: oldPlayer.state.muted,
                    playerSetVolumeId: id,
                    volume: oldPlayer.state.volume,
                }
            ).then((json) => {
                Syncer(oldest_id);
            })
            .catch((error) => {
                console.log('Error with setting mute or volume', error)
            });
        }
    });
}

// TLA: boolean true if onboard cam, false if map, data, etc
function swapPlayer(oldPlayer, newPlayer, TLA, oldest_id) {
    if (TLA) {
        graphql_slow( // TODO: this sucks and should be fixed
            `
			mutation PlayerCreate($input: PlayerCreateInput!, $playerDeleteId: ID!) {
				playerCreate(input: $input)
				playerDelete(id: $playerDeleteId)
			}
		`,
            {
                input: {
                    alwaysOnTop: oldPlayer.alwaysOnTop,
                    bounds: {
                        x: oldPlayer.bounds.x,
                        y: oldPlayer.bounds.y,
                        width: oldPlayer.bounds.width,
                        height: oldPlayer.bounds.height,
                    },
                    driverTla: newPlayer,
                    maintainAspectRatio: oldPlayer.maintainAspectRatio,
                    fullscreen: oldPlayer.fullscreen,
                    contentId: oldPlayer.streamData.contentId,
                },
                playerDeleteId: oldPlayer.id,
            }
        ).then((json) => {
            waitToSync(0, json.data.playerCreate, oldPlayer, oldest_id);
        });
    } else if (!TLA) {
        graphql_slow( //TODO: This is a bad code, we should not use slow here
            `
			mutation PlayerCreate($input: PlayerCreateInput!, $playerDeleteId: ID!) {
				playerCreate(input: $input)
				playerDelete(id: $playerDeleteId)
			}
		`,
            {
                input: {
                    alwaysOnTop: oldPlayer.alwaysOnTop,
                    bounds: {
                        x: oldPlayer.bounds.x,
                        y: oldPlayer.bounds.y,
                        width: oldPlayer.bounds.width,
                        height: oldPlayer.bounds.height,
                    },
                    streamTitle: newPlayer,
                    maintainAspectRatio: oldPlayer.maintainAspectRatio,
                    fullscreen: oldPlayer.fullscreen,
                    contentId: oldPlayer.streamData.contentId,
                },
                playerDeleteId: oldPlayer.id,
            }
        ).then((json) => {
            waitToSync(0, json.data.playerCreate, oldPlayer, oldest_id);
        });
    } else {
        $SD.logMessage('No new player TLA or title provided');
    }
}

function doTileAction(device, driver) {
    if (multi_action_device_data[device].tile_caller === '') {
        exitTileScreen(device);
        return;
    }
    else if (driver.type === 'EMPTY') {
	exitTileScreen(device);
	return;
    }

    let defined_id = !(driver.id === '');
    let exit_func = true;

    if (
        defined_id &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.fullscreen'
    ) {
        graphql(
            `
                mutation PlayerSetFullscreen($playerSetFullscreenId: ID!) {
                    playerSetFullscreen(id: $playerSetFullscreenId)
                }
            `,
            { playerSetFullscreenId: driver.id }
        );
    } else if (
        defined_id &&
        driver.type === 'OBC' &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.speedometer'
    ) {
        graphql(
            `
                mutation PlayerSetSpeedometerVisibility(
                    $playerSetSpeedometerVisibilityId: ID!
                ) {
                    playerSetSpeedometerVisibility(
                        id: $playerSetSpeedometerVisibilityId
                    )
                }
            `,
            { playerSetSpeedometerVisibilityId: driver.id }
        );
    } else if (
        defined_id &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.toggle-mute'
    ) {
        graphql(
            `
                mutation PlayerSetMuted($playerSetMutedId: ID!) {
                    playerSetMuted(id: $playerSetMutedId)
                }
            `,
            { playerSetMutedId: driver.id }
        );
    } else if (
        defined_id &&
        driver.type === 'OBC' &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.driver-header'
    ) {
        let options = ['NONE', 'OBC_LIVE_TIMING', 'DRIVER_HEADER'];
        let mode = Math.floor(Math.random() * 3); // don't come at me with this trust me its the easiest way, not the best, but easiest way
        graphql(
            `
                mutation PlayerSetDriverHeaderMode(
                    $playerSetDriverHeaderModeId: ID!
                    $mode: DriverHeaderMode!
                ) {
                    playerSetDriverHeaderMode(
                        id: $playerSetDriverHeaderModeId
                        mode: $mode
                    )
                }
            `,
            { playerSetDriverHeaderModeId: driver.id, mode: options[mode] }
        );
    } else if (
        defined_id &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.always-on-top'
    ) {
        graphql(
            `
                mutation PlayerSetAlwaysOnTop($playerSetAlwaysOnTopId: ID!) {
                    playerSetAlwaysOnTop(id: $playerSetAlwaysOnTopId)
                }
            `,
            { playerSetAlwaysOnTopId: driver.id }
        );
    } else if (
        defined_id &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.volume-down'
    ) {
        graphql(
            `
                query State($playerId: ID!) {
                    player(id: $playerId) {
                        state {
                            volume
                        }
                    }
                }
            `,
            { playerId: driver.id }
        ).then((json) => {
            let volume = parseInt(json.data.player.state.volume);
            let volumeDown = 5;
            try {
                const { settings } =
                    multi_action_device_data[device].tile_caller_payload;
                volumeDown = parseInt(settings.volumeDown) || 5;
            } catch (e) {}
            volume -= volumeDown;
            if (volume < 0) {
                volume = 0;
            }
            graphql(
                `
                    mutation PlayerSetVolume(
                        $volume: Float!
                        $playerSetVolumeId: ID!
                    ) {
                        playerSetVolume(volume: $volume, id: $playerSetVolumeId)
                    }
                `,
                { playerSetVolumeId: driver.id, volume: volume }
            );
        });
    } else if (
        defined_id &&
        multi_action_device_data[device].tile_caller ===
            'com.f1-tools.mvf1.volume-up'
    ) {
        graphql(
            `
                query State($playerId: ID!) {
                    player(id: $playerId) {
                        state {
                            volume
                        }
                    }
                }
            `,
            { playerId: driver.id }
        ).then((json) => {
            let volume = parseInt(json.data.player.state.volume);
            let volumeUp = 5;
            try {
                const { settings } =
                    multi_action_device_data[device].tile_caller_payload;
                volumeUp = parseInt(settings.volumeUp) || 5;
            } catch (e) {}
            volume += volumeUp;
            if (volume > 100) {
                volume = 100;
            }
            graphql(
                `
                    mutation PlayerSetVolume(
                        $volume: Float!
                        $playerSetVolumeId: ID!
                    ) {
                        playerSetVolume(volume: $volume, id: $playerSetVolumeId)
                    }
                `,
                { playerSetVolumeId: driver.id, volume: volume }
            );
        });
    } else if (
        multi_action_device_data[device].tile_caller ===
        'com.f1-tools.mvf1.swap-feeds'
    ) {
        exit_func = false;
        if (
            multi_action_device_data[device].tile_caller_payload.settings !==
                undefined &&
            multi_action_device_data[device].tile_caller_payload.settings
                .feed1 !== undefined
        ) {
            exit_func = true;
            let player1 =
                multi_action_device_data[device].tile_caller_payload.settings
                    .feed1;
            let player2 = driver;

            // determine which player is currently playing
            graphql(`
                query Players {
                    players {
                        bounds {
                            x
                            y
                            width
                            height
                        }
                        id
                        fullscreen
                        alwaysOnTop
                        maintainAspectRatio
                        state {
                            muted
                            volume
                        }
                        streamData {
                            title
                            contentId
                        }
                    }
                }
            `).then((json) => {
                let player1_playing = false;
                let player2_playing = false;
                for (let i = 0; i < json.data.players.length; i++) {
                    if (json.data.players[i].id === player1.id) {
                        player1_playing = true;
                        player1 = json.data.players[i];
                    } else if (json.data.players[i].id === player2.id) {
                        player2_playing = true;
                        player2 = json.data.players[i];
                    }
                }

                let oldest_id = null;
                for (let i = 0; i < json.data.players.length; i++) {
                    if (
                        json.data.players[i].id !== player1.id &&
                        json.data.players[i].id !== player2.id
                    ) {
                        if (
                            oldest_id === null ||
                            parseInt(json.data.players[i].id) < oldest_id
                        ) {
                            oldest_id = parseInt(json.data.players[i].id);
                        }
                    }
                }

                if (!player1_playing && !player2_playing) {
                    exitTileScreen(device);
                } else if (player1_playing && !player2_playing) {
                    // player 1 is playing, player 2 is not
                    let is_tla = player2.type === 'OBC';
                    swapPlayer(player1, player2.tla, is_tla, oldest_id);
                } else if (!player1_playing && player2_playing) {
                    // player 2 is playing, player 1 is not
                    let is_tla = player1.type === 'OBC';
                    swapPlayer(player2, player1.tla, is_tla, oldest_id);
                } else {
                    // both players are playing
                    // TODO: should we not run a swap if the two players are the same?
                    // for now, no until #12 is fixed on MV side
                    swapPlayer(
                        player1,
                        player2.streamData.title,
                        false,
                        oldest_id
                    );
                    swapPlayer(
                        player2,
                        player1.streamData.title,
                        false,
                        oldest_id
                    );
                }
            });
        } else {
            multi_action_device_data[device].tile_caller_payload = {
                settings: {
                    feed1: driver,
                },
            };
        }
    }

    if (exit_func) {
        exitTileScreen(device);
    }
}

const showPlayerTiles = function (device, caller_uuid, payload) {
    multi_action_device_data[device] = {};
    let new_data = multi_action_data;
    new_data.tile_caller = caller_uuid;
    new_data.tile_caller_payload = payload;
    // get list of all drivers for the current session
    graphql(`
        query LiveTimingState {
            liveTimingState {
                DriverList
            }
            players {
                driverData {
                    tla
                }
                id
                type
                streamData {
                    title
                }
            }
        }
    `).then((json) => {
        const drivers = json.data.liveTimingState.DriverList;
        let driver_list = {};
        for (const driver of Object.values(drivers)) {
            driver_list[driver.Tla] = {
                number: driver.RacingNumber,
                tla: driver.Tla,
                firstName: driver.FirstName,
                lastName: driver.LastName,
                teamName: driver.TeamName,
                headshot: driver_images[driver.HeadshotUrl],
                place: driver.Line,
                id: '',
                type: 'OBC',
                context: '',
            };
            base64Image(driver.HeadshotUrl).then((base64ImageData) => {
                driver_images[driver.HeadshotUrl] = base64ImageData;
            });
        }
        const players = json.data.players;
        for (const player of players) {
            if (player.type === 'OBC') {
                const tla = player.driverData.tla;
                driver_list[tla].id = player.id;
            } else {
                driver_list[player.streamData.title] = {
                    type: 'ADDITIONAL',
                    tla: player.streamData.title,
                    id: player.id,
                    context: '',
                    headshot: driver_images[player.streamData.title],
                };
            }
        }

        // if any of the ADDITIONAL_LIST items are not in the driver_list, add them
        for (const additional of ADDITIONAL_LIST) {
            if (!(additional in driver_list) && additional !== 'Next Page') {
                driver_list[additional] = {
                    type: 'ADDITIONAL',
                    tla: additional,
                    id: '',
                    context: '',
                    headshot: driver_images[additional],
                };
            }
        }

        // sort the drivers_list by the following:
        // first have all of type ADDITIONAL sorted by id
        // then sort by those with id's by Place
        // then sort by those without id's by Place

        sorted_drivers = [];

        for (const driver1 in driver_list) {
            if (driver_list[driver1].type === 'ADDITIONAL') {
                sorted_drivers.push(driver_list[driver1]);
            }
        }
        for (const driver in driver_list) {
            if (
                driver_list[driver].type === 'OBC' &&
                driver_list[driver].id !== ''
            ) {
                sorted_drivers.push(driver_list[driver]);
            }
        }

        let remaining_drivers = [];
        for (const driver in driver_list) {
            if (
                driver_list[driver].type === 'OBC' &&
                driver_list[driver].id === ''
            ) {
                remaining_drivers.push(driver_list[driver]);
            }
        }
        remaining_drivers.sort((a, b) => (a.place > b.place ? 1 : -1));
        sorted_drivers = sorted_drivers.concat(remaining_drivers);

        // stream deck has 3 rows and 5 columns
        // stream deck mini has 2 rows and 3 columns
        // stream deck xl has 4 rows and 8 columns
        // stream deck mobile has 3 rows and 5 columns
        // stream deck plus has 2 rows and 4 columns

        let aval_rows = devices[device].size.rows;
        let aval_cols = devices[device].size.columns;

        let num_tiles = aval_rows * aval_cols - 1;

        let num_pages = Math.ceil(24 / num_tiles);

        // go through the sorted drivers and create a tile for each one
        for (let j = 0; j < num_pages; j++) {
            for (let i = 0; i < num_tiles; i++) {
                let driver = sorted_drivers[i + j * num_tiles];
                if (driver === undefined) {
                    // On the first page add empty tiles to prevent undefined tiles from causing problems(#16) 
                    // when the number of drivers is fewer than the number on the first page. 
                    if (j > 0) {
                        break;
                    }
                    driver = {
                        tla: '',
                        headshot: '',
                        context: '',
                        type: 'EMPTY',
                        id: '',
                    };
	            }
                let row = Math.floor(i / aval_cols) % aval_rows;
                let col = i % aval_cols;

                // if this is the first tile on the page, create a new page
                if (i % num_tiles === 0) {
                    new_data.tiles.pages.push({});
                }

                // add the tile to the page
                new_data.tiles.pages[j][`${row}:${col}`] = driver;
            }
            // set bottom right tile to be the next page
            new_data.tiles.pages[j][`${aval_rows - 1}:${aval_cols - 1}`] = {
                tla: 'Next Page',
                headshot: driver_images['Next Page'],
                page: j + 1,
                type: 'NEXT_PAGE',
                context: '',
                id: '',
            };
            // need to set headshot to base64 encoded next page image

            // if last page, set bottom right tile to be the first page
            if (j === num_pages - 1) {
                new_data.tiles.pages[j][
                    `${aval_rows - 1}:${aval_cols - 1}`
                ].page = 0;
            }
        }

        // save the data for the multi action
        multi_action_device_data[device] = new_data;

        // Switch to profile or say that the device type is not supported 
        if (devices[device].type == 0) {
            $SD.switchToProfile(device, 'MVF1 Player Picker');
        } else if (devices[device].type == 1) {
            $SD.switchToProfile(device, 'MVF1 Player Picker - Mini');
        } else if (devices[device].type == 2) {
            $SD.switchToProfile(device, 'MVF1 Player Picker - XL');
        } else if (devices[device].type == 3) {
            $SD.logMessage("Device type not supported: Mobile/" + devices[device].type);
        } else if (devices[device].type == 4) {
            $SD.logMessage("Device type not supported: Gkeys/" + devices[device].type);
        } else if (devices[device].type == 5) {
            $SD.logMessage("Device type not supported: Stream Deck Pedals/" + devices[device].type);
        } else if (devices[device].type == 6) {
            $SD.logMessage("Device type not supported: Voyager/" + devices[device].type);
        } else if (devices[device].type == 7) {
            $SD.switchToProfile(device, 'MVF1 Player Picker - Plus');
        } else {
            $SD.logMessage("Device type not supported: " + devices[device].type);
        }
        updateProfileIcons(device, 0);
    });
};

function updateProfileIcons(device, target_page) {
    multi_action_device_data[device].page = target_page;
    let aval_rows = devices[device].size.rows;
    let aval_cols = devices[device].size.columns;
    let num_tiles = aval_rows * aval_cols - 1;

    for (let i = 0; i < num_tiles + 1; i++) {
        let row = Math.floor(i / aval_cols) % aval_rows;
        let col = i % aval_cols;

        let new_driver = null;
        try {
            new_driver =
                multi_action_device_data[device].tiles.pages[target_page][
                    `${row}:${col}`
                ];
        } catch (e) {
            new_driver = {
                tla: 'Clear',
                headshot: '',
                context:
                    multi_action_device_data[device].tiles.pages[0][
                        `${row}:${col}`
                    ].context,
            };
        }
        if (
            new_driver === undefined ||
            new_driver === null ||
            new_driver === '' // ||
            // new_driver === {} ||
            // new_driver === []
        ) {
            new_driver = {
                tla: '',
                headshot: '',
                context:
                    multi_action_device_data[device].tiles.pages[0][
                        `${row}:${col}`
                    ].context,
            };
        }

        if (new_driver.context !== undefined && new_driver.context !== '' && new_driver.context !== null) {
            $SD.setTitle(new_driver.context, new_driver.tla);
            $SD.setImage(new_driver.context, new_driver.headshot);
        } else {
            $SD.logMessage('Error setting title or image for tile due to no context. TLA: ' + new_driver.tla);
        }
    }
}

const PlayerTile = new Action('com.f1-tools.mvf1.player-tile');
PlayerTile.onWillAppear(({ action, context, device, event, payload }) => {
    const page_num = multi_action_device_data[device].page;
    const coord_string =
        payload.coordinates.row + ':' + payload.coordinates.column;
    const driver =
        multi_action_device_data[device].tiles.pages[page_num][coord_string];

    // set the tile's context to the driver's id
    multi_action_device_data[device].tiles.pages[page_num][
        coord_string
    ].context = context;

    // set the same context for matching coordinates on other pages
    for (const page in multi_action_device_data[device].tiles.pages) {
        if (
            multi_action_device_data[device].tiles.pages[page][coord_string] !==
            undefined
        ) {
            multi_action_device_data[device].tiles.pages[page][
                coord_string
            ].context = context;
        }
    }

    // set the tile's title to the driver's name
    $SD.setTitle(context, driver.tla);
    // set the tile's image to the driver's headshot
    $SD.setImage(context, driver.headshot);
});
PlayerTile.onKeyDown(({ action, context, device, event, payload }) => {
    const page_num = multi_action_device_data[device].page;
    const coord_string =
        payload.coordinates.row + ':' + payload.coordinates.column;
    let driver = null;
    try {
        driver =
            multi_action_device_data[device].tiles.pages[page_num][
                coord_string
            ];
    } catch (e) {
        driver = {
            tla: '',
            headshot: '',
            context:
                multi_action_device_data[device].tiles.pages[0][coord_string]
                    .context,
            type: 'EMPTY',
            id: '',
        };
    }

    if (
        driver === undefined ||
        driver === null ||
        driver === '' // ||
        // driver === {} ||
        // driver === []
    ) {
        // if the tile is empty, go back to the profile
        updateProfileIcons(device, 0);
        $SD.switchToProfile(device);
    } else if (driver.type === 'NEXT_PAGE') {
        updateProfileIcons(device, driver.page);
    } else {
        // do action based on caller_uuid
        updateProfileIcons(device, 0);
        doTileAction(device, driver);
    }
});
PlayerTile.onWillDisappear(({ action, context, device, event, payload }) => {
    updateProfileIcons(device, 0);
    $SD.setTitle(context, '');
    $SD.setImage(context, '');
});
PlayerTile.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const Fullscreen = new Action('com.f1-tools.mvf1.fullscreen');
Fullscreen.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
Fullscreen.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const Speedometer = new Action('com.f1-tools.mvf1.speedometer');
Speedometer.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
Speedometer.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const DriverHeader = new Action('com.f1-tools.mvf1.driver-header');
DriverHeader.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
DriverHeader.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const ToggleMute = new Action('com.f1-tools.mvf1.toggle-mute');
ToggleMute.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
ToggleMute.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const AlwaysOnTop = new Action('com.f1-tools.mvf1.always-on-top');
AlwaysOnTop.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
AlwaysOnTop.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const VolumeUp = new Action('com.f1-tools.mvf1.volume-up');
VolumeUp.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
VolumeUp.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const VolumeDown = new Action('com.f1-tools.mvf1.volume-down');
VolumeDown.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
VolumeDown.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});

const SwapFeeds = new Action('com.f1-tools.mvf1.swap-feeds');
SwapFeeds.onKeyUp(({ action, context, device, event, payload }) => {
    showPlayerTiles(device, action, payload);
});
SwapFeeds.onSendToPlugin(({ action, context, device, event, payload }) => {
    connectionTester(context, action);
});
