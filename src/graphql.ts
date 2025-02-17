import streamDeck from "@elgato/streamdeck";
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';

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

export const testMVConnection = async function () {
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