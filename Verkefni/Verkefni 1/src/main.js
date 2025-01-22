import fs from 'fs/promises';
import path from 'path';

const dataFolder = './data/';
const distFolder = './';

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

    await createIndexHtml(validEntries);
    for (const entry of validEntries) {
      await createCategoryHtml(entry);
    }

    return validEntries;
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error.message);
    return [];
  }
}

async function createIndexHtml(validEntries) {
  const filePath = path.join(distFolder, 'index.html');
  const links = validEntries
    .map(entry => `<li><a href="${entry.file.replace('.json', '.html')}">${entry.title}</a></li>`)
    .join('\n');

  const html = `
    <!DOCTYPE html>
    <html lang="is">
    <link rel="stylesheet" href="styles.css">
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
  await fs.writeFile(filePath, html, 'utf8');
  console.log('index.html búið til í', filePath);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function createCategoryHtml(entry) {
  try {
    if (!entry.file) {
      console.error('Missing "file" property in entry:', entry);
      return; // Skip this entry
    }

    console.log('Processing entry:', entry);

    const filePath = path.join(distFolder, entry.file.replace('.json', '.html'));
    const dataFilePath = path.join(dataFolder, entry.file);

    const data = await fs.readFile(dataFilePath, 'utf-8');
    const parsedData = JSON.parse(data);

    const questionsHtml = parsedData.questions
      .filter((q) => Array.isArray(q.answers))
      .map((q, i) => {
        const validAnswers = q.answers.filter((a) => a.answer && typeof a.correct === 'boolean'); // Filter valid answers
        return `
          <div>
            <h2>Question ${i + 1}: ${q.question}</h2>
            <div class="answers">
              ${validAnswers
                .map(
                  (a) =>
                    `<div class="answer-box ${a.correct ? 'correct' : 'wrong'}">
                      ${escapeHtml(a.answer)}
                    </div>`
                )
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');

    const html = `
      <!DOCTYPE html>
      <html lang="is">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${parsedData.title}</title>
        <link rel="stylesheet" href="styles.css">
      </head>
      <body>
        <h1>${parsedData.title}</h1>
        ${questionsHtml}
        <p><a href="index.html">Til baka á forsíðu</a></p>
        <script>
          document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.answer-box').forEach(box => {
              box.addEventListener('click', () => {
                box.classList.add('clicked');
              });
            });
          });
        </script>
      </body>
      </html>
    `;

    await fs.writeFile(filePath, html, 'utf8');
    console.log(`${entry.file.replace('.json', '.html')} created at ${filePath}`);
  } catch (error) {
    console.error(`Failed to create category HTML for ${entry.file || 'unknown'}:`, error.message);
  }
}





readIndexFile();
