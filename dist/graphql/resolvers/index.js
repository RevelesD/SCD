"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const document_resolver_1 = require("./document.resolver");
const resolvers = {
    Query: {
        ...document_resolver_1.documentsQueries
    },
    Mutation: {
        ...document_resolver_1.documentMutation
    }
};
exports.default = resolvers;
//# sourceMappingURL=index.js.map