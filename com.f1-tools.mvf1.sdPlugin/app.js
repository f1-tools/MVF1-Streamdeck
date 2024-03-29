/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

/// <reference path="graphql.js" />

const ADDITIONAL_LIST = ['INTERNATIONAL', 'F1 LIVE', 'TRACKER', 'DATA', 'Next Page'];
const ICON_LIST = [
    'actions/assets/PNG/globe',
    'actions/assets/PNG/cam',
    'actions/assets/PNG/track_map',
    'actions/assets/PNG/data',
	'actions/assets/PNG/next',
];
let devices = {};
let driver_images = {
	'INTERNATIONAL': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAABxAAAAcQEcP4B3AAACiklEQVRYhe2YwXXcIBCGBz/foxJcgjowriBbQtKBO4g62KSCTQebVKB1BY4r2O1A6eDLQbBCCBCCTQ55/i96D2bg18wwMyDyjjqoUkWgEREtIq2IPJrhB/O9mO+LiPwSkZNS6nfpXluJaeDIdhwB/TeJtUCfYuDJN8AO2ANnR6wH2luT63JMtLLGqyfe3YJYs2a1DQSHgErPGMvF5Py/riEYw2sRSTZYroKgtWq/lVxWzAWgMwmeGQ+d66Uul1xbSA7gOZPgzhlvmCy5fropcK2DqKuYHxLtze3W9K2griAHCTcBn1JyTIbRS+1JqKRCuEi6CHhgjO+FHJMVjzHlppLca4pcDpgqzjXt3DnzunL9b5X6IiI/zFfbAZdgTX08KaW+V+hb/PS53DuTj1KOl1JF405LyLZkVy73C40JJ6PwJiIfRCSa40TkI/B1S89niH1ZWXemcAbOifm16jIwZoGOjL6PdJ1f8sgguDVHDkQqS8ZaQYI9xAs+5WnoiNetMObDFK4V5S5EJETQxNcpwv9i5i6BuZ2I9O66SqmLiHyOGSMIphjTCZmWeU0dfHlG9/UBqxwC6+0jFuxCm9tSs1/5kRYTryRKG/DsbBiVjfzMLiRoYyx6ULbCIbnccJIJZYdwh83ULOgbkjysWNonGG4WjLA9/tta8Aowv5KuG8eJiahbbkju4JFbNwxTyz9EY6GeWEO498xrWJy4KLsSpol1hO/IXUgn+nhkzK1lfPx52tgI7GXZvjWBMYuTUuopd327iXslzLYkUz7NRbmXmD99DGQcHJaBn0JfTM7btPMWTSXeUHyF0FUT8zb2n9/OjLVUWyswv1qmrHbb5zeP6D99wPz/noDf4eEPHyrbWYG1A+kAAAAASUVORK5CYII=',
	'F1 LIVE': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAABxAAAAcQEcP4B3AAABwklEQVRYhe2Y/1HCMBTHv/EcoCN0hLpB3QAnQCeQEXQCzgnQCXAD2QCdADbgnODjH0mlxpTEQol6fO56ND/o+/YlvLyHdOLEzwAqoMhlvARqXwBQADO+sgTqYwmrgBdPwKwR6sR0MRpaXAlsOowvgckOcQCboQX6S9eHuq/9s4Q5wy5RhBSBWUkRuIiMv0bG18aY2DP6gw0rXaywIWawX7HpEDWTVLa6Kkmh4Lt2V+HmdI23ud/LoxGPHYJ5wGYJhF5Q5wmanyW99X5jy622K9AE91I2QozlvA9cGGN272nfg3sKa5459bzYtWdr/7vHCjPvXju4nCFyxcFHSVeSLmITU/bgoVkYY26aRmwX/YuTJCs5lrgCppKeUibn8GAhaSJp6a6d/P0lBu4Uz2hijFv3C2PMpQvKY9nTJL3I8k+SAXgJ2BwBk5CermxmnvhW7Sxmre+ZS4gHY8xzwrz94WvB9C1LyQ7bQ7/5zFOwh8DWymCrvmt3H9xHWWCbQo2waT9ANK4dDWw9smm1505kmVHWp5iREzPd1ZcNtv82VF7/Bljl0tWIKLqEtITXh7LX5ywuZQP0Q2Cs6UtO6U+c+O18AIqOCnpI+14XAAAAAElFTkSuQmCC',
	'TRACKER': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAABxAAAAcQEcP4B3AAACvklEQVRYhe1Y0Y3bMAx9Kvp/GkEbnDeoukE2qDtBcxM0G2QEpxNcNohvgstN4HSCpBOwH6IQmpYcJbVT4HAPMGBLFPkkUqRk4APvHGZO5UTkACwAPAJw3PwCYG+M2c5pexREZImooXEciaj+H+QqIuoukJNoxvRN6mIisgA6AFZ1tQiufUBwuVP9G2PM9ym5JEFEz2p1dhyHWs6ziyX83OScMvh8Qb5SJF/nJrhWG0C7OTVmqSZVaZlPE3KUyrfGmJMgUjPpThHfjOiYnKDEb/X9DWHjOAB1bORJtELOaUVzEdTYZ97vB96x2dzGO9epNqtisJ6T4EoZc3OM+ReC16YZq9LMbjZywmijSPoR2XWp7JQE9aokk++1qz01SZ18lwmZ3d1iL0OyE8Z7VYXCbpZY35VchkQj+rLk701Sn2yqEvffk6DeCDvqb6CuRM/nQmMW57tFhVBXB4UdoYyd+Hnj7yjnlWzRAXX0RE3h+PMDosALtIk2TSKH1hjztVA2DeqXoY5CYvUlQc3u9axDx2LUt6Rb04sI5t7Niw0v2ehrwnCMtR2TW/CYWDWONMyBTcmk9eyjskq0x0Nnikx8ugzpjkk6YWMl9B2ptNSJ1VuJNi8UreiCa6jvYr1i0iOWzqF0vKQ3DooDfKJtUTTLoc5IJK6YU/2DRYkYO1FLJfF+8bNolgp8tD+MiIz19UEh48clt9xmqb8pXjmmVuxKn9DjKcRtQ/3YrRP2Yv9AT46k3HW1aF9SfveO4chEndAl448oc2jIJmoeEGvlAcAW4fdFa4w58WwdPw8YVpY9gD8s3wq9DufkbxHC58kYs7mKICvzCFfGWnUd+HkR75BEeLwsi48IlcZx9wlh0k/yDn0VQWHIsvIvbMyXjMugBfAL6nKfw81/t9hVDufDQ8rNB4RL/Anhp2V7q70PvFv8BQps+u1fT9xGAAAAAElFTkSuQmCC',
	'DATA': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAABxAAAAcQEcP4B3AAACeUlEQVRYhc1Y0YGbMAwVnYANygbNCB7hRmCDXjfIBmkn8AjXDbhOQDegG6Sd4N1H5CJk2TiAL/e+wMjWsyRLMkQfEABOAAYA7tFcTDA5ABg+PZqMBoCeiBy//nocEwMAWgATZnQ5QZcUqEfwLMj5lNAFS4wATu9ArlN6XY7cxM8hWK8A2soEB0Fuyu1gkmQAeB5/rkjOKev1OaFzYvylIkFpvYW3rDTzWb0H4T+VyHU0pxUioh9N0/xNCU/Birid5CfekR20xxD0KetZwidBSMM+9sv5dx0kNoDEpWRSh/kEe15kLCFZsgmWcyruArqyrcULtmskWWnWRbz5l60e2kUSwDN/6zPkLFxTc/aSPKtvnsfHxFyd667gw3gIOUXS64UFcTOWhIUDuaqVKYKyTnQasazxQ+m6Rf2gZRH13amh3hCTDcfvEr1EhQSJyCNfi3W30xqB34nnf4V61yGC+5qyJOIWLXKj+uaOJDisxQ7spPv/sOBWoSSO6S9h567I1QlyAKciqBRzCDle2BtKF642rDOq9x7LVj5uRjeSS2V+QCRjJiChE7ImXZxiiPKn+Kt4/klE38X7CXMl+SLGX5umeSWib2qtTSkmCdyqhWy7OsRXQmD+AxBwEWtoywbsvzpgGTNS6Wq8qXVChyPhjiAYLBXVTEVeI1KOuAnu9pKTrjHdYVgOQDp94BYiY07mHoLBesl0YLgaSLRZYk6LkpZ+ZRF5R3hakdWu3tcRFxIcWFlRrsLyBFe72AdlMsEW1UqOrarXUqksXGbuchW4U67FKygJZW1TK747+AsUeCZ4rqpoC5D4q/VhINJF/2guJjjD39UCvSfeAPFTwuUUAJ+/AAAAAElFTkSuQmCC',
	'Next Page': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAABxAAAAcQEcP4B3AAAAd0lEQVRYhe3YsQ2AMAxEUYtJGIVRMgqbMGJG+JQRhAZjlFi611v6krszE2mAFdiBbXTLI6DSlNE9HXpldNMFUBQZQZFRFBlFkVEUGUWRUbJEHrfA+uZ++SsshalfrDgvxXkpzktxXorzUtwXU8eZ5Zjf5h4wJaMT77i5qyCzaMMAAAAASUVORK5CYII='
};
const driver_header_options = ['NONE', 'OBC_LIVE_TIMING', 'DRIVER_HEADER'];
let driver_header_mode = {};

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
        // there's no way to know the current driver header mode for the given player,
        // so let's loop through the available options, starting at the second option.
        if (driver_header_mode[driver.id] === undefined){
            driver_header_mode[driver.id]=1;
        } else if (driver_header_mode[driver.id] + 1 >= driver_header_options.length){
            driver_header_mode[driver.id]=0;
        } else {
            driver_header_mode[driver.id]++;
        }
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
            { playerSetDriverHeaderModeId: driver.id, mode: driver_header_options[driver_header_mode[driver.id]] }
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
