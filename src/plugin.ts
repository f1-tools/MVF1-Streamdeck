import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PausePlay } from "./actions/pause-play";
import { testMVConnection } from "./graphql";
import { Sync } from "./actions/sync";
import { Forward } from "./actions/forward";
import { Rewind } from "./actions/rewind";
import { PlayerSelector } from "./actions/player-selector";
import { GlobalSettings, PlayerPickerCaller } from "./global-settings-type";


// We can enable "trace" logging so that all messages between the Stream Deck, 
// and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions.
streamDeck.actions.registerAction(new PlayerSelector());
streamDeck.actions.registerAction(new Sync());
streamDeck.actions.registerAction(new PausePlay());
streamDeck.actions.registerAction(new Forward());
streamDeck.actions.registerAction(new Rewind());

// Test connection to MV
streamDeck.system.onSystemDidWakeUp(() => {
    testMVConnection();
});

streamDeck.devices.onDeviceDidConnect(() => {
    testMVConnection();
    
    streamDeck.devices.forEach((device) => {
        const { id, isConnected, name, size, type } = device;
        streamDeck.logger.info(`Device connected: 
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
