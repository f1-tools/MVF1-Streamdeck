import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, switchToPlayerPickerProfile, syncPlayersToPlayer } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";

type Settings = {
	global: boolean; // whether to apply the action to all players or to open the player selector profile
	sync: boolean; // whether to sync players after the play/pause action
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.pause-play" })
export class PausePlay extends SingletonAction<Settings> {

	override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
		const settings = await ev.action.getSettings();
		if (settings.global) {
			this.globalPlayPause(settings.sync);
		} else {
			this.openPlayerSelectorForPlayPause(ev);
		}
	}

	/**
	 * Pauses or plays all players that are currently open.
	 * 
	 * @param sync whether to sync players after the play/pause action
	 */
	private async globalPlayPause(sync: boolean) {
		let playerWithPriority: Player;
		// get the current state of the commentary player or oldest player 
		gql_client
		.query({
			query: gql`
				query Query {
					players {
						id
						state {
							paused
						}
						streamData {
							title
						}
					}
				}
			`,
		}).then((result) => {
			if (result.errors) {
				streamDeck.logger.error("Error getting player state for play/pause: " + JSON.stringify(result.errors));
				return;
			}
			const players = result.data.players as Player[];
			playerWithPriority = getPlayerWithPriority(players);

				// get desired state
				const desiredPausedState = !playerWithPriority.state?.paused;

				// set desired state for all players 
				players.forEach((player) => {
					gql_client
						.mutate({
							mutation: gql`
								mutation Mutation($playerSetPausedId: ID!, $paused: Boolean) {
  									playerSetPaused(id: $playerSetPausedId, paused: $paused)
								}
							`,
							variables: {
								playerSetPausedId: player.id,
								paused: desiredPausedState,
							},
						})
						.then((result) => {
							if (result.errors) {
								streamDeck.logger.error("Error setting player state for play/pause: " + JSON.stringify(result.errors));
								return;
							}
						}).catch((error) => {
							streamDeck.logger.error("Error setting player state for play/pause: " + error);
							return;
						});
				});
				
				if (sync) {
					syncPlayersToPlayer(playerWithPriority.id);
				}
		}).catch((error) => {
			streamDeck.logger.error("Error getting player state for play/pause: " + error);
			return;
		});
	}

	/**
	 * Opens the player selector profile for the play/pause action.
	 * 
	 * @param ev the key down event used to get the device to switch to the player selector profile
	 */
	private async openPlayerSelectorForPlayPause(ev: KeyDownEvent<Settings>) {
		const newGlobalSettings: GlobalSettings = {
			playerPickerCaller: PlayerPickerCaller.PLAY_PAUSE
		};
		streamDeck.settings.setGlobalSettings(newGlobalSettings);
		switchToPlayerPickerProfile(ev.action.device);
	}

	/**
	 * Toggle the play/pause state of the player with the given ID.
	 * 
	 * Gets called by the player selector profile after a player has been selected and 
	 * the action that called the player selector profile was the play/pause action.
	 * 
	 * @param playerId the id of the player to pause or play
	 */
	public static async playerSelectedPlayPause(playerId: string) {
		gql_client.mutate({
            mutation: gql`
                mutation Mutation($playerSetPausedId: ID!) {
                    playerSetPaused(id: $playerSetPausedId)
                }
            `,
            variables: {
                playerSetPausedId: playerId,
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error setting player state for play/pause: " + JSON.stringify(result.errors));
            }
        }).catch((error) => {
            streamDeck.logger.error("Error setting player state for play/pause: " + error);
        });
	}
}