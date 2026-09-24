const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

async function run() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '../public/quran/quran.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    
    // Disable worker and range requests
    const loadingTask = pdfjsLib.getDocument({ 
      data, 
      password: '',
      disableWorker: true,
      disableRange: true
    });
    const pdf = await loadingTask.promise;
    console.log('Total pages:', pdf.numPages);
    
  } catch (err) {
    console.error('Error reading PDF:', err);
    if (err.stack) console.error('Stack:', err.stack);
    if (err.details) console.error('Details:', err.details);
  }
}

run();
