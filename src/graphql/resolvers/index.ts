import { documentsQueries, documentMutation } from './document.resolver';

const resolvers = {
  Query: {
    ...documentsQueries
  },
  Mutation: {
    ...documentMutation
  }
};

export default resolvers;
