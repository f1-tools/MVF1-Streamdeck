import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { getPlayerWithPriority, switchToPlayerPickerProfile } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";
import { gql } from "@apollo/client";
import { gql_client } from "../graphql";
import { Player } from "../mv-types";


@action({ UUID: "com.f1-tools.mvf1.always-on-top" })
export class AlwaysOnTop extends SingletonAction {

    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
       this.openPlayerSelectorForAlwaysOnTop(ev);
    }

    /**
     * Opens the player selector profile for the user to select a player to toggle.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForAlwaysOnTop(ev: KeyDownEvent) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.ALWAYS_ON_TOP
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * Called when the player is selected for always on top.
     * Toggles the always on top setting for the selected player.
     * 
     * @param playerId The id of the player to toggle.
     */
    public static async playerSelectedForAlwaysOnTop(playerId: string) {
        gql_client.mutate({
            mutation: gql`
            mutation PlayerSetAlwaysOnTop($playerSetAlwaysOnTopId: ID!) {
                playerSetAlwaysOnTop(id: $playerSetAlwaysOnTopId)
            }
        `,
        variables: {
            playerSetAlwaysOnTopId: playerId
        },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error toggling always on top: " + JSON.stringify(result.errors));
                return;
            }
        }).catch((error) => {
            streamDeck.logger.error("Error toggling always on top: " + error);
        });
    }
}