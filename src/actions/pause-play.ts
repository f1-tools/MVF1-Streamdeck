import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, syncPlayersToPlayer } from "../helpers";

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.pause-play" })
export class PausePlay extends SingletonAction {

	override async onKeyDown(ev: KeyDownEvent): Promise<void> {
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
				
				syncPlayersToPlayer(playerWithPriority);

				// update the icon
				if (desiredPausedState) {
					if (ev.action.isKey()) {ev.action.setState(0);}
				} else {
					if (ev.action.isKey()) {ev.action.setState(1);}
				}
		}).catch((error) => {
			streamDeck.logger.error("Error getting player state for play/pause: " + error);
			return;
		});
	}
}
