import streamDeck, { LogLevel } from "@elgato/streamdeck";
import { PausePlay } from "./actions/pause-play";
import { ApolloClient, InMemoryCache, gql} from '@apollo/client';

export const gql_client = new ApolloClient({
    uri: 'http://localhost:10101/api/graphql',
    cache: new InMemoryCache(),
    defaultOptions: { //turn off cache to avoid stale data
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore'
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all'
        }
    }
  });

const testMVConnection = async function () {
    gql_client
        .query({
            query: gql`
                query Query {
                    version
                    systemInfo {
                        arch
                        platform
                    }
                }
            `,    
        })
        .then((result) => {
            if (result.errors) {
                streamDeck.logger.error("Error connecting to MV: " + JSON.stringify(result.errors));
                return false;
            }
            streamDeck.logger.info("Connected to MV: " + JSON.stringify(result.data));
            return true;
        }).catch((error) => {
            streamDeck.logger.error("Error connecting to MV: " + error);
            return false;
        });
}

// We can enable "trace" logging so that all messages between the Stream Deck, and the plugin are recorded. When storing sensitive information
streamDeck.logger.setLevel(LogLevel.TRACE);

// Register actions.
streamDeck.actions.registerAction(new PausePlay());

// Test connection to MV
streamDeck.system.onSystemDidWakeUp(() => {
    testMVConnection();
});

streamDeck.devices.onDeviceDidConnect(() => {
    testMVConnection();
});

// Finally, connect to the Stream Deck.
streamDeck.connect();
