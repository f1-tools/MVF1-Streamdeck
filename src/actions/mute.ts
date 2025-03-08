import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { GlobalSettings, PlayerPickerCaller, PlayerPickerDisplay } from "../global-types";
import { getPlayerWithPriority, switchToPlayerPickerProfile } from "../helpers";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";

type Settings = {
    global: string; // "AP" (all players) or "SP" (selected player)
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.mute" })
export class Mute extends SingletonAction<Settings> {
    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        settings.global = settings.global === undefined ? "SP" : settings.global;
        if (settings.global === "AP") {
            this.globalMute();
        } else {
            this.openPlayerSelectorForMute(ev);
        }
    }

    /**
     * Toggles mute for players
     */
    private async globalMute() {
        gql_client.query({
            query: gql`
                query Query {
                    players {
                        id
                        streamData {
                            title
                        }
                        state {
                            muted
                        }
                    }
                }
            `,
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error getting players for speedometer: " + JSON.stringify(result.errors));
                return;
            }

            const players = result.data.players as Player[];
            const highestPriorityPlayer = getPlayerWithPriority(players);
            const newMuteState = !highestPriorityPlayer.state?.muted;
            
            for (const player of players) {
                gql_client.mutate({
                    mutation: gql`
                        mutation PlayerSetAlwaysOnTop($playerSetMutedId: ID!, $muted: Boolean) {
                            playerSetMuted(id: $playerSetMutedId, muted: $muted)
                        }
                    `,
                    variables: {
                        playerSetMutedId: player.id,
                        muted: newMuteState,
                    },
                }).then((result) => {
                    if (result.errors) {
                        streamDeck.logger.error("Error setting player muted: " + JSON.stringify(result.errors));
                        return;
                    }
                }).catch((error) => {
                    streamDeck.logger.error("Error setting player muted: " + error);
                });
            }
        }).catch((error) => {
            streamDeck.logger.error("Error getting players for speedometer: " + error);
        });
    }

    /**
     * Opens the player selector profile for the user to select a player to toggle mute on.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForMute(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.MUTE
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * Called when a player is selected in the player picker profile.
     * Toggles mute state of the selected player.
     * 
     * @param playerId The id of the player to toggle mute on.
     */
    public static async playerSelectedForMute(playerId: string) {
        gql_client.mutate({
            mutation: gql`
                mutation PlayerSetAlwaysOnTop($playerSetMutedId: ID!) {
                    playerSetMuted(id: $playerSetMutedId)
                }
            `,
            variables: {
                playerSetMutedId: playerId,
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error setting player muted: " + JSON.stringify(result.errors));
                return;
            }
        }).catch((error) => {
            streamDeck.logger.error("Error setting player muted: " + error);
        });
    }
}