import { ApolloError } from 'apollo-server'
import { Category } from "../../models/category.model";

const categoryQueries = {
    category: async(_, args, context, info) => {
      try {
        const categories = Category.findById(args.id);
        categories
          .populate({path: 'parent'})
          .populate({path: 'children'});


      } catch (e) {
        throw new ApolloError(e);
      }
    },
    categories: async(_, args, context, info) => {
      try {

      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  const categoryMutations = {
    createCategory: async(_, args, context, info) => {
      try {

      } catch (e) {
        throw new ApolloError(e);
      }
      return
    },
    updateCategory: async(_, args, context, info) => {
      try {

      } catch (e) {
        throw new ApolloError(e);
      }
    },
    deleteCategory: async(_, args, context, info) => {
      try {

      } catch (e) {
        throw new ApolloError(e);
      }
    }
  };
  
  export { categoryQueries, categoryMutations };
