/**
 * Arabic Morphological Decomposition and Normalized Translation Engine
 * Provides root-level translation resolving prefixes, suffixes, diacritics, and compound phrases.
 */

export function stripArabicDiacritics(text: string): string {
  if (!text) return '';
  return text.replace(/[\u064B-\u065F\u0670\u0640]/g, '');
}

export function normalizeArabicForMatching(text: string): string {
  if (!text) return '';
  return stripArabicDiacritics(text)
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();
}

export interface MorphologyResult {
  translated: string;
  matched: boolean;
}

const PREFIXES = [
  { prefix: 'وال', english: 'and the ' },
  { prefix: 'بال', english: 'by the ' },
  { prefix: 'كال', english: 'like the ' },
  { prefix: 'فال', english: 'so the ' },
  { prefix: 'ولل', english: 'and for the ' },
  { prefix: 'لل', english: 'for the ' },
  { prefix: 'ال', english: '' },
  { prefix: 'وب', english: 'and with ' },
  { prefix: 'ول', english: 'and for ' },
  { prefix: 'و', english: 'and ' },
  { prefix: 'ب', english: 'with ' },
  { prefix: 'ل', english: 'for ' },
  { prefix: 'ف', english: 'then ' },
  { prefix: 'ك', english: 'as ' },
];

const SUFFIXES = [
  { suffix: 'كم', english: 'your ' },
  { suffix: 'ك', english: 'your ' },
  { suffix: 'نا', english: 'our ' },
  { suffix: 'ها', english: 'her ' },
  { suffix: 'هم', english: 'their ' },
  { suffix: 'ه', english: 'his ' },
  { suffix: 'ي', english: 'my ' },
];

export function decomposeArabicWord(word: string, dict: Record<string, string>): MorphologyResult {
  const clean = word.trim();
  if (!clean) return { translated: word, matched: false };

  // 1. Exact match
  if (dict[clean]) {
    return { translated: dict[clean], matched: true };
  }

  const norm = normalizeArabicForMatching(clean);
  // Match with normalized dict keys
  for (const [key, val] of Object.entries(dict)) {
    if (normalizeArabicForMatching(key) === norm) {
      return { translated: val, matched: true };
    }
  }

  // 2. Try prefix stripping
  for (const p of PREFIXES) {
    if (clean.startsWith(p.prefix) && clean.length > p.prefix.length + 1) {
      const remainder = clean.slice(p.prefix.length);
      if (dict[remainder]) {
        return { translated: (p.english + dict[remainder]).trim(), matched: true };
      }
      const normRemainder = normalizeArabicForMatching(remainder);
      for (const [key, val] of Object.entries(dict)) {
        if (normalizeArabicForMatching(key) === normRemainder) {
          return { translated: (p.english + val).trim(), matched: true };
        }
      }
    }
  }

  // 3. Try suffix stripping (e.g. possessive pronoun "ك" -> "your ...")
  for (const s of SUFFIXES) {
    if (clean.endsWith(s.suffix) && clean.length > s.suffix.length + 2) {
      const base = clean.slice(0, -s.suffix.length);
      if (dict[base]) {
        return { translated: (s.english + dict[base]).trim(), matched: true };
      }
      const normBase = normalizeArabicForMatching(base);
      for (const [key, val] of Object.entries(dict)) {
        if (normalizeArabicForMatching(key) === normBase) {
          return { translated: (s.english + val).trim(), matched: true };
        }
      }
    }
  }

  // 4. Combined Prefix + Suffix (e.g. "ولحسابك" -> "and for your account")
  for (const p of PREFIXES) {
    if (clean.startsWith(p.prefix) && clean.length > p.prefix.length + 3) {
      const withoutPrefix = clean.slice(p.prefix.length);
      for (const s of SUFFIXES) {
        if (withoutPrefix.endsWith(s.suffix) && withoutPrefix.length > s.suffix.length + 1) {
          const base = withoutPrefix.slice(0, -s.suffix.length);
          if (dict[base]) {
            return { translated: (p.english + s.english + dict[base]).trim(), matched: true };
          }
        }
      }
    }
  }

  return { translated: word, matched: false };
}

export function translateSentenceWithMorphology(sentence: string, dict: Record<string, string>): string {
  if (!sentence) return '';
  // Multi-word longest match first
  let result = sentence;
  const sortedPhrases = Object.keys(dict)
    .filter(k => k.includes(' ') && k.length > 2)
    .sort((a, b) => b.length - a.length);

  for (const phrase of sortedPhrases) {
    if (result.includes(phrase)) {
      result = result.split(phrase).join(dict[phrase]);
    } else {
      const normPhrase = normalizeArabicForMatching(phrase);
      if (normPhrase.length > 4) {
        const normResult = normalizeArabicForMatching(result);
        if (normResult.includes(normPhrase)) {
          // Direct token boundary replacement
          result = result.replace(new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), dict[phrase]);
        }
      }
    }
  }

  // Tokenize and decompose remaining Arabic tokens
  const tokens = result.split(/(\s+|[*:•\-().،,–—\[\]]+)/);
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (/[\u0600-\u06FF]/.test(token)) {
      const dec = decomposeArabicWord(token, dict);
      if (dec.matched) {
        tokens[i] = dec.translated;
      }
    }
  }

  return tokens.join('');
}
