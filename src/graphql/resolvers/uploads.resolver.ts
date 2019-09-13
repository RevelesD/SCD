const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const PromiseAll = require('promises-all');
import { config } from '../../../enviroments.dev';
// const ObjectID = require('mongodb').ObjectID;
import { ApolloError } from 'apollo-server';

const processUpload = async upload => {
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
    let bucket = new mongodb.GridFSBucket(db, {
      bucketName: 'archivos'
    });
    const uploadStream = bucket.openUploadStream(filename);
    // 2.3 upload the file to mongo
    await new Promise((resolve, reject) => {
      stream
        .pipe(uploadStream)
        .on("error", reject)
        .on("finish", resolve);
    });
    await con.close();

    return { _id: uploadStream.id, filename, mimetype };
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
  singleUpload: async(_, {file}, context, info) => {
    try {
      // 1. Validate file metadata.
      // console.log('filename:',filename);
      // console.log('mimetype:',mimetype);
      return await processUpload(file);
    } catch (e) {
      throw new ApolloError(e);
    }
  },
  multipleUpload: async (_, {files}) => {
    try {
      // 1. Validate file metadata.
      // console.log('filename:',filename);
      // console.log('mimetype:',mimetype);
      // const { resolve, reject } = await promisesAll(
      //   files.map(processUpload)
      // );

      const { resolve, reject } = await PromiseAll.all(
        files.map(processUpload)
      );

      console.log(resolve);

      return resolve;
    } catch (e) {
      throw new ApolloError(e)
    }
  }
};

export { uploadsQueries, uploadsMutations };
