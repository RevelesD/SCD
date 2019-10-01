import * as assert from "assert";
import { config } from "../../enviroments.dev";
import {MongoClient} from "mongodb";
import { Document } from "../models/documents.model";

const express = require('express');
const mongo = require('mongodb');
const archiver = require('archiver');
const hummus = require('hummus');
const MemoryStream = require('memorystream');
const fs = require('fs');

// router object to export
export const router = express.Router();
/**
 * Creates a mongodb connection
 * @returns {client} - a mongodb client
 */
function getConnection(): Promise<MongoClient> {
  return mongo.MongoClient.connect(config.dbPath,
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
  const db = client.db(config.dbName);
  return new mongo.GridFSBucket(db, {bucketName: 'archivos'});
}
/**
 * Handles and array of readable streams as async functions and returns
 * an array of dynamically created names for each file that was retrieved
 * from the stream
 * @param { streams } an array of streams that pipe a file
 * @param { names } an array of names filled on each iteration of the recursively call
 * @returns { names } a promise containing the same array of strings as the one passed
 * as parameter but filled with data
 */
async function promiseStream(streams, names: string[]): Promise<string[]> {
  try {
    if (streams.length) {
      // create new name
      const name = String(Date.now());
      // extract GridFS stream from array
      const resolved =  streams.shift();
      // create a writer stream
      const diskStream = fs.createWriteStream(__dirname + `/temps/${name}.pdf`);

      const promise = new Promise(function (resolve, reject) {
        // write the file onto disk
        resolved.on('data', (chunk) => {
          diskStream.write(chunk);
        });
        // once the file is written resolve the promise
        resolved.on('end', async () => {
          resolve(true)
        });
        resolved.on('error', (err) => {
          reject(err);
        });
      });
      // await for the file to write on disk before continue
      const resolve = await promise;
      if (resolve) {
        // new name is pushed to the array of names of created files
        names.push(name);
        // recursively dive into the streams array until none is left
        // returning an incremented names array on each iteration
        return await promiseStream(streams, names);
      }
    } else {
      // when no more streams are left return the array of names as it is
      return names;
    }
  } catch (e) {
    throw e
  }
}
/**
 * Creates the final pdf
 * @param {filesNames} list of names to be merged
 * @return { filePath } path to the resulting pdf
 */
function mergePDFs(files: string[]): string {
  // define the name of the temp file where the other PDFs are going to be appended to
  const finalName = 'final_' + String(Date.now());
  // create the writer stream to join PDFs and send them to the client
  let pdfWriter = hummus.createWriter(__dirname + `/temps/${finalName}.pdf`);
  pdfWriter.end();

  let outStream = new hummus.PDFWStreamForFile(__dirname + `/temps/${finalName}.pdf`);
  pdfWriter = hummus.createWriter(outStream);
  // append all the files to a single pdf
  files.forEach(fn => {
    let inStream = new hummus.PDFRStreamForFile(__dirname + `/temps/${fn}.pdf`);
    pdfWriter.appendPDFPagesFromPDF(inStream);
  });
  // once all files were appended end the end stream
  pdfWriter.end();
  outStream.close(function () {});
  return finalName;
}

router.post('/getFile', async (req, res) => {
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

  } catch (e) {
    throw e;
  }
});

router.post('/joinInZip', async(req, res) => {
  try {
    const body = req.body.files;
    const client = await getConnection();
    const grid = getGrid(client);
    const docs = await Document.find(
      {_id: {$in: body.files_list}},
      {fileId: true, path: true}).exec();
    // convert strings into ObjectsId
    const ids = docs.map((e) => {
      return mongo.ObjectID(e.fileId)
    });
    // verify if files exist in db
    let gsf = await grid.find({_id: {$in: ids}}).toArray();
    // let gsf = await grid.find({}).toArray();
    if (gsf.length !== docs.length) {
      client.close();
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
      throw err;
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
        assert.ifError(err)
      })
      .on('finish', async() => {
        await client.close()
      });
    // append every stream into the final zip
    gsf.forEach((e, i) => {
      archive.append(e, {name: docs[i].path});
    });
    archive.finalize();
  } catch (e) {
    throw e;
  }
});

router.post('/joinInPdf', async(req, res) => {
  console.log("entro");
  const client = await getConnection();
  try {
    const body = req.body.files;
    const grid = getGrid(client);
    const docs = await Document.find(
      {_id: {$in: body.files_list}},
      {fileId: true, path: true}).exec();
    // convert strings into ObjectsId
    const ids = docs.map((e) => {
      return mongo.ObjectID(e.fileId)
    });
    // verify if the files exists in the db
    let gsf = await grid.find({_id: {$in: ids}}).toArray();
    if (gsf.length !== docs.length) {
      client.close();
      res.status(400);
      res.json({error: 'S2'});
    }
    // convert the documents found into readable streams
    gsf = ids.map((e) => {
      return grid.openDownloadStream(e);
    });
    // definition of headers for file transfer
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    res.setHeader("Content-Description", "File Transfer");
    res.setHeader("Content-Transfer-Encoding", "binary");
    res.setHeader("Content-Disposition", "attachment; filename=" + body.file_name);
    res.setHeader("Content-Type", "application/pdf");
    // pipe the streams and get the filenames of the files written on disk
    let names = [];
    names = await promiseStream(gsf, names);
    const finalName = mergePDFs(names);

    const sender = fs.createReadStream(__dirname + `/temps/${finalName}.pdf`);
    sender.pipe(res)
      .on('finish', () => {
        names.forEach((n, i) => {
          fs.unlink(__dirname + `/temps/${n}.pdf`, function() {});
        });
        fs.unlink(__dirname + `/temps/${finalName}.pdf`, function (){});
        client.close();
      })
      .on('error', (err) => {
        console.log(err);
      });
  } catch (e) {
    client.close();
    res.status(500);
    res.send({error: 'Something blew up'});
  }
});

// const output = fs.createWriteStream(`./temps/example.zip`);
// gridStream.pipe(output)
//   .on('error', (err) => {
//     assert.ifError(err)
//   })
//   .on('finish', async() => {
//     await client.close()
//     res.json({done: 'all good'});
//   });

// output.on('close', function() {
//   console.log(archive.pointer() + ' total bytes');
//   console.log('archiver has been finalized and the output file descriptor has closed.');
// });
// output.on('end', function() {
//   console.log('Data has been drained');
// });
// good practice to catch warnings (ie stat failures and other non-blocking errors)
