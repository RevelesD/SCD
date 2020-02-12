"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const AWS = require("aws-sdk");
/**
 * Save the image locally
 * @param {Upload} upload - photo buffer
 * @param {string} folder - folder where the image is going to be stored; notices || photo
 * @return {path} the public url for the stored image
 */
async function storeLocally(upload, folder) {
    try {
        const { createReadStream, filename, mimetype } = await upload;
        if (!checkImageMIME(mimetype))
            return 'FORMAT_ERROR';
        const streamImg = createReadStream();
        const extensionFile = filename.split('.');
        const fileName = `${folder}_${Date.now()}.${extensionFile[extensionFile.length - 1]}`;
        /** Uploads to local file system */
        const fn = `/public/${folder}/` + fileName;
        const path = __dirname + '/..' + fn;
        const hddStream = fs.createWriteStream(path);
        await new Promise((resolve, reject) => {
            streamImg
                .pipe(hddStream)
                .on("error", reject)
                .on("finish", resolve);
        });
        return fn;
    }
    catch (e) {
        throw e;
    }
}
exports.storeLocally = storeLocally;
/**
 * Delete file from the local system
 * @param {string} path - location of the file
 */
async function deleteStoredFile(path) {
}
exports.deleteStoredFile = deleteStoredFile;
/**
 * Save the image on amazon S3 bucket
 * @param {upload} upload - photo buffer
 * @param {string} folder - folder where the image is going to be stored; notices || photo
 * @return {path} the public url for the stored image
 */
async function storeOnS3(upload, folder) {
    try {
        const { createReadStream, filename, mimetype } = await upload;
        if (!checkImageMIME(mimetype))
            return 'FORMAT_ERROR';
        const streamImg = createReadStream();
        const extensionFile = filename.split('.');
        const fileName = `${folder}_${Date.now()}.${extensionFile[extensionFile.length - 1]}`;
        /** Uploads to S3 */
        const s3 = new AWS.S3({
            accessKeyId: process.env.IAM_USER_KEY,
            secretAccessKey: process.env.IAM_USER_SECRET,
        });
        let location = 'Hola, no deberias estar aqui';
        const params = { Bucket: process.env.BUCKET_NAME,
            Key: fileName,
            Body: streamImg,
            ACL: 'public-read' };
        await new Promise((resolve, reject) => {
            s3.upload(params, function (err, data) {
                if (err === null) {
                    location = data.Location;
                    resolve();
                }
                else {
                    reject();
                }
            });
        });
        return location;
    }
    catch (e) {
        throw e;
    }
}
exports.storeOnS3 = storeOnS3;
/**
 * Check if the file uploaded is an image
 * @param {string} mimetype - MIMEtype of the uploaded file
 * @return {boolean} check if was image or not
 */
function checkImageMIME(mimetype) {
    if (mimetype !== 'image/jpeg' &&
        mimetype !== 'image/jpg' &&
        mimetype !== 'image/png' &&
        mimetype !== 'image/*') {
        return false;
    }
    return true;
}
//# sourceMappingURL=imageUploader.js.map