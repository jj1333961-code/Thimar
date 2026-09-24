const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

if (!global.crypto) {
  global.crypto = crypto.webcrypto;
}

async function run() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '../public/quran/repaired_quran.pdf');
    const data = new Uint8Array(fs.readFileSync(pdfPath));
    
    // Load without password
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;
    console.log('Total pages in repaired file:', pdf.numPages);
    
    // Print text excerpt of first 5 pages
    for (let pageNum = 1; pageNum <= 10; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const text = textContent.items.map(item => item.str).join(' ');
      console.log(`Page ${pageNum} length: ${text.length}. Excerpt: ${text.slice(0, 150).trim().replace(/\n/g, ' ')}`);
    }
  } catch (err) {
    console.error('Error reading repaired PDF:', err);
  }
}

run();
