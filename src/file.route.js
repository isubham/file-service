import express from "express";
import { jobShellExecutor } from './bash-via-node.js';
import { upload } from "./uploader.js";
import { getFilesOfFolder, getRelatedUrl, sha256 } from "./utils.js";
import { diskLocation } from "./config.js";
import httpStatus from "http-status";
import path from 'path';
import * as fileService from './file.service.js';
import { v4 } from "uuid";
import fs from 'fs';
import mime from 'mime-types';

const fileRouter = express.Router();

fileRouter.post('/upload', upload.single('filecontent'), async function (req, res) {
    try {
        console.log('route /| req.file', req.file);
        console.log('route /| req.file.mv', req.file.mv);


        console.log('route /| req.body', req.body);
        const fileLocation = req.file.path;
        console.log('route /| diskLocation', fileLocation);
        const file = { location: fileLocation, name: path.basename(fileLocation), id: v4() };
        await fileService.saveFileService(file)
        const createdFile = {
            ...file, location: file.location.substr(diskLocation.length, file.length)
        };
        res.status(httpStatus.CREATED).send({
            data: createdFile,
            controls: { download: getRelatedUrl(`/${createdFile.id}`) }
        });
    } catch (e) {
        console.log('error uploading', e)
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send()
    }
});


fileRouter.get('/folders', function (req, res) {
    try {
        const files = getFilesOfFolder(diskLocation);
        res.send(files);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.get('/', async function (req, res) {
    try {
        const page = parseInt(req?.query?.page) || 1;
        const pageSize = (parseInt(req?.query?.pageSize)) || 20;
        const orderBy = (req?.query?.orderBy) || 'id';
        const order = (req?.query?.order) || 'ASC';

        const files = await fileService.getAllFiles(orderBy, order, page * pageSize, pageSize);
        res.send(files);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.post('/ingest', async function (req, res) {
    try {
        const files = await fileService.ingestAllFiles();
        res.send(files);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});






fileRouter.get('/download/:fileId/', async function (req, res) {
    try {

        const fileId = req.params.fileId;
        const range = req.headers.range;
        console.log('range', range);

        const file = await fileService.getFileService(fileId);

        const fileStream = fs.createReadStream(path.join(diskLocation, file.location));
        fileStream.pipe(res);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.get('/stream/:fileId/', async function (req, res) {
    try {
        const fileId = req.params.fileId;
        const range = req.headers.range;
        console.log('range', range);

        const file = await fileService.getFileService(fileId);
        // download whole file
        if (!range) {
            res.send(httpStatus.UNPROCESSABLE_ENTITY).send({ error: 'provide range header' })
        }
        else {


            const CHUNK_SIZE = 10 ** 6;
            const start = Number(range.replace(/\D/g, ""));
            const fileSize = fs.statSync(path.join(diskLocation, file.location)).size
            const end = Math.min(start + CHUNK_SIZE, fileSize - 1);
            const contentLength = end - start + 1;

            const mimeType = mime.lookup(path.basename(file.location), "audio/mp3");
            const headers = {
                "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                "Accept-Ranges": "bytes",
                "Content-Length": contentLength,
                "Content-Type": mimeType,
            };
            res.writeHead(httpStatus.PARTIAL_CONTENT, headers);

            const fileStream = fs.createReadStream(path.join(diskLocation, file.location), { start, end });
            fileStream.pipe(res);
        }

    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.get('/search/:searchKey', async function (req, res) {
    try {
        const page = parseInt(req?.query?.page) || 0;
        const pageSize = (parseInt(req?.query?.pageSize)) || 20;

        const searchKey = req.params.searchKey || '';

        const files = await fileService.searchFiles(searchKey, pageSize, page);
        res.send(files);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.get('/health', function (req, res) {
    try {
        console.log('health api');
        res.send({
            data: 'hii from s-file-service',
            controls: {
                upload: getRelatedUrl("/upload"),
                getFile: getRelatedUrl("/your-fileId"),
                getFiles: getRelatedUrl("/"),
                download: getRelatedUrl("/download/your-fileId"),
                stream: getRelatedUrl("/stream/your-fileId"),
                search: getRelatedUrl("/search/your-fileId"),
            }
        });
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

export { fileRouter };

