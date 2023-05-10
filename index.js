import fs from 'fs';
import path from 'path';


import express from 'express';
import multer from 'multer';
import { v4 } from 'uuid';
import { jobShellExecutor } from './bash-via-node.js';

import { diskLocation, serverPort } from './config.js';

const storage = multer.diskStorage(
  { 
    destination: function(req, res, cb) {

      console.log('storage  | destination |req.body', req.body);
      console.log('storage  | destination | req.file', req.file);
      cb(null, 
        diskLocation
        );
        // './temp/');
    },
    filename: function(req, file, cb) {
      
      console.log('storage  | filename | req.body', req.body);
      console.log('storage  | filename | file', file);
      cb(null, file.originalname );
    }
  });

const app = express();

app.use(express.json());

const upload  = multer({ storage }); 

app.post('/', upload.single('filecontent'), function(req, res) {
  console.log('route /upload | req.file', req.file);
  console.log('route /upload | req.file.mv', req.file.mv);


  console.log('route /upload | req.body', req.body);
  const diskLocation = req.file.path;
  console.log('route /upload | diskLocation', diskLocation);
  res.send({ message: "file uploaded" });
});



app.post('/clone', async function(req, res) {

  try {

  console.log('route /upload | req.body', req.body);
  const { link, filename } = req.body;
  const command = `aria2c ${link} -o ${diskLocation}/${filename}`;
  console.log('download coommand ', command)
  await jobShellExecutor(command);

  res.send({ message: "file downloaded" });
  } catch(e) {
    console.log(e);
    res.send(e);
  }
});



app.get('/', function(req, res) {
  
  const files = getFilesOfFolder(diskLocation);
  res.send(files);
});

app.use('/file', express.static(diskLocation));


app.get('/health', function(req, res) {
  console.log('health api');
  res.send('hii from s-file-service');
});

function getFilesOfFolder(workingDir) {
		const files = fs.readdirSync(workingDir).map(e => ({
      href: path.join(diskLocation, e),
      name: e
    }));
		return files;
}


app.listen(serverPort, function(req, res, next) {
  console.log('listening on port ' + serverPort);
});
