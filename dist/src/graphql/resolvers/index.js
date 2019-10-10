"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_resolver_1 = require("./document.resolver");
const campus_resolver_1 = require("./campus.resolver");
const category_resolver_1 = require("./category.resolver");
const notice_resolver_1 = require("./notice.resolver");
const permission_resolver_1 = require("./permission.resolver");
const systemLog_resolver_1 = require("./systemLog.resolver");
const user_resolver_1 = require("./user.resolver");
const uploads_resolver_1 = require("./uploads.resolver");
const authLogin_resolver_1 = require("./authLogin.resolver");
exports.resolvers = {
    Query: {
        ...document_resolver_1.documentQueries,
        ...campus_resolver_1.campusQueries,
        ...category_resolver_1.categoryQueries,
        ...notice_resolver_1.noticeQueries,
        ...permission_resolver_1.permissionQueries,
        ...systemLog_resolver_1.systemLogQueries,
        ...user_resolver_1.userQueries,
        ...uploads_resolver_1.uploadsQueries,
        ...authLogin_resolver_1.loginQueries
    },
    Mutation: {
        ...document_resolver_1.documentMutations,
        ...campus_resolver_1.campusMutations,
        ...category_resolver_1.categoryMutations,
        ...notice_resolver_1.noticeMutations,
        ...permission_resolver_1.permissionMutations,
        ...systemLog_resolver_1.systemLogMutations,
        ...user_resolver_1.userMutations,
        ...uploads_resolver_1.uploadsMutations
    }
};
//# sourceMappingURL=index.js.map