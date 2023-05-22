import multer from 'multer';
import { v4 } from 'uuid';

import { diskLocation, serverPort } from './config.js';

const storage = multer.diskStorage(
    {
        destination: function (req, res, cb) {

            console.log('storage  | destination |req.body', req.body);
            console.log('storage  | destination | req.file', req.file);
            cb(null,
                diskLocation
            );
            // './temp/');
        },
        filename: function (req, file, cb) {

            console.log('storage  | filename | req.body', req.body);
            console.log('storage  | filename | file', file);
            cb(null, file.originalname);
        }
    });

const upload = multer({ storage });

export { upload };

