export const types = `
  type Document {
    _id: ID!
    fileName: String!
    fileId: ID!
    mimetype: String!
    size: Float!
    path: String!
    category: Category!
    owner: User!
    createdAt: Float!
    updatedAt: Float
  }
  
  input InputDocument {
    category: ID!
    owner: ID!
  }

  input UpdateDocument {
    fileName: String
    category: ID
  }
  """
  SearchDocument\n
  user: userId\n
  category: category clave\n 
  """
  input SearchDocument {
    user: ID!
    page: Int!
    perPage: Int!
    category: String
    fileName: String
  }
  
  type Campus {
    _id: ID!
    name: String!
    phone: String!
  }

  input InputCampus {
    name: String!
    phone: String!
  }

  input UpdateCampus{
    name: String
    phone: String
  }
  
  type Permission {
    _id: ID!
    rank: Int!
  }

  input TypeInputPermission {
    _id: ID!
    rank: Int!
  }

  input InputPermission {
    rank: Int!
  }

  type Notice {
    _id: ID!
    title: String!
    body: String!
    status: Int!
    link: String!
    imgLnk: String!
    fromDate: Float!
    toDate: Float!
    createdBy: ID!
    createdAt: Float!
    updatedAt: Float
  }
  """
  Status:\n
  0.- "Oculto"
  1.- "Vigente"
  2.- "Vencido"
  3.- "Todos"
  """
  input InputNotice {
    title: String!
    body: String!
    status: Int!
    link: String!
    fromDate: Float!
    toDate: Float!
    createdBy: ID!
  }
  """
  Status:
  0.- "Oculto"
  1.- "Vigente"
  2.- "Vencido"
  """
  input UpdateNotice {
    title: String
    body: String
    status: Int
    link: String
    fromDate: Float
    toDate: Float
  }
  """
  Activo
  Inactivo
  """
  type User {
    _id: ID!
    clave: String!
    status: String!
    name: String!
    lastName: String!
    adscription: Campus!
    permissions: [Permission!]!
  }
  
  type AuthData {
    userId: ID!
    token: String!
    tokenExpiration: Int!
  }

  input InputUser {
    clave: String!
    status: String!
    name: String!
    lastName: String!
    adscription: ID!
  }

  input UpdateUser {
    status: String
  }
  """
  actions: 
  1 - add permission
  2 - remove permission
  """
  input UpdateUserRole {
    userId: ID!
    permissionRank: Int!
    action: Int!
  }
 
  type Category {
    _id: ID!
    root: Boolean!
    clave: String!
    title: String!
    path: String!
    value: Int
    children: [Category!]
  }

  input InputCategory {
    clave: String!
    title: String!
    value: Int
  } 

  input UpdateCategory {
    clave: String
    title: String
    value: Int
  }

  type SystemLog {
    _id: ID!
    description: String!
    causer: ID!
    from: String!
    requestType: String!
    requestName: String!
    createdAt: Float!
  }
  
  input SearchLogs {
    from: Float!
    to: Float!
    page: Int!
    perPage: Int!
    user: ID
  }
  
  type Branch {
    _id: ID!
    children: [Branch!]!
    label: String!
    type: String!
  }
  
  type DeletedResponses {
    deletedCount: Int!
    errors: [String!]!
  }
`;
