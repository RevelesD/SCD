export const types = `
  type Document {
    _id: ID!
    title: String!
    path: String!
    category: ID!
    owner: ID!
    createdAt: Number!
    updatedAt: Number
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
  """
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
  """
  type Permission {
    _id: ID!
    name: String!
  }

  input InputPermission {
    name: String!
  }

  input UpdatePermission {
    name: String
  }

  input TypeInputPermiso {
    _id: ID!
    name: String!
  }

  type Notice {
    _id: ID!
    title: String!
    body: String!
    status: String!
    link: String!
    imgLnk: String!
    createdBy: ID!
    fromDate: Number!
    toDate: Number!
    createdAt: Number!
    UpdatedAt: Number
  }

  input InputNotice {
    title: String!
    body: String!
    status: String!
    link: String!
    imgLnk: String!
    fromDate: Number!
    toDate: Number!
  }

  input UpdateNotice {
    title: String
    body: String
    status: String
    link: String
    imgLnk: String
    fromDate: Number
    toDate: Number
  }

  type User {
    _id: ID!
    clave: String!
    status: String!
    name: String!
    adscription: ID!
    permissions: [Permission!]!
  }

  input InputUser {
    clave: String!
    status: String!
    name: String!
    adscription: ID!
    permissions: [TypeInputPermiso!]!
  }

  input UpdateUser {
    status: String
    permissions: [TypeInputPermiso!]
  }

  type Rubro {
    _id: ID!
    clave: String!
    title: String!
    categorias: [ID!]!
  }

  input InputRubro {
    clave: string!
    title: string!
    categorias: [ID!]!
  }

  input UpdateRubro {
    clave: string
    title: string
    categorias: [ID!]
  }

  type Category {
    _id: ID!
    parent: ID!
    clave: String!
    title: String!
    puntos: Number
    children: [ID!]
  }

  input InputCategory {
    parent: ID!
    clave: String!
    title: String!
    puntos: Number
    children: [ID!]
  }

  input UpdateCategory {
    parent: ID
    clave: String
    title: String
    puntos: Number
    children: [ID!]
  }

  type SystemLog {
    _id: ID!
    descripcion: String!
    cuaser: ID!
    createdAt: Number!
  }
  
  input InputSystemLog {
    descripcion: String!
    cuaser: ID!
  }
`;
