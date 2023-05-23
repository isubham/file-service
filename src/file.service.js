
import { FileIterator } from "./file.js";
import { diskLocation } from "./config.js";
import path from "path";
import fs from 'fs';
import { saveFile, getFiles, getFile } from "./file.db.js";


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
  return await getFiles(orderBy, order, limit, offset);
}



const ingestAllFiles = async () => {
  const allFiles = getAllFilesFromFS();

  let counter = 0;

  for (let file of allFiles) {
    // if (counter < 20) {
    const result = await saveFile(file);
    console.log(' file saved', result)
    counter += 1;
    // }
  }

};


const saveFileService = async (file) => {

  const result = await saveFile(file);
  console.log(' file saved', result)
  return result;
};

const getFileService = async (fileId) => {
  const file = await getFile(fileId);
  return file
}

export { downloadAsync, getAllFilesFromFS, ingestAllFiles, saveFileService, getAllFiles, getFileService };

