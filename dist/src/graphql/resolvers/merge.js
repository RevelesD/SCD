"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_model_1 = require("../../models/category.model");
const user_model_1 = require("../../models/user.model");
const campus_model_1 = require("../../models/campus.model");
function getProjection(fieldASTs) {
    return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
        projections[selection.name.value] = true;
        return projections;
    }, {});
}
exports.getProjection = getProjection;
const category = async (catId) => {
    try {
        const cat = await category_model_1.Category.findById(catId);
        return {
            ...cat._doc,
            _id: cat.id,
            children: categories.bind(this, cat._doc.children)
        };
    }
    catch (e) {
        throw e;
    }
};
const campus = async (campusId) => {
    try {
        const o = await campus_model_1.Campus.findById(campusId);
        return o._doc;
    }
    catch (e) {
        throw e;
    }
};
const categories = async (catIds) => {
    try {
        const categos = await category_model_1.Category.find({ _id: { $in: catIds } });
        return categos.map(exports.transformCategory);
    }
    catch (e) {
        throw e;
    }
};
const user = async (userId) => {
    try {
        const o = await user_model_1.User.findById(userId);
        return {
            ...o._doc,
            _id: o.id,
            adscription: campus.bind(this, o._doc.adscription)
        };
    }
    catch (e) {
        throw e;
    }
};
exports.transformNotice = async (docObj) => {
    return {
        ...docObj._doc,
        createdBy: user.bind(this, docObj._doc.createdBy)
    };
};
exports.transformCategory = async (catObj) => {
    return {
        ...catObj._doc,
        children: categories.bind(this, catObj._doc.children)
    };
};
exports.transCatInDocument = async (docObj) => {
    return {
        ...docObj._doc,
        category: category.bind(this, docObj._doc.category)
    };
};
exports.transOwnerInDocument = async (docObj) => {
    return {
        ...docObj._doc,
        owner: user.bind(this, docObj._doc.owner)
    };
};
exports.transformUser = async (docObj) => {
    return {
        ...docObj._doc,
        adscription: campus.bind(this, docObj._doc.adscription)
    };
};
exports.tranformLog = async (docObj) => {
    return {
        ...docObj._doc,
        causer: user.bind(this, docObj._doc.causer)
    };
};
//# sourceMappingURL=merge.js.map