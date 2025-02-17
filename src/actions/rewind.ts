import streamDeck, { action, KeyDownEvent, KeyUpEvent, SingletonAction } from "@elgato/streamdeck";
import { repeatSeekAsync } from "../helpers";

@action({ UUID: "com.f1-tools.multiviewer-streamdeck.rewind" })
export class Rewind extends SingletonAction<Settings> {
    private pressed = { value: false }; // So the value is passed by reference and we can change it onKeyUp

    override async onKeyDown(ev: KeyDownEvent<Settings>): Promise<void> {
        const settings = await ev.action.getSettings();
        this.pressed.value = true;
        const nSeconds = settings.nSeconds ?? 10; // Default to 10 seconds if not set
        repeatSeekAsync(this.pressed, -nSeconds); // Note the negative sign to make rewind
    }

    override async onKeyUp(ev: KeyUpEvent<Settings>): Promise<void> {
        this.pressed.value = false;
    }
}

type Settings = {
    nSeconds:number; // the number of seconds to forward // TODO make nSeconds configurable
};