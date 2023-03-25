import {ApolloClient, InMemoryCache, HttpLink, split} from "@apollo/client";
import createUploadLink from "apollo-upload-client/public/createUploadLink.js";
import {WebSocketLink} from "@apollo/client/link/ws";
import { setContext } from '@apollo/client/link/context';
import { getMainDefinition } from '@apollo/client/utilities';

export const baseUrl = process.env.NODE_ENV !== 'production' ? "https://api.chatadmin-mod.click" : 'https://api.i69app.com';
export const baseSocket = process.env.NODE_ENV !== 'production' ? "wss://api.chatadmin-mod.click/ws/graphql" : 'wss://api.i69app.com/ws/graphql';
// export const baseUrl = "https://api.chatadmin-mod.click";
// export const baseSocket = "wss://api.chatadmin-mod.click/ws/graphql";
const httpLink = new HttpLink({
    uri: baseUrl,
});
const uploadLink = createUploadLink(
    {
        uri: baseUrl
    });

const authLink = setContext((_, { headers }) => {
    return {
        headers: {
            ...headers,
            Authorization: `Token ${localStorage.token}`,
        },
    };
});

const wsLink = new WebSocketLink({
    uri: baseSocket,
    options: {
        reconnect: true,
        lazy: true,
    },
});
// Send query request based on the type definition
const link = split(
    ({ query }) => {
        const definition = getMainDefinition(query);
        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    authLink.concat(wsLink),
    authLink.concat(httpLink),
);

export const client = new ApolloClient({
    cache: new InMemoryCache(),
    link
});

export const clientUpload = new ApolloClient({
    cache: new InMemoryCache(),
    link: authLink.concat(uploadLink),
});