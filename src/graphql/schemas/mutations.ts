export const mutations = `
  updateDocument(input: UpdateDocument!): Document!
  deleteDocument(id: ID!): Document!

  createCampus(input: InputCampus!): Campus!
  updateCampus(id: ID! input: UpdateCampus!): Campus!

  createPermission(input: InputPermission!): Permission!
  updatePermission(id: ID! input: InputPermission!): Permission!
  deletePermission(id: ID!): Permission!

  createNotice(input: InputNotice!): Notice!
  updateNotice(input: UpdateNotice!): Notice!
  deleteNotice(id: ID!): Notice!

  createUser(input: InputUser!): User!
  updateUser(id: ID! input: UpdateUser!): User!
  updateUserRole(input: UpdateUserRole!): User!
  deleteUser(id: ID!): User!

  createCategory(input: InputCategory!): Category!
  updateCategory(input: UpdateCategory!): Category!
  deleteCategory(id: ID!): Category!

  createSystemLog(input: InputSystemLog!): SystemLog!

  singleUpload(file: Upload!): Document!
  multipleUpload(files: [Upload!]!): [Document!]!
`;
