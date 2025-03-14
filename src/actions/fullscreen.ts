import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, switchToPlayerPickerProfile, syncPlayersToPlayer } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";

@action({ UUID: "com.f1-tools.mvf1.fullscreen" })
export class Fullscreen extends SingletonAction {

    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        this.openPlayerSelectorForFullscreen(ev);
    }

    /**
     * Opens the player selector profile for the user to select a player to toggle fullscreen on.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForFullscreen(ev: KeyDownEvent) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.FULLSCREEN
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }


    /**
     * Toggles the player fullscreen state.
     * 
     * @param playerId The ID of the player to toggle fullscreen of.
     */
    public static async playerSelectedFullscreen(playerId: string) {
        gql_client.mutate({
            mutation: gql`
                mutation PlayerSetDriverHeaderMode($playerSetFullscreenId: ID!) {
                    playerSetFullscreen(id: $playerSetFullscreenId)
                }
            `,
            variables: {
                playerSetFullscreenId: playerId
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error toggling player fullscreen: " + JSON.stringify(result.errors));
                return;
            }
        }).catch((error) => {
            streamDeck.logger.error("Error toggling player fullscreen: " + error);
        });
    }
}   

