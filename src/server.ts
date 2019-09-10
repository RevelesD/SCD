import { typeDefs } from './graphql/schemas';
import { resolvers } from './graphql/resolvers';
//const typeDefs = require('./graphql/schemas/index');
//const resolvers = require('./graphql/resolvers/index');

const { ApolloServer } = require('apollo-server');

const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers,
  introspection: true,
  playground: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
