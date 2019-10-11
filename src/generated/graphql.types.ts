export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
  /** The `Upload` scalar type represents a file upload. */
  Upload: any,
};


export type AuthData = {
   __typename?: 'AuthData',
  userId: Scalars['ID'],
  token: Scalars['String'],
  tokenExpiration: Scalars['Int'],
};

export enum CacheControlScope {
  Public = 'PUBLIC',
  Private = 'PRIVATE'
}

export type Campus = {
   __typename?: 'Campus',
  _id: Scalars['ID'],
  name: Scalars['String'],
  phone: Scalars['String'],
};

export type Category = {
   __typename?: 'Category',
  _id: Scalars['ID'],
  root: Scalars['Boolean'],
  clave: Scalars['String'],
  title: Scalars['String'],
  path: Scalars['String'],
  value?: Maybe<Scalars['Int']>,
  children?: Maybe<Array<Category>>,
};

export type Document = {
   __typename?: 'Document',
  _id: Scalars['ID'],
  fileName: Scalars['String'],
  fileId: Scalars['ID'],
  mimetype: Scalars['String'],
  size: Scalars['Float'],
  path: Scalars['String'],
  category: Category,
  owner: User,
  createdAt: Scalars['Float'],
  updatedAt?: Maybe<Scalars['Float']>,
};

export type InputCampus = {
  name: Scalars['String'],
  phone: Scalars['String'],
};

export type InputCategory = {
  clave: Scalars['String'],
  title: Scalars['String'],
  value?: Maybe<Scalars['Int']>,
};

export type InputDocument = {
  category: Scalars['ID'],
  owner: Scalars['ID'],
};

/** 
 * Status:
 * 
 * 0.- "Oculto"
 * 1.- "Vigente"
 * 2.- "Vencido"
 **/
export type InputNotice = {
  title: Scalars['String'],
  body: Scalars['String'],
  status: Scalars['Int'],
  link: Scalars['String'],
  imgLnk: Scalars['String'],
  fromDate: Scalars['Float'],
  toDate: Scalars['Float'],
  createdBy: Scalars['ID'],
};

export type InputPermission = {
  rank: Scalars['Int'],
};

export type InputUser = {
  clave: Scalars['String'],
  status: Scalars['String'],
  name: Scalars['String'],
  adscription: Scalars['ID'],
};

export type Mutation = {
   __typename?: 'Mutation',
  singleUpload: Document,
  multipleUpload: Array<Document>,
  updateDocument: Document,
  deleteDocument: Document,
  createCampus: Campus,
  updateCampus: Campus,
  deleteCampus: Campus,
  createPermission: Permission,
  updatePermission: Permission,
  deletePermission: Permission,
  createNotice: Notice,
  updateNotice: Notice,
  deleteNotice: Notice,
  createUser: User,
  updateUser: User,
  updateUserRole: User,
  deleteUser: User,
  createRootCategory: Category,
  createLeafCategory: Category,
  updateCategory: Category,
  deleteCategory: Category,
};


export type MutationSingleUploadArgs = {
  file: Scalars['Upload'],
  input: InputDocument
};


export type MutationMultipleUploadArgs = {
  files: Array<Scalars['Upload']>,
  input: InputDocument
};


export type MutationUpdateDocumentArgs = {
  id: Scalars['ID'],
  input: UpdateDocument
};


export type MutationDeleteDocumentArgs = {
  id: Scalars['ID']
};


export type MutationCreateCampusArgs = {
  input: InputCampus
};


export type MutationUpdateCampusArgs = {
  id: Scalars['ID'],
  input: UpdateCampus
};


export type MutationDeleteCampusArgs = {
  id: Scalars['ID']
};


export type MutationCreatePermissionArgs = {
  input: InputPermission
};


export type MutationUpdatePermissionArgs = {
  id: Scalars['ID'],
  input: InputPermission
};


export type MutationDeletePermissionArgs = {
  id: Scalars['ID']
};


export type MutationCreateNoticeArgs = {
  input: InputNotice
};


export type MutationUpdateNoticeArgs = {
  id: Scalars['ID'],
  input: UpdateNotice
};


export type MutationDeleteNoticeArgs = {
  id: Scalars['ID']
};


export type MutationCreateUserArgs = {
  input: InputUser
};


export type MutationUpdateUserArgs = {
  id: Scalars['ID'],
  input: UpdateUser
};


export type MutationUpdateUserRoleArgs = {
  input: UpdateUserRole
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']
};


export type MutationCreateRootCategoryArgs = {
  input: InputCategory
};


export type MutationCreateLeafCategoryArgs = {
  parent: Scalars['ID'],
  input: InputCategory
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID'],
  input: UpdateCategory
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']
};

export type Notice = {
   __typename?: 'Notice',
  _id: Scalars['ID'],
  title: Scalars['String'],
  body: Scalars['String'],
  status: Scalars['Int'],
  link: Scalars['String'],
  imgLnk: Scalars['String'],
  fromDate: Scalars['Float'],
  toDate: Scalars['Float'],
  createdBy: Scalars['ID'],
  createdAt: Scalars['Float'],
  updatedAt?: Maybe<Scalars['Float']>,
};

export type Permission = {
   __typename?: 'Permission',
  _id: Scalars['ID'],
  rank: Scalars['Int'],
};

export type Query = {
   __typename?: 'Query',
  document: Document,
  documents: Array<Document>,
  campus: Campus,
  allCampus: Array<Campus>,
  permission: Permission,
  permissions: Array<Permission>,
  notice: Notice,
  notices: Array<Notice>,
  user: User,
  users: Array<User>,
  login: AuthData,
  category: Category,
  categories: Array<Category>,
  systemLog: SystemLog,
  systemLogs: Array<SystemLog>,
};


export type QueryDocumentArgs = {
  id: Scalars['ID']
};


export type QueryDocumentsArgs = {
  search: SearchDocument
};


export type QueryCampusArgs = {
  id: Scalars['ID']
};


export type QueryAllCampusArgs = {
  page: Scalars['Int'],
  perPage: Scalars['Int']
};


export type QueryPermissionArgs = {
  id: Scalars['ID']
};


export type QueryPermissionsArgs = {
  page: Scalars['Int'],
  perPage: Scalars['Int']
};


export type QueryNoticeArgs = {
  id: Scalars['ID']
};


export type QueryNoticesArgs = {
  page: Scalars['Int'],
  perPage: Scalars['Int']
};


export type QueryUserArgs = {
  id: Scalars['ID']
};


export type QueryUsersArgs = {
  page: Scalars['Int'],
  perPage: Scalars['Int']
};


export type QueryLoginArgs = {
  name: Scalars['String'],
  clave: Scalars['String']
};


export type QueryCategoryArgs = {
  id: Scalars['ID']
};


export type QueryCategoriesArgs = {
  page: Scalars['Int'],
  perPage: Scalars['Int']
};


export type QuerySystemLogArgs = {
  id: Scalars['ID']
};


export type QuerySystemLogsArgs = {
  input: SearchLogs
};

export type SearchDocument = {
  user: Scalars['ID'],
  page: Scalars['Int'],
  perPage: Scalars['Int'],
  category?: Maybe<Scalars['ID']>,
  fileName?: Maybe<Scalars['String']>,
};

export type SearchLogs = {
  from: Scalars['Float'],
  to: Scalars['Float'],
  page: Scalars['Int'],
  perPage: Scalars['Int'],
  user?: Maybe<Scalars['ID']>,
};

export type SystemLog = {
   __typename?: 'SystemLog',
  _id: Scalars['ID'],
  description: Scalars['String'],
  causer: Scalars['ID'],
  from: Scalars['String'],
  requestType: Scalars['String'],
  createdAt: Scalars['Float'],
};

export type TypeInputPermission = {
  _id: Scalars['ID'],
  rank: Scalars['Int'],
};

export type UpdateCampus = {
  name?: Maybe<Scalars['String']>,
  phone?: Maybe<Scalars['String']>,
};

export type UpdateCategory = {
  clave?: Maybe<Scalars['String']>,
  title?: Maybe<Scalars['String']>,
  value?: Maybe<Scalars['Int']>,
};

export type UpdateDocument = {
  fileName?: Maybe<Scalars['String']>,
  category?: Maybe<Scalars['ID']>,
};

/** 
 * Status:
 * 0.- "Oculto"
 * 1.- "Vigente"
 * 2.- "Vencido"
 **/
export type UpdateNotice = {
  title?: Maybe<Scalars['String']>,
  body?: Maybe<Scalars['String']>,
  status?: Maybe<Scalars['Int']>,
  link?: Maybe<Scalars['String']>,
  imgLnk?: Maybe<Scalars['String']>,
  fromDate?: Maybe<Scalars['Int']>,
  toDate?: Maybe<Scalars['Int']>,
};

export type UpdateUser = {
  status?: Maybe<Scalars['String']>,
};

/** 
 * actions: 
 * 1 - add permission
 * 2 - remove permission
 **/
export type UpdateUserRole = {
  userId: Scalars['ID'],
  permissionId: Scalars['ID'],
  action: Scalars['Int'],
};


/** 
 * Activo
 * Inactivo
 **/
export type User = {
   __typename?: 'User',
  _id: Scalars['ID'],
  clave: Scalars['String'],
  status: Scalars['String'],
  name: Scalars['String'],
  adscription: Campus,
  permissions: Array<Permission>,
};

