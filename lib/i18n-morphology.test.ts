import test from 'node:test';
import assert from 'node:assert/strict';
import {
  stripArabicDiacritics,
  normalizeArabicForMatching,
  decomposeArabicWord,
  translateSentenceWithMorphology
} from './i18n-morphology';

const testDict: Record<string, string> = {
  'حساب': 'account',
  'بيانات': 'data',
  'هاتف': 'phone',
  'طالب': 'student',
  'معلم': 'teacher',
  'إعدادات': 'settings',
  'تسجيل الدخول': 'log in',
  'إنشاء حساب جديد': 'create new account',
  'رسائل': 'messages'
};

test('stripArabicDiacritics removes harakat and tatweel', () => {
  assert.equal(stripArabicDiacritics('تَسْجِيلُ الدُّخُولِ'), 'تسجيل الدخول');
  assert.equal(stripArabicDiacritics('ثِـمَـار'), 'ثمار');
});

test('normalizeArabicForMatching unifies alef and removes diacritics', () => {
  assert.equal(normalizeArabicForMatching('إِعْدَادَات'), 'اعدادات');
  assert.equal(normalizeArabicForMatching('أجهزة'), 'اجهزه');
});

test('decomposeArabicWord handles possessive suffixes (ـك, ـكم, ـنا)', () => {
  const res1 = decomposeArabicWord('حسابك', testDict);
  assert.equal(res1.matched, true);
  assert.equal(res1.translated, 'your account');

  const res2 = decomposeArabicWord('بياناتك', testDict);
  assert.equal(res2.matched, true);
  assert.equal(res2.translated, 'your data');

  const res3 = decomposeArabicWord('هاتفك', testDict);
  assert.equal(res3.matched, true);
  assert.equal(res3.translated, 'your phone');
});

test('decomposeArabicWord handles prefixes (و, ل, ب, وال, لل)', () => {
  const res1 = decomposeArabicWord('للطالب', testDict);
  assert.equal(res1.matched, true);
  assert.equal(res1.translated, 'for the student');

  const res2 = decomposeArabicWord('والمعلم', testDict);
  assert.equal(res2.matched, true);
  assert.equal(res2.translated, 'and the teacher');
});

test('translateSentenceWithMorphology translates full sentences with attached affixes', () => {
  const sentence = 'يرجى مراجعة إعدادات حسابك ورسائلك';
  const out = translateSentenceWithMorphology(sentence, testDict);
  assert.ok(out.includes('settings'));
  assert.ok(out.includes('your account'));
  assert.ok(out.includes('your messages'));
});
