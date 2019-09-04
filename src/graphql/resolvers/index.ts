import { documentQueries, documentMutations } from './document.resolver';
import { campusQueries, campusMutations } from './campus.resolver';
import { categoryQueries, categoryMutations } from './category.resolver';
import { noticeQueries, noticeMutations } from './notice.resolver';
import { PermissionQueries, PermissionMutations } from './permission.resolver';
import { rubroQueries, rubroMutations } from './rubro.resolver';
import { systemLogQueries, systemLogMutations } from './systemLog.resolver';
import { userQueries, userMutations } from './user.resolver';


const resolvers = {
  Query: {
    ...documentQueries,
    ...campusQueries,
    ...categoryQueries,
    ...noticeQueries,
    ...PermissionQueries,
    ...rubroQueries,
    ...systemLogQueries,
    ...userQueries
  },
  Mutation: {
    ...documentMutations,
    ...campusMutations,
    ...categoryMutations,
    ...noticeMutations,
    ...PermissionMutations,
    ...rubroMutations,
    ...systemLogMutations,
    ...userMutations
  }
};

export default resolvers;
