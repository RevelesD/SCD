import { Category } from "../models/category.model";
import { User } from "../models/user.model";
import { Campus } from "../models/campus.model";
import { Permission } from "../models/permission.model";

export function getProjection (fieldASTs) {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = true;
    return projections;
  }, {});
}

const category = async catId => {
  try {
     const cat = await Category.findById(catId);
     return {
       ...cat._doc,
       _id: cat.id,
       children: categories.bind(this, cat._doc.children)
     }
  } catch (e) {
    throw e;
  }
}

const campus = async campusId => {
  try {
    const o = await Campus.findById(campusId);
    return o._doc;
  } catch (e) {
    throw e;
  }
}

const categories = async catIds => {
  try {
    const categos = await Category.find({_id: {$in: catIds}});
    return categos.map(transformCategory);
  } catch (e) {
    throw e;
  }
}

const user = async userId => {
  try {
    const o = await User.findById(userId);
    return {
      ...o._doc,
      _id: o.id,
      adscription: campus.bind(this, o._doc.adscription)
    }
  } catch (e) {
    throw e;
  }
}

const permissions = async permissionsIds => {
  try {
    const docs = await Permission.find({_id: {$in: permissionsIds}})
    return docs;
  } catch (e) {
    throw e;
  }
}

export const transformNotice = async docObj => {
  return {
    ...docObj._doc,
    createdBy: user.bind(this, docObj._doc.createdBy)
  }
}

export const transformCategory = async catObj => {
  return {
    ...catObj._doc,
    children: categories.bind(this, catObj._doc.children)
  }
}

export const transCatInDocument = async docObj => {
  return {
    ...docObj._doc,
    category: category.bind(this, docObj._doc.category)
  }
}

export const transOwnerInDocument = async docObj => {
  return {
    ...docObj._doc,
    owner: user.bind(this, docObj._doc.owner)
  }
}

export const transformUser = async docObj => {
  return {
    ...docObj._doc,
    adscription: campus.bind(this, docObj._doc.adscription)
  }
}

export const transformPermissionsInUser = async docObj => {
  return {
    ...docObj._doc,
    permissions: permissions.bind(this, docObj._doc.permissions)
  }
}

export const tranformLog = async docObj => {
  console.log(docObj);
  return {
    ...docObj._doc,
    causer: user.bind(this, docObj._doc.causer)
  }
}
