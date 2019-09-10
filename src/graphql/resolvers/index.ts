import { documentQueries, documentMutations } from './document.resolver';
import { campusQueries, campusMutations } from './campus.resolver';
import { categoryQueries, categoryMutations } from './category.resolver';
import { noticeQueries, noticeMutations } from './notice.resolver';
import { permissionQueries, permissionMutations } from './permission.resolver';
import { rubroQueries, rubroMutations } from './rubro.resolver';
import { systemLogQueries, systemLogMutations } from './systemLog.resolver';
import { userQueries, userMutations } from './user.resolver';
import { uploadsMutations, uploadsQueries } from './uploads.resolver';


const resolvers = {
  Query: {
    ...documentQueries,
    ...campusQueries,
    ...categoryQueries,
    ...noticeQueries,
    ...permissionQueries,
    ...rubroQueries,
    ...systemLogQueries,
    ...userQueries,
    ...uploadsQueries
  },
  Mutation: {
    ...documentMutations,
    ...campusMutations,
    ...categoryMutations,
    ...noticeMutations,
    ...permissionMutations,
    ...rubroMutations,
    ...systemLogMutations,
    ...userMutations,
    ...uploadsMutations
  }
};

export default resolvers;
