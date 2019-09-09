const mongodb = require('mongodb');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;

const uploadsQueries = {
  uploads: async(_, args, context, info) => {
    return
  }
};

const uploadsMutations = {
  singleUpload: async(_, {file}, context, info) => {
    const { stream, filename, mimetype, encoding } = await file;

    // 1. Validate file metadata.
    console.log('mimetype:',mimetype);
    console.log('encoding',encoding);

    // 2. Stream file contents into cloud storage:
    let db;
    MongoClient.connect('mongodb://localhost/scd', (err, database) => {
      if (err) {
        console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
        process.exit(1);
      }
      db = database;
    })


    // 3. Record the file upload in your DB.
    // const id = await recordFile( … )

    return { filename, mimetype, encoding };
  }
};

export { uploadsQueries, uploadsMutations };
