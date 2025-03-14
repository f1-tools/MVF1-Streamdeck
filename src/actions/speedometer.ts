import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { GlobalSettings, PlayerPickerCaller, PlayerPickerDisplay } from "../global-types";
import { switchToPlayerPickerProfile } from "../helpers";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player, PlayerType } from "../mv-types";

type Settings = {
    global: string; // "AP" (all players) or "SP" (selected player)
};

@action({ UUID: "com.f1-tools.mvf1.speedometer" })
export class Speedometer extends SingletonAction<Settings> {
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        settings.global = settings.global === undefined ? "AP" : settings.global;
        if (settings.global === "AP") {
            this.globalSpeedometerToggle();
        } else {
            this.openPlayerSelectorForSpeedometer(ev);
        }
    }

    /**
     * Toggles the state of the speedometer for all onboard players
     */
    private async globalSpeedometerToggle() {
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
                streamDeck.logger.error("Error getting players for speedometer: " + JSON.stringify(result.errors));
                return;
            }

            const players = result.data.players as Player[];
            // get the onboard players
            const onboardPlayers = players.filter((player) => player.type === PlayerType.OBC);
            // get the ids of the onboard players
            const onboardPlayerIds = onboardPlayers.map((player) => player.id);
            
            for (const playerId of onboardPlayerIds) {
                Speedometer.doMutation(playerId);
            }
        }).catch((error) => {
            streamDeck.logger.error("Error getting players for speedometer: " + error);
        });
    }

    /**
     * Opens the player selector profile for the user to select a player to toggle speedometer on.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForSpeedometer(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.SPEEDOMETER
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device, PlayerPickerDisplay.ONBOARDS_ONLY);
    }

    /**
     * Called when a player is selected in the player picker profile.
     * Toggles the speedometer state of the selected player.
     * 
     * @param playerId The id of the player to toggle speedometer on.
     */
    public static async playerSelectedForSpeedometer(playerId: string) {
        Speedometer.doMutation(playerId);
    }

    private static async doMutation(playerId: string) {
        gql_client.mutate({
            mutation: gql`
                mutation Mutation($playerSetSpeedometerVisibilityId: ID!) {
                    playerSetSpeedometerVisibility(id: $playerSetSpeedometerVisibilityId)
                }
            `,
            variables: {
                playerSetSpeedometerVisibilityId: playerId
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error toggling speedometer: " + JSON.stringify(result.errors));
                return;
            }
        }).catch((error) => {
            streamDeck.logger.error("Error toggling speedometer: " + error);
        });
    }
}