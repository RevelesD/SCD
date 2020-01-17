"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_1 = require("apollo-server");
const category_model_1 = require("../../models/category.model");
const config_const_1 = require("../../../config.const");
const merge_1 = require("./merge");
const is_auth_1 = require("../../middleware/is-auth");
const TreeBuilder_1 = require("../../middleware/TreeBuilder");
const logAction_1 = require("../../middleware/logAction");
const categoryQueries = {
    /**
     * get an specific category
     * @args type (type of search)
     * @args categoryId
     * @return { Category } - a mongodb document
     */
    category: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'category';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let condition;
            if (args.type === 1) {
                condition = { _id: args.uid };
            }
            else if (args.type === 2) {
                condition = { clave: args.uid };
            }
            else {
                logAction_1.registerErrorLog(context, qType, qName, 'Invalid input for type param');
                throw new apollo_server_1.ApolloError('Invalid input for type param');
            }
            const doc = await category_model_1.Category.findOne(condition, projections).exec();
            if (projections.children) {
                return merge_1.transformCategory(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, args.id);
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     * get all categories
     * @args page
     * @args perPage
     * @args type (type of search)
     * @return { [Category] } - a mongodb document
     */
    categories: async (_, args, context, info) => {
        const qType = 'Query';
        const qName = 'categories';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.docente])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            let conditions;
            if (args.type === 1) {
                conditions = { $and: [{ root: true }, { $and: [{ clave: { $ne: '000' } }, { clave: { $ne: '999' } }] }] };
            }
            else if (args.type === 2) {
                conditions = { root: false };
            }
            else if (args.type === 3) {
                conditions = {};
            }
            const docs = await category_model_1.Category.find(conditions, projections, { sort: { clave: 1 } }).exec();
            if (projections.children) {
                return docs.map(merge_1.transformCategory);
            }
            logAction_1.registerGoodLog(context, qType, qName, 'Multiple documents');
            return docs;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args categoryId
     * @args userId
     * @return Branch{ _id, children, label, type }
     */
    getTree: async (_, args) => {
        try {
            const treeObj = new TreeBuilder_1.TreeBuilder(args.user);
            const tree = await treeObj.buildTree(args.cat);
            const br = TreeBuilder_1.shakeTree(tree);
            return br;
        }
        catch (e) {
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.categoryQueries = categoryQueries;
const categoryMutations = {
    /**
     *
     * @input InputCategory{ clave, title, value }
     * @return { Category } - a mongodb document
     */
    createRootCategory: async (_, { input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'createRootCategory';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            // Create the base doc for model
            const doc = {
                root: true,
                clave: input.clave,
                title: input.title,
                path: `/${input.clave}`,
                children: []
            };
            // Save document in db
            const dbdoc = await category_model_1.Category.create(doc);
            // Returns the saved document to client
            if (projections.children) {
                return await merge_1.transformCategory(dbdoc);
            }
            logAction_1.registerGoodLog(context, qType, qName, dbdoc._id);
            return dbdoc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @parent parentId
     * @input InputCategory{ clave, title, value }
     * @return { Category } - a mongodb document
     */
    createLeafCategory: async (_, { parent, input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'createLeafCategory';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
            const projections = merge_1.getProjection(info);
            // Retrieve the parent category
            const pquery = category_model_1.Category.findById(parent);
            const pdoc = await pquery.exec();
            // Validate if the parent can have children
            if (pdoc.value) {
                logAction_1.registerGenericLog(context, qType, qName, 'User can\'t create a leaft category on a category that have RIPAUAQ\'s score');
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
                doc['children'] = [];
            }
            // Save the document in the db
            const dbdoc = await category_model_1.Category.create(doc);
            await pquery.update({ $push: { children: dbdoc._id } }).exec();
            // Returns the saved document to the client
            if (projections.children) {
                return await merge_1.transformCategory(dbdoc);
            }
            logAction_1.registerGoodLog(context, qType, qName, dbdoc._id);
            return dbdoc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @id categoryId
     * @input UpdateCategory{ clave, title, value  }
     * @return { Category } - a mongodb document
     */
    updateCategory: async (_, { id, input }, context, info) => {
        const qType = 'Mutation';
        const qName = 'updateCategory';
        try {
            if (!await is_auth_1.isAuth(context, [config_const_1.config.permission.superAdmin])) {
                const error = logAction_1.registerBadLog(context, qType, qName);
                throw new apollo_server_1.ApolloError(`S5, Message: ${error}`);
            }
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
                    logAction_1.registerGenericLog(context, qType, qName, 'User can\'t assign RIPAUAQ`s score to a category with children');
                    throw new apollo_server_1.ApolloError('No se pueden agregar puntos RIPAUAQ a una categoria con hijos');
                }
            }
            if (input.clave) {
                update.path = doc.path.replace(doc.clave, input.clave);
            }
            // Update the document in the db.
            doc = await category_model_1.Category
                .findByIdAndUpdate(id, update, { new: true, fields: projections });
            /*
              If one of the requested fields by the client is the children array
              populate the array with the objects so client can access the data
            */
            if (projections.children) {
                return await merge_1.transformCategory(doc);
            }
            logAction_1.registerGoodLog(context, qType, qName, doc._id);
            // Return the updated document to the client.
            return doc;
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    },
    /**
     *
     * @args categoryId
     * @return { Category } - a mongodb document
     */
    deleteCategory: async (_, args, context, info) => {
        const qType = 'Mutation';
        const qName = 'deleteCategory';
        try {
            logAction_1.registerGenericLog(context, qType, qName, 'User can\'t delete a category at this time.');
            throw new apollo_server_1.ApolloError('S5, User can\'t delete a category at this time.');
        }
        catch (e) {
            logAction_1.registerErrorLog(context, qType, qName, e);
            throw new apollo_server_1.ApolloError(e);
        }
    }
};
exports.categoryMutations = categoryMutations;
//# sourceMappingURL=category.resolver.js.map