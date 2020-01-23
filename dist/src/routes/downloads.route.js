"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const documents_model_1 = require("../models/documents.model");
const is_auth_1 = require("../utils/is-auth");
const logAction_1 = require("../utils/logAction");
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
    return mongo.MongoClient.connect(process.env.DB_PATH, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
/**
 * Creates a GridFS bucket
 * @param {client} - a MongoClient instance
 * @returns {gridfs bucket} - a gridfs bucket with a specific name
 */
function getGrid(client) {
    const db = client.db(process.env.DB_NAME);
    return new mongo.GridFSBucket(db, { bucketName: 'archivos' });
}
/**
 * Obtain a single file
 * @param {string} id - id of the document
 * @param {string} mode - view or download
 */
exports.router.post('/getFile', async (req, res) => {
    // define the variables needed to log the request into the system
    const qType = 'POST';
    const qName = 'getFile';
    const user = is_auth_1.getUser(req.headers.authorization || '');
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
        const doc = await grid.find({ _id: id }).toArray();
        if (doc.length != 1) {
            console.log('Error encotrando el archivos');
            res.status(400);
            res.json({ error: 'S2' });
        }
        // definition of headers for file transfer, the filename is also send by the header content-disposition
        res.setHeader("Content-Description", "File Transfer");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        /*
          Definition of headers
          If the file is going to be downloaded, watched or if the was an error retrieving the file
         */
        if (req.body.mode === 'download') {
            res.setHeader("Content-Disposition", "attachment; filename=" + doc[0].filename);
        }
        else if (req.body.mode === 'watch') {
            res.setHeader("Content-Disposition", "inline; filename=" + doc[0].filename);
        }
        else {
            res.setHeader("Content-Type", "application/pdf");
            res.json({ error: 'C2' });
            return;
        }
        // Begging streaming of file
        const stream = grid.openDownloadStream(id);
        stream.pipe(res)
            .on('error', async (err) => {
            await client.close();
            logAction_1.registerGenericLog(context, qType, qName, 'Error while streaming the file');
            res.json({ error: 'X4' });
        })
            .on('finish', async () => {
            logAction_1.registerGenericLog(context, qType, qName, 'Download successfully');
            await client.close();
        });
    }
    catch (e) {
        logAction_1.registerErrorLog(context, qType, qName, e);
        throw e;
    }
});
/**
 * Compress in a zip file all the files asked by the user
 * @param {string} file_name - Desired name for the zip file
 * @param {string[}]} files_list - list of documents ids
 * @return Stream of the zip file
 */
exports.router.post('/joinInZip', async (req, res) => {
    // define the variables needed to log the request into the system
    const qType = 'POST';
    const qName = 'joinInZip';
    const user = is_auth_1.getUser(req.headers.authorization || '');
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
        const docs = await documents_model_1.Document.find({ _id: { $in: req.body.files_list } }, { fileId: true, path: true }).exec();
        // convert strings into ObjectsId
        const ids = docs.map((e) => {
            return mongo.ObjectID(e.fileId);
        });
        // verify if files exist in db
        let gsf = await grid.find({ _id: { $in: ids } }).toArray();
        if (gsf.length !== docs.length) {
            client.close();
            logAction_1.registerGenericLog(context, qType, qName, 'Files to download not found');
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
            logAction_1.registerGenericLog(context, qType, qName, 'Error while compressing the files');
            res.json({ error: 'S7' });
            // throw err;
        });
        // definition of headers for file transfer
        res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
        res.setHeader("Content-Description", "File Transfer");
        res.setHeader("Content-Transfer-Encoding", "binary");
        res.setHeader("Content-Disposition", "attachment; filename=" + req.body.file_name);
        res.setHeader("Content-Type", "application/x-zip-compressed");
        // pipe archive data to the client
        archive.pipe(res)
            .on('error', async (err) => {
            await client.close();
            logAction_1.registerGenericLog(context, qType, qName, 'Error while streaming the file');
            res.json({ error: 'X4' });
        })
            .on('finish', async () => {
            logAction_1.registerGenericLog(context, qType, qName, 'Stream of the file successfully');
            await client.close();
        });
        // append every stream into the final zip
        gsf.forEach((e, i) => {
            archive.append(e, { name: docs[i].path });
        });
        //
        archive.finalize();
    }
    catch (e) {
        logAction_1.registerErrorLog(context, qType, qName, e);
        throw e;
    }
});
/**
 * Join multiple pdf documents into a single one
 * @param {string[}]} files - list of documents ids
 * @param {string} mode - if the file needs to be downloaded or viewed online
 * @return Stream of the zip file
 */
exports.router.post('/joinInPdf', async (req, res) => {
    // define the variables needed to log the request into the system
    const qType = 'POST';
    const qName = 'joinInPdf';
    const user = is_auth_1.getUser(req.headers.authorization || '');
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
        args.push(process.env.DB_PATH);
        files.forEach((s) => {
            args.push(s);
        });
        // Use the go compiled tool to process the retrieving and joining of pdfs
        let path = execFileSync(__dirname + '\\PDFMerger.exe', args, { encoding: 'UTF-8' });
        path = path.trim();
        if (path.startsWith('Error:') || path.startsWith('panic:')) {
            console.log('Golang binary failed');
            res.setHeader("Content-Type", "application/json");
            res.json({ error: path });
            return;
        }
        const name = path.split('\\');
        /*
          Definition of headers
          If the file is going to be downloaded, watched or if the was an error retrieving the file
         */
        if (req.body.mode === 'download') {
            res.setHeader("Content-Disposition", "attachment; filename=" + name[name.length - 1]);
        }
        else if (req.body.mode === 'watch') {
            res.setHeader("Content-Disposition", "inline; filename=" + name[name.length - 1]);
        }
        else {
            res.setHeader("Content-Type", "application/json");
            res.json({ error: 'C2' });
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
            logAction_1.registerGenericLog(context, qType, qName, 'Stream of the file successfully');
            fs.unlinkSync(path);
        })
            .on('error', (err) => {
            logAction_1.registerGenericLog(context, qType, qName, err);
            res.json({ error: 'X4' });
        });
    }
    catch (e) {
        logAction_1.registerErrorLog(context, qType, qName, e);
        res.status(500);
        res.send({ error: 'Something blew up' });
    }
});
// router.post('/test', async (req, res) => {
//   try {
//     //
//   } catch (e) {
//     throw e;
//   }
// });
//# sourceMappingURL=downloads.route.js.map