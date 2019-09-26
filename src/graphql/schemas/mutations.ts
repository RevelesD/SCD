export const mutations = `
  singleUpload(file: Upload!, input: InputDocument!): Document!
  multipleUpload(files: [Upload!]!, input: InputDocument!): [Document!]!
  updateDocument(id: ID!, input: UpdateDocument!): Document!
  deleteDocument(id: ID!): Document!

  createCampus(input: InputCampus!): Campus!
  updateCampus(id: ID! input: UpdateCampus!): Campus!
  deleteCampus(id: ID!): Campus!

  createPermission(input: InputPermission!): Permission!
  updatePermission(id: ID! input: InputPermission!): Permission!
  deletePermission(id: ID!): Permission!

  createNotice(input: InputNotice!): Notice!
  updateNotice(id: ID! input: UpdateNotice!): Notice!
  deleteNotice(id: ID!): Notice!

  createUser(input: InputUser!): User!
  updateUser(id: ID! input: UpdateUser!): User!
  updateUserRole(input: UpdateUserRole!): User!
  deleteUser(id: ID!): User!

  createRootCategory(input: InputCategory!): Category!
  createLeafCategory(parent: ID!, input: InputCategory!): Category!
  updateCategory(id: ID!, input: UpdateCategory!): Category!
  deleteCategory(id: ID!): Category!
`;
