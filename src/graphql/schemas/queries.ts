export const queries = `
  document(id: ID!): Document!
  documents(page: Int!, perPage: Int!): [Document!]!
  campus(id: ID!): Campus!
  allCampus(page: Int!, perPage: Int!): [Campus!]!
  permission(id: ID!): Permission!
  allPermisions(page: Int!, perPage: Int!): [Permission!]!
  notice(id: ID!): Notice!
  notices(page: Int!, perPage: Int!): [Notice!]!
  user(id: ID!): User!
  users(page: Int!, perPage: Int!): [User!]!
  rubro(id: ID!): Rubro!
  rubros(page: Int!, perPage: Int!): [Rubro!]!
  category(id: ID!): Category!
  categories(page: Int!, perPage: Int!): [Category!]!
  systemLog(id: ID!): SystemLog!
  systemLogs(from: Int!, to: Int!): [SystemLog!]!
  
  uploads: [File]
  upload(id: ID!): File!
`;
