import { documentQueries, documentMutations } from './document.resolver';
import { campusQueries, campusMutations } from './campus.resolver';
import { categoryQueries, categoryMutations } from './category.resolver';
import { noticeQueries, noticeMutations } from './notice.resolver';
import { permissionQueries, permissionMutations } from './permission.resolver';
import { systemLogQueries, systemLogMutations } from './systemLog.resolver';
import { userQueries, userMutations } from './user.resolver';
import { uploadsMutations, uploadsQueries } from './uploads.resolver';
import { loginQueries } from './authLogin.resolver';


export const resolvers = {
  Query: {
    ...documentQueries,
    ...campusQueries,
    ...categoryQueries,
    ...noticeQueries,
    ...permissionQueries,
    ...systemLogQueries,
    ...userQueries,
    ...uploadsQueries,
    ...loginQueries
  },
  Mutation: {
    ...documentMutations,
    ...campusMutations,
    ...categoryMutations,
    ...noticeMutations,
    ...permissionMutations,
    ...systemLogMutations,
    ...userMutations,
    ...uploadsMutations
  }
};
