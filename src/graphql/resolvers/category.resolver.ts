import {ApolloError} from 'apollo-server'
import {Category} from "../../models/category.model";
import {config} from "../../../config.const";
import {getProjection, transformCategory} from "../../utils/merge";
import {isAuth} from "../../utils/is-auth";
import {
  TreeBuilder,
  shakeTree,
  Branch,
  categoryInspection,
  summarizeCategory as fsm
} from "../../utils/CategoriesHelper";
import {
  registerGoodLog,
  registerBadLog,
  registerErrorLog,
  registerGenericLog
} from "../../utils/logAction"

const categoryQueries = {
  /**
   * get an specific category
   * @param {number} type - search by clave or by id
   * @param {string} uid - category id or clave depending of the search type
   * @return { Category } - a mongodb document
   */
  category: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'category';
    try {
      // if (!await isAuth(context, [config.permission.docente])) {
      //   const error = registerBadLog(context, qType, qName);
      //   throw new ApolloError(`S5, Message: ${error}`);
      // }

      const projections = getProjection(info);

      let condition;
      if (args.type === 1) {
        condition = {_id: args.uid};
      } else if (args.type === 2) {
        condition = {clave: args.uid};
      } else {
        registerErrorLog(context, qType, qName, 'Invalid input for type param');
        throw new ApolloError('Invalid input for type param');
      }
      const doc = await Category.findOne(condition, projections).exec();

      if (projections.children) {
        return transformCategory(doc);
      }
      registerGoodLog(context, qType, qName, args.id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * get multiple categories
   * @param {number} page - page selection for pagination
   * @param {number} perPage - amount of items per page
   * @param {number} type - search root, leaf or all categories
   * @return { [Category] } - a mongodb document
   */
  categories: async (_, args, context, info) => {
    const qType = 'Query';
    const qName = 'categories';
    try {
      // if (!await isAuth(context, [config.permission.docente])) {
      //   const error = registerBadLog(context, qType, qName);
      //   throw new ApolloError(`S5, Message: ${error}`);
      // }

      const projections = getProjection(info);
      let conditions;
      if (args.type === 1) {
        conditions = {$and: [{root: true}, {$and: [{clave: {$ne: '000'}}, {clave: {$ne: '999'}}]}]}
      } else if (args.type === 2) {
        conditions = {root: false};
      } else if (args.type === 3) {
        conditions = {};
      }
      const docs = await Category.find(conditions, projections, {sort: {clave: 1}}).exec();
      if (projections.children) {
        return docs.map(transformCategory);
      }
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Get the categories tree for moving and downloading documents
   * removes empty node based on the user documents
   * @param {string} cat - category id to use as root for the tree
   * @param {string} user - user id
   * @return Branch{ _id, children, label, type }
   */
  getTree: async (_, args, context) => {
    const qType = 'Query';
    const qName = 'getTree';
    try {
      const treeObj = new TreeBuilder(args.user);
      const tree: Branch = await treeObj.buildTree(args.cat);

      const br = shakeTree(tree);
      return br;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Get a resume of the sum of all documents and values of a category
   * @param {string} user - userID of the owner of the documents
   * @param {string} category - category id of the root category
   * @return {CategoryInspection} a recursive object summing up the document's info of the root category
   */
  inspectCategory: async(_, {user, category}, context) => {
    const qType = 'Query';
    const qName = 'inspectCategory';
    try {
      const catInspected = await categoryInspection(user, category);
      return catInspected;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Sum up the main data of a category and the amount of documents it has.
   * @param {string} user - user id, use the code 000 to know the total amount of documents among all users
   * @param {string} category - category id
   * @return {CategoryResume}
   */
  summarizeCategory: async(_, {user, category}, context) => {
    const qType = 'Query';
    const qName = 'inspectCategory';
    try {
      const cs = await fsm(user, category);
      return cs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

const categoryMutations = {
  /**
   * Creates a category that has no parent and acts as a "Rubro" in the business model
   * @param {InputCategory{ clave, title, value }} input
   * @return { Category } - a mongodb document
   */
  createRootCategory: async (_, {input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'createRootCategory';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      // Create the base doc for model
      const doc = {
        root: true,
        clave: input.clave,
        title: input.title,
        path: `/${input.clave}`,
        children: []
      };
      // Save document in db
      const dbdoc = await Category.create(doc);
      // Returns the saved document to client
      if (projections.children) {
        return await transformCategory(dbdoc);
      }
      registerGoodLog(context, qType, qName, dbdoc._id);
      return dbdoc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * creates a sub category (or leaf category), can or not have RIPAUAQ values
   * @param {string} parent - parent category id
   * @param {InputCategory{ clave, title, value }} input
   * @return { Category } - a mongodb document
   */
  createLeafCategory: async (_, {parent, input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'createLeafCategory';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      // Retrieve the parent category
      const pquery = Category.findById(parent);
      const pdoc = await pquery.exec();
      // Validate if the parent can have children
      if (pdoc.value) {
        registerGenericLog(
          context, qType, qName,
          'User can\'t create a leaft category on a category that have RIPAUAQ\'s score');
        throw new ApolloError('Esta categoria posee puntos RIPAUAQ, no puede contener subcategorias.')
      }
      // Begins the declaration of the document for the model
      const doc = {
        root: false,
        clave: input.clave,
        title: input.title,
        path: `${pdoc.path}/${input.clave}`
      }
      // Adds the value if this is going to be a leaf category
      if (input.value) {
        doc['value'] = input.value;
        doc['children'] = [];
      }
      // Save the document in the db
      const dbdoc = await Category.create(doc);
      await pquery.update({$push: {children: dbdoc._id}}).exec();
      // Returns the saved document to the client
      if (projections.children) {
        return await transformCategory(dbdoc);
      }
      registerGoodLog(context, qType, qName, dbdoc._id);
      return dbdoc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Update a category info
   * @param {string} id - category id
   * @param {UpdateCategory{ clave, title, value }} input
   * @return { Category } - a mongodb document
   */
  updateCategory: async (_, {id, input}, context, info) => {
    const qType = 'Mutation';
    const qName = 'updateCategory';
    try {
      if (!await isAuth(context, [config.permission.superAdmin])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      // Read the fields requested by the client.
      const projections = getProjection(info);
      // Retrieve the original document.
      let doc = await Category.findById(id);

      const update = {...input};
      /*
        Validate if one of the fields to update are the RIPAUAQ
        value, then the category must not have any children.
      */
      if (input.value) {
        if (doc.children) {
          registerGenericLog(
            context, qType, qName,
            'User can\'t assign RIPAUAQ`s score to a category with children');
          throw new ApolloError('No se pueden agregar puntos RIPAUAQ a una categoria con hijos');
        }
      }
      if (input.clave) {
        update.path = doc.path.replace(doc.clave, input.clave);
      }
      // Update the document in the db.
      doc = await Category
        .findByIdAndUpdate(id, update, {new: true, fields: projections});
      /*
        If one of the requested fields by the client is the children array
        populate the array with the objects so client can access the data
      */
      if (projections.children) {
        return await transformCategory(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      // Return the updated document to the client.
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Delete a category
   * @param {string} id category id
   * @return { Category } - a mongodb document
   */
  deleteCategory: async (_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteCategory';
    try {
      registerGenericLog(
        context, qType, qName,
        'User can\'t delete a category at this time.');
      throw new ApolloError('S5, User can\'t delete a category at this time.');
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

export {categoryQueries, categoryMutations};
