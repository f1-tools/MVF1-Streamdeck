import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, SingletonAction } from "@elgato/streamdeck";
import { changeAllPlayersVolumeBy, changePlayerVolumeBy, switchToPlayerPickerProfile } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-types";

type Settings = {
    global: string; // "AP" (all players) or "SP" (selected player)
    nPercent: number; // the percent to increase by
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.volume-up" })
export class VolumeUp extends SingletonAction<Settings> {
    private static nPercent: number; // Default to 10 percent if not set

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        settings.global = settings.global === undefined ? "SP" : settings.global;
        if (settings.global === "AP") {
            this.globalVolumeUp(VolumeUp.nPercent ?? 25);
        } else {
            this.openPlayerSelectorForVolumeUp(ev);
        }
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
        if (ev.payload.settings.nPercent) {
            VolumeUp.nPercent = ev.payload.settings.nPercent;
        }
    }

    /**
     * Increases the volume of all players by the given percent.
     * 
     * @param nPercent The percent to increase by.
     */
    private async globalVolumeUp(nPercent: number) {
        changeAllPlayersVolumeBy(nPercent);
    }

    /**
     * Opens the player selector profile for the user to select a player to increase volume.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForVolumeUp(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.VOLUME_UP
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * Called by the player selector when a player is selected.
     * increases the volume of the player by the given percent.
     * 
     * @param playerId The id of the player to seek.
     */
    public static async playerSelectedForVolumeUp(playerId: string) {
        changePlayerVolumeBy(playerId, VolumeUp.nPercent ?? 25);
    }
}