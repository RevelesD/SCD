import { getProjection, transCatInDocument, transOwnerInDocument } from "./merge";
import { Document } from "../../models/documents.model";
import { Category as CatModel } from "../../models/category.model";
import { Category, Document as DocType } from "../../generated/graphql.types";
import { ApolloError } from "apollo-server";
import { config } from '../../../config.const'
import { Context, isAuth } from "../../middleware/is-auth";
const mongodb = require('mongodb');
// const MongoClient = require('mongodb').MongoClient;
import {
  registerBadLog,
  registerGoodLog,
  registerErrorLog,
  registerGenericLog
} from "../../middleware/logAction";
import { MongoError, MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { Types } from "mongoose";

const documentQueries = {
  /**
   *
   * @args documentId
   * @return { Document } - a mongodb document
   */
  document: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'document';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      let doc = await Document.findById(args.id, projections);
      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
       registerGoodLog(context, qType, qName, args.id)
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   *
   * @args SearchDocument{ user, page, perPage, category, filename }
   * @return { [Document] } - a mongodb document
   */
  documents: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'documents';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      const conditions = {
        $and: [
          {owner: args.search.user}
        ]
      }
      if (args.search.category) {
        const auxCat = await CatModel.findOne({clave: args.search.category}, {_id: true});
        // @ts-ignore
        conditions.$and.push({category: auxCat._id});
      }
      if (args.search.fileName) {
        // @ts-ignore
        conditions.$and.push({fileName: /args.search.fileName/});
      }
      let docs = await Document
        .find(conditions, projections)
        .skip(args.search.page * args.search.perPage)
        .limit(args.search.perPage).exec();
      if (projections.category) {
        docs = docs.map(transCatInDocument);
        // doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        docs = docs.map(transOwnerInDocument);
        // doc = transOwnerInDocument(doc);
      }
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return docs;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  documentsQuantity: async(_, args, context, info) => {
    const qType = 'Query';
    const qName = 'documents';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const cat: Category = await CatModel.findOne({clave: args.category}, {_id: true});

      let conditions: any = {
        owner: args.user
      };
      if (args.category !== '000') {
        conditions.category = cat._id
      }

      const count = await Document.countDocuments(conditions);

      registerGoodLog(context, qType, qName, 'Multiple documents');
      return count;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

const documentMutations = {
  /**
   * Update the data of a single document
   * @args {id}
   * @args {UpdateDocument { fileName, category } }
   * @return { Document } - a mongodb document
   */
  updateDocument: async(_, args, context: Context, info) => {
    const qType = 'Mutation';
    const qName = 'updateDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);
      args.input.updatedAt = Date.now();
      let doc = await Document.findById(args.id, projections);
      if (doc.owner !== context.user.userId) {
        registerGenericLog(
          context, qType, qName,
          'User can\'t update documents that are not his own');
        throw new ApolloError('User can\'t update documents that are not his own')
      }

      doc = await Document.updateOne(doc._id, args.input, {new: true});
      if (projections.category) {
        doc = transCatInDocument(doc);
      }
      if (projections.owner) {
        doc = transOwnerInDocument(doc);
      }
      registerGoodLog(context, qType, qName, doc._id);
      return doc;
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Delete a single document
   * @param {string} args.documentId - Id of the document for delete
   * @return { Document } - a mongodb document
   */
  deleteDocument: async(_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }
      // check if the document belong to the user trying to modify it
      let doc = await Document.findById(args.id);
      // check if the documents belong to the user trying to delete them
      if (doc.owner.toString() !== context.user.userId) {
        logDenyDeleteOfDocuments(context, qType, qName);
      }

      const bucket = await CreateGFSBucketConnection();
      const errors: MongoError[] = [];
      // Delete de files and chunks from the gridfs bucket
      bucket.delete(new ObjectId(doc.fileId), (err) => {
        if (err) {
          // If there are any error push them into the errors array for further use.
          errors.push(err);
        }
      });
      // Delete the document
      doc = await Document.deleteOne({_id: args.id});

      registerGoodLog(context, qType, qName, args.id);
      return {
        deletedCount: doc.deletedCount,
        errors: errors
      };
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Move a single document to another category
   * @args documentId
   * @args ( categoryID ) - receiver categoryId
   * @return { Document } - a mongodb document
   */
  moveDocument: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'moveDocument';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const projections = getProjection(info);

      const cat: Category =
        await CatModel.findById(args.cat, {_id: true, path: true});
      let doc: DocType =
        await Document.findById(args.doc, {_id: true, path: true, category: true, fileName: true});

      // const path = doc.path.split('/');
      const updates = {
        // path: cat.path + '/' + path[path.length - 1],
        path: cat.path + '/' + doc.fileName,
        category: cat._id
      };

      doc = await Document.findByIdAndUpdate(args.doc, updates, {
        new: true,
        fields: projections
      });

      return doc;

    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Delete multiple documents
   * @args [documentId]
   * @return DeletedResponses{ deletedCount, errors }
   */
  deleteDocuments: async (_, args, context) => {
    const qType = 'Mutation';
    const qName = 'deleteDocuments';
    try {
      const docs: DocType[] = await Document.find({_id: {$in: args.ids}});
      // check if there are documents in the search
      if (docs.length === 0) {
        return {
          deletedCount: 0,
          errors: []
        }
      }
      // check if the documents belong to the user trying to delete them
      if (docs[0].owner.toString() !== context.user.userId) {
        logDenyDeleteOfDocuments(context, qType, qName);
      }

      const bucket = await CreateGFSBucketConnection();

      const errors: MongoError[] = [];

      for (const d of docs) {
        // cast the string stored to oid and delete the files and his respective chunks from the bucket.
        bucket.delete(new ObjectId(d.fileId), (err) => {
          if (err) {
            // if there are any error push them into the errors array for further use.
            errors.push(err);
          }
        });
      }
      // Delete the documents
      const idd = await Document.deleteMany({_id: {$in: args.ids}});
      registerGoodLog(context, qType, qName, 'Multiple documents');
      return {
        deletedCount: idd.deletedCount,
        errors: errors
      };
    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  },
  /**
   * Move multiple documents to another category
   * @param { String } cat - id as string of the target category
   * @param { String[] } oids - array of id as strings of the documents that are going to be moved
   * @return { DeletedResponses }
   */
  moveMultipleDocuments: async(_, args, context, info) => {
    const qType = 'Mutation';
    const qName = 'moveMultipleDocuments';
    try {
      if (!await isAuth(context, [config.permission.docente])) {
        const error = registerBadLog(context, qType, qName);
        throw new ApolloError(`S5, Message: ${error}`);
      }

      const cat: Category =
        await CatModel.findById(args.cat, {_id: true, path: true});

      const docs: DocType[] =
        await Document.find({_id: {$in: args.oids}},
          {_id: true, path: true, category: true, fileName: true});

      const updatedFiles = await moveDocument(cat, docs);

      return updatedFiles;

    } catch (e) {
      registerErrorLog(context, qType, qName, e);
      throw new ApolloError(e);
    }
  }
};

/**
 * Change the category of a group of documents
 * @param cat - Category mongodb document
 * @param docs - Group of documents mongodb documents
 * @return updatedFiles - object that contains the amount of files updated,
 * a list of ids of updated documents and a list of errors found during the execution
 */
async function moveDocument(cat: Category, docs: DocType[]) {
  let updatedFiles = {
    qty: 0,
    files: [],
    errors: []
  }
  for (let i = 0; i < docs.length; i++) {
    try {
      console.log(`Doc ${i}`, docs[i]);

      await Document.findByIdAndUpdate(docs[i]._id,
        {
          path: cat.path + '/' + docs[i].fileName,
          category: cat._id
        },
        {new: true, fields: {_id: true}}
      );

      updatedFiles.qty++;
      updatedFiles.files.push(docs[i].fileId);
    } catch (e) {
      updatedFiles.errors.push(e.toString());
    }
  }
  return updatedFiles;
}

async function CreateGFSBucketConnection(): Promise<GridFSBucket> {
  // Create a mongodb client connection
  const con = await MongoClient.connect(
    process.env.DB_PATH,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
  // Connect to a database using the previous mongo client
  const db = con.db(process.env.DB_NAME);
  // GridFS
  const bucket = new mongodb.GridFSBucket(db, {
    bucketName: 'archivos',
  });
  return bucket;
}

function logDenyDeleteOfDocuments(context, qT, qN) {
  registerGenericLog(
    context, qT, qN,
    'User can\'t delete documents that are not his own');
  throw new ApolloError('User can\'t delete documents that are not his own')
}

export { documentQueries, documentMutations };
