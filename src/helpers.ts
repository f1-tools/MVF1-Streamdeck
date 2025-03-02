import { Player } from "./mv-types";
import { gql_client } from "./graphql";
import { gql } from "@apollo/client";
import streamDeck, { Device, DeviceType } from "@elgato/streamdeck";
import { PlayerSelector } from "./actions/player-selector";
import { PlayerPickerDisplay } from "./global-types";


/**
 * This file holds all of the helper functions that are used by more than one action.
 */

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
export function syncPlayersToPlayer(playerId: string) {
    gql_client.mutate({
        mutation: gql`
            mutation Mutation($playerSyncId: ID!) {
                playerSync(id: $playerSyncId)
            }
        `,
        variables: {
            playerSyncId: playerId,
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

/**
 * Seek a players by the given number of seconds.
 * 
 * @param seconds The number of seconds to seek by.
 */
export function seekPlayerBySeconds(playerId: string, seconds: number) {
    gql_client.mutate({
        mutation: gql`
            mutation Mutation($playerSeekToId: ID!, $relative: Float) {
                playerSeekTo(id: $playerSeekToId, relative: $relative)
            }
        `,
        variables: {
            playerSeekToId: playerId,
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
}

/**
 * Switch to the Player Picker profile.
 * 
 * @returns the string for the 
 */
export async function switchToPlayerPickerProfile(device: Device, 
    playerPickerDisplay: PlayerPickerDisplay = PlayerPickerDisplay.ALL): Promise<void> {
    let profileString = "";
    switch (device.type) {
        case DeviceType.StreamDeckPlus:
            profileString = "MV Player Picker - StreamDeckPlus";
            break;
        default:
            streamDeck.logger.error("No Profile for " + device.name + " with type " + device.type + ". Contact the developer to get one added.");
            return;
    }
    await PlayerSelector.updatePlayerCache(playerPickerDisplay);
    PlayerSelector.currentPage = 0;
    streamDeck.profiles.switchToProfile(device.id, profileString);
}


/**
 * Change the volume of all players by the given percent.
 * 
 * @param nPercent The percent to change the volume by.
 */
export async function changeAllPlayersVolumeBy(nPercent: number) {
    gql_client.query({
        query: gql`
            query State {
                players {
                    state {
                        volume
                    }
                    id
                }
            }
        `,
    }).then((result) => {
        if (result.errors) {
            streamDeck.logger.error("Error getting players for volume change: " + JSON.stringify(result.errors));
            return;
        }

        const players = result.data.players as Player[];
        players.forEach((player) => {
            let newVolume = (player.state?.volume ?? 0.0) + nPercent; // 0-100
            newVolume = newVolume > 100.0 ? 100.0 : newVolume;
            newVolume = newVolume < 0.0 ? 0.0 : newVolume;
            gql_client.mutate({
                mutation: gql`
                    mutation PlayerSetVolume($playerSetVolumeId: ID!, $volume: Float!, $playerSetMutedId: ID!, $muted: Boolean) {
                        playerSetVolume(id: $playerSetVolumeId, volume: $volume)
                        playerSetMuted(id: $playerSetMutedId, muted: $muted)
                    }
                `,
                variables: {
                    playerSetVolumeId: player.id,
                    volume: newVolume,
                    playerSetMutedId: player.id,
                    muted: false
                },
            }).then((result) => {
                if (result.errors) {
                    streamDeck.logger.error("Error setting volume: " + JSON.stringify(result.errors));
                    return;
                }
            }).catch((error) => {
                streamDeck.logger.error("Error setting volume: " + error);
            });
        });
    }).catch((error) => {
        streamDeck.logger.error("Error getting players for volume change: " + error);
    });
}

/**
 * Change the volume of the player by the given percent.
 * 
 * @param playerId The id of the player to change the volume of.
 * @param nPercent The percent to change the volume by.
 */
export async function changePlayerVolumeBy(playerId: string, nPercent: number) {
    gql_client.query({
        query: gql`
            query Player($playerId: ID!) {
                player(id: $playerId) {
                    state {
                        volume
                    }
                }
            }
        `,
        variables: {
            playerId: playerId,
        },
    }).then((result) => {
        if (result.errors) {
            streamDeck.logger.error("Error getting player for volume change: " + JSON.stringify(result.errors));
            return;
        }

        const player = result.data.player as Player;
        let newVolume = (player.state?.volume ?? 0.0) + nPercent; // 0-100
        newVolume = newVolume > 100.0 ? 100.0 : newVolume;
        newVolume = newVolume < 0.0 ? 0.0 : newVolume;
        gql_client.mutate({
            mutation: gql`
                mutation PlayerSetVolume($playerSetVolumeId: ID!, $volume: Float!, $playerSetMutedId: ID!, $muted: Boolean) {
                    playerSetVolume(id: $playerSetVolumeId, volume: $volume)
                    playerSetMuted(id: $playerSetMutedId, muted: $muted)
                }
            `,
            variables: {
                playerSetVolumeId: playerId,
                volume: newVolume,
                playerSetMutedId: playerId,
                muted: false
            },
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error setting volume: " + JSON.stringify(result.errors));
                return;
            }
        }).catch((error) => {
            streamDeck.logger.error("Error setting volume: " + error);
        });
    }).catch((error) => {
        streamDeck.logger.error("Error getting player for volume change: " + error);
    });
}