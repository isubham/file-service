import express from 'express';
import { fileRouter } from './file.route.js';
import { serverPort } from './config.js';

const app = express();

app.use(express.json());

app.use('', fileRouter)

app.listen(serverPort, function (req, res, next) {
  console.log('listening on port ' + serverPort);
});

