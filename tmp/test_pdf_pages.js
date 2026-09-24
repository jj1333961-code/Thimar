const path = require('path');

async function run() {
  try {
    const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const pdfPath = path.join(__dirname, '../public/quran/quran.pdf');
    
    // Pass file path directly
    const loadingTask = pdfjsLib.getDocument(pdfPath);
    const pdf = await loadingTask.promise;
    console.log('Total pages:', pdf.numPages);
    
    for (const pageNum of [1, 2, 3, 4, 5, 6, 10, 50, 100, 200, 300, 400, 500, 560, 565, 569]) {
      if (pageNum <= pdf.numPages) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        console.log(`Page ${pageNum}:`, text.slice(0, 150).trim().replace(/\n/g, ' '));
      }
    }
  } catch (err) {
    console.error('Error reading PDF:', err);
  }
}

run();
