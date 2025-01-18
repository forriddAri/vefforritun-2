import fs from 'fs/promises';
import path from 'path';


/** lesa index.json */

const dataFolder = './data/';

async function validateFiles(entries) {
  const validEntries = [];
  const invalidEntries = [];

  for (const entry of entries) {
    const filePath = path.join(dataFolder, entry.file);

    try {
      const fileData = await fs.readFile(filePath, 'utf-8');
      const parsedData = JSON.parse(fileData);

      if (parsedData.questions) {
        validEntries.push(entry);
      } else {
        throw new Error('File content is not valid for questions');
      }
    } catch (error) {
      console.log(`Invalid or missing file for "${entry.file}":`, error.message);
      invalidEntries.push(entry);
    }
  }

  return { validEntries, invalidEntries };
}

async function readIndexFile() {
  const filePath = path.join(dataFolder, 'index.json');

  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const index = JSON.parse(data);

    const structurallyValidEntries = index.filter(entry => entry.title && entry.file);
    const structurallyInvalidEntries = index.filter(entry => !(entry.title && entry.file));

    const { validEntries, invalidEntries } = await validateFiles(structurallyValidEntries);

    console.log('Valid JSON:', validEntries);
    console.warn('Invalid JSON:', [...structurallyInvalidEntries, ...invalidEntries]);

    // Generate index.html with valid entries
    await createIndexHtml(validEntries);

    return validEntries;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return [];
  }
}

readIndexFile();

/**Búa til index.html  file */

const distFolder = './dist/';

async function createHTML(validEntries) {
  const filePath = path.join(distFolder, 'index.html')

  const link = validEntries.map(
    (entry) => `<li><a href="${entry.file.replace('.json', '.html')}">${entry.title}</a></li>`).join('\n');

 const html = `
    <!DOCTYPE html>
    <html lang="is">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Spurningaflokkar</title>
    </head>
    <body>
      <h1>Velkomin í spurningaleikinn</h1>
      <p>Veldu spurningaflokk:</p>
      <ul>
        ${links}
      </ul>
    </body>
    </html>
  `; 

await fs.mkdir(distFolder, { recursive: true });

  // Write the HTML to the `index.html` file
await fs.writeFile(filePath, html, 'utf8');
  console.log('index.html búið til í', filePath);
}