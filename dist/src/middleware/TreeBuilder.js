"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const category_model_1 = require("../models/category.model");
const documents_model_1 = require("../models/documents.model");
class TreeBuilder {
    constructor(userId) {
        this.userId = userId;
    }
    async buildTree(id) {
        try {
            const tempCat = await category_model_1.Category.findById(id, { _id: true, children: true, clave: true, title: true });
            const b = {
                _id: tempCat._id,
                type: 'cat',
                label: `${tempCat.clave} - ${tempCat.title}`,
                children: []
            };
            // console.log(b);
            if (tempCat.children.length > 0) {
                for (const c of tempCat.children) {
                    const inCat = await this.buildTree(c._id);
                    b.children.push(inCat);
                }
            }
            else {
                const documents = await this._findDocuments(tempCat._id);
                if (documents.length > 0) {
                    b.children = documents;
                }
            }
            return b;
        }
        catch (e) {
            throw e;
        }
    }
    async _findDocuments(cat) {
        try {
            const documents = await documents_model_1.Document.find({ category: cat, owner: this.userId }, { _id: true, fileName: true });
            const docBranches = [];
            for (const d of documents) {
                const db = {
                    _id: d._id,
                    label: d.fileName,
                    type: 'file',
                    children: []
                };
                docBranches.push(db);
            }
            return docBranches;
        }
        catch (e) {
            throw e;
        }
    }
}
exports.TreeBuilder = TreeBuilder;
function shakeTree(b) {
    if (b.type === 'file') {
        return b;
    }
    const spans = JSON.parse(JSON.stringify(b.children));
    b.children = [];
    for (let i = 0; i < spans.length; i++) {
        const br = shakeTree(spans[i]);
        if (br != null) {
            b.children.push(br);
        }
    }
    if (b.children.length === 0) {
        return null;
    }
    else {
        return b;
    }
}
exports.shakeTree = shakeTree;
//# sourceMappingURL=TreeBuilder.js.map