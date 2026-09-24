import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
  try {
    console.log('Uploading quran.pdf to Gemini Files API...');
    const pdfPath = path.join(process.cwd(), 'public/quran/quran.pdf');
    
    const fileResult = await ai.files.upload({
      file: pdfPath,
      mimeType: 'application/pdf',
    });
    console.log('Upload complete. File URI:', fileResult.uri);
    
    console.log('Analyzing Quran PDF with Gemini to map Surah start pages...');
    const prompt = `This is a color-coded Tajweed Quran PDF. It has exactly 569 pages total.
Identify the exact page number (from 1 to 569) where each of the 114 Surahs starts in this PDF file.
For example, find which PDF page contains the beginning header of Surah Al-Fatiha, Surah Al-Baqarah, Surah Ali 'Imran, and so on, all the way up to Surah An-Nas.
Return the result as a raw JSON array of objects with the following schema:
[
  {
    "number": 1,
    "name": "الفاتحة",
    "pageStart": 1
  },
  ...
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [fileResult, prompt],
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const jsonText = response.text;
    console.log('Gemini Analysis complete. Mappings received.');
    fs.writeFileSync('lib/quran-mapping.json', jsonText);
    console.log('Saved to lib/quran-mapping.json');
    
    // Also clean up the uploaded file from Gemini
    console.log('Cleaning up uploaded file...');
    await ai.files.delete({ name: fileResult.name });
    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Error in mapping extraction:', err);
  }
}

run();
