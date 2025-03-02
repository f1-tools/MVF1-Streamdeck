import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { changeAllPlayersVolumeBy, changePlayerVolumeBy, switchToPlayerPickerProfile } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";

type Settings = {
    global: boolean; // whether to decrease all players or just the selected player
    nPercent: number; // the percent to decrease by
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.volume-down" })
export class VolumeDown extends SingletonAction<Settings> {
    private static nPercent: number; // Default to 10 percent if not set

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        if (settings.global) {
            this.globalVolumeDown(VolumeDown.nPercent ?? 10);
        } else {
            this.openPlayerSelectorForVolumeDown(ev);
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
        if (ev.payload.settings.nPercent) {
            VolumeDown.nPercent = ev.payload.settings.nPercent;
        }
    }

    /**
     * decreases the volume of all players by the given percent.
     * 
     * @param nPercent The percent to decrease by.
     */
    private async globalVolumeDown(nPercent: number) {
        changeAllPlayersVolumeBy(-nPercent);
    }

    /**
     * Opens the player selector profile for the user to select a player to decrease volume.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForVolumeDown(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.VOLUME_DOWN
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * Called by the player selector when a player is selected.
     * decreases the volume of the player by the given percent.
     * 
     * @param playerId The id of the player to seek.
     */
    public static async playerSelectedForVolumeDown(playerId: string) {
        changePlayerVolumeBy(playerId, -(VolumeDown.nPercent ?? 10));
    }
}