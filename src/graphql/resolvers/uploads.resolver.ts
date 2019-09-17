import {Category} from "../../models/category.model";

const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const PromiseAll = require('promises-all');
import { Document } from "../../models/documents.model";
import { config } from '../../../enviroments.dev';
// const ObjectID = require('mongodb').ObjectID;
import { ApolloError } from 'apollo-server';

const processUpload = async (upload, input) => {
  try {
    const { createReadStream, filename, mimetype } = await upload;
    const stream = createReadStream();

    const con = await MongoClient.connect(
      config.dbPath,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    const db = con.db(config.dbName);
    // ===================== GridFS ========================
    // pending to check uploads of smaller sizes
    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'archivos',
    });
    const uploadStream = bucket.openUploadStream(filename, {
      disableMD5: true
    });
    // 2.3 upload the file to mongo
    await new Promise((resolve, reject) => {
      stream
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });
    // close connection with the database.
    await con.close();
    const docData = { _id: uploadStream.id, filename, mimetype, length: uploadStream.length};
    // create, wait and return the document entry on the database
    return await createDocument(input.category, input.owner, docData);
  } catch (e) {
    throw new ApolloError(e);
  }
}

async function createDocument(catId, owner, docData) {
  try {
    const category = await Category.findById(catId);

    const doc = await Document.create({
      fileName: docData.filename,
      fileId: docData._id,
      mimetype: docData.mimetype,
      size: docData.length,
      path: `${category.path}/${docData.filename}`,
      category: catId,
      owner: owner
    });
    return doc;
  } catch (e) {
    throw new ApolloError(e);
  }
}

const uploadsQueries = {
  // uploads: async(_, args, context, info) => {
  //   return
  // },
  // upload: async(_, {id}, context, info) => {
  //   return
  // }
};

const uploadsMutations = {
  singleUpload: async(_, {file, input}) => {
    try {
      // 1. Validate file metadata.
      // console.log('filename:',filename);
      // console.log('mimetype:',mimetype);
      const res = await processUpload(file, input);
      return res;
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  multipleUpload: async (_, {files, input}) => {
    try {
      // 1. Validate file metadata.
      // console.log('filename:',filename);
      // console.log('mimetype:',mimetype);

      const { resolve, reject } = await PromiseAll.all(
        files.map(
          async (x) => await processUpload(x, input)
        )
      );

      return resolve;
    } catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { uploadsQueries, uploadsMutations };
