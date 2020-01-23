import { Category as CatModel } from "../models/category.model";
import { Document as DocModel } from "../models/documents.model";
import { Category, Document } from "../generated/graphql.types";

export interface Branch {
  _id: string,
  children: Branch[]
  label?: string,
  type?: 'cat' | 'file',
}

export interface CategoryInspected {
  _id: string;
  clave: string;
  title: string;
  childrenInspected: CategoryInspected[];
  totalDocs?: number;
  totalValue?: number;
}

export interface CategoryResume {
  _id: string;
  title: string;
  value: number;
  docsQty: number
}

export class TreeBuilder {

  constructor(private userId: string) {}

  async buildTree(id: string): Promise<Branch> {
    try {
      const tempCat: Category = await CatModel.findById(
        id,{_id: true, children: true, clave: true, title: true});
      
      const b: Branch = {
        _id: tempCat._id,
        type: 'cat',
        label: `${tempCat.clave} - ${tempCat.title}`,
        children: []
      };

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
        };
        docBranches.push(db);
      }

      return docBranches;
    } catch (e) {
      throw e;
    }
  }
}

export function shakeTree(b: Branch): Branch {
  if (b.type === 'file') {
    return b;
  }

  const spans: Branch[] = JSON.parse(JSON.stringify(b.children));
  b.children = [];
  for (let i = 0; i < spans.length; i++) {
    const br = shakeTree(spans[i]);
    if (br != null) {
      b.children.push(br);
    }
  }
  if (b.children.length === 0) {
    return null;
  } else {
    return b;
  }
}

export async function categoryInspection(user: string, category: string): Promise<CategoryInspected> {
  try {

    const tempCat: Category = await CatModel.findById(
      category,{_id: true, clave: true, title: true, value: true, children: true});

    const ci: CategoryInspected = {
      _id: tempCat._id,
      clave: tempCat.clave,
      title: tempCat.title,
      childrenInspected: [],
      totalDocs: 0,
      totalValue: 0
    }

    if (tempCat.children.length > 0) {
      // has categories
      for (const c of tempCat.children) {
        const inCat = await categoryInspection(user, c._id);
        ci.totalDocs += inCat.totalDocs;
        ci.totalValue += inCat.totalValue;
        ci.childrenInspected.push(inCat);
      }

    } else {
      // has documents
      const count = await DocModel.countDocuments({owner: user, category: tempCat._id});
      ci.totalDocs += count;
      ci.totalValue += count * tempCat.value;
    }
    return ci;
  } catch (e) {
    throw e;
  }
}

export async function summarizeCategory(user: string, category: string): Promise<CategoryResume> {
  try {
    const tempCat: Category = await CatModel.findById(category, {
      _id: true, title: true, value: true
    });

    const criteria: any = {
      category: tempCat._id
    }

    if (user !== '000') {
      criteria.owner = user;
    }

    const docsQty: number = await DocModel.countDocuments(criteria);

    const resume: CategoryResume = {
      _id: tempCat._id,
      title: tempCat.title,
      value: tempCat.value,
      docsQty: docsQty
    }
    return resume;
  } catch (e) {
    throw e;
  }
}
