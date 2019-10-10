import { typeDefs } from './graphql/schemas/index';
import { resolvers } from './graphql/resolvers/index';
import { config } from "../enviroments.dev";
import { getUser } from "./middleware/is-auth";
const mongoose = require('mongoose');
const { ApolloError } = require('apollo-server');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = 4000;
import { router } from './routes/downloads.route';
import * as path from "path";

mongoose.connect(
  config.mongooseURL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
);

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
  typeDefs,
  resolvers: resolvers,
  introspection: true,
  playground: true,
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || '';
    // try to retrieve a user with the token
    const user = getUser(token);
    user['ip'] = req.ip;
    // add the user to the context
    return { user };
  },
});
server.applyMiddleware({ app, path: '/graphql' });
app.use('/downloads', router);

app.listen({port}, () => {
  console.log(`🚀  server ready at http://localhost:${port}${server.graphqlPath}`);
});
