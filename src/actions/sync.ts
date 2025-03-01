import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, switchToPlayerPickerProfile, syncPlayersToPlayer } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";

type Settings = {
    standard: boolean; // whether to allow the user to select a player to sync to
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.sync" })
export class Sync extends SingletonAction {

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        if (settings.standard) {
            this.standardSync();
        } else {
            this.openPlayerSelectorForSync(ev);
        }
    }

    /**
     * Syncs all players to the player with the highest priority.
     */
    private async standardSync() {
        let playerWithPriority: Player;
        // get the players 
        gql_client.query({
                query: gql`
                    query Query {
                        players {
                            id
                            streamData {
                                title
                            }
                        }
                    }
                `,
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error getting players for sync: " + JSON.stringify(result.errors));
                return;
            }

            const players = result.data.players as Player[];
            playerWithPriority = getPlayerWithPriority(players);
            syncPlayersToPlayer(playerWithPriority.id);

        }).catch((error) => {
            streamDeck.logger.error("Error getting players for sync: " + error);
            return;
        });
    }


    /**
     * Opens the player selector profile for the user to select a player to sync to.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForSync(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.SYNC
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }


    /**
     * Syncs all players to the player with the given ID.
     * 
     * Gets called by the player selector profile after a player has been selected and
     * the action that called the player selector profile is the sync action.
     * 
     * @param playerId The ID of the player to sync to.
     */
    public static async playerSelectedSync(playerId: string) {
        syncPlayersToPlayer(playerId);
    }

}   

