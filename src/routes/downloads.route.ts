import * as assert from "assert";
const express = require('express');
export const router = express.Router();
import { config } from "../../enviroments.dev";
const mongo = require('mongodb');
const fs = require('fs');
// retrieve single file

router.post('/getFile', async (req, res) => {
  try {
    const client = await mongo.MongoClient.connect(config.dbPath,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    const id = mongo.ObjectID(req.body.id);
    const db = client.db(config.dbName);
    const grid = new mongo.GridFSBucket(db, {bucketName: 'archivos'});
    const doc = await grid.find({_id: id}).toArray();
    if (doc.length != 1) {
      res.status(400);
      res.json({error: 'S2'});
    }
    // definition of headers for file transfer
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition")
    res.setHeader("Content-Description", "File Transfer")
    res.setHeader("Content-Transfer-Encoding", "binary")
    res.setHeader("Content-Disposition", "attachment; filename=" + doc[0].filename)
    res.setHeader("Content-Type", "application/x-zip-compressed")
    // Begging streaming of file
    const stream = grid.openDownloadStream(id);
    stream.pipe(res)
      .on('error', async (err) => {
        await client.close();
        assert.ifError(err)
      })
      .on('finish', async() => {
        await client.close()
      })
  } catch (e) {
    throw e;
  }
});

router.post('/test', async (req, res) => {
  try {
    const client = await mongo.MongoClient.connect(config.dbPath,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    const id = mongo.ObjectID(req.body.id);
    const db = client.db(config.dbName);
    const grid = new mongo.GridFSBucket(db, {bucketName: 'archivos'});
    const found = await grid.find({_id: id}).toArray();
    if (found.length != 1) {
      res.status(400);
      res.json({error: 'S2'});
    }
    console.log(found);
    const stream = grid.openDownloadStream(id);
    const ws = fs.createWriteStream('./temps/tmps.pdf');
    stream.pipe(ws)
      .on('error', (err) => {
        assert.ifError(err)
      })
      .on('finish', async() => {
        await client.close()
        res.json({done: 'all good'});
      });

    ws.on('error', function (err) {
      console.log(err);
    })
  } catch (e) {
    throw e;
  }
});

router.post('/joinInZip', async(req, res) => {
  try {

  } catch (e) {
    throw e;
  }
});

router.post('/joinInPdf', async(req, res) => {
  try {
    
  } catch (e) {
    throw e;
  }
});
