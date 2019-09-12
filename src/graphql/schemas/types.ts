export const types = `
  type Document {
    _id: ID!
    title: String!
    path: String!
    category: ID!
    owner: ID!
    createdAt: Int!
    updatedAt: Int
  }
  
  input  InputDocument {
    title: String!
    path: String!
    category: ID!
    owner: ID!
  }

  input UpdateDocument{
    title: String
    path: String
    category: ID
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
    status: String!
    link: String!
    imgLnk: String!
    createdBy: ID!
    fromDate: Float!
    toDate: Float!
    createdAt: Float!
    UpdatedAt: Float
  }

  input InputNotice {
    title: String!
    body: String!
    status: String!
    link: String!
    imgLnk: String!
    fromDate: Float!
    toDate: Float!
  }

  input UpdateNotice {
    title: String
    body: String
    status: String
    link: String
    imgLnk: String
    fromDate: Int
    toDate: Int
  }

  type User {
    _id: ID!
    clave: String!
    status: String!
    name: String!
    adscription: Campus!
    permissions: [Permission!]!
  }

  input InputUser {
    clave: String!
    status: String!
    name: String!
    adscription: String!
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
    permissionId: ID!
    action: Int!
  }

  type Rubro {
    _id: ID!
    clave: String!
    title: String!
    categorias: [ID!]!
  }

  input InputRubro {
    clave: String!
    title: String!
    categorias: [ID!]!
  }

  input UpdateRubro {
    clave: String
    title: String
    categorias: [ID!]
  }

  type Category {
    _id: ID!
    parent: ID!
    clave: String!
    title: String!
    puntos: Int
    children: [ID!]
  }

  input InputCategory {
    parent: ID!
    clave: String!
    title: String!
    puntos: Int
    children: [ID!]
  }

  input UpdateCategory {
    parent: ID
    clave: String
    title: String
    value: Int
    children: [ID!]
  }

  type SystemLog {
    _id: ID!
    description: String!
    cuaser: ID!
    createdAt: Int!
  }
  
  input InputSystemLog {
    descripcion: String!
    cuaser: ID!
  }
  
  type File {
    _id: ID!
    filename: String!
    mimetype: String!
    encoding: String!
  }
  
  
`;
