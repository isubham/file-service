
import { FileIterator } from "./file.js";
import { diskLocation } from "./config.js";
import path from "path";
import fs from 'fs';
import * as fileDB from "./file.db.js";


const downloadAsync = async (link, diskLocation, filename) => {
  const command = `aria2c ${link} -o ${diskLocation}/${filename}`;
  console.log('download coommand ', command)
  await jobShellExecutor(command);
}



const getAllFilesFromFS = () => {
  const fileNames = FileIterator.getFolderHierarchy(diskLocation);
  return fileNames.map(file => {
    return {
      name: path.basename(file),
      location: file.substr(diskLocation.length, file.length)
    }
  });

};

const getAllFiles = async (orderBy = 'id', order = 'ASC', offset = 0, limit = 20) => {
  return await fileDB.getFiles(orderBy, order, limit, offset);
}



const ingestAllFiles = async () => {
  const allFiles = getAllFilesFromFS();

  let counter = 0;

  for (let file of allFiles) {
    // if (counter < 20) {
    const result = await fileDB.saveFile(file);
    console.log(' file saved', result)
    counter += 1;
    // }
  }

};


const saveFileService = async (file) => {

  const result = await fileDB.saveFile(file);
  console.log(' file saved', result)
  return result;
};

const getFileService = async (fileId) => {
  const file = await fileDB.getFile(fileId);
  return file;
}

const searchFiles = async (searchKey, pageSize, page) => {
  return await fileDB.searchFiles(searchKey, pageSize, page * pageSize);
}


export { downloadAsync, getAllFilesFromFS, ingestAllFiles, saveFileService, getAllFiles, getFileService, searchFiles };

