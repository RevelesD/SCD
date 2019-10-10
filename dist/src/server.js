"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./graphql/schemas/index");
const index_2 = require("./graphql/resolvers/index");
const enviroments_dev_1 = require("../enviroments.dev");
const is_auth_1 = require("./middleware/is-auth");
const mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4000;
const downloads_route_1 = require("./routes/downloads.route");
mongoose.connect(enviroments_dev_1.config.mongooseURL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to the database');
    // const port = process.env.PORT || '3000';
    // app.listen(port, () => console.log(`Running on localhost:${port}`));
});
const app = express();
app.use(cors());
app.use(bodyParser.json());
// apollo server
const server = new ApolloServer({
    typeDefs: index_1.typeDefs,
    resolvers: index_2.resolvers,
    introspection: true,
    playground: true,
    context: ({ req }) => {
        // get the user token from the headers
        const token = req.headers.authorization || '';
        // try to retrieve a user with the token
        const user = is_auth_1.getUser(token);
        user['ip'] = req.ip;
        // add the user to the context
        return { user };
    },
});
server.applyMiddleware({ app, path: '/graphql' });
app.use('/downloads', downloads_route_1.router);
app.listen({ port }, () => {
    console.log(`🚀  server ready at http://localhost:${port}${server.graphqlPath}`);
});
//# sourceMappingURL=server.js.map