import {ApolloError} from "apollo-server";
import { Campus } from "../../models/campus.model";

const campusQueries = {
    campus: async(_, args:{ id}, context, info) => {
        try {
            return await Campus.findById(args.id);
        }catch (e) {
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
    updateCampus: async(_, args: { id }, context, info) => {
        try {
            return await Campus.findByIdAndDelete(args.id).exec();
        }catch (e) {
            throw new ApolloError(e);
        }
    },

};

export { campusQueries, campusMutations };