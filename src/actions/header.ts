import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { GlobalSettings, PlayerPickerCaller, PlayerPickerDisplay } from "../global-types";
import { switchToPlayerPickerProfile } from "../helpers";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player, DriverHeaderMode, PlayerType } from "../mv-types";

type Settings = {
    global: boolean; // whether to cycle all players or just the selected player
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.header" })
export class Header extends SingletonAction<Settings> {
    // An ATTEMPT to keep track of players header state, will likely get out of sync but better than nothing
    private static playerHeaderStates: Map<string, DriverHeaderMode> = new Map<string, DriverHeaderMode>();
    // This is what headers are by default for new obc players and also an ATTEMPT to track state.
    private static globalHeaderState: DriverHeaderMode = DriverHeaderMode.OBC_LIVE_TIMING; 

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        if (settings.global) {
            this.globalHeaderCycle();
        } else {
            this.openPlayerSelectorForHeader(ev);
        }
    }

    /**
     * Cycles the header state for all onboard players
     */
    private async globalHeaderCycle() {
        gql_client.query({
            query: gql`
                query Query {
                    players {
                        id
                        type
                    }
                }
            `,
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error getting players for headers: " + JSON.stringify(result.errors));
                return;
            }

            const players = result.data.players as Player[];
            // get the onboard players
            const onboardPlayers = players.filter((player) => player.type === PlayerType.OBC);
            // get the ids of the onboard players
            const onboardPlayerIds = onboardPlayers.map((player) => player.id);
            
            // next goes: NONE -> OBC_LIVE_TIMING -> DRIVER_HEADER -> NONE -> ...
            let nextHeaderState: DriverHeaderMode = DriverHeaderMode.NONE;
            const headerStates = Object.values(DriverHeaderMode);
            const currentIndex = headerStates.indexOf(Header.globalHeaderState);
            const nextIndex = (currentIndex + 1) % headerStates.length;
            nextHeaderState = headerStates[nextIndex];
            Header.globalHeaderState = nextHeaderState;

            for (const playerId of onboardPlayerIds) {
                Header.doMutation(playerId, nextHeaderState);
            }
        }).catch((error) => {
            streamDeck.logger.error("Error getting players for headers: " + error);
        });
    }

    /**
     * Opens the player selector profile for the user to select a player to cycle the header on.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForHeader(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.HEADER,
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device, PlayerPickerDisplay.ONBOARDS_ONLY);
    }

    /**
     * Called when a player is selected in the player picker profile.
     * cycles the header state of the selected player.
     * 
     * @param playerId The id of the player to cycle header on.
     */
    public static async playerSelectedForHeader(playerId: string) {
        const headerState = Header.playerHeaderStates.get(playerId);
        let nextHeaderState: DriverHeaderMode = DriverHeaderMode.NONE;
        if (headerState === undefined) {
            nextHeaderState = DriverHeaderMode.OBC_LIVE_TIMING;
        } else {
            const headerStates = Object.values(DriverHeaderMode);
            const currentIndex = headerStates.indexOf(headerState);
            const nextIndex = (currentIndex + 1) % headerStates.length;
            nextHeaderState = headerStates[nextIndex];
        }
        Header.doMutation(playerId, nextHeaderState);
    }

    /**
     * Does the actual mutation to set the header state
     * @param playerId the player to set the header state for
     * @param nextHeaderState the state to set the header to
     */
    private static async doMutation(playerId: string, nextHeaderState: DriverHeaderMode) {
        gql_client.mutate({
            mutation: gql`
                mutation PlayerSetDriverHeaderMode($playerSetDriverHeaderModeId: ID!, $mode: DriverHeaderMode!) {
                    playerSetDriverHeaderMode(id: $playerSetDriverHeaderModeId, mode: $mode)
                }
            `,
            variables: {
                playerSetDriverHeaderModeId: playerId,
                mode: nextHeaderState,
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error cycling header: " + JSON.stringify(result.errors));
                return;
            }

            // keep track of the header state
            Header.playerHeaderStates.set(playerId, nextHeaderState);
        }).catch((error) => {
            streamDeck.logger.error("Error cycling header: " + error);
        });
    }
}