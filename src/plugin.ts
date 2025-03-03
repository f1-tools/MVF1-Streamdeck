import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PausePlay } from "./actions/pause-play";
import { testMVConnection } from "./graphql";
import { Sync } from "./actions/sync";
import { Forward } from "./actions/forward";
import { Rewind } from "./actions/rewind";
import { PlayerSelector } from "./actions/player-selector";
import { Speedometer } from "./actions/speedometer";
import { Header } from "./actions/header";
import { Fullscreen } from "./actions/fullscreen";
import { AlwaysOnTop } from "./actions/always-on-top";
import { Mute } from "./actions/mute";
import { VolumeUp } from "./actions/volume-up";
import { VolumeDown } from "./actions/volume-down";
import { Swap } from "./actions/swap";


// We can enable "trace" logging so that all messages between the Stream Deck, 
// and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions.
streamDeck.actions.registerAction(new PlayerSelector());
streamDeck.actions.registerAction(new Sync());
streamDeck.actions.registerAction(new PausePlay());
streamDeck.actions.registerAction(new Forward());
streamDeck.actions.registerAction(new Rewind());
streamDeck.actions.registerAction(new Speedometer());
streamDeck.actions.registerAction(new Header());
streamDeck.actions.registerAction(new Fullscreen());
streamDeck.actions.registerAction(new AlwaysOnTop());
streamDeck.actions.registerAction(new Mute());
streamDeck.actions.registerAction(new VolumeUp());
streamDeck.actions.registerAction(new VolumeDown());
streamDeck.actions.registerAction(new Swap());

// Test connection to MV
streamDeck.system.onSystemDidWakeUp(() => {
    testMVConnection();
});

streamDeck.devices.onDeviceDidConnect(() => {
    testMVConnection();
    
    streamDeck.devices.forEach((device) => {
        const { id, isConnected, name, size, type } = device;
        streamDeck.logger.trace(`Device connected: 
            id:${id} 
            isConnected:${isConnected} 
            name:${name} 
            size:
                columns:${size.columns} 
                rows:${size.rows} 
            type:${type}`);
    });
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
