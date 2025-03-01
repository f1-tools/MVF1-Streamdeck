import streamDeck, { action, SingletonAction, JsonObject, WillAppearEvent, KeyDownEvent, Action, Device, DialAction, KeyAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { PausePlay } from "./pause-play";
import { PlayerPickerCaller, PlayerPickerDisplay } from "../global-types";
import { Sync } from "./sync";
import { Forward } from "./forward";
import { Rewind } from "./rewind";
import { Speedometer } from "./speedometer";

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

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.player-selector" })
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
                if (action.manifestId === "com.f1-tools.multiviewer-streamdeck.player-selector") {
                    PlayerSelector.updateButtonUI(PlayerSelector.buildFakeEventForUpdateButtons(action));
                }
            });
            return;
        }
        // otherwise,  call the correct function and switch to the previous profile
        const globalSettings = await streamDeck.settings.getGlobalSettings();
        const players = PlayerSelector.playerCache;
        let playerId = "-1";
        if (!ev.payload.isInMultiAction) {
            const playerIndex = PlayerSelector.getPlayerIndex(ev.payload.coordinates.row, 
                ev.payload.coordinates.column, ev.action.device.size.rows, ev.action.device.size.columns);
            playerId = players[playerIndex].id;
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
        PlayerSelector.updateButtonUI(ev);
    }

    /**
     * refreshes the buttons ui on the player selector profile
     * 
     * @param ev the event that triggered the action that holds all the needed information
     */
    private static async updateButtonUI(ev: WillAppearEvent<Settings> | KeyDownEvent<Settings>) {
        const rows = ev.action.device.size.rows;
        const columns = ev.action.device.size.columns; 
        const availableButtons = rows * columns;
        const endOfPageIndex = availableButtons * (PlayerSelector.currentPage + 1);
        let players: Player[] = await PlayerSelector.playerCache;
        if (!players) { 
            await PlayerSelector.updatePlayerCache(); 
            players = await PlayerSelector.playerCache;
        } 
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
                    ev.action.setImage("imgs/actions/PNG/blank.png"); // TODO driver head shot instead
                    return;
                }
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
                            streamData {
                                title
                            }
                            driverData {
                                driverNumber
                                tla
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
                players = players.filter((player) => player.driverData !== null);
            }
            PlayerSelector.playerCache = players.sort(PlayerSelector.playerSort);
        } catch (error) {
            streamDeck.logger.error("Error getting players for player selector: " + error);
            PlayerSelector.playerCache = [];
        }
    }


    /**
     * Sorts the players by id and driverData
     * 
     * Non driver players < driver players
     * then by lower id < higher id
     * 
     * @param a the first player to compare
     * @param b the second player to compare
     * 
     * @returns a number that represents the order of the two players
     */
    private static playerSort(a: Player, b: Player): number {
        if (a.driverData === null && b.driverData !== null) {
            return -1;
        } else if (a.driverData !== null && b.driverData === null) {
            return 1;
        } else {
            return parseInt(a.id) - parseInt(b.id);
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