export const queries = `
  document(id: ID!): Document!
  documents(offset: Int!, limit: Int!): [Document!]!
  campus(id: ID!): Campus!
  permission(id: ID!): Permission!
  notice(id: ID!): Notice!
  notices(offset: Int!, limit: Int!): [Notice!]!
  user(id: ID!): User!
  users(offset: Int!, limit: Int!): [User!]!
  rubro(id: ID!): Rubro!
  rubros(offset: Int!, limit: Int!): [Rubro!]!
  category(id: ID!): Category!
  categories(offset: Int!, limit: Int!): [Category!]!
  systemLog(id: ID!): SystemLog!
  systemLogs(from: Int!, to: Int!): [SystemLog!]!
`;
