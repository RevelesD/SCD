import { typeDefs } from './graphql/schemas/index';
import { resolvers } from './graphql/resolvers/index';
require('dotenv').config()
import { getUser } from "./middleware/is-auth";
const mongoose = require('mongoose');
const { ApolloServer } = require('apollo-server-express');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const port = process.env.PORT || 4000;
import { router } from './routes/downloads.route';

mongoose.connect(
  process.env.DB_PATH + '/' + process.env.DB_NAME,
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
    // console.log(token);
    const user = getUser(token);
    user['ip'] = req.ip;
    // add the user to the context
    return { user };
  },
});
server.applyMiddleware({ app, path: '/graphql' });

app.use('/public', express.static(__dirname + '/public'));
app.use('/downloads', router);

app.listen({port}, () => {
  console.log(`🚀  server ready at http://localhost:${port}${server.graphqlPath}`);
});
