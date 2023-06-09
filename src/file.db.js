import { v4 } from "uuid";
import { storageDatabase } from "./postgres.js";

const saveFile = async (file) => {
  try {

    console.log('saving ', file.name);
    const query = "INSERT INTO files (id, name, location) VALUES ($1, $2, $3)";

    const result = await storageDatabase.transaction(query, [v4(), file.name, file.location]);

    return result;
  } catch (e) {
    console.log('error saving file', e);
  }

};

const getFiles = async (orderBy, order, limit, offset) => {
  try {

    const query = `SELECT * FROM files ORDER BY ${orderBy} ${order} LIMIT $1 OFFSET $2`;

    const result = await storageDatabase.query(query, [limit, offset]);

    return result.rows;
  } catch (e) {
    console.log('error saving file', e);
  }

};

const getFile = async (fileId) => {
  try {

    const query = `SELECT * FROM files WHERE id = $1`;

    const result = await storageDatabase.query(query, [fileId]);

    return result.rows[0];
  } catch (e) {
    console.log('error getting file', e);
  }

}

const searchFiles = async (searchKey, limit, offset) => {
  try {

    console.log(`fileDB | searchFiles searchKey ${searchKey} limit ${limit} offset ${offset}`);

    const query = `SELECT * FROM files WHERE name LIKE $1 LIMIT $2 OFFSET $3`;

    const result = await storageDatabase.query(query, [`%${searchKey}%`, limit, offset]);
    console.log('fileDB | searchFiles', result);

    return result?.rows;
  } catch (e) {
    console.log('error getting file', e);
  }
}

export { saveFile, getFiles, getFile, searchFiles };
