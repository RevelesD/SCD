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
  login(clave: String!, password: String!): AuthData!
  
  category(id: ID!): Category!
  """
  Type: Int!\n
    1 - Root categories\n
    2 - Leaf categories\n
    3 - All categories\n 
  """
  categories(page: Int!, perPage: Int!, type: Int!): [Category!]!
  
  systemLog(id: ID!): SystemLog!
  systemLogs(input: SearchLogs!): [SystemLog!]!
  
  getTree(cat: ID!, user: ID!): Branch!
`;
