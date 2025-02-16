import streamDeck from "@elgato/streamdeck";
import { gql_client } from "./plugin";
import { gql } from '@apollo/client';

export const testMVF1Connection = async function () {
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
            streamDeck.logger.info(result);
            console.log(result);
        });
}