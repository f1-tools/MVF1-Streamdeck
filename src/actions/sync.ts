import streamDeck, { action, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { gql_client } from "../graphql";
import { gql } from "@apollo/client";
import { Player } from "../mv-types";
import { getPlayerWithPriority, syncPlayersToPlayer } from "../helpers";

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.sync" })
export class Sync extends SingletonAction {
    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
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
            syncPlayersToPlayer(playerWithPriority);

        }).catch((error) => {
            streamDeck.logger.error("Error getting players for sync: " + error);
            return;
        });
    }
}   

