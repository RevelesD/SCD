"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const category_model_1 = require("../../models/category.model");
const merge_1 = require("./merge");
const categoryQueries = {
    category: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            const doc = await category_model_1.Category.findById(args.id, projections).exec();
            if (projections.children) {
                return merge_1.transformCategory(doc);
            }
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    categories: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.admin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            const docs = await category_model_1.Category.find({}, projections).exec();
            if (projections.children) {
                return docs.map(merge_1.transformCategory);
            }
            return docs;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.categoryQueries = categoryQueries;
const categoryMutations = {
    createRootCategory: async (_, { input }, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            // Create the base doc for model
            const doc = {
                root: true,
                clave: input.clave,
                title: input.clave,
                path: `/${input.clave}`,
                children: []
            };
            // Save document in db
            const dbdoc = await category_model_1.Category.create(doc);
            // Returns the saved document to client
            if (projections.children) {
                return merge_1.transformCategory(dbdoc);
            }
            return dbdoc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
        return;
    },
    createLeafCategory: async (_, { parent, input }, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            const projections = merge_1.getProjection(info);
            // Retrieve the parent category
            const pquery = category_model_1.Category.findById(parent);
            const pdoc = await pquery.exec();
            // Validate if the parent can have children
            if (pdoc.value) {
                throw new apollo_server_1.ApolloError('Esta categoria posee puntos RIPAUAQ, no puede contener subcategorias.');
            }
            // Begins the declaration of the document for the model
            const doc = {
                root: false,
                clave: input.clave,
                title: input.title,
                path: `${pdoc.path}/${input.clave}`
            };
            // Adds the value if this is going to be a leaf category
            if (input.value) {
                doc['value'] = input.value;
            }
            // Save the document in the db
            const dbdoc = await category_model_1.Category.create(doc);
            pquery.update({ $push: { children: dbdoc._id } }).exec();
            // Returns the saved document to the client
            if (projections.children) {
                return merge_1.transformCategory(dbdoc);
            }
            return dbdoc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
        return;
    },
    updateCategory: async (_, { id, input }, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            // Read the fields requested by the client.
            const projections = merge_1.getProjection(info);
            // Retrieve the original document.
            let doc = await category_model_1.Category.findById(id);
            const update = { ...input };
            /*
              Validate if one of the fields to update are the RIPAUAQ
              value, then the category must not have any children.
            */
            if (input.value) {
                if (doc.children) {
                    throw new apollo_server_1.ApolloError('No se pueden agregar puntos RIPAUAQ a una categoria con hijos');
                }
            }
            if (input.clave) {
                update.path = doc.path.replace(doc.clave, input.clave);
            }
            // Update the document in the db.
            doc = await category_model_1.Category
                .findByIdAndUpdate(id, update, { new: true }).exec();
            /*
              If one of the requested fields by the client is the children array
              populate the array with the objects so client can access the data
            */
            if (projections.children) {
                return merge_1.transformCategory(doc);
            }
            // Return the updated document to the client.
            return doc;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    },
    deleteCategory: async (_, args, context, info) => {
        // if (!await isAuth(context, [config.permission.superAdmin]))
        //   throw new ApolloError('Unauthenticated');
        try {
            return;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.categoryMutations = categoryMutations;
//# sourceMappingURL=category.resolver.js.map