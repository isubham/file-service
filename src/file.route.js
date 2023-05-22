import express from "express";
import { jobShellExecutor } from './bash-via-node.js';
import { upload } from "./uploader.js";
import { getFilesOfFolder, getRelatedUrl, sha256 } from "./utils.js";
import { diskLocation } from "./config.js";
import httpStatus from "http-status";
import path from 'path';
import { getAllFiles, ingestAllFiles, saveFileService } from './file.service.js';
import { v4 } from "uuid";

const fileRouter = express.Router();

fileRouter.use('/file', express.static(diskLocation));

fileRouter.post('/', upload.single('filecontent'), async function (req, res) {
    try {
        console.log('route /| req.file', req.file);
        console.log('route /| req.file.mv', req.file.mv);


        console.log('route /| req.body', req.body);
        const fileLocation = req.file.path;
        console.log('route /| diskLocation', fileLocation);
        const file = { location: fileLocation, name: path.basename(fileLocation), id: v4() };
        await saveFileService(file)
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



fileRouter.post('/clone', async function (req, res) {

    try {

        console.log('route /upload | req.body', req.body);
        const { link, filename } = req.body;
        await downloadAsync(link, diskLocation, filename);
        res.send({ message: "file downloaded" });
    } catch (e) {
        console.log(e);
        res.send(e);
    }
});


fileRouter.get('/buckets', function (req, res) {
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

        const files = await getAllFiles(orderBy, order, page * pageSize, pageSize);
        res.send(files);
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});

fileRouter.post('/ingest', async function (req, res) {
    try {
        const files = await ingestAllFiles();
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
                getFiles: getRelatedUrl("/"),
            }
        });
    } catch (e) {
        console.log(e);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).send();
    }
});




export { fileRouter };

