import streamDeck, { action, DidReceiveSettingsEvent, KeyDownEvent, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { repeatSeekAsync, seekPlayerBySeconds, switchToPlayerPickerProfile } from "../helpers";
import { GlobalSettings, PlayerPickerCaller } from "../global-settings-type";

type Settings = {
    global: boolean; // whether to seek all players or just the selected player
    nSeconds: number; // the number of seconds to seek by
};

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.rewind" })
export class Rewind extends SingletonAction<Settings> {
    private pressed = { value: false }; // So the value is passed by reference and we can change it onKeyUp
    private static nSeconds: number; // Default to 10 seconds if not set

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        if (settings.global) {
            this.pressed.value = true;
            this.globalRewind(Rewind.nSeconds ?? 10);
        } else {
            this.openPlayerSelectorForRewind(ev);
        }
    }

    override async onKeyUp(ev: KeyUpEvent<Settings>): Promise<void> {
        this.pressed.value = false;
    }

    override async onDidReceiveSettings(ev: DidReceiveSettingsEvent<Settings>): Promise<void> {
        if (ev.payload.settings.nSeconds) {
            Rewind.nSeconds = ev.payload.settings.nSeconds;
        }
    }

    /**
     * Seeks all players by the given number of seconds.
     * 
     * Continues to seek until the key is released.
     * 
     * @param nSeconds The number of seconds to seek by.
     */
    private async globalRewind(nSeconds: number) {
        this.pressed.value = true;
        repeatSeekAsync(this.pressed, -nSeconds);
    }

    /**
     * Opens the player selector profile for the user to select a player to seek.
     * The seek action will only happen once. There is no holding down for a single player seek.
     * 
     * @param ev the key down event used to get the device to switch to the player selector profile
     */
    private async openPlayerSelectorForRewind(ev: KeyDownEvent<Settings>) {
        const newGlobalSettings: GlobalSettings = {
            playerPickerCaller: PlayerPickerCaller.REWIND
        };
        streamDeck.settings.setGlobalSettings(newGlobalSettings);
        switchToPlayerPickerProfile(ev.action.device);
    }

    /**
     * Seeks the player by the given number of seconds.
     * The seek action will only happen once. There is no holding down for a single player seek.
     * 
     * @param playerId The id of the player to seek.
     */
    public static async playerSelectedForOneTimeRewind(playerId: string) {
        seekPlayerBySeconds(playerId, -(Rewind.nSeconds ?? 10));
    }
}