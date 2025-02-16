import streamDeck, { action, KeyDownEvent, SingletonAction, WillAppearEvent } from "@elgato/streamdeck";
import { gql_client } from "../plugin";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";

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
				streamDeck.logger.error("Error getting player state: " + JSON.stringify(result.errors));
				return;
			}
			streamDeck.logger.info("Got player state: " + JSON.stringify(result.data));
			const players = result.data.players as Player[];
			playerWithPriority = 
			players.find((player) => { return player.streamData?.title === "INTERNATIONAL" || player.streamData?.title === "F1 LIVE"; }) 
				|| players.reduce((prev, curr) => { return prev.id < curr.id ? prev : curr; });

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
								streamDeck.logger.error("Error setting player state: " + JSON.stringify(result.errors));
								return;
							}
							streamDeck.logger.info("Set player state for " + player.streamData?.title + ": " + desiredPausedState);
						}).catch((error) => {
							streamDeck.logger.error("Error setting player state: " + error);
							return;
						});
				});
				// TODO add a sync to the player with priority

				// update the icon
				if (desiredPausedState) {
					if (ev.action.isKey()) {ev.action.setState(0);}
				} else {
					if (ev.action.isKey()) {ev.action.setState(1);}
				}
		}).catch((error) => {
			streamDeck.logger.error("Error getting player state: " + error);
			return;
		});
	}
}
