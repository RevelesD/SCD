const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
import { config } from '../../../enviroments.dev';
// const ObjectID = require('mongodb').ObjectID;
import { ApolloError } from 'apollo-server';

const uploadsQueries = {
  uploads: async(_, args, context, info) => {
    return
  },
  upload: async(_, {id}, context, info) => {
    return
  }
};

const uploadsMutations = {
  singleUpload: async(_, {file}, context, info) => {
    const { createReadStream, filename, mimetype, encoding } = await file;
    const stream = createReadStream();
    // 1. Validate file metadata.
    console.log('filename:',filename);
    console.log('mimetype:',mimetype);
    console.log('encoding:',encoding);
    // 2. Stream file contents into cloud storage:
    // 2.1 open connection to db
    try {
      const con = await MongoClient.connect(
        config.dbPath,
        { useNewUrlParser: true }
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
      // 3. Record the file upload in your DB.
      // const id = await recordFile( … )
      return { _id: uploadStream.id, filename, mimetype, encoding };
    } catch (e) {
      throw new ApolloError(e);
    }
  }
};

export { uploadsQueries, uploadsMutations };
