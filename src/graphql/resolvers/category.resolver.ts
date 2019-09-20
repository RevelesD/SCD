import { ApolloError } from 'apollo-server'
import { Category } from "../../models/category.model";
import { getProjection, transformCategory } from "./merge";

const categoryQueries = {
    category: async(_, args, context, info) => {
      try {
        const projections = getProjection(info);

        const doc = await Category.findById(args.id, projections).exec();

        if (projections.children) {
          return transformCategory(doc);
        }
        return doc;
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    categories: async(_, args, context, info) => {
      try {
        const projections = getProjection(info);
        const docs = await Category.find({}, projections).exec();
        if (projections.children) {
          return docs.map(transformCategory);
        }
        return docs;
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  const categoryMutations = {
    createRootCategory: async(_, {input}, context, info) => {
      try {
        const projections = getProjection(info);
        // Create the base doc for model
        const doc = {
          root: true,
          clave: input.clave,
          title: input.clave,
          path: `/${input.clave}`,
          children: []
        }
        // Save document in db
        const dbdoc = await Category.create(doc);
        // Returns the saved document to client
        if (projections.children) {
          return transformCategory(dbdoc);
        }
        return dbdoc;
      } catch (e) {
        throw new ApolloError(e);
      }
      return
    },
    createLeafCategory: async(_, {parent, input}, context, info) => {
      try {
        const projections = getProjection(info);
        // Retrieve the parent category
        const pquery = Category.findById(parent);
        const pdoc = await pquery.exec();
        // Validate if the parent can have children
        if (pdoc.value) {
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
        }
        // Save the document in the db
        const dbdoc = await Category.create(doc);
        pquery.update({$push: {children: dbdoc._id}}).exec();
        // Returns the saved document to the client
        if (projections.children) {
          return transformCategory(dbdoc);
        }
        return dbdoc;
      } catch (e) {
        throw new ApolloError(e);
      }
      return
    },
    updateCategory: async(_, {id, input}, context, info) => {
      try {
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
            throw new ApolloError('No se pueden agregar puntos RIPAUAQ a una categoria con hijos');
          }
        }
        if (input.clave) {
          update.path = doc.path.replace(doc.clave, input.clave);
        }
        // Update the document in the db.
        doc = await Category
          .findByIdAndUpdate(id, update, {new: true}).exec();
        /*
          If one of the requested fields by the client is the children array
          populate the array with the objects so client can access the data
        */
        if (projections.children) {
          return transformCategory(doc);
        }
        // Return the updated document to the client.
        return doc;
      } catch (e) {
        throw new ApolloError(e);
      }
    },
    deleteCategory: async(_, args, context, info) => {
      try {
        return
      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  export { categoryQueries, categoryMutations };
