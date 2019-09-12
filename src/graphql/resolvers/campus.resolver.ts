import {ApolloError} from "apollo-server";
import { Campus } from "../../models/campus.model";

const campusQueries = {
    campus: async(_, args, context, info) => {
        try {
            return await Campus.findById(args.id);
        }catch (e) {
            throw new ApolloError(e)
        }
    },
    allCampus: async(_, {page, perPage}, contex, info) => {
      try {
          return await Campus.find()
            .skip(page*perPage)
            .limit(perPage).exec();
      }  catch (e) {
          throw new ApolloError(e)
      }
    }
};

const campusMutations = {
    createCampus: async(_, { input }, context, info) => {
        try {
            const campus = new Campus({
                name: input.name,
                phone: input.phone
            });
            return await campus.save();
        }catch (e) {
            throw new ApolloError(e)
        }
    },
    updateCampus: async(_, args, context, info) => {
        try {
            return await Campus.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
        }catch (e) {
            throw new ApolloError(e);
        }
    },

};

export { campusQueries, campusMutations };