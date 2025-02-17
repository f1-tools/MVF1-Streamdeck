import { Player } from "./mv-types";
import { gql_client } from "./graphql";
import { gql } from "@apollo/client";
import streamDeck from "@elgato/streamdeck";


/**
 * Get the player with the highest priority.
 * 
 * The player with the highest priority is the one with the
 * title "INTERNATIONAL" or "F1 LIVE". If no player has that title,
 * the player with the lowest id is returned.
 * 
 * @param players The list of players.
 * @returns The player with the highest priority.
 */
export function getPlayerWithPriority(players: Player[]): Player {
    return players.find((player) => { return player.streamData?.title === "INTERNATIONAL" || player.streamData?.title === "F1 LIVE"; })
        || players.reduce((prev, curr) => { return prev.id < curr.id ? prev : curr; });
}

/**
 * Sync all players to the given player.
 * 
 * @param player The player to sync to.
 */
export function syncPlayersToPlayer(player: Player) {
    gql_client.mutate({
        mutation: gql`
            mutation Mutation($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
            }
        `,
        variables: {
            playerSyncId: player.id,
        },
    }).then((result) => {
        if (result.errors) {
            streamDeck.logger.error("Error syncing players: " + JSON.stringify(result.errors));
            return;
        }
    }).catch((error) => {
        streamDeck.logger.error("Error syncing players: " + error);
    });
}

/**
 * Seek all players by the given number of seconds.
 * 
 * @param seconds The number of seconds to seek by.
 */
function seekBySeconds(seconds: number) {
    // get the players
    gql_client.query({
        query: gql`
            query Query {
                players {
                    id
                }
            }
        `,
    }).then((result) => {
        if (result.errors) {
            streamDeck.logger.error("Error getting players for seek: " + JSON.stringify(result.errors));
            return;
        }

        const players = result.data.players as Player[];
        // seek all players
        players.forEach((player) => {
            gql_client.mutate({
                mutation: gql`
                    mutation Mutation($playerSeekToId: ID!, $relative: Float) {
                        playerSeekTo(id: $playerSeekToId, relative: $relative)
                    }
                `,
                variables: {
                    playerSeekToId: player.id,
                    relative: seconds,
                },
            }).then((result) => {
                if (result.errors) {
                    streamDeck.logger.error("Error seeking: " + JSON.stringify(result.errors));
                    return;
                }
            }).catch((error) => {
                streamDeck.logger.error("Error seeking: " + error);
            });
        });
    }).catch((error) => {
        streamDeck.logger.error("Error seeking: " + error);
    });
}

/**
 * Seek all players by the given number of seconds repeatedly until the condition is false.
 * 
 * @param condition The condition to check. Must make sure this value is passed by reference, and eventually set to false.
 * @param seconds The number of seconds to seek by.
 */
export function repeatSeekAsync(condition: { value: boolean }, seconds: number) {
    if (condition.value) {
        seekBySeconds(seconds);
        const interval = setInterval(() => {
            if (!condition.value) {
                clearInterval(interval);
                return;
            }
            seekBySeconds(seconds);
        }, 200);
    }
}