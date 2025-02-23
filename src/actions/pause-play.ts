import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, switchToPlayerPickerProfile, syncPlayersToPlayer } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-settings-type";

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
			this.playerSelectorPlayPause(ev);
		}
	}

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
					syncPlayersToPlayer(playerWithPriority);
				}
		}).catch((error) => {
			streamDeck.logger.error("Error getting player state for play/pause: " + error);
			return;
		});
	}

	private async playerSelectorPlayPause(ev: KeyDownEvent<Settings>) {
		const newGlobalSettings: GlobalSettings = {
			playerPickerCaller: PlayerPickerCaller.PLAY_PAUSE
		};
		streamDeck.settings.setGlobalSettings(newGlobalSettings);
		switchToPlayerPickerProfile(ev.action.device);
	}

	static async playerSelectedPlayPause(playerId: string) {
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