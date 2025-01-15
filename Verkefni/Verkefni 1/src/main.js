import fs from 'fs/promises';
import path from 'path';

const dataFolder = './Verkefni/Verkefni 1/data/';

async function readIndexFile() {
  const filePath = path.join(dataFolder, 'index.json');

  try{
    const data = await fs.readFile(filePath, 'utf-8');
    const index = JSON.parse(data);

    console.log('JSON lesid', index);
    return index;
  }
  catch (error) {
    console.error('failed to read $(filePath):', error.message);
    return[];
  }
}

readIndexFile();

async function readQuestionFile(fileName) {
  const filePath = path.join(dataFolder, fileName);

  try {
    const data = await fs.readFile(filePath, 'utf8');
    const questions = JSON.parse(data);

    console.log(`Spurningar i ${fileName} lesnar:`, questions);
    return questions;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return null;
  }
}

async function readAllData() {
  const index = await readIndexFile();

  for (const item of index) {
    if (item.file) {
      const questions = await readQuestionFile(item.file);
      if (questions) {
        console.log(`Processed data for: ${item.title}`);
      }
    } else {
      console.warn(`Missing 'file' property in index entry:`, item);
    }
  }
}

readAllData();
