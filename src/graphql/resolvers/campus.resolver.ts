import {ApolloError} from "apollo-server";
import { Campus } from "../../models/campus.model";
import {getProjection} from "./merge";

const campusQueries = {
    campus: async(_, args, context, info) => {
        try {
            const projections = getProjection(info);
            return await Campus.findById(args.id), projections;
        }catch (e) {
            throw new ApolloError(e)
        }
    },
    allCampus: async(_, {page, perPage}, contex, info) => {
      try {
          const projections = getProjection(info);
          return await Campus
            .find({}, projections)
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
            const projections = getProjection(info);
            return await Campus
              .findById(args.id, projections)
              .update(args.input, {new: true}).exec();
            //return await Campus.findByIdAndUpdate(args.id, args.input, {new: true}).exec();
        }catch (e) {
            throw new ApolloError(e);
        }
    },

};

export { campusQueries, campusMutations };
