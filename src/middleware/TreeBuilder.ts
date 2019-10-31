import { Category as CatModel } from "../models/category.model";
import { Document as DocModel } from "../models/documents.model";
import { Category, Document } from "../generated/graphql.types";
import has = Reflect.has;

export interface Branch {
  _id: string,
  children: Branch[]
  label?: string,
  type?: 'cat' | 'file',
}

export class TreeBuilder {

  constructor(private userId: string) {}

  async buildTree(id: string): Promise<Branch> {
    try {
      const tempCat: Category = await CatModel.findById(
        id,{_id: true, children: true, clave: true, title: true});
      // console.log('Clave: ' + tempCat.clave + ', Children: ' + tempCat.children.length);
      const b: Branch = {
        _id: tempCat._id,
        children: [],
        type: 'cat',
        label: `${tempCat.clave} - ${tempCat.title}`
      }

      if (tempCat.children.length > 0) {
        for (const c of tempCat.children) {
          const inCat = await this.buildTree(c._id);
          b.children.push(inCat);
        }
      } else {
        const documents = await this._findDocuments(tempCat._id);
        if (documents.length > 0) {
          b.children = documents;
        }
      }
      return b;
    } catch (e) {
      throw e;
    }
  }

  private async _findDocuments(cat): Promise<Branch[]> {
    try {
      const documents: Document[] = await DocModel.find(
        {category: cat, owner: this.userId},
        {_id: true, fileName: true}
      );

      const docBranches: Branch[] = [];

      for (const d of documents) {
        const db: Branch = {
          _id: d._id,
          label: d.fileName,
          type: 'file',
          children: []
        }
        docBranches.push(db);
      }

      return docBranches;
    } catch (e) {
      throw e;
    }
  }
}

export function shakeBranch(branch: Branch): boolean {

  if (branch.type === 'file') {
    return true;
  }
  console.log(branch.label);
  console.log(branch.children.length);
  let hasFiles = false;

  for (let i = 0; i < branch.children.length; i++) {

    const subChildren = shakeBranch(branch.children[i]);

    if (subChildren === true) {
      hasFiles = true;
    } else {
      branch.children.splice(i, 1);
      console.log(branch.children.length);
    }
  }
  // console.log(`Label: ${branch.label}, children: ${branch.children.length} y regreso: ${hasFiles}`);
  return hasFiles;

  // branch.children.forEach((b, i) => {
  //   console.log(b.label);
  //   const subChildren = shakeBranch(b);
  //
  //   if (subChildren) {
  //     hasFiles = true;
  //   }
  //
  //   if (subChildren === false) {
  //     const del = branch.children.splice(i, 1);
  //   }
  // })
}
