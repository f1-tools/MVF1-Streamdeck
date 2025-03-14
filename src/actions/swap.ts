import streamDeck, { action, Device, JsonObject, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { GlobalSettings, NON_OBC_POSSIBLE_STREAMS, PlayerPickerCaller } from "../global-types";
import { findOldestPlayerId, switchToPlayerPickerProfile, waitToSync } from "../helpers";
import { open } from "fs";
import { gql } from "@apollo/client";
import { get } from "http";
import { JSONObject, Player, PlayerType } from "../mv-types";
import { gql_client } from "../graphql";
import { PlayerSelector } from "./player-selector";

@action({ UUID: "com.f1-tools.mvf1.swap"})
export class Swap extends SingletonAction {
    private static playerOneId: string = "-1";
    private static playerTwoTitle: string = "UNKNOWN";
    private static device: Device;
    
    override async onKeyDown(ev: KeyDownEvent): Promise<void> {
        this.openPlayerSelectorForSwapSelectOne(ev);
    }

    /**
     * swaps to the player picker profile for the swap action to get the first player to swap
     * 
     * @param ev the keydown event that holds the device to switch to the player picker profile
     */
    private async openPlayerSelectorForSwapSelectOne(ev: KeyDownEvent) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.SWAP_ONE
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        Swap.device = ev.action.device;
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * swaps to the player picker profile for the swap action to get the second player to swap
     * 
     * @param ev the keydown event that holds the device to switch to the player picker profile
     */
    private static async openPlayerSelectorForSwapSelectTwo() {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.SWAP_TWO
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(Swap.device);
    }

    /**
     * Called when the first player is selected in the player picker profile.
     * stores the first player and then opens the player picker profile to get the second player
     * 
     * @param playerId The id of the player to cycle header on.
     */
    public static async firstPlayerSelectedForSwap(playerId: string) {
        Swap.playerOneId = playerId;
        Swap.playerTwoTitle = "UNKNOWN";
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.SWAP_TWO
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        this.openPlayerSelectorForSwapSelectTwo();
    } 

    /**
     * Called when the second player is selected in the player picker profile.
     * swaps the two players
     * 
     * @param playerTitle The title/tla of the new player to swap
     */
    public static async secondPlayerSelectedForSwap(playerTitle: string) {
        Swap.playerTwoTitle = playerTitle;
        // store players for the swap
        const playerOne = await Swap.getPlayerOne();
        if (!playerOne) {
            streamDeck.logger.error("Player one not found for swap.");
            return;
        }
        const playerTwo = await Swap.getPlayerTwo();        
        if (playerTwo) { // the second player is defined and therefore is open
            if (playerOne.id === playerTwo.id) { // the players are the same so just close and reopen the player
                await Swap.swapPlayer(playerOne, playerTwo.streamData?.title || "UNKNOWN");
            } else { // the players are different, but both open so just swap the two players
                await Swap.swapPlayer(playerOne, playerTwo.streamData?.title || "UNKNOWN");
                await Swap.swapPlayer(playerTwo, playerOne.streamData?.title || "UNKNOWN");
            }
        } else { // the second player is not open so just swap the open player with the new player
            await this.swapPlayer(playerOne, playerTitle);
        }
    }

    /**
     * Deletes the old player and creates a new one in its place with the same attributes (except for the stream data)
     * 
     * @param oldPlayer the player to be deleted and replaced 
     * @param newPlayer the player to be created and have the same attributes as the old player (except for the stream data)
     * @returns the new players id
     */
    private static async swapPlayer(oldPlayer: Player, newPlayerString: string) {
        let variables = {
            input: {
                alwaysOnTop: oldPlayer.alwaysOnTop,
                bounds: {
                    x: oldPlayer.bounds.x,
                    y: oldPlayer.bounds.y,
                    width: oldPlayer.bounds.width,
                    height: oldPlayer.bounds.height,
                },
                maintainAspectRatio: oldPlayer.maintainAspectRatio,
                fullscreen: oldPlayer.fullscreen,
                contentId: oldPlayer.streamData?.contentId,
            },
            playerDeleteId: oldPlayer.id,
        } as any;
        if (this.isOBCPlayer(newPlayerString)) {
            variables.input.driverTla = newPlayerString;         
        } else {
            variables.input.streamTitle = newPlayerString;
        }

        gql_client.mutate({
            mutation: gql`
                mutation Mutation($input: PlayerCreateInput!, $playerDeleteId: ID!) {
                    playerCreate(input: $input)
                    playerDelete(id: $playerDeleteId)
                }
            `,
            variables: variables
        }).then(async (result) => {
            if (result.errors) {
                streamDeck.logger.error("Error from mutation swapping players: " + JSON.stringify(result.errors));
                return;
            }
            const playerCreateId: string = result.data.playerCreate as string;
            const oldestPlayerId = await findOldestPlayerId();
            waitToSync(0, playerCreateId, oldPlayer, oldestPlayerId);
        }).catch((error) => {
            streamDeck.logger.error("Error swapping players: " + error);
        });
     }

    /**
     * Checks if the player is an OBC player
     * 
     * @param newPlayerString the title or tla of the player to check if it is an OBC player
     * @returns true if the player is an OBC player, false otherwise
     */
    private static isOBCPlayer(newPlayerString: string): boolean {
        return !NON_OBC_POSSIBLE_STREAMS.includes(newPlayerString);
    }

    /**
     * Gets the player that is currently open
     * 
     * @returns the player that is currently open
     */
    private static async getPlayerOne(): Promise<Player | undefined> {
        try {
            const result = await gql_client.query({
                query: gql`
                    query Player($playerId: ID!) {
                        player(id: $playerId) {
                            id
                            state { muted volume }
                            driverData { tla }
                            streamData { contentId title }
                            bounds { x y width height }
                            fullscreen
                            alwaysOnTop
                            maintainAspectRatio
                        }
                    }
                `,
                variables: {
                    playerId: Swap.playerOneId
                }
            });
            if (result.errors) {
                streamDeck.logger.error("Error getting player for swap: " + JSON.stringify(result.errors));
                return undefined;
            }
            return result.data.player as Player;
        } catch (error) {
            streamDeck.logger.error("Error getting player for swap: " + error);
            return undefined;
        }
    }

    /**
     * Gets the second player if it is open
     * if it is not open return undefined (when this happens use the playerTwoTitle to set the new player)
     * 
     * @returns the player that is currently open
     */
    private static async getPlayerTwo(): Promise<Player | undefined> { 
        if (await this.isPlayerTwoOpen()) {
            try {
                const result = await gql_client.query({
                    query: gql`
                        query Player {
                            players {
                                id
                                state { muted volume }
                                driverData { tla }
                                streamData { contentId title }
                                bounds { x y width height }
                                fullscreen
                                alwaysOnTop
                                maintainAspectRatio
                            }
                        }
                    `,
                });

                if (result.errors) {
                    streamDeck.logger.error("Error getting players for swap: " + JSON.stringify(result.errors));
                    return undefined;
                }

                const players = result.data.players as Player[];
                return players.find((player) => player.streamData?.title === Swap.playerTwoTitle);
            } catch (error) {
                streamDeck.logger.error("Error getting players for swap: " + error);
                return undefined;
            }
        } else {
            return undefined;
        }
    }

    /**
     * Checks if the second player is open
     * 
     * @returns true if the second player is open, false otherwise
     */
    private static async isPlayerTwoOpen(): Promise<boolean> {
        return gql_client.query({
            query: gql`
                query Query {
                    players {
                        streamData {
                            title
                        }
                    }
                }
            `,
        }).then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error getting players for swap: " + JSON.stringify(result.errors));
                return false;
            }

            const players = result.data.players as Player[];
            const playerTwo = players.find((player) => player.streamData?.title === Swap.playerTwoTitle);
            return playerTwo !== undefined;
        }).catch((error) => {
            streamDeck.logger.error("Error getting players for swap: " + error);
            return false;
        });
    }
}

function getOldestPlayerId(): string {
    throw new Error("Function not implemented.");
}
