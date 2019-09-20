export const queries = `
  document(id: ID!): Document!
  documents(search: SearchDocument!): [Document!]!
  
  campus(id: ID!): Campus!
  allCampus(page: Int!, perPage: Int!): [Campus!]!
  
  permission(id: ID!): Permission!
  permissions(page: Int!, perPage: Int!): [Permission!]!
  
  notice(id: ID!): Notice!
  notices(page: Int!, perPage: Int!): [Notice!]!
  
  user(id: ID!): User!
  users(page: Int!, perPage: Int!): [User!]!
  
  category(id: ID!): Category!
  categories(page: Int!, perPage: Int!): [Category!]!
  
  systemLog(id: ID!): SystemLog!
  systemLogs(input: SearchLogs!): [SystemLog!]!
`;
