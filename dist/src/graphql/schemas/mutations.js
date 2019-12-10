"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutations = `
  singleUpload(file: Upload!, input: InputDocument!): Document!
  multipleUpload(files: [Upload!]!, input: InputDocument!): [Document!]!
  updateDocument(id: ID!, input: UpdateDocument!): Document!
  """
  Pending of approval for delete
  """
  deleteDocument(id: ID!): DeletedResponses!
  moveDocument(doc: ID!, cat: ID!): Document!
  deleteDocuments(ids: [ID!]!): DeletedResponses!

  createCampus(input: InputCampus!): Campus!
  updateCampus(id: ID! input: UpdateCampus!): Campus!
  deleteCampus(id: ID!): Campus!

  createPermission(input: InputPermission!): Permission!
  updatePermission(id: ID! input: InputPermission!): Permission!
  deletePermission(id: ID!): Permission!

  createNotice(file: Upload!, input: InputNotice!): Notice!
  updateNotice(id: ID! input: UpdateNotice!, file: Upload): Notice!
  deleteNotice(id: ID!): Notice!

  createUser(input: InputUser!): User!
  """
  UpdateUser:
  status: "Activo" || "Inactivo"
  """
  updateUser(id: ID! status: String!): User!
  updateUserRole(input: UpdateUserRole!): User!
  deleteUser(id: ID!): User!

  createRootCategory(input: InputCategory!): Category!
  createLeafCategory(parent: ID!, input: InputCategory!): Category!
  updateCategory(id: ID!, input: UpdateCategory!): Category!
  deleteCategory(id: ID!): Category!
`;
//# sourceMappingURL=mutations.js.map