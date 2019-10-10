// /**
//  * Handles and array of readable streams as async functions and returns
//  * an array of dynamically created names for each file that was retrieved
//  * from the stream
//  * @param { streams } an array of streams that pipe a file
//  * @param { names } an array of names filled on each iteration of the recursively call
//  * @returns { names } a promise containing the same array of strings as the one passed
//  * as parameter but filled with data
//  */
// async function promiseStream(streams, names: string[]): Promise<string[]> {
//   try {
//     if (streams.length) {
//       // create new name
//       const name = String(Date.now());
//       // extract GridFS stream from array
//       const resolved =  streams.shift();
//       // create a writer stream
//       const diskStream = fs.createWriteStream(__dirname + `/temps/${name}.pdf`);
//
//       const promise = new Promise(function (resolve, reject) {
//         // write the file onto disk
//         resolved.on('data', (chunk) => {
//           diskStream.write(chunk);
//         });
//         // once the file is written resolve the promise
//         resolved.on('end', async () => {
//           resolve(true)
//         });
//         resolved.on('error', (err) => {
//           reject(err);
//         });
//       });
//       // await for the file to write on disk before continue
//       const resolve = await promise;
//       if (resolve) {
//         // new name is pushed to the array of names of created files
//         names.push(name);
//         // recursively dive into the streams array until none is left
//         // returning an incremented names array on each iteration
//         return await promiseStream(streams, names);
//       }
//     } else {
//       // when no more streams are left return the array of names as it is
//       return names;
//     }
//   } catch (e) {
//     throw e
//   }
// }
// /**
//  * Creates the final pdf
//  * @param {filesNames} list of names to be merged
//  * @return { filePath } path to the resulting pdf
//  */
// function mergePDFs(files: string[]): string {
//   // define the name of the temp file where the other PDFs are going to be appended to
//   const finalName = 'final_' + String(Date.now());
//   // create the writer stream to join PDFs and send them to the client
//   let pdfWriter = hummus.createWriter(__dirname + `/temps/${finalName}.pdf`);
//   pdfWriter.end();
//
//   let outStream = new hummus.PDFWStreamForFile(__dirname + `/temps/${finalName}.pdf`);
//   pdfWriter = hummus.createWriter(outStream);
//   // append all the files to a single pdf
//   files.forEach(fn => {
//     let inStream = new hummus.PDFRStreamForFile(__dirname + `/temps/${fn}.pdf`);
//     pdfWriter.appendPDFPagesFromPDF(inStream);
//   });
//   // once all files were appended end the end stream
//   pdfWriter.end();
//   outStream.close(function () {});
//   return finalName;
// }
// /**
//  * Handles and array of readable streams as async functions and returns
//  * an array of dynamically created names for each file that was retrieved
//  * from the stream
//  * @param { streams } an array of streams that pipe a file
//  * @param { names } an array of names filled on each iteration of the recursively call
//  * @returns { names } a promise containing the same array of strings as the one passed
//  * as parameter but filled with data
//  */
// async function continueStream(streams, outStream) {
//   try {
//     console.log('iterando chunks');
//     console.log(streams.length);
//     if (streams.length) {
//       // extract GridFS stream from array
//       const resolved =  streams.shift();
//       const promise = new Promise(function (resolve, reject) {
//         // write the file onto disk
//         resolved.on('data', (chunk) => {
//           let bufferReader = new hummus.PDFRStreamForBuffer(chunk);
//
//           outStream.appendPDFPagesFromPDF(bufferReader);
//         });
//         // once the file is written resolve the promise
//         resolved.on('end', () => {
//           resolve(true);
//         });
//         resolved.on('error', (err) => {
//           reject(err);
//         });
//       });
//       // await for the file to write on disk before continue
//       const resolve = await promise;
//       if (resolve) {
//         // recursively dive into the streams array until none is left
//         // returning an incremented names array on each iteration
//         return await continueStream(streams, outStream);
//       }
//     } else {
//       // when no more streams are left return the array of names as it is
//       return outStream;
//     }
//   } catch (e) {
//     throw e
//   }
// }
//# sourceMappingURL=usefullfunc.js.map