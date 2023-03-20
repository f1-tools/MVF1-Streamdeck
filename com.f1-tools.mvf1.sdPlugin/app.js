/// <reference path="libs/js/action.js" />
/// <reference path="libs/js/stream-deck.js" />

/// <reference path="graphql.js" />

const ADDITIONAL_LIST = ["INTERNATIONAL", "F1 LIVE", "TRACKER", "DATA"];
let devices = {};
let driver_images = {};

/**
 * The first event fired when Stream Deck starts
 */
$SD.onConnected(({ actionInfo, appInfo, connection, messageType, port, uuid }) => {
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
	// TODO: convert ADDITIONAL_LIST images to base64 and store in driver_images

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
	const connected = await testMVF1Connection();
	if (!connected) {
		$SD.sendToPropertyInspector(context, {"error": "Not connected to MVF1. Check the url in global plugin settings."}, action);
	} else {
		$SD.sendToPropertyInspector(context, {"message": "Successfully connected to the MVF1 app!"}, action);
	}
}

function Syncer(playerId) {
	graphql(`
		mutation PlayerSync($playerSyncId: ID!) {
			playerSync(id: $playerSyncId)
		}
	`, { playerSyncId: playerId }).then((json) => {
		$SD.showOk(context);
	});
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
		const player = players.find((p) => p.streamData.title === "INTERNATIONAL" || p.streamData.title === "F1 LIVE");
		if (player) {
			Syncer(player.id);
		} else {
			$SD.showAlert(context);
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
			if (player.type === "OBC") {
				graphql(`
					mutation PlayerSetSpeedometerVisibility($playerSetSpeedometerVisibilityId: ID!) {
						playerSetSpeedometerVisibility(id: $playerSetSpeedometerVisibilityId)
					}
				`, { playerSetSpeedometerVisibilityId: player.id}).then((json) => {
				});
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
		pages: []
	},
	tile_caller: "",
	tile_caller_payload: {},
	page: 0
};

function exitTileScreen(device) {
	$SD.switchToProfile(device);
	// multi_action_device_data[device] = {};
}

function swapPlayer(oldPlayer, newPlayer, TLA, fn) {
	if (TLA) {
		graphql(`
			mutation PlayerCreate($input: PlayerCreateInput!, $playerDeleteId: ID!) {
				playerCreate(input: $input)
				playerDelete(id: $playerDeleteId)
			}
		`, { 
			input: {
				alwaysOnTop: oldPlayer.alwaysOnTop,
				bounds: {
					x: oldPlayer.bounds.x,
					y: oldPlayer.bounds.y,
					width: oldPlayer.bounds.width,
					height: oldPlayer.bounds.height
				},
				driverTla: newPlayer,
				maintainAspectRatio: oldPlayer.maintainAspectRatio,
				fullscreen: oldPlayer.fullscreen,
				contentId: oldPlayer.streamData.contentId,
			}, 
			playerDeleteId: oldPlayer.id 
		}).then((json) => {
			fn();
		});
	} else if (!TLA) {
		graphql(`
			mutation PlayerCreate($input: PlayerCreateInput!, $playerDeleteId: ID!) {
				playerCreate(input: $input)
				playerDelete(id: $playerDeleteId)
			}
		`, { 
			input: {
				alwaysOnTop: oldPlayer.alwaysOnTop,
				bounds: {
					x: oldPlayer.bounds.x,
					y: oldPlayer.bounds.y,
					width: oldPlayer.bounds.width,
					height: oldPlayer.bounds.height
				},
				streamTitle: newPlayer,
				maintainAspectRatio: oldPlayer.maintainAspectRatio,
				fullscreen: oldPlayer.fullscreen,
				contentId: oldPlayer.streamData.contentId,
			}, 
			playerDeleteId: oldPlayer.id 
		}).then((json) => {
			fn();
		});
	} else {
		$SD.logMessage("No new player TLA or title provided");
	}
}

function doTileAction(device, driver) {
	if (multi_action_device_data[device].tile_caller === "") {
		exitTileScreen(device);
		return;
	}

	let defined_id = !(driver.id === "");
	let exit_func = true;

	if (defined_id && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.fullscreen") {
		graphql(`
			mutation PlayerSetFullscreen($playerSetFullscreenId: ID!) {
				playerSetFullscreen(id: $playerSetFullscreenId)
		  	}
		`, { playerSetFullscreenId: driver.id });
	} else if (defined_id && driver.type === "OBC" && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.speedometer") {
		graphql(`
			mutation PlayerSetSpeedometerVisibility($playerSetSpeedometerVisibilityId: ID!) {
				playerSetSpeedometerVisibility(id: $playerSetSpeedometerVisibilityId)
		  	}
		`, { playerSetSpeedometerVisibilityId: driver.id });
	} else if (defined_id && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.toggle-mute") {
		graphql(`
			mutation PlayerSetMuted($playerSetMutedId: ID!) {
				playerSetMuted(id: $playerSetMutedId)
		  	}
		`, { playerSetMutedId: driver.id });
	} else if (defined_id && driver.type === "OBC" && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.driver-header") {
		graphql(`
			mutation PlayerSetDriverHeaderMode($playerSetDriverHeaderModeId: ID!, $mode: DriverHeaderMode!) {
				playerSetDriverHeaderMode(id: $playerSetDriverHeaderModeId, mode: $mode)
			}
		`, { playerSetDriverHeaderModeId: driver.id, mode: "NONE" });
	} else if (defined_id && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.always-on-top") {
		graphql(`
			mutation PlayerSetAlwaysOnTop($playerSetAlwaysOnTopId: ID!) {
				playerSetAlwaysOnTop(id: $playerSetAlwaysOnTopId)
			}
		`, { playerSetAlwaysOnTopId: driver.id });
	} else if (defined_id && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.volume-down") {
		graphql(`
			query State($playerId: ID!) {
				player(id: $playerId) {
					state {
						volume
					}
				}
			}
		`, { playerId: driver.id }).then((json) => {
			let volume = parseInt(json.data.player.state.volume);
			let volumeDown = 5;
			try {
				const { settings } = multi_action_device_data[device].tile_caller_payload;
				volumeDown = parseInt(settings.volumeDown) || 5;
			} catch (e) {}
			volume -= volumeDown;
			if (volume < 0) {
				volume = 0;
			}
			graphql(`
				mutation PlayerSetVolume($volume: Float!, $playerSetVolumeId: ID!) {
					playerSetVolume(volume: $volume, id: $playerSetVolumeId)
				}
			`, { playerSetVolumeId: driver.id, volume: volume });
		});
	} else if (defined_id && multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.volume-up") {
		graphql(`
			query State($playerId: ID!) {
				player(id: $playerId) {
					state {
						volume
					}
				}
			}
		`, { playerId: driver.id }).then((json) => {
			let volume = parseInt(json.data.player.state.volume);
			let volumeUp = 5;
			try {
				const { settings } = multi_action_device_data[device].tile_caller_payload;
				volumeUp = parseInt(settings.volumeUp) || 5;
			} catch (e) {}
			volume += volumeUp;
			if (volume > 100) {
				volume = 100;
			}
			graphql(`
				mutation PlayerSetVolume($volume: Float!, $playerSetVolumeId: ID!) {
					playerSetVolume(volume: $volume, id: $playerSetVolumeId)
				}
			`, { playerSetVolumeId: driver.id, volume: volume });
		});
	} else if (multi_action_device_data[device].tile_caller === "com.f1-tools.mvf1.swap-feeds") {
		exit_func = false;
		if (multi_action_device_data[device].tile_caller_payload.settings !== undefined && multi_action_device_data[device].tile_caller_payload.settings.feed1 !== undefined) {
			exit_func = true;
			let player1 = multi_action_device_data[device].tile_caller_payload.settings.feed1;
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
					if (json.data.players[i].id !== player1.id && json.data.players[i].id !== player2.id) {
						if (oldest_id === null || json.data.players[i].id < oldest_id) {
							oldest_id = json.data.players[i].id;
						}
					}
				}

				if (!player1_playing && !player2_playing) {
					exitTileScreen(device);
				} else if (player1_playing && !player2_playing) {
					// player 1 is playing, player 2 is not
					let is_tla = player2.type === "OBC";
					swapPlayer(player1, player2.tla, is_tla, Syncer(oldest_id));
				} else if (!player1_playing && player2_playing) {
					// player 2 is playing, player 1 is not
					let is_tla = player1.type === "OBC";
					swapPlayer(player2, player1.tla, is_tla, Syncer(oldest_id));
				} else {
					// both players are playing
					swapPlayer(player1, player2.streamData.title, false, Syncer(oldest_id));
					swapPlayer(player2, player1.streamData.title, false, Syncer(oldest_id));
				}
			});
		} else {
			multi_action_device_data[device].tile_caller_payload = {
				settings: {
					feed1: driver,
				}
			};
		}
	}
	
	if (exit_func) {
		exitTileScreen(device);
	}
}

const showPlayerTiles = function(device, caller_uuid, payload) {
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
				"number": driver.RacingNumber,
				"tla": driver.Tla,
				"firstName": driver.FirstName,
				"lastName": driver.LastName,
				"teamName": driver.TeamName,
				"headshot": driver_images[driver.HeadshotUrl],
				"place": driver.Line,
				"id": "",
				"type": "OBC",
				"context": ""
			};
			base64Image(driver.HeadshotUrl)
			.then((base64ImageData) => {
				driver_images[driver.HeadshotUrl] = base64ImageData;
			});
		}
		const players = json.data.players;
		for (const player of players) {
			if (player.type === "OBC") {
				const tla = player.driverData.tla;
				driver_list[tla].id = player.id;
			} else {
				driver_list[player.streamData.title] = {
					"type": "ADDITIONAL",
					"tla": player.streamData.title,
					"id": player.id,
					"context": "",
					"headshot": player.streamData.title
				}
			}
		}

		// if any of the ADDITIONAL_LIST items are not in the driver_list, add them
		for (const additional of ADDITIONAL_LIST) {
			if (!(additional in driver_list)) {
				driver_list[additional] = {
					"type": "ADDITIONAL",
					"tla": additional,
					"id": "",
					"context": "",
					"headshot": additional
				}
			}
		}

		// sort the drivers_list by the following:
		// first have all of type ADDITIONAL sorted by id
		// then sort by those with id's by Place
		// then sort by those without id's by Place

		sorted_drivers = [];

		for (const driver1 in driver_list) {
			if (driver_list[driver1].type === "ADDITIONAL") {
				sorted_drivers.push(driver_list[driver1]);
			}
		}
		for (const driver in driver_list) {
			if (driver_list[driver].type === "OBC" && driver_list[driver].id !== "") {
				sorted_drivers.push(driver_list[driver]);
			}
		}

		let remaining_drivers = [];
		for (const driver in driver_list) {
			if (driver_list[driver].type === "OBC" && driver_list[driver].id === "") {
				remaining_drivers.push(driver_list[driver]);
			}
		}
		remaining_drivers.sort((a, b) => (a.place > b.place) ? 1 : -1);
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
		for (let j=0; j < num_pages; j++) {
			for (let i = 0; i < num_tiles; i++) {
				let driver = sorted_drivers[i + j * num_tiles];
				if (driver === undefined) {
					break;
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
				"tla": "Next Page",
				"headshot": "",
				"page": j + 1,
				"type": "NEXT_PAGE",
				"context": "",
				"id": ""
			};
			// need to set headshot to base64 encoded next page image

			// if last page, set bottom right tile to be the first page
			if (j === num_pages - 1) {
				new_data.tiles.pages[j][`${aval_rows - 1}:${aval_cols - 1}`].page = 0;
			}
		}

		// save the data for the multi action
		multi_action_device_data[device] = new_data;

		$SD.switchToProfile(device, 'MVF1 Player Picker');
		updateProfileIcons(device, 0);
	});
}

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
			new_driver = multi_action_device_data[device].tiles.pages[target_page][`${row}:${col}`];
		} catch (e) {
			new_driver = {
				"tla": "Clear",
				"headshot": "",
				"context": multi_action_device_data[device].tiles.pages[0][`${row}:${col}`].context
			};
		}
		if (new_driver === undefined || new_driver === null || new_driver === "" || new_driver === {} || new_driver === []) {
			new_driver = {
				"tla": "",
				"headshot": "",
				"context": multi_action_device_data[device].tiles.pages[0][`${row}:${col}`].context
			};
		}

		$SD.setTitle(new_driver.context, new_driver.tla);
		$SD.setImage(new_driver.context, new_driver.headshot);
	}
}

const PlayerTile = new Action('com.f1-tools.mvf1.player-tile');
PlayerTile.onWillAppear(({ action, context, device, event, payload }) => {
	const page_num = multi_action_device_data[device].page;
	const coord_string = payload.coordinates.row + ":" + payload.coordinates.column;
	const driver = multi_action_device_data[device].tiles.pages[page_num][coord_string];

	// set the tile's context to the driver's id
	multi_action_device_data[device].tiles.pages[page_num][coord_string].context = context;

	// set the same context for matching coordinates on other pages
	for (const page in multi_action_device_data[device].tiles.pages) {
		if (multi_action_device_data[device].tiles.pages[page][coord_string] !== undefined) {
			multi_action_device_data[device].tiles.pages[page][coord_string].context = context;
		}
	}

	// set the tile's title to the driver's name
	$SD.setTitle(context, driver.tla);
	// set the tile's image to the driver's headshot
	$SD.setImage(context, driver.headshot);
});
PlayerTile.onKeyDown(({ action, context, device, event, payload }) => {
	const page_num = multi_action_device_data[device].page;
	const coord_string = payload.coordinates.row + ":" + payload.coordinates.column;
	let driver = null;
	try{
		driver = multi_action_device_data[device].tiles.pages[page_num][coord_string];
	} catch (e) {
		driver = {
			"tla": "",
			"headshot": "",
			"context": multi_action_device_data[device].tiles.pages[0][coord_string].context,
			"type": "EMPTY",
			"id": ""
		};
	}

	if (driver === undefined || driver === null || driver === "" || driver === {} || driver === []) {
		// if the tile is empty, go back to the profile
		updateProfileIcons(device, 0);
		$SD.switchToProfile(device);
	} else if (driver.type === "NEXT_PAGE") {
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