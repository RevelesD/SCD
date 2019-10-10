"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const enviroments_dev_1 = require("../../enviroments.dev");
const documents_model_1 = require("../models/documents.model");
const { execFileSync } = require('child_process');
const express = require('express');
const mongo = require('mongodb');
const archiver = require('archiver');
const fs = require('fs');
// router object to export
exports.router = express.Router();
/**
 * Creates a mongodb connection
 * @returns {client} - a mongodb client
 */
function getConnection() {
    return mongo.MongoClient.connect(enviroments_dev_1.config.dbPath, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
/**
 * Creates a GridFS bucket
 * @param {client} - a MongoClient instance
 * @returns {gri} - a gridfs bucket with specific name
 */
function getGrid(client) {
    const db = client.db(enviroments_dev_1.config.dbName);
    return new mongo.GridFSBucket(db, { bucketName: 'archivos' });
}
exports.router.post('/getFile', async (req, res) => {
    try {
        const client = await getConnection();
        const grid = getGrid(client);
        const id = mongo.ObjectID(req.body.id);
        const doc = await grid.find({ _id: id }).toArray();
        if (doc.length != 1) {
            res.status(400);
            res.json({ error: 'S2' });
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
            assert.ifError(err);
        })
            .on('finish', async () => {
            await client.close();
        });
    }
    catch (e) {
        throw e;
    }
});
exports.router.post('/test', async (req, res) => {
    try {
    }
    catch (e) {
        throw e;
    }
});
exports.router.post('/joinInZip', async (req, res) => {
    try {
        const body = req.body.files;
        const client = await getConnection();
        const grid = getGrid(client);
        const docs = await documents_model_1.Document.find({ _id: { $in: body.files_list } }, { fileId: true, path: true }).exec();
        // convert strings into ObjectsId
        const ids = docs.map((e) => {
            return mongo.ObjectID(e.fileId);
        });
        // verify if files exist in db
        let gsf = await grid.find({ _id: { $in: ids } }).toArray();
        // let gsf = await grid.find({}).toArray();
        if (gsf.length !== docs.length) {
            client.close();
            res.status(400);
            res.json({ error: 'S2' });
        }
        // convert the documents found into readable streams
        gsf = ids.map((e) => {
            return grid.openDownloadStream(e);
        });
        const archive = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });
        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                // log warning
                client.close();
            }
            else {
                // throw error
                client.close();
                throw err;
            }
        });
        archive.on('error', function (err) {
            client.close();
            throw err;
        });
        // definition of headers for file transfer
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader("Content-Description", "File Transfer");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Disposition", "attachment; filename=" + body.file_name);
        res.setHeader("Content-Type", "application/x-zip-compressed");
        // pipe archive data to the client
        archive.pipe(res)
            .on('error', async (err) => {
            await client.close();
            assert.ifError(err);
        })
            .on('finish', async () => {
            await client.close();
        });
        // append every stream into the final zip
        gsf.forEach((e, i) => {
            archive.append(e, { name: docs[i].path });
        });
        archive.finalize();
    }
    catch (e) {
        throw e;
    }
});
exports.router.post('/joinInPdf', async (req, res) => {
    try {
        const files = req.body.files;
        let args = [];
        files.forEach((s) => {
            args.push(s);
        });
        let path = execFileSync(__dirname + '\\..\\main.exe', args, { encoding: 'UTF-8' });
        path = path.trim();
        const name = path.split('\\');
        // definition of headers for file transfer
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader("Content-Description", "File Transfer");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Disposition", "attachment; filename=" + name[name.length - 1]);
        res.setHeader("Content-Type", "application/pdf");
        // pipe the streams and get the filenames of the files written on disk
        const sender = fs.createReadStream(path);
        sender.pipe(res)
            .on('finish', () => {
            fs.unlinkSync(path);
        })
            .on('error', (err) => {
            console.log(err);
        });
    }
    catch (e) {
        res.status(500);
        res.send({ error: 'Something blew up' });
    }
});
//# sourceMappingURL=downloads.route.js.map