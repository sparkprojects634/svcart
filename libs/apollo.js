import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const client = new ApolloClient({
  link: new HttpLink({
    uri: process.env.NEXT_PUBLIC_WP_GRAPHQL_API,
  }),
  cache: new InMemoryCache(),
});

export default client;