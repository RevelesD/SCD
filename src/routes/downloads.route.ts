import {MongoClient} from "mongodb";
import { Document } from "../models/documents.model";
import {getUser} from '../middleware/is-auth';
import {
  registerErrorLog,
  registerGenericLog
} from '../middleware/logAction';
const { execFileSync } = require('child_process');
const express = require('express');
const mongo = require('mongodb');
const archiver = require('archiver');
const fs = require('fs');

// router object to export
export const router = express.Router();
/**
 * Creates a mongodb connection
 * @returns {client} - a mongodb client
 */
function getConnection(): Promise<MongoClient> {
  return mongo.MongoClient.connect(process.env.DB_PATH,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  );
}
/**
 * Creates a GridFS bucket
 * @param {client} - a MongoClient instance
 * @returns {gri} - a gridfs bucket with specific name
 */
function getGrid(client) {
  const db = client.db(process.env.DB_NAME);
  return new mongo.GridFSBucket(db, {bucketName: 'archivos'});
}

router.post('/getFile', async (req, res) => {
  // define the variables needed to log the request into the system
  const qType = 'POST';
  const qName = 'getFile';
  const user = getUser(req.headers.authorization || '');
  user['ip'] = req.ip;
  const context = {
    user
  };
  if (context.user['userId'] === undefined) {
    context.user['userId'] = 'Unauthenticated';
  }
  // commence the request flow
  try {
    const client = await getConnection();
    const grid = getGrid(client);

    const id = mongo.ObjectID(req.body.id);
    const doc = await grid.find({_id: id}).toArray();
    if (doc.length != 1) {
      res.status(400);
      res.json({error: 'S2'});
    }
    // definition of headers for file transfer
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Description", "File Transfer");
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.setHeader("Content-Disposition", "attachment; filename=" + doc[0].filename);
    res.setHeader("Content-Type", "application/x-zip-compressed");
    // Begging streaming of file
    const stream = grid.openDownloadStream(id);
    stream.pipe(res)
      .on('error', async (err) => {
        await client.close();
        registerGenericLog(context, qType, qName, 'Error while streaming the file')
        res.json({error: 'X4'});
      })
      .on('finish', async() => {
        registerGenericLog(context, qType, qName, 'Download successfully');
        await client.close()
      })
  } catch (e) {
    registerErrorLog(context, qType, qName, e);
    throw e;
  }
});

router.post('/test', async (req, res) => {
  try {

  } catch (e) {
    throw e;
  }
});

router.post('/joinInZip', async(req, res) => {
  // define the variables needed to log the request into the system
  const qType = 'POST';
  const qName = 'joinInZip';
  const user = getUser(req.headers.authorization || '');
  user['ip'] = req.ip;
  const context = {
    user
  };
  if (context.user['userId'] === undefined) {
    context.user['userId'] = 'Unauthenticated';
  }
  // commence the request flow
  try {
    const body = req.body.files;
    const client = await getConnection();
    const grid = getGrid(client);
    const docs = await Document.find(
      {_id: {$in: body.files_list}},
      // {},
      {fileId: true, path: true}).exec();
    // convert strings into ObjectsId
    const ids = docs.map((e) => {
      return mongo.ObjectID(e.fileId)
    });
    // verify if files exist in db
    let gsf = await grid.find({_id: {$in: ids}}).toArray();
    if (gsf.length !== docs.length) {
      client.close();
      registerGenericLog(context, qType, qName, 'Files to download not found');
      res.status(400);
      res.json({error: 'S2'});
    }
    // convert the documents found into readable streams
    gsf = ids.map((e) => {
      return grid.openDownloadStream(e);
    });
    const archive = archiver('zip', {
      zlib: { level: 9 } // Sets the compression level.
    });

    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
        // log warning
        client.close();
      } else {
        // throw error
        client.close();
        throw err;
      }
    });
    archive.on('error', function(err) {
      client.close();
      registerGenericLog(context, qType, qName, 'Error while compressing the files');
      res.json({error: 'S7'});
      // throw err;
    });
    // definition of headers for file transfer
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition")
    res.setHeader("Content-Description", "File Transfer")
    res.setHeader("Content-Transfer-Encoding", "binary")
    res.setHeader("Content-Disposition", "attachment; filename=" + body.file_name)
    res.setHeader("Content-Type", "application/x-zip-compressed")
    // pipe archive data to the client
    archive.pipe(res)
      .on('error', async (err) => {
        await client.close();
        registerGenericLog(context, qType, qName, 'Error while streaming the file');
        res.json({error: 'X4'});
      })
      .on('finish', async() => {
        registerGenericLog(context, qType, qName, 'Stream of the file successfully');
        await client.close()
      });
    // append every stream into the final zip
    gsf.forEach((e, i) => {
      archive.append(e, {name: docs[i].path});
    });
    //
    archive.finalize();
  } catch (e) {
    registerErrorLog(context, qType, qName, e);
    throw e;
  }
});

router.post('/joinInPdf', async(req, res) => {
  // define the variables needed to log the request into the system
  const qType = 'POST';
  const qName = 'joinInPdf';
  const user = getUser(req.headers.authorization || '');
  user['ip'] = req.ip;
  const context = {
    user
  };
  if (context.user['userId'] === undefined) {
    context.user['userId'] = 'Unauthenticated';
  }
  // commence the request flow
  try {
    const files = req.body.files;
    let args = [];
    files.forEach((s) => {
      args.push(s)
    })
    let path: string = execFileSync(__dirname + '\\..\\main.exe', args, {encoding: 'UTF-8'});
    path = path.trim();
    if (path.startsWith('Error:')) {
      res.setHeader("Content-Type", "application/json");
      res.json({error: path});
      return;
    }
    const name = path.split('\\');
    // definition of headers for file transfer
    if (req.body.mode === 'download') {
      res.setHeader("Content-Disposition", "attachment; filename=" + name[name.length - 1]);
    } else if (req.body.mode === 'watch') {
      res.setHeader("Content-Disposition", "inline; filename=" + name[name.length - 1]);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.json({error: 'C2'});
      return;
    }
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Description", "File Transfer");
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Transfer-Encoding", "binary");
    // pipe the streams and get the filenames of the files written on disk

    const sender = fs.createReadStream(path);
    sender.pipe(res)
      .on('finish', () => {
        registerGenericLog(context, qType, qName, 'Stream of the file successfully');
        // fs.unlinkSync(path);
      })
      .on('error', (err) => {
        registerGenericLog(context, qType, qName, err);
        res.json({error: 'X4'});
      });
  } catch (e) {
    registerErrorLog(context, qType, qName, e);
    res.status(500);
    res.send({error: 'Something blew up'});
  }
});

