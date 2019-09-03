export const types = `
  type Documento {
    _id: ID!
    titulo: String!
    path: String!
    Categoria: ID!
    docente: ID!
    createdAt: Number!
    UpdatedAt: Number
  }
  
  input TypeInput {
    
  }

  type Facultad {
    _id: ID!
    nombre: String!
    numbero: String!
  }

  type Permiso {
    _id: ID!
    nombre: String!
  }

  type Aviso {
    _id: ID!
    titulo: String!
    cuerpo: String!
    status: String!
    link: String!
    imgLnk: String!
    createdBy: ID!
    createdAt: Number!
    UpdatedAt: Number
  }

  type Docente {
    _id: ID!
    clave: String!
    status: String!
    nombre: String!
    adscripcion: ID!
    permisos: [Permiso!]!
  }

  type Rubo {
    _id: ID!
    clave: String!
    titulo: String!
    categorias: [ID!]!
  }

  type Categoria {
    _id: ID!
    parent: ID!
    clave: String!
    titulo: String!
    puntos: Number
    children: [ID!]
  }

  type SystemLog {
    _id: ID!
    descripcion: String!
    cuaser: ID!
    createdAt: Number!
  }
`;
