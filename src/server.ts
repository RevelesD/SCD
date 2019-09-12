import typeDefs from './graphql/schemas/index';
import resolvers from './graphql/resolvers/index';
import { config } from "../enviroments.dev";
const mongoose = require('mongoose');
const { ApolloServer,  } = require('apollo-server');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

mongoose.connect(
  config.mongooseURL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
);

const app = express();
const downloads = require('./routes/downloads.route')
app.use(cors());
app.use(bodyParser.json());
app.use('/download', downloads);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
  const port = process.env.PORT || '3000';
  app.listen(port, () => console.log(`Running on localhost:${port}`));
});
// apollo server
const server = new ApolloServer({
  typeDefs,
  resolvers: resolvers,
  introspection: true,
  playground: true
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
