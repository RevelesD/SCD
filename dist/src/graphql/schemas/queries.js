"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = `
  document(id: ID!): Document!
  documents(search: SearchDocument!): [Document!]!
  """
  Category is the 'clave' of the category\n
  '999' for pending documents
  '000' for all categories 
  """
  documentsQuantity(user: ID!, category: String!): Int!
  
  campus(id: ID!): Campus!
  allCampus(page: Int!, perPage: Int!): [Campus!]!
  
  permission(id: ID!): Permission!
  permissions(page: Int!, perPage: Int!): [Permission!]!
  
  notice(id: ID!): Notice!
  """
  status: 
    0.-Oculto
    1.-Vigente
    2.-Vencido
    3.-Todos
  """
  notices(page: Int!, perPage: Int!, status: Int!): [Notice!]!
  
  user(id: ID!): User!
  users(page: Int!, perPage: Int!): [User!]!
  login(clave: String!, password: String!): AuthData!
  """
  type: Int!\n
    1 - Search by _id\n
    2 - Search by clave\n
  """
  category(type: Int!, uid: ID!): Category!
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
//# sourceMappingURL=queries.js.map