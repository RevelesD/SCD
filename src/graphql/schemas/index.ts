import { gql } from 'apollo-server';
import { types } from './types';
import { queries } from './queries';
import { mutations } from './mutations';

export const typeDefs = gql`
  ${types}
  
  type Query {
    ${queries}
  }
  
  type Mutation {
    ${mutations}
  }
`;
