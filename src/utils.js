import { diskLocation, host, serverPort } from "./config.js";
import fs from 'fs';
import path from 'path';
import { createHash } from 'node:crypto';

function getFilesOfFolder(workingDir) {
    const files = fs.readdirSync(workingDir).map(e => ({
        id: sha256(path.join(diskLocation, e)),
        name: e
    }));
    return files;
}


function sha256(data) {
    return createHash('sha256').update(data).digest('hex');
}

const getRelatedUrl = (path) => {
    return `http://${host}:${serverPort}${path}`;
}

export { getFilesOfFolder, getRelatedUrl, sha256 };
