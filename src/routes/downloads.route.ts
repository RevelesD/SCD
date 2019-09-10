const express = require('express');
const router = express.Router();;
const mongoose = require('mongoose');
import { config } from "../../enviroments.dev";

// let conn = mongoose.connection;
const multer = require('multer');
const GridFsStorage = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
// Grid.mongo = mongoose.mongo;
const gfs = Grid(config.dbName, mongoose.connection);

// Setting up the storage element
const storage = GridFsStorage({
  gfs: gfs,
  url: config.mongooseURL,
  filename: (req, file, cb) => {
    let date = Date.now();
    // The way you want to store your file in database
    cb(null, file.fieldname + '-' + date + '.');
  },

  // Additional Meta-data that you want to store
  metadata: function(req, file, cb) {
    cb(null, { originalname: file.originalname });
  },
  root: 'archivos' // Root collection name
});

// Multer configuration for single file uploads
const upload = multer({
  storage: storage
}).single('file');

// retrieve single file
router.get('/:id', async (req, res) => {
  try {
    console.log(req.params);
    console.log(gfs);

    gfs.exist({_id: req.params.id}, (err, found) => {
      if (!found) {
        return res.status(404).json({
          responseCode: 1,
          responseMessage: "error"
        });
      }
    });

    const readStream = gfs.createReadStream({
      _id: req.params.id,
      root: 'archivos'
    });

    res.set('Content-Type', 'application/pdf');
    res.set("Access-Control-Expose-Headers", "Content-Disposition");
    res.set("Content-Description", "File Transfer");
    res.set("Content-Transfer-Encoding", "binary");
    // res.set("Content-Disposition", "attachment; filename=" + data.FileName);
    res.set("Content-Type", "application/x-zip-compressed");
    // Return response
    return readStream.pipe(res);

    /*gfs.collection('archivos'); //set collection name to lookup into
    /!** First check if file exists *!/
    gfs.files.find({_id: req.params.id}).toArray(function(err, files) {
      if(!files || files.length === 0){
        return res.status(404).json({
          responseCode: 1,
          responseMessage: "error"
        });
      }
      // create read stream
      const readstream = gfs.createReadStream(
        {_id: files[0]._id, root: "archivos"}
      );
      // set the proper content type
      res.set('Content-Type', 'application/pdf')
      // Return response
      return readstream.pipe(res);*/
  } catch (e) {
    throw e;
  }
});

module.exports = router;
