import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PausePlay } from "./actions/pause-play";
import { testMVConnection } from "./graphql";
import { Sync } from "./actions/sync";

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions.
streamDeck.actions.registerAction(new PausePlay());
streamDeck.actions.registerAction(new Sync());

// Test connection to MV
streamDeck.system.onSystemDidWakeUp(() => {
    testMVConnection();
});

streamDeck.devices.onDeviceDidConnect(() => {
    testMVConnection();
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
