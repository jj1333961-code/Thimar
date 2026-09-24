const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function run() {
  let browser;
  try {
    console.log('Launching headless Chromium...');
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
    });
    const page = await browser.newPage();
    
    console.log('Reading public/quran/quran.pdf into bytes...');
    const pdfPath = path.join(__dirname, '../public/quran/quran.pdf');
    const pdfBuffer = fs.readFileSync(pdfPath);
    const pdfBytes = Array.from(pdfBuffer);
    
    console.log('Opening page in browser...');
    await page.goto('about:blank');
    
    console.log('Running text extraction inside the browser...');
    const result = await page.evaluate(async (bytes) => {
      // Import PDF.js dynamically inside the browser context
      const pdfjsLib = await import('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs';
      
      // Load PDF (lenient client browser mode)
      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      
      const surahNames = [
        'الفاتحة', 'البقرة', 'آل عمران', 'النساء', 'المائدة', 'الأنعام', 'الأعراف', 'الأنفال', 'التوبة', 'يونس',
        'هود', 'يوسف', 'الرعد', 'إبراهيم', 'الحجر', 'النحل', 'الإسراء', 'الكهف', 'مريم', 'طه',
        'الأنبياء', 'الحج', 'المؤمنون', 'النور', 'الفرقان', 'الشعراء', 'النمل', 'القصص', 'العنكبوت', 'الروم',
        'لقمان', 'السجدة', 'الأحزاب', 'سبأ', 'فاطر', 'يس', 'الصافات', 'ص', 'الزمر', 'غافر',
        'فصلت', 'الشورى', 'الزخرف', 'الدخان', 'الجاثية', 'الأحقاف', 'محمد', 'الفتح', 'الحجرات', 'ق',
        'الذاريات', 'الطور', 'النجم', 'القمر', 'الرحمن', 'الواقعة', 'الحديد', 'المجادلة', 'الحشر', 'الممتحنة',
        'الصف', 'الجمعة', 'المنافقون', 'التغابن', 'الطلاق', 'التحريم', 'الملك', 'القلم', 'الحاقة', 'المعارج',
        'نوح', 'الجن', 'المزمل', 'المدثر', 'القيامة', 'الإنسان', 'المرسلات', 'النبأ', 'النازعات', 'عبس',
        'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد',
        'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات',
        'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر',
        'المسد', 'الإخلاص', 'الفلق', 'الناس'
      ];
      
      function normalize(text) {
        if (!text) return "";
        return text
          .normalize("NFKD")
          .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
          .replace(/[إأآٱ]/g, "ا")
          .replace(/ى/g, "ي")
          .replace(/ة/g, "ه")
          .replace(/[^\u0621-\u064A\s]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
      }
      
      const surahStarts = {};
      const pageSnippets = {}; // Keep small snippet for debugging if needed
      
      for (let p = 1; p <= numPages; p++) {
        const page = await pdf.getPage(p);
        const textContent = await page.getTextContent();
        const text = textContent.items.map(item => item.str).join(' ');
        const normText = normalize(text);
        
        // Log first 100 chars of page for debugging
        if (p <= 10 || p >= numPages - 10) {
          pageSnippets[p] = normText.slice(0, 150);
        }
        
        for (let sIdx = 0; sIdx < surahNames.length; sIdx++) {
          const sNum = sIdx + 1;
          const normName = normalize(surahNames[sIdx]);
          if (normText.includes("سورة " + normName) || normText.includes("سورة" + normName)) {
            if (!surahStarts[sNum]) {
              surahStarts[sNum] = p;
            }
          }
        }
      }
      return { numPages, surahStarts, pageSnippets };
    }, pdfBytes);
    
    console.log('Extraction complete! Total pages:', result.numPages);
    console.log('Sample Page Snippets (Page 1):', result.pageSnippets['1']);
    console.log('Sample Page Snippets (Page 2):', result.pageSnippets['2']);
    
    // Write mapping to JSON file
    fs.writeFileSync(
      path.join(__dirname, '../lib/quran-mapping.json'),
      JSON.stringify(result, null, 2)
    );
    console.log('Saved mappings to lib/quran-mapping.json');
    
  } catch (err) {
    console.error('Error in Puppeteer execution:', err);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

run();
