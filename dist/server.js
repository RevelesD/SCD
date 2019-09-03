"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./graphql/schemas/index");
const index_2 = require("./graphql/resolvers/index");
const { ApolloServer } = require('apollo-server');
const server = new ApolloServer({
    typeDefs: index_1.default,
    resolvers: index_2.default,
    introspection: true,
    playground: true
});
server.listen().then(({ url }) => {
    console.log(`🚀  Server ready at ${url}`);
});
//# sourceMappingURL=server.js.map