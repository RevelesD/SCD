export const mutations = `
  createDocument(input: InputDocument!): Document!
  updateDocument(input: UpdateDocument!): Document!
  deleteDocument(id: ID!): Document!

  createCampus(input: InputCampus!): Campus!
  updateCampus(input: UpdateCampus!): Campus!
  deleteCampus(id: ID!): Campus!

  createPermission(input: InputPermission!): Permission!
  updatePermission(input: UpdatePermission!): Permission!
  deletePermission(id: ID!): Permission!

  createNotice(input: InputNotice!): Notice!
  updateNotice(input: UpdateNotice!): Notice!
  deleteNotice(id: ID!): Notice!

  createUser(input: InputUser!): User!
  updateUser(input: UpdateUser!): User!
  deleteUser(id: ID!): User!

  createRubro(input: InputRubro!): Rubro!
  updateRubro(input: UpdateRubro!): Rubro!
  deleteRubro(id: ID!): Rubro!

  createCategory(input: InputCategory!): Category!
  updateCategory(input: UpdateCategory!): Category!
  deleteCategory(id: ID!): Category!

  createSystemLog(input: InputSystemLog!): SystemLog!

`;
