import * as assert from "assert";

const express = require('express');
const router = express.Router();
const multer = require('multer');
// const mongoose = require('mongoose');
import { config } from "../../enviroments.dev";
// import { MongoClient, Db, GridFSBucket } from 'mongodb';
const mongo = require('mongodb');
// retrieve single file
router.get('/:id', async (req, res) => {
  try {
    console.log(req.params.id);
    const client = await mongo.MongoClient.connect(config.dbPath,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    const id = mongo.ObjectID(req.params.id);
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
      .on('error', (err) => {
        assert.ifError(err)
      })
      .on('finish', async() => {
        await client.close()
      })
  } catch (e) {
    throw e;
  }
});

router.post('/upload', async (req, res) => {
  try {
    const body = req.body;
    const storage = multer.memoryStorage();
    const upload = multer({storage: storage});
    const client = await mongo.MongoClient.connect(config.dbPath,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      }
    );
    const db = client.db(config.dbName);
    const grid = new mongo.GridFSBucket(db, {bucketName: 'archivos'});


  } catch (e) {

  }
})

module.exports = router;
