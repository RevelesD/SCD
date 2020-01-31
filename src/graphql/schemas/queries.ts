export const queries = `
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
  """
  This query start from a parent category and recursively inspect all the sub categories, counting and summing the amount and documents that contains and the amount of RIPAUAQ points in total.\n
  Returns the complete tree, NOT only the root category.\n
  Depending on the hierarchy of the root, this can be a heavy query, feedback is recommended for the user waiting time. 
  """
  inspectCategory(user: ID!, category: ID!): CategoryInspected!
  """
  Returns the most relevant information of a category regarding a user
  the user parameter can be a userID or the code '000' for ALL users
  """
  summarizeCategory(user: ID!, category: ID!): CategoryResume!
  
  systemLog(id: ID!): SystemLog!
  systemLogs(input: SearchLogs!): [SystemLog!]!
  """
  cat  id, as stored on the db\n
  user id, as stored on the db\n
  """
  getTree(cat: ID!, user: ID!): Branch
`;
