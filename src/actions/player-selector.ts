import streamDeck, { action, SingletonAction, JsonObject, WillAppearEvent, KeyDownEvent, Action, Device, DialAction, KeyAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { JSONObject, Player, PlayerType } from "../mv-types";
import { PausePlay } from "./pause-play";
import { NON_OBC_POSSIBLE_STREAMS, PlayerPickerCaller, PlayerPickerDisplay } from "../global-types";
import { Sync } from "./sync";
import { Forward } from "./forward";
import { Rewind } from "./rewind";
import { Speedometer } from "./speedometer";
import { Header } from "./header";
import { Fullscreen } from "./fullscreen";
import { AlwaysOnTop } from "./always-on-top";
import { Mute } from "./mute";
import { VolumeUp } from "./volume-up";
import { VolumeDown } from "./volume-down";
import { Swap } from "./swap";

type Settings = {
    title: string;
};

/**
 * This action allows the user to select a player to control.
 * 
 * This action is hidden from the user and only shows up on the player selector profile
 * that comes with the plugin. 
 * 
 * By default, it only displays the open players so that they can be selected.
 */

@action({ UUID: "com.f1-tools.mvf1.player-selector" })
export class PlayerSelector extends SingletonAction {
    private static playerCache: Player[];
    public static currentPage: number = 0;
    private static pages: number = 0;

    /**
     * When the key is pressed set the global settings with the player that was clicked
     * so that the global settings handler can call the appropriate actions static method.
     * 
     * @param ev 
     */
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        // if the button is in "Player Error" or "" state, return to previous profile
        const localSettings = await ev.action.getSettings();
        if (localSettings.title === "" || localSettings.title === "Player Error") {
            streamDeck.profiles.switchToProfile(ev.action.device.id);
            return;
        }
        // if the player is a next button (title is " "), increment the page update all the buttons and return
        if (localSettings.title === " ") {
            await PlayerSelector.currentPage++;
            streamDeck.actions.forEach((action) => {
                if (action.manifestId === "com.f1-tools.mvf1.player-selector") {
                    PlayerSelector.updateButtonUI(PlayerSelector.buildFakeEventForUpdateButtons(action));
                }
            });
            return;
        }
        // otherwise,  call the correct function and switch to the previous profile
        const globalSettings = await streamDeck.settings.getGlobalSettings();
        const players = PlayerSelector.playerCache;
        let playerId = "-1";
        let playerTitle = "UNKNOWN";
        if (!ev.payload.isInMultiAction) {
            const playerIndex = PlayerSelector.getPlayerIndex(ev.payload.coordinates.row, 
                ev.payload.coordinates.column, ev.action.device.size.rows, ev.action.device.size.columns);
            playerId = players[playerIndex].id;
            playerTitle = players[playerIndex].streamData?.title ?? "UNKNOWN";
        }
        /**
         * Every time a new action that uses the player picker is added, a new case must be added here
         * 
         * Keep the actual functionality in the actions class.
         */
        switch (globalSettings.playerPickerCaller) {
            case PlayerPickerCaller.PLAY_PAUSE:
                PausePlay.playerSelectedPlayPause(playerId);
                break;
            case PlayerPickerCaller.SYNC:
                Sync.playerSelectedSync(playerId);
                break;
            case PlayerPickerCaller.FORWARD:
                Forward.playerSelectedForOneTimeForward(playerId);
                break;
            case PlayerPickerCaller.REWIND:
                Rewind.playerSelectedForOneTimeRewind(playerId);
                break;
            case PlayerPickerCaller.SPEEDOMETER:
                Speedometer.playerSelectedForSpeedometer(playerId);
                break;
            case PlayerPickerCaller.HEADER:
                Header.playerSelectedForHeader(playerId);
                break;
            case PlayerPickerCaller.FULLSCREEN:
                Fullscreen.playerSelectedFullscreen(playerId);
                break;
            case PlayerPickerCaller.ALWAYS_ON_TOP:
                AlwaysOnTop.playerSelectedForAlwaysOnTop(playerId);
                break;
            case PlayerPickerCaller.MUTE:
                Mute.playerSelectedForMute(playerId);
                break;
            case PlayerPickerCaller.VOLUME_UP:
                VolumeUp.playerSelectedForVolumeUp(playerId);
                break;
            case PlayerPickerCaller.VOLUME_DOWN:
                VolumeDown.playerSelectedForVolumeDown(playerId);
                break;
            case PlayerPickerCaller.SWAP_ONE:
                Swap.firstPlayerSelectedForSwap(playerId);
                return;
            case PlayerPickerCaller.SWAP_TWO:
                Swap.secondPlayerSelectedForSwap(playerTitle);
                break;
            default:
                streamDeck.logger.error("Player Picker called from an unknown source: " + globalSettings.playerPickerCaller);
                break;
        }
        streamDeck.profiles.switchToProfile(ev.action.device.id);
    }    

    /**
     * When the profile is switched to display all of the buttons
     * 
     * @param ev 
     */
    override async onWillAppear(ev: WillAppearEvent<Settings>): Promise<void> {
        streamDeck.logger.info("Player Selector onWillAppear, players: " + JSON.stringify(PlayerSelector.playerCache));
        PlayerSelector.updateButtonUI(ev);
    }

    /**
     * refreshes the buttons ui on the player selector profile
     * 
     * @param ev the event that triggered the action that holds all the needed information
     */
    private static async updateButtonUI(ev: WillAppearEvent<Settings> | KeyDownEvent<Settings>) {
        streamDeck.logger.info("Updating player selector buttons players: " + JSON.stringify(PlayerSelector.playerCache));
        const rows = ev.action.device.size.rows;
        const columns = ev.action.device.size.columns; 
        const availableButtons = rows * columns;
        const endOfPageIndex = availableButtons * (PlayerSelector.currentPage + 1);
        let players: Player[] = await PlayerSelector.playerCache;
        PlayerSelector.pages = await Math.ceil(players.length / availableButtons);
        if (!players || players.length === 0) {
            ev.action.setTitle("Player Error");
            ev.action.setSettings({ title: "Player Error" });
            return;
        } else {
            if (!ev.payload.isInMultiAction) {
                const buttonRow = ev.payload.coordinates.row;
                const buttonColumn = ev.payload.coordinates.column;
                const buttonIndex = PlayerSelector.getButtonIndex(buttonRow, buttonColumn, rows, columns);
                const playerIndex = PlayerSelector.getPlayerIndex(buttonRow, buttonColumn, rows, columns);
                // if there is extra space, set the button to be blank
                if (playerIndex >= players.length) {
                    ev.action.setTitle("");
                    ev.action.setSettings({ title: "" });
                    ev.action.setImage("imgs/actions/PNG/blank.png");
                    return;
                } 
                // if there are more pages, and we are at the bottom right button, set it to be the next button
                else if (PlayerSelector.pages - 1 > PlayerSelector.currentPage && buttonIndex === endOfPageIndex - 1) {
                    ev.action.setTitle(" "); // a space means next button
                    ev.action.setImage("imgs/actions/PNG/next.png");
                    ev.action.setSettings({ title: " " }); // a space means next button
                    return;
                }
                // otherwise figure out the player this button represents and set the title
                else {
                    // accounts for next buttons throwing off index
                    const player = players[playerIndex];
                    ev.action.setTitle(player.streamData?.title ?? "Title Error");
                    ev.action.setSettings({ title: player.streamData?.title ?? "Title Error" });
                    PlayerSelector.setImageForPlayer(ev, player.streamData?.title ?? "Title Error", player.type);
                    return;
                }
            }
        }
    }

    /**
     * Sets the image for the player selector based on the type of player
     * 
     * @param ev the event that triggered the action that holds all the needed information
     * @param title the title of the player
     * @param type the type of player
     * 
     * ["INTERNATIONAL", "F1 LIVE", "TRACKER", "DATA"];
     */
    private static async setImageForPlayer(ev: WillAppearEvent<Settings> | KeyDownEvent<Settings>, title: string, type: PlayerType) {
        if (type === PlayerType.OBC) {
            try {
                ev.action.setImage("imgs/player-picker-icons/" + title + ".png");
            } catch (error) {
                streamDeck.logger.trace("image not found when setting image for player selector: " + title);
                ev.action.setImage("imgs/actions/PNG/blank.png");
            }
        } else { // type === PlayerType.ADDITIONAL
            if (title === NON_OBC_POSSIBLE_STREAMS[0]) { // "INTERNATIONAL"
                ev.action.setImage("imgs/actions/PNG/globe.png");
            } else if (title === NON_OBC_POSSIBLE_STREAMS[1]) { // "F1 LIVE"
                ev.action.setImage("imgs/actions/PNG/cam.png");
            } else if (title === NON_OBC_POSSIBLE_STREAMS[2]) { // "TRACKER"
                ev.action.setImage("imgs/actions/PNG/track_map.png");
            } else if (title === NON_OBC_POSSIBLE_STREAMS[3]) { // "DATA"
                ev.action.setImage("imgs/actions/PNG/data.png");
            } else {
                ev.action.setImage("imgs/actions/PNG/blank.png");
            }
        }
    }

    /**
     * Get the players and sorts them.
     * 
     * @returns The list of players sorted by id.
     */
    static async updatePlayerCache(playerPickerDisplay: PlayerPickerDisplay = PlayerPickerDisplay.ALL): Promise<void> {
        try {
            const result = await gql_client.query({
                query: gql`
                    query Query {
                        players {
                            id
                            type
                            streamData {
                                title
                            }
                        }
                    }
                `,
            });

            if (result.errors) {
                streamDeck.logger.error("Error getting players for player selector: " + JSON.stringify(result.errors));
                PlayerSelector.playerCache = [];
                return;
            }

            let players = result.data.players as Player[];
            // filter the players if needed
            if (playerPickerDisplay === PlayerPickerDisplay.ONBOARDS_ONLY) {
                players = players.filter((player) => player.type === PlayerType.OBC);
            }
            PlayerSelector.playerCache = players.sort(PlayerSelector.playerSort);
        } catch (error) {
            streamDeck.logger.error("Error getting players for player selector: " + error);
            PlayerSelector.playerCache = [];
        }
    }

    /**
     * Sorts the players by id and type
     * 
     * type=ADDITIONAL < type=OBC
     * then by lower id < higher id
     * 
     * @param a the first player to compare
     * @param b the second player to compare
     * 
     * @returns a number that represents the order of the two players
     */
    private static playerSort(a: Player, b: Player): number {
        if (a.type === PlayerType.ADDITIONAL && b.type === PlayerType.OBC) {
            return -1;
        } else if (a.type === PlayerType.OBC && b.type === PlayerType.ADDITIONAL) {
            return 1;
        } else {
            return parseInt(a.id) - parseInt(b.id);
        }
    }

    /**
     * Get the players that are possible and sorts them.
     * used for the second player selection in the swap action
     * 
     * @returns The list of players sorted by id.
     */
    static async updatePlayerCacheToPossiblePlayers(): Promise<void> {
        const players: Player[] = [];
        await this.updatePlayerCache();
        const openPlayers = await PlayerSelector.playerCache as Player[];
        const openPlayerTitles: string[] = openPlayers.map((player) => player.streamData?.title).filter((title): title is string => title !== undefined);

        // add the already open players to the list
        players.push(...openPlayers);

        // get all other types of players and add them to the list if they are not already present
        // add the additional players (non-obc)
        for (const playerTitle of NON_OBC_POSSIBLE_STREAMS) {
            if (!openPlayerTitles.includes(playerTitle)) {
                const newPlayer: Player = {
                    streamData: { title: playerTitle },
                    id: "",
                    type: PlayerType.ADDITIONAL,
                    bounds: { x: 0, y: 0, width: 0, height: 0 },
                    fullscreen: false,
                    alwaysOnTop: false,
                    maintainAspectRatio: false
                };
                players.push(newPlayer);
            }
        }
        // add the other obc possible players
        try {
            gql_client.query({
                query: gql`
                query Query {
                    f1LiveTimingState {
                        DriverList
                    }
                }
            `,
            }).then((result) => {
                if (result.errors) {
                    streamDeck.logger.error("Error getting possible players for player selector: " + JSON.stringify(result.errors));
                    PlayerSelector.playerCache = [];
                    return;
                }
                
                const driverList = result.data.f1LiveTimingState.DriverList as JSONObject[];
                const driverTLAs: string[] = [];
                for (const driver of Object.values(driverList)) {
                    driverTLAs.push(driver.Tla as string);
                }
                for (const tla of driverTLAs) {
                    if (!openPlayerTitles.includes(tla)) {
                        const newPlayer: Player = {
                            streamData: { title: tla },
                            id: "",
                            type: PlayerType.OBC,
                            bounds: { x: 0, y: 0, width: 0, height: 0 },
                            fullscreen: false,
                            alwaysOnTop: false,
                            maintainAspectRatio: false
                        };
                        players.push(newPlayer);
                    }
                }

                //  sort and set the possible players
                PlayerSelector.playerCache = players.sort((a, b) => PlayerSelector.possiblePlayerSort(a, b, openPlayerTitles));
            })
        } catch (error) {
            streamDeck.logger.error("Error getting possible players for player selector: " + JSON.stringify(error));
            PlayerSelector.playerCache = [];
        }
    }

    /**
     * Sorts the players by open and type
     * 
     * Non driver players < driver players
     * Open players < not open players
     * 
     * @param a the first player to compare
     * @param b the second player to compare
     * 
     * @returns a number that represents the order of the two players
     */
    private static possiblePlayerSort(a: Player, b: Player, openPlayerTitles: string[]): number {
        if (a.type === PlayerType.ADDITIONAL && b.type === PlayerType.OBC) {
            return -1;
        } else if (a.type === PlayerType.OBC && b.type === PlayerType.ADDITIONAL) {
            return 1;
        } else { 
            if (a.streamData?.title && b.streamData?.title && openPlayerTitles.includes(a.streamData.title) && !openPlayerTitles.includes(b.streamData.title)) {
                return -1;
            } else if (a.streamData?.title && b.streamData?.title && !openPlayerTitles.includes(a.streamData.title) && openPlayerTitles.includes(b.streamData.title)) {
                return 1;
            } else {
                return (a.streamData?.title ?? "").localeCompare(b.streamData?.title ?? "");
            }
        }
    }

    /**
     * @param buttonRow the row of the button in question
     * @param buttonColumn the column of the button in question
     * @param rows the number of rows on the device
     * @param columns the number of columns on the device
     * 
     * @returns the index of the button when pages are taken into account
     */
    private static getButtonIndex(buttonRow: number, buttonColumn: number, rows: number, columns: number): number {
        const availableButtons = rows * columns;
        return ((buttonRow * columns) + buttonColumn) // the index on the page
            + (availableButtons * PlayerSelector.currentPage); // adds offset for pages
    }

    /**
     * @param ButtonRow the row of the button in question
     * @param buttonColumn the column of the button in question
     * @param row the number of rows on the device
     * @param columns the number of columns on the device
     * 
     * @returns the index of the player in the player array taking the next buttons into account 
     */
    private static getPlayerIndex(ButtonRow: number, buttonColumn: number, row: number, columns: number): number {
        const availableButtons = row * columns;
        const buttonIndex = this.getButtonIndex(ButtonRow, buttonColumn, row, columns);
        return buttonIndex - Math.floor(buttonIndex / availableButtons); // accounts for next buttons throwing off index
    }


    /**
     * Builds a fake event to pass to the update buttons function
     * This allows the next button to update all of the buttons
     * 
     * @param action the action we are building the fake event for so it can be updated
     * 
     * @returns a fake event to pass to the update buttons function
     */
    private static buildFakeEventForUpdateButtons(action: DialAction<JsonObject> | KeyAction<JsonObject>): WillAppearEvent<Settings> {
        //build event to pass to update buttons
        const device = streamDeck.devices.find((device) => device.id === action.device.id) as Device;
        const fakeEv = {
            action: {
                device: device,
                size: { rows: device.size.rows, columns: device.size.columns },
                setTitle: action.setTitle.bind(action),
                setSettings: action.setSettings.bind(action),
                setImage: action.setImage.bind(action),
            },
            payload: {
                isInMultiAction: false,
                coordinates: { row: action.coordinates?.row, column: action.coordinates?.column },
            }
        } as unknown as WillAppearEvent<Settings>;
        return fakeEv;
    }
}