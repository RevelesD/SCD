"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const types_1 = require("./types");
const queries_1 = require("./queries");
const mutations_1 = require("./mutations");
exports.default = apollo_server_1.gql `
  ${types_1.types}
  
  type Query {
    ${queries_1.queries}
  }
  
  type Mutation {
    ${mutations_1.mutations}
  }
`;
//# sourceMappingURL=index.js.map