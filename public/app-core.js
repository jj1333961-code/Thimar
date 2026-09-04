// ====== QURAN DATA: JUZ AND SURAHS ======
const quranData = {
  1: ["الفاتحة", "البقرة"],
  2: ["البقرة"],
  3: ["البقرة", "آل عمران"],
  4: ["آل عمران", "النساء"],
  5: ["النساء"],
  6: ["النساء", "المائدة"],
  7: ["المائدة", "الأنعام"],
  8: ["الأنعام", "الأعراف"],
  9: ["الأعراف", "الأنفال"],
  10: ["الأنفال", "التوبة"],
  11: ["التوبة", "يونس", "هود"],
  12: ["هود", "يسف"],
  13: ["يوسف", "الرعد", "إبراهيم"],
  14: ["الحجر", "النحل"],
  15: ["الإسراء", "الكهف"],
  16: ["الكهف", "مريم", "طه"],
  17: ["الأنبياء", "الحج"],
  18: ["المؤمنون", "النور", "الفرقان"],
  19: ["الفرقان", "الشعراء", "النمل"],
  20: ["النمل", "القصص", "العنكبوت"],
  21: ["العنكبوت", "الروم", "لقمان", "السجدة", "الأحزاب"],
  22: ["الأحزاب", "سبأ", "فاطر", "يس"],
  23: ["يس", "الصافات", "ص", "الزمر"],
  24: ["الزمر", "غافر", "فصلت"],
  25: ["فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقا"],
  26: ["الأحقاف", "محمد", "الفتح", "الحجرات", "ق", "الذاريات"],
  27: ["الذاريات", "الطور", "النجم", "القمر", "الحمن", "الواقعة", "الحديد"],
  28: ["المجادلة", "الحشر", "الممتحنة", "الصف", "المعة", "المنافقون", "التغابن", "الطلاق", "التحريم"],
  29: ["الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزل", "المدثر", "القيامة", "الإنسان", "المرسلات"],
  30: ["النبأ", "النازعات", "عبس", "التكوير", "الإنفطار", "المطففين", "الإنشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "لضحى", "الشرح", "التين", "العلق", "القدر", "البينة", "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النص", "المسد", "الإخلاص", "الفلق", "الناس"]
};

const ALL_SURAHS_ORDERED = [
  "الفاتحة", "البقرة", "آل عمران", "النساء", "المائدة", "الأنعام", "الأعراف", "الأنفال", "التوبة", "يونس", "هود", "يوسف", "الرعد", "إبراهيم", "الحجر", "النحل",
  "الإسراء", "الكهف", "مريم", "طه", "الأنبياء", "الحج", "المؤمنون", "النور", "الفرقان", "الشعراء", "النمل", "القصص", "العنكبوت", "الروم", "لقمان", "السجدة",
  "الأحزاب", "سبأ", "فاطر", "يس", "الصافات", "ص", "الزمر", "غافر", "فصلت", "الشورى", "الزخرف", "الدخان", "الجاثية", "الأحقاف", "محمد", "الفتح", "الحجرات", "ق",
  "الذاريات", "الطور", "النجم", "القمر", "الرحمن", "الواقعة", "الحديد", "المجادلة", "الحشر", "الممتحنة", "الصف", "الجمعة", "المنافقون", "التغابن", "الطلاق", "التحريم",
  "الملك", "القلم", "الحاقة", "المعارج", "نوح", "الجن", "المزمل", "المدثر", "القيامة", "الإنسان", "المرسلات", "النبأ", "النازعات", "عبس", "التكوير", "الانفطار",
  "المطففين", "الانشقاق", "البروج", "الطارق", "الأعلى", "الغاشية", "الفجر", "البلد", "الشمس", "الليل", "الضحى", "الشرح", "التين", "العلق", "القدر", "البينة",
  "الزلزلة", "العاديات", "القارعة", "التكاثر", "العصر", "الهمزة", "الفيل", "قريش", "الماعون", "الكوثر", "الكافرون", "النصر", "المسد", "الإخلاص", "الفلق", "الناس"
];
const SURAH_AYAH_TOTALS = [7,286,200,176,120,165,206,75,129,109,123,111,43,52,99,128,111,110,98,135,112,78,118,64,77,227,93,88,69,60,34,30,73,54,45,83,182,88,75,85,54,53,89,59,37,35,38,29,18,45,60,49,62,55,78,96,29,22,24,13,14,11,11,18,12,12,30,52,52,44,28,28,20,56,40,31,50,40,46,42,29,19,36,25,22,17,19,26,30,20,15,21,11,8,8,19,5,8,8,11,11,8,3,9,5,4,7,3,6,3,5,4,5,6];
const SURAH_AYAH_COUNTS = Object.fromEntries(ALL_SURAHS_ORDERED.map((name,index)=>[name,SURAH_AYAH_TOTALS[index]]));
const EASY_SHORT_SURAHS = new Set(ALL_SURAHS_ORDERED.filter((name,index)=>SURAH_AYAH_TOTALS[index]<=11 && index>=92));

const RATING_COLORS = {
  '4': '#28a745',
  '3': '#17a2b8',
  '1': '#ffc107',
  '0': '#dc3545'
};

// ====== COUNTRY-AWARE IDENTITY AND PHONE FIELDS ======
let countryRules = Array.isArray(window.THIMAR_COUNTRY_RULES) ? window.THIMAR_COUNTRY_RULES : [];
const COUNTRY_FIELD_CONFIG = [
  { selector: 'recoveryIdentityCountry', identity: 'recoveryNid' },
  { selector: 'recoveryCountry', phone: 'recoveryPhone' },
  { selector: 'signupIdentityCountry', identity: 'signupNid' },
  { selector: 'signupPhoneCountry', phone: 'signupPhone' },
  { selector: 'signupWhatsCountry', phone: 'signupWhats' },
  { selector: 'stIdentityCountry', identity: 'stNational' },
  { selector: 'stPhoneCountry', phone: 'stPhone' },
  { selector: 'editIdentityCountry', identity: 'editNational' },
  { selector: 'editPhoneCountry', phone: 'editPhone' },
  { selector: 'adminMobileCountry', phone: 'adminMobile' },
  { selector: 'adminWhatsappCountry', phone: 'adminWhatsInput' },
  { selector: 'newAdminMobileCountry', phone: 'newAdminMobile' },
  { selector: 'confirmMobileCountry', phone: 'confirmMobile' },
  { selector: 'newMobileCountry', phone: 'newMobile' }
];
function activeLocale() { return localStorage.getItem('lang') === 'en' ? 'en' : 'ar'; }
function countryDisplayName(iso2, locale) {
  try { return new Intl.DisplayNames([locale || activeLocale()], { type: 'region' }).of(iso2) || iso2; }
  catch { return iso2; }
}
function countryRuleForValue(value) {
  const normalized = String(value || '').toUpperCase();
  return countryRules.find(function(rule) { return rule.iso2 === normalized; })
    || countryRules.find(function(rule) { return rule.dialCode === normalized; })
    || countryRules.find(function(rule) { return rule.iso2 === 'EG'; });
}
function countryConfigFor(select) {
  return COUNTRY_FIELD_CONFIG.find(function(config) { return config.selector === select.id; }) || {
    phone: select.dataset.phoneId || '', identity: select.dataset.identityId || ''
  };
}
function localCountryLabel(rule) {
  const locale = activeLocale();
  const primary = countryDisplayName(rule.iso2, locale);
  const secondary = countryDisplayName(rule.iso2, locale === 'en' ? 'ar' : 'en');
  return locale === 'en' ? primary + ' / ' + secondary : primary + ' / ' + secondary;
}
function closeCountryPicker(select) {
  const picker = select && select._countryPicker;
  if(!picker) return;
  const menu = picker.querySelector('.country-menu');
  const trigger = picker.querySelector('.country-trigger');
  const search = picker.querySelector('.country-search');
  if(menu) menu.hidden = true;
  if(trigger) trigger.setAttribute('aria-expanded', 'false');
  if(search) search.value = '';
  if(select) select._countryQuery = '';
  picker.querySelectorAll('.country-option').forEach(function(option) { option.hidden = false; });
}
function filterCountryPicker(select, query) {
  const picker = select && select._countryPicker;
  if(!picker) return;
  const normalized = String(query || '').trim().toLocaleLowerCase();
  select._countryQuery = normalized;
  picker.querySelectorAll('.country-option').forEach(function(option) {
    const value = String(option.dataset.value || '').toLocaleLowerCase();
    const label = String(option.textContent || '').toLocaleLowerCase();
    option.hidden = Boolean(normalized && !label.includes(normalized) && !value.includes(normalized));
  });
}
function renderCountryPicker(select) {
  const picker = select && select._countryPicker;
  if(!picker) return;
  const trigger = picker.querySelector('.country-trigger');
  const list = picker.querySelector('.country-options');
  if(!trigger || !list) return;
  const selected = select.options[select.selectedIndex];
  trigger.textContent = selected ? selected.textContent : (activeLocale() === 'en' ? 'Select country' : 'اختر الدولة');
  trigger.setAttribute('aria-label', select.getAttribute('aria-label') || trigger.textContent);
  list.innerHTML = '';
  Array.from(select.options).forEach(function(option) {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'country-option';
    item.setAttribute('role', 'option');
    item.setAttribute('aria-selected', option.value === select.value ? 'true' : 'false');
    item.dataset.value = option.value;
    item.textContent = option.textContent;
    item.addEventListener('click', function() {
      select.value = item.dataset.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
      closeCountryPicker(select);
      trigger.focus();
    });
    list.appendChild(item);
  });
  filterCountryPicker(select, select._countryQuery || '');
}
function addCountrySearch(select) {
  if(!select || select.dataset.countryEnhanced === 'true') return;
  const parent = select.parentElement;
  if(!parent) return;
  const picker = document.createElement('div');
  picker.className = 'country-picker';
  picker.setAttribute('data-no-translate', '');
  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'country-trigger';
  trigger.setAttribute('role', 'combobox');
  trigger.setAttribute('aria-haspopup', 'listbox');
  trigger.setAttribute('aria-expanded', 'false');
  const menu = document.createElement('div');
  menu.className = 'country-menu';
  menu.id = 'country-menu-' + String(select.id || 'field').replace(/[^a-z0-9_-]/gi, '-');
  menu.hidden = true;
  trigger.setAttribute('aria-controls', menu.id);
  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'country-search';
  search.autocomplete = 'off';
  search.placeholder = activeLocale() === 'en' ? 'Search countries' : 'بحث عن الدولة';
  search.setAttribute('aria-label', search.placeholder);
  const list = document.createElement('div');
  list.className = 'country-options';
  list.setAttribute('role', 'listbox');
  menu.appendChild(search);
  menu.appendChild(list);
  select.setAttribute('data-no-translate', '');
  select.classList.add('country-native-select');
  select.tabIndex = -1;
  select.setAttribute('aria-hidden', 'true');
  picker._countrySelect = select;
  select._countryPicker = picker;
  trigger.addEventListener('click', function() {
    const opening = menu.hidden;
    document.querySelectorAll('.country-menu:not([hidden])').forEach(function(openMenu) {
      const openPicker = openMenu.closest('.country-picker');
      const openSelect = openPicker && openPicker._countrySelect;
      if(openSelect && openSelect !== select) closeCountryPicker(openSelect);
    });
    menu.hidden = !opening;
    trigger.setAttribute('aria-expanded', opening ? 'true' : 'false');
    if(opening) { search.value = ''; filterCountryPicker(select, ''); setTimeout(function() { search.focus(); }, 0); }
  });
  trigger.addEventListener('keydown', function(event) {
    if(event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      trigger.click();
    }
  });
  search.addEventListener('input', function() { filterCountryPicker(select, search.value); });
  search.addEventListener('keydown', function(event) {
    if(event.key === 'Escape') { closeCountryPicker(select); trigger.focus(); }
  });
  document.addEventListener('click', function(event) {
    if(!picker.contains(event.target)) closeCountryPicker(select);
  });
  parent.insertBefore(picker, select);
  picker.appendChild(trigger);
  picker.appendChild(menu);
  picker.appendChild(select);
  select.dataset.countryEnhanced = 'true';
  select.addEventListener('change', function() {
    select.dataset.countryIso = select.value;
    updateCountryHintsAndPicker(select);
  });
}
function updateCountryHintsAndPicker(select) {
  renderCountryPicker(select);
  updateCountryFieldHints(select);
}
function populateCountrySelect(select) {
  if(!select || !countryRules.length) return;
  addCountrySearch(select);
  const previousRule = countryRuleForValue(select.dataset.countryIso || select.value);
  const previous = previousRule ? previousRule.iso2 : 'EG';
  const options = countryRules.map(function(rule) {
    return '<option value="' + rule.iso2 + '">' + escapeHtml(localCountryLabel(rule)) + ' (+' + rule.dialCode + ')</option>';
  }).join('');
  select.innerHTML = options;
  const selected = countryRules.some(function(rule) { return rule.iso2 === previous; }) ? previous : 'EG';
  select.value = selected;
  select.dataset.countryIso = selected;
  updateCountryHintsAndPicker(select);
}
function setCountrySelectorValue(id, iso2) {
  const select = document.getElementById(id);
  if(!select) return;
  const rule = countryRuleForValue(iso2);
  if(rule) { select.value = rule.iso2; select.dataset.countryIso = rule.iso2; updateCountryHintsAndPicker(select); }
}
function updateCountryFieldHints(select) {
  const rule = countryRuleForValue(select && select.value);
  if(!rule) return;
  const config = countryConfigFor(select);
  const phone = config.phone ? document.getElementById(config.phone) : null;
  const identity = config.identity ? document.getElementById(config.identity) : null;
  const locale = activeLocale();
  if(phone) {
    phone.placeholder = locale === 'en' ? 'Local number without country code' : 'الرقم المحلي بدون رمز الدولة';
    phone.inputMode = 'tel';
    phone.maxLength = 15;
  }
  if(identity) {
    identity.inputMode = rule.identity === 'numeric' ? 'numeric' : 'text';
    identity.placeholder = locale === 'en' ? 'Enter the selected country ID or passport number' : 'أدخل هوية الدولة المختارة أو رقم جواز السفر';
    identity.setAttribute('autocomplete', 'off');
  }
  const hint = config.identity ? document.getElementById(config.identity + 'Hint') : null;
  if(hint) { hint.textContent = locale === 'en' ? rule.identityHintEn : rule.identityHintAr; hint.classList.add('country-hint'); }
  const output = config.phone ? document.getElementById(config.phone + 'International') : null;
  if(config.phone && output) updateSignupInternationalNumber(config.phone, select.id, output.id);
}
function enhanceCountryInput(input) {
  if(!input || input.dataset.countryInputEnhanced === 'true') return;
  input.dataset.countryInputEnhanced = 'true';
  input.addEventListener('input', function() {
    const value = input.matches('[data-phone-input]') ? normalizeLocalPhoneInput(input.value) : normalizeIdentityInput(input.value);
    if(input.value !== value) input.value = value;
    if(input.matches('[data-phone-input]')) {
      const config = COUNTRY_FIELD_CONFIG.find(function(entry) { return entry.phone === input.id; });
      if(config && document.getElementById(config.selector)) updateCountryFieldHints(document.getElementById(config.selector));
    }
  });
}
function refreshCountryFields() {
  document.querySelectorAll('[data-country-selector]').forEach(populateCountrySelect);
  document.querySelectorAll('[data-phone-input],[data-identity-input]').forEach(enhanceCountryInput);
}
async function loadCountryRules() {
  try {
    const response = await fetch('/api/countries', { cache: 'force-cache' });
    const payload = await response.json();
    if(Array.isArray(payload.countries) && payload.countries.length) countryRules = payload.countries;
  } catch(error) {
    if(!countryRules.length) console.warn('[v0] country rules unavailable');
  }
  refreshCountryFields();
}
function normalizeIdentityInput(value) {
  return String(value || '').replace(/[٠-٩]/g, function(digit) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)); }).replace(/[۰-۹]/g, function(digit) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)); }).trim().replace(/[\s-]/g, '').toUpperCase();
}
function normalizeLocalPhoneInput(value) {
  return String(value || '').replace(/[٠-٩]/g, function(digit) { return String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)); }).replace(/[۰-۹]/g, function(digit) { return String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)); }).replace(/\D/g, '').replace(/^0+/, '');
}
function normalizeLocalPhoneForRule(value, rule) {
  const local = normalizeLocalPhoneInput(value);
  if(rule && local.indexOf(rule.dialCode) === 0 && !rule.phoneLengths.includes(local.length) && rule.phoneLengths.includes(local.length - rule.dialCode.length)) return local.slice(rule.dialCode.length);
  return local;
}
function selectedCountryIso(countryId) {
  const rule = countryRuleForValue(document.getElementById(countryId)?.value);
  return rule ? rule.iso2 : 'EG';
}
function localPhoneFromInternational(value, countryId) {
  const raw = String(value || '').replace(/\D/g, '');
  const rule = countryRuleForValue(countryId);
  if(!rule) return raw.replace(/^0+/, '');
  if(raw.indexOf(rule.dialCode) === 0) return raw.slice(rule.dialCode.length).replace(/^0+/, '');
  return raw.replace(/^0+/, '');
}
function validateCountryFields(identityCountryId, identityId, phoneCountryId, phoneId, phoneRequired) {
  const identityRule = countryRuleForValue(document.getElementById(identityCountryId)?.value);
  const phoneRule = countryRuleForValue(document.getElementById(phoneCountryId)?.value);
  const identity = normalizeIdentityInput(document.getElementById(identityId)?.value);
  const phone = normalizeLocalPhoneForRule(document.getElementById(phoneId)?.value, phoneRule);
  const identityValid = Boolean(identityRule && identity && new RegExp(identityRule.identityPattern).test(identity));
  const phoneValid = phoneRequired === false && !phone ? true : Boolean(phoneRule && phone && phoneRule.phoneLengths.includes(phone.length));
  return { identityValid, phoneValid, identityRule, phoneRule, identity, phone };
}
function validatePhoneField(countryId, phoneId, required) {
  const value = String(document.getElementById(phoneId)?.value || '').trim();
  if(!value) return !required;
  const rule = countryRuleForValue(document.getElementById(countryId)?.value);
  const local = normalizeLocalPhoneForRule(value, rule);
  return Boolean(rule && rule.phoneLengths.includes(local.length));
}

// ====== NAVIGATION HISTORY ======
let pageHistory = [];

function toggleTheme() {
  const html = document.documentElement;
  const btn = document.querySelector('.theme-toggle');
  if(html.getAttribute('data-theme') === 'dark') {
    html.removeAttribute('data-theme'); btn.textContent = '🌙'; localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark'); btn.textContent = '☀️'; localStorage.setItem('theme', 'dark');
  }
}
// الوضع الأخضر (الداكن) هو الافتراضي، والفاتح يُطبَّق فقط عند اختيار المستخدم له.
if(localStorage.getItem('theme') === 'light') {
  document.documentElement.removeAttribute('data-theme');
  const savedThemeButton = document.querySelector('.theme-toggle'); if(savedThemeButton) savedThemeButton.textContent = '🌙';
} else {
  document.documentElement.setAttribute('data-theme', 'dark');
  const savedThemeButton = document.querySelector('.theme-toggle'); if(savedThemeButton) savedThemeButton.textContent = '☀️';
}

// ====== تبديل اللغة (عربي / إنجليزي) ======
const LANG_DICT = {
  '🔒 دخول النظام': '🔒 System Login',
  'اسم المستخدم': 'Username',
  'الرقم السري': 'Password',
  'إظهار الرقم السري': 'Show password',
  'إظهار Password': 'Show password',
  'إخفاء الرقم السري': 'Hide password',
  'إخفاء Password': 'Hide password',
  'هل نسيت الرقم السري؟': 'Forgot your password?',
  'هل نسيت Password؟': 'Forgot your password?',
  'تغيير اللغة / Change language': 'Change language',
  'Change language / Change language': 'Change language',
  '🔓 دخول': '🔓 Login',
  'ليس لديك حساب؟ أرسل طلب انضمام للمسؤول.': "Don't have an account? Send a join request to the admin.",
  '🆕 إنشاء حساب جديد': '🆕 Create New Account',
  'إنشاء حساب جديد': 'Create New Account',
  '📚 نظام إدارة الطلاب': '📚 Student Management System',
  'أو رقم الموبايل للمسؤول': 'or admin mobile number',
  'أدخل الرقم السري': 'Enter your password',
  'أدخل اسم المستخدم والرقم السري': 'Enter your username and password',
  'للمسؤول': 'for the admin',
  'للمسؤول فقط': 'for the admin only',
  'تغيير اللغة': 'Change language',
  'تبديل اللغة': 'Switch language',
  'اختر الدولة': 'Choose country',
  'كود دولة الهاتف': 'Phone country code',
  'كود دولة الواتساب': 'WhatsApp country code',
  'مصر': 'Egypt', 'السعودية': 'Saudi Arabia', 'الإمارات': 'United Arab Emirates', 'قطر': 'Qatar', 'الكويت': 'Kuwait', 'الأردن': 'Jordan', 'المغرب': 'Morocco', 'الجزائر': 'Algeria', 'تونس': 'Tunisia', 'أمريكا/كندا': 'United States/Canada', 'بريطانيا': 'United Kingdom', 'ألمانيا': 'Germany', 'تركيا': 'Turkey',
  'الرقم بدون كود الدولة': 'Number without country code', 'الرقم الدولي': 'International number', 'الرقم القومي المسجل': 'Registered national ID', 'الاسم المسجل بالحساب': 'Name registered on the account', 'أدخل اسم المستخدم': 'Enter username', 'أدخل اسمك كما سجله المسؤول': 'Enter your name as registered by the admin',
  'التنبيهات': 'Notifications', 'المحادثة مع الذكاء الاصطناعي': 'AI chat', 'مخطط التقييم': 'Evaluation chart', 'صندوق التسجيلات': 'Recordings inbox', 'مساعد الذكاء الاصطناعي': 'AI assistant',   'الملفات المرسلة لي': 'Files sent to me', 'الملفات المرفوعة': 'Uploaded files', 'مساعد تطوير الموقع': 'Site development assistant', 'مزامنة GitHub': 'GitHub Sync', 'أدوات المسؤول': 'Admin tools', 'أدوات الطالب': 'Student tools', 'أدوات ولي الأمر': 'Parent tools',
  'قال تعالى:': 'Allah Almighty said:', 'صدق الله العظيم': 'Allah Almighty has spoken the truth',
  'مرحباً بك — اختر طريقة استخدامك للموقع': 'Welcome — choose how you want to use the site',
  'المسؤول': 'Admin',
  'الطالب': 'Student',
  'ولي الأمر': 'Parent',
  'التحكم الكامل في النظام والطلاب': 'Full control over the system and students',
  'متابعة المواد والواجبات والحفظ': 'Track subjects, homework and memorization',
  'متابعة ابنك/ابنتك والتقارير': 'Follow your child and reports',
  'تسجيل بجوجل أو رقم الواتساب ثم إرسال طلب للمسؤول': 'Sign up with Google or WhatsApp, then send a request to the admin',
  '📊 لوحة تحكم المسؤول': '📊 Admin Dashboard',
  '⚙️ الإعدادات': '⚙️ Settings',
  'خروج': 'Logout',
  'عدد الطلاب': 'Students',
  'عدد المعلمين': 'Teachers',
  'المسؤولون': 'Admins',
  'تسميعات نشطة': 'Active recitations',
  '➕ إضافة طالب جديد': '➕ Add New Student',
  '📚 المواد والمعلمين': '📚 Subjects & Teachers',
  '👨‍💼 إدارة المسؤولين': '👨‍💼 Manage Admins',
  '📁 الملفات المرفوعة': '📁 Uploaded Files',
  '🛠️ مساعد تطوير الموقع': '🛠️ Site Development Assistant',
  '🔗 مزامنة GitHub': '🔗 GitHub Sync',
  'رجوع': 'Back',
  'رقم الموبايل': 'Mobile number',
  'رقم الواتساب لاستلام كود التحقق *': 'WhatsApp number to receive the verification code *',
  'رقم واتساب المسؤول لاستلام طلبات الانضمام': 'Admin WhatsApp number for join requests',
  '💾 حفظ الرقم': '💾 Save Number',
  '🆕 إنشاء حساب — التحقق من الهوية': '🆕 Create Account — Identity Verification',
  'اختر طريقة التسجيل، وسيتم إرسال رسالة تحقق على واتساب للتأكد من هويتك قبل إدخال البيانات.': 'Choose a sign-up method; a WhatsApp verification message will confirm your identity before entering your data.',
  ' التسجيل بحساب جوجل': '🔵 Sign up with Google',
  '🟢 التسجيل برقم الهاتف (واتساب)': '🟢 Sign up with phone (WhatsApp)',
  'بريد حساب جوجل *': 'Google account email *',
  '📩 إرسال كود التحقق على واتساب': ' Send verification code on WhatsApp',
  'كود التحقق (6 أرقام) *': 'Verification code (6 digits) *',
  '✅ تأكيد الهوية والمتابعة': '✅ Verify identity and continue',
  '🔁 إعادة إرسال الكود': '🔁 Resend code',
  '📝 بيانات طلب الانضمام': '📝 Join Request Details',
  'نوع الحساب *': 'Account type *',
  'طالب': 'Student',
  'ولي أمر': 'Parent',
  'الاسم بالكامل *': 'Full name *',
  'الرقم القومي *': 'National ID *',
  'رقم الهاتف *': 'Phone number *',
  'الجزء': 'Juz',
  'السورة': 'Surah',
  'ملاحظات': 'Notes',
  '📤 إرسال الطلب للمسؤول': '📤 Send request to admin',
  '💬 الرسائل': '💬 Messages',
  '📥 الرسائل الواردة': '📥 Inbox',
  '✉️ التواصل': '✉️ Compose',
  '⚙️ إعدادات المسؤول': '⚙️ Admin Settings',
  'الاختبارات': 'Exams', 'المهام': 'Tasks', 'التسميع': 'Recitation', 'التسجيل الصوتي': 'Audio recording',
  'مكافحة الغش': 'Anti-cheat', 'تحليل التسجيل': 'Analyze recording', 'جاري التحليل...': 'Analyzing...',
  'تعذر تحليل التسجيل': 'Unable to analyze the recording', 'إعادة المحاولة': 'Try again',
  'خطأ في الشبكة': 'Network error', 'حدث خطأ': 'An error occurred', 'لا توجد بيانات': 'No data available',
  'حفظ': 'Save', 'إلغاء': 'Cancel', 'حذف': 'Delete', 'تعديل': 'Edit', 'إضافة': 'Add',
  'إرسال': 'Send', 'تحميل': 'Loading', 'جار التحميل...': 'Loading...', 'تأكيد': 'Confirm',
  'نجح': 'Succeeded', 'فشل': 'Failed', 'محظور': 'Blocked', 'مفعل': 'Enabled', 'غير مفعل': 'Disabled',
  'الوقت المتبقي': 'Time remaining', 'حالة الجلسة': 'Session status', 'النتيجة': 'Result',
  'تحديث': 'Refresh', 'تسجيل الدخول': 'Log in', 'تسجيل الخروج': 'Log out',
  'مساعد Gemini / Groq الإداري': 'Gemini / Groq Admin Assistant',
  'محادثة Gemini وGroq الإدارية': 'Gemini وGroq Admin Chat', 'مزامنة GitHub': 'GitHub Sync',
  '📁 الملفات لمرفوعة': '📁 Uploaded files', 'ف الموقع': 'to the site', 'بيانات الموقع': 'site data',
  'جارٍ تحميل حسابات Google...': 'Loading Google accounts...',
  'تعذر تحميل اختيار حسابات Google. يمكنك المحاولة مرة أخرى أو استخدام زر المتابعة الآمن.': 'Google account picker could not be loaded. Try again or use the secure continue button.',
  '🔵 المتابعة باستخدام Google': '🔵 Continue with Google',
  'اختر حساب جوجل لإكمال التسجيل *': 'Choose a Google account to complete sign-up *',
  'اضغط لعرض حسابات جوجل الموجودة على جهازك واختيار أحدها. لن يُطلب منك رقم هاتف أو كود تحقق.': 'Click to show Google accounts on this device. No phone number or verification code is required.',
  'الأدوات': 'Tools',
  'إغلاق القائمة': 'Close menu',
  'فتح قائمة الأدوات': 'Open tools menu',
  /* شاشة ثمار الرئيسية */
  'منصة ثِمار': 'Thimar Platform',
  'لحفظ القرآن الكريم': 'for memorizing the Holy Quran',
  'قال تعالى:': 'Allah Almighty said:',
  'ليس لديك حساب؟': "Don't have an account?",
  'مصحف مفتوح على حامل خشبي': 'An open Quran on a wooden stand',
  'إعدادات العرض': 'Display settings',
  'تبديل الوضع': 'Toggle theme'
};
let currentLang = activeLocale();
const LANG_ATTRS = ['placeholder','title','aria-label','aria-description','alt'];
function langTextNodes() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = []; let node;
  while((node = walker.nextNode())) {
      if(node.parentElement && (['SCRIPT','STYLE','NOSCRIPT'].includes(node.parentElement.tagName) || node.parentElement.closest('.thimar-ayah-frame,.thimar-ayah-ref,.thimar-footer .ayah,.thimar-footer .ref,.thimar-footer-sidq,[data-no-translate]'))) continue;
    if(node.nodeValue && node.nodeValue.trim()) nodes.push(node);
  }
  return nodes;
}
const EN_LANG_DICT = Object.fromEntries(Object.entries(LANG_DICT).map(function(entry){ return [entry[1], entry[0]]; }));
function translateValue(value) {
  if(!value) return value;
  const dict = currentLang === 'en' ? LANG_DICT : EN_LANG_DICT;
  const clean = value.trim();
  if(dict[clean]) return value.replace(clean, dict[clean]);
  let result = value;
  Object.keys(dict).sort((a,b)=>b.length-a.length).forEach(function(key){ if(result.includes(key)) result=result.split(key).join(dict[key]); });
  return result;
}
let langApplyFrame = 0;
function applyLangToDom() {
  currentLang = activeLocale();
  if (langApplyFrame) return;
  const run = function(){
    langApplyFrame = 0;
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === 'en' ? 'ltr' : 'rtl';
    if(window.ThimarI18n && typeof window.ThimarI18n.apply === 'function') {

      window.ThimarI18n.apply(document.body);
      // legacy-i18n.js owns translation and preserves the original Arabic source.

    }
    const btn=document.getElementById('langToggleBtn'); if(btn) btn.textContent=currentLang==='en'?'ع':'EN';
    if(typeof syncSignupRelationshipField === 'function') syncSignupRelationshipField();
    refreshCountryFields();
    document.querySelectorAll('input,textarea,select').forEach(function(el){
      el.style.direction = el.classList.contains('country-search') || el.dataset.phoneId || el.dataset.identityId ? 'ltr' : (currentLang === 'en' ? 'ltr' : 'rtl');
      el.style.textAlign = el.classList.contains('country-search') || el.dataset.phoneId || el.dataset.identityId ? 'left' : (currentLang === 'en' ? 'left' : 'right');
    });
  };
  if (typeof requestAnimationFrame === 'function') langApplyFrame = requestAnimationFrame(run);
  else run();
}
window.applyLangToDom = applyLangToDom;
function toggleLang() { currentLang=activeLocale()==='ar'?'en':'ar'; localStorage.setItem('lang',currentLang); applyLangToDom(); window.dispatchEvent(new Event('languagechange')); }
window.addEventListener('languagechange', function(){ currentLang = activeLocale(); applyLangToDom(); });
// تتم ترجمة العقد الديناميكية بواسطة legacy-i18n.js؛ لا نسجل مراقباً ثانياً
function initLanguage(){
  if (document.getElementById('lockScreen') && !document.querySelector('.page:not(.hidden):not(#lockScreen)')) return;
  applyLangToDom();
}

let neonSaveTimer = null;
let neonSaveInFlight = null;
let neonDataReady = false;
const runtimeData = Object.create(null);
const CLOUD_DATA_KEYS = ['subjects','students','messages','devices','admins','files','devAuditLog','proctoringIncidents','recordElements','extraElements','adminWhatsapp','adminWhatsappCountry','joinRequests','notifications','aiQuestionHistory'];
function getData(key, def) {
  if (Object.prototype.hasOwnProperty.call(runtimeData, key)) return runtimeData[key];
  return def || [];
}
function collectCloudData(){
  const data={};
  CLOUD_DATA_KEYS.forEach(function(key){ if(Object.prototype.hasOwnProperty.call(runtimeData,key)) data[key]=runtimeData[key]; });
  return data;
}
async function saveAllDataToNeon(){
  const status=document.getElementById('cloudSaveStatus');
  if(neonSaveInFlight) return neonSaveInFlight;
  neonSaveInFlight=(async function(){
    try{
      const res=await fetch('/api/data',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({data:collectCloudData()})});
      const body=await res.json().catch(function(){ return {}; });
      if(!res.ok || body.saved !== true) throw new Error(body.error || 'cloud-save-failed');
      if(status)status.textContent='محفوظ في Neon';
      return true;
    } catch(e){
      if(status)status.textContent='تعذر الحفظ في Neon — اضغط تحديث للمحاولة';
      return false;
    } finally { neonSaveInFlight=null; }
  })();
  return neonSaveInFlight;
}
function setData(key, val) {
  runtimeData[key]=val;
  clearTimeout(neonSaveTimer);
  neonSaveTimer=setTimeout(saveAllDataToNeon,500);
}
async function hydrateDataFromNeon(){
  if(neonDataReady) return true;
  try{
    const res=await fetch('/api/data',{cache:'no-store'});
    const body=await res.json().catch(function(){ return {}; });
    if(!res.ok) throw new Error(body.error || 'cloud-load-failed');
    const hasCloudData=body.data && typeof body.data==='object' && Object.keys(body.data).length>0;
    if(hasCloudData) Object.keys(body.data).forEach(function(key){ if(CLOUD_DATA_KEYS.includes(key)) runtimeData[key]=body.data[key]; });
    neonDataReady=true;
    if(!hasCloudData) await saveAllDataToNeon();
    window.__thimarCloudDataReady = true;
    window.dispatchEvent(new Event('clouddataready'));
    return true;
  } catch(e){
    neonDataReady=false;
    const status=document.getElementById('cloudSaveStatus');
    if(status) status.textContent='تعذر الاتصال بـ Neon — البيانات لم تُحمّل';
    return false;
  }
}
// التفضيلات فقط محلية؛ بيانات الطلاب والمستخدمين والرسائل لا تُحفظ في المتصفح.
// لا نطلب البيانات قبل تسجيل الدخول؛ API يحمي بيانات Neon من الوصول العام.
let neonHydrationPromise = null;

if(!runtimeData.initialized_v7) {
  runtimeData.subjects = [
    {id:1, name:'القرآن الكريم', teacher:'ش/أحمد شعبان', phone:'01012345678'},
    {id:2, name:'الدراسات الاجتماعية والتاريخ (ثانوي)', teacher:'أ/إبراهيم شعبان', phone:'01112345678'}
  ];
  runtimeData.students = []; runtimeData.messages = []; runtimeData.devices = [];
  runtimeData.admins = [{id:1, mobile:'00000000000', password:'1234', isMain:true}];
  runtimeData.initialized_v7 = true;
  // يبدأ الحفظ بعد نجاح تسجيل الدخول فقط، لأن API يحمي بيانات Neon.
  } else {
  let admins = getData('admins');
  let changed = false;
  if(!Array.isArray(admins) || !admins.length){ admins=[{id:1,mobile:'00000000000',password:'1234',isMain:true}]; changed=true; }
  admins.forEach(a => { if(a.mobile === '0000000000') { a.mobile = '00000000000'; changed = true; } });
  if(changed) setData('admins', admins);
  }

  // سجل الطالب التجريبي يُنشأ في الذاكرة ثم يُحفظ في Neon، وليس في الهاتف.
  // سجل محلي دائم للطالب عثمان — يُضاف مرة واحدة فقط دون المساس ب��لس��لات الموجودة.
  (function ensureDefaultStudent() {
    const students = getData('students', []);
    const existing = students.find(function(student) {
      return String(student.username || '').trim() === 'عثمان' || String(student.nationalId || student.national || '').trim() === '778888889999999900';
    });
    // تطبيع السجل السابق إن كان قد أُنشئ بإسماء حقول قديمة، حتى ينجح تسجيل الدخول دائمًا.
    if (existing) {
      let changed = false;
      const normalize = function(key, value) { if (!existing[key] && value) { existing[key] = value; changed = true; } };
      normalize('studentPass', existing.password || 'واحد');
      normalize('national', existing.nationalId || '778888889999999900');
      normalize('birth', existing.birthDate || '2006-12-12');
      normalize('parent', existing.parentName || 'شعبان');
      normalize('parentPass', 'واحد');
      if (!Array.isArray(existing.subjectIds) || !existing.subjectIds.length) { existing.subjectIds = [1]; changed = true; }
      if (!Array.isArray(existing.subjects) || !existing.subjects.length || typeof existing.subjects[0] === 'string') {
        existing.subjects = [{id: 1, name: 'القرآن الكريم', teacher: 'ش/أحمد شعبان'}];
        changed = true;
      }
      ['sessions', 'tasks', 'completedTasks'].forEach(function(key) {
        if (!Array.isArray(existing[key])) { existing[key] = []; changed = true; }
      });
      if (changed) setData('students', students);
      return;
    }
    students.push({
      id: 'student_othman_local',
      name: 'عثمان',
      username: 'عثمان',
      national: '778888889999999900',
      nationalId: '778888889999999900',
      phone: '',
      birth: '2006-12-12',
      birthDate: '2006-12-12',
      age: 19,
      studentPass: 'واحد',
      password: 'واحد',
      parent: 'شعبان',
      parentName: 'شعبان',
      parentPass: 'واحد',
      subjectIds: [1],
      subjects: [{id: 1, name: 'القرآن الكريم', teacher: 'ش/أحمد شعبان'}],
      subject: 'القرآن الكريم',
      notes: '',
      createdAt: new Date().toLocaleString('ar-EG'),
      localSeed: true
    });
    setData('students', students);
  }());
  
  let currentUser = null, currentType = null, currentAdminId = null;
 let voiceBlob = null, voiceChunks = [], mediaRecorder = null;
let voiceFingerprint = null, voiceDataUrl = null, voiceProfileGemini = null;
let recordElements = [], homeworkItems = [], readingItems = [];
let fullChartStudentId = null;
let currentRecordMainSurah = '';
let currentRecordAvailableSurahs = [];
let currentRecordJuz = 0;

// ====== PROCTORING: camera, gaze approximation and continuous touch ======
const proctor={stream:null,detector:null,detectorType:'',faceMeshResults:null,analyzing:false,scanTimer:null,active:false,context:null,onReady:null,warningAt:0,touchWarningAt:0,lastGoodAt:0,stableSince:0,holding:false,touches:new Set(),baseline:null,gazeSamples:[],eyeSamples:[],screenWidth:0,screenHeight:0,cancelled:false,blocked:false,violations:0,leaveAt:0};
// Expose the shared runtime to the isolated v2 camera controller.
window.proctor=proctor;
function getProctorSettings(){const ctx=proctor.context||{};return{touchGraceMs:Math.max(1,parseInt(ctx.proctorTouchGrace)||12)*1000,gazeGraceMs:Math.max(3,parseInt(ctx.proctorGazeGrace||ctx.proctorFaceGrace)||12)*1000,leaveGraceMs:Math.max(1,parseInt(ctx.proctorLeaveGrace)||5)*1000,maxViolations:Math.max(1,parseInt(ctx.proctorMaxViolations)||2),fullscreen:ctx.proctorFullscreen===true,focus:ctx.proctorFocus!==false,touch:ctx.proctorTouch!==false,autoRestore:ctx.proctorAutoRestore!==false}}
function setProctorCheck(id,ok,text){const el=document.getElementById(id);if(!el)return;el.className='proctor-check '+(ok?'ok':'bad');el.textContent=(ok?'✓ ':'! ')+text}
function isTouchDevice(){return true}
function proctorTaskLabel(ctx){return ctx&&ctx.type==='exam'?'الاختبار':'مهمة '+(ctx&&ctx.type==='reading'?'القراءة':'التسميع')}
function proctorStopCamera(){clearInterval(proctor.scanTimer);proctor.scanTimer=null;proctor.analyzing=false;proctor.faceMeshResults=null;if(proctor.detectorType==='mediapipe')try{proctor.detector?.close()}catch(e){}proctor.detector=null;proctor.detectorType='';if(proctor.stream){proctor.stream.getTracks().forEach(t=>t.stop());proctor.stream=null}const v=document.getElementById('proctorVideo');if(v)v.srcObject=null;const scan=document.getElementById('proctorScanBtn');if(scan)scan.disabled=false}
function closeProctorGate(){proctorStopCamera();proctor.onReady=null;proctor.context=null;document.getElementById('proctorGate')?.classList.add('hidden')}
function openProctorGate(context,onReady){proctorStopCamera();proctor.active=false;proctor.context=context;proctor.onReady=onReady;proctor.cancelled=false;proctor.stableSince=0;proctor.baseline=null;proctor.gazeSamples=[];proctor.eyeSamples=[];proctor.touches.clear();document.getElementById('proctorGate')?.classList.remove('hidden');setProctorCheck('proctorTouchCheck',isTouchDevice(),isTouchDevice()?'شاشة لمس جاهزة — يلزم إصبع واحد':'هذه المهمة تعمل على هاتف بشاشة لمس فقط');setProctorCheck('proctorLightCheck',false,'الإضاءة غير مفحوصة');setProctorCheck('proctorFaceCheck',false,'الوجه غير مفحوص');setProctorCheck('proctorGazeCheck',false,'العينان غير مفحوصتين');const hold=document.getElementById('proctorGateHold');if(hold){hold.setAttribute('aria-disabled','true');hold.classList.remove('holding');hold.textContent='بعد نجاح الفحص: ضع إصبع واحد هنا للبدء'}document.getElementById('proctorCameraStatus').textContent='اضغط تشغيل الفحص للسماح بالكاميرا'}
async function startProctorScan(){if(!navigator.mediaDevices?.getUserMedia){document.getElementById('proctorHelp').textContent='الكاميرا تحتاج متصفحاً حديثاً واتصال HTTPS.';return}try{proctor.stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'user'},width:{ideal:640},height:{ideal:480}},audio:false});const video=document.getElementById('proctorVideo');video.srcObject=proctor.stream;await video.play();if('FaceDetector' in window){proctor.detector=new FaceDetector({fastMode:true,maxDetectedFaces:2});proctor.detectorType='native'}else if(window.FaceMesh){const mesh=new FaceMesh({locateFile:file=>'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4/'+file});mesh.setOptions({maxNumFaces:2,refineLandmarks:true,minDetectionConfidence:.55,minTrackingConfidence:.55});mesh.onResults(results=>{proctor.faceMeshResults=results.multiFaceLandmarks||[]});proctor.detector=mesh;proctor.detectorType='mediapipe'}else{throw new Error('face-model-unavailable')}document.getElementById('proctorScanBtn').disabled=true;document.getElementById('proctorHelp').textContent='يمل الفحص عى Chrome وSafari وFirefox وEdge الحديثة.';proctor.scanTimer=setInterval(proctorAnalyzeFrame,350);proctorAnalyzeFrame()}catch(e){proctorStopCamera();const name=e&&e.name||'';document.getElementById('proctorHelp').textContent=e&&e.message==='face-model-unavailable'?'تعذر تحميل نموذج فحص الوجه. تحقق من اتصال الإنترنت ثم أعد المحاولة.':name==='NotAllowedError'?'تم رفض إذن الكاميرا. اسمح به من إعدادات الموقع ثم أعد المحاولة.':name==='NotFoundError'?'لم يتم العثور على كاميرا متاحة.':name==='NotReadableError'?'الكاميرا مستخدمة في تطبيق آخر. أغلقه ثم أعد المحاولة.':name==='SecurityError'?'افتح الصفحة عبر HTTPS للسماح بالكاميرا.':'تعذر فتح الكاميرا. تحقق من إذن المتصفح ثم أعد المحاوة.'}}
async function proctorDetectFaces(video){if(proctor.detectorType==='native')return await proctor.detector.detect(video);if(proctor.detectorType==='mediapipe'){await proctor.detector.send({image:video});return (proctor.faceMeshResults||[]).map(points=>{let minX=1,minY=1,maxX=0,maxY=0;points.forEach(p=>{minX=Math.min(minX,p.x);minY=Math.min(minY,p.y);maxX=Math.max(maxX,p.x);maxY=Math.max(maxY,p.y)});return{boundingBox:{x:minX*video.videoWidth,y:minY*video.videoHeight,width:(maxX-minX)*video.videoWidth,height:(maxY-minY)*video.videoHeight},landmarks:points}})}return[]}
function proctorAverage(list){return list.length?list.reduce((a,b)=>a+b,0)/list.length:0}
function proctorEyeRatio(points,upper,lower,left,right){if(!points||!points[upper]||!points[lower]||!points[left]||!points[right])return null;const vertical=Math.hypot(points[upper].x-points[lower].x,points[upper].y-points[lower].y),horizontal=Math.max(.001,Math.hypot(points[left].x-points[right].x,points[left].y-points[right].y));return vertical/horizontal}
async function proctorAnalyzeFrame(){const video=document.getElementById('proctorVideo'),canvas=document.getElementById('proctorCanvas');if(!video||video.readyState<2||!proctor.detector||proctor.analyzing)return;proctor.analyzing=true;try{const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(video,0,0,canvas.width,canvas.height);const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let sum=0;for(let i=0;i<pixels.length;i+=16)sum+=(pixels[i]+pixels[i+1]+pixels[i+2])/3;const light=sum/(pixels.length/16),lightOk=light>=42&&light<=240;let faces=[];try{faces=await proctorDetectFaces(video)}catch(e){}const oneFace=faces.length===1;let gazeOk=false,faceOk=false,eyesOk=true;if(oneFace){const face=faces[0],b=face.boundingBox,cx=(b.x+b.width/2)/video.videoWidth,cy=(b.y+b.height/2)/video.videoHeight,ratio=b.width/video.videoWidth;faceOk=ratio>.16&&ratio<.78&&cy>.23&&cy<.78;proctor.gazeSamples.push({cx,cy,ratio});if(proctor.gazeSamples.length>7)proctor.gazeSamples.shift();const smooth={cx:proctorAverage(proctor.gazeSamples.map(x=>x.cx)),cy:proctorAverage(proctor.gazeSamples.map(x=>x.cy)),ratio:proctorAverage(proctor.gazeSamples.map(x=>x.ratio))};if(!proctor.baseline&&faceOk&&lightOk)proctor.baseline=smooth;if(face.landmarks){const left=proctorEyeRatio(face.landmarks,159,145,33,133),right=proctorEyeRatio(face.landmarks,386,374,362,263),eye=(left!==null&&right!==null)?(left+right)/2:null;if(eye!==null){proctor.eyeSamples.push(eye);if(proctor.eyeSamples.length>9)proctor.eyeSamples.shift();const smoothEye=proctorAverage(proctor.eyeSamples),adaptiveFloor=Math.max(.035,Math.min(.095,(proctor.baseline?.eye||smoothEye)*.48));if(proctor.baseline&&!proctor.baseline.eye&&proctor.eyeSamples.length>=5)proctor.baseline.eye=smoothEye;eyesOk=smoothEye>=adaptiveFloor}}if(proctor.baseline)gazeOk=eyesOk&&Math.abs(smooth.cx-proctor.baseline.cx)<.14&&Math.abs(smooth.cy-proctor.baseline.cy)<.14&&Math.abs(smooth.ratio-proctor.baseline.ratio)<.2}setProctorCheck('proctorLightCheck',lightOk,lightOk?'الإضاءة مناسبة':'عدّل الإضاءة أمام الوجه');setProctorCheck('proctorFaceCheck',faceOk,faceOk?'وجه واحد واضح':'اجعل وجهاً واحداً كاملاً في المنتصف');setProctorCheck('proctorGazeCheck',gazeOk,gazeOk?'تركيز العينين ثابت لى ائشاشة':'انظ�� مباشرة إلى الشاشة وافتح عينيك بصورة طبيعية');const allOk=isTouchDevice()&&lightOk&&faceOk&&gazeOk;if(allOk){if(!proctor.stableSince)proctor.stableSince=Date.now()}else proctor.stableSince=0;const stable=allOk&&Date.now()-proctor.stableSince>=1800;const hold=document.getElementById('proctorGateHold');if(hold)hold.setAttribute('aria-disabled',String(!stable));document.getElementById('proctorCameraStatus').textContent=stable?'جميع الشروط مستوفاة — ضع إصبع واحد للبدء':'يتم تثبيت التركيز على العينين...';if(proctor.active)proctorHandleLiveState(allOk,lightOk?'أبعدت وجهك أو نظرك عن الشاشة':'الإضاءة غير مناسبة')}finally{proctor.analyzing=false}}
function setupProctorHold(zone){if(!zone||zone.dataset.proctorBound)return;zone.dataset.proctorBound='1';const sync=function(e){e.preventDefault();proctor.touches=new Set(Array.from(e.touches||[]).map(t=>t.identifier));proctor.holding=proctor.touches.size===1;zone.classList.toggle('holding',proctor.holding);zone.textContent=proctor.holding?'تم رصد إصبع واحد — بدء المهمة':(proctor.touches.size>1?'اسخد إصبعًا واحدا فقط':'ضع إصبعًا واحدًا هنا للبدء');if(proctor.holding&&zone.getAttribute('aria-disabled')==='false'&&proctor.onReady){const cb=proctor.onReady,ctx=proctor.context;proctor.onReady=null;document.getElementById('proctorGate').classList.add('hidden');proctor.active=true;proctor.context=ctx;proctor.screenWidth=screen.width;proctor.screenHeight=screen.height;proctor.warningAt=0;proctor.touchWarningAt=0;proctor.leaveAt=0;proctor.lastGoodAt=Date.now();if(getProctorSettings().fullscreen&&document.documentElement.requestFullscreen)document.documentElement.requestFullscreen().catch(function(){});cb()}};zone.addEventListener('touchstart',sync,{passive:false});zone.addEventListener('touchmove',sync,{passive:false});zone.addEventListener('touchend',sync,{passive:false});zone.addEventListener('touchcancel',sync,{passive:false})}
function proctorLiveBar(){return ''}
function bindLiveProctorHold(){}
function proctorShowWarning(reason,startedAt){const grace=Math.ceil(getProctorSettings().gazeGraceMs/1000),left=Math.max(0,grace-Math.floor((Date.now()-startedAt)/1000)),w=document.getElementById('proctorWarning');if(w){w.textContent='تنبيه: '+reason+' — صحح الوضع خلال '+left+' ثانية';w.classList.remove('hidden')}}
function proctorHandleLiveState(ok,reason){if(ok){proctor.warningAt=0;proctor.lastGoodAt=Date.now();if(proctor.blocked&&getProctorSettings().autoRestore&&Date.now()-proctor.stableSince>=1500){proctor.blocked=false;document.getElementById('proctorBlock')?.classList.add('hidden');document.getElementById('proctorWarning')?.classList.add('hidden');}if(!proctor.touchWarningAt)document.getElementById('proctorWarning')?.classList.add('hidden');return}proctor.stableSince=0;if(!proctor.warningAt)proctor.warningAt=Date.now();proctorShowWarning(reason,proctor.warningAt);if(Date.now()-proctor.warningAt>=getProctorSettings().gazeGraceMs)proctorBlockTask(reason)}
function proctorBlockTask(reason){if(!proctor.active)return;proctor.blocked=true;proctor.stableSince=Date.now();const message=document.getElementById('proctorBlockMessage');if(message)message.textContent='تنبيه قابل للتفسير: '+reason+' — صحح الوضع أمام اشاة. تعد عناصر التحكم تلقائياً عند استقرار الإشارات.';document.getElementById('proctorBlock')?.classList.remove('hidden');recordProctorIncident(reason+' (حجب مؤقت قابل للاسترجاع)')}
function proctorHandleTouches(e){if(!proctor.active||!getProctorSettings().touch)return;const touches=e&&e.touches?Array.from(e.touches):[];proctor.touches=new Set(touches.map(t=>t.identifier));const count=proctor.touches.size,tooMany=count>1,status=document.getElementById('proctorTouchStatus');proctor.holding=count===1;if(!tooMany){proctor.touchWarningAt=0;if(status){status.textContent=count===1?'إصبع واحد':'جاهز للمسة واحدة';status.className='badge badge-success'}return}if(!proctor.touchWarningAt)proctor.touchWarningAt=Date.now();const reason='استخدم إصبعًا واحدًا فقط';if(status){status.textContent='أزل اللمسات الإضافية';status.className='badge badge-warning'}proctorShowWarning(reason,proctor.touchWarningAt);if(Date.now()-proctor.touchWarningAt>=getProctorSettings().touchGraceMs)cancelProctoredTask(reason)}
['touchstart','touchmove','touchend','touchcancel'].forEach(type=>document.addEventListener(type,proctorHandleTouches,{passive:true,capture:true}));
function recordProctorIncident(reason){if(!currentUser)return;const incident={id:'pi_'+Date.now(),studentId:currentUser.id,studentName:currentUser.name,taskType:proctor.context?.type||'unknown',taskId:proctor.context?.id||'',reason,time:new Date().toLocaleString('ar-EG'),timestamp:Date.now(),status:'cancelled'};const incidents=getData('proctoringIncidents',[]);incidents.unshift(incident);setData('proctoringIncidents',incidents.slice(0,500));const messages=getData('messages',[]);messages.push({type:'system',sender:'نظام المراقبة',senderId:0,receiverType:'admin',text:'تنبيه مخالفة مراقبة: '+currentUser.name+' — '+proctorTaskLabel(proctor.context)+' — '+reason+' — '+incident.time,time:incident.time,approved:true,read:false,proctorIncidentId:incident.id});setData('messages',messages);return incident}
function cancelProctoredTask(reason){if(!proctor.active||proctor.cancelled)return;proctor.cancelled=true;recordProctorIncident(reason);clearInterval(studentExamTimer);clearInterval(studentExamQuestionTimer);Object.keys(typeof activeAudioRecorders==='object'?activeAudioRecorders:{}).forEach(function(key){const state=activeAudioRecorders[key];try{if(state.recorder&&state.recorder.state!=='inactive')state.recorder.stop()}catch(e){}try{state.stream?.getTracks().forEach(t=>t.stop())}catch(e){}});const ctx=proctor.context;if(ctx?.type==='exam'){let students=getData('students',[]),idx=students.findIndex(s=>s.id===currentUser.id);if(idx>=0&&students[idx].activeExam){const ex=students[idx].activeExam;ex.status='cancelled_proctoring';ex.cancelReason=reason;ex.cancelledAt=Date.now();students[idx].examResults=students[idx].examResults||[];students[idx].examResults.push(ex);students[idx].activeExam=null;setData('students',students);currentUser=students[idx];document.getElementById('studentExamContent').innerHTML='<div class="alert alert-danger"><h3>أُلغي الاختبار بسبب مخاءءفة المراقبة</h3><p>'+escapeHtml(reason)+'</p></div>'}}else if(Number.isInteger(ctx?.taskIndex)){let students=getData('students',[]),idx=students.findIndex(s=>s.id===currentUser.id);if(idx>=0&&students[idx].tasks[ctx.taskIndex]){students[idx].tasks[ctx.taskIndex].proctorCancelled=true;students[idx].tasks[ctx.taskIndex].cancelReason=reason;setData('students',students);currentUser=students[idx];renderStudentTasks()}}proctorStop(true);showToast('أُلغيت المهمة وتم إرسال تنبيه للمسؤول','error')}
function proctorStop(closeCamera=true){proctor.active=false;proctor.holding=false;proctor.touches.clear();proctor.warningAt=0;proctor.touchWarningAt=0;document.getElementById('proctorWarning')?.classList.add('hidden');if(closeCamera)proctorStopCamera()}
function proctorLeaveStart(reason){if(!proctor.active||proctor.leaveAt||!getProctorSettings().focus)return;proctor.leaveAt=Date.now();proctorShowWarning(reason,proctor.leaveAt);const grace=getProctorSettings().leaveGraceMs;setTimeout(function(){if(proctor.active&&proctor.leaveAt&&Date.now()-proctor.leaveAt>=grace)proctorBlockTask(reason)},grace+50)}
function proctorLeaveEnd(){proctor.leaveAt=0;document.getElementById('proctorWarning')?.classList.add('hidden')}
document.addEventListener('visibilitychange',()=>{if(!proctor.active)return;if(document.hidden)proctorLeaveStart('تمت مغادرة صفحة المهمة');else proctorLeaveEnd()});window.addEventListener('blur',()=>{if(proctor.active)proctorLeaveStart('تم ترك نافذة المهمة')});window.addEventListener('focus',()=>{if(proctor.active)proctorLeaveEnd()});document.addEventListener('fullscreenchange',()=>{if(proctor.active&&getProctorSettings().fullscreen&&!document.fullscreenElement)proctorLeaveStart('تم الخروج من ملء الشاشة')});window.addEventListener('pagehide',()=>{if(proctor.active){recordProctorIncident('تم الخروج المفاجئ من الموقع');cancelProctoredTask('تم الخروج المفاجئ من الموقع')}});window.addEventListener('resize',()=>{if(proctor.active&&((screen.width&&screen.width<proctor.screenWidth*.72)||(window.innerWidth<screen.availWidth*.62)))proctorLeaveStart('تم اكتشاف تقسيم الشاشة أو تصغير نافذة ال��همة')});
function finishGoogleLogin(user){
  const email=String(user?.email||'').trim().toLowerCase();
  if(!email) throw new Error('جلسة Google بلا بريد إلكتروني');
  try{sessionStorage.removeItem('thimar_pending_google_signup')}catch(e){}
  const admins=getData('admins',[]), students=getData('students',[]);
  const admin=admins.find(a=>String(a.email||a.googleEmail||'').trim().toLowerCase()===email);
  if(admin){currentUser=admin;currentType='admin';currentAdminId=admin.id;pageHistory=[];saveSessionState();showPage('adminDashboard');showToast('مرحباً بك في لوحة المسؤول','success');return true}
  const student=students.find(s=>String(s.email||s.googleEmail||'').trim().toLowerCase()===email);
  if(student){currentUser=student;currentType='student';currentAdminId=null;pageHistory=[];saveSessionState();showPage('studentDashboard');showToast('مرحباً بك في منصة ثمار','success');return true}
  const children=students.filter(s=>String(s.parentEmail||s.parentGoogleEmail||'').trim().toLowerCase()===email);
  if(children.length){currentUser=children;currentType='parent';currentAdminId=null;pageHistory=[];saveSessionState();showPage('parentDashboard');showToast('مرحباً بك في صفحة ولي الأمر','success');return true}
  signupState.method='google';signupState.email=email;signupState.name=user.name||'';signupState.whats='';signupState.verified=true;try{sessionStorage.setItem('thimar_pending_google_signup',JSON.stringify({email:signupState.email,name:signupState.name,verified:true}));}catch(e){}const note=document.getElementById('signupVerifiedNote');if(note)note.innerHTML='تم التحقق من هويتك عبر Google — '+escapeHtml(email);const name=document.getElementById('signupName');if(name&&!name.value)name.value=user.name||'';initSignupJuzSelect();showPage('signupStep2');return false;
}
function restorePendingGoogleSignup(){try{const raw=sessionStorage.getItem('thimar_pending_google_signup');if(!raw)return false;const pending=JSON.parse(raw);if(!pending?.email)return false;signupState.method='google';signupState.email=String(pending.email).trim().toLowerCase();signupState.name=String(pending.name||'');signupState.whats='';signupState.verified=true;const note=document.getElementById('signupVerifiedNote');if(note)note.innerHTML='تم التحقق من هويتك عبر Google — '+escapeHtml(signupState.email);const name=document.getElementById('signupName');if(name&&!name.value)name.value=signupState.name;initSignupJuzSelect();showPage('signupStep2');return true}catch(e){try{sessionStorage.removeItem('thimar_pending_google_signup')}catch(ignore){}return false}}

function initializeThimarApp(){if(window.__thimarAppInitialized)return;window.__thimarAppInitialized=true;loadCountryRules();loadGlobalProctorSettings();setupProctorHold(document.getElementById('proctorGateHold'),true);const params=new URLSearchParams(location.search);if(params.get('google')==='success'){fetch('/api/auth/google/session',{cache:'no-store',credentials:'same-origin'}).then(r=>r.json()).then(data=>{if(!data.authenticated||!data.user?.email)throw new Error('عذر قراءة جلسة Google');finishGoogleLogin(data.user);history.replaceState({},'',pageUrl(document.querySelector('.page:not(.hidden)')?.id))}).catch(()=>{history.replaceState({},'',location.pathname);const box=document.getElementById('signupStep1Alert');if(box)box.innerHTML='<div class="alert alert-danger">تعذر استكمال تسجيل الدخول عبر Google.</div>'})}else if(restoreSession()){
  const expectedRole = /\/(?:admin|admin\.html)$/.test(location.pathname) ? 'admin' : /\/(?:student|student\.html)$/.test(location.pathname) ? 'student' : /\/(?:parent|parent\.html)$/.test(location.pathname) ? 'parent' : null;
  if(expectedRole && expectedRole !== currentType){
    history.replaceState({ page: defaultPageForRole(currentType) }, '', roleShellPath(currentType));
  }
  const routed=pageFromUrl();
  if(routed && pageAllowedForUser(routed)) showPage(routed,{fromBrowser:true});
  else showPage(defaultPageForRole(currentType),{fromBrowser:true});
}else restorePendingGoogleSignup()}

if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeThimarApp, {once:true});
else initializeThimarApp();

window.addEventListener('popstate',()=>{const id=pageFromUrl();if(!id||!pageAllowedForUser(id)){showPage(defaultPageForRole(),{fromBrowser:true});return;}showPage(id,{fromBrowser:true});});

// ====== SESSION PERSISTENCE ======
function saveSessionState() {
  try {
    if(currentUser && currentType) {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
      sessionStorage.setItem('currentType', currentType);
      sessionStorage.setItem('currentAdminId', currentAdminId || '');
      sessionStorage.setItem('pageHistory', JSON.stringify(pageHistory));
    }
  } catch(e) { console.error('saveSessionState error:', e); }
}
function restoreSession() {
  try {
    const savedUser = sessionStorage.getItem('currentUser');
    const savedType = sessionStorage.getItem('currentType');
    const savedHistory = sessionStorage.getItem('pageHistory');
    if(savedUser && savedType) {
      currentUser = JSON.parse(savedUser);
      currentType = savedType;
      currentAdminId = sessionStorage.getItem('currentAdminId') || null;
      if(savedHistory) pageHistory = JSON.parse(savedHistory);
      return true;
    }
  } catch(e) { console.error('restoreSession error:', e); }
  return false;
}
function clearSession() {
  try {
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentType');
    sessionStorage.removeItem('currentAdminId');
    sessionStorage.removeItem('pageHistory');
    pageHistory = [];
  } catch(e) { console.error('clearSession error:', e); }
}

const PAGE_ROUTE_PARAM = 'page';
let routingFromBrowser = false;

function pageUrl(id) {
  const url = new URL(window.location.href);
  if (!id || id === 'homePage') url.searchParams.delete(PAGE_ROUTE_PARAM);
  else url.searchParams.set(PAGE_ROUTE_PARAM, id);
  return url.pathname + (url.searchParams.toString() ? '?' + url.searchParams.toString() : '') + url.hash;
}

function defaultPageForRole(role = currentType) {
  if (role === 'admin') return 'adminDashboard';
  if (role === 'student') return 'studentDashboard';
  if (role === 'parent') return 'parentDashboard';
  return 'lockScreen';
}

function pageFromUrl() {
  const id = new URLSearchParams(window.location.search).get(PAGE_ROUTE_PARAM);
  return id && document.getElementById(id) ? id : defaultPageForRole();
}

function pageAllowedForUser(id) {
  if (!id) return true;
  if (id.startsWith('admin') || ['studentsList','messagesPage','subjectsPage','adminsPage','addStudent','filesPage','adminSettings'].includes(id)) return currentType === 'admin';
  if (id.startsWith('student')) return currentType === 'student';
  if (id.startsWith('parent')) return currentType === 'parent';
  return true;
}

function roleShellPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'student') return '/student';
  if (role === 'parent') return '/parent';
  return '/login';
}

function showPage(id, options = {}) {
  // كل الأدوار موجودة داخل shell واحد؛ التنقل بينها محلي بلا إعادة تحميل.
  const dashboardRole = id === 'adminDashboard' ? 'admin' : id === 'studentDashboard' ? 'student' : id === 'parentDashboard' ? 'parent' : null;
  const currentVisible = document.querySelector('.page:not(.hidden), .home-page:not(.hidden), .chart-page:not(.hidden)');
  const currentId = currentVisible ? currentVisible.id : null;

  if (!options.fromBrowser && !routingFromBrowser && window.history && window.history.pushState) {
    window.history.pushState({ page: id }, '', pageUrl(id));
  }
  
  if(currentId && currentId !== id && currentId !== 'homePage' && !options.fromBrowser) {
    pageHistory.push(currentId);
    if(pageHistory.length > 20) pageHistory.shift();
  }

  let el = document.getElementById(id);
  if(!el || !pageAllowedForUser(id)) {
    id = defaultPageForRole(currentType);
    el = document.getElementById(id) || document.getElementById('lockScreen');
    if (!options.fromBrowser && window.history && window.history.replaceState) window.history.replaceState({ page: id }, '', pageUrl(id));
  }
  // A deep link can be opened before a role session exists. Keep the lock screen
  // as the final safe fallback instead of calling classList on a missing element.
  if(!el) return;
  document.querySelectorAll('.page, .home-page, .chart-page').forEach(node => node.classList.add('hidden'));
  el.classList.remove('hidden');

  checkAndFinalizeDrafts();
  updateBackButton();

  if(id === 'adminDashboard') { renderAdminStats(); updateMsgBadge(); renderActiveDrafts(); }
  if(id === 'studentsList') renderStudents();
  if(id === 'messagesPage') { renderMessages(); markAdminMessagesRead(); }
  if(id === 'subjectsPage') renderSubjects();
  if(id === 'adminsPage') renderAdmins();
  if(id === 'addStudent') { renderSubjectSelect(); initJuzSelect(); voiceBlob = null; voiceFingerprint = null; voiceDataUrl = null; voiceProfileGemini = null; document.getElementById('voicePreview').style.display='none'; document.getElementById('voiceRecordStatus').textContent='اضغط للتسجيءء (20 ثانية)'; }
  if(id === 'adminSettings') loadAdminSettings();
  if(id === 'studentDashboard' && currentType === 'student') { renderStudentDashboard(); updateStudentMsgBadge(); }
  if(id === 'studentInbox') { renderStudentInbox(); markStudentMessagesRead(); }
  if(id === 'studentRecordsPage') renderStudentRecordsBox();
  if(id === 'parentDashboard' && currentType === 'parent') { renderParentDashboard(); updateParentMsgBadge(); }
  if(id === 'parentInbox') { renderParentInbox(); markParentMessagesRead(); }
  if (id === 'studentDashboard' || id === 'parentDashboard') {
    if (typeof window.mountIslamicHub === 'function') window.mountIslamicHub();
  }
  if(id === 'filesPage') { renderFileTargetSelect(); renderFiles(); loadExamFiles().catch(function(e){document.getElementById('examFilesList').innerHTML='<div class="alert alert-danger">'+escapeHtml(e.message)+'</div>';}); }
  if(id === 'studentFilesPage') renderUserFiles('student');
  if(id === 'parentFilesPage') renderUserFiles('parent');
  if(id === 'parentRecordsPage') renderParentRecords();
  if(id === 'studentExamPage') renderStudentExam();
  if(id === 'parentPendingTasksPage') renderParentPendingTasks();
  if(id === 'parentChartPage') renderParentFullChart();
  applyLangToDom();
  window.scrollTo(0,0);
  saveSessionState();
}

function goBack() {
  if (window.history.length > 1 && new URLSearchParams(window.location.search).has(PAGE_ROUTE_PARAM)) {
    window.history.back();
    return;
  }
  if(pageHistory.length > 0) {
    const prevPage = pageHistory.pop();
    document.querySelectorAll('.page, .home-page, .chart-page').forEach(el => el.classList.add('hidden'));
    const el = document.getElementById(prevPage);
    if(el) {
      el.classList.remove('hidden');
      updateBackButton();
      saveSessionState();
      window.scrollTo(0,0);
      return;
    }
  }
  // Fallback
  if(currentType === 'admin') showPage('adminDashboard');
  else if(currentType === 'student') showPage('studentDashboard');
  else if(currentType === 'parent') showPage('parentDashboard');
  else showPage('lockScreen');
}

function updateBackButton() {
  const existing = document.getElementById('globalBackBtn');
  if(existing) existing.remove();

  const currentVisible = document.querySelector('.page:not(.hidden), .chart-page:not(.hidden)');
  if(!currentVisible) return;
  const currentId = currentVisible.id;

  // Don't show on home page or login pages
  if(currentId === 'lockScreen' || currentId === 'homePage' || currentId === 'adminLogin' || currentId === 'studentLogin' || currentId === 'parentLogin') return;

  // Don't show if no history
  if(pageHistory.length === 0) return;

  const btn = document.createElement('div');
  btn.id = 'globalBackBtn';
  btn.className = 'back-btn-container';
  btn.innerHTML = '<button class="back-btn" onclick="goBack()">🔙 رجوع للصفحة السابقة</button>';
  document.body.appendChild(btn);
}

// ====== DRAFT SYSTEM - Auto finalize after 24 hours ======
// رشفة هام اليوم في السجلات عند انتهاء ليوم (ولي الأمر والئالب والمسؤول)
function archiveDailyTasks() {
  try {
    let students = getData('students');
    let changed = false;
    const todayStr = new Date().toISOString().split('T')[0];
    students.forEach(s => {
      if(!s.taskArchive) s.taskArchive = [];
      const pool = [].concat(s.completedTasks || [], s.rejectedLog || []);
      pool.forEach(t => {
        const day = t.day || (t.approvedAt || t.rejectedAt ? null : null);
        if(!day || day >= todayStr) return;
        if(t.archived) return;
        s.taskArchive.push({
          day: day,
          status: t.status || (t.approvedAt ? 'approved' : 'rejected'),
          type: t.type || '',
          name: t.name || t.text || '',
          surah: t.surah || '', from: t.from || '', to: t.to || '',
          at: t.approvedAt || t.rejectedAt || '',
          sourceMsgId: t.sourceMsgId || ''
        });
        t.archived = true;
        changed = true;
      });
    });
    if(changed) setData('students', students);
  } catch(e) { console.error('archiveDailyTasks error:', e); }
}

// ====== سجل المهام اليومي (مقسّم لكل يوم على حة) ======
function buildDailyLog(s) {
  const items = [];
  const seen = {};
  function push(t, status) {
    if(!t) return;
    const at = t.approvedAt || t.rejectedAt || t.at || '';
    let day = t.day || '';
    if(!day && at) { const m = String(at).match(/(\d{1,4}[\/-]\d{1,2}[\/-]\d{1,4})/); day = m ? m[1] : ''; }
    if(!day) day = 'بدون اريخ';
    const name = t.name || t.text || '';
    const key = (t.sourceMsgId || '') + '|' + day + '|' + status + '|' + name + '|' + at;
    if(seen[key]) return;
    seen[key] = 1;
    items.push({ day: day, status: status, type: t.type || '', name: name,
      surah: t.surah || '', from: t.from || '', to: t.to || '', at: at });
  }
  (s.completedTasks || []).forEach(function(t){ push(t, 'approved'); });
  (s.rejectedLog || []).forEach(function(t){ push(t, 'rejected'); });
  (s.taskArchive || []).forEach(function(t){ push(t, t.status || 'approved'); });
  return items;
}

function renderTaskArchiveHtml(s) {
  const arch = buildDailyLog(s);
  if(arch.length === 0) return '<div class="page" style="margin-top:20px; border-right:5px solid var(--info);"><h4 style="color:var(--info);">📋 سجل المهام اليومية</h4><div class="alert alert-info">لا توجد مهام مسجلة بعد</div></div>';
  const grouped = {};
  arch.forEach(function(t){ if(!grouped[t.day]) grouped[t.day] = []; grouped[t.day].push(t); });
  let html = '<div class="page" style="margin-top:20px; border-right:5px solid var(--info);">';
  html += '<h4 style="color:var(--info); margin-bottom:15px;">📋 سج المهام اليومية (كل يوم على حدة)</h4>';
  Object.keys(grouped).sort().reverse().forEach(function(day){
    const list = grouped[day];
    const okCount = list.filter(function(x){ return x.status === 'approved'; }).length;
    html += '<div class="history-day"><div class="history-day-header">📅 ' + day + ' — ' + list.length + ' مهمة (✅ ' + okCount + ' / ❌ ' + (list.length - okCount) + ')</div>';
    list.forEach(function(t){
      const ok = t.status === 'approved';
      const typeLabel = t.type === 'homework' ? 'واجب' : t.type === 'reading' ? 'قراءة' : t.type === 'voice' ? 'تسجيل صوتي' : 'مهمة';
      html += '<div class="history-element" style="border-right-color:' + (ok ? 'var(--success)' : 'var(--danger)') + ';">';
      html += '<div class="history-element-name">' + (ok ? '✅ الحالة النهائية: مقبولة' : '❌ الحالة النهائية: مرفوضة') + ' — ' + typeLabel + ': ' + (t.name || '-') + '</div>';
      if(t.surah) html += '<div class="history-element-details"><div class="history-detail"><strong>السورة:</strong> ' + t.surah + '</div><div class="history-detail"><strong>من آية:</strong> ' + (t.from || '-') + '</div><div class="history-detail"><strong>إلى آية:</strong> ' + (t.to || '-') + '</div></div>';
      if(t.at) html += '<div class="history-detail" style="color:var(--text-light);">🕐 ' + t.at + '</div>';
      html += '</div>';
    });
    html += '</div>';
  });
  html += '</div>';
  return html;
}

// صندوق السجيلات للطالب: كل التسميعت + المهام مرتبة بالأيام
function renderStudentRecordsBox() {
  const s = currentUser;
  const box = document.getElementById('studentRecordsContent');
  if(!s || !box) return;
  const sessions = (s.sessions || []).slice();
  let html = '<div class="page" style="margin-top:0; border-right:5px solid var(--primary);">';
  html += '<h4 style="color:var(--primary); margin-bottom:15px;">🎙️ سجل التسميعات (كل يوم على حدة)</h4>';
  if(sessions.length === 0) {
    html += '<div class="alert alert-info">لا توجد تسميعات مسجلة بعد</div>';
  } else {
    const grouped = {};
    sessions.forEach(function(sess){ const d = sess.date || 'بدون تاريخ'; if(!grouped[d]) grouped[d] = []; grouped[d].push(sess); });
    Object.keys(grouped).sort().reverse().forEach(function(date){
      html += '<div class="history-day"><div class="history-day-header">📅 ' + date + '</div>';
      grouped[date].forEach(function(sess){
        html += '<div style="margin-bottom:10px;">';
        html += '<div style="margin-bottom:6px;">' + (sess.isDraft ? '<span class="badge badge-warning">📝 مسودة اليوم</span>' : '<span class="badge badge-success">✅ نهائي</span>') + ' <span class="score-badge">المجموع: ' + (sess.totalScore || 0) + ' درجة</span></div>';
        (sess.elements || []).forEach(function(el, ei){
          html += '<div class="history-element" style="border-right-color:' + (el.color || 'var(--info)') + ';">';
          html += '<div class="history-element-name">' + (ei + 1) + '. ' + el.name + '</div>';
          html += '<div class="history-element-details">';
          html += '<div class="history-detail"><strong>السورة:</strong> ' + (el.surah || '-') + '</div>';
          html += '<div class="history-detail"><strong>من آية:</strong> ' + (el.from || '-') + '</div>';
          html += '<div class="history-detail"><strong>إلى آية:</strong> ' + (el.to || '-') + '</div>';
          html += '<div class="history-detail"><strong>التقييم:</strong> <span class="badge ' + getRatingClass(el.rating) + '">' + getRatingLabel(el.rating) + '</span></div>';
          html += '</div></div>';
        });
        if(sess.notes) html += '<p style="color:var(--text-light);"><strong>ملاحظات:</strong> ' + sess.notes + '</p>';
        html += '</div>';
      });
      html += '</div>';
    });
  }
  html += '</div>';
  html += renderTaskArchiveHtml(s);
  box.innerHTML = html;
}

function checkAndFinalizeDrafts() {
  archiveDailyTasks();
  try {
    let students = getData('students');
    let changed = false;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const todayStr = new Date().toISOString().split('T')[0];

    students.forEach(s => {
      if(!s.sessions) return;
      s.sessions.forEach(sess => {
        let shouldClose = sess.isDraft && sess.draftCreatedAt && (now - sess.draftCreatedAt > oneDay);
        if(sess.isDraft && sess.date && sess.date !== todayStr) {
          shouldClose = true;
        }
        if(shouldClose) {
          sess.isDraft = false;
          sess.finalizedAt = new Date().toLocaleString('ar-EG');
          changed = true;
          let messages = getData('messages');
          const msgText = 'تم إغلاق تسميع '+s.name+' بتاريخ '+sess.date+' بشكل نهائي. المجموع: '+sess.totalScore+' درجات من 16. لا يمكن التعديل بعد الآن.';
          messages.push({type:'system', sender:'النظام', senderId:0, receiverType:'student', receiverId:s.id, text:msgText, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
          messages.push({type:'system', sender:'النظام', senderId:0, receiverType:'parent', receiverName:s.parent, text:msgText, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
          setData('messages', messages);
        }
      });
    });
    if(changed) setData('students', students);
  } catch(e) { console.error('checkAndFinalizeDrafts error:', e); }
}

function togglePassVisibility(inputId, iconEl) {
  const input = document.getElementById(inputId);
  if(!input) return;
  if(input.type === 'password') {
    input.type = 'text';
    iconEl.textContent = '🙈';
  } else {
    input.type = 'password';
    iconEl.textContent = '👁️';
  }
}

// ====== التقسيم الحقيقي للـ30 جزءاً (حدود الآيات، لا أسماء السور فقط) ======
// الحدود مبنية على خريطة الآيات التقليدية للجزء: بداية كل جزء هي الآية التالية لنها��ة الجزء السابق.
const JUZ_BOUNDARIES = {
  1:[[1,1,7],[2,1,141]], 2:[[2,142,252]], 3:[[2,253,286],[3,1,92]],
  4:[[3,93,200],[4,1,23]], 5:[[4,24,147]], 6:[[4,148,176],[5,1,81]],
  7:[[5,82,120],[6,1,110]], 8:[[6,111,165],[7,1,87]], 9:[[7,88,206],[8,1,40]],
  10:[[8,41,75],[9,1,92]], 11:[[9,93,129],[10,1,109],[11,1,5]],
  12:[[11,6,123],[12,1,52]], 13:[[12,53,111],[13,1,43],[14,1,52],[15,1,1]],
  14:[[15,2,99],[16,1,128]], 15:[[17,1,111],[18,1,74]],
  16:[[18,75,110],[19,1,98],[20,1,135]], 17:[[21,1,112],[22,1,78]],
  18:[[23,1,118],[24,1,64],[25,1,20]], 19:[[25,21,77],[26,1,227],[27,1,55]],
  20:[[27,56,93],[28,1,88],[29,1,45]], 21:[[29,46,69],[30,1,60],[31,1,34],[32,1,30],[33,1,30]],
  22:[[33,31,73],[34,1,54],[35,1,45],[36,1,27]], 23:[[36,28,83],[37,1,182],[38,1,88],[39,1,31]],
  24:[[39,32,75],[40,1,85],[41,1,46]], 25:[[41,47,54],[42,1,53],[43,1,89],[44,1,59],[45,1,37]],
  26:[[46,1,35],[47,1,38],[48,1,29],[49,1,18],[50,1,45],[51,1,30]],
  27:[[51,31,60],[52,1,49],[53,1,62],[54,1,55],[55,1,78],[56,1,96],[57,1,29]],
  28:[[58,1,22],[59,1,24],[60,1,13],[61,1,14],[62,1,11],[63,1,11],[64,1,18],[65,1,12],[66,1,12]],
  29:[[67,1,30],[68,1,52],[69,1,52],[70,1,44],[71,1,28],[72,1,28],[73,1,20],[74,1,56],[75,1,40],[76,1,31],[77,1,50]],
  30:[[78,1,40],[79,1,46],[80,1,42],[81,1,29],[82,1,19],[83,1,36],[84,1,25],[85,1,22],[86,1,17],[87,1,19],[88,1,26],[89,1,30],[90,1,20],[91,1,15],[92,1,21],[93,1,11],[94,1,8],[95,1,8],[96,1,19],[97,1,5],[98,1,8],[99,1,8],[100,1,11],[101,1,11],[102,1,8],[103,1,3],[104,1,9],[105,1,5],[106,1,4],[107,1,7],[108,1,3],[109,1,6],[110,1,3],[111,1,5],[112,1,4],[113,1,5],[114,1,6]]
};

function getJuzVerseRanges(juzNum){ return JUZ_BOUNDARIES[Number(juzNum)] || []; }
function getJuzSurahRanges(juzNum){
  const ranges=getJuzVerseRanges(juzNum);
  return ranges.map(r=>({surah:r[0],from:r[1],to:r[2]}));
}
function getSurahsForJuz(juzNum) {
  if(!juzNum || !quranData[juzNum]) return [];
  return quranData[juzNum];
}

// ====== JUZ & SURAH SELECTS ======
function initJuzSelect() {
  const select = document.getElementById('stJuz');
  let html = '<option value="">اختر الجزء...</option>';
  for(let i=1; i<=30; i++) html += '<option value="'+i+'">اجزء '+i+'</option>';
  select.innerHTML = html;
  document.getElementById('stSurah').innerHTML = '<option value="">اختر الجزء أولاً...</option>';
}
function updateSurahSelect() {
  const juz = document.getElementById('stJuz').value;
  const select = document.getElementById('stSurah');
  if(!juz || !quranData[juz]) {
    select.innerHTML = '<option value="">اختر الجزء أولاً...</option>'; return;
  }
  let html = '<option value="">اختر السورة...</option>';
  quranData[juz].forEach(s => { html += '<option value="'+s+'">'+s+'</option>'; });
  select.innerHTML = html;
  const ranges=getJuzVerseRanges(juz);
  const hint=document.getElementById('juzBoundaryHint');
  if(hint) hint.textContent='حدود الجزء: '+ranges.map(r=>'سورة '+(ALL_SURAHS_ORDERED[r[0]-1]||r[0])+' '+r[1]+'–'+r[2]).join(' | ');
}
// ====== إنشاء حساب جدد (طلب انضمام) ======
let signupState = { method: null, email: '', name: '', whats: '', whatsCountry: 'EG', code: '', verified: false };

// ====== إعداد تسجيل الدخو بحساب جوجل (Google Identity Services) ======
// معرّف العميل (OAuth Client ID) ُدار من إعدادات المسؤول > إدارة المسؤولين
let googleGsiInited = false;
let currentGoogleClientId = '';
let serverGoogleClientId = '';
let googleClientIdRequest = null;

function decodeJwt(token) {
  try {
    const base = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(escape(atob(base))));
  } catch(e) { return null; }
}

function getGoogleClientId() {
  return serverGoogleClientId;
}
function loadGoogleClientId() {
  if(googleClientIdRequest) return googleClientIdRequest;
  googleClientIdRequest = fetch('/api/config/google', { cache: 'no-store' })
    .then(function(res) { return res.json().then(function(body) { if(!res.ok) throw new Error(body.message || 'Google Client ID is not configured'); return body; }); })
    .then(function(body) { serverGoogleClientId = String(body.clientId || '').trim(); return serverGoogleClientId; })
    .catch(function() { serverGoogleClientId = ''; return ''; });
  return googleClientIdRequest;
}
function googleClientIdReady() {
  return !!serverGoogleClientId && serverGoogleClientId.indexOf('.apps.googleusercontent.com') !== -1;
}
function loadGoogleIdentityScript(){
  if(window.google?.accounts?.id) return Promise.resolve(true);
  if(window.__googleIdentityPromise) return window.__googleIdentityPromise;
  window.__googleIdentityPromise=new Promise(function(resolve){
    const existing=document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if(existing){existing.addEventListener('load',()=>resolve(true),{once:true});existing.addEventListener('error',()=>resolve(false),{once:true});return;}
    const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;script.defer=true;script.onload=()=>resolve(true);script.onerror=()=>resolve(false);document.head.appendChild(script);
  });
  return window.__googleIdentityPromise;
}

function initGoogleGsi() {
  const id = getGoogleClientId();
  if(!id || id.indexOf('.apps.googleusercontent.com') === -1) return false;
  if(!window.google || !google.accounts || !google.accounts.id) return false;
  // إعادة التهيئة إذا تغيّر المعرّف
  if(googleGsiInited && id === currentGoogleClientId) return true;
  google.accounts.id.initialize({
    client_id: id,
    callback: handleGoogleCredential,
    auto_select: false,
    itp_support: true,
    ux_mode: 'popup'
  });
  currentGoogleClientId = id;
  googleGsiInited = true;
  return true;
}

async function renderGoogleButton() {
  const container = document.getElementById('googleBtnContainer');
  const box = document.getElementById('signupStep1Alert');
  if(!container) return;
  container.innerHTML = '<div style="width:100%;text-align:center;color:var(--text-light)">جارٍ تحميل حسابات Google...</div>';
  await loadGoogleClientId();
  await loadGoogleIdentityScript();
  const render = function() {
    if(initGoogleGsi()) {
      container.innerHTML = '';
      google.accounts.id.renderButton(container, { type:'standard', theme: document.documentElement.dataset.theme === 'dark' ? 'filled_black' : 'outline', size:'large', text:'signup_with', shape:'rectangular', width:Math.min(container.clientWidth || 320, 400), locale:document.documentElement.lang || 'ar' });
      if(box) box.innerHTML = '';
      return true;
    }
    return false;
  };
  if(render()) return;
  let attempts = 0;
  const retry = function() {
    if(render() || ++attempts >= 20) {
      if(attempts >= 20 && box) box.innerHTML = '<div class="alert alert-warning">تعذر تحميل واجهة اختيار احسابات في هذا المتصفح. اضغ للمتابعة عبر Google OAuth الآمن.</div><button class="btn btn-primary" type="button" style="width:100%" onclick="window.location.href=\'/api/auth/google?prompt=select_account\'">🔵 المتابعة باستخدام Google</button>';
      return;
    }
    setTimeout(retry, 250);
  };
  retry();
}

function handleGoogleCredential(resp) {
  const box = document.getElementById('signupStep1Alert');
  const payload = decodeJwt(resp && resp.credential);
  if(!payload || !payload.email) { box.innerHTML = '<div class="alert alert-danger">هناك خطأ</div>'; return; }
  // حساب جوجل يُثبت الهوية → لا حاجة لرقم واتساب ولا كود تحقق
  signupState.method = 'google';
  signupState.email = payload.email;
  signupState.name = payload.name || '';
  signupState.whats = '';
  signupState.verified = true;
  try{sessionStorage.setItem('thimar_pending_google_signup',JSON.stringify({email:signupState.email,name:signupState.name,verified:true}));}catch(e){}
  box.innerHTML = '';
  document.getElementById('signupVerifiedNote').innerHTML = '✅ تم التحقق من هويتك عبر جوجل — ' + payload.email;
  if(payload.name) { const n = document.getElementById('signupName'); if(n && !n.value) n.value = payload.name; }
  initSignupJuzSelect();
  showPage('signupStep2');
}

function getInternationalNumber(inputId, countryId) {
  const selector = document.getElementById(countryId);
  const selectedRule = countryRuleForValue(selector?.value);
  const raw = normalizeLocalPhoneForRule(document.getElementById(inputId)?.value || '', selectedRule);
  const country = selectedRule ? selectedRule.dialCode : String(selector?.value || '20').replace(/\D/g, '');
  return country + raw;
}
function updateSignupInternationalNumber(inputId, countryId, outputId) {
  const output = document.getElementById(outputId);
  if(output) output.textContent = (currentLang === 'en' ? 'International number: +' : 'الرقم الدولي: +') + getInternationalNumber(inputId, countryId);
}
function syncSignupRelationshipField() {
  const role = document.getElementById('signupRole')?.value || 'student';
  const label = document.getElementById('signupRelationshipLabel');
  const input = document.getElementById('signupRelationshipName');
  if(!label || !input) return;
  const isStudent = role === 'student';
  label.textContent = currentLang === 'en' ? (isStudent ? 'Parent name *' : 'Student name *') : (isStudent ? 'اسم ولي الأمر *' : 'اسم الطالب *');
  input.placeholder = currentLang === 'en' ? (isStudent ? 'Enter the parent\'s full name' : 'Enter the student\'s full name') : (isStudent ? 'اكتب اسم ولي الأمر بالكامل' : 'اكتب اسم الطالب بالكامل');
}
function normalizeWaNumber(phone, countryCode) {
  let raw = String(phone || '').replace(/\D/g, '');
  if(raw.indexOf('00') === 0) raw = raw.slice(2);
  const rule = countryRuleForValue(countryCode);
  if(rule) {
    if(raw.indexOf(rule.dialCode) === 0 && raw.length > rule.dialCode.length + 6) return raw;
    return rule.dialCode + raw.replace(/^0+/, '');
  }
  if(raw.indexOf('0') === 0) return '20' + raw.slice(1);
  return raw;
}
function buildWaLink(phone, text, countryCode) {
  const p = normalizeWaNumber(phone, countryCode);
  return p ? 'https://wa.me/' + p + '?text=' + encodeURIComponent(text) : '';
}

function toggleUnifiedPassword() {
  const input = document.getElementById('unifiedPass');
  const button = document.getElementById('unifiedPassToggle');
  if(!input || !button) return;
  const showing = input.type === 'password';
  input.type = showing ? 'text' : 'password';
  button.classList.toggle('is-visible', showing);
  button.setAttribute('aria-pressed', String(showing));
  const label = showing ? 'إخفاء الرقم السري' : 'إظهار الرقم السري';
  button.setAttribute('aria-label', currentLang === 'en' ? (showing ? 'Hide password' : 'Show password') : label);
  button.setAttribute('data-ar-aria-label', label);
}
function openAccountRecovery() {
  ['recoveryName','recoveryNid','recoveryPhone'].forEach(function(id){ const el=document.getElementById(id); if(el) el.value=''; });
  const role=document.getElementById('recoveryRole'); if(role) role.value='student';
  const country=document.getElementById('recoveryCountry'); if(country) { country.value='EG'; country.dataset.countryIso='EG'; }
  const identityCountry=document.getElementById('recoveryIdentityCountry'); if(identityCountry) { identityCountry.value='EG'; identityCountry.dataset.countryIso='EG'; }
  const result=document.getElementById('recoveryResult'); if(result) result.innerHTML='';
  updateSignupInternationalNumber('recoveryPhone','recoveryCountry','recoveryPhoneInternational');
  showPage('accountRecoveryPage');
}
function normalizeRecoveryText(value) {
  return String(value || '').trim().normalize('NFKD').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\u064B-\u065F\s_-]/g,'').toLowerCase();
}
function recoveryPhoneMatches(stored, submitted, storedCountry, submittedCountry) {
  const a=normalizeWaNumber(stored, storedCountry), b=normalizeWaNumber(submitted, submittedCountry);
  return Boolean(a && b && (a === b || a.slice(-10) === b.slice(-10)));
}
let lastRecoverySignature = '', lastRecoveryAt = 0;
function submitAccountRecovery() {
  const box=document.getElementById('recoveryResult');
  const role=document.getElementById('recoveryRole')?.value || 'student';
  const name=document.getElementById('recoveryName')?.value.trim() || '';
  const nid=normalizeIdentityInput(document.getElementById('recoveryNid')?.value || '');
  const phone=getInternationalNumber('recoveryPhone','recoveryCountry');
  const recoveryValidation = validateCountryFields('recoveryIdentityCountry','recoveryNid','recoveryCountry','recoveryPhone');
  if(!name || !recoveryValidation.identityValid || !recoveryValidation.phoneValid) { box.innerHTML='<div class="alert alert-danger">يرجى إدخال الاسم والهوية أو الجواز ورقم الهاتف وفق الصيغة الخاصة بالدول المختارة.</div>'; return; }
  const students=getData('students', []);
  const matched=students.find(function(student){
    const expectedName=role === 'student' ? student.name : (student.parent || student.parentName);
    const expectedNid=role === 'student' ? (student.national || student.nationalId) : (student.parentNational || student.parentNationalId || student.national || student.nationalId);
  const expectedPhone=role === 'student' ? student.phone : (student.parentPhone || student.phone);
  const expectedPhoneCountry=role === 'student' ? (student.phoneCountry || 'EG') : (student.parentPhoneCountry || student.phoneCountry || 'EG');
  const expectedIdentityCountry=role === 'student' ? (student.nationalCountry || student.identityCountry || 'EG') : (student.parentNationalCountry || student.nationalCountry || student.identityCountry || 'EG');
  return normalizeRecoveryText(expectedName) === normalizeRecoveryText(name)
      && selectedCountryIso('recoveryIdentityCountry') === (countryRuleForValue(expectedIdentityCountry)?.iso2 || 'EG')
      && normalizeIdentityInput(expectedNid || '') === nid
      && recoveryPhoneMatches(expectedPhone, phone, expectedPhoneCountry, selectedCountryIso('recoveryCountry'));
  });
  if(!matched) { box.innerHTML='<div class="alert alert-danger">لا يوجد بيانات مسجلة بهذا الشكل</div>'; return; }
  const now=Date.now(), signature=[role,normalizeRecoveryText(name),nid,phone].join('|');
  if(signature === lastRecoverySignature && now-lastRecoveryAt < 30000) { box.innerHTML='<div class="alert alert-info">تم تسجيل هذا الطلب بالفعل. يرجى الانتظار قبل إعادة المحاولة.</div>'; return; }
  lastRecoverySignature=signature; lastRecoveryAt=now;
  const time=new Date().toLocaleString('ar-EG');
  const roleLabel=role === 'student' ? 'طالب' : 'ولي أمر';
  const notification={id:'notification_'+now,type:'account_recovery',category:'استرجاع حساب',title:'طلب استرجاع حساب',message:'طلب استرجاع حساب '+roleLabel+' باسم '+name,role:role,roleLabel:roleLabel,name:name,nationalId:nid,identityCountry:selectedCountryIso('recoveryIdentityCountry'),phone:phone,phoneCountry:selectedCountryIso('recoveryCountry'),time:time,createdAt:new Date().toISOString(),read:false};
  const notifications=getData('notifications', []); notifications.unshift(notification); setData('notifications',notifications);
  const message='طلب استرجاع حساب في منصة ثمار\nنوع الحساب: '+roleLabel+'\nالاسم: '+name+'\nالرقم القومي: '+nid+'\nرقم الهاتف الدولي: +'+phone+'\nوقت الطلب: '+time+'\n\nيرجى مراجعة البيانات والتواصل مع صاحب الحساب لتعيين رقم سري جديد.';
  const link=buildWaLink(getAdminWhatsapp(),message,getAdminWhatsappCountry());
  box.innerHTML='<div class="alert alert-success">تم إرسال طلب استرجاع الحساب إلى المسؤول. <a href="'+link+'" target="_blank" rel="noopener noreferrer"><strong>فتح الرسالة الجاهزة على واتساب</strong></a></div>';
  if(link) window.open(link,'_blank','noopener');
}
function getUnreadNotificationsCount() { return getData('notifications', []).filter(function(item){return !item.read}).length; }
function updateNotificationBadges() {
  const count=getUnreadNotificationsCount();
  document.querySelectorAll('[data-notification-count]').forEach(function(badge){ badge.textContent=String(count); badge.hidden=count===0; });
}
function notificationTypeLabel(type) {
  return {account_recovery:'استرجاع حساب',false_alarm:'إنذار خاطئ',violation:'مخالفة',general:'تنبيه عام'}[type] || 'تنبيه عام';
}
function renderNotifications() {
  const list=document.getElementById('notificationsList'); if(!list) return;
  const notifications=getData('notifications', []);
  updateNotificationBadges();
  if(!notifications.length) { list.innerHTML='<div class="alert alert-info">لا توجد تنبيهات حتى الآن.</div>'; return; }
  list.innerHTML=notifications.map(function(item){
    const details=item.type==='account_recovery' ? '<dl class="notification-details"><div><dt>نوع الحساب</dt><dd>'+escapeHtml(item.roleLabel||'')+'</dd></div><div><dt>الاسم</dt><dd>'+escapeHtml(item.name||'')+'</dd></div><div><dt>الرقم القومي</dt><dd>'+escapeHtml(item.nationalId||'')+'</dd></div><div><dt>الهاتف</dt><dd dir="ltr">+'+escapeHtml(item.phone||'')+'</dd></div></dl>' : '';
    return '<article class="notification-card '+(item.read?'is-read':'is-unread')+'"><div class="notification-card-head"><div><span class="badge badge-primary">'+notificationTypeLabel(item.type)+'</span><h3>'+escapeHtml(item.title||'تنبيه')+'</h3></div><span class="notification-status">'+(item.read?'مقروء':'غير مقروء')+'</span></div><p>'+escapeHtml(item.message||'')+'</p>'+details+'<div class="notification-card-footer"><time>'+escapeHtml(item.time||'')+'</time>'+(item.read?'':'<button class="btn btn-xs btn-outline" onclick="markNotificationRead(\''+item.id+'\')">تحديد كمقروء</button>')+'</div></article>';
  }).join('');
}
function openNotifications() { showPage('notificationsPage'); renderNotifications(); }
function markNotificationRead(id) { const items=getData('notifications', []); const item=items.find(function(entry){return entry.id===id}); if(item){item.read=true;setData('notifications',items)} renderNotifications(); }
function markAllNotificationsRead() { const items=getData('notifications', []).map(function(item){return Object.assign({},item,{read:true})}); setData('notifications',items); renderNotifications(); }

function startSignup() {
  signupState = { method: null, email: '', name: '', whats: '', whatsCountry: 'EG', code: '', verified: false };
  ['signupWhats','signupCode','signupName','signupNid','signupPhone','signupNotes','signupRelationshipName'].forEach(function(id){ const el = document.getElementById(id); if(el) el.value = ''; });
  const identityCountry = document.getElementById('signupIdentityCountry'); if(identityCountry) { identityCountry.value = 'EG'; identityCountry.dataset.countryIso = 'EG'; }
  const phoneCountry = document.getElementById('signupPhoneCountry'); if(phoneCountry) { phoneCountry.value = 'EG'; phoneCountry.dataset.countryIso = 'EG'; }
  const whatsCountry = document.getElementById('signupWhatsCountry'); if(whatsCountry) { whatsCountry.value = 'EG'; whatsCountry.dataset.countryIso = 'EG'; }
  const recoveryIdentityCountry = document.getElementById('recoveryIdentityCountry'); if(recoveryIdentityCountry) { recoveryIdentityCountry.value = 'EG'; recoveryIdentityCountry.dataset.countryIso = 'EG'; }
  const adminMobileCountry = document.getElementById('adminMobileCountry'); if(adminMobileCountry) { adminMobileCountry.value = 'EG'; adminMobileCountry.dataset.countryIso = 'EG'; }
  syncSignupRelationshipField();
  updateSignupInternationalNumber('signupPhone','signupPhoneCountry','signupPhoneInternational');
  updateSignupInternationalNumber('signupWhats','signupWhatsCountry','signupWhatsInternational');
  document.getElementById('signupGoogleBox').style.display = 'none';
  document.getElementById('signupPhoneBox').style.display = 'none';
  const gc = document.getElementById('googleBtnContainer'); if(gc) gc.innerHTML = '';
  document.getElementById('signupVerifyBox').classList.add('hidden');
  document.getElementById('signupStep1Alert').innerHTML = '';
  document.getElementById('signupMethodGoogleBtn').classList.remove('btn-primary');
  document.getElementById('signupMethodPhoneBtn').classList.remove('btn-primary');
  showPage('signupStep1');
}
function setSignupMethod(method) {
  signupState.method = method;
  const g = document.getElementById('signupMethodGoogleBtn');
  const p = document.getElementById('signupMethodPhoneBtn');
  g.classList.toggle('btn-primary', method === 'google');
  p.classList.toggle('btn-primary', method === 'phone');
  document.getElementById('signupGoogleBox').style.display = method === 'google' ? 'block' : 'none';
  document.getElementById('signupPhoneBox').style.display = method === 'phone' ? 'block' : 'none';
  document.getElementById('signupVerifyBox').classList.add('hidden');
  document.getElementById('signupStep1Alert').innerHTML = '';
  if(method === 'google') renderGoogleButton();
}
function sendSignupCode() {
  const box = document.getElementById('signupStep1Alert');
  const whatsRaw = document.getElementById('signupWhats').value.trim();
  const whatsCountry = selectedCountryIso('signupWhatsCountry');
  const whats = getInternationalNumber('signupWhats','signupWhatsCountry');
  if(signupState.method !== 'phone') { box.innerHTML = '<div class="alert alert-danger">❌ اختر التسجيل برقم الهاتف أولاً</div>'; return; }
  if(!whatsRaw || !validatePhoneField('signupWhatsCountry','signupWhats',true)) { box.innerHTML = '<div class="alert alert-danger">❌ أدخل رقم واتساب صحيح وفق الدولة المختارة</div>'; return; }
  signupState.email = '';
  signupState.whats = whats;
  signupState.whatsCountry = whatsCountry;
  signupState.code = String(Math.floor(100000 + Math.random() * 900000));
  const adminWa = getAdminWhatsapp();
  const text = 'طلب كود تحقق لحساب جديد في نظام إدارة الطلاب\n'
    + 'رقم واتساب مقدّم الطلب: ' + whats + '\n'
    + 'كود التحقق: ' + signupState.code + '\n'
    + 'يرجى إرسال هذا الكود لمقدّم الطلب لإكمال التسجيل.';
  const link = buildWaLink(adminWa, text, getAdminWhatsappCountry());
  document.getElementById('signupVerifyBox').classList.remove('hidden');
  box.innerHTML = '<div class="alert alert-info">📩 تم تجهيز رسالة التحقق لإرسالها إلى المسؤول (' + adminWa + '). <a href="' + link + '" target="_blank" rel="noopener noreferrer"><strong>اضغط هنا لإرسال الكود إلى واتساب المسؤول</strong></a> ثم أدخل الكود بالأسفل بعد استلام من المسؤول.</div>';
  window.open(link, '_blank', 'noopener');
}
function verifySignupCode() {
  const box = document.getElementById('signupStep1Alert');
  const code = document.getElementById('signupCode').value.trim();
  if(!signupState.code) { box.innerHTML = '<div class="alert alert-danger">❌ أرسل كود التحقق أولاً</div>'; return; }
  if(code !== signupState.code) { box.innerHTML = '<div class="alert alert-danger">❌ الكود غير صحيح، تأكد من الرسالة أو أعد الإرسال</div>'; return; }
  signupState.verified = true;
  box.innerHTML = '';
  document.getElementById('signupVerifiedNote').innerHTML = '✅ تم التحقق من هويتك بنجاح — ' + (signupState.method === 'google' ? 'حساب جوجل: ' + signupState.email : 'رقم الواتساب: ' + signupState.whats);
  const verifiedPhone = document.getElementById('signupPhone');
  if(verifiedPhone && signupState.whats && !verifiedPhone.value) {
    setCountrySelectorValue('signupPhoneCountry', signupState.whatsCountry || 'EG');
    verifiedPhone.value = localPhoneFromInternational(signupState.whats, signupState.whatsCountry || 'EG');
    updateSignupInternationalNumber('signupPhone','signupPhoneCountry','signupPhoneInternational');
  }
  initSignupJuzSelect();
  showPage('signupStep2');
}
function initSignupJuzSelect() {
  const select = document.getElementById('signupJuz');
  let html = '<option value="">اختر الجزء...</option>';
  for(let i = 1; i <= 30; i++) html += '<option value="' + i + '">الجزء ' + i + '</option>';
  select.innerHTML = html;
  document.getElementById('signupSurah').innerHTML = '<option value="">اختر الجزء أولاً...</option>';
}
function updateSignupSurahSelect() {
  const juz = document.getElementById('signupJuz').value;
  const select = document.getElementById('signupSurah');
  if(!juz || !quranData[juz]) { select.innerHTML = '<option value="">اختر الجزء أولاً...</option>'; return; }
  let html = '<option value="">اختر السورة...</option>';
  quranData[juz].forEach(function(s){ html += '<option value="' + s + '">' + s + '</option>'; });
  select.innerHTML = html;
}
function submitSignupRequest() {
  const box = document.getElementById('signupStep2Alert');
  if(!signupState.verified) { box.innerHTML = '<div class="alert alert-danger">❌ يجب التحقق من الهوية أولاً</div>'; return; }
  const role = document.getElementById('signupRole').value;
  const name = document.getElementById('signupName').value.trim();
  const relationshipName = document.getElementById('signupRelationshipName').value.trim();
  const nid = normalizeIdentityInput(document.getElementById('signupNid').value);
  const identityCountry = selectedCountryIso('signupIdentityCountry');
  const phoneCountry = selectedCountryIso('signupPhoneCountry');
  const phone = getInternationalNumber('signupPhone','signupPhoneCountry');
  const juz = document.getElementById('signupJuz').value;
  const surah = document.getElementById('signupSurah').value;
  const notes = document.getElementById('signupNotes').value.trim();
  const signupValidation = validateCountryFields('signupIdentityCountry','signupNid','signupPhoneCountry','signupPhone');
  if(!name || !relationshipName || !signupValidation.identityValid || !signupValidation.phoneValid) { box.innerHTML = '<div class="alert alert-danger">❌ أدخل الاسم والبيانات المطلوبة وفق صيغة الدولة المختارة.</div>'; return; }
  const roleLabel = role === 'student' ? 'طالب' : 'ولي أمر';
  const time = new Date().toLocaleString('ar-EG');
  const details = '📋 طلب إنشاء حساب جديد\n'
    + 'نوع الحساب: ' + roleLabel + '\n'
    + 'الاسم: ' + name + '\n'
    + (role === 'student' ? 'اسم ولي الأمر: ' : 'اسم الطالب: ') + relationshipName + '\n'
    + 'الرقم القومي: ' + nid + '\n'
    + 'رقم الهاتف الدولي: +' + phone + '\n'
    + 'طريقة التسجيل: ' + (signupState.method === 'google' ? 'جوجل (' + signupState.email + ')' : 'رقم الهاتف / واتساب') + '\n'
    + (signupState.method === 'google' ? 'حساب جوجل المُوثّق: ' + signupState.email + '\n' : 'رقم ال��اتساب المُوثّق: ' + signupState.whats + '\n')
    + 'الجزء: ' + (juz ? 'الجزء ' + juz : 'غير محدد') + '\n'
    + 'السورة: ' + (surah || 'غير محددة') + '\n'
    + 'ملاحظات: ' + (notes || 'لا يوجد') + '\n'
    + 'وقت الطلب: ' + time;

  const requests = getData('joinRequests');
  requests.push({ id: 'jr' + Date.now(), role: role, name: name, guardianName: role === 'student' ? relationshipName : '', studentName: role === 'parent' ? relationshipName : '', relationshipName: relationshipName, nid: nid, identityCountry: identityCountry, nationalCountry: identityCountry, phone: phone, phoneCountry: phoneCountry, whats: signupState.whats, whatsCountry: signupState.whatsCountry || 'EG', email: signupState.email, method: signupState.method, juz: juz, surah: surah, notes: notes, status: 'pending', time: time });
  setData('joinRequests', requests);

  const msgs = getData('messages');
  msgs.push({ id: 'm' + Date.now(), type: 'join_request', sender: name + ' (' + roleLabel + ')', receiverType: 'admin', text: details.replace(/\n/g, '<br>'), time: time, read: false, joinRequest: true });
  setData('messages', msgs);

  const link = buildWaLink(getAdminWhatsapp(), details, getAdminWhatsappCountry());
  box.innerHTML = '<div class="alert alert-success">✅ تم إرسال طلبك للمسؤول على المنصة. <a href="' + link + '" target="_blank" rel="noopener noreferrer"><strong>اضغط هنا لإرسال نفس التفاصيل على واتساب المسؤول</strong></a></div>';
  window.open(link, '_blank', 'noopener');
  try{sessionStorage.removeItem('thimar_pending_google_signup')}catch(e){}
  if(typeof showToast === 'function') showToast('✅ تم إرسال طلب إنشاء الحساب للمسؤول', 'success');
}

function initEditJuzSelect(val) {
  const select = document.getElementById('editJuz');
  let html = '<option value="">اتر الجزء...</option>';
  for(let i=1; i<=30; i++) html += '<option value="'+i+'" '+(val==i?'selected':'')+'>الجزء '+i+'</option>';
  select.innerHTML = html;
}
function updateEditSurahSelect() {
  const juz = document.getElementById('editJuz').value;
  const select = document.getElementById('editSurah');
  const currentVal = select.value;
  if(!juz || !quranData[juz]) {
    select.innerHTML = '<option value="">اختر الجزء أولاً...</option>'; return;
  }
  let html = '<option value="">اخر السورة...</option>';
  quranData[juz].forEach(s => { html += '<option value="'+s+'" '+(currentVal===s?'selected':'')+'>'+s+'</option>'; });
  select.innerHTML = html;
}

// ====== UNIFIED AUDIO RECORDING CONTROLS ======
const activeAudioRecorders = {};
function registerAudioRecorder(key, recorder, stream, options) {
  const config = options || {};
  activeAudioRecorders[key] = { recorder, stream, statusId: config.statusId || '', pauseBtnId: config.pauseBtnId || '', elapsed: 0, startedAt: Date.now(), timer: null };
  const state = activeAudioRecorders[key];
  let pauseBtn = state.pauseBtnId ? document.getElementById(state.pauseBtnId) : null;
  if(!pauseBtn && config.buttonId){const mainBtn=document.getElementById(config.buttonId);if(mainBtn){pauseBtn=document.createElement('button');pauseBtn.type='button';pauseBtn.className='btn btn-xs btn-secondary';pauseBtn.textContent='إيقاف مؤقت';pauseBtn.onclick=function(){toggleAudioPause(key)};mainBtn.insertAdjacentElement('afterend',pauseBtn)}}
  if(pauseBtn) { pauseBtn.disabled = false; pauseBtn.textContent = 'إيقاف مؤقت'; state.pauseButton=pauseBtn; }
  state.timer = setInterval(function(){
    if(recorder.state === 'recording') state.elapsed += 250;
    if(config.timerId) { const el=document.getElementById(config.timerId); if(el){const total=Math.floor(state.elapsed/1000);el.textContent=String(Math.floor(total/60)).padStart(2,'0')+':'+String(total%60).padStart(2,'0');} }
    if(config.maxMs && state.elapsed >= config.maxMs && recorder.state !== 'inactive') recorder.stop();
  },250);
  recorder.addEventListener('stop', function(){
    clearInterval(state.timer); if(stream) stream.getTracks().forEach(function(t){t.stop()});
    if(pauseBtn) { pauseBtn.disabled = true; pauseBtn.textContent = 'إيقاف مؤقت'; if(!state.pauseBtnId)pauseBtn.remove(); }
    delete activeAudioRecorders[key];
  }, {once:true});
}
function toggleAudioPause(key) {
  const state=activeAudioRecorders[key]; if(!state) return;
  const recorder=state.recorder, btn=state.pauseBtnId?document.getElementById(state.pauseBtnId):null, status=state.statusId?document.getElementById(state.statusId):null;
  if(typeof recorder.pause!=='function' || typeof recorder.resume!=='function'){ if(status)status.textContent='المتصفح لا يدعم الإيقاف المؤقت'; return; }
  if(recorder.state==='recording'){ recorder.pause(); if(btn)btn.textContent='استكمال التسجيل'; if(status)status.textContent='التسجيل متوقف مؤقتاً'; }
  else if(recorder.state==='paused'){ recorder.resume(); if(btn)btn.textContent='إيقاف مؤقت'; if(status)status.textContent='تم استكمال التسجيل...'; }
}
function stopAudioRecorder(key){const state=activeAudioRecorders[key];if(state&&state.recorder.state!=='inactive')state.recorder.stop()}
function audioBlobToBase64(blob){return new Promise(function(resolve,reject){const reader=new FileReader();reader.onload=function(){resolve(String(reader.result).split(',')[1]||'')};reader.onerror=reject;reader.readAsDataURL(blob)})}
function normalizeArabicMatch(value){return String(value||'').normalize('NFKD').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').replace(/[\u064B-\u065F\s_-]/g,'').toLowerCase()}
function applyStudentVoiceFields(fields){
  const map={name:'stName',username:'stUsername',national:'stNational',phone:'stPhone',birth:'stBirth',studentPass:'stStudentPass',parent:'stParent',parentPass:'stParentPass',notes:'stNotes'},filled=[];
  Object.keys(map).forEach(function(key){if(fields[key]){const el=document.getElementById(map[key]);if(el){el.value=fields[key];filled.push(key)}}});
  if(fields.birth) calcAge();
  if(Array.isArray(fields.subjects)&&fields.subjects.length){const select=document.getElementById('stSubject'),wanted=fields.subjects.map(normalizeArabicMatch);Array.from(select.options).forEach(function(opt){const subjectName=normalizeArabicMatch(opt.textContent.split(' - ')[0]);opt.selected=wanted.some(function(x){return subjectName.includes(x)||x.includes(subjectName)})});toggleQuranFields();filled.push('subjects')}
  if(fields.juz){document.getElementById('stJuz').value=fields.juz;updateSurahSelect();filled.push('juz')}
  if(fields.surah){const select=document.getElementById('stSurah'),wanted=normalizeArabicMatch(fields.surah),option=Array.from(select.options).find(function(o){return normalizeArabicMatch(o.textContent)===wanted||normalizeArabicMatch(o.textContent).includes(wanted)});if(option){select.value=option.value;filled.push('surah')}}
  return filled;
}
let studentIntakeRecorder=null, studentIntakeChunks=[], studentIntakeLastBlob=null;
let studentSpeechRecognition=null, studentSpeechListening=false;
const studentSpeechFields={name:'stName',username:'stUsername',national:'stNational',phone:'stPhone',birth:'stBirth',parent:'stParent',notes:'stNotes'};
function speechLanguage(){return typeof currentLang!=='undefined'&&currentLang==='en'?'en-US':'ar-EG'}
function cleanSpeechText(value){return String(value||'').replace(/[<>]/g,'').replace(/[\\u0000-\\u001F\\u007F]/g,'').trim().slice(0,2000)}
function spokenDigits(value){
  const map={'صفر':'0','واحد':'1','واحدة':'1','اثنان':'2','اثنين':'2','اثنتان':'2','ثلاثة':'3','ثلاث':'3','أربعة':'4','اربعة':'4','أربع':'4','خمسة':'5','خمس':'5','ستة':'6','ست':'6','سبعة':'7','سبع':'7','ثمانية':'8','ثمان':'8','تسعة':'9','تسع':'9'};
  let text=String(value||'').replace(/[٠-٩]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'.indexOf(d)});
  Object.keys(map).sort(function(a,b){return b.length-a.length}).forEach(function(word){text=text.replace(new RegExp('(?:^|\\s)'+word+'(?=\\s|$)','g'),map[word])});
  return text.replace(/[^0-9]/g,'');
}
function parseStudentSpeech(text){
  const clean=cleanSpeechText(text), result={};
  const labels={name:['اسم الطالب','الاسم','student name','name'],username:['اسم المستخدم','username','user name'],national:['الرقم القومي','الرقم القومى','national id'],phone:['رقم الهاتف','الهاتف','phone number','phone'],birth:['تاريخ الميلاد','birth date','date of birth'],parent:['اسم ولي الأمر','ولي الأمر','ولي الامر','parent name','guardian name'],notes:['ملاحظات','notes']};
  const all=Object.keys(labels).reduce(function(a,k){return a.concat(labels[k])},[]).sort(function(a,b){return b.length-a.length});
  const pattern=all.map(function(x){return x.replace(/[.*+?^${}()|[\\]\\\\]/g,'\\\\$&')}).join('|');
  const re=new RegExp('(?:'+pattern+')\\s*[:：-]?\\s*([\\s\\S]*?)(?=\\s+(?:'+pattern+')\\s*[:：-]?|$)','gi'); let match;
  while((match=re.exec(clean))){const label=match[0].slice(0,match[0].length-match[1].length).replace(/[:：-]?\\s*$/,'').trim();const key=Object.keys(labels).find(function(k){return labels[k].some(function(x){return normalizeArabicMatch(x)===normalizeArabicMatch(label)})});if(key&&!result[key])result[key]=match[1].trim().replace(/[،,؛;]+$/,'')}
  if(result.national)result.national=spokenDigits(result.national);
  if(result.phone)result.phone=spokenDigits(result.phone);
  return {text:clean,fields:result};
}
function renderStudentSpeechPreview(parsed,filled){
  const box=document.getElementById('studentIntakeResult'); if(!box)return;
  const labels={name:'اسم الطالب',username:'اسم المستخدم',national:'الرقم القومي',phone:'رقم الهاتف',birth:'تاريخ الميلا',parent:'اسم ولي الأمر',notes:'الماحظات'};
  const rows=Object.keys(parsed.fields).map(function(k){return '<div>✓ '+escapeHtml(labels[k]||k)+': <strong>'+escapeHtml(parsed.fields[k])+'</strong></div>'}).join('');
  box.innerHTML='<div class="alert alert-success">تم التعرف على النص. راجع الخانات قبل احفظ اليدوي.<br>'+rows+'<small>النص الكامل: '+escapeHtml(parsed.text)+'</small></div>';
}
function speechErrorMessage(error){const code=error&&error.error;if(code==='not-allowed'||code==='service-not-allowed')return currentLang==='en'?'Microphone permission was denied.':'تم رفض إذن الميكروفون.';if(code==='no-speech')return currentLang==='en'?'No speech was detected. Try again.':'لم يتم ال��عرف على الصوت، حاول مرة أخرى.';if(code==='audio-capture')return currentLang==='en'?'No microphone was found.':'لم يتم العثور على ميكروفون.';return currentLang==='en'?'Voice input is unavailable in this browser.':'الإدخال الصوتي غير متاح في هذا المتصفح.'}
function stopStudentSpeech(){if(studentSpeechRecognition){try{studentSpeechRecognition.stop()}catch(e){}}studentSpeechListening=false;const btn=document.getElementById('studentSpeechBtn');if(btn){btn.disabled=false;btn.setAttribute('aria-pressed','false');btn.textContent='🎤 إدخال البيانات بالصوت'}const status=document.getElementById('studentSpeechStatus');if(status)status.textContent='تم التعرف'}
function toggleStudentSpeech(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition, btn=document.getElementById('studentSpeechBtn'), status=document.getElementById('studentSpeechStatus'), transcript=document.getElementById('studentSpeechTranscript');
  if(studentSpeechListening){stopStudentSpeech();return}
  if(!Recognition){
    if(status)status.textContent=currentLang==='en'?'Browser speech recognition is unavailable; recording fallback is ready.':'التعرف المباشر غير متاح؛ سيتم استخدام التسجي الصوتي كبديل آمن.';
    if(transcript){transcript.classList.remove('hidden');transcript.textContent=currentLang==='en'?'Press the recording button below, then analyze the same recording.':'اضغط زر التسجيل بالأسفل، ثم حلّل التسجيل نفسه.'}
    const recorderBtn=document.getElementById('studentIntakeRecordBtn');
    if(recorderBtn){recorderBtn.focus();}
    return;
  }
  const recognition=new Recognition();studentSpeechRecognition=recognition;recognition.lang=speechLanguage();recognition.continuous=false;recognition.interimResults=true;recognition.maxAlternatives=1;
  let finalText='';studentSpeechListening=true;if(btn){btn.disabled=false;btn.setAttribute('aria-pressed','true');btn.textContent='🔴 إيقاف الاستماع'}if(status)status.textContent='جاري الاستماع...';if(transcript){transcript.classList.remove('hidden');transcript.textContent=''}
  recognition.onresult=function(event){let interim='';for(let i=event.resultIndex;i<event.results.length;i++){const value=cleanSpeechText(event.results[i][0].transcript);if(event.results[i].isFinal)finalText+=' '+value;else interim+=' '+value}if(transcript)transcript.textContent=(finalText+' '+interim).trim()};
  recognition.onerror=function(event){if(transcript&&event.error!=='aborted')transcript.textContent=speechErrorMessage(event);if(status)status.textContent=speechErrorMessage(event);studentSpeechListening=false;if(btn){btn.setAttribute('aria-pressed','false');btn.textContent='🎤 إدخال البيانات بالصوت'}};
  recognition.onend=function(){studentSpeechListening=false;if(btn){btn.setAttribute('aria-pressed','false');btn.textContent='🎤 إدخال البيانات بالصوت'}const parsed=parseStudentSpeech(finalText);if(!parsed.text){if(status)status.textContent='لم يتم التعرف على الصوت، حاول مرة أخرى.';return}const filled=applyStudentVoiceFields(parsed.fields);renderStudentSpeechPreview(parsed,filled);if(status)status.textContent=filled.length?'تم التعرف ومراجعة البيانات':'تم التعرف على النص، راجع الخانات يدوياً'};
  try{recognition.start()}catch(e){studentSpeechListening=false;if(status)status.textContent='تعذر بدء الإدخال الصوتي.';if(btn){btn.disabled=false;btn.setAttribute('aria-pressed','false')}}
}
async function retryStudentIntakeAnalysis(){
  const blob=studentIntakeLastBlob, status=document.getElementById('studentIntakeStatus'), result=document.getElementById('studentIntakeResult');
  if(!blob||!result)return;
  if(status)status.textContent='جاري إعادة تحليل التسجيل المحفوظ...';
  try{
    const audio=await voiceAudioPayload(blob),data=await callStudentAI('student_voice_intake',{role:'admin',audioBase64:audio.audioBase64,mimeType:audio.mimeType},0.05),filled=applyStudentVoiceFields(data.fields||{});
    if(!filled.length)throw new Error('لم أتعرف على بيانات واضحة من التسجيل المحفوظ.');
    result.innerHTML='<div class="alert alert-success">تم ملء '+filled.length+' خانة من التسجيل المحفوظ.<br><small>النص المسموع: '+escapeHtml(data.transcript||'لم يُرجع تفريغاً')+'</small></div>';
    if(status)status.textContent='أكمل التحليل';
  }catch(e){result.innerHTML='<div class="alert alert-danger">تعذر إعادة تحليل التسجيل: '+escapeHtml(e.message||'خطأ غير معروف')+'<br><button type="button" class="btn btn-sm btn-primary" onclick="retryStudentIntakeAnalysis()">إعادة تحليل نفس التسجيل</button></div>';if(status)status.textContent='فشل التحليل';}
}
function preferredRecorderMimeType(){
  if(typeof MediaRecorder==='undefined')return '';
  const types=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4','audio/webm'];
  return types.find(function(type){return typeof MediaRecorder.isTypeSupported!=='function'||MediaRecorder.isTypeSupported(type)})||'';
}
function microphoneErrorMessage(error){
  if(!window.isSecureContext)return 'يلزم فتح الموقع عبر اتصال آمن HTTPS لاستخدام الميكروفون.';
  if(error&&['NotAllowedError','SecurityError'].includes(error.name))return 'تم رفض إذن الميكروفون. اسمح بالوصول من إعدادات المتصفح ثم أعد المحاولة.';
  if(error&&error.name==='NotFoundError')return 'لم يتم العثور على ميكروفون متصل بالجهاز.';
  if(error&&error.name==='NotReadableError')return 'الميكروفون مستخدم في تطبيق آخر أو تعذر تشغيله.';
  return 'تعذر تشغيل الميكروفون. تحقق من الإذن ثم أعد المحاولة.';
}
async function toggleStudentIntakeRecord(){
  const btn=document.getElementById('studentIntakeRecordBtn'),status=document.getElementById('studentIntakeStatus'),preview=document.getElementById('studentIntakePreview'),result=document.getElementById('studentIntakeResult');
  if(!btn||!status||!preview||!result)return;
  if(studentIntakeRecorder&&studentIntakeRecorder.state!=='inactive'){stopAudioRecorder('student-intake');btn.disabled=true;status.textContent='جاري تجهيز اتسجيل...';return}
  if(typeof MediaRecorder==='undefined'){status.textContent='هذا المتصفح لا يدعم التسجيل الصوتي. استخدم إصداراً حديثاً من Chrome أو Safari.';return}
  try{
    const stream=await safeGetMic(),mimeType=preferredRecorderMimeType();studentIntakeChunks=[];studentIntakeRecorder=mimeType?new MediaRecorder(stream,{mimeType: mimeType}):new MediaRecorder(stream);
    const recorder=studentIntakeRecorder;
    recorder.ondataavailable=function(e){if(e.data.size)studentIntakeChunks.push(e.data)};
    recorder.onerror=function(){status.textContent='حدث خطأ أثناء التسجيل. أعد المحاولة.'};
    recorder.onstop=async function(){
      const blob=new Blob(studentIntakeChunks,{type:recorder.mimeType||mimeType||'audio/webm'});studentIntakeLastBlob=blob;studentIntakeChunks=[];
      try{
        if(blob.size<1500)throw new Error('التسجيل قصير أو فارغ. تحدث بوضوح لعدة ثوانٍ ثم أعد المحاولة.');
        if(blob.size>2800000)throw new Error('حجم التسجيل كبير جداً للإرسال الآمن. اجعله أقصر من دقيقة ونصف ثم أعد المحاولة.');
        if(preview.src&&preview.src.startsWith('blob:'))URL.revokeObjectURL(preview.src);
        preview.src=URL.createObjectURL(blob);preview.style.display='block';status.textContent='جاري فهم بيانات الطالب...';result.innerHTML='';
        const audio=await voiceAudioPayload(blob),data=await callStudentAI('student_voice_intake',{role:'admin',audioBase64:audio.audioBase64,mimeType:audio.mimeType},0.05),filled=applyStudentVoiceFields(data.fields||{});
        if(!filled.length)throw new Error('لم أتعرف على بيانات واضحة. اذكر اسم كل خانة ثم قيمتها ببطء.');
        result.innerHTML='<div class="alert alert-success">تم ملء '+filled.length+' خانة. راجع جميع البيانات قبل الحفظ.<br><small>النص المسموع: '+escapeHtml(data.transcript||'لم يُرجع تفريغاً')+'</small></div>';status.textContent='اكتمل التحليل';
      }catch(e){result.innerHTML='<div class="alert alert-danger">تعذر تحليل التسجيل: '+escapeHtml(e.message||'خطأ غير معروف')+'<br><button type="button" class="btn btn-sm btn-primary" onclick="retryStudentIntakeAnalysis()">إعادة تحليل نفس التسجيل</button><button type="button" class="btn btn-sm btn-secondary" onclick="toggleStudentIntakeRecord()">تسجيل جديد</button></div>';status.textContent='فشل التحليل';}
      finally{btn.disabled=false;btn.textContent='إعادة التسجيل';studentIntakeRecorder=null;}
    };
    recorder.start(1000);registerAudioRecorder('student-intake',recorder,stream,{statusId:'studentIntakeStatus',pauseBtnId:'studentIntakePauseBtn',timerId:'studentIntakeTimer',maxMs:120000});btn.textContent='إنهاء وتحليئ';status.textContent='جاري التسجيل... حدث بوضوح واذكر اسم كل خانة قبل قيمتها.';
  }catch(e){btn.disabled=false;studentIntakeRecorder=null;status.textContent=microphoneErrorMessage(e)}
}

// ====== VOICE RECORDING (20 seconds) ======
async function toggleVoiceRecord() {
  const btn = document.getElementById('voiceRecordBtn');
  const status = document.getElementById('voiceRecordStatus');
  const preview = document.getElementById('voicePreview');
  if(!btn || !status || !preview) return;
  if(mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop(); 
    btn.classList.remove('recording'); 
    status.textContent = 'تم التسجيل ✅'; 
    return;
  }
  const allowMic = confirm('🔴 يرجى السماح للموقع بالوصول إلى الميكروفون لتسجءءل البصمة الصوتية.\n\nاضغط "موافق" ثم اختر "السماح" في نافذة المتصفح.');
  if(!allowMic) { status.textContent = 'تم إلغاء التسجيل ❌'; return; }
  try {
    const stream = await safeGetMic();
    mediaRecorder = new MediaRecorder(stream); 
    voiceChunks = [];
    mediaRecorder.ondataavailable = e => { if(e.data.size > 0) voiceChunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      voiceBlob = new Blob(voiceChunks, { type: 'audio/webm' });
      preview.src = URL.createObjectURL(voiceBlob); 
      preview.style.display = 'block';
      stream.getTracks().forEach(t => t.stop());
      status.textContent = '🤖 جميناي يحلل البصمة الصوتية...';
  try {
  voiceProfileGemini = await geminiVoiceProfile(voiceBlob);
  voiceFingerprint = null;
  voiceDataUrl = await blobToDataURL(voiceBlob);
  status.textContent = 'تم إنشاء البصمة الصوتية بواسطة Gemini';
  showToast('أنشأ Gemini البصمة الصوتية بنجاح', 'success');
  } catch(e) {
  voiceProfileGemini = null; voiceFingerprint = null; voiceDataUrl = null;
  status.textContent = 'تعذّر تحليل الصوت بواسطة Gemini';
  showToast((e&&e.message)||'تعذّر اتصال Gemini — أعد التسجيل', 'error');
  }
    };
    mediaRecorder.start();
    registerAudioRecorder('student-fingerprint',mediaRecorder,stream,{statusId:'voiceRecordStatus',buttonId:'voiceRecordBtn',maxMs:20000});
    btn.classList.add('recording'); 
    status.textContent = 'جاري التسجيل... (20 ثانية فعلية)';
  } catch(err) { alert('لا يمكن الوصول للميكروفون. يرجى السماح بالوصول.'); }
}

const DEFAULT_ADMIN_WHATSAPP = '201554542019';
function getAdminWhatsapp() {
  const value = getData('adminWhatsapp', '');
  const raw = typeof value === 'object' ? String(value.phone || '') : String(value || '');
  const num = raw.replace(/\D/g, '');
  return num ? normalizeWaNumber(num, getAdminWhatsappCountry()) : DEFAULT_ADMIN_WHATSAPP;
}
function getAdminWhatsappCountry() {
  const value = getData('adminWhatsappCountry', 'EG');
  const country = typeof value === 'object' ? (value.iso2 || value.country || value.code) : value;
  return countryRuleForValue(country)?.iso2 || 'EG';
}
function saveAdminWhatsapp() {
  const input = document.getElementById('adminWhatsInput');
  const box = document.getElementById('adminsAlert');
  const country = selectedCountryIso('adminWhatsappCountry');
  const local = normalizeLocalPhoneInput(input?.value || '');
  if(!validatePhoneField('adminWhatsappCountry','adminWhatsInput',true)) { box.innerHTML = '<div class="alert alert-danger">❌ أدخل رقم واتساب بطول صحيح للدولة المختارة</div>'; return; }
  const international = getInternationalNumber('adminWhatsInput','adminWhatsappCountry');
  setData('adminWhatsapp', international);
  setData('adminWhatsappCountry', country);
  if(input) input.value = local;
  box.innerHTML = '<div class="alert alert-success">✅ تم حفظ رقم واتساب المسؤول: +' + international + '</div>';
}


function renderAdmins() {
  const whatsInput = document.getElementById('adminWhatsInput');
  const whatsCountry = document.getElementById('adminWhatsappCountry');
  const configuredCountry = getAdminWhatsappCountry();
  if(whatsCountry) setCountrySelectorValue('adminWhatsappCountry', configuredCountry);
  if(whatsInput) whatsInput.value = localPhoneFromInternational(getAdminWhatsapp(), configuredCountry);
  const admins = getData('admins');
  let html = '<table><thead><tr><th>#</th><th>رقم الموبايل</th><th>الرقم السري</th><th>النوع</th><th>التحكم</th></tr></thead><tbody>';
  admins.forEach((a, i) => {
    html += '<tr><td>'+(i+1)+'</td><td>'+a.mobile+'</td><td><code style="background:var(--table-header); padding:4px 10px; border-radius:5px;">'+a.password+'</code></td><td>'+(a.isMain ? '<span class="badge badge-warning">رئيسي</span>' : '<span class="badge badge-primary">فرعي</span>')+'</td><td>'+(!a.isMain ? '<button class="btn btn-xs btn-info" onclick="editAdmin('+a.id+')">تعديل</button> <button class="btn btn-xs btn-danger" onclick="deleteAdmin('+a.id+')">حذف</button>' : '<span style="color:var(--text-light)">غير قابل للتعديل</span>')+'</td></tr>';
  });
  html += '</tbody></table>';
  document.getElementById('adminsTable').innerHTML = html;
}

function addAdmin() {
  const mobile = normalizeLocalPhoneInput(document.getElementById('newAdminMobile').value);
  const mobileCountry = selectedCountryIso('newAdminMobileCountry');
  const pass = document.getElementById('newAdminPass').value.trim();
  const type = document.getElementById('newAdminType').value;
  if(!mobile || !pass) return alert('يرجى ملء جميع الحقول');
  if(!validatePhoneField('newAdminMobileCountry','newAdminMobile',true)) return alert('رقم الموبايل يجب أن يطابق الدولة المختارة');
  const international = normalizeWaNumber(mobile, mobileCountry);
  const admins = getData('admins');
  if(admins.find(a => normalizeWaNumber(a.mobile, a.mobileCountry || 'EG') === international)) return alert('هذا الرقم مسجل مسبقاً');
  admins.push({id: Date.now(), mobile, mobileCountry, password: pass, isMain: type === 'main'});
  setData('admins', admins);
  document.getElementById('newAdminMobile').value = '';
  document.getElementById('newAdminPass').value = '';
  renderAdmins();
  alert('تم إضافة المسؤول بنجاح');
}

function editAdmin(id) {
  const admins = getData('admins');
  const a = admins.find(x => x.id === id);
  if(!a) return;
  const country = a.mobileCountry || 'EG';
  const currentMobile = localPhoneFromInternational(a.mobile, country);
  const newMobile = prompt('ر��م الموبايل الجديد (بدون رمز الدولة):', currentMobile);
  if(newMobile === null) return;
  const newPass = prompt('الرقم السري الجديد:', a.password);
  if(newPass === null) return;
  const newType = confirm('هل تريد جعله مسؤولاً رئيسياً (موافق = رئيسي، إلغاء = فرعي)');
  const normalizedMobile = normalizeLocalPhoneInput(newMobile);
  if(!normalizedMobile || !countryRuleForValue(country).phoneLengths.includes(normalizedMobile.length)) return alert('رقم الموبايل يجب أن يطابق الدولة المختارة');
  const international = normalizeWaNumber(normalizedMobile, country);
  if(admins.find(x => x.id !== id && normalizeWaNumber(x.mobile, x.mobileCountry || 'EG') === international)) return alert('هذا الرقم مسجل لمسؤول آخر');
  a.mobile = normalizedMobile; a.mobileCountry = country; a.password = newPass; a.isMain = newType;
  setData('admins', admins); renderAdmins(); alert('تم التعديل بنجاح');
}

function deleteAdmin(id) {
  if(!confirm('هل أنت متأكد من حذف هذا المسؤول؟')) return;
  let admins = getData('admins');
  admins = admins.filter(a => a.id !== id);
  setData('admins', admins); renderAdmins();
}

function adminLogin() {
  const mobile = normalizeLocalPhoneInput(document.getElementById('adminMobile').value);
  const mobileCountry = selectedCountryIso('adminMobileCountry');
  const pass = document.getElementById('adminPass').value;
  const admins = getData('admins');
  const international = normalizeWaNumber(mobile, mobileCountry);
  const admin = admins.find(a => normalizeWaNumber(a.mobile, a.mobileCountry || 'EG') === international && a.password === pass);
  if(admin) {
    currentUser = admin; currentType = 'admin'; currentAdminId = admin.id;
    saveSessionState();
    const devices = getData('devices');
    devices.push({type:'admin', user:mobile, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
    setData('devices', devices);
    document.getElementById('adminDeviceInfo').textContent = '📱 جهازك مسجل: ' + new Date().toLocaleString('ar-EG');
    showPage('adminDashboard');
    updateNotificationBadges();
    document.getElementById('adminLoginAlert').innerHTML = '';
  } else {
    document.getElementById('adminLoginAlert').innerHTML = '<div class="alert alert-danger">❌ رقم الوبايل أو الرقم السري غير صحيح</div>';
  }
}

// ====== شاشة القفل الموحدة: توجءءه لقائي للصفحة المناسبة ======
async function unifiedLogin() {
  const u = (document.getElementById('unifiedUser').value || '').trim();
  const p = (document.getElementById('unifiedPass').value || '').trim();
  const box = document.getElementById('unifiedLoginAlert');
  box.innerHTML = '';
  if(!u || !p) { box.innerHTML = '<div class="alert alert-danger">❌ أدخل اسم المستخدم والرقم السري</div>'; return; }
  if(!neonDataReady) {
  box.innerHTML = '<div class="alert alert-info">جارٍ التحقق من بيانات الدخول...</div>';
  try {
    const loginResponse = await fetch('/api/auth/password', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({username:u, password:p}) });
    const loginBody = await loginResponse.json().catch(function(){ return {}; });
    if(!loginResponse.ok) throw new Error(loginBody.error || 'login-failed');
    neonHydrationPromise = hydrateDataFromNeon();
    const ready = await neonHydrationPromise;
    if(!ready) throw new Error('cloud-load-failed');
  } catch(error) {
    const message = error && error.message === 'cloud-load-failed' ? 'تعذر تحميل بيانات الحساب من Neon. تحقق من الاتصال ثم أعد المحاولة.' : (error && error.message ? error.message : 'تعذر تسجيل الدخول');
    box.innerHTML = '<div class="alert alert-danger">'+message+'</div>';
    return;
  }
  }

  // 1) مسؤول (اسم المستخدم = رقم الموبايل، مع دعم رمز الدولة)
  const admin = getData('admins').find(a => normalizeWaNumber(a.mobile, a.mobileCountry || 'EG') === normalizeWaNumber(u, a.mobileCountry || 'EG') && a.password === p);
  if(admin) {
    currentUser = admin; currentType = 'admin'; currentAdminId = admin.id;
    pageHistory = []; saveSessionState();
    const devices = getData('devices');
    devices.push({type:'admin', user:u, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
    setData('devices', devices);
    showPage('adminDashboard');
    updateNotificationBadges();
    const di = document.getElementById('adminDeviceInfo');
    if(di) di.textContent = '📱 جهازك مسجل: ' + new Date().toLocaleString('ar-EG');
    document.getElementById('unifiedPass').value = '';
    showToast('✅ مرحباً بك في صفحة المسؤول', 'success');
    return;
  }

  const students = getData('students');

  // 2) طالب
  const st = students.find(x => x.username === u && x.studentPass === p);
  if(st) {
    currentUser = st; currentType = 'student'; currentAdminId = null;
    pageHistory = []; saveSessionState();
    const devices = getData('devices');
    devices.push({type:'student', user:st.name, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
    setData('devices', devices);
    renderStudentDashboard(); showPage('studentDashboard');
    document.getElementById('unifiedPass').value = '';
    showToast('✅ مرحباً ' + st.name, 'success');
    return;
  }

  // 3) ولي أمر (الاسم أو رقم الهاتف)
  const kids = students.filter(x => {
    const phoneCountry = x.parentPhoneCountry || x.phoneCountry || 'EG';
    const inputPhone = normalizeWaNumber(u, phoneCountry);
    const parentPhone = x.parentPhone ? normalizeWaNumber(x.parentPhone, phoneCountry) : '';
    const studentPhone = x.phone ? normalizeWaNumber(x.phone, x.phoneCountry || 'EG') : '';
    return (x.parent === u || parentPhone === inputPhone || studentPhone === inputPhone) && x.parentPass === p;
  });
  if(kids.length > 0) {
    currentUser = kids; currentType = 'parent'; currentAdminId = null;
    pageHistory = []; saveSessionState();
    const devices = getData('devices');
    devices.push({type:'parent', user:u, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
    setData('devices', devices);
    renderParentDashboard(); showPage('parentDashboard');
    document.getElementById('unifiedPass').value = '';
    showToast('✅ مرحباً بك في صفحة ولي الأمر', 'success');
    return;
  }

  box.innerHTML = '<div class="alert alert-danger">❌ اسم المستخدم أو الرقم السري غير صحيح</div>';
  showToast('❌ بيانات الدخول غير صحيحة', 'error');
}

// نسخ الرقم الري لولي الأمر إلى الطالب (تطابق الرقم السري)
function syncStudentPass(prefix) {
  const cb = document.getElementById(prefix === 'st' ? 'stSamePass' : 'editSamePass');
  const sp = document.getElementById(prefix === 'st' ? 'stStudentPass' : 'editStudentPass');
  const pp = document.getElementById(prefix === 'st' ? 'stParentPass' : 'editParentPass');
  if(!cb || !sp || !pp) return;
  if(cb.checked) { sp.value = pp.value; sp.readOnly = true; }
  else { sp.readOnly = false; }
}

function loadAdminSettings() {
  const admin = getData('admins').find(a => a.id === currentAdminId);
  if(!admin) return;
  document.getElementById('confirmMobile').value = '';
  document.getElementById('confirmPass').value = '';
  document.getElementById('newMobile').value = '';
  document.getElementById('newPass').value = '';
  setCountrySelectorValue('confirmMobileCountry', admin.mobileCountry || 'EG');
  setCountrySelectorValue('newMobileCountry', admin.mobileCountry || 'EG');
  document.getElementById('adminSettingsAlert').innerHTML = '';
}

function saveAdminSettings() {
  const admins = getData('admins');
  const idx = admins.findIndex(a => a.id === currentAdminId);
  if(idx === -1) return;
  const currentCountry = admins[idx].mobileCountry || 'EG';
  const confirmMobile = normalizeLocalPhoneInput(document.getElementById('confirmMobile').value);
  const confirmPass = document.getElementById('confirmPass').value;
  const newMobile = normalizeLocalPhoneInput(document.getElementById('newMobile').value);
  const newCountry = selectedCountryIso('newMobileCountry');
  const expectedMobile = normalizeWaNumber(admins[idx].mobile, currentCountry);
  if(normalizeWaNumber(confirmMobile, selectedCountryIso('confirmMobileCountry')) !== expectedMobile) {
    document.getElementById('adminSettingsAlert').innerHTML = '<div class="alert alert-danger">رقم الموبايل الحالي غير صحيح</div>';
    return;
  }
  if(confirmPass !== admins[idx].password) {
    document.getElementById('adminSettingsAlert').innerHTML = '<div class="alert alert-danger">❌ الرقم السري الحالي غير صحيح</div>';
    return;
  }
  let changed = false;
  if(newMobile) {
    if(!validatePhoneField('newMobileCountry','newMobile',true)) return alert('رقم الموبايل يجب أن يطابق الدولة المختارة');
    const international = normalizeWaNumber(newMobile, newCountry);
    if(admins.find((a, i) => i !== idx && normalizeWaNumber(a.mobile, a.mobileCountry || 'EG') === international)) return alert('هذا الرقم مسجل لمسؤول آخر');
    admins[idx].mobile = newMobile;
    admins[idx].mobileCountry = newCountry;
    changed = true;
  }
  if(newPass) { admins[idx].password = newPass; changed = true; }
  if(!changed) {
    document.getElementById('adminSettingsAlert').innerHTML = '<div class="alert alert-warning">⚠️ لم يتم دخال بيانات جديدة</div>';
    return;
  }
  setData('admins', admins);
  currentUser = admins[idx];
  document.getElementById('adminSettingsAlert').innerHTML = '<div class="alert alert-success">✅ تم حفظ التغييرات بنجاح</div>';
  document.getElementById('confirmMobile').value = '';
  document.getElementById('confirmPass').value = '';
  document.getElementById('newMobile').value = '';
  document.getElementById('newPass').value = '';
}

function renderAdminStats() {
  const students = getData('students');
  const subjects = getData('subjects');
  const admins = getData('admins');
  let draftCount = 0;
  students.forEach(s => {
    if(s.sessions) draftCount += s.sessions.filter(sess => sess.isDraft).length;
  });
  document.getElementById('statStudents').textContent = students.length;
  document.getElementById('statTeachers').textContent = subjects.length;
  document.getElementById('statAdmins').textContent = admins.length;
  document.getElementById('statDrafts').textContent = draftCount;
}

function renderActiveDrafts() {
  const students = getData('students');
  let draftsHtml = '';
  let hasDrafts = false;

  students.forEach(s => {
    const drafts = s.sessions ? s.sessions.filter(sess => sess.isDraft) : [];
    drafts.forEach(draft => {
      hasDrafts = true;
      const timeLeft = Math.max(0, 24 - ((Date.now() - draft.draftCreatedAt) / (60 * 60 * 1000)));
      draftsHtml += '<div style="background:var(--table-header); padding:15px; border-radius:10px; margin-bottom:10px; border-right:4px solid var(--warning); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">';
      draftsHtml += '<div><strong>'+s.name+'</strong> - تسميع بتاريخ '+draft.date+'<br><small style="color:var(--text-light)">متبقي '+timeLeft.toFixed(1)+' ساعة للإغلاق التلقائي</small></div>';
      draftsHtml += '<div><button class="btn btn-sm btn-success" onclick="openRecord('+s.id+')">تعديل التسميع</button></div>';
      draftsHtml += '</div>';
    });
  });

  if(hasDrafts) {
    document.getElementById('activeDraftsSection').innerHTML = 
      '<div class="draft-section"><h4 style="color:var(--warning); margin-bottom:15px;">⚠️ تسميعات نشطة (قيد التعديل)</h4>'+draftsHtml+'</div>';
  } else {
    document.getElementById('activeDraftsSection').innerHTML = '';
  }
}

function calcAge() {
  const birth = new Date(document.getElementById('stBirth').value);
  if(!birth.getTime()) return;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  document.getElementById('stAge').value = age;
}
function calcEditAge() {
  const birth = new Date(document.getElementById('editBirth').value);
  if(!birth.getTime()) return;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  document.getElementById('editAge').value = age;
}

function toggleQuranFields() {
  const select = document.getElementById('stSubject');
  const subjects = getData('subjects');
  let isQuran = false;
  for(let opt of select.selectedOptions) {
    const sub = subjects.find(s => s.id == opt.value);
    if(sub && sub.name.includes('قرآن')) isQuran = true;
  }
  document.getElementById('quranFields').classList.toggle('hidden', !isQuran);
}
function toggleEditQuran() {
  const select = document.getElementById('editSubject');
  const subjects = getData('subjects');
  let isQuran = false;
  for(let opt of select.selectedOptions) {
    const sub = subjects.find(s => s.id == opt.value);
    if(sub && sub.name.includes('قرآن')) isQuran = true;
  }
  document.getElementById('editQuranFields').classList.toggle('hidden', !isQuran);
}

function renderSubjectSelect() {
  const subjects = getData('subjects');
  let html = '';
  subjects.forEach(s => { html += '<option value="'+s.id+'">'+s.name+' - '+s.teacher+'</option>'; });
  document.getElementById('stSubject').innerHTML = html;
}
function renderEditSubjectSelect(selectedIds) {
  const subjects = getData('subjects');
  let html = '';
  subjects.forEach(s => {
    const selected = selectedIds && selectedIds.includes(s.id) ? 'selected' : '';
    html += '<option value="'+s.id+'" '+selected+'>'+s.name+' - '+s.teacher+'</option>';
  });
  document.getElementById('editSubject').innerHTML = html;
}

async function saveStudent() {
  const alertBox = document.getElementById('addStudentAlert');
  const fail = function(msg) {
    alertBox.innerHTML = '<div class="alert alert-danger">❌ ' + msg + '</div>';
    showToast('🚫 تم رفض تسجيل لطلب  ' + msg, 'error');
  };

  const name = document.getElementById('stName').value.trim();
  const username = document.getElementById('stUsername').value.trim();
  const national = normalizeIdentityInput(document.getElementById('stNational').value);
  const identityCountry = selectedCountryIso('stIdentityCountry');
  const phoneCountry = selectedCountryIso('stPhoneCountry');
  const phone = normalizeLocalPhoneInput(document.getElementById('stPhone').value);
  const birth = document.getElementById('stBirth').value;
  const age = document.getElementById('stAge').value;
  const studentPass = document.getElementById('stStudentPass').value;
  const parent = document.getElementById('stParent').value.trim();
  const parentPass = document.getElementById('stParentPass').value.trim();
  const subjectSelect = document.getElementById('stSubject');
  const notes = document.getElementById('stNotes').value.trim();
  const selectedSubjects = Array.from(subjectSelect.selectedOptions).map(o => parseInt(o.value));

  if(!name || !username || !national || !birth || !parent || !parentPass || !studentPass || selectedSubjects.length === 0) return fail('يرجى ملء جميع الحقول المطلوبة');
  const studentValidation = validateCountryFields('stIdentityCountry','stNational','stPhoneCountry','stPhone',false);
  if(!studentValidation.identityValid) return fail('أدخل الهوية أو جواز السفر وفق الدولة المختارة');
  if(phone && !studentValidation.phoneValid) return fail('أدخل رقم الهاتف وفق الدولة المختارة');

  const students = getData('students');
  if(students.find(s => normalizeIdentityInput(s.national || s.nationalId || '') === national)) return fail('هذا الرقم القومي مسجل مسبقاً');
  if(students.find(s => s.username === username)) return fail('اسم المستخدم مسجل مسبقاً');
  if(students.find(s => s.username === username)) return fail('اسم المستخدم مسجل مسبقاً');
  // ✅ مسموح الآن أن يكون الرقم السري للطالب مطابقاً للرقم السري لولي الأمر

  const subjects = getData('subjects');
  const selectedSubData = selectedSubjects.map(id => subjects.find(s => s.id === id)).filter(Boolean);
  const isQuran = selectedSubData.some(s => s.name.includes('قرآن'));

  const printVec = null;
  let voiceData = voiceDataUrl;
  // البصمة اختيارية، لكن عند تسجيلها يكون Gemini وحده مصدر إنشائها ومقارنتها.
  let voiceProfile = voiceProfileGemini;
  if(voiceBlob) {
    try {
      if(!voiceProfile) voiceProfile = await geminiVoiceProfile(voiceBlob);
      if(!voiceData) voiceData = await blobToDataURL(voiceBlob);
      for(const st of students) {
        if(!st.voiceProfile) continue;
        const match = await verifyVoiceIdentity(voiceBlob,st);
        if(match.sameSpeaker && match.pct >= VOICE_DUPLICATE_THRESHOLD) return fail('هذه البصمة الصوتية مسجلة مسبقاً للطالب: ' + st.name + ' (تطابق Gemini ' + match.pct + '%)');
      }
    } catch(e) { return fail((e&&e.message)||'تعذر إنشاء البصمة بواسطة Gemini'); }
  }

  const newStudent = {
    id: Date.now(), name, username, national, nationalId: national, identityCountry, nationalCountry: identityCountry, phone, phoneCountry, birth, age, studentPass, parent, parentPass,
    subjectIds: selectedSubjects, subjects: selectedSubData,
    notes, createdAt: new Date().toLocaleString('ar-EG'),
    juz: isQuran ? (document.getElementById('stJuz').value || '') : '',
    surah: isQuran ? document.getElementById('stSurah').value : '',
    voicePrint: voiceData || null,
    voicePrintVec: printVec || null,
    voiceProfile: voiceProfile || null,
    sessions: [], tasks: [], completedTasks: [], homeworkApproved: false, readingApproved: false, voiceApproved: false
  };
  students.push(newStudent);
  setData('students', students);
  voiceBlob = null; voiceFingerprint = null; voiceDataUrl = null; voiceProfileGemini = null;
  alertBox.innerHTML = '<div class="alert alert-success">✅ تم حفظ الطالب بنجاح!</div>';
  showToast('تم حفظ الطالب "' + name + '" بنجاح' + (voiceProfile ? ' مع بصمة Gemini الصوتية' : ' (بدون بصمة صوتية)'), 'success');
  ['stName','stUsername','stNational','stPhone','stBirth','stAge','stStudentPass','stParent','stParentPass','stNotes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('stJuz').value = '';
  document.getElementById('stSurah').innerHTML = '<option value="">اختر الجزء أولاً...</option>';
  const prev = document.getElementById('voicePreview');
  prev.style.display = 'none'; prev.removeAttribute('src');
  document.getElementById('voiceRecordStatus').textContent = 'اضغط للتسجيا (20 ثانية)';
  document.getElementById('quranFields').classList.add('hidden');
}

function openEdit(id) {
  const students = getData('students');
  const s = students.find(x => x.id === id);
  if(!s) return;
  currentUser = s;
  document.getElementById('editId').value = id;
  document.getElementById('editName').value = s.name;
  document.getElementById('editUsername').value = s.username || '';
  setCountrySelectorValue('editIdentityCountry', s.identityCountry || s.nationalCountry || 'EG');
  document.getElementById('editNational').value = s.national || s.nationalId || '';
  setCountrySelectorValue('editPhoneCountry', s.phoneCountry || 'EG');
  document.getElementById('editPhone').value = localPhoneFromInternational(s.phone || '', s.phoneCountry || 'EG');
  document.getElementById('editBirth').value = s.birth || '';
  document.getElementById('editAge').value = s.age || '';
  document.getElementById('editStudentPass').value = s.studentPass || '';
  document.getElementById('editParent').value = s.parent;
  document.getElementById('editParentPass').value = s.parentPass;
  document.getElementById('editNotes').value = s.notes || '';
  editVoiceBlob=null; editVoiceFingerprint=null; editVoiceDataUrl=null; editVoiceProfileGemini=null;
  const evp=document.getElementById('editVoicePreview'); if(evp){evp.style.display='none';evp.removeAttribute('src');}
  const evs=document.getElementById('editVoiceStatus'); if(evs)evs.textContent=(s.voiceProfile||s.voicePrintVec)?('البصمة الصوتية موجودئ'+(s.voiceProfile?' (جميناي)':'')+'. يمكنك استبدالها بتسءءيل جديد.'):'لا توجد بصمة صوتية محوظة حالاً.';
  renderEditSubjectSelect(s.subjectIds);
  initEditJuzSelect(s.juz);
  const isQuran = s.subjects && s.subjects.some(sub => sub.name.includes('قرآن'));
  if(isQuran && s.juz) {
    setTimeout(() => {
      const surahSelect = document.getElementById('editSurah');
      if(quranData[s.juz]) {
        let html = '<option value="">اختر السورة...</option>';
        quranData[s.juz].forEach(sur => { html += '<option value="'+sur+'" '+(s.surah===sur?'selected':'')+'>'+sur+'</option>'; });
        surahSelect.innerHTML = html;
      }
    }, 100);
  }
  document.getElementById('editQuranFields').classList.toggle('hidden', !isQuran);
  showPage('editStudent');
}

let editVoiceBlob=null, editVoiceFingerprint=null, editVoiceDataUrl=null, editVoiceRecorder=null, editVoiceChunks=[], editVoiceProfileGemini=null;
async function toggleEditVoiceRecord(){
  const btn=document.getElementById('editVoiceBtn'),status=document.getElementById('editVoiceStatus'),preview=document.getElementById('editVoicePreview');
  if(!btn||!status||!preview)return;
  if(editVoiceRecorder && editVoiceRecorder.state!=='inactive'){editVoiceRecorder.stop();return;}
  try{
    const stream=await safeGetMic(); editVoiceChunks=[]; editVoiceRecorder=new MediaRecorder(stream);
    editVoiceRecorder.ondataavailable=e=>{if(e.data.size)editVoiceChunks.push(e.data)};
    editVoiceRecorder.onstop=async()=>{
      editVoiceBlob=new Blob(editVoiceChunks,{type:'audio/webm'}); stream.getTracks().forEach(t=>t.stop());
      preview.src=URL.createObjectURL(editVoiceBlob);preview.style.display='block';status.textContent='🤖 جاري تحليل البصمة الجديدة...';
      try{
        editVoiceProfileGemini=await geminiVoiceProfile(editVoiceBlob);
        editVoiceFingerprint=null;editVoiceDataUrl=await blobToDataURL(editVoiceBlob);
        status.textContent='تم إنشاء بصمة جديدة بواسطة Gemini — اضغط حفظ التعديلات';
      }catch(e){editVoiceProfileGemini=null;editVoiceFingerprint=null;editVoiceDataUrl=null;status.textContent=(e&&e.message)||'تعذر حليل الصوت بواسطة Gemini';}
      btn.classList.remove('recording');
    };
    editVoiceRecorder.start();registerAudioRecorder('edit-fingerprint',editVoiceRecorder,stream,{statusId:'editVoiceStatus',buttonId:'editVoiceBtn',maxMs:20000});btn.classList.add('recording');status.textContent='جاري التسجيل... (20 ثانية فعلية)';
  }catch(e){status.textContent='لا يمكن الوصول إلى الميكروفون'}
}

function updateStudent() {
  const id = parseInt(document.getElementById('editId').value);
  let students = getData('students');
  const idx = students.findIndex(s => s.id === id);
  if(idx === -1) return;
  const national = normalizeIdentityInput(document.getElementById('editNational').value);
  const identityCountry = selectedCountryIso('editIdentityCountry');
  const phoneCountry = selectedCountryIso('editPhoneCountry');
  const phone = normalizeLocalPhoneInput(document.getElementById('editPhone').value);
  const studentPass = document.getElementById('editStudentPass').value;
  const parentPass = document.getElementById('editParentPass').value.trim();
  const editValidation = validateCountryFields('editIdentityCountry','editNational','editPhoneCountry','editPhone',false);
  if(!editValidation.identityValid) return alert('أدخل الهوية أو جواز ا��سفر وفق الدولة المختارة');
  if(phone && !editValidation.phoneValid) return alert('أدخل رقم الهاتف وفق الدولة المختارة');
  // ✅ مسموح تابق الرقم السري للطالب مع ولي الأمر

  students[idx].name = document.getElementById('editName').value.trim();
  students[idx].username = document.getElementById('editUsername').value.trim();
  students[idx].national = national;
  students[idx].nationalId = national;
  students[idx].identityCountry = identityCountry;
  students[idx].nationalCountry = identityCountry;
  students[idx].phone = phone;
  students[idx].phoneCountry = phoneCountry;
  students[idx].birth = document.getElementById('editBirth').value;
  students[idx].age = document.getElementById('editAge').value;
  students[idx].studentPass = document.getElementById('editStudentPass').value;
  students[idx].parent = document.getElementById('editParent').value.trim();
  students[idx].parentPass = document.getElementById('editParentPass').value.trim();
  students[idx].notes = document.getElementById('editNotes').value.trim();

  const subjectSelect = document.getElementById('editSubject');
  const selectedSubjects = Array.from(subjectSelect.selectedOptions).map(o => parseInt(o.value));
  const subjects = getData('subjects');
  students[idx].subjectIds = selectedSubjects;
  students[idx].subjects = selectedSubjects.map(id => subjects.find(s => s.id === id)).filter(Boolean);

  const isQuran = students[idx].subjects.some(sub => sub.name.includes('قرآن'));
  if(isQuran) {
    students[idx].juz = document.getElementById('editJuz').value;
    students[idx].surah = document.getElementById('editSurah').value;
  }

  if(editVoiceProfileGemini) {
    students[idx].voiceProfile=editVoiceProfileGemini;
    students[idx].voicePrintVec=null;
    students[idx].voicePrint=editVoiceDataUrl||students[idx].voicePrint||null;
  }

  setData('students', students);
  document.getElementById('editStudentAlert').innerHTML = '<div class="alert alert-success">✅ تم حفظ التعديلات بنجاح</div>';
  setTimeout(() => showPage('studentsList'), 1200);
}

function renderStudents() {
  const search = document.getElementById('searchStudent').value.trim().toLowerCase();
  let students = getData('students');
  if(search) students = students.filter(s => s.name.includes(search) || s.username.includes(search) || s.national.includes(search));
  document.getElementById('studentsCount').textContent = students.length;
  if(students.length === 0) {
    document.getElementById('studentsTable').innerHTML = '<div class="alert alert-info">لا يوجد طلاب مسجلين</div>'; return;
  }
  let html = '<div class="students-grid">';
  students.forEach((s, i) => {
    const subNames = s.subjects ? s.subjects.map(sub => sub.name).join('، ') : '-';
    const sessionCount = s.sessions ? s.sessions.filter(sess => !sess.isDraft).length : 0;
    const examCount = Array.isArray(s.examResults) ? s.examResults.length : 0;
    const hasDraft = s.sessions ? s.sessions.some(sess => sess.isDraft) : false;
    html += '<div class="student-card">';
    html += '<div class="student-card-header"><div class="student-num">'+(i+1)+'</div><div class="student-name">'+s.name+'</div></div>';
    html += '<div class="student-card-body">';
    html += '<div class="student-field"><span class="field-label">اسم المستخدم:</span> <span class="field-value">'+s.username+'</span></div>';
    html += '<div class="student-field"><span class="field-label">الرقم القومي:</span> <span class="field-value">'+s.national+'</span></div>';
    html += '<div class="student-field"><span class="field-label">السن:</span> <span class="field-value">'+(s.age || '-')+' سنة</span></div>';
    html += '<div class="student-field"><span class="field-label">رقم الهاتف:</span> <span class="field-value">'+(s.phone || '-')+'</span></div>';
    html += '<div class="student-field"><span class="field-label">ولي الأمر:</span> <span class="field-value">'+s.parent+'</span></div>';
    html += '<div class="student-field"><span class="field-label">المواد:</span> <span class="badge badge-primary">'+subNames+'</span></div>';
    html += '<div class="student-field"><span class="field-label">تاريخ التسجيل:</span> <span class="field-value">'+s.createdAt+'</span></div>';
    html += '</div>';
    html += '<div class="student-card-actions">';
    html += '<button class="btn btn-sm btn-info" onclick="openEdit('+s.id+')">✏️ تعديل</button>';
    html += '<button class="btn btn-sm btn-success" onclick="openRecord('+s.id+')">'+(hasDraft ? '📝 تعديل تسميع' : '🎙️ تسميع')+'</button>';
    html += '<button class="btn btn-sm btn-warning" onclick="openHistory('+s.id+')">📋 السجل ('+sessionCount+' تسميع، '+examCount+' اختبار)</button>';
    html += '<button class="btn btn-sm btn-danger" onclick="deleteStudent('+s.id+')">🗑️ حذف</button>';
    html += '</div></div>';
  });
  html += '</div>';
  document.getElementById('studentsTable').innerHTML = html;
}

function deleteStudent(id) {
  if(!confirm('هل أنت متأكد من حذف هذا الطالب وجمي سجلاته؟')) return;
  let students = getData('students');
  students = students.filter(s => s.id !== id);
  setData('students', students); renderStudents();
}

// ====== RECORD SESSION - FIXED ELEMENTS WITH SURAH & COLOR ======
const FIXED_ELEMENTS = ['اللوح', 'السورة', 'الماضي القريب', 'الماضي البعيد'];

function openRecord(id) {
  const students = getData('students');
  const s = students.find(x => x.id === id);
  if(!s) return;
  const isQuran = s.subjects && s.subjects.some(sub => sub.name.includes('قرآن'));
  if(!isQuran) { alert('التسميع متاح فقط طلاب القرآن الكريم'); return; }

  document.getElementById('recordStudentId').value = id;
  document.getElementById('recordName').value = s.name;
  document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('recordJuz').value = s.juz ? 'الجزء ' + s.juz : 'غير ��حدد';
  document.getElementById('recordSurahName').value = s.surah || 'غير محددة';

  const mainSurah = s.surah || '';
  const juzNum = parseInt(s.juz) || 0;
  const availableSurahs = getSurahsForJuz(juzNum);

  currentRecordMainSurah = mainSurah;
  currentRecordAvailableSurahs = availableSurahs;
  currentRecordJuz = juzNum;

  // Check for existing draft
  const existingDraft = s.sessions ? s.sessions.find(sess => sess.isDraft) : null;

  if(existingDraft) {
    recordElements = JSON.parse(JSON.stringify(existingDraft.elements)).map(el=>Object.assign({proctorEnabled:true,proctorTouchGrace:12,proctorGazeGrace:12,proctorMaxViolations:1},el));
    homeworkItems = JSON.parse(JSON.stringify(existingDraft.homework || []));
    readingItems = JSON.parse(JSON.stringify(existingDraft.reading || []));
    document.getElementById('recordDate').value = existingDraft.date;
    document.getElementById('recordNotes').value = existingDraft.notes || '';
  } else {
    recordElements = FIXED_ELEMENTS.map((name, idx) => ({
      name: name,
      surah: (name === 'اللوح' || name === 'السورة') ? mainSurah : '',
      from: '',
      to: '',
      rating: '',
      color: '',
      isHomework: false,
isVoice: false,
proctorEnabled: true,
proctorTouchGrace: 12,
proctorGazeGrace: 12,
proctorMaxViolations: 1
}));
    homeworkItems = []; readingItems = [];
    document.getElementById('recordNotes').value = '';
  }

  renderRecordElements(); renderExtraElements(); renderHomeworkItems(); renderReadingItems();
  initExamBuilder();
  const mb=students.find(x=>x.id===id).manualBoard||{}; if(document.getElementById('manualBoardText')) document.getElementById('manualBoardText').value=mb.text||''; if(document.getElementById('manualBoardImage')) document.getElementById('manualBoardImage').value=mb.image||'';
  document.getElementById('recordAlert').innerHTML = '';
  showPage('recordSession');
}

function removeRecordElement(idx) {
  recordElements[idx].deleted = true;
  renderRecordElements(); renderExtraElements();
  showToast('����️ تم حذف عنصر "'+recordElements[idx].name+'" — يمكنك استرجاعه', 'error');
}

function restoreRecordElement(idx) {
  recordElements[idx].deleted = false;
  renderRecordElements(); renderExtraElements();
  showToast('↩️ تم استرجاع عنصر "'+recordElements[idx].name+'"', 'success');
}

function duplicateRecordElement(idx) {
  const copy = JSON.parse(JSON.stringify(recordElements[idx]));
  copy.deleted = false;
  recordElements.splice(idx + 1, 0, copy);
  renderRecordElements(); renderExtraElements();
  showToast('➕ تم تضعيف عصر "'+copy.name+'"', 'success');
}

function addExtraElement() {
  recordElements.push({
    name: 'تسميع إضافي',
    isExtra: true,
    surah: '',
    from: '',
    to: '',
    rating: '',
    color: '',
    isHomework: false,
isVoice: false,
proctorEnabled: true,
proctorTouchGrace: 12,
proctorGazeGrace: 12,
proctorMaxViolations: 1,
deleted: false
  });
  renderExtraElements();
  showToast('➕ تم إضافة عنصر تسميع إضافي', 'success');
}

function renderRecordElementHTML(el, i, num) {
  const mainSurah = currentRecordMainSurah || '';
  let html = '';

  if(el.deleted) {
    html += '<div class="record-element" style="opacity:0.6; border-style:dashed;">';
    html += '<div class="record-element-header">';
    html += '<span class="record-element-title" style="text-decoration:line-through;">'+num+'. '+el.name+'</span>';
    html += '<button class="btn btn-xs btn-success" onclick="restoreRecordElement('+i+')" title="استرجاع العنصر">↩ استرجاع</button>';
    html += '</div>';
    html += '<div style="color:var(--text-light); font-size:0.9rem;">تم حذ هذا العنصر — لن يُحفظ ضمن التسميع.</div>';
    html += '</div>';
    return html;
  }

  html += '<div class="record-element">';
  html += '<div class="record-element-header">';
  html += '<span class="record-element-title">'+num+'. '+el.name+'</span>';
  html += '<div style="display:flex; gap:6px; flex-wrap:wrap;">';
  html += '<button class="btn btn-xs btn-info" onclick="duplicateRecordElement('+i+')" title="تضءءيف (إنشاء نسخة أخرى)">📑 تضعيف</button>';
  html += '<button class="btn btn-xs btn-danger" onclick="removeRecordElement('+i+')" title="حذف ها العنصر">🗑️ حذف</button>';
  html += '<button class="btn btn-xs btn-secondary" onclick="restoreRecordElement('+i+')" title="استرجاع بعد الحذف" disabled style="opacity:0.5;">↩️ استرجاع</button>';
  html += '</div>';
  html += '</div>';

  // Surah field
  html += '<div class="form-group" style="margin-bottom:12px;">';
  html += '<label>📖 السورة</label>';

  if(el.name === 'اللوح' || el.name === 'السورة') {
    html += '<select onchange="updateRecordElement('+i+', ' + "'" + 'surah' + "'" + ', this.value)" style="width:100%;font-weight:bold;color:var(--primary);border:2px solid var(--primary);">';
    ALL_SURAHS_ORDERED.forEach(sur => { html += '<option value="'+sur+'" '+(el.surah===sur?'selected':'')+'>'+sur+'</option>'; });
    html += '</select>';
    html += '<small style="color:var(--text-light)">تُحدد تلقائياً من بيانات لطالب ويمكن للمسؤول تغييرها يدوياً.</small>';
  } else if(el.name === 'الماضي القريب' || el.name === 'الماضي البعيد') {
    const mainSurahIndex = ALL_SURAHS_ORDERED.indexOf(mainSurah);
    let afterSurahs = [];
    if(mainSurahIndex !== -1 && mainSurahIndex < ALL_SURAHS_ORDERED.length - 1) {
      afterSurahs = ALL_SURAHS_ORDERED.slice(mainSurahIndex + 1);
    }
    if(afterSurahs.length > 0) {
      html += '<select onchange="updateRecordElement('+i+', ' + "'" + 'surah' + "'" + ', this.value)" style="margin-bottom:8px; width:100%;">';
      html += '<option value="">-- اختر من السور التي بعد '+mainSurah+' --</option>';
      afterSurahs.forEach(sur => {
        html += '<option value="'+sur+'" '+(el.surah===sur?'selected':'')+'>'+sur+'</option>';
      });
      html += '</select>';
    }
    html += '<input type="text" placeholder="أو اكتب اسم اسور يدوياً..." value="'+(el.surah && !afterSurahs.includes(el.surah) ? el.surah : '')+'" onchange="updateRecordElement('+i+', ' + "'" + 'surah' + "'" + ', this.value)" style="width:100%;">';
    if(mainSurahIndex === -1) {
      html += '<small style="color:var(--text-light)">لم يتم تحديد السورة الأساسية للطالب</small>';
    } else {
      html += '<small style="color:var(--text-light)">يتم عرض السور من بعد '+mainSurah+' حتى الناس</small>';
    }
  } else if(el.isExtra) {
    html += '<select onchange="updateRecordElement('+i+', ' + "'" + 'surah' + "'" + ', this.value)" style="margin-bottom:8px; width:100%;">';
    html += '<option value="">-- اختر االسورة --</option>';
    ALL_SURAHS_ORDERED.forEach(sur => {
      html += '<option value="'+sur+'" '+(el.surah===sur?'selected':'')+'>'+sur+'</option>';
    });
    html += '</select>';
  } else {
    html += '<input type="text" placeholder="اسم السورة..." value="'+el.surah+'" onchange="updateRecordElement('+i+', ' + "'" + 'surah' + "'" + ', this.value)">';
  }
  html += '</div>';

  // Ayah inputs with dropdowns
  const surahName = el.surah || '';
  const ayahCount = surahName && SURAH_AYAH_COUNTS[surahName] ? SURAH_AYAH_COUNTS[surahName] : 0;
  const fromNum = parseInt(el.from) || 0;

  html += '<div class="ayah-inputs">';

  html += '<div class="form-group"><label>من آية</label>';
  if(ayahCount > 0) {
    html += '<select onchange="updateRecordElement('+i+', ' + "'" + 'from' + "'" + ', this.value)" style="min-width:100px;">';
    html += '<option value="">اختر...</option>';
    for(let a = 1; a <= ayahCount; a++) {
      html += '<option value="'+a+'" '+(el.from == a ? 'selected' : '')+'>'+a+'</option>';
    }
    html += '</select>';
  } else {
    html += '<input type="number" value="'+el.from+'" onchange="updateRecordElement('+i+', ' + "'" + 'from' + "'" + ', this.value)" placeholder="رقم الآية" min="1">';
  }
  html += '</div>';

  html += '<span>إلى</span>';

  html += '<div class="form-group"><label>إلى آية</label>';
  if(ayahCount > 0 && fromNum > 0) {
    html += '<select onchange="updateRecordElement('+i+', ' + "'" + 'to' + "'" + ', this.value)" style="min-width:100px;">';
    html += '<option value="">اختر...</option>';
    for(let a = fromNum; a <= ayahCount; a++) {
      html += '<option value="'+a+'" '+(el.to == a ? 'selected' : '')+'>'+a+'</option>';
    }
    html += '</select>';
  } else if(ayahCount > 0) {
    html += '<select disabled style="min-width:100px; background:var(--table-header); opacity:0.6;"><option>اختر "من آية" أولاً</option></select>';
  } else {
    html += '<input type="number" value="'+el.to+'" onchange="updateRecordElement('+i+', ' + "'" + 'to' + "'" + ', this.value)" placeholder="رقم الآية" min="1">';
  }
  html += '</div>';

  if(ayahCount > 0) {
    html += '<span style="color:var(--text-light); font-size:0.85rem; align-self:center;">(السورة '+ayahCount+' آية)</span>';
  }

  html += '</div>';

  // Options
  html += '<div class="record-options">';
  html += '<div class="record-option"><input type="checkbox" id="hw_'+i+'" '+(el.isHomework?'checked':'')+' onchange="updateRecordElement('+i+', ' + "'" + 'isHomework' + "'" + ', this.checked)"><label for="hw_'+i+'">📝 واجب</label></div>';
  html += '<div class="record-option"><input type="checkbox" id="voice_'+i+'" '+(el.isVoice?'checked':'')+' onchange="updateRecordElement('+i+', ' + "'" + 'isVoice' + "'" + ', this.checked)"><label for="voice_'+i+'">🎙️ تسجيل صوتئ</label></div>';
  html += '<div class="record-option"><input type="checkbox" id="showay_'+i+'" '+(el.showAyat?'checked':'')+' onchange="updateRecordElement('+i+', ' + "'" + 'showAyat' + "'" + ', this.checked)"><label for="showay_'+i+'">👁️ إظهار الآيات للطالب</label></div>';
  html += '<div class="record-option"><input type="checkbox" id="proctor_'+i+'" '+(el.proctorEnabled!==false?'checked':'')+' onchange="updateRecordElement('+i+', ' + "'" + 'proctorEnabled' + "'" + ', this.checked)"><label for="proctor_'+i+'">🛡️ فحص الغش لهذا العنصر</label></div>';

html += '</div>';

const _sur = el.name === 'اللوح' || el.name === 'اسورة' ? (el.surah || mainSurah) : el.surah;
  html += '<div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">';
  html += '<button class="btn btn-xs btn-info" onclick="openAyatViewer(\''+(_sur||'').replace(/'/g,"")+'\', \''+(el.from||'')+'\', \''+(el.to||el.from||'')+'\')">📖 عض الآيات (صورة)</button>';
  html += '<button class="btn btn-xs btn-secondary" onclick="toggleInlineAyat(\'inlineAyat_'+i+'\', \''+(_sur||'').replace(/'/g,"")+'\', \''+(el.from||'')+'\', \''+(el.to||el.from||'')+'\')">👁️ مع��ين داخل الصفحة</button>';
  html += '</div><div id="inlineAyat_'+i+'" data-open="0" style="margin-top:10px;"></div>';

  // Rating
  html += '<div style="margin-top:12px;"><label style="font-weight:600; color:var(--text-light); margin-bottom:8px; display:block;">التقييم:</label>';
  html += '<div class="rating-options">';
  html += '<div class="rating-option rating-excellent '+(el.rating==='4'?'selected':'')+'" onclick="selectRating('+i+', ' + "'" + '4' + "'" + ')">ممتاز (4)</div>';
  html += '<div class="rating-option rating-verygood '+(el.rating==='3'?'selected':'')+'" onclick="selectRating('+i+', ' + "'" + '3' + "'" + ')">جيد جداً (3)</div>';
  html += '<div class="rating-option rating-good '+(el.rating==='1'?'selected':'')+'" onclick="selectRating('+i+', ' + "'" + '1' + "'" + ')">جيد (1)</div>';
  html += '<div class="rating-option rating-repeat '+(el.rating==='0'?'selected':'')+'" onclick="selectRating('+i+', ' + "'" + '0' + "'" + ')">يعاد (0)</div>';
  html += '</div></div>';

  html += '</div>';
  return html;
}

function toggleGlobalProctorSettings(){document.getElementById('globalProctorSettings')?.classList.toggle('hidden')}
async function loadGlobalProctorSettings(){try{const res=await fetch('/api/anti-cheat',{cache:'no-store'});const data=await res.json();const global=data.global||{};const config=global.config||{};const set=(id,value)=>{const el=document.getElementById(id);if(el&&value!==undefined)el.type==='checkbox'?el.checked=Boolean(value):el.value=value};set('globalProctorEnabled',global.enabled!==false);set('globalFocusEnabled',config.focus!==false);set('globalTouchEnabled',config.touch!==false);set('globalAutoRestore',config.autoRestore!==false);set('globalFullscreen',config.fullscreen===true);set('globalGazeGrace',Math.round((Number(config.gazeGraceMs)||12000)/1000));set('globalLeaveGrace',Math.round((Number(config.leaveGraceMs)||5000)/1000));set('globalMaxViolations',config.maxViolations||2)}catch(e){console.warn('[v0] global proctor settings unavailable',e)}}
function applyGlobalProctorSettings(){const enabled=document.getElementById('globalProctorEnabled')?.checked!==false;const focus=document.getElementById('globalFocusEnabled')?.checked!==false;const touch=document.getElementById('globalTouchEnabled')?.checked!==false;const autoRestore=document.getElementById('globalAutoRestore')?.checked!==false;const gaze=Math.max(3,Math.min(120,parseInt(document.getElementById('globalGazeGrace')?.value)||12));const leave=Math.max(1,Math.min(60,parseInt(document.getElementById('globalLeaveGrace')?.value)||5));const max=Math.max(1,Math.min(10,parseInt(document.getElementById('globalMaxViolations')?.value)||2));const fullscreen=document.getElementById('globalFullscreen')?.checked===true;const config={enabled,focus,touch,gazeGraceMs:gaze*1000,leaveGraceMs:leave*1000,maxViolations:max,fullscreen,autoRestore};const allItems=[].concat(recordElements||[],homeworkItems||[],readingItems||[]);allItems.forEach(function(el){el.proctorEnabled=enabled;el.proctorFocus=focus;el.proctorTouch=touch;el.proctorGazeGrace=gaze;el.proctorFaceGrace=gaze;el.proctorLeaveGrace=leave;el.proctorMaxViolations=max;el.proctorFullscreen=fullscreen;el.proctorAutoRestore=autoRestore});fetch('/api/anti-cheat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'save-global',enabled,config})}).catch(function(){/* local item settings remain usable when database is unavailable */});renderRecordElements();renderExtraElements();renderHomeworkItems();renderReadingItems();showToast('تم تطب��ق إعدادات الفحص على جميع عناصر الت��ميع والاختبار والواجب','success')}
function renderRecordElements() {
  const container = document.getElementById('recordElementsContainer');
  let html = '<div class="quran-section"><h4>📖 عن��صر التسميع</h4>';
  let num = 0;
  recordElements.forEach((el, i) => {
    if(el.isExtra) return;
    num++;
    html += renderRecordElementHTML(el, i, num);
  });
  html += '</div>';
  container.innerHTML = html;
}

function renderExtraElements() {
  const container = document.getElementById('extraElements');
  if(!container) return;
  let html = '';
  let num = 0;
  recordElements.forEach((el, i) => {
    if(!el.isExtra) return;
    num++;
    html += renderRecordElementHTML(el, i, num);
  });
  if(num === 0) html = '<p style="color:var(--text-light)">لا يوجد تسميع إضافي. اضغط + لإضافة عنصر تسميع إضافي</p>';
  container.innerHTML = html;
}

function updateRecordElement(idx, field, value) {
  recordElements[idx][field] = value;
  if(field === 'surah') {
    recordElements[idx].from = '';
    recordElements[idx].to = '';
  }
  if(field === 'from') {
    const fromNum = parseInt(value) || 0;
    const toNum = parseInt(recordElements[idx].to) || 0;
    if(toNum > 0 && toNum < fromNum) {
      recordElements[idx].to = '';
    }
  }
if(field === 'surah' || field === 'from' || field === 'proctorEnabled') {
renderRecordElements(); renderExtraElements();
}
}

function selectRating(idx, rating) {
  if(recordElements[idx].rating === rating) {
    recordElements[idx].rating = '';
    recordElements[idx].color = '';
  } else {
    recordElements[idx].rating = rating;
    recordElements[idx].color = RATING_COLORS[rating] || '';
  }
  renderRecordElements(); renderExtraElements();
}


function addHomeworkItem() {
  homeworkItems.push({text:'', approved:false, rejected:false, proctorEnabled:true, proctorGazeGrace:12, proctorLeaveGrace:5, proctorMaxViolations:1, proctorFullscreen:false});
  renderHomeworkItems();
}
function removeHomeworkItem(idx) {
  homeworkItems.splice(idx, 1); renderHomeworkItems();
}
function updateHomeworkItem(idx, field, value) {
  homeworkItems[idx][field] = value;
}
function renderHomeworkItems() {
  const container = document.getElementById('homeworkItems');
  if(homeworkItems.length === 0) { container.innerHTML = '<p style="color:var(--text-light)">لا يجد ��اجبات مضافة. اضغط + لإضافة واجب</p>'; return; }
  let html = '';
  homeworkItems.forEach((item, i) => {
    html += '<div style="background:#fff; padding:12px; border-radius:8px; margin-bottom:8px; border:1px solid var(--border);">';
    html += '<div class="form-row"><div class="form-group" style="flex:3;"><input type="text" value="'+item.text+'" onchange="updateHomeworkItem('+i+', ' + "'" + 'text' + "'" + ', this.value)" placeholder="نص الواجب..."></div>';
    html += '<div class="form-group" style="flex:1; display:flex; align-items:flex-end;"><button class="btn btn-xs btn-danger" onclick="removeHomeworkItem('+i+')">حذف</button></div></div>';
    html += '<label class="record-option"><input type="checkbox" '+(item.proctorEnabled!==false?'checked':'')+' onchange="updateHomeworkItem('+i+', \'proctorEnabled\', this.checked)"> 🛡️ فحص الغش لهذا الواجب</label>';
    html += '</div>';
  });
  container.innerHTML = html;
}

function addReadingItem() {
  readingItems.push({surah:'', from:'', to:'', showAyat:false, text:'', audio:'', approved:false, rejected:false, proctorEnabled:true, proctorGazeGrace:12, proctorLeaveGrace:5, proctorMaxViolations:1, proctorFullscreen:false});
  renderReadingItems();
}
function removeReadingItem(idx) {
  readingItems.splice(idx, 1); renderReadingItems();
}
function updateReadingItem(idx, field, value) {
  readingItems[idx][field] = value;
  if(field === 'surah') { readingItems[idx].from = ''; readingItems[idx].to = ''; }
  if(field === 'surah' || field === 'from' || field === 'showAyat') renderReadingItems();
}
async function recordReadingAudio(idx) {
  const btn = document.getElementById('readAudioBtn_' + idx);
  const status = document.getElementById('readAudioStatus_' + idx);
  if(btn && btn.dataset.recording === 'true') return;
  try {
    const stream = await safeGetMic();
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      stream.getTracks().forEach(t => t.stop());
      readingItems[idx].audio = await blobToDataURL(blob);
      renderReadingItems();
      showToast('🎙️ تم حفظ التسجيل الصوتي لقاءة الإافية', 'success');
    };
    recorder.start();
    registerAudioRecorder('reading-'+idx,recorder,stream,{statusId:'readAudioStatus_'+idx,buttonId:'readAudioBtn_'+idx,maxMs:120000});
    if(btn) { btn.dataset.recording = 'true'; btn.classList.add('recording'); btn.onclick = function(){ if(recorder.state!=='inactive') recorder.stop(); }; }
    if(status) status.textContent = 'جاري التس��يل... (اضغط للإيقاف)';
  } catch(err) { showToast('❌ لا يمكن الوصول للميكروفون', 'error'); }
}
function clearReadingAudio(idx) { readingItems[idx].audio = ''; renderReadingItems(); showToast('🗑️ تم حذف التسجيل الصوتي', 'error'); }

function renderReadingItems() {
  const container = document.getElementById('readingItems');
  if(readingItems.length === 0) { container.innerHTML = '<p style="color:var(--text-light)">لا يوجد قراءات مضافة. اضغط + لضافة قراءة</p>'; return; }
  let html = '';
  readingItems.forEach((item, i) => {
    const ayahCount = item.surah && SURAH_AYAH_COUNTS[item.surah] ? SURAH_AYAH_COUNTS[item.surah] : 0;
    const fromNum = parseInt(item.from) || 0;
    html += '<div style="background:var(--card,#fff); padding:14px; border-radius:10px; margin-bottom:10px; border:1px solid var(--border);">';
    html += '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><strong style="color:var(--primary)">📖 قراءة ءءضافية ' + (i+1) + '</strong><button class="btn btn-xs btn-danger" onclick="removeReadingItem('+i+')">🗑️ حذف</button></div>';

    html += '<div class="form-group"><label>السورة</label><select onchange="updateReadingItem('+i+', \'surah\', this.value)" style="width:100%;">';
    html += '<option value="">-- اختر السورة --</option>';
    ALL_SURAHS_ORDERED.forEach(sur => { html += '<option value="'+sur+'" '+(item.surah===sur?'selected':'')+'>'+sur+'</option>'; });
    html += '</select></div>';

    if(ayahCount > 0) {
      html += '<div class="ayah-inputs">';
      html += '<div class="form-group"><label>من الآية</label><select onchange="updateReadingItem('+i+', \'from\', this.value)" style="min-width:100px;"><option value="">اختر...</option>';
      for(let a = 1; a <= ayahCount; a++) html += '<option value="'+a+'" '+(item.from == a ? 'selected':'')+'>'+a+'</option>';
      html += '</select></div><span>إلى</span>';
      html += '<div class="form-group"><label>إلى الآية</label>';
      if(fromNum > 0) {
        html += '<select onchange="updateReadingItem('+i+', \'to\', this.value)" style="min-width:100px;"><option value="">اختر...</option>';
        for(let a = fromNum; a <= ayahCount; a++) html += '<option value="'+a+'" '+(item.to == a ? 'selected':'')+'>'+a+'</option>';
        html += '</select>';
      } else {
        html += '<select disabled style="min-width:100px; opacity:0.6;"><option>اختر "من الآية" أولاً</option></select>';
      }
      html += '</div><span style="color:var(--text-light); font-size:0.85rem; align-self:center;">(السورة '+ayahCount+' آية)</span></div>';
    }

    html += '<div class="record-options" style="margin-top:8px;"><div class="record-option"><input type="checkbox" id="rdShow_'+i+'" '+(item.showAyat?'checked':'')+' onchange="updateReadingItem('+i+', \'showAyat\', this.checked)"><label for="rdShow_'+i+'">👁️ إظهار صورة الآيات للطالب</label></div><div class="record-option"><input type="checkbox" id="rdProctor_'+i+'" '+(item.proctorEnabled!==false?'checked':'')+' onchange="updateReadingItem('+i+', \'proctorEnabled\', this.checked)"><label for="rdProctor_'+i+'">🛡️ فحص الغش لهذه القراءة</label></div></div>';

    html += '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:8px;">';
    html += '<button class="btn btn-xs btn-info" onclick="openAyatViewer(\''+(item.surah||'')+'\', \''+(item.from||'')+'\', \''+(item.to||item.from||'')+'\')">📖 عرض الآيات (صورة)</button>';
    html += '<button class="btn btn-xs btn-secondary" onclick="toggleInlineAyat(\'inlineRead_'+i+'\', \''+(item.surah||'')+'\', \''+(item.from||'')+'\', \''+(item.to||item.from||'')+'\')">👁️ معاينة داخل لصفحة</button>';
    html += '</div><div id="inlineRead_'+i+'" data-open="0" style="margin-top:10px;"></div>';

    html += '<div class="form-group" style="margin-top:8px;"><label>ملاحظة / نص القراءة (اختياري)</label><input type="text" value="'+(item.text||'')+'" onchange="updateReadingItem('+i+', \'text\', this.value)" placeholder="نص أو توجيه للالب..."></div>';
    html += '</div>';
  });
  container.innerHTML = html;
}

// ====== الاختبار الذكي امستقل ======
let examQuestions=[]; let examPlanRows=[]; let examEditorActiveIndex=0; let studentExamTimer=null; let studentExamQuestionTimer=null; let proctorExamAuthorizedId='';
let studentExamQuestionRemaining=[]; let studentExamQuestionStartedAt=[]; let studentExamQuestionElapsed=[]; let studentExamSessionId=''; let studentExamCurrentIndex=0; let studentExamViewIndex=0; let studentExamLockedIndices={};

let examFilesCache=[];
async function readApiJson(res, fallback){
  const text=await res.text();
  const contentType=(res.headers.get('content-type')||'').toLowerCase();
  if(!text.trim()){const requestId=res.headers.get('x-request-id')||'';throw new Error(fallback+' — لم يرسل الخادم تفاصيل (HTTP '+res.status+')'+(requestId?' — معرف الطلب: '+requestId:'')+'. أعد المحاولة، وإن استمر الخطأ تحقق من سجل النشر.');}
  let data=null;
  if(contentType.includes('application/json')){try{data=JSON.parse(text)}catch(e){}}
  else{try{data=JSON.parse(text)}catch(e){data={error:text.slice(0,300)}}}
  if(!data)throw new Error(fallback+' — استجابة غ��ر صالحة (HTTP '+res.status+').');
  if(!res.ok){const reason=data.error||fallback;const stage=data.diagnostics&&data.diagnostics.stage?' — المرحلة: '+data.diagnostics.stage:'';const requestId=res.headers.get('x-request-id')||(data.diagnostics&&data.diagnostics.requestId)||'';const code=data.code?' — الكود: '+data.code:'';const request=' — معرف الطلب: '+requestId;const error=new Error(reason+stage+code+request+' (HTTP '+res.status+')');error.status=res.status;error.code=data.code||'';error.retryable=data.retryable===true;throw error}
  return data;
}
async function loadExamFiles(){
  const box=document.getElementById('examFilesList');
  try{
    const previous=document.getElementById('examFileSource')?.value||'';
    const res=await fetch('/api/exam-files',{cache:'no-store'});const data=await readApiJson(res,'تعذر تحميل ملفات الاختبارات');examFilesCache=Array.isArray(data.files)?data.files:[];
    const select=document.getElementById('examFileSource');if(select){select.innerHTML='<option value="">اختر مرجعاً...</option>'+examFilesCache.map(f=>'<option value="'+f.id+'">'+escapeHtml(f.name)+(f.pinned?' — مثبت دائماً':'')+'</option>').join('');select.value=examFilesCache.some(f=>f.id===previous)?previous:(examFilesCache[0]?.id||'')}
    if(box)box.innerHTML=(data.warning?'<div class="alert alert-warning">'+escapeHtml(data.warning)+'</div>':'')+(examFilesCache.length?examFilesCache.map(f=>'<div class="exam-plan-row"><strong>'+escapeHtml(f.name)+(f.pinned?' <span class="badge badge-primary">مرجع مثب��</span>':'')+'</strong><div style="color:var(--text-light);font-size:.85rem">'+(f.text||'').length+' حرف'+(f.pinned?' — متاح دائماً':' — '+new Date(f.uploadedAt).toLocaleString('ar-EG'))+'</div>'+(f.pinned?'':'<button class="btn btn-sm btn-danger" onclick="deleteExamFile(\''+f.id+'\')">حذف الملف</button>')+'</div>').join(''):'<div class="alert alert-info">لا توجد ملفات ختبارات محفوظة.</div>');
    updateExamSourceDistribution();
  }catch(e){examFilesCache=[];if(box)box.innerHTML='<div class="alert alert-danger">'+escapeHtml(e.message||'تعذر تحميل املفات')+' <button class="btn btn-sm btn-primary" onclick="loadExamFiles()">إعادة المحاولة</button></div>';throw e}
}
function updateExamSourceDistribution(){const mode=document.getElementById('examSourceMode')?.value||'ai',group=document.getElementById('examFileSourceGroup'),source=document.getElementById('examFileSource'),label=document.getElementById('examSourceDistribution');if(group)group.style.display=mode==='file'?'block':'none';if(source)source.disabled=mode!=='file';if(label)label.textContent=mode==='file'?'ستُنشأ الدفعة املة من الملف المحدد.':'توليد ذكي مع التحقق من النص القرآني والمراجع الموثوقة.'}
function getExamSourceMode(){return document.getElementById('examSourceMode')?.value==='file'?'file':'ai'}
async function uploadExamFile(input){const file=input.files&&input.files[0];if(!file)return;const status=document.getElementById('examFileUploadStatus');if(status)status.innerHTML='<div class="alert alert-info">جاري رفع واستخراج النص...</div>';try{const form=new FormData();form.append('file',file);const res=await fetch('/api/exam-files',{method:'POST',body:form});await readApiJson(res,'تعذر رفع الملف');if(status)status.innerHTML='<div class="alert alert-success">تم حفظ اءءملف واستخراج النص.</div>';await loadExamFiles()}catch(e){if(status)status.innerHTML='<div class="alert alert-danger">'+escapeHtml(e.message||'تعذر رفع الملف')+' <button class="btn btn-sm btn-primary" onclick="document.getElementById(\'examFileInput\')?.click()">اختيار ملف آخر</button></div>'}finally{input.value=''}}
async function deleteExamFile(id){const file=examFilesCache.find(f=>f.id===id);if(!file||!confirm('هل تريد حذف هذا الملف نهائياً؟'))return;try{const res=await fetch('/api/exam-files',{method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({pathname:file.pathname,metadataPathname:file.metadataPathname})});await readApiJson(res,'تعذر حذف الملف');await loadExamFiles()}catch(e){alert(e.message||'تعذر الحذف')}}
function toggleExamSource(){loadExamFiles().catch(e=>showExamAlert(e.message,'danger'))}
function shuffled(values){return values.slice().sort(()=>Math.random()-.5)}
function generateLocalFileQuestions(file,plans){const sentences=String(file.text||'').split(/[.!؟\n]+/).map(s=>s.trim()).filter(s=>s.length>=25&&s.length<=260);if(sentences.length<6)throw new Error('لا يحتوي الملف على جمل كافية لإنشاء اختبار متنوع.');const words=shuffled(Array.from(new Set(sentences.join(' ').split(/\s+/).filter(w=>w.length>4))));let cursor=0;const output=[];plans.forEach(plan=>{for(let i=0;i<plan.count;i++){const sentence=sentences[(cursor++)%sentences.length],type=plan.type;let q={id:'file_'+Date.now()+'_'+output.length,type,level:plan.level,surah:'',prompt:'',stem:sentence,options:[],correct:'',from:1,to:1,timeLimit:plan.timeLimit,completeAyahs:1,reciteAyahs:1,audioShareWithParent:false,points:1,rejected:false,weakened:false,source:'file',sourceFileId:file.id,sourceFileName:file.name,optionsCount:plan.optionsCount||4};if(type==='truefalse'){const truthful=Math.random()>.5;q.prompt='صح أ�� خطأ: هل العبارة المعروضة مطابقة ��ما ورد في الملف؟';q.stem=truthful?sentence:sentences[(cursor+2)%sentences.length].split(' ').reverse().join(' ');q.options=['صح','خطأ'];q.correct=truthful?'صح':'خطأ'}else if(type==='complete'){const candidates=sentence.split(/\s+/).filter(w=>w.length>4);const answer=candidates[Math.floor(Math.random()*candidates.length)]||words[0];q.prompt='أكمل الجزء الاقص اعتماداً علئ النص المثبت';q.correct=answer;q.stem=sentence.replace(answer,'_____')}else if(type==='audio'){q.prompt='اقرأ النص المعروض بصوت واضح';q.correct=sentence;q.audioShareWithParent=plan.audioShareWithParent!==false}else{const correct=(sentence.split(/\s+/).filter(w=>w.length>4)[0]||words[0]);q.prompt='اختر الكلمة ��لتي وردت في النص لمعروض';q.correct=correct;q.options=shuffled([correct].concat(words.filter(w=>w!==correct).slice(0,Math.max(1,(plan.optionsCount||4)-1))))}output.push(q)}});return output}

function localSmartChatReply(message,role){
  const q=normalizeAr(String(message||'')).toLowerCase(),students=getData('students',[]),messages=getData('messages',[]);
  const roleLabel=role==='admin'?'المسؤول':role==='parent'?'ولي الأمر':'الطالب';
  if(/السلام عليكم|سلام عليكم/.test(q))return 'وعليكم اللام ورحمة الله وبركاته 🥰 هل لديك سؤال؟ أنا في خدمتك!';if(/سلام|محبا|اهلا/.test(q))return 'مرحباً بك 🥰 كيف يمكنن مساعدتك؟';
  if(/طالب|طلاب|اختبار|نتيج|درج|تسميع|حفظ|مراجع/.test(q)){
    if(role==='admin'){
      const completed=students.reduce((n,s)=>n+(Array.isArray(s.examResults)?s.examResults.length:0),0),pending=students.filter(s=>s.activeExam&&s.activeExam.status==='pending').length;
      return 'ملخص ابيانات ��لمحلية: '+students.length+' طالباً، '+completed+' نتيجة اختبار محفوظة، و'+pending+' اختباراً قيد الانتظار. ابدأ بالطلاب ذوي النتائج الأضعف أو الاختبارات المتأخرة، ثم اجعل المراجعة على فترتين: سورة قريبة من آخر حفظ وسورة أقدم لتثبيت المائي البعيد.';
    }
    return 'لتحسين الحفظ: ابدأ بمراجعة قصيرة ��لمقطع القريب، ثم اختبر نفسك عشوا��ياً من مقطع أقدم، وسجّل المواضع التي توقفت فيها. كرر الموضع الضعيفة ثلاث مرات ثم أعد الاختبار دون النظر إلى المصحف.';
  }
  if(/وقت|تنظيم|خطه|خطة|جدول|فكرة/.test(q))return 'خطة مقترحة: 10 دقائق للماضي القريب، 10 دقائق للماضي البعيد، 5 دقائق لأسئلة عشوائ��ة من أول ووسط وآخر السور، ثم دقيقتان لتسجيل الأخطاء. اجعل الهدف محدداً بعدد آيات أي سور، لا بمدة فقط.';
  if(/رساله|رسالة|تواصل/.test(q)&&role==='admin')return 'يوجد حالياً '+messages.length+' رسالة محفوظة في بيانات المنصة. رتّب ال��تابعة حسب الرسائل غير المقروءة، ثم الطلبات المتعلقة باختبار أو تسميع، وأرسل لكل حالة إجراءً واضحاً وموعد متابعة.';
  if(/صعب|ضعف|نسي|نسيان|خطا|خطأ/.test(q))return 'عند وجود ضعف، لا تُعد السورة كاملة مباشرة. حدّد موضع الخطأ، اقرأ ما قبله وما بعده، اربطه بأول كلمة في الآية التالية، ثم اختبر الموضع من بداية مختلفة. أعد مراجعته اليوم وبعد يوم وعد أسبوع.';
  return 'بصفتي المساعد المحلي لـ'+roleLabel+'، أستطيع تقديم جواب أدق إذا ذكرت االهدف والسورة أو النتيجة أو المشكلة الحالية. سأحوّلها إلى خطوات واضحة قابلة للتنفيذ دون ادعاء معلومات غير موجودة في المنصة.';
}
async function sendAdminChat(){const input=document.getElementById('adminChatInput'),box=document.getElementById('adminChatMessages'),message=input.value.trim();if(!message||currentType!=='admin')return;input.value='';const typing=document.createElement('div');typing.className='ai-msg bot';typing.textContent='جاري التحلي...';box.append('<div class="ai-msg user">'+escapeHtml(message)+'</div>');box.appendChild(typing);box.scrollTop=box.scrollHeight;try{const students=getData('students',[]).map(s=>({id:s.id,name:s.name,parent:s.parent,juz:s.juz,surah:s.surah,examResults:(s.examResults||[]).slice(-5),activeExam:s.activeExam?{status:s.activeExam.status,date:s.activeExam.date}:null}));const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'admin_assistant',payload:{role:'admin',message,context:{students,studentCount:students.length,messageCount:getData('messages',[]).length}}})});const data=await readApiJson(res,'تعذر رد Gemini وGroq');typing.innerHTML=escapeHtml(data.result||'لم يصل رد.').replace(/\n/g,'<br>')}catch(e){typing.innerHTML=escapeHtml(localSmartChatReply(message,'admin'))}box.scrollTop=box.scrollHeight}

async function callStudentAI(mode, payload, temperature){
  const res = await fetch('/api/ai', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body:JSON.stringify({mode, payload, model:getSelectedAIModel(), temperature: typeof temperature==='number' ? temperature : 0.15})
  });
  const data=await readApiJson(res,'فشل الذكاء الاصطناعي');
  if(data.result === undefined || data.result === null) throw new Error('لم يصل رد منظم من الذكاء الاصطناعي');
  return data.result;
}

function initExamBuilder(){
  examQuestions=[];examEditorActiveIndex=0;
  examPlanRows=[{count:5,level:'medium',type:'mcq',position:'random',timeLimit:60,completeAyahs:1,reciteAyahs:1,audioShareWithParent:true,optionsCount:4}];
  const base=document.getElementById('examBaseSurah');
  if(base){base.innerHTML=ALL_SURAHS_ORDERED.map(s=>'<option value="'+s+'">'+s+'</option>').join('');base.value=currentRecordMainSurah||ALL_SURAHS_ORDERED[0]}
  syncExamSurahRange();
  loadExamFiles().catch(e=>showExamAlert(e.message,'danger'));
  const deadline=document.getElementById('examDeadline');if(deadline&&!deadline.value){const d=new Date(Date.now()+24*60*60*1000);deadline.value=new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().slice(0,16)}
  renderExamPlanRows(); renderExamQuestions(); updateExamSourceDistribution();
}
function getExamPastRange(){
  const base=document.getElementById('examBaseSurah')?.value||currentRecordMainSurah||'',baseIndex=ALL_SURAHS_ORDERED.indexOf(base);
  const requestedLast=document.getElementById('examLastSurah')?.value||'الناس',lastIndex=ALL_SURAHS_ORDERED.indexOf(requestedLast);
  if(baseIndex<0||lastIndex<baseIndex)throw new Error('نطاق الماضي غير صالح.');
  const previousSurahs=ALL_SURAHS_ORDERED.slice(baseIndex+1,lastIndex+1),all=previousSurahs.length?previousSurahs:[ALL_SURAHS_ORDERED[baseIndex]],middle=Math.ceil(all.length/2),near=all.slice(0,middle),far=all.slice(middle),scope=document.getElementById('examPastScope')?.value||'both';
  const selected=scope==='near'?near:scope==='far'?(far.length?far:near):all;
  return {all,near,far,selected,scope,start:selected[0],end:selected[selected.length-1]};
}
function syncExamSurahRange(){
  const base=document.getElementById('examBaseSurah'),last=document.getElementById('examLastSurah');if(!base||!last)return;
  const previous=last.value,start=Math.max(0,ALL_SURAHS_ORDERED.indexOf(base.value));
  const allowed=ALL_SURAHS_ORDERED.slice(start);last.innerHTML='<option value="">سورة الناس تلقائياً</option>'+allowed.map(s=>'<option value="'+s+'">'+s+'</option>').join('');
  last.value=allowed.includes(previous)?previous:'';
  try{const range=getExamPastRange(),help=document.getElementById('examPastScopeHelp');if(help)help.textContent='القريب: '+range.near[0]+' ← '+range.near[range.near.length-1]+(range.far.length?'، البعيد: '+range.far[0]+' ← '+range.far[range.far.length-1]:'، ولا يوجد نصف بعيد مستقل في هذا النطاق.')}catch(e){}
}

function quranQuestionImageUrl(q,ayah,display){
  const mappedNumber=ALL_SURAHS_ORDERED.indexOf(String(q.surah||''))+1,surahNumber=Math.max(0,parseInt(q.surahNumber)||mappedNumber),from=Math.max(1,parseInt(ayah||q.from)||1),type=['mcq','truefalse','complete','audio'].includes(q.type)?q.type:'mcq';
  return surahNumber>0?'/api/quran-question-image?surah='+surahNumber+'&ayah='+from+'&to='+from+'&type='+type+'&display='+(display||'anchor'):'';
}
function openQuranImage(src){const box=document.getElementById('quranImageLightbox'),img=document.getElementById('quranImageLightboxImg');if(!box||!img)return;img.src=src;box.classList.remove('hidden');document.body.style.overflow='hidden'}
function closeQuranImage(){const box=document.getElementById('quranImageLightbox'),img=document.getElementById('quranImageLightboxImg');if(box)box.classList.add('hidden');if(img)img.removeAttribute('src');document.body.style.overflow=''}
document.addEventListener('keydown',function(event){if(event.key==='Escape')closeQuranImage()});
function quranQuestionMediaHtml(q,index){
  const from=Math.max(1,parseInt(q.from)||1),to=Math.max(from,parseInt(q.to)||from);
  const primary=q.questionImage||quranQuestionImageUrl(q,from,q.type==='complete'?'masked':'anchor');
  const images=primary?[{src:primary,label:q.type==='complete'?'جزء من آية السؤال':'آية البداية'}]:[];
  if(to!==from){const ending=quranQuestionImageUrl(q,to,'anchor');if(ending)images.push({src:ending,label:'آية النهاية'})}
  if(!images.length)return '';
  return '<div class="quran-question-media quran-image-grid">'+images.map(function(item){return '<button type="button" class="quran-image-button" onclick="openQuranImage(\''+escapeHtml(item.src)+'\')" aria-label="تكبير '+item.label+'"><img class="quran-question-image" src="'+escapeHtml(item.src)+'" alt="'+item.label+' للسؤال '+(index+1)+'" loading="eager" onerror="showQuranQuestionImageError(this)"></button>'}).join('')+'</div>';
}
function showQuranQuestionImageError(image){
  const box=image&&image.parentElement;if(!box)return;const src=image.getAttribute('src')||'';
  box.innerHTML='<div class="quran-question-error" role="alert">تعذر تحميل صورة السؤال من المص��ف.<br><button type="button" class="btn btn-sm btn-secondary quran-question-retry" onclick="retryQuranQuestionImage(this,\''+escapeHtml(src)+'\')">إعادة المحاولة</button></div>';
}
function retryQuranQuestionImage(button,src){
  const box=button&&button.closest('.quran-question-media');if(!box)return;const separator=src.includes('?')?'&':'?';
  box.innerHTML='<div class="quran-question-loading" role="status">جاري إعادة تحميل صورة السؤال...</div><img class="quran-question-image" src="'+src+separator+'retry='+Date.now()+'" alt="المقطع القرآني الخاص بالسؤال" loading="eager" onload="this.previousElementSibling.style.display=\'none\'" onerror="showQuranQuestionImageError(this)">';
}
function cleanExamQuestion(q){
  q=Object.assign({},q);q.prompt=String(q.prompt||'').replace(/(?:الإجابة|الجواب)\s*(?:الصحيحة)?\s*[:：].*$/gi,'').trim();
  const normalizedCorrect=normalizeExamText(q.correct||'');
  if(normalizedCorrect.length>2&&normalizeExamText(q.prompt).includes(normalizedCorrect))q.prompt=q.type==='complete'?'أكمل المقطع المخفي في صورة المصحف':'اختر الإجابة الصحيحة اعتماداً على المقطع المصور من المصحف';
  if(q.source!=='file'&&!q.sourceFileId)q.questionImage=quranQuestionImageUrl(q)||q.questionImage||'';
  if(q.questionImage)q.stem='';
  return q;
}
async function generateLocalQuranQuestions(base,lastSurah,plans){
  const start=ALL_SURAHS_ORDERED.indexOf(base),end=lastSurah?ALL_SURAHS_ORDERED.indexOf(lastSurah):113;if(start<0||end<start)throw new Error('نطاق السور غير صالح: يجب أن تكون آخر سورة بعد أول سورة.');
  const range=ALL_SURAHS_ORDERED.slice(start,end+1),needed=plans.reduce((n,p)=>n+p.count,0),sourceOrder=[];
  for(let left=0,right=range.length-1;left<=right;left++,right--){sourceOrder.push(range[left]);if(right!==left)sourceOrder.push(range[right])}
  const sourceLimit=Math.min(range.length,Math.max(needed,8)),sources=[];
  for(const surah of sourceOrder.slice(0,sourceLimit)){const max=SURAH_AYAH_COUNTS[surah]||1;const text=await fetchAyatText(surah,1,max);const ayahs=String(text||'').split(/\s*﴿?\d+﴾?\s*/).map(x=>x.trim()).filter(Boolean);if(ayahs.length)sources.push({surah,ayahs,text})}
  if(!sources.length)throw new Error('تعذر تحميل النص القرآني للمو��ّد المحلي.');let cursor=0;const out=[],used=new Set(),randomPositions=['start','end','middle'];
  for(const plan of plans){for(let i=0;i<plan.count;i++){const src=sources[cursor%sources.length],requestedPosition=plan.position||'random',position=requestedPosition==='random'?randomPositions[cursor%randomPositions.length]:requestedPosition;cursor++;const third=Math.max(1,Math.ceil(src.ayahs.length/3));let min=1,max=src.ayahs.length;if(position==='start')max=Math.min(src.ayahs.length,third);else if(position==='middle'){min=Math.min(src.ayahs.length,third+1);max=Math.min(src.ayahs.length,third*2)}else if(position==='end')min=Math.min(src.ayahs.length,third*2+1);let from=min+Math.floor(Math.random()*Math.max(1,max-min+1));for(let tries=0;tries<=max-min&&used.has(src.surah+':'+from);tries++)from=from>=max?min:from+1;used.add(src.surah+':'+from);const ayah=src.ayahs[from-1]||src.text,next=src.ayahs[from]||ayah;let q={surah:src.surah,from,to:Math.min(from+(plan.type==='complete'?plan.completeAyahs-1:plan.type==='audio'?plan.reciteAyahs-1:0),src.ayahs.length),points:1,source:'local-browser',options:[],stem:ayah,correct:''};
    if(plan.type==='mcq'){const options=shuffled([src.surah].concat(shuffled(range.filter(s=>s!==src.surah)).slice(0,plan.optionsCount-1)));q.prompt='إلى أي سورة ينتمي المقطع المصور؟';q.options=options;q.correct=src.surah}
    else if(plan.type==='truefalse'){const truth=Math.random()>.5,shown=truth?src.surah:(shuffled(range.filter(s=>s!==src.surah))[0]||src.surah);q.prompt='هل المقطع المصور من سورة '+shown+'؟';q.options=['صح','خطأ'];q.correct=truth?'صح':'خطأ'}
    else if(plan.type==='complete'){const words=ayah.split(/\s+/),cut=Math.max(2,Math.floor(words.length*.55));q.prompt='أكمل المقطع المخفي في صورة المصحف';q.correct=words.slice(cut).join(' ')||next}
    else {q.prompt='سجّل تلاوة المقطع المعروض من المصحف';q.correct=src.ayahs.slice(from-1,q.to).join(' ')}
    q.stem='';q.questionImage='/api/quran-question-image?surah='+(ALL_SURAHS_ORDERED.indexOf(src.surah)+1)+'&ayah='+from+'&to='+q.to+'&type='+plan.type;
    out.push(cleanExamQuestion(q));}}
  return out;
}
function addExamPlanRow(){
  examPlanRows.push({count:1,level:'easy',type:'mcq',position:'random',timeLimit:60,completeAyahs:1,reciteAyahs:1,audioShareWithParent:true,proctorEnabled:true,optionsCount:4});
  renderExamPlanRows();
}
function setExamPlanTime(i,part,value){
  const row=examPlanRows[i]; if(!row)return;
  let total=Math.max(0,parseInt(row.timeLimit)||0),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;
  const v=Math.max(0,parseInt(value)||0); if(part==='hours')h=Math.min(23,v); if(part==='minutes')m=Math.min(59,v); if(part==='seconds')s=Math.min(59,v);
  row.timeLimit=Math.max(5,h*3600+m*60+s);
}
function deleteExamPlanRow(index){
  if(!examPlanRows[index]||!confirm('هل تريد حذف خانة السؤال المحددة فقط؟'))return;
  examPlanRows.splice(index,1);renderExamPlanRows();
  showExamAlert('تم حذف خانة السؤال فقط، لم تُحذف بقية الخطة أو أسئلة الاختبار.','info');
}
function renderExamPlanRows(){
  const c=document.getElementById('examPlanRows'); if(!c)return;
  let h='';
  examPlanRows.forEach((r,i)=>{
    const weak=!!r.weakened;
    h+='<div class="exam-plan-row" style="border:1px solid var(--border);padding:12px;border-radius:10px;margin-bottom:10px;'+(weak?'opacity:.65;background:rgba(245,158,11,.08);':'')+'">'+
      '<div class="form-row">'+
      '<div class="form-group"><label>عدد الأسئلة</label><input type="number" min="1" max="50" value="'+(r.count||1)+'" onchange="examPlanRows['+i+'].count=Math.max(1,Math.min(50,parseInt(this.value)||1))"></div>'+
      '<div class="form-group"><label>المستوى</label><select onchange="examPlanRows['+i+'].level=this.value">'+
      '<option value="easy" '+(r.level==='easy'?'selected':'')+'>سهل</option><option value="medium" '+(r.level==='medium'?'selected':'')+'>متوسط</option><option value="hard" '+(r.level==='hard'?'selected':'')+'>صعب</option></select></div>'+
      '<div class="form-group"><label>نع السؤال</label><select onchange="examPlanRows['+i+'].type=this.value;renderExamPlanRows()">'+
      '<option value="mcq" '+(r.type==='mcq'?'selected':'')+'>اختياري</option><option value="truefalse" '+(r.type==='truefalse'?'selected':'')+'>صح/خطأ</option><option value="complete" '+(r.type==='complete'?'selected':'')+'>أكمل</option><option value="audio" '+(r.type==='audio'?'selected':'')+'>تسجيل صوت</option></select></div>'+
      '<div class="form-group"><label>موضع السؤال</label><select onchange="examPlanRows['+i+'].position=this.value"><option value="random" '+((r.position||'random')==='random'?'selected':'')+'>عشوائي ومتنوع</option><option value="start" '+(r.position==='start'?'selected':'')+'>أول السورة</option><option value="middle" '+(r.position==='middle'?'selected':'')+'>وسط السورة</option><option value="end" '+(r.position==='end'?'selected':'')+'>آخر السورة</option></select></div>'+
      '<div class="form-group"><label>وقت السؤال</label><div style="display:flex;gap:6px"><input aria-label="الساعات" title="الساعات" type="number" min="0" max="23" value="'+Math.floor((r.timeLimit||60)/3600)+'" onchange="setExamPlanTime('+i+',\'hours\',this.value)"><input aria-label="الدقائق" title="الدقائق" type="number" min="0" max="59" value="'+Math.floor(((r.timeLimit||60)%3600)/60)+'" onchange="setExamPlanTime('+i+',\'minutes\',this.value)"><input aria-label="الثواني" title="الثواني" type="number" min="0" max="59" value="'+((r.timeLimit||60)%60)+'" onchange="setExamPlanTime('+i+',\'seconds\',this.value)"></div><small style="color:var(--text-light)">ساعات : دقائق : ثوانٍ</small></div>'+
      (r.type==='mcq'?'<div class="form-group"><label>عدد الاختيارات</label><input type="number" min="2" max="6" value="'+(r.optionsCount||4)+'" onchange="examPlanRows['+i+'].optionsCount=Math.max(2,Math.min(6,parseInt(this.value)||4))"></div>':'')+
      (r.type==='complete'?'<div class="form-group"><label>عدد الآيات المراد إكمالها</label><input type="number" min="1" max="20" value="'+(r.completeAyahs||1)+'" onchange="examPlanRows['+i+'].completeAyahs=Math.max(1,Math.min(20,parseInt(this.value)||1))"><small style="color:var(--text-light)">يحدد عدد الآيات التي سيكملها الطالب بعد بداية السؤال</small></div>':'')+
      (r.type==='audio'?'<div class="form-group"><label>عدد الآات المطلوب تسجيلها</label><input type="number" min="1" max="20" value="'+(r.reciteAyahs||1)+'" onchange="examPlanRows['+i+'].reciteAyahs=Math.max(1,Math.min(20,parseInt(this.value)||1))"><small style="color:var(--text-light)">عدد الآيات التي سيقرأها الطالب</small></div>':'')+
      (r.type==='audio'?'<div class="form-group"><label>التسجيل لولي الأمر</label><select onchange="examPlanRows['+i+'].audioShareWithParent=this.value===\'true\'"><option value="true" '+(r.audioShareWithParent!==false?'selected':'')+'>مسموح</option><option value="false" '+(r.audioShareWithParent===false?'selected':'')+'>إخفاء عن ولي الأمر</option></select></div>':'')+
      '<div class="form-group"><label>فحص الغش</label><select onchange="examPlanRows['+i+'].proctorEnabled=this.value===\'true\'"><option value="true" '+(r.proctorEnabled!==false?'selected':'')+'>مفعّل لهذا السؤال</option><option value="false" '+(r.proctorEnabled===false?'selected':'')+'>غير مفعّل</option></select></div>'+
      '<div class="form-group" style="display:flex;align-items:flex-end"><button class="btn btn-xs btn-danger" onclick="deleteExamPlanRow('+i+')">حذف الخانة</button></div>'+
      '</div></div>';
  });
  c.innerHTML=h;
}
function examLevelLabel(l){return l==='easy'?'سهل':l==='hard'?'صعب':'متوسط'}
function normalizeExamText(t){return normalizeAr(t||'').replace(/[إأآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim()}

async function buildExamSourceCandidates(base){
  const baseIdx=ALL_SURAHS_ORDERED.indexOf(base);
  const pool=baseIdx>=0 ? ALL_SURAHS_ORDERED.slice(baseIdx) : ALL_SURAHS_ORDERED.slice();
  const picked=[]; let offset=0;
  while(picked.length<Math.min(12,pool.length)){
    const surah=pool[offset%pool.length]; offset++;
    if(!picked.some(x=>x.surah===surah)){
      const count=Math.min(20,SURAH_AYAH_COUNTS[surah]||5);
      const text=await fetchAyatText(surah,1,count);
      if(text) picked.push({surah,from:1,to:count,text});
    }
    if(offset>pool.length+3) break;
  }
  return picked;
}

let examGenerationTimer=null;
function startExamGenerationProgress(questionCount){
  const overlay=document.getElementById('examGenerationOverlay'),stage=document.getElementById('examGenerationStage'),bar=document.getElementById('examGenerationBar'),eta=document.getElementById('examGenerationEta');
  let elapsed=0,total=Math.max(45,Math.min(180,35+(Math.max(1,questionCount||1)*7)));overlay?.classList.remove('hidden');
  clearInterval(examGenerationTimer);
  const update=function(){const remaining=Math.max(0,total-elapsed),progress=Math.min(94,6+(elapsed/total)*88);if(bar)bar.style.width=progress+'%';if(eta)eta.textContent=remaining>0?'الوقت المتبقي التقريبي: '+String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0'):'يتم الآن إكمال المراجعة النهائية...';if(stage)stage.textContent=elapsed<10?'جلب الآيات ومراجع الأسئلة...':elapsed<Math.round(total*.62)?'ينءءقئ الذكاء الاصطناعي أسئلة المتشابهاتت ويتحقق من الإجابات...':elapsed<Math.round(total*.84)?'تجهيز مراجع صور البداية والنهاية...':'المراجعة النهائية ونع كشف الإجابات...';elapsed++};
  update();examGenerationTimer=setInterval(update,1000);
}
function finishExamGenerationProgress(succeeded){clearInterval(examGenerationTimer);examGenerationTimer=null;const bar=document.getElementById('examGenerationBar'),stage=document.getElementById('examGenerationStage'),eta=document.getElementById('examGenerationEta');if(bar)bar.style.width=succeeded===false?'100%':'100%';if(stage)stage.textContent=succeeded===false?'توقف التوليد — يمكنك إعادة المحاولة':'اكتمل تجهيز الاختبار';if(eta)eta.textContent=succeeded===false?'لم يتم فقد إعداداتك':'الوقت المتبقي: 00:00';setTimeout(function(){document.getElementById('examGenerationOverlay')?.classList.add('hidden')},succeeded===false?900:450)}
function takeExamPlanCount(plans,wanted){let remaining=Math.max(0,wanted),out=[];for(const plan of plans){if(!remaining)break;const count=Math.min(remaining,Math.max(0,parseInt(plan.count)||0));if(count){out.push(Object.assign({},plan,{count}));remaining-=count}}return out}
function expandExamPlans(plans){const out=[];plans.forEach(plan=>{for(let i=0;i<plan.count;i++)out.push(plan)});return out}
function examQuestionFingerprint(q){return [q.type||'',q.surah||'',parseInt(q.from)||0,parseInt(q.to)||0,normalizeExamText(q.prompt||''),normalizeExamText(q.correct||'')].join('|')}
async function generateExamQuestions(){
  const base=document.getElementById('examBaseSurah')?.value||currentRecordMainSurah||'';
  if(!base){showExamAlert('حدّد آخر سورة محفوظة للطالب أولاً.','danger');return}
  const topic='اختبار قرآني متنوع من النطاق الخطة المحددين';
  const plans=examPlanRows.filter(r=>(parseInt(r.count)||0)>0);
  if(!plans.length){showExamAlert('أضف خطة سؤال واحدة على الأقل.','danger');return}
  const btns=document.querySelectorAll('#examBuilderSection button');btns.forEach(b=>b.disabled=true);
  const requestedTotal=plans.reduce((n,r)=>n+(parseInt(r.count)||0),0),sourceMode=getExamSourceMode();let generationSucceeded=false;
  startExamGenerationProgress(requestedTotal);showExamAlert('جاري إنشاء دفعة جديدة من '+(sourceMode==='file'?'الملف المحدد':'الذكاء الاصطناعي مع ا��تحقق القرآني')+'...','info');
  try{
    if(sourceMode==='file'&&!examFilesCache.length)await loadExamFiles();
    const file=examFilesCache.find(f=>f.id===document.getElementById('examFileSource')?.value);if(sourceMode==='file'&&!file)throw new Error('اختر ملف لمرجع أولاً.');
    const normalizedPlans=plans.map(r=>({count:parseInt(r.count)||1,level:r.level,type:r.type,position:['start','middle','end','random'].includes(r.position)?r.position:'random',timeLimit:Math.max(5,Math.min(3600,parseInt(r.timeLimit)||60)),completeAyahs:parseInt(r.completeAyahs)||1,reciteAyahs:parseInt(r.reciteAyahs)||1,audioShareWithParent:r.audioShareWithParent!==false,proctorEnabled:r.proctorEnabled!==false,optionsCount:Math.max(2,Math.min(6,parseInt(r.optionsCount)||4))}));
    const expandedPlans=expandExamPlans(normalizedPlans).map(p=>Object.assign({},p,{count:1})),range=getExamPastRange(),startIndex=ALL_SURAHS_ORDERED.indexOf(range.start),endIndex=ALL_SURAHS_ORDERED.indexOf(range.end);
    const historyCutoff=Date.now()-(120*24*60*60*1000);
    const savedHistory=(getData('aiQuestionHistory',[])||[]).filter(item=>item&&item.fingerprint&&Number(item.lastUsedAt)>=historyCutoff).slice(-2000);
    const existingFingerprints=examQuestions.map(examQuestionFingerprint).concat(savedHistory.map(item=>String(item.fingerprint)));
    const existingSet=new Set(existingFingerprints);let raw=[];
    try{
      const ai=await callStudentAI('generate_exam',{topic,sourceMode,sourceFile:sourceMode==='file'?{id:file.id,name:file.name,text:String(file.text||'').slice(0,60000)}:null,surahNumber:startIndex+1,endSurahNumber:endIndex+1,plan:expandedPlans,pastScope:range.scope,nearSurahs:range.near,farSurahs:range.far,useReferenceFiles:true,excludeEasyShortSurahs:true,studentId:currentRecordStudentId||'',previousQuestionFingerprints:existingFingerprints},0.18);
      raw=Array.isArray(ai)?ai:(ai&&Array.isArray(ai.questions)?ai.questions:[])
    }catch(aiError){
      if(sourceMode==='file')throw aiError;
      raw=await generateLocalQuranQuestions(range.start,range.end,expandedPlans);showExamAlert('استخدم النظام المولد القرآني الاحتياطي بعد تعذر مزودي الذكاء الاصطناعي.','warning')
    }
    const unique=[];for(const q of raw.map(cleanExamQuestion).filter(q=>q.prompt&&q.correct!==undefined)){const fingerprint=examQuestionFingerprint(q);if(existingSet.has(fingerprint))continue;existingSet.add(fingerprint);unique.push(q);if(unique.length===requestedTotal)break}
    if(!unique.length)throw new Error('لم تُنتج ادفعة أسئلة جديدة ��ير مكررة. غيّر النطاق أو الخطة ثم أعد المحاولة.');
    const stamp=Date.now(),added=unique.map((q,index)=>{const plan=expandedPlans[index]||normalizedPlans[0];return {id:'exam_'+stamp+'_'+index,type:plan.type,level:plan.level,surah:q.surah||base,prompt:q.prompt||'',stem:q.stem||'',options:Array.isArray(q.options)?q.options:[],correct:q.correct||'',from:parseInt(q.from)||1,to:parseInt(q.to)||parseInt(q.from)||1,surahNumber:parseInt(q.surahNumber)||0,timeLimit:plan.timeLimit,completeAyahs:plan.completeAyahs,reciteAyahs:plan.reciteAyahs,audioShareWithParent:plan.audioShareWithParent!==false,proctorEnabled:plan.proctorEnabled!==false,points:typeof q.points==='number'?q.points:1,rejected:false,weakened:false,source:q.source||(sourceMode==='file'?'file':'ai-verified'),sourceFileId:q.sourceFileId||'',sourceFileName:q.sourceFileName||'',questionImage:q.questionImage||'',optionsCount:plan.optionsCount||4,pastScope:range.scope}});
    const previousCount=examQuestions.length;examQuestions=examQuestions.concat(added);examEditorActiveIndex=previousCount;
    const now=Date.now(),historyByFingerprint=new Map(savedHistory.map(item=>[String(item.fingerprint),item]));
    added.forEach(q=>{const fingerprint=examQuestionFingerprint(q),previous=historyByFingerprint.get(fingerprint);historyByFingerprint.set(fingerprint,{fingerprint,lastUsedAt:now,useCount:Math.max(0,Number(previous&&previous.useCount)||0)+1,studentId:currentRecordStudentId||'',surah:q.surah||'',from:q.from||1,to:q.to||1,type:q.type||'',level:q.level||''})});
    setData('aiQuestionHistory',Array.from(historyByFingerprint.values()).sort((a,b)=>a.lastUsedAt-b.lastUsedAt).slice(-2000));
    generationSucceeded=true;renderExamQuestions();showExamAlert('تمت إضافة '+added.length+' سؤالاً جديداً، والإجمالي الآن '+examQuestions.length+' سؤالاً. لم تُحذف الأسئلة السابقة.','success');
  }catch(e){showExamAlert((e.message||'تعذر توليد الأسئلة')+' لم يتم حذف أي سؤال سابق.','danger')}
  finally{finishExamGenerationProgress(generationSucceeded);btns.forEach(b=>b.disabled=false)}
}
function addManualExamQuestion(){examQuestions.push({id:'manual_'+Date.now(),type:'mcq',level:'medium',surah:currentRecordMainSurah||'',prompt:'سؤال يدوي',stem:'',options:['','','',''],correct:'',from:1,to:1,timeLimit:60,completeAyahs:1,reciteAyahs:1,audioShareWithParent:true,proctorEnabled:true,points:1,rejected:false,weakened:false,source:'manual'});renderExamQuestions()}
function clearExamQuestions(){examQuestions=[];renderExamQuestions()}
function updateExamQuestion(i,k,v){if(examQuestions[i])examQuestions[i][k]=v}
function setQuestionTime(i,part,value){const q=examQuestions[i];if(!q)return;let total=Math.max(0,parseInt(q.timeLimit)||0),h=Math.floor(total/3600),m=Math.floor((total%3600)/60),s=total%60;const v=Math.max(0,parseInt(value)||0);if(part==='hours')h=Math.min(23,v);if(part==='minutes')m=Math.min(59,v);if(part==='seconds')s=Math.min(59,v);q.timeLimit=Math.max(5,h*3600+m*60+s)}
function formatExamTime(total){total=Math.max(0,parseInt(total)||0);return [Math.floor(total/3600),Math.floor((total%3600)/60),total%60].map(function(v){return String(v).padStart(2,'0')}).join(':')}
function rejectExamQuestion(i){if(examQuestions[i]){examQuestions[i].rejected=true;examQuestions[i].weakened=false;}renderExamQuestions()}
function restoreExamQuestion(i){if(examQuestions[i])examQuestions[i].rejected=false;renderExamQuestions()}
function weakenExamQuestion(i){if(examQuestions[i])examQuestions[i].weakened=!examQuestions[i].weakened;renderExamQuestions()}
function selectExamEditorSlide(i){if(i<0||i>=examQuestions.length)return;examEditorActiveIndex=i;renderExamQuestions()}
function renderExamQuestions(){
  const c=document.getElementById('examQuestionsEditor');if(!c)return;
  const active=examQuestions.filter(q=>!q.rejected);document.getElementById('examCountBadge').textContent=active.length+' سؤال';
  if(!examQuestions.length){c.innerHTML='<div class="alert alert-info">ستظهر شرائح الأسئلة هنا بعد التوليد.</div>';return}
  examEditorActiveIndex=Math.max(0,Math.min(examEditorActiveIndex,examQuestions.length-1));
  const q=examQuestions[examEditorActiveIndex],i=examEditorActiveIndex;
  let h='<div class="exam-slide-strip" role="tablist" aria-label="شرائح أسئلة الاختبار">'+examQuestions.map((item,index)=>'<button type="button" role="tab" aria-selected="'+(index===i)+'" class="exam-slide-tab '+(index===i?'active ':'')+(item.rejected?'expired':'')+'" onclick="selectExamEditorSlide('+index+')" title="السؤال '+(index+1)+'">'+(index+1)+'</button>').join('')+'</div>';
  h+='<div class="exam-question exam-slide-panel '+(q.rejected?'rejected':'')+'">'+
    '<div class="exam-question-header"><strong>السؤال '+(i+1)+' من '+examQuestions.length+' — '+examLevelLabel(q.level)+'</strong>'+(q.rejected?'<button class="btn btn-xs btn-warning" onclick="restoreExamQuestion('+i+')">استرجاع</button>':'<button class="btn btn-xs btn-danger" onclick="rejectExamQuestion('+i+')">رفض السؤال</button>')+'</div>'+
    quranQuestionMediaHtml(q,i)+
    '<div class="form-row"><div class="form-group"><label>النوع</label><select onchange="updateExamQuestion('+i+',\'type\',this.value);renderExamQuestions()"><option value="mcq" '+(q.type==='mcq'?'selected':'')+'>اختياري</option><option value="truefalse" '+(q.type==='truefalse'?'selected':'')+'>صح/خطأ</option><option value="complete" '+(q.type==='complete'?'selected':'')+'>أكمل</option><option value="audio" '+(q.type==='audio'?'selected':'')+'>تسجيل صوت</option></select></div>'+
    '<div class="form-group"><label>لمستوى</label><select onchange="updateExamQuestion('+i+',\'level\',this.value)"><option value="easy" '+(q.level==='easy'?'selected':'')+'>سهل</option><option value="medium" '+(q.level==='medium'?'selected':'')+'>متوسط</option><option value="hard" '+(q.level==='hard'?'selected':'')+'>ءءعب</option></select></div>'+
    '<div class="form-group"><label>زمن السؤال</label><div style="display:flex;gap:6px"><input aria-label="الساعات" type="number" min="0" max="23" value="'+Math.floor((q.timeLimit||30)/3600)+'" onchange="setQuestionTime('+i+',\'hours\',this.value)"><input aria-label="الدقائق" type="number" min="0" max="59" value="'+Math.floor(((q.timeLimit||30)%3600)/60)+'" onchange="setQuestionTime('+i+',\'minutes\',this.value)"><input aria-label="الثواني" type="number" min="0" max="59" value="'+((q.timeLimit||30)%60)+'" onchange="setQuestionTime('+i+',\'seconds\',this.value)"></div><small style="color:var(--text-light)">ساعات : دقائق : ثوانٍ</small></div>'+ 
    (q.type==='complete'?'<div class="form-group"><label>عدد آيات الإكمال</label><input type="number" min="1" max="20" value="'+(q.completeAyahs||1)+'" onchange="updateExamQuestion('+i+',\'completeAyahs\',parseInt(this.value)||1)"></div>':'')+
    (q.type==='audio'?'<div class="form-group"><label>التسجيل لولي الأمر</label><select onchange="updateExamQuestion('+i+',\'audioShareWithParent\',this.value===\'true\')"><option value="true" '+(q.audioShareWithParent!==false?'selected':'')+'>مس��وح</option><option value="false" '+(q.audioShareWithParent===false?'selected':'')+'>إخفاء</option></select></div>':'')+
    '<div class="form-group"><label>فحص الغش لهذا السؤال</label><select onchange="updateExamQuestion('+i+',\'proctorEnabled\',this.value===\'true\')"><option value="true" '+(q.proctorEnabled!==false?'selected':'')+'>مفعّل</option><option value="false" '+(q.proctorEnabled===false?'selected':'')+'>غير مفعّل</option></select></div></div>'+
    '<div class="form-group"><label>تعليمات السؤال (ئن دون الإجابة)</label><input value="'+escapeHtml(q.prompt||'')+'" onchange="updateExamQuestion('+i+',\'prompt\',this.value)"></div>'+ 
    '<div class="form-group"><label>السورة</label><input value="'+escapeHtml(q.surah||'')+'" onchange="updateExamQuestion('+i+',\'surah\',this.value)"><small style="color:var(--text-light)">حدود الآيات محفوظة داخلياً للصورة والتصح��ح ولا تظهر كخانات في السؤال.</small></div>';
  if(q.type==='mcq'||q.type==='truefalse')h+='<div class="form-group"><label>الاختيارات (كل اختيار في سطر)</label><textarea rows="4" onchange="updateExamQuestion('+i+',\'options\',this.value.split(/\\n/).map(x=>x.trim()).filter(Boolean))">'+escapeHtml((q.options||[]).join('\n'))+'</textarea></div><div class="form-group"><label>الإجابة الصحيحة — لا تظهر للطالب</label><input value="'+escapeHtml(q.correct||'')+'" onchange="updateExamQuestion('+i+',\'correct\',this.value)"></div>';
  else if(q.type==='complete')h+='<div class="form-group"><label>الإجابة المرجعية — لا تظهر للطالب</label><textarea rows="3" onchange="updateExamQuestion('+i+',\'correct\',this.value)">'+escapeHtml(q.correct||'')+'</textarea></div>';
  else h+='<div class="alert alert-info">سيتم التحقق من بصمة الطالب أولاً، ثم من محتوى التلوة. إذا كانت البصمة غير طابقة فلن يُحفظ التسجيل.</div>';
  h+='</div>';c.innerHTML=h;
}
function showExamAlert(t,type){const e=document.getElementById('examBuilderAlert');if(e)e.innerHTML='<div class="alert alert-'+(type||'info')+'">'+t+'</div>'}
function saveExamDraft(){
  const id=parseInt(document.getElementById('recordStudentId').value);let students=getData('students');const i=students.findIndex(s=>s.id===id);const qs=examQuestions.filter(q=>!q.rejected).map(cleanExamQuestion);
  if(i<0||!qs.length){showExamAlert('أضف سؤالاً واحداً على الأقل قبل الحفظ.','danger');return}
  const totalSeconds=qs.reduce((n,q)=>n+Math.max(5,parseInt(q.timeLimit)||60),0);
  const deadlineValue=document.getElementById('examDeadline')?.value||'';const deadlineAt=deadlineValue?new Date(deadlineValue).getTime():Date.now()+24*60*60*1000;if(!Number.isFinite(deadlineAt)||deadlineAt<=Date.now()){showExamAlert('حدد موعد انتهاء لاحقاً للوقت الحالي.','danger');return}
  const lastSurah=document.getElementById('examLastSurah')?.value||currentRecordMainSurah;
  students[i].activeExam={id:'exam_'+Date.now(),date:document.getElementById('recordDate').value||new Date().toISOString().split('T')[0],questions:JSON.parse(JSON.stringify(qs)),totalSeconds,status:'pending',createdAt:Date.now(),deadlineAt,baseSurah:currentRecordMainSurah,lastSurah};
  setData('students',students);
  notifyStudentExam(students[i]);
  showExamAlert(' تم إرسال الاختبار للطالب ع أزمنة منفصلة لكل سؤال.','success');showToast('🧪 تم إرسال الاختبار للطالب','success');
}
function cancelExamDraft(){const id=parseInt(document.getElementById('recordStudentId').value);let students=getData('students');const i=students.findIndex(s=>s.id===id);if(i>=0){students[i].activeExam=null;setData('students',students)}showExamAlert('تم إلغاء الاختبار الحالي.','info')}

// نغمة تنبيه شبيهة بنغمة رسائل واتساب (نغمتان متتاليتان)
function playNotifyChime(){
  try{
    const C=window.AudioContext||window.webkitAudioContext; if(!C)return;
    const ctx=new C();
    const tone=(freq,start,dur)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq;g.gain.setValueAtTime(0,ctx.currentTime+start);g.gain.linearRampToValueAtTime(.12,ctx.currentTime+start+.02);g.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+start+dur);o.connect(g);g.connect(ctx.destination);o.start(ctx.currentTime+start);o.stop(ctx.currentTime+start+dur+.02);};
    tone(1318,0,.16);   // مي عالي
    tone(1760,.16,.22); // لا أعلى
    setTimeout(()=>{try{ctx.close()}catch(e){}},700);
  }catch(e){}
}
function notifyStudentExam(student){
  const title='📚 اختبار جديد من المسؤول'; const body='تم إرسال اختبار جديد إليك. افت النظام وابدأ الاختبار.';
  try{ if('Notification' in window && Notification.permission==='granted') new Notification(title,{body}); else if('Notification' in window && Notification.permission==='default') Notification.requestPermission().then(p=>{if(p==='granted')new Notification(title,{body})}).catch(()=>{}); }catch(e){}
  playNotifyChime();
  let msgs=getData('messages');msgs.push({type:'system',sender:'النظام',senderId:0,receiverType:'student',receiverId:student.id,text:body,time:new Date().toLocaleString('ar-EG'),approved:true,read:false,examNotification:true});setData('messages',msgs);
}
function notifyStudentExamOnce(student){
  const key='student_exam_notice_'+student.id+'_'+(student.activeExam?.id||'');
  if(sessionStorage.getItem(key))return;
  sessionStorage.setItem(key,'1');
  try{if('Notification' in window&&Notification.permission==='granted')new Notification('📚 اختبار جديد',{body:'لديك اختبار جديد من المسؤول. افتحه الآن.'});}catch(e){}
  playNotifyChime();
}

function saveManualBoardEdit(){const id=parseInt(document.getElementById('recordStudentId').value);let students=getData('students');const i=students.findIndex(s=>s.id===id);if(i<0)return;students[i].manualBoard={text:document.getElementById('manualBoardText').value,image:document.getElementById('manualBoardImage').value,updatedAt:Date.now()};setData('students',students);showToast('🖼️ تم حفظ التعديل اليدوي مع بقاء الاختيار التلقائي فعالاً','success')}
function escapeHtml(s){return String(s||'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
function viewStudentExamSlide(i){const ex=currentUser&&currentUser.activeExam;if(!ex||i<0||i>studentExamCurrentIndex)return;studentExamViewIndex=i;renderStudentExam()}
function renderStudentExam(){
  const c=document.getElementById('studentExamContent');if(!c)return;
  const s=currentUser,ex=s&&s.activeExam;
  if(ex&&ex.status==='pending'&&studentExamSessionId!==ex.id){studentExamSessionId=ex.id;studentExamCurrentIndex=0;studentExamViewIndex=0;studentExamQuestionRemaining=ex.questions.map(q=>Math.max(5,parseInt(q.timeLimit)||60));studentExamQuestionStartedAt=[];studentExamQuestionElapsed=[];studentExamLockedIndices={};studentExamAnswers=new Array(ex.questions.length).fill('');studentExamAudioAnswers=new Array(ex.questions.length).fill(null)}
  if(!ex||ex.status!=='pending'){const latest=(s&&s.examResults||[]).slice(-1)[0];c.innerHTML=latest?renderStudentResultHtml(latest):'<div class="alert alert-info">لا يوجد اختبار نشط حاءءياً.</div>';return}
  if(ex.deadlineAt&&Date.now()>=ex.deadlineAt){notifyExamExpired(s,ex);submitStudentExam(true);return}
  if(typeof studentExamCurrentIndex!=='number'||studentExamCurrentIndex<0)studentExamCurrentIndex=0;
  const requiredQuestion=ex.questions[studentExamCurrentIndex],questionNeedsProctor=requiredQuestion&&requiredQuestion.proctorEnabled!==false,questionAuthId=ex.id+':'+studentExamCurrentIndex;
  if(!questionNeedsProctor&&proctor.active){proctorStop(true);proctorExamAuthorizedId=''}
  if(questionNeedsProctor&&(proctorExamAuthorizedId!==questionAuthId||!proctor.active)){c.innerHTML='<div class="alert alert-info"><h3>التحقق الأمني مطلوب لهذا السؤال</h3><p>يبدأ وقت السؤال فقط بعد نءءاح فحص العي�� والوجه ووضع إصبع واحد ءءلى الشاشة. يمكن تحريكهما بحرية، وتوجد مهلة 12 ثانية لإعادتهما.</p><button class="btn btn-primary" onclick="openProctorGate({type:\'exam\',id:\''+escapeHtml(ex.id)+'\',questionIndex:'+studentExamCurrentIndex+'},function(){proctorExamAuthorizedId=\''+escapeHtml(questionAuthId)+'\';renderStudentExam()})">بدء فحص السؤال</button></div>';return}
  if(studentExamCurrentIndex>=ex.questions.length){submitStudentExam(true);return}
  studentExamViewIndex=Math.max(0,Math.min(studentExamViewIndex,studentExamCurrentIndex));
  const i=studentExamViewIndex,q=ex.questions[i],isCurrent=i===studentExamCurrentIndex;
  const currentQuestion=ex.questions[studentExamCurrentIndex],remaining=Math.max(0,studentExamQuestionRemaining[studentExamCurrentIndex]||parseInt(currentQuestion.timeLimit)||60);
  let h=(questionNeedsProctor?proctorLiveBar():'')+'<div class="exam-sticky"><strong>اختبار '+escapeHtml(ex.baseSurah?'بعد سورة '+ex.baseSurah:'')+'</strong><div style="margin-top:6px">السؤال الحالي '+(studentExamCurrentIndex+1)+' من '+ex.questions.length+' — <span id="studentExamTimer" class="exam-timer">الوقت: '+formatExamTime(remaining)+'</span></div><div>لكل سؤال وقت مستقل. الشءءا��ح الساب��ة للعرض فقط، والقادمة تُفتح بعد تأكيد الإجابة.</div></div>';
  h+='<div class="exam-slide-strip" role="tablist" aria-label="شرائح أسئلة الاختبار">'+ex.questions.map((item,index)=>{const future=index>studentExamCurrentIndex,complete=!!studentExamLockedIndices[index]&&studentExamQuestionRemaining[index]>0,expired=!!studentExamLockedIndices[index]&&studentExamQuestionRemaining[index]===0;return '<button type="button" role="tab" aria-selected="'+(index===i)+'" '+(future?'disabled':'')+' class="exam-slide-tab '+(index===i?'active ':'')+(complete?'complete ':'')+(expired?'expired ':'')+(future?'locked':'')+'" onclick="viewStudentExamSlide('+index+')" title="السؤال '+(index+1)+'">'+(index+1)+'</button>'}).join('')+'</div>';
  h+='<div id="studentExamQuestions"><div class="exam-question exam-slide-panel" id="examQuestionBox_'+i+'"><div class="exam-question-header"><h4>السؤال '+(i+1)+': '+escapeHtml(q.prompt||'')+'</h4>'+(isCurrent?'<span id="examQTimer_'+i+'" class="badge badge-warning">الوقت: '+formatExamTime(remaining)+'</span>':'<span class="badge badge-success">تم تأكيد هذ�� السؤال</span>')+'</div>'+
    quranQuestionMediaHtml(q,i);
  if(q.type==='mcq'||q.type==='truefalse')(q.options||[]).forEach(o=>{h+='<label class="exam-option"><input type="radio" name="examq_current" value="'+escapeHtml(o)+'" '+(studentExamAnswers[i]===o?'checked':'')+' '+(!isCurrent?'disabled':'')+' onchange="markExamAnswer('+i+',this.value)"> '+escapeHtml(o)+'</label>'});
  else if(q.type==='complete')h+='<input class="form-group" style="width:100%;padding:12px" id="examComplete_'+i+'" value="'+escapeHtml(studentExamAnswers[i]||'')+'" placeholder="اكتب الإكمال هنا" '+(!isCurrent?'disabled':'')+' oninput="studentExamAnswers['+i+']=this.value">';
  else h+=isCurrent?'<div id="examAudioArea_'+i+'">'+studentExamAudioHTML(i)+'</div>':'<div class="alert alert-info">تم حفظ التسجيل الخاص بهذا السؤال.</div>';
  h+='</div></div>';
  if(isCurrent)h+='<button id="confirmExamAnswerBtn" class="btn btn-primary" onclick="confirmStudentExamAnswer('+i+')" style="width:100%;margin-top:15px">'+(i===ex.questions.length-1?'تأكيد الإجابة وإنهاء الاختبار':'تأكيد الإجابة والانتقال للسؤال التالي')+'</button>';
  else h+='<button class="btn btn-secondary" onclick="viewStudentExamSlide('+studentExamCurrentIndex+')" style="width:100%;margin-top:15px">العودة ��لى السؤال الحالي</button>';
  c.innerHTML=h;bindLiveProctorHold();
  if(!studentExamQuestionStartedAt[studentExamCurrentIndex])studentExamQuestionStartedAt[studentExamCurrentIndex]=Date.now();
  if(!studentExamQuestionRemaining[studentExamCurrentIndex])studentExamQuestionRemaining[studentExamCurrentIndex]=Math.max(5,parseInt(currentQuestion.timeLimit)||60);
  startStudentExamTimer(ex);
}
function markExamAnswer(i,v){if(studentExamLockedIndices[i])return;studentExamAnswers[i]=v;}
function startStudentExamTimer(ex){
  clearInterval(studentExamTimer); clearInterval(studentExamQuestionTimer);
  const i=studentExamCurrentIndex;
  if(!ex.questions[i])return;
  if(!studentExamQuestionRemaining[i])studentExamQuestionRemaining[i]=Math.max(5,parseInt(ex.questions[i].timeLimit)||60);
  if(!studentExamQuestionStartedAt[i])studentExamQuestionStartedAt[i]=Date.now();
  studentExamQuestionTimer=setInterval(()=>{
    if(studentExamLockedIndices[i]){clearInterval(studentExamQuestionTimer);return;}
    studentExamQuestionRemaining[i]=Math.max(0,studentExamQuestionRemaining[i]-1);
const el=document.getElementById('examQTimer_'+i);if(el)el.textContent='الوقت: '+formatExamTime(studentExamQuestionRemaining[i]);
const top=document.getElementById('studentExamTimer');if(top)top.textContent='الوت: '+formatExamTime(studentExamQuestionRemaining[i]);
    if(studentExamQuestionRemaining[i]===0){clearInterval(studentExamQuestionTimer);expireExamQuestion(i);}
  },1000);
}
function confirmStudentExamAnswer(i){
  const ex=currentUser&&currentUser.activeExam;if(!ex||i!==studentExamCurrentIndex||studentExamLockedIndices[i])return;
  if(ex.questions[i].type==='complete'){const el=document.getElementById('examComplete_'+i);studentExamAnswers[i]=el?el.value.trim():'';}
  if(ex.questions[i].type!=='audio' && !studentExamAnswers[i]){showToast('اختر أو اكتب الإجابة أولاً','error');return;}
  studentExamLockedIndices[i]=true; clearInterval(studentExamQuestionTimer); studentExamQuestionElapsed[i]=Math.max(0,Math.round((Date.now()-(studentExamQuestionStartedAt[i]||Date.now()))/1000));
  if(i<ex.questions.length-1){
    studentExamCurrentIndex=i+1;studentExamViewIndex=studentExamCurrentIndex;
    studentExamQuestionRemaining[studentExamCurrentIndex]=Math.max(5,parseInt(ex.questions[studentExamCurrentIndex].timeLimit)||60);
    studentExamQuestionStartedAt[studentExamCurrentIndex]=Date.now();
    renderStudentExam(); startStudentExamTimer(ex);
  }else submitStudentExam(false);
}
function expireExamQuestion(i){
  const ex=currentUser&&currentUser.activeExam;if(!ex||i!==studentExamCurrentIndex)return;
  studentExamLockedIndices[i]=true;studentExamAnswers[i]=studentExamAnswers[i]||'';studentExamQuestionElapsed[i]=Math.max(0,Math.round((Date.now()-(studentExamQuestionStartedAt[i]||Date.now()))/1000));
  const box=document.getElementById('examQuestionBox_'+i);if(box){box.style.opacity='.65';box.querySelectorAll('input,button,textarea').forEach(el=>el.disabled=true);}
  const t=document.getElementById('examQTimer_'+i);if(t)t.textContent='⏱️ انتهى الوقت';
  setTimeout(()=>{
    if(i<ex.questions.length-1){
      studentExamCurrentIndex=i+1;studentExamViewIndex=studentExamCurrentIndex;studentExamQuestionRemaining[studentExamCurrentIndex]=Math.max(5,parseInt(ex.questions[studentExamCurrentIndex].timeLimit)||60);
      studentExamQuestionStartedAt[studentExamCurrentIndex]=Date.now();renderStudentExam();startStudentExamTimer(ex);
    }else submitStudentExam(true);
  },350);
}
async function submitStudentExam(auto){
  const s=currentUser;if(!s||!s.activeExam)return;clearInterval(studentExamTimer);clearInterval(studentExamQuestionTimer);proctorStop(true);proctorExamAuthorizedId='';
  const ex=JSON.parse(JSON.stringify(s.activeExam)); let answers=[]; let score=0;
  for(let i=0;i<ex.questions.length;i++){
    const q=ex.questions[i]; let a=studentExamAnswers[i]||''; if(q.type==='complete'){const el=document.getElementById('examComplete_'+i);a=el?el.value.trim():''}
    const audio=studentExamAudioAnswers[i]||null; let result={accepted:false,score:0,reason:'لم تتم الإجابة',matchedPercent:0,mistakes:[],missingAyahs:[]};
    if(q.type==='mcq'||q.type==='truefalse'){
      result.accepted=normalizeExamText(a)===normalizeExamText(q.correct);result.score=result.accepted?1:0;result.matchedPercent=result.accepted?100:0;result.reason=result.accepted?'إجابة صحيحة':'الإجابة غير صحيحة';
    }else if(q.type==='complete'){
      try{result=await callStudentAI('grade_text',{question:q.prompt,expected:q.correct,studentAnswer:a,sourceAyah:q.stem},0.05)}catch(e){result.accepted=normalizeExamText(a)===normalizeExamText(q.correct);result.score=result.accepted?1:0;result.reason='ءءم التصحيح حلياً بسبب تعذر الذكاء الاصطناعي'}
    }else if(q.type==='audio'){
      result=audio&&audio.aiResult?audio.aiResult:{accepted:false,score:0,reason:'لم يتم تسجيل إجابة صوتية',matchedPercent:0};
      a=audio&&audio.transcript?audio.transcript:'';
    }
    // الدرجة النهائية تعتمد على عدد الآيات المطلوبة والناقصة، لا على حكم النموذج وحده.
    if((q.type==='complete'||q.type==='audio') && Array.isArray(result.missingAyahs)){
      const totalAyahs=Math.max(1,parseInt(q.completeAyahs)||((parseInt(q.to)||parseInt(q.from)||1)-(parseInt(q.from)||1)+1));
      const missing=Math.min(totalAyahs,result.missingAyahs.length);
      const byAyah=(totalAyahs-missing)/totalAyahs;
      result.score=Math.min(Math.max(0,Number(result.score)||0),byAyah);
      result.matchedPercent=Math.min(100,Math.max(0,Number(result.matchedPercent)||Math.round(byAyah*100)));
      result.scoring={totalAyahs,missingAyahs:missing,method:'(total-missing)/total'};
    }
    const pts=Math.max(0,Math.min(1,Number(result.score)||0)); score+=pts;
    answers.push({answer:a,correct:pts>=1,score:pts,timeSeconds:Math.max(0,Number(studentExamQuestionElapsed[i])||0),aiResult:result,audioData:audio&&audio.dataUrl?audio.dataUrl:null,audioShareWithParent:q.audioShareWithParent!==false});
  }
  const hasAudio=ex.questions.some(q=>q.type==='audio');ex.status=hasAudio?'pending_audio_review':'graded';ex.submittedAt=Date.now();ex.answers=answers;ex.score=score;ex.maxScore=ex.questions.reduce((n,q)=>n+(Number(q.points)||1),0);ex.totalDurationSeconds=Math.round((Date.now()-(ex.createdAt||Date.now()))/1000);ex.autoSubmitted=!!auto;ex.reviewedAt=hasAudio?null:Date.now();
  let students=getData('students');const idx=students.findIndex(x=>x.id===s.id);if(idx<0)return;students[idx].activeExam=null;students[idx].examResults=students[idx].examResults||[];students[idx].examResults.push(ex);students[idx].completedTasks=students[idx].completedTasks||[];students[idx].completedTasks.push({type:'exam',name:'اختبار '+ex.date,date:ex.date,completedAt:new Date().toLocaleString('ar-EG'),score,maxScore:ex.maxScore});setData('students',students);currentUser=students[idx];
  let msgs=getData('messages');const resultText=hasAudio?'تم تسليم الاختبار الصوتي والنتيجة معلقة حتى مراجعة المسؤول':'��م تسليم الاختبار — النتيجة '+score+'/'+ex.maxScore;msgs.push({type:'student',sender:s.name,senderId:s.id,receiverType:'admin',text:resultText,exam:ex,time:new Date().toLocaleString('ar-EG'),approved:true,read:false});
  msgs.push({type:'system',sender:'النظام',senderId:0,receiverType:'parent',receiverName:s.parent,text:hasAudio?'تم استلام اختبار '+s.name+' والنتيجة معلقة لمراجعة اتسجيل الصوتي':'نتيجة اختبا�� '+s.name+': '+score+'/'+ex.maxScore+' — الزمن '+ex.totalDurationSeconds+' ثانية',examSummary:{date:ex.date,score,maxScore:ex.maxScore,duration:ex.totalDurationSeconds,status:ex.status},time:new Date().toLocaleString('ar-EG'),approved:true,read:false});
  setData('messages',msgs);renderStudentExamResult(ex);showToast('✅ تم تصحيح الاختبار وإرساله للمسؤول وولي الأمر','success');
}

let studentExamAudioAnswers=[];
async function recordStudentExamAudio(i){
  const q=currentUser.activeExam.questions[i];const btn=document.getElementById('examVoiceBtn_'+i),status=document.getElementById('examAudioStatus_'+i),preview=document.getElementById('examAudioPreview_'+i),aiBox=document.getElementById('examAudioAI_'+i);
  if(!btn||!status)return;
  if(btn.dataset.recording==='true')return;
  try{
    const stream=await safeGetMic();const recorder=new MediaRecorder(stream),chunks=[];const asr=startArabicASR();btn.dataset.recording='true';btn.classList.add('recording');status.textContent='جاري التسجيل... اضغط مر أخرى للإيقاف';
    recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    recorder.onstop=async()=>{
      stream.getTracks().forEach(t=>t.stop());if(asr)asr.stop();await new Promise(r=>setTimeout(r,400));
      const blob=new Blob(chunks,{type:'audio/webm'});const dataUrl=await blobToDataURL(blob);const transcript=asr?(asr.text||''):'';preview.src=URL.createObjectURL(blob);preview.style.display='block';status.textContent='🤖 جاري التحقق من البصمة والمحتوى...';
      const identity=await verifyVoiceIdentity(blob,currentUser);const match=identity?identity.pct:null;
      if(match!==null && (match<VOICE_MATCH_THRESHOLD || identity.sameSpeaker===false)){status.textContent='❌ البصمة غير مطابقة — لم يُحفظ التسجيل';aiBox.innerHTML='<div class="alert alert-danger">🚫 هذا التسجيل لا يطابق بصمة الطالب ('+match+'%). أعد التسجيل بصوت الطالب نفسه.</div>';showToast('❌ التسجيل غير مطابق للبصمة ولم يتم حفظه','error');studentExamAnswers[i]='';studentExamAudioAnswers[i]=null;btn.dataset.recording='false';btn.classList.remove('recording');return;}
      // تحليل الصوت على الخادم (تفريغ حقيقي + تصحيح) مع احتياطي المتصفح
      let aiResult=await serverRecitationAnalysis(blob,{surah:q.surah,from:q.from,to:q.to});
      let usedTranscript=transcript;
      if(aiResult){ usedTranscript=aiResult.transcript||transcript; }
      else {
        try{const expected=await fetchAyatText(q.surah,q.from,q.to);aiResult=await callStudentAI('grade_recitation',{surah:q.surah,from:q.from,to:q.to,expectedText:expected,studentTranscript:transcript,studentVoiceMatch:match},0.05)}catch(e){aiResult={accepted:false,score:0,matchedPercent:0,reason:'تعذر الاتصال بالذكاء الاصطنءءي لتصحيح محتوى التلاوة'};}
      }
      studentExamAudioAnswers[i]={dataUrl,transcript:usedTranscript,voiceMatch:match,aiResult};studentExamAnswers[i]=usedTranscript;
      const pct=aiResult.matchedPercent??0;status.textContent='تم استلام التسجيل بنجاح — النتيجة التفصيلية بانتظار مراجعة المسؤول';
      aiBox.innerHTML='<div class="alert alert-info">🔒 تم حفظ إجاءءة التسجيل ونتيجة التحليل داخلياً. لن تظهر نتجة الذكاء الاصطناعي للطالب حتى يقرر المسؤول نشرها.</div>';
      btn.dataset.recording='false';btn.classList.remove('recording');
    };
    recorder.start();registerAudioRecorder('exam-'+i,recorder,stream,{statusId:'examAudioStatus_'+i,buttonId:'examVoiceBtn_'+i});btn.onclick=()=>{if(recorder.state!=='inactive')recorder.stop()};
  }catch(e){status.textContent='تعذر الوصول إلى الميكروفن';btn.dataset.recording='false';btn.classList.remove('recording')}
}
function renderStudentResultHtml(ex){if(ex.status==='pending_audio_review')return '<div class="alert alert-warning"><h3>تم استلام الاختئار</h3><p>النتيجة معلّقة لحين مراجعة المئؤول للتسجيل الصوتي.</p></div>';let h='<div class="alert alert-success"><h3>النتيجءء النهائية: '+ex.score+' / '+ex.maxScore+'</h3><p>تم حفظ جميع إجاباتك وإرسالها للمسؤول.</p></div>';if(ex.questions&&ex.answers){h+='<details open><summary>مراجعة إجاباتك</summary>';ex.questions.forEach((q,i)=>{const a=ex.answers[i]||{};h+='<div class="task-card"><strong>س'+(i+1)+':</strong> '+escapeHtml(q.prompt||'')+'<br>إجابتك: '+escapeHtml(a.answer||'—')+'<br>الءءقييم: '+(a.score>=1?'صحيحة':'غير صحيحة')+'</div>'});h+='</details>'}return h}
function renderStudentExamResult(ex){const c=document.getElementById('studentExamContent');if(c)c.innerHTML=renderStudentResultHtml(ex)}
function notifyExamExpired(student,ex){if(ex.expiryNotified)return;ex.expiryNotified=true;const text='انتهى الوقت المحدد لاختبار '+student.name+' بتاريخ '+(ex.date||'');let msgs=getData('messages');msgs.push({type:'system',sender:'النظام',receiverType:'student',receiverId:student.id,text,time:new Date().toLocaleString('ar-EG'),approved:true,read:false,expiryKey:ex.id});msgs.push({type:'system',sender:'النظام',receiverType:'parent',receiverName:student.parent,text,time:new Date().toLocaleString('ar-EG'),approved:true,read:false,expiryKey:ex.id});msgs.push({type:'system',sender:'النظام',receiverType:'admin',text,studentId:student.id,parentPhone:student.parentPhone||student.parentMobile||'',time:new Date().toLocaleString('ar-EG'),approved:true,read:false,expiryKey:ex.id});setData('messages',msgs)}
function examWhatsAppLink(phone,text){const p=String(phone||'').replace(/\D/g,'').replace(/^0/,'20');return p?'https://wa.me/'+p+'?text='+encodeURIComponent(text):''}
function checkExamDeadlines(){let students=getData('students',[]),changed=false;students.forEach(s=>{const ex=s.activeExam;if(ex&&ex.status==='pending'&&ex.deadlineAt&&Date.now()>=ex.deadlineAt&&!ex.expiryNotified){notifyExamExpired(s,ex);changed=true}});if(changed)setData('students',students)}
setInterval(checkExamDeadlines,30000);setTimeout(checkExamDeadlines,1500);
function reviewAudioExam(studentId,examId,accepted){let students=getData('students'),s=students.find(x=>x.id===studentId);if(!s)return;let ex=(s.examResults||[]).find(x=>x.id===examId);if(!ex)return;ex.answers.forEach((a,i)=>{if(ex.questions[i]?.type==='audio'){a.score=accepted?1:0;a.correct=accepted;a.aiResult=Object.assign({},a.aiResult,{accepted,score:accepted?1:0,reason:accepted?'اعتمد المسؤول اتسجيل مطابقاً':'قرر المؤول أن الت��جيل غير مطابق'})}});ex.score=ex.answers.reduce((n,a)=>n+(Number(a.score)||0),0);ex.status='graded';ex.reviewedAt=Date.now();setData('students',students);renderMessages();showToast('تم اعتماد مراجعة التسجيل الصوتي','success')}

function renderParentExamResults(s){
  let arr=s.examResults||[];if(!arr.length)return '';
  let h='<div class="page" style="margin-top:15px;border-right:5px solid var(--info)"><h4 style="color:var(--info)">🧪 نتائج الاختبارات</h4>';
  arr.slice().reverse().forEach(ex=>{h+='<div class="history-element"><div class="history-element-name">📅 '+escapeHtml(ex.date||'')+'</div><div class="history-element-details"><div class="history-detail"><strong>الدرجة:</strong> '+ex.score+'/'+ex.maxScore+'</div><div class="history-detail"><strong>الوت:</strong> '+ex.totalDurationSeconds+' ثانية</div></div>';
    if(ex.answers&&ex.questions){h+='<details style="margin-top:10px"><summary>ءء️ عرءء إجابات الطالب</summary>';ex.questions.forEach((q,i)=>{const a=ex.answers[i]||{},r=a.aiResult||{};h+='<div class="task-card"><strong>س'+(i+1)+':</strong> '+escapeHtml(q.prompt||'')+'<br><span>إجابة الطالب: '+escapeHtml(a.answer||'—')+'</span><br><span>النتيجة: '+(a.score>=1?'✅ كاملة':a.score===.5?'🟡 نصف درجة':'❌ غير صحيحة')+'</span>'+(r.reason?'<br><span>تقرير AI: '+escapeHtml(r.reason)+'</span>':'');if(q.type==='audio'&&a.audioData&&a.audioShareWithParent!==false){h+='<div style="margin-top:8px">🎙️ التسجيل: <audio controls src="'+a.audioData+'" style="height:38px"></audio></div>'}h+='</div>'});h+='</details>'}h+='</div>'});
  return h+'</div>';
}

function saveSession(isFinal) {
  const id = parseInt(document.getElementById('recordStudentId').value);
  let students = getData('students');
  const idx = students.findIndex(s => s.id === id);
  if(idx === -1) return;
  let date = document.getElementById('recordDate').value;
  if(!date){ date = new Date().toISOString().split('T')[0]; document.getElementById('recordDate').value = date; }
  const notes = document.getElementById('recordNotes').value;
  if(!students[idx].sessions) students[idx].sessions = [];

  const activeElements = recordElements.filter(e => !e.deleted);
  if(activeElements.length === 0) { showToast('ءءءء لم يتم الحفظ — لا يوجد ءءنصر تسمءءع', 'error'); return; }
  const totalScore = activeElements.reduce((sum, e) => sum + (parseInt(e.rating) || 0), 0);
  const nowText = new Date().toLocaleString('ar-EG');
  const previousTasks = JSON.parse(JSON.stringify(students[idx].tasks || []));

  // المسودة: تبقى ��لمهام ظاهرة وقابلة للتنفيذ.
  if(!isFinal) {
    students[idx].sessions = students[idx].sessions.filter(s => !s.isDraft);
    students[idx].sessions.push({
      date, elements: JSON.parse(JSON.stringify(activeElements)), homework: JSON.parse(JSON.stringify(homeworkItems)),
      reading: JSON.parse(JSON.stringify(readingItems)), totalScore, notes, isDraft:true, draftCreatedAt:Date.now(),
      homeworkApproved:false, readingApproved:false, voiceApproved:false, homeworkRejected:false, readingRejected:false,
      voiceRejected:false, sentToStudent:true, status:'مسودة - قيد التعديل'
    });
    students[idx].tasks = [];
    let taskCounter=0;
    activeElements.forEach(el=>{
      const _sur=(el.name==='اللوح'||el.name==='السورة')?(el.surah||currentRecordMainSurah):el.surah;
      if(el.isHomework) students[idx].tasks.push({type:'homework',name:el.name,surah:_sur,from:el.from,to:el.to,showAyat:!!el.showAyat,approved:false,rejected:false,submitted:false,date,sentAt:Date.now(),originalTaskIndex:taskCounter++});
      if(el.isVoice) students[idx].tasks.push({type:'voice',name:el.name,surah:_sur,from:el.from,to:el.to,showAyat:!!el.showAyat,proctorEnabled:el.proctorEnabled!==false,proctorTouchGrace:Math.max(3,parseInt(el.proctorTouchGrace)||12),proctorGazeGrace:Math.max(3,parseInt(el.proctorGazeGrace)||12),proctorMaxViolations:Math.max(1,parseInt(el.proctorMaxViolations)||1),approved:false,rejected:false,submitted:false,date,sentAt:Date.now(),originalTaskIndex:taskCounter++});
    });
    homeworkItems.forEach(h=>students[idx].tasks.push({type:'homework',text:h.text,approved:false,rejected:false,submitted:false,date,sentAt:Date.now(),originalTaskIndex:taskCounter++}));
    readingItems.forEach(r=>students[idx].tasks.push({type:'reading',text:r.text,surah:r.surah,from:r.from,to:r.to,showAyat:!!r.showAyat,audio:r.audio||'',approved:false,rejected:false,submitted:false,date,sentAt:Date.now(),originalTaskIndex:taskCounter++}));
    setData('students',students);
    sendSystemSessionMessage(students[idx], 'تم حفظ تسميع '+students[idx].name+' بتاريخ '+date+' كمسودة. المهام الحالية ما زالت اهرة للطالب.');
    showToast('💾 ءءم الحفظ كمسودة والمهام ما زالت متاحة للطالب', 'success');
    return;
  }

  // الحفظ النهائي: نقل مهام اليوم إلى الأرشيف ثم تفريغ المهام ال��لية والانتقال لليوم التالي.
  const session = {date,elements:JSON.parse(JSON.stringify(activeElements)),homework:JSON.parse(JSON.stringify(homeworkItems)),reading:JSON.parse(JSON.stringify(readingItems)),totalScore,notes,isDraft:false,finalizedAt:nowText,status:'نهائ',completedTaskSnapshot:previousTasks};
  students[idx].sessions = students[idx].sessions.filter(s => !s.isDraft && s.date !== date);
  students[idx].sessions.push(session);
  if(!students[idx].completedTasks) students[idx].completedTasks=[];
  previousTasks.forEach(t=>{
    students[idx].completedTasks.push(Object.assign({},t,{completedAt:nowText,completedDate:date,finalizedByAdmin:true}));
  });
  students[idx].tasks = [];
  students[idx].activeExam = students[idx].activeExam && students[idx].activeExam.status==='submitted' ? students[idx].activeExam : null;
  const nextDate = new Date(date+'T00:00:00'); nextDate.setDate(nextDate.getDate()+1);
  const nextDateStr = nextDate.toISOString().split('T')[0];
  students[idx].nextTaskDate = nextDateStr;
  setData('students',students);

  let report = '📋 تقرر اليوم '+date+' للطالب '+students[idx].name+'\nالمجموع: '+totalScore+' درجات.\nتم إنهاء مهام اليوم وأرشفتءءا، والمهام ائحالية فارغة. اليوم التالي: '+nextDateStr+'.';
  if(previousTasks.length) report += '\nتم أرشفة '+previousTasks.length+' مهمة من مهام اليوم.';
  let messages=getData('messages');
  messages.push({type:'system',sender:'النظام',senderId:0,receiverType:'student',receiverId:id,text:report,reply:'',time:nowText,approved:true,read:false});
  messages.push({type:'system',sender:'النظام',senderId:0,receiverType:'parent',receiverName:students[idx].parent,text:report,reply:'',time:nowText,approved:true,read:false,reportDate:date,reportSession:JSON.parse(JSON.stringify(session))});
  setData('messages',messages);
  showToast('✅ تم ال���فظ النهائي — أُغلقت مهام '+date+' وانتقل النظام إل '+nextDateStr, 'success');
  resetRecordForm();
  document.getElementById('recordDate').value=nextDateStr;
}
function sendSystemSessionMessage(student,text){
  let messages=getData('messages'); const t=new Date().toLocaleString('ar-EG');
  messages.push({type:'admin',sender:'المسؤول',senderId:0,receiverType:'student',receiverId:student.id,text,reply:'',time:t,approved:true,read:false});
  messages.push({type:'admin',sender:'المسؤول',senderId:0,receiverType:'parent',receiverName:student.parent,text,reply:'',time:t,approved:true,read:false});
  setData('messages',messages);
}

// إعاءءة الصفحة لحالتها الأصلية بعد الحفظ النهائي
function resetRecordForm() {
  const mainSurah = currentRecordMainSurah || '';
  recordElements = FIXED_ELEMENTS.map(name => ({
    name: name,
    surah: (name === 'اللوح' || name === 'السورة') ? mainSurah : '',
    from: '', to: '', rating: '', color: '',
    isHomework: false, isVoice: false, deleted: false
  }));
  homeworkItems = []; readingItems = [];
  document.getElementById('recordNotes').value = '';
  document.getElementById('recordDate').value = new Date().toISOString().split('T')[0];
  renderRecordElements(); renderExtraElements(); renderHomeworkItems(); renderReadingItems();
}



// ====== HISTORY - FINALIZED SESSIONS AND EXAMS ======
function safeExamAttachmentUrl(value) {
  const url=String(value||'').trim();
  if(!url)return '';
  if(/^data:audio\/(webm|wav|x-wav|mpeg|mp3|mp4|x-m4a|m4a|ogg|opus);base64,/i.test(url))return url;
  if(/^\/(api|images)\//.test(url))return url;
  return '';
}
function formatExamDate(value) {
  if(!value)return 'غير محدد';
  const date=typeof value==='number'?new Date(value):new Date(String(value));
  return Number.isNaN(date.getTime())?escapeHtml(String(value)):date.toLocaleString('ar-EG');
}
function examStatusLabel(ex) {
  if(ex.status==='pending_audio_review')return 'بانتظار مراجع التسجيل';
  if(ex.status==='graded')return 'مكتم�� ومصحح';
  if(ex.autoSubmitted)return 'أُرسل تلقائياً بعد انتهاء الوقت';
  return escapeHtml(ex.status||'مكتمل');
}
function renderAdminExamHistory(s) {
  const exams=Array.isArray(s.examResults)?s.examResults.slice().reverse():[];
  let h='<section style="margin-top:24px"><h3 style="color:var(--info);margin-bottom:15px">🧪 سجل الاختبارات ('+exams.length+')</h3>';
  if(!exams.length)return h+'<div class="alert alert-info">لم يؤدِ الطالب أي اختبار بعد.</div></section>';
  exams.forEach(function(ex,examIndex){
    const questions=Array.isArray(ex.questions)?ex.questions:[],answers=Array.isArray(ex.answers)?ex.answers:[];
    const maxScore=Number(ex.maxScore)||questions.reduce(function(sum,q){return sum+(Number(q.points)||1)},0)||0;
    const score=Number(ex.score)||0,percent=maxScore?Math.round(score/maxScore*100):0;
    const submitted=ex.submittedAt||ex.reviewedAt||ex.createdAt||ex.date;
    const range=Array.from(new Set(questions.map(function(q){return q&&q.surah}).filter(Boolean))).join('، ')||'غير محدد';
    h+='<article class="history-day" style="border-right:5px solid var(--info)">';
    h+='<div class="history-day-header" style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><span>اءءتبار '+(exams.length-examIndex)+' — '+formatExamDate(submitted)+'</span><span class="score-badge">'+score+' / '+maxScore+' ('+percent+'٪)</span></div>';
    h+='<div class="history-element-details" style="margin:12px 0"><div class="history-detail"><strong>الحالة:</strong> '+examStatusLabel(ex)+'</div><div class="history-detail"><strong>الأسئلة:</strong> '+questions.length+'</div><div class="history-detail"><strong>السور:</strong> '+escapeHtml(range)+'</div><div class="history-detail"><strong>المدة:</strong> '+(Number(ex.totalDurationSeconds)||0)+' ثانية</div></div>';
    h+='<details><summary style="cursor:pointer;font-weight:700;color:var(--primary)">سجل الاختبار: عرض الإجابات والملحقات</summary>';
    if(!questions.length)h+='<div class="alert alert-info" style="margin-top:10px">لا تتوفر تفاصيل الأسئلة لهذه النتي��ة القديمة.</div>';
    questions.forEach(function(q,i){
      q=q||{};const a=answers[i]||{},r=a.aiResult||{},audio=safeExamAttachmentUrl(a.audioData),image=safeExamAttachmentUrl(q.questionImage);
      const answerScore=Number(a.score)||0,answerLabel=answerScore>=1?'صحيحة':answerScore>0?'جزئية':'غير صحيحة';
      h+='<div class="task-card" style="margin-top:12px">';
      h+='<div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap"><strong>س'+(i+1)+': '+escapeHtml(q.prompt||q.stem||'سؤال بدون عنوان')+'</strong><span class="badge '+(answerScore>=1?'badge-success':answerScore>0?'badge-warning':'badge-danger')+'">'+answerLabel+' — '+answerScore+'</span></div>';
      h+='<div class="history-element-details" style="margin-top:10px"><div class="history-detail"><strong>النوع:</strong> '+escapeHtml(q.type||'غير محدد')+'</div><div class="history-detail"><strong>السورة:</strong> '+escapeHtml(q.surah||'—')+'</div><div class="history-detail"><strong>الآيات:</strong> '+escapeHtml(String(q.from||'—'))+' إلى '+escapeHtml(String(q.to||'—'))+'</div><div class="history-detail"><strong>وقت الإجابة:</strong> '+(Number(a.timeSeconds)||0)+' ثانية</div></div>';
      h+='<p><strong>��جابة الطالب:</strong> '+escapeHtml(a.answer||r.transcript||'لم تتم الإجابة')+'</p>';
      h+='<p><strong>الإجابة الصحيحة:</strong> '+escapeHtml(q.correct||'غير متاحة')+'</p>';
      if(r.reason)h+='<p><strong>سبب التصحيح:</strong> '+escapeHtml(r.reason)+'</p>';
      if(Number.isFinite(Number(r.matchedPercent)))h+='<p><strong>نسبة المطابقة:</strong> '+Math.max(0,Math.min(100,Number(r.matchedPercent)))+'٪</p>';
      if(Array.isArray(r.missingAyahs)&&r.missingAyahs.length)h+='<p><strong>الآيات الناقصة:</strong> '+r.missingAyahs.map(function(item){return escapeHtml(String(item))}).join('، ')+'</p>';
      if(audio)h+='<div style="margin-top:10px"><strong>التسجيل الصوتي:</strong><br><audio controls preload="metadata" src="'+audio+'" style="width:100%;max-width:420px"></audio></div>';
      if(image)h+='<div style="margin-top:10px"><strong>ءءورة/مرجع السؤال:</strong><br><img src="'+escapeHtml(image)+'" alt="مرجع السؤال '+(i+1)+'" loading="lazy" style="max-width:100%;border-radius:10px;border:1px solid var(--border)"></div>';
      if(q.sourceFileName)h+='<p><strong>ملف المرجع:</strong> '+escapeHtml(q.sourceFileName)+'</p>';
      h+='</div>';
    });
    h+='</details></article>';
  });
  return h+'</section>';
}
function openHistory(id) {
  const students = getData('students');
  const s = students.find(x => x.id === id);
  if(!s) return;
  fullChartStudentId = id;
  const sessions = s.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);

  let html = '<h3 style="color:var(--primary); margin-bottom:15px;">📋 سجل الطالب الكامل — '+escapeHtml(s.name)+'</h3><h4 style="color:var(--primary);margin-bottom:12px">التسميعات النهائية</h4>';
  if(finalizedSessions.length === 0) {
    html += '<div class="alert alert-info">لا يوجد تسميعات نهائية مسجلة بعد. ��لتسميعات المسوئة تظل قابلة للتعديل لمدة 24 ساعة قبل نقلها هنا.</div>';
  } else {
    const grouped = {};
    finalizedSessions.forEach(sess => {
      if(!grouped[sess.date]) grouped[sess.date] = [];
      grouped[sess.date].push(sess);
    });

    Object.keys(grouped).sort().reverse().forEach(date => {
      html += '<div class="history-day">';
      html += '<div class="history-day-header">📅 '+date+'</div>';
      grouped[date].forEach(sess => {
        sess.elements.forEach((el, ei) => {
          html += '<div class="history-element" style="border-right-color:'+(el.color || 'var(--info)')+';">';
          html += '<div class="history-element-name">'+(ei+1)+'. '+el.name+'</div>';
          html += '<div class="history-element-details">';
          html += '<div class="history-detail"><strong>السورة:</strong> '+(el.surah || '-')+'</div>';
          html += '<div class="history-detail"><strong>من آية:</strong> '+(el.from || '-')+'</div>';
          html += '<div class="history-detail"><strong>إلى آية:</strong> '+(el.to || '-')+'</div>';
          html += '<div class="history-detail"><strong>الت��ييم:</strong> <span class="badge '+getRatingClass(el.rating)+'">'+getRatingLabel(el.rating)+'</span></div>';
          if(el.color) html += '<div class="history-detail"><span style="display:inline-block; width:20px; height:20px; background:'+el.color+'; border-radius:50%; vertical-align:middle;"></span></div>';
          if(el.isHomework) html += '<div class="history-detail"><span class="badge badge-success">📝 واجب</span></div>';
          if(el.isVoice) html += '<div class="history-detail"><span class="badge badge-primary">🎙️ تسجيل صوتي</span></div>';
          html += '</div></div>';
        });
        html += '<div style="text-align:center; margin-top:15px; padding-top:15px; border-top:2px dashed var(--border);">';
        html += '<span class="score-badge">المجوع: '+sess.totalScore+' درجة</span>';
        if(sess.finalizedAt) html += '<p style="margin-top:8px; color:var(--success); font-size:0.9rem;">✅ تم الإغلاق النهائي تءءريخ: '+sess.finalizedAt+'</p>';
        if(sess.notes) html += '<p style="margin-top:10px; color:var(--text-light);"><strong>ملاحظات:</strong> '+sess.notes+'</p>';
        html += '</div>';
      });
      html += '</div>';
    });
  }
  html += renderAdminExamHistory(s);
  html += renderTaskArchiveHtml(s);
  document.getElementById('historyContent').innerHTML = html;
  showPage('studentHistory');
}

function getRatingClass(val) {
  if(val >= 4) return 'badge-success';
  if(val >= 3) return 'badge-primary';
  if(val >= 1) return 'badge-warning';
  return 'badge-danger';
}
function getRatingLabel(val) {
  if(val === '4') return 'ممتاز';
  if(val === '3') return 'جيد داً';
  if(val === '1') return 'جيد';
  if(val === '0') return 'يعاد';
  return '-';
}

// ====== FULL CHART PAGE ======
function openFullChart() {
  if(!fullChartStudentId) return;
  const students = getData('students');
  const s = students.find(x => x.id === fullChartStudentId);
  if(!s || !s.sessions || s.sessions.length === 0) {
    alert('لا توجد بينات كافية للمخطط'); return;
  }
  const finalizedSessions = s.sessions.filter(sess => !sess.isDraft);
  if(finalizedSessions.length === 0) {
    alert('لا توجد تسميعات نهائية للعرض بءءد'); return;
  }
  showPage('fullChartPage');
  const canvasId = 'fullChartCanvas';
  document.getElementById('fullChartContainer').innerHTML = 
    '<canvas id="'+canvasId+'" width="1200" height="650" style="max-width:100%; height:auto; border-radius:10px;"></canvas>'+
    '<div class="chart-legend" style="margin-top:20px;"><div class="legend-item"><div class="legend-dot" style="background:#6f42c1"></div><span>المجموع</span></div></div>';
  setTimeout(() => drawTotalOnlyChart(canvasId, finalizedSessions), 100);
}
function closeFullChart() {
  goBack();
}

function drawTotalOnlyChart(canvasId, sessions) {
  const canvas = document.getElementById(canvasId);
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const textColor = isDark ? '#e0e0e0' : '#333';
  const gridColor = isDark ? '#444' : '#e0e0e0';
  const w = canvas.width, h = canvas.height;
  const padding = 100;
  const chartW = w - padding * 2;
  const chartH = h - padding * 2;
  ctx.clearRect(0, 0, w, h);

  ctx.fillStyle = isDark ? '#1e1e2f' : '#fff';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
  for(let i = 0; i <= 4; i++) {
    const y = padding + (chartH / 4) * i;
    ctx.beginPath(); ctx.moveTo(padding, y); ctx.lineTo(w - padding, y); ctx.stroke();
    ctx.fillStyle = textColor; ctx.font = 'bold 18px Segoe UI'; ctx.textAlign = 'right';
    ctx.fillText(((4 - i) * 4).toString(), padding - 25, y + 6);
  }

  const maxPoints = Math.min(sessions.length, 15);
  const recent = sessions.slice(-maxPoints);
  const stepX = chartW / (maxPoints > 1 ? maxPoints - 1 : 1);

  recent.forEach((r, i) => {
    const x = padding + stepX * i;
    ctx.fillStyle = textColor; ctx.font = 'bold 16px Segoe UI'; ctx.textAlign = 'center';
    const dp = r.date.split('-');
    ctx.fillText((dp[1]||'')+'/'+(dp[2]||''), x, h - padding + 40);
  });

  ctx.strokeStyle = '#6f42c1'; ctx.lineWidth = 5; ctx.beginPath(); let hasTotal = false;
  recent.forEach((r, i) => {
    const x = padding + stepX * i;
    const y = padding + chartH - (r.totalScore / 16) * chartH;
    if(!hasTotal) { ctx.moveTo(x, y); hasTotal = true; } else ctx.lineTo(x, y);
  });
  if(hasTotal) {
    ctx.stroke();
    ctx.strokeStyle = 'rgba(111,66,193,0.2)'; ctx.lineWidth = 15;
    ctx.beginPath(); hasTotal = false;
    recent.forEach((r, i) => {
      const x = padding + stepX * i;
      const y = padding + chartH - (r.totalScore / 16) * chartH;
      if(!hasTotal) { ctx.moveTo(x, y); hasTotal = true; } else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  recent.forEach((r, i) => {
    const x = padding + stepX * i;
    const y = padding + chartH - (r.totalScore / 16) * chartH;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#6f42c1'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 12, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = '#6f42c1'; ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = textColor; ctx.font = 'bold 16px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(r.totalScore.toString(), x, y - 20);
  });

  if(recent.length > 0) {
    const last = recent[recent.length - 1];
    const lastX = padding + stepX * (recent.length - 1);
    const lastY = padding + chartH - (last.totalScore / 16) * chartH;
    ctx.fillStyle = '#6f42c1'; ctx.beginPath(); ctx.arc(lastX, lastY, 18, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lastX, lastY, 10, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#6f42c1'; ctx.font = 'bold 32px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText('⬆️', lastX, lastY - 35);
    ctx.fillStyle = '#6f42c1'; ctx.fillRect(lastX - 70, lastY - 110, 140, 45);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px Segoe UI'; ctx.textAlign = 'center';
    ctx.fillText(last.totalScore + ' درجة', lastX, lastY - 80);
  }

  ctx.fillStyle = textColor; ctx.font = 'bold 22px Segoe UI'; ctx.textAlign = 'center';
  ctx.fillText('التاريخ', w / 2, h - 25);
  ctx.save(); ctx.translate(35, h / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText('المجموع (0-16)', 0, 0); ctx.restore();

  ctx.fillStyle = textColor; ctx.font = 'bold 24px Segoe UI'; ctx.textAlign = 'center';
  ctx.fillText('مخطط المجموع الكلي للتسميعات', w / 2, 50);
}

function switchMsgTab(tab, el) {
  document.querySelectorAll('.msg-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  document.getElementById('msgInboxSection').classList.toggle('hidden', tab !== 'inbox');
  document.getElementById('msgComposeSection').classList.toggle('hidden', tab !== 'compose');
  if(tab === 'compose') renderVoiceBox('compose');
}

function updateComposePersons() {
  const target = document.getElementById('composeTarget').value;
  const select = document.getElementById('composePerson');
  const students = getData('students');
  let html = '<option value="">اختر...</option>';
  if(target === 'student') {
    students.forEach(s => html += '<option value="student_'+s.id+'">'+s.name+' ('+s.username+')</option>');
  } else if(target === 'parent') {
    const parents = [...new Set(students.map(s => s.parent))];
    parents.forEach(p => html += '<option value="parent_'+p+'">'+p+'</option>');
  }
  select.innerHTML = html;
}


// ====== VOICE MESSAGE COMPOSER (WhatsApp-style) ======
const voiceMsgStore = {};
const voiceMsgRecorders = {};
function renderVoiceBox(key) {
  const box = document.getElementById('voiceBox_' + key);
  if(!box) return;
  const v = voiceMsgStore[key];
  let h = '<div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">';
  h += '<button class="voice-record-btn" id="vmBtn_'+key+'" onclick="toggleVoiceMsg(\''+key+'\')">🎙️</button>';
  h += '<span id="vmStatus_'+key+'" style="color:var(--text-light);">'+(v ? 'رسالة صوتية جاهزة ✅' : 'اضغط لتسجيل رسالة صوتية')+'</span>';
  if(v) {
    h += '<audio controls src="'+v+'" style="height:40px;"></audio>';
    h += '<button class="btn btn-xs btn-danger" onclick="clearVoiceMsg(\''+key+'\')">ءءء️ حذف</button>';
  }
  h += '</div>';
  box.innerHTML = h;
}
function clearVoiceMsg(key) { delete voiceMsgStore[key]; renderVoiceBox(key); }
async function toggleVoiceMsg(key) {
  const rec = voiceMsgRecorders[key];
  if(rec && rec.state !== 'inactive') { rec.stop(); return; }
  try {
    const stream = await safeGetMic();
    const recorder = new MediaRecorder(stream);
    voiceMsgRecorders[key] = recorder;
    const chunks = [];
    recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: 'audio/webm' });
      voiceMsgStore[key] = await blobToDataURL(blob);
      delete voiceMsgRecorders[key];
      renderVoiceBox(key);
      showToast('🎙️ تم تسجيل الرسالة الصوتية — اضغط إرسال', 'success');
    };
    recorder.start();
    registerAudioRecorder('message-'+key,recorder,stream,{statusId:'vmStatus_'+key,buttonId:'vmBtn_'+key,maxMs:180000});
    const btn = document.getElementById('vmBtn_' + key);
    const st = document.getElementById('vmStatus_' + key);
    if(btn) btn.classList.add('recording');
    if(st) st.textContent = 'جاري التسجيل... (اضغط للإيقاف)';
  } catch(err) { showToast('❌ لا يمكن الوصول للميكروفون', 'error'); }
}
function voiceAudioHTML(m) {
  return m.voiceData ? '<div style="margin:8px 0;">🎙️ رسالة صوتية: <audio controls src="'+m.voiceData+'" style="height:40px; vertical-align:middle;"></audio></div>' : '';
}
async function persistMessageWithFallback(message) {
  try {
    const response = await fetch('/api/messages', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify(message) });
    const result = await response.json();
    if (result.saved && result.message) return result.message;
  } catch (error) { console.warn('[v0] Messages API unavailable; using local fallback'); }
  return null;
}

function localMessageFromCloud(cloudMessage, fallback) {
  const createdAt = cloudMessage && cloudMessage.createdAt ? new Date(cloudMessage.createdAt) : null;
  return {
    id: cloudMessage && cloudMessage.id != null ? cloudMessage.id : fallback.id,
    cloudId: cloudMessage && cloudMessage.id != null ? cloudMessage.id : null,
    type: cloudMessage?.senderRole || fallback.senderRole,
    sender: cloudMessage?.senderName || fallback.senderName,
    senderId: String(cloudMessage?.senderId || fallback.senderId),
    senderRole: cloudMessage?.senderRole || fallback.senderRole,
    receiverType: cloudMessage?.recipientRole || fallback.recipientRole,
    receiverId: cloudMessage?.recipientId || fallback.recipientId,
    receiverName: cloudMessage?.recipientName || fallback.recipientName,
    recipientId: cloudMessage?.recipientId || fallback.recipientId,
    recipientName: cloudMessage?.recipientName || fallback.recipientName,
    recipientRole: cloudMessage?.recipientRole || fallback.recipientRole,
    text: cloudMessage?.body || fallback.text,
    voiceData: fallback.voiceData || '',
    reply: '',
    time: createdAt && !Number.isNaN(createdAt.getTime()) ? createdAt.toLocaleString('ar-EG') : new Date().toLocaleString('ar-EG'),
    approved: true,
    read: Boolean(cloudMessage?.readAt),
    cloudPersisted: Boolean(cloudMessage?.id),
  };
}

async function sendUserMessageToAdmin(role) {
  const ta = document.getElementById(role + 'MsgText');
  const text = (ta ? ta.value.trim() : '');
  const voice = voiceMsgStore[role] || '';
  if(!text && !voice) { showToast('❌ اكتب رسالة أو سجّل رسالة صوءية أولاً', 'error'); return; }
  const sender = role === 'student' ? currentUser.name : (Array.isArray(currentUser) ? currentUser[0].parent : currentUser.name);
  let messages = getData('messages');
  const message = { senderId: String(role === 'student' ? currentUser.id : (currentUser.id || 0)), senderName: sender, senderRole: role, recipientId: 'admin', recipientName: 'المسؤول', recipientRole: 'admin', text: text || 'رسالة صوتية' };
  const cloudMessage = await persistMessageWithFallback(message);
  messages.push(localMessageFromCloud(cloudMessage, Object.assign({}, message, { id: 'm' + Date.now(), voiceData: voice })));
  setData('messages', messages);
  if(ta) ta.value = '';
  clearVoiceMsg(role);
  showToast('✅ تم إرسال رسالتك للمسؤول', 'success');
}

function escapeHtmlAi(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== مزامنة GitHub (لمسؤول فقط) =====
function openGithubSync(){
  if(currentType !== 'admin'){ showToast('❌ هذه الميزة متاحة للمسؤول فقط', 'error'); return; }
  const a = document.getElementById('githubSyncAlert'); if(a) a.innerHTML = '';
  const s = document.getElementById('githubSyncStatus'); if(s) s.innerHTML = '<p style="color:var(--text-light)">جارٍ التحقق من الاتصال بمستودعك...</p>';
  const del = document.getElementById('githubDeleteBox'); if(del) del.style.display = 'none';
  const link = document.getElementById('githubHistoryLink'); if(link) link.style.display = 'none';
  showPage('githubSyncPage');
  refreshGithubSync();
}

async function refreshGithubSync(){
  if(currentType !== 'admin'){ showToast('❌ هه الميزة مت��حة للمسؤول فقط', 'error'); return; }
  const box = document.getElementById('githubSyncStatus');
  const btn = document.getElementById('githubSyncRefreshBtn');
  const link = document.getElementById('githubHistoryLink');
  const del = document.getElementById('githubDeleteBox');
  if(btn){ btn.disabled = true; btn.textContent = '⏳ جءءرٍ التحقق...'; }
  if(box) box.innerHTML = '<p style="color:var(--text-light)">جارٍ التحءءق من التال بمستودعك...</p>';
  try {
    const st = await callStudentAI('github_status', { role:'admin', adminId: currentAdminId || null }, 0.1);
    if(!st || st.connected !== true){
      const reason = (st && st.reason) ? st.reason : 'تعذر الاتصال بمستودع GitHub';
      if(box) box.innerHTML = '<div style="background:rgba(220,53,69,0.1); border:1px solid #dc3545; border-radius:10px; padding:14px 16px; color:var(--text);">'
        + '<b style="color:#dc3545;">❌ المزامنة غير متصلة</b><br><span style="color:var(--text-light); font-size:0.9rem;">'+escapeHtmlAi(reason)+'</span></div>';
      if(link) link.style.display = 'none';
      if(del) del.style.display = 'none';
      return;
    }
    const lc = st.lastCommit;
    let html = '<div style="background:rgba(40,167,69,0.1); border:1px solid #28a745; border-radius:10px; padding:14px 16px;">';
    html += '<b style="color:#28a745;">✅ متصل بمستودعك</b>';
    html += '<div style="margin-top:10px; display:grid; gap:6px; font-size:0.92rem;">';
    html += '<div>📦 المستودع: <b>'+escapeHtmlAi(st.repo)+'</b></div>';
    html += '<div>🌿 الفرع: <b>'+escapeHtmlAi(st.branch)+'</b></div>';
    html += '<div>✍️ صلاحية الكتابة (Push): <b>'+(st.canWrite ? 'متاحة ✅' : 'غير متاحة ❌')+'</b></div>';
    html += '<div>⚡ الدفع التلقائي عند التعديل: <b>'+(st.autoSync ? 'مفعّءء ✅' : 'غير مفعّل (اضبط DEV_ASSISTANT_AUTO_APPLY=true)')+'</b></div>';
    if(lc){
      html += '<div style="margin-top:6px; padding-top:8px; border-top:1px dashed rgba(255,255,255,0.15);">آخر Commit:</div>';
      html += '<div>🔖 <code>'+escapeHtmlAi(lc.sha)+'</code> — '+escapeHtmlAi((lc.message||'').split('\n')[0])+'</div>';
      html += '<div style="color:var(--text-light); font-size:0.85rem;">👤 '+escapeHtmlAi(lc.author||'')+(lc.date ? ' — '+escapeHtmlAi(new Date(lc.date).toLocaleString('ar-EG')) : '')+'</div>';
      if(lc.url) html += '<div><a href="'+escapeHtmlAi(lc.url)+'" target="_blank" rel="noopener">رض هذا الـCommit على GitHub</a></div>';
    }
    html += '</div></div>';
    if(box) box.innerHTML = html;
    if(link && st.historyUrl){ link.href = st.historyUrl; link.style.display = 'inline-flex'; }
    if(del) del.style.display = st.canWrite ? 'block' : 'none';
  } catch(e){
    if(box) box.innerHTML = '<div style="background:rgba(220,53,69,0.1); border:1px solid #dc3545; border-radius:10px; padding:14px 16px; color:var(--text);">'
      + '<b style="color:#dc3545;">❌ فشل التحقق</b><br><span style="color:var(--text-light); font-size:0.9rem;">'+escapeHtmlAi(e.message || 'خطأ غير معروف')+'</span></div>';
  } finally {
    if(btn){ btn.disabled = false; btn.textContent = '🔄 تحقق من ءءالة المزامنة'; }
  }
}

async function deleteGithubFile(){
  if(currentType !== 'admin'){ showToast('❌ هذه الميزة متئحة للمسؤول فقط', 'error'); return; }
  const pathEl = document.getElementById('githubDeletePath');
  const confirmEl = document.getElementById('githubDeleteConfirm');
  const resBox = document.getElementById('githubDeleteResult');
  const path = (pathEl ? pathEl.value.trim() : '');
  if(!path){ showToast('❌ اكتب مسار الملف أولاً', 'error'); return; }
  if(!confirmEl || !confirmEl.checked){ showToast('❌ يجب تأكيد الحذف أولا', 'error'); return; }
  if(!confirm('هل أنت متأكد من حذف الملف: '+path+' ؟ سيتم إنشاء Commit في مستودعك.')) return;
  if(resBox) resBox.innerHTML = '<span style="color:var(--text-light)">جارٍ الحذف...</span>';
  try {
    const r = await callStudentAI('github_delete', { role:'admin', adminId: currentAdminId || null, path, confirm:true }, 0.1);
  if(r && r.deleted){
  let html = '<div style="color:#28a745;">✅ '+escapeHtmlAi(r.note || 'تم حذف الملف')+'</div>';
  if(r.commitUrl) html += '<div><a href="'+escapeHtmlAi(r.commitUrl)+'" target="_blank" rel="noopener">عرض الـCommit</a></div>';
  if(resBox) resBox.innerHTML = html;
  if(pathEl) pathEl.value = ''; if(confirmEl) confirmEl.checked = false;
  recordDevAudit({ status:'applied', request:'حذف ملف: '+path, summary:'حذف مف من المستودع بتأكيد صريح.', files:[{ path, commitUrl:r.commitUrl||null }], flagged:['حذف ملف'] });
  refreshGithubSync();
  } else {
  if(resBox) resBox.innerHTML = '<span style="color:#dc3545;">❌ لم يتم الحذف</span>';
  recordDevAudit({ status:'failed', request:'حذف ملف: '+path, error:'لم يتم الحذف' });
  }
  } catch(e){
  if(resBox) resBox.innerHTML = '<span style="color:#dc3545;">❌ '+escapeHtmlAi(e.message || 'تعذر الحذف')+'</span>';
  recordDevAudit({ status:'failed', request:'حذف ملف: '+path, error:(e && e.message) ? e.message : 'تعذ�� الحذف' });
  }
  }

// ===== مساعد تطوير الموقع بالذكاء الاصطءءاعي (للمسؤول فقط) =====
let lastDevPlan = null;
function openDevAssistant(){
  // حصر الميزة على المسؤول فقط
  if(currentType !== 'admin'){
    showToast('❌ هذه الميزة متاحة للمسؤول فقط', 'error');
    return;
  }
  lastDevPlan = null;
  const r = document.getElementById('devAssistantResult'); if(r) r.innerHTML = '';
  const a = document.getElementById('devAssistantAlert'); if(a) a.innerHTML = '';
  showPage('devAssistantPage');
  renderDevAudit();
}

// ===== سجل التدقيق لمساعد التطوير (Audit Log) =====
// عبءءرات تدل على عمليات خطيرة تتطلب تأكيداً صريحاً قبل التنفيذ التلقائي.
const DEV_DANGER_PATTERNS = [
  {re:/حذف\s*(قاعدة|لقاعدة)\s*البيانات|drop\s+database|delete\s+database/i, label:'حذف قاعدة البيانات'},
  {re:/حذف\s*(المشروع|كل\s*الملفات|جميع\s*الملفات)|delete\s+project/i, label:'حذف المشروع أو كل الملفات'},
  {re:/حذف\s*(المستخدمين|كل\s*المستخدمين|جميع\s*المستخدمين)|delete\s+users/i, label:'حذف المستخدمين'},
  {re:/حذف\s*(الطلءءب|تسجيلات\s*الطلاب|بيانات\s*الطلءءب)/i, label:'حذف الطلاب أو تسجيلاتهم'},
  {re:/(المصادقة|تسجيل\s*ادخول|نظام\s*الدخول|كلمة\s*المرور\s*الرئيسية|authentication|login\s*system)/i, label:'تغيير نظام المصادقة'},
  {re:/(تغيير|تعديل|حذف)\s*(الصلاحيات|الأذونات|permissions)/i, label:'تغيير الصلاحيات'},
  {re:/(تغيير|تعديل|حذف)\s*(مفاتيح|متغيرات)\s*البئة|env(ironment)?\s*var|\.env/i, label:'تغيير مفاتيح البيئة'},
  {re:/(تغيير|تعطل|إزالة)\s*(إعدادات\s*)?الأمان|security/i, label:'تغيير إعدادات الأمن'},
];
function detectDevDanger(request){
  const hits = [];
  DEV_DANGER_PATTERNS.forEach(function(p){ if(p.re.test(request)) hits.push(p.label); });
  return hits;
}
function recordDevAudit(entry){
  try {
    let log = getData('devAuditLog'); if(!Array.isArray(log)) log = [];
    log.unshift(Object.assign({ time:new Date().toLocaleString('ar-EG'), ts:Date.now(), adminId: currentAdminId || null }, entry));
    if(log.length > 200) log = log.slice(0, 200); // حد أعلى لحجم السجل
    setData('devAuditLog', log);
  } catch(e) { /* لا يجب أن عطّل الفشل في التسجيل عمل المساعد */ }
}
function clearDevAudit(){
  if(!confirm('هل تريد مسح سجل التدقيق بالكامل؟ لا يمكن التراجع عن هذا الإجراء.\nملاحظة: تاريخ Git على GitHub يقى محفوظاً ولا يتأثر.')) return;
  setData('devAuditLog', []);
  renderDevAudit();
  showToast('تم مسح سجل الءءدقيق', 'info');
}
function renderDevAudit(){
  const box = document.getElementById('devAuditLog'); if(!box) return;
  let log = getData('devAuditLog'); if(!Array.isArray(log)) log = [];
  if(!log.length){ box.innerHTML = '<div style="color:var(--text-light); font-size:0.9rem;">لا توجد عمليات مسجّلة بعد.</div>'; return; }
  const esc = escapeHtmlAi;
  const statusBadge = function(s){
    if(s==='applied') return '<span style="background:#28a745;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">نجاح</span>';
    if(s==='blocked') return '<span style="background:#6c757d;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">محظور</span>';
    if(s==='analyzed') return '<span style="background:#17a2b8;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">تحليل فقط</span>';
    return '<span style="background:#dc3545;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">فشل</span>';
  };
  let h = '';
  log.forEach(function(e){
    h += '<div style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;">';
    h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:space-between;">';
    h += '<span style="font-size:0.82rem;color:var(--text-light);">🕒 '+esc(e.time||'')+(e.adminId!=null?(' — مسؤول #'+esc(String(e.adminId))):'')+'</span>'+statusBadge(e.status);
    h += '</div>';
    h += '<div style="margin-top:6px;"><strong>الطلب:</strong> '+esc(e.request||'')+'</div>';
    if(e.summary) h += '<div style="font-size:0.88rem;color:var(--text-light);margin-top:4px;">'+esc(e.summary)+'</div>';
    if(Array.isArray(e.files) && e.files.length){
      h += '<div style="font-size:0.85rem;margin-top:6px;"><strong>الملفات:</strong> ';
      h += e.files.map(function(f){ return '<code style="direction:ltr;background:rgba(0,0,0,0.06);padding:1px 5px;border-radius:4px;margin:0 2px;">'+esc(f.path||'')+'</code>'+(f.commitUrl?(' <a href="'+esc(f.commitUrl)+'" target="_blank" rel="noopener">commit</a>'):''); }).join('، ');
      h += '</div>';
    }
    if(e.error) h += '<div style="font-size:0.85rem;color:#b02a37;margin-top:4px;"><strong>سبب ائفشل:</strong> '+esc(e.error)+'</div>';
    h += '</div>';
  });
  box.innerHTML = h;
}

async function runDevAssistant(){
  if(currentType !== 'admin'){ showToast('❌ هذه الميزة متاحة للمسؤول فقط', 'error'); return; }
  const input = document.getElementById('devAssistantInput');
  const btn = document.getElementById('devAssistantBtn');
  const resultBox = document.getElementById('devAssistantResult');
  const request = input ? input.value.trim() : '';
  if(!request){ showToast('❌ اكتب طلب التطوير أولاً', 'error'); return; }

  // بوابة الحماية: العمليات الخيرة تتطلب تأكيداً صريحاً قبل التنفيذ التلقائي.
  const dangers = detectDevDanger(request);
  if(dangers.length){
    const confirmed = confirm(
      '⚠️ تحذير: قد يتضمن هذا الطلب عملية ح��ّاسة:\n\n- '+dangers.join('\n- ')+
      '\n\nهذه المليات قد تؤثر على البيانات أئ الأمان أو المستخدمين. لن يُنفَذ الطلب إلا بعد تأكيدك الصريح.\n\nهل تريد المتابعة والتنفيذ التلقائي؟'
    );
    if(!confirmed){
      recordDevAudit({ status:'blocked', request, summary:'أُلغي بواسطة ءءلمسؤول قبل التنفيذ.', flagged:dangers });
      renderDevAudit();
      showToast('🛑 تم إلاء لعملية الحسّاسة', 'info');
      return;
    }
  }

  btn.disabled = true;
  const originalLabel = btn.textContent;
  btn.textContent = 'جارٍ التعديل المباشر...';
  resultBox.innerHTML = '<p style="color:var(--text-light)">جارٍ تحليل المشروع وقراءة الملفات البرمجية اللازمة ثم تطبيق التعديل...</p>';
  const progressPanel=document.getElementById('devProgressPanel'),progressBar=document.getElementById('devProgressBar'),progressLabel=document.getElementById('devProgressLabel'),etaBox=document.getElementById('devEta');
  if(progressPanel)progressPanel.style.display='block'; let elapsed=0,estimate=120;
  const progressTimer=setInterval(function(){elapsed++;const left=Math.max(0,estimate-elapsed),progress=Math.min(94,8+Math.round(elapsed/estimate*86));if(progressBar)progressBar.style.width=progress+'%';if(etaBox)etaBox.textContent='الوقت المتبقي التقريبي: '+formatExamTime(left);if(progressLabel)progressLabel.textContent=elapsed<25?'تحليل الطلب':elapsed<70?'تعديل ملفات المشروع':elapsed<105?'إرسال ��لتعديل إلى GitHub':'بدء تحديث الموقع';},1000);

  try {
    const plan = await callStudentAI('dev_assistant', { request, role:'admin', adminId: currentAdminId || null, autoApply:true }, 0.2);
    lastDevPlan = plan;
    renderDevPlan(plan);
    // تسجيل العملية في سجل التدقيق.
    recordDevAudit({
      status: plan && plan.applied ? 'applied' : (plan && plan.feasible === false ? 'blocked' : 'analyzed'),
      request,
      summary: plan ? (plan.summary || plan.understanding || '') : '',
      files: (plan && Array.isArray(plan.applied)) ? plan.applied.map(function(a){ return { path:a.path||'', commitUrl:a.commitUrl||null }; }) : [],
      flagged: dangers,
    });
    renderDevAudit();
    showToast(plan && plan.applied ? '✅ تم تنفيذ التعديل بنجاح' : '⚠️ تم تحليل الطلب ولم يكتمل التطبيق', plan && plan.applied ? 'success' : 'info');
  } catch(err) {
    const reason = err && err.message ? err.message : 'سبب غير معروف';
    const canRetry = !!(err && err.retryable);
    resultBox.innerHTML =
      '<div style="background:#fdecea; color:#b02a37; padding:16px 18px; border-radius:10px; line-height:1.9;" role="alert">'+
      '<div style="font-weight:bold; font-size:1.15rem; margin-bottom:6px;">تعذر تنفيذ التعديل</div>'+
      '<div><strong>سبب الخطأ:</strong> '+escapeHtmlAi(reason)+'</div>'+
      (canRetry?'<button type="button" class="btn btn-sm btn-primary" style="margin-top:12px;" onclick="runDevAssistant()">إعادة المحاولة</button>':'')+
      '</div>';
    recordDevAudit({ status:'failed', request, error:reason, flagged:dangers });
    renderDevAudit();
    showToast('❌ تعذر تنفيذ التعديل', 'error');
  } finally {
    clearInterval(progressTimer);
    if(progressBar)progressBar.style.width='100%';
    if(progressLabel)progressLabel.textContent='اكتمل التنفيذ';
    if(etaBox)etaBox.textContent='الوقت المتبقي: 00:00:00';
    btn.disabled = false;
    btn.textContent = originalLabel;
  }
}

function renderDevPlan(plan){
  const resultBox = document.getElementById('devAssistantResult');
  if(!plan || typeof plan !== 'object'){ resultBox.innerHTML = '<div style="color:var(--text-light)">لم تصل خطة صالحة.</div>'; return; }
  const esc = escapeHtmlAi;

  if(plan.feasible === false){
    resultBox.innerHTML =
      '<div style="background:#fdecea; color:#b02a37; padding:15px; border-radius:10px;">'+
      '<div style="font-weight:bold; margin-bottom:6px;">🚫 لا يمكن تنفيذ هذا الطلب</div>'+
      '<div style="line-height:1.8;">'+esc(plan.summary || 'الطلب يخالف ��يود المشروع.')+'</div></div>';
    return;
  }

  let h = '<div style="background:var(--table-header); border:1px solid var(--border); padding:18px; border-radius:12px;">';
  h += '<div style="font-weight:bold; color:var(--primary); font-size:1.05rem; margin-bottom:10px;">📋 خطة التعديل المقترحة</div>';
  if(plan.understanding) h += '<div style="margin-bottom:10px;"><strong>فهم الطلب:</strong> '+esc(plan.understanding)+'</div>';
  if(plan.summary) h += '<div style="margin-bottom:12px;"><strong>الملخص:</strong> '+esc(plan.summary)+'</div>';

  if(Array.isArray(plan.files) && plan.files.length){
    h += '<div style="font-weight:bold; margin:14px 0 8px; color:var(--primary);">📁 الملات التي ستتغيّر</div>';
    plan.files.forEach(function(f){
      const badge = f.action === 'create'
        ? '<span style="background:#28a745;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">إنشاء</span>'
        : '<span style="background:#fd7e14;color:#fff;border-radius:6px;padding:2px 8px;font-size:12px;">تعديل</span>';
      h += '<div style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;margin-bottom:8px;">';
      h += '<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;"><code style="direction:ltr;background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:5px;">'+esc(f.path||'')+'</code>'+badge+'</div>';
      if(f.reason) h += '<div style="font-size:0.9rem;color:var(--text-light);margin-top:6px;">السبب: '+esc(f.reason)+'</div>';
      if(Array.isArray(f.changes) && f.changes.length){
        h += '<ul style="margin:8px 0 0;padding-inline-start:20px;line-height:1.8;">';
        f.changes.forEach(function(c){ h += '<li>'+esc(c)+'</li>'; });
        h += '</ul>';
      }
      h += '</div>';
    });
  }

  if(Array.isArray(plan.steps) && plan.steps.length){
    h += '<div style="font-weight:bold; margin:14px 0 8px; color:var(--primary);">🪜 خطوات التنفيذ</div><ol style="padding-inline-start:20px;line-height:1.9;">';
    plan.steps.forEach(function(s){ h += '<li>'+esc(s)+'</li>'; });
    h += '</ol>';
  }

  if(Array.isArray(plan.risks) && plan.risks.length){
    h += '<div style="font-weight:bold; margin:14px 0 8px; color:#b02a37;">⚠️ مخاطر وآثار محتملة</div><ul style="padding-inline-start:20px;line-height:1.8;">';
    plan.risks.forEach(function(s){ h += '<li>'+esc(s)+'</li>'; });
    h += '</ul>';
  }

  if(Array.isArray(plan.clarifications) && plan.clarifications.length){
    h += '<div style="font-weight:bold; margin:14px 0 8px; color:#17a2b8;">❓ أسئلة توضيحية</div><ul style="padding-inline-start:20px;line-height:1.8;">';
    plan.clarifications.forEach(function(s){ h += '<li>'+esc(s)+'</li>'; });
    h += '</ul>';
  }

  if(plan.applied){
    h += '<div style="background:rgba(40,167,69,0.12);border:1px solid #28a745;border-radius:10px;padding:16px 18px;margin-top:14px;line-height:1.9;">';
    h += '<div style="font-weight:bold;color:#218838;font-size:1.15rem;margin-bottom:8px;">✅ تم تنفيذ التعديل بنجاح</div>';

    // 1) وصف ما تم تعديله
    if(plan.understanding){
      h += '<div style="margin-bottom:6px;"><strong>📝 وصف ما تم تعديله:</strong> '+esc(plan.understanding)+'</div>';
    }

    // 2) ملخص التغييرات
    h += '<div style="margin-bottom:6px;"><strong>🧾 ملخص التغييرات:</strong> '+esc(plan.summary || 'تم تط��ءيق التعديلات البرمجية المطلوبة بنجاح.')+'</div>';

    // 3) أسماء الملفات التي تم تعديلها
    if(Array.isArray(plan.applied) && plan.applied.length){
      h += '<div style="font-weight:bold;margin-top:8px;">📁 الملفات التي تم تعديلها ('+plan.applied.length+'):</div><ul style="padding-inline-start:20px;line-height:1.8;">';
      plan.applied.forEach(function(a){
        h += '<li><code style="direction:ltr;background:rgba(0,0,0,0.06);padding:2px 6px;border-radius:5px;">'+esc(a.path||'')+'</code>'+
             (a.reason ? ' — '+esc(a.reason) : '')+
             (a.commitUrl ? ' — <a href="'+esc(a.commitUrl)+'" target="_blank" rel="noopener">عرض الـcommit</a>' : '')+'</li>';
      });
      h += '</ul>';
    }

    // 4) حالة النشر
    h += '<div style="font-weight:bold;margin-top:10px;">🚀 حالة النشر:</div>';
    h += '<div>'+esc(plan.deployStatus || (plan.deployTriggered ? 'تم تشغيل النشر على Vercel تلقائياً.' : 'حُفظت التعديلات على GitHub؛ وسيبدأ Vercel النشر تلقائياً إذا كان المستودع مربوطاً بالمشروع.'))+'</div>';

    if(Array.isArray(plan.tests) && plan.tests.length){
      h += '<div style="font-weight:bold;margin-top:10px;">🔍 ملاحظات التحقق:</div><ul style="padding-inline-start:20px;line-height:1.8;">';
      plan.tests.forEach(function(t){ h += '<li>'+esc(t)+'</li>'; });
      h += '</ul>';
    }
    h += '</div>';
  } else {
    h += '<div style="background:rgba(255,193,7,0.12);border:1px solid #ffc107;border-radius:8px;padding:10px 12px;margin-top:14px;font-size:0.88rem;">'+
         esc(plan.note || 'تم تحليل الطل ولم يتم تطبيق تعديل تلقائي.')+'</div>';
  }

  h += '<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap;">'+
       '<button class="btn btn-secondary" onclick="rejectDevPlan()">🆕 طلب تعديل آخر</button></div>';
  h += '</div>';
  resultBox.innerHTML = h;
}

function approveDevPlan(){
  showToast('ℹ️ التعديل يتم تلقائياً بعد إرسال الطلب', 'info');
}

function rejectDevPlan(){
  lastDevPlan = null;
  const resultBox = document.getElementById('devAssistantResult');
  if(resultBox) resultBox.innerHTML = '';
  const input = document.getElementById('devAssistantInput');
  if(input) input.focus();
  showToast('تم إلغاء الخطة، يمكنك تعديل الطلب', 'info');
}

function initComposeVoice(){ renderVoiceBox('compose'); }
async function sendComposeMessage() {
  const person = document.getElementById('composePerson').value;
  const text = document.getElementById('composeText').value.trim();
  const voice = voiceMsgStore['compose'] || '';
  if(!person || (!text && !voice)) return showToast(' اختر المستلم واكتب رسالة أو سجّل رسالة صوتي��', 'error');
  let messages = getData('messages');
  const parts = person.split('_');
  const type = parts[0];
  const id = parts.slice(1).join('_');
  const students = getData('students');
  const recipientName = type === 'student' ? (students.find(s => String(s.id) === id)?.name || id) : id;
  const messageDraft = {senderId:'admin', senderName:'المسؤول', senderRole:'admin', recipientId:id, recipientName, recipientRole:type, text:text || 'رسالة صوتية'};
  const cloudMessage = await persistMessageWithFallback(messageDraft);
  if(cloudMessage) {
    messages.push(localMessageFromCloud(cloudMessage, Object.assign({}, messageDraft, { voiceData: voice })));
  } else if(type === 'student') {
    messages.push({type:'admin', sender:'المسؤول', senderId:0, receiverType:'student', receiverId:parseInt(id), text: messageDraft.text, voiceData: voice, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
  } else {
    messages.push({type:'admin', sender:'المسؤول', senderId:0, receiverType:'parent', receiverName:id, text: messageDraft.text, voiceData: voice, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
  }
  setData('messages', messages);
  document.getElementById('composeText').value = '';
  clearVoiceMsg('compose');
  showToast('✅ تم إرسال الرسالة', 'success');
}

// ====== MESSAGES - READ STATUS ======
function markAdminMessagesRead() {
  let msgs = getData('messages');
  let changed = false;
  msgs.forEach(m => {
    if((m.receiverType === 'admin' || !m.receiverType) && !m.read) {
      m.read = true; changed = true;
    }
  });
  if(changed) setData('messages', msgs);
  updateMsgBadge();
}

async function syncCloudMessages() {
  try {
    const response = await fetch('/api/messages?userId=admin&role=admin');
    const result = await response.json();
    if (!result.unavailable && Array.isArray(result.messages)) {
      const local = getData('messages');
      result.messages.forEach(m => { if(!local.some(x => String(x.cloudId) === String(m.id))) local.push({cloudId:m.id,type:m.senderRole,sender:m.senderName,senderId:m.senderId,receiverType:m.recipientRole,receiverId:m.recipientId,text:m.body,time:new Date(m.createdAt).toLocaleString('ar-EG'),approved:true,read:false}); });
      setData('messages', local);
    }
  } catch (error) { console.warn('[v0] Could not sync cloud messages'); }
}

function renderMessages() {
  if (typeof window.renderUnifiedMessenger === 'function') { window.renderUnifiedMessenger('admin'); return; }
  syncCloudMessages();
  const msgs = getData('messages');
  const adminMsgs = msgs.filter(m => m.receiverType === 'admin' || !m.receiverType);
  if(adminMsgs.length === 0) {
    document.getElementById('messagesList').innerHTML = '<div class="alert alert-info">لا توجد رسائل واردة</div>'; return;
  }
  let html = '';
  adminMsgs.slice().reverse().forEach((m, idx) => {
    const realIdx = msgs.indexOf(m);
    const hasFile = m.fileData ? '<div style="margin:8px 0;"><button onclick="openMessageFile('+realIdx+')" class="btn btn-sm btn-primary">👁️ عرض الملف: '+(m.fileName || 'ملف')+'</button></div>' : '';
    let shareBtn = '';
    if(m.fileData) {
      shareBtn = '<div style="margin:8px 0;"><button class="btn btn-sm '+(m.shareWithParent ? 'btn-success' : 'btn-secondary')+'" onclick="toggleShareWithParent('+realIdx+')">'+(m.shareWithParent ? '👨‍👩‍ ولي الأر يمكنه الاطلاع (اضغط للمنع)' : '🔒 السماح لولي الأمر بالاطلاع على الملف')+'</button></div>';
    }
    let approvalBtns = '';
    if((m.type === 'student' || m.type === 'parent') && !m.approved && !m.rejected) {
      approvalBtns = '<div class="approval-btns"><button class="btn-approve" onclick="approveMessage('+realIdx+', true)"> موافق</button><button class="btn-reject" onclick="approveMessage('+realIdx+', false)">❌ رفض</button></div>';
      approvalBtns += '<div style="margin-top:8px;"><input type="text" id="reply_'+realIdx+'" placeholder="رد على الرسالة..." style="padding:8px 12px; border-radius:8px; border:1px solid var(--border); width:70%; background:var(--input-bg); color:var(--text);"><button class="btn btn-sm btn-success" onclick="replyMessage('+realIdx+')">رد</button></div><div id="voiceBox_reply'+realIdx+'"></div>';
    } else if(m.approved) {
      approvalBtns = '<div style="color:var(--success); font-weight:bold;">✅ تمت الموافقة</div>';
    } else if(m.rejected) {
      approvalBtns = '<div style="color:var(--danger); font-weight:bold;">❌ تم الرفض</div>';
    }
    if(m.exam&&m.exam.status==='pending_audio_review') approvalBtns += '<div class="approval-btns"><button class="btn-approve" onclick="reviewAudioExam('+m.senderId+',\''+m.exam.id+'\',true)">التسجيل مطابق</button><button class="btn-reject" onclick="reviewAudioExam('+m.senderId+',\''+m.exam.id+'\',false)">التسجيل غير مطابق</button></div>';
    if(m.expiryKey&&m.parentPhone){const wa=examWhatsAppLink(m.parentPhone,m.text);if(wa)approvalBtns += '<a class="btn btn-sm btn-success" target="_blank" rel="noopener noreferrer" href="'+wa+'">إرسال تنبيه واتساب لولي الأمر</a>';}
    html += '<div class="msg-item"><span class="sender">'+m.sender+'</span> <span class="badge '+(m.type === 'student' ? 'badge-primary' : m.type === 'parent' ? 'badge-success' : 'badge-warning')+'">'+m.type+'</span><p style="margin:8px 0">'+m.text+'</p>'+voiceAudioHTML(m)+(m.aiReport ? '<div class="alert alert-info" style="margin:8px 0;">🤖 تقرير الذكاء الاصطناعي: '+m.aiReport+(m.recitationTarget ? ' — المطلوب: '+m.recitationTarget : '')+'</div>' : '')+hasFile+shareBtn+approvalBtns+(m.replyVoice ? '<div class="msg-reply">🎙️ رد صوتي: <audio controls src="'+m.replyVoice+'" style="height:38px; vertical-align:middle;"></audio></div>' : '')+'<span class="time">🕐 '+m.time+'</span></div>';
  });
  document.getElementById('messagesList').innerHTML = html;
  adminMsgs.forEach(m => { const ri = msgs.indexOf(m); if(document.getElementById('voiceBox_reply'+ri)) renderVoiceBox('reply'+ri); });
}

// ====== IMPROVED APPROVAL SYSTEM ======
function genMsgId() { return 'm' + Date.now() + Math.floor(Math.random()*10000); }

// السماح/المنع لولي الأمر من الاطلاع على الملف المرسل من الطالب
function toggleShareWithParent(idx) {
  let msgs = getData('messages');
  if(!msgs[idx]) return;
  if(!msgs[idx].id) msgs[idx].id = genMsgId();
  msgs[idx].shareWithParent = !msgs[idx].shareWithParent;
  setData('messages', msgs);
  renderMessages();
  alert(msgs[idx].shareWithParent ? '✅ أصبح بإمكان ولي الأمر الاطلاع على هذا الملف (بدون تعديءء).' : '���� تم منع ولي الأ من الاطلاع على هذا الملف.');
}

function openMessageFileById(msgId, readonly) {
  const msgs = getData('messages');
  const m = msgs.find(x => x.id === msgId);
  if(!m || !m.fileData) { alert('الملف غير متاح'); return; }
  if(readonly && !m.shareWithParent) { alert('لم يسمح المسؤول بالاطلاع على ذا الملف بعد'); return; }
  openFileModal(m.fileData, m.fileName || 'file', 'ملف مرسل من ' + m.sender + (typeof m.voiceMatch === 'number' ? ' — 🤖 مطابقة البصم الصوتية: ' + m.voiceMatch + '% ' + (m.voiceMatch >= VOICE_MATCH_THRESHOLD ? '✅ مطابق' : '⚠️ ير مطابق') : ''), m.fileType === 'homework' ? 'image/jpeg' : (m.fileType === 'reading' || m.fileType === 'voice') ? 'audio/webm' : '', readonly);
}

function approveMessage(idx, approved) {
  let msgs = getData('messages');
  if(!msgs[idx]) return;
  const m = msgs[idx];
  if(!m.id) m.id = genMsgId();
  const srcId = m.id;
  const todayStr = new Date().toISOString().split('T')[0];

  // Update message status
  m.approved = approved;
  m.rejected = !approved;

  const studentId = m.senderId;
  if(!studentId) {
    setData('messages', msgs);
    renderMessages();
    return;
  }

  let students = getData('students');
  const sIdx = students.findIndex(s => s.id === studentId);
  if(sIdx >= 0 && students[sIdx].tasks) {
    // Find task by originalTaskIndex or fallback
    let taskIdx = -1;
    const taskIndexFromMsg = m.taskIndex !== undefined ? m.taskIndex : -1;

    for(let i = 0; i < students[sIdx].tasks.length; i++) {
      if(students[sIdx].tasks[i].originalTaskIndex === taskIndexFromMsg || i === taskIndexFromMsg) {
        taskIdx = i; break;
      }
    }

    // Fallback: find first matching unapproved task of same type
    if(taskIdx === -1) {
      for(let i = 0; i < students[sIdx].tasks.length; i++) {
        if(students[sIdx].tasks[i].type === (m.fileType || 'homework') && !students[sIdx].tasks[i].approved) {
          taskIdx = i; break;
        }
      }
    }

    if(taskIdx >= 0) {
      const task = students[sIdx].tasks[taskIdx];

      if(approved) {
        // APPROVE: Move to completed tasks
        if(!students[sIdx].completedTasks) students[sIdx].completedTasks = [];
        students[sIdx].completedTasks.push({
          ...task,
          status: 'approved',
          day: todayStr,
          sourceMsgId: srcId,
          approvedAt: new Date().toLocaleString('ar-EG'),
          approvedBy: 'المسؤول',
          originalTaskIndex: m.taskIndex !== undefined ? m.taskIndex : taskIdx
        });
        // Remove from tasks
        students[sIdx].tasks.splice(taskIdx, 1);

        // Send approval message to student
        msgs.push({
          type:'admin', sender:'المسؤول', senderId:0,
          receiverType: 'student', receiverId: studentId,
          text: '✅ تمت موفقة المسؤول على ملفك وتم تسجيل المهمة في السجلات بنجاح! أحسنت.',
          reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false
        });

        // Send approval message to parent
        msgs.push({
          type:'admin', sender:'المسؤول', senderId:0,
          receiverType: 'parent', receiverName: students[sIdx].parent,
          text: '✅ تمت موافقة المسؤول على ملف '+students[sIdx].name+' وتم تسجيل المهمة في السجلات.',
          sourceMsgId: srcId,
          reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false
        });

      } else {
        // REJECT: Reset task to allow resubmission
        students[sIdx].tasks[taskIdx].rejected = true;
        students[sIdx].tasks[taskIdx].submitted = false;
        students[sIdx].tasks[taskIdx].lastRejectedAt = new Date().toLocaleString('ar-EG');
        if(!students[sIdx].tasks[taskIdx].rejectCount) students[sIdx].tasks[taskIdx].rejectCount = 0;
        students[sIdx].tasks[taskIdx].rejectCount++;

        // سجل الرفض
        if(!students[sIdx].rejectedLog) students[sIdx].rejectedLog = [];
        students[sIdx].rejectedLog.push({
          ...task,
          status: 'rejected',
          day: todayStr,
          sourceMsgId: srcId,
          rejectedAt: new Date().toLocaleString('ar-EG'),
          rejectedBy: 'المسؤول'
        });

        // Send rejection message to student
        msgs.push({
          type:'admin', sender:'المسؤول', senderId:0,
          receiverType: 'student', receiverId: studentId,
          text: '❌ تم رفض ملفك من المسؤول. يرجى المحاوة مرة أخرى وإرسال ملف جديد.',
          reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false
        });

        // Send rejection message to parent
        msgs.push({
          type:'admin', sender:'المسؤول', senderId:0,
          receiverType: 'parent', receiverName: students[sIdx].parent,
          text: '❌ تم رفض ملف '+students[sIdx].name+' من المسؤول. يرج�� متابعة ابنك لإع��دة الإرسال.',
          sourceMsgId: srcId,
          reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false
        });
      }

      setData('students', students);

      // Update currentUser if viewing
      if(currentType === 'student' && currentUser && currentUser.id === studentId) {
        currentUser = students[sIdx];
        saveSessionState();
      }
      if(currentType === 'parent' && currentUser && currentUser[0] && currentUser[0].parent === students[sIdx].parent) {
        currentUser = [students[sIdx]];
        saveSessionState();
      }
    }
  }

  setData('messages', msgs);
  renderMessages();
}

function replyMessage(idx) {
  const el = document.getElementById('reply_' + idx);
  const replyText = el ? el.value.trim() : '';
  const voice = voiceMsgStore['reply' + idx] || '';
  if(!replyText && !voice) { showToast('❌ اكتب رداً أو سجّل رداً صوتياً', 'error'); return; }
  let msgs = getData('messages');
  msgs[idx].reply = replyText || '🎙️ رد صوتي';
  msgs[idx].replyVoice = voice;
  clearVoiceMsg('reply' + idx);
  showToast('✅ تم ءءرسال الر', 'success');
  setData('messages', msgs);
  renderMessages();
}

function updateMsgBadge() {
  const msgs = getData('messages');
  const count = msgs.filter(m => (m.receiverType === 'admin' || !m.receiverType) && !m.read).length;
  const badge = document.getElementById('msgBadge');
  if (!badge) return;
  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
}

// ====== SUBJECTS & TEACHERS ======
function renderSubjects() {
  const subjects = getData('subjects');
  let html = '<table><thead><tr><th>المادة</th><th>المدرس</th><th>رقم الهاتف</th><th>الصلاحيات</th><th>التحكم</th></tr></thead><tbody>';
  subjects.forEach(s => {
    const adminBadge = s.isAdmin ? '<span class="teacher-admin-badge">👨‍💼 مسؤول</span>' : '';
    html += '<tr><td><strong>'+s.name+'</strong> '+adminBadge+'</td><td>'+s.teacher+'</td><td>'+(s.phone || '-')+'</td><td>'+(s.isAdmin ? 'مسؤول نظام' : 'معلم')+'</td><td><button class="btn btn-xs btn-info" onclick="editSubject('+s.id+')">تعديل</button> <button class="btn btn-xs btn-danger" onclick="deleteSubject('+s.id+')">حذف</button></td></tr>';
  });
  html += '</tbody></table>';
  document.getElementById('subjectsTable').innerHTML = html;
}

function addSubject() {
  const name = document.getElementById('newSubName').value.trim();
  const teacher = document.getElementById('newSubTeacher').value.trim();
  const phone = document.getElementById('newSubPhone').value.trim();
  if(!name || !teacher) return alert('يرجى ملء اسم المادة والمدرس');
  if(phone && phone.length !== 11) return alert('رقم الهاتف يجب أن يكون 11 ��قم');
  const subjects = getData('subjects');
  subjects.push({id: Date.now(), name, teacher, phone, isAdmin: false});
  setData('subjects', subjects);
  document.getElementById('newSubName').value = '';
  document.getElementById('newSubTeacher').value = '';
  document.getElementById('newSubPhone').value = '';
  renderSubjects();
  alert('تم إضافة المادة بنجاح!');
}

function editSubject(id) {
  const subjects = getData('subjects');
  const s = subjects.find(x => x.id === id);
  if(!s) return;
  const newName = prompt('اسم المادة:', s.name);
  if(newName === null) return;
  const newTeacher = prompt('اسم المدرس:', s.teacher);
  if(newTeacher === null) return;
  const newPhone = prompt('رقم هاتف المدرس:', s.phone || '');
  if(newPhone === null) return;
  if(newPhone && newPhone.length !== 11) return alert('رقم الهاتف يجب أن يءءون 11 رقم');

  const makeAdmin = confirm('هل تريد تعيين هذا المعلم كمسؤول في النظام؟');
  if(makeAdmin) {
    const adminPass = prompt('أدخل الرقم السري للمسؤول الجديد:');
    if(!adminPass) return alert('يجب إدخال رقم سري');
    s.isAdmin = true;
    let admins = getData('admins');
    if(!admins.find(a => a.mobile === newPhone)) {
      admins.push({id: Date.now(), mobile: newPhone, password: adminPass, isMain: false, teacherId: id});
      setData('admins', admins);
    }
  }

  s.name = newName; s.teacher = newTeacher; s.phone = newPhone;
  setData('subjects', subjects); renderSubjects(); alert('تم التعديل بنجاح');
}

function deleteSubject(id) {
  if(!confirm('هل أنت متأكد من حذف هذه المادة والمدرس؟')) return;
  let subjects = getData('subjects');
  const sub = subjects.find(s => s.id === id);
  subjects = subjects.filter(s => s.id !== id);
  setData('subjects', subjects);
  if(sub && sub.phone) {
    let admins = getData('admins');
    admins = admins.filter(a => a.mobile !== sub.phone);
    setData('admins', admins);
  }
  renderSubjects();
}

function studentLogin() {
  const username = document.getElementById('studentUsername').value.trim();
  const pass = document.getElementById('studentPassInput').value;
  const students = getData('students');
  const s = students.find(x => x.username === username);
  if(!s) {
    document.getElementById('studentLoginAlert').innerHTML = '<div class="alert alert-danger">❌ اسم المستخدم غير مسجل في النظام</div>'; return;
  }
  if(s.studentPass !== pass) {
    document.getElementById('studentLoginAlert').innerHTML = '<div class="alert alert-danger">❌ الرقم السري غير صحيح</div>'; return;
  }
  currentUser = s; currentType = 'student';
  saveSessionState();
  const devices = getData('devices');
  devices.push({type:'student', user:s.name, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
  setData('devices', devices);
  renderStudentDashboard(); showPage('studentDashboard');
}

function saveStudentPass() {
  const current = document.getElementById('currentStudentPass').value;
  const newPass = document.getElementById('newStudentPass').value;
  if(currentUser.studentPass !== current) {
    document.getElementById('studentSettingsAlert').innerHTML = '<div class="alert alert-danger">❌ الرقم السري الحالي غير صحيح</div>'; return;
  }
  if(!newPass) {
    document.getElementById('studentSettingsAlert').innerHTML = '<div class="alert alert-danger">❌ أدخل رقم سري جديد</div>'; return;
  }
  let students = getData('students');
  const idx = students.findIndex(s => s.id === currentUser.id);
  if(idx >= 0) {
    students[idx].studentPass = newPass;
    setData('students', students);
    currentUser = students[idx];
    document.getElementById('studentSettingsAlert').innerHTML = '<div class="alert alert-success">✅ تم تغيير ارقم السري بنجاح</div>';
  }
}

function renderStudentDashboard() {
  checkAndFinalizeDrafts();
  const s = currentUser;
  const isQuran = s.subjects && s.subjects.some(sub => sub.name.includes('قرآن'));

  checkExpiredTasks(s.id);

  const welcomeMsgs = generateWelcomeMessages(s);
  document.getElementById('studentWelcome').innerHTML = '<div class="welcome-msg"><h4>🌟 '+welcomeMsgs.title+'</h4><p>'+welcomeMsgs.body+'</p></div>';

  let html = '<div class="student-identity-cards" aria-label="بيانات الطالب الأساسية">';
  html += '<div class="student-identity-card"><div class="identity-value">'+escapeHtml(s.name || '-')+'</div><div class="identity-label">اسم الطالب</div></div>';
  html += '<div class="student-identity-card"><div class="identity-value">'+escapeHtml(String(s.age || '-'))+'</div><div class="identity-label">سن ��لطالب</div></div>';
  html += '</div>';

  html += '<div style="display:flex; gap:20px; flex-wrap:wrap;"><div style="flex:1; min-width:300px;">';
  html += '<div class="page" style="margin-top:0;"><h4 style="color:var(--primary); margin-bottom:15px;">📋 البيانات</h4>';
  html += '<p><strong>المدرس:</strong> '+(s.subjects ? s.subjects.map(sub => sub.teacher || '-').join('<br>') : '-')+'</p>';
  html += '<p><strong>رق�� المدرس:</strong> '+(s.subjects && s.subjects[0] && s.subjects[0].phone ? s.subjects[0].phone : '-')+'</p>';
  html += '<p><strong>ولي الأمر:</strong> '+s.parent+'</p>';
  html += '<p><strong>تاريخ التسجيل:</strong> '+s.createdAt+'</p>';
  if(isQuran && s.juz) html += '<p><strong>الجزء:</strong> <span class="score-badge">'+s.juz+'</span></p>';
  if(isQuran && s.surah) html += '<p><strong>السورة:</strong> <span class="score-badge">'+s.surah+'</span></p>';
  html += '</div></div></div>';
  document.getElementById('studentInfo').innerHTML = html;

  if(s.activeExam && s.activeExam.status==='pending'){
    document.getElementById('studentInfo').innerHTML += '<div class="alert alert-warning" style="margin-top:15px;border:2px solid var(--warning);font-size:1.05rem"><strong>🔔 لديك اختبار جءءيد!</strong><br>أرسءءه المسؤئل ويجب حله. <button class="btn btn-warning" style="margin-top:8px" onclick="showPage(\'studentExamPage\')">🧪 فتح الاختبار الآن</button></div>';
    notifyStudentExamOnce(s);
  }

  // Render active draft if exists
  const draft = s.sessions ? s.sessions.find(sess => sess.isDraft) : null;
  if(draft && isQuran) {
    let draftHtml = '<div class="page draft-card" style="margin-top:20px;"><h4 style="color:var(--warning); margin-bottom:15px;"> ءءسميع اليوم (مسودة - قيد الت��ديل)</h4>';
    draftHtml += '<p><strong>التار��خ:</strong> '+draft.date+'</p>';
    draft.elements.forEach((el, ei) => {
      draftHtml += '<div style="padding:10px; background:var(--input-bg); border-radius:8px; margin-bottom:8px; border-right:3px solid '+(el.color || 'var(--primary)')+';">';
      draftHtml += '<strong>'+el.name+'</strong> - '+(el.surah || 'بدون سرة')+'<br>';
      draftHtml += 'من آية '+(el.from || '-')+' إلى '+(el.to || '-')+' | ';
      draftHtml += 'التقءءيم: <span class="badge '+getRatingClass(el.rating)+'">'+getRatingLabel(el.rating)+'</span>';
      draftHtml += '</div>';
    });
    const timeLeft = Math.max(0, 24 - ((Date.now() - draft.draftCreatedAt) / (60 * 60 * 1000)));
    draftHtml += '<div style="margin-top:10px; color:var(--text-light);">⏰ متبقي '+timeLeft.toFixed(1)+' ساعة حتى الإغلاق التلقائي</div>';
    draftHtml += '<div style="margin-top:10px;"><span class="score-badge">المجموع: '+draft.totalScore+' درجة</span></div>';
    draftHtml += '</div>';
    document.getElementById('studentDraftSection').innerHTML = draftHtml;
  } else {
    document.getElementById('studentDraftSection').innerHTML = '';
  }

  renderStudentTasks();
  if(s.nextTaskDate && (!s.tasks || s.tasks.length===0)) document.getElementById('studentTasksSection').innerHTML += '<div class="alert alert-info" style="margin-top:10px">📅 تم إغلاق مهام اليوم. اليوم التالي المقرر: <strong>'+s.nextTaskDate+'</strong></div>';

  const sessions = s.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  if(finalizedSessions.length > 0 && isQuran) {
    let sessHtml = '<div class="page" style="margin-top:20px;"><h4 style="color:var(--primary); margin-bottom:15px;">📋 سجل التسميعات النهائية</h4>';
    finalizedSessions.slice().reverse().forEach(sess => {
      const elementsText = sess.elements.map(e => e.name+': '+(e.surah || '-')+' من آية '+(e.from || '-')+' إلى '+(e.to || '-')+' ('+e.rating+')').join(' | ');
      sessHtml += '<div class="session-card"><h5>📅 '+sess.date+' — المجموع: <span style="color:var(--primary)">'+sess.totalScore+'</span> درجة</h5><p>'+elementsText+'</p>'+(sess.notes ? '<p><strong>ملاحظات:</strong> '+sess.notes+'</p>' : '')+'</div>';
    });
    sessHtml += '</div>';
    document.getElementById('studentSessionsSection').innerHTML = sessHtml;
  } else {
    document.getElementById('studentSessionsSection').innerHTML = '';
  }
  if(isQuran) renderStudentChart(); else document.getElementById('studentChartSection').innerHTML = '';
  renderStudentCompletedTasks();
  renderStudentExam();
}

function renderStudentCompletedTasks() {
  const s = currentUser;
  const completed = s.completedTasks || [];
  if(completed.length === 0) { document.getElementById('studentCompletedTasksSection').innerHTML = renderTaskArchiveHtml(s); return; }
  // السجل اليومي يظهر أسفل المهام المجزة
  let html = '<div class="page" style="margin-top:20px; border-right:5px solid var(--success);">';
  html += '<h4 style="color:var(--success); margin-bottom:15px;"> المهام المنجزة والمسجلة</h4>';
  completed.slice().reverse().forEach(task => {
    html += '<div class="task-card" style="border-right-color:var(--success); background:linear-gradient(135deg, rgba(40,167,69,0.05), rgba(32,201,151,0.05));">';
    html += '<h5 style="color:var(--success);">✅ '+(task.type === 'homework' ? 'واجب' : task.type === 'reading' ? 'قراء��' : 'تسجيل صوتي')+': '+(task.name || task.text || '')+'</h5>';
    if(task.surah) html += '<p><strong>السورة:</strong> '+task.surah+' | <strong>من آية:</strong> '+(task.from || '-')+' | <strong>إلى آية:</strong> '+(task.to || '-')+'</p>';
    html += '<p style="color:var(--text-light); font-size:0.9rem;">🕐 تمت الموءءفقة: '+task.approvedAt+'</p>';
    html += '</div>';
  });
  html += '</div>';
  html += renderTaskArchiveHtml(s);
  document.getElementById('studentCompletedTasksSection').innerHTML = html;
}

function checkExpiredTasks(studentId) {
  let students = getData('students');
  const idx = students.findIndex(s => s.id === studentId);
  if(idx === -1) return;
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  let expiredTasks = [];

  students[idx].tasks = students[idx].tasks.filter(task => {
    if(task.approved) return false;
    if(task.sentAt && (now - task.sentAt > oneDay) && !task.approved && !task.rejected) {
      expiredTasks.push(task);
      return false;
    }
    return true;
  });

  if(expiredTasks.length > 0) {
    setData('students', students);
    const msgText = 'تنبيه: لم يقم الطالب '+students[idx].name+' بتنفيذ المهام المطلوبة خلال 24 ساعة. المهام المنتهية: '+expiredTasks.length;
    let messages = getData('messages');
    messages.push({type:'system', sender:'النظام', senderId:0, receiverType:'admin', text:msgText, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
    messages.push({type:'system', sender:'النظام', senderId:0, receiverType:'parent', receiverName:students[idx].parent, text:msgText, reply:'', time:new Date().toLocaleString('ar-EG'), approved:true, read:false});
    setData('messages', messages);
  }
}

// ====== IMPROVED STUDENT TASKS SYSTEM ======
function studentAyatBlock(task, key) {
  if(!task.showAyat || !task.surah || !task.from) return '';
  let h = '<div style="margin:10px 0; display:flex; gap:8px; flex-wrap:wrap;">';
  h += '<button class="btn btn-xs btn-info" onclick="openAyatViewer(\''+task.surah+'\', \''+task.from+'\', \''+(task.to||task.from)+'\')">📖 عض الآيات بحجم كبير</button>';
  h += '<button class="btn btn-xs btn-secondary" onclick="toggleInlineAyat(\'stAyat_'+key+'\', \''+task.surah+'\', \''+task.from+'\', \''+(task.to||task.from)+'\')">👁️ إظهار/إخفاء الآيات</button>';
  h += '</div><div id="stAyat_'+key+'" data-open="0"></div>';
  return h;
}

function renderStudentTasks() {
  const s = currentUser;
  const allTasks = s.tasks || [];

  let html = '<div class="page" style="margin-top:20px;"><h4 style="color:var(--primary); margin-bottom:15px;">📝 المهام ��لمطلوبة</h4>';

  allTasks.forEach((task, originalIdx) => {
    if(task.approved) return;

    const isRejected = task.rejected;
    const isSubmitted = task.submitted;
    const isProctorCancelled = task.proctorCancelled;
    let status = '';
    let cardStyle = '';

    if(isProctorCancelled) {
      status = '<span class="task-status" style="background:var(--danger); color:#fff;">أُلغيت بسبب مخالفة المراقبة: '+escapeHtml(task.cancelReason||'مخالفة الشروط')+'</span>';
      cardStyle = 'style="border-right-color:var(--danger);"';
    } else if(isSubmitted && !isRejected) {
      status = '<span class="task-status" style="background:var(--warning); color:#000;">⏳ قيد الانتظار</span>';
      cardStyle = 'style="border-right-color:var(--warning); background:linear-gradient(135deg, rgba(255,193,7,0.05), rgba(255,152,0,0.1));"';
    } else if(isRejected) {
      status = '<span class="task-status" style="background:var(--danger); color:#fff;">❌ ئم الرفض - حاول مرة أخرى</span>';
      cardStyle = 'style="border-right-color:var(--danger); background:linear-gradient(135deg, rgba(220,53,69,0.05), rgba(220,53,69,0.1));"';
    } else {
      status = '<span class="task-status" style="background:var(--info); color:#fff;">📤 لم يُرسل بعد</span>';
      cardStyle = 'style="border-right-color:var(--info);"';
    }

    if(task.type === 'homework') {
      html += '<div class="task-card" data-task-category="extra" '+cardStyle+'><h5>📝 ءءاجب: '+(task.name || task.text || '')+'</h5>';
      if(task.surah) html += '<p>السورة: '+(task.surah || '-')+' | من آية '+(task.from || '-')+' إلى آية '+(task.to || '-')+'</p>';
      html += studentAyatBlock(task, 'hw'+originalIdx);
      html += status;

      if(isRejected) {
        html += '<div class="task-rejected-alert">⚠️ تم رفض ءءلملف السابق. يرجى إرسال ملف ديد.</div>';
        html += '<div style="margin-top:10px;"><div class="file-upload" onclick="document.getElementById(&quot;hwFile_'+originalIdx+'&quot;).click()"><div>📷 اضغط لرفع صءءرة الواجب الجديدة</div></div>';
        html += '<input type="file" id="hwFile_'+originalIdx+'" accept="image/*" style="display:none" onchange="uploadTaskFile('+originalIdx+', this, &quot;homework&quot;)"></div>';
      } else if(!isSubmitted) {
        html += '<div style="margin-top:10px;"><div class="file-upload" onclick="document.getElementById(&quot;hwFile_'+originalIdx+'&quot;).click()"><div>📷 اضغط لرءءع صورة الءءاجب</div></div>';
        html += '<input type="file" id="hwFile_'+originalIdx+'" accept="image/*" style="display:none" onchange="uploadTaskFile('+originalIdx+', this, &quot;homework&quot;)"></div>';
      } else {
        html += '<div class="task-pending-box">📤 تم إرسال الملف للمسؤول - ا��تظر الموافقة</div>';
      }
      html += '</div>';

    } else if(task.type === 'reading') {
      html += '<div class="task-card" data-task-category="extra" style="border-right-color:var(--warning);"><h5>📖 قراءة: '+(task.text || (task.surah ? 'سورة '+task.surah : ''))+'</h5>';
      if(task.surah) html += '<p>لسورة: '+task.surah+' | من آية '+(task.from || '-')+' إلى آية '+(task.to || '-')+'</p>';
      if(task.audio) html += '<div style="margin:8px 0;">🎙️ تسجيل من المسؤول: <audio controls src="'+task.audio+'" style="height:40px; vertical-align:middle;"></audio></div>';
      html += studentAyatBlock(task, 'rd'+originalIdx);
      html += status;

      if(isProctorCancelled) {
        html += '<div class="task-rejected-alert">لا يمكن إعادة هذه الءءهمة بعد إلغائها. تواصل مع المسؤول لإسناد مهمة جديدة.</div>';
      } else if(isRejected) {
        html += '<div class="task-rejected-alert">⚠️ تم رفض التسجيل السابق. يرجى تسجيل قراءتك من جديد.</div>';
        html += studentVoiceRecorderHTML(originalIdx);
      } else if(!isSubmitted) {
        html += studentVoiceRecorderHTML(originalIdx);
      } else {
        html += '<div class="task-pending-box">📤 تم إرسال الملف للمسؤول - انتظر الموافقة</div>';
      }
      html += '</div>';

    } else if(task.type === 'voice') {
      html += '<div class="task-card" data-task-category="recitation" style="border-right-color:var(--success);"><h5>🎙️ تسجيل صوتي: '+(task.name || '')+'</h5>';
      if(task.surah) html += '<p>السورة: '+(task.surah || '-')+' | من آية '+(task.from || '-')+' إلى آية '+(task.to || '-')+'</p>';
      html += studentAyatBlock(task, 'vc'+originalIdx);
      html += status;

      if(isProctorCancelled) {
        html += '<div class="task-rejected-alert">لءء يمكن إعادة هذه ءءلمهمة بعد إلغءءئها. تواصل مع المءءؤول لإسناءء مهمة جديدة.</div>';
      } else if(isRejected) {
        html += '<div class="task-rejected-alert">⚠️ تم رفض التسيل السابق. يرجى إرسال تسجيل جديد.</div>';
        html += studentVoiceRecorderHTML(originalIdx);
      } else if(!isSubmitted) {
        html += studentVoiceRecorderHTML(originalIdx);
      } else {
        html += '<div class="task-pending-box">📤 تم إرسال التسجيل للمسؤول - انتر الموافقة</div>';
      }
      html += '</div>';
    }
  });

  html += '</div>';
  const temp=document.createElement('div');temp.innerHTML=html;
  const recitationTasks=Array.from(temp.querySelectorAll('[data-task-category="recitation"]')).map(el=>el.outerHTML).join('');
  const extraTasks=Array.from(temp.querySelectorAll('[data-task-category="extra"]')).map(el=>el.outerHTML).join('');
  const exam=s.activeExam&&s.activeExam.status==='pending'?s.activeExam:null;
  const examHtml=exam?'<p>لديك اختبار نشط من '+(exam.questions?.length||0)+' سؤال.</p><button class="btn btn-primary" onclick="showPage(\'studentExamPage\')">فتح الاختبار</button>':'<p style="color:var(--text-light)">لا يوجد اختبار نشط حاليًا.</p>';
  document.getElementById('studentTasksSection').innerHTML='<div class="student-work-grid" style="margin-top:20px"><section class="page student-work-card"><h4 style="color:var(--primary)">الاختبارات <span class="badge badge-primary">'+(exam?1:0)+'</span></h4>'+examHtml+'</section><section class="page student-work-card"><h4 style="color:var(--success)">التسميع <span class="badge badge-success">'+(recitationTasks?temp.querySelectorAll('[data-task-category="recitation"]').length:0)+'</span></h4>'+(recitationTasks||'<p style="color:var(--text-light)">لا توجد مهمات تسميع حالية.</p>')+'</section><section class="page student-work-card"><h4 style="color:var(--warning)">المها اءءإضافية <span class="badge badge-warning">'+(extraTasks?temp.querySelectorAll('[data-task-category="extra"]').length:0)+'</span></h4>'+(extraTasks||'<p style="color:var(--text-light)">لا توجد مهمءءت ءءضافية حالة.</p>')+'</section></div>';
  if(proctor.active)bindLiveProctorHold();
}

function uploadTaskFile(taskIdx, input, type) {
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    let messages = getData('messages');
    const task = currentUser.tasks[taskIdx];

    if(!task.originalTaskIndex && task.originalTaskIndex !== 0) {
      task.originalTaskIndex = taskIdx;
    }

    messages.push({
      type: 'student', sender: currentUser.name, senderId: currentUser.id,
      receiverType: 'admin', text: 'تم إرسال '+(type === 'homework' ? 'واجب' : 'قراءة')+' من الطالب '+currentUser.name+'. '+(task.name || task.text || ''),
      fileData: e.target.result, fileName: file.name, fileType: type,
      taskIndex: task.originalTaskIndex !== undefined ? task.originalTaskIndex : taskIdx,
      time: new Date().toLocaleString('ar-EG'), approved: false, read: false
    });
    setData('messages', messages);

    // Update task status to submitted and clear rejection
    let students = getData('students');
    const idx = students.findIndex(s => s.id === currentUser.id);
    if(idx >= 0 && students[idx].tasks[taskIdx]) {
      students[idx].tasks[taskIdx].submitted = true;
      students[idx].tasks[taskIdx].rejected = false;
      students[idx].tasks[taskIdx].submittedAt = new Date().toLocaleString('ar-EG');
      if(!students[idx].tasks[taskIdx].originalTaskIndex && students[idx].tasks[taskIdx].originalTaskIndex !== 0) {
        students[idx].tasks[taskIdx].originalTaskIndex = taskIdx;
      }
      setData('students', students);
      currentUser = students[idx];
      saveSessionState();
    }

    // Show success and re-render
    alert('✅ تم إرسال الملف للمؤو ��نجاح! انتظر الموافقة.');
    renderStudentTasks();
  };
  reader.readAsDataURL(file);
}

function studentVoiceRecorderHTML(idx) {
  const monitored=proctor.active&&proctor.context&&proctor.context.taskIndex===idx;
  return (monitored?proctorLiveBar():'')+'<div style="margin-top:10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">' +
    '<button class="voice-record-btn" onclick="recordStudentVoice('+idx+')" id="stVoiceBtn_'+idx+'">🎙️</button>' +
    '<span id="stVoiceStatus_'+idx+'">'+(monitored?'اضغ�� لبدء التسجيل المراقب':'اضغط لبدء فحص المراقبة')+'</span>' +
    '<audio id="stVoicePreview_'+idx+'" controls style="display:none; height:40px;"></audio>' +
    '</div><div id="stVoiceAI_'+idx+'" style="margin-top:8px;"></div>';
}

// ====== AI RECITATION CONTENT ANALYSIS (التحقق من محتى التلاوة) ======
const RECITATION_MIN_PCT = 20;
const TRANSCRIPT_MIN_PCT = 32;
const AYAT_CACHE_KEY = 'ayatTextCache_v1';

function normalizeAr(t) {
  return String(t || '')
    .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[\u0622\u0623\u0625\u0671]/g, 'ا')
    .replace(/\u0649/g, 'ي').replace(/\u0624/g, 'و').replace(/\u0626/g, 'ي').replace(/\u0629/g, 'ه')
    .replace(/[^\u0621-\u064A\s]/g, ' ')
    .replace(/\s+/g, ' ').trim();
}

function surahIndexByName(name) {
  const i = ALL_SURAHS_ORDERED.indexOf(name);
  return i === -1 ? 0 : i + 1;
}

// جلب نص الآيات المطلوبة (مع تخزين محلي) — يست��دم للمقارنة الذكية
async function fetchAyatText(surah, from, to) {
  try {
    const num = surahIndexByName(surah);
    if(!num) return '';
    const f = parseInt(from) || 1;
    const t = parseInt(to) || f;
    const cache = JSON.parse(localStorage.getItem(AYAT_CACHE_KEY) || '{}');
    const key = num + ':' + f + '-' + t;
    if(cache[key]) return cache[key];
    const res = await fetch('https://api.alquran.cloud/v1/surah/' + num + '/quran-uthmani');
    const json = await res.json();
    const ayat = (json && json.data && json.data.ayahs) ? json.data.ayahs : [];
    const txt = ayat.filter(function(a){ return a.numberInSurah >= f && a.numberInSurah <= t; })
                    .map(function(a){ return a.text; }).join(' ');
    if(txt) { cache[key] = txt; try { localStorage.setItem(AYAT_CACHE_KEY, JSON.stringify(cache)); } catch(e){} }
    return txt;
  } catch(e) { return ''; }
}

// المدة المتوقعة للتلاوة بالثواني (من طول النص الحقيقي إن توفر)
function expectedSecondsFromText(text) {
  const clean = normalizeAr(text).replace(/\s/g, '');
  if(!clean) return 0;
  return Math.max(4, Math.round(clean.length / 11)); // ~11 رف/ثانية ترتيلً
}

function expectedAyahSeconds(task) {
  const from = parseInt(task.from) || 1;
  const to = parseInt(task.to) || from;
  const count = Math.max(1, to - from + 1);
  return count * 7;
}

// نسبة تطابق الكلمات بين ما نطقه الطالب والنص المطلوب
function transcriptMatchPercent(transcript, expected) {
  const a = normalizeAr(transcript).split(' ').filter(Boolean);
  const b = normalizeAr(expected).split(' ').filter(Boolean);
  if(a.length === 0 || b.length === 0) return null;
  const bag = {};
  b.forEach(function(w){ bag[w] = (bag[w] || 0) + 1; });
  let hit = 0;
  a.forEach(function(w){ if(bag[w] > 0) { bag[w]--; hit++; } });
  const precision = hit / a.length;
  const recall = hit / b.length;
  if(precision + recall === 0) return 0;
  return Math.round((2 * precision * recall / (precision + recall)) * 100);
}

// تخمين السورة التي قرأها الطالب فعلياً (عند عدم المطابقة)
async function guessSpokenSurah(transcript, exclude) {
  try {
    const words = normalizeAr(transcript).split(' ').filter(Boolean);
    if(words.length < 3) return '';
    const cache = JSON.parse(localStorage.getItem(AYAT_CACHE_KEY) || '{}');
    let best = '', bestPct = 0;
    Object.keys(cache).forEach(function(k){
      const pct = transcriptMatchPercent(transcript, cache[k]);
      if(pct !== null && pct > bestPct) { bestPct = pct; best = k; }
    });
    if(bestPct >= 40 && best) {
      const num = parseInt(best.split(':')[0]);
      const nm = ALL_SURAHS_ORDERED[num - 1];
      if(nm && nm !== exclude) return nm;
    }
    return '';
  } catch(e) { return ''; }
}

// تشيل التعرف على الكلام العربي أثناء التسجيل (إن كان المتصفح يدعمه)
function startArabicASR() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(!SR) return null;
  try {
    const r = new SR();
    r.lang = 'ar-SA';
    r.continuous = true;
    r.interimResults = true;
    const state = { text: '', rec: r, stop: function(){ try { r.stop(); } catch(e){} } };
    r.onresult = function(ev) {
      let t = '';
      for(let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript + ' ';
      state.text = t;
    };
    r.onerror = function(){};
    r.start();
    return state;
  } catch(e) { return null; }
}

// إرسال الصوت إلى Gemini على الخادم للتفريغ وتءءحيح التلاوة.
async function serverRecitationAnalysis(blob, task) {
  try {
    const audio=await voiceAudioPayload(blob);
    const audioBase64=audio.audioBase64;
    const mimeType=audio.mimeType;
    let expectedText = '';
    if(task && task.surah) expectedText = await fetchAyatText(task.surah, task.from, task.to);
    const res = await callStudentAI('transcribe_and_grade', {
      audioBase64,
      mimeType,
      surah: task && task.surah ? task.surah : '',
      from: task ? task.from : 1,
      to: task ? (task.to || task.from) : 1,
      expectedText
    }, 0.05);
    return res || null; // {transcript, accepted, score, matchedPercent, isRecitation, reason, missingAyahs}
  } catch(e) {
    return {analysisError:e&&e.message?e.message:'تعذر ءءحليل ��لتسجيل على الخادم'};
  }
}

async function analyzeRecitationContent(blob, task, transcript) {
  let expectedText=''; if(task&&task.surah) expectedText=await fetchAyatText(task.surah,task.from,task.to);
  let dur=0,voicedRatio=0;
  try{
    const buf=await blob.arrayBuffer(),ctx=new (window.AudioContext||window.webkitAudioContext)(),audio=await ctx.decodeAudioData(buf.slice(0)),data=audio.getChannelData(0),sr=audio.sampleRate;
    dur=audio.duration;const win=Math.floor(sr*.03);let voiced=0,frames=0;
    for(let i=0;i+win<data.length;i+=win){let e=0;for(let j=0;j<win;j++)e+=data[i+j]*data[i+j];e=Math.sqrt(e/win);frames++;if(e>.012)voiced++}
    voicedRatio=frames?voiced/frames:0;await ctx.close();
  }catch(e){/* نكمل حتى لو تعذّر التحليل المحلي، لأن الخادم هو المصدر الأساسي */}
  // Gemini على الخادم هو المصدر الوحيد لتفريغ الصوت وتصحيحه.
  let aiResult=await serverRecitationAnalysis(blob, task);
  const serverError=aiResult&&aiResult.analysisError?aiResult.analysisError:'';
  if(serverError||!aiResult){
    return {pct:0,dur:Math.round(dur),txtPct:null,expectedSec:expectedSecondsFromText(expectedText)||expectedAyahSeconds(task),reason:serverError||'تعذّر تحليل التسجيل بواسة Gemini. أعد المحاولة وتأكد من الاتصال بالإنترنت.'};
  }
  const usedTranscript=aiResult.transcript||'';
  const txtPct=typeof aiResult.matchedPercent==='number'?aiResult.matchedPercent:null;
  const expectedSec=expectedSecondsFromText(expectedText)||expectedAyahSeconds(task);
  const durationScore=expectedSec?Math.max(0,Math.min(1,1-Math.abs(Math.log(Math.max(.05,dur/expectedSec)))/2)):1;
  let pct=aiResult&&typeof aiResult.matchedPercent==='number'?aiResult.matchedPercent:Math.round((durationScore*.6+voicedRatio*.4)*100);
  if(aiResult&&typeof aiResult.score==='number'&&aiResult.score<=0)pct=Math.min(pct,RECITATION_MIN_PCT-1);
  const reason=aiResult?.reason||'';
  return {pct:Math.max(0,Math.min(100,Math.round(pct))),dur:Math.round(dur),txtPct,expectedSec,reason,transcript:usedTranscript,aiResult};
}

// التحءءق الكامل (بصمة صوتية + محتوى ائتلاوة) ثم الإرس��ل أو الرفض
async function verifyAndSubmitRecitation(taskIdx, blob, dataUrl, transcript, aiBoxId, statusEl, fileName) {
  const aiBox = document.getElementById(aiBoxId);
  if(aiBox) aiBox.innerHTML = '<div class="alert alert-info">🤖 جاري تحليل التسجيل بالذكاء الاصطناعي...</div>';
  const task = currentUser.tasks[taskIdx];
  const identity = await verifyVoiceIdentity(blob, currentUser);
  let matchPct = identity ? identity.pct : null;
  if(identity && identity.sameSpeaker === false) matchPct = Math.min(matchPct, VOICE_MATCH_THRESHOLD - 1);

  // لا يسمح النظام بإرسال تسجيل صوتي لمهمة تتطلب هوية صوتية بدون بصمة مرجعية.
  if(matchPct === null) {
    showToast('❌ لا ءءوجد بصمة صوتية مرجعية صالحة لهذا الطالب — لم يتم حفظ أو إرسال التسجيل', 'error');
    if(statusEl) statusEl.textContent='لا توجد بصمة مرجعية ❌';
    if(aiBox) aiBox.innerHTML='<div class="alert alert-warning">⚠️ يجب أن تكون للطالئ بصمة صوتية محفوظ�� أولاً حتى يمكن التحقق من هويته.</div>';
    return false;
  }

  // 1) مطابقة البصمة الصوتية
  if(matchPct !== null && matchPct < VOICE_MATCH_THRESHOLD) {
    showToast('❌ فشل التحقق من البصمة الصوتية (' + matchPct + '%) — لم يتم حفظ أو إرسال التءءجيل', 'error');
    if(statusEl) statusEl.textContent = 'غير مطابق — أعد التسجيل ❌';
    if(aiBox) aiBox.innerHTML = '<div class="alert alert-danger"><strong>🚫 التحقق الأني:</strong><br>البصمة الصوتية غير مطابقة لصوت الطال (' + matchPct + '%).<br>لم يتم حفظ التسجيل أو إرساله للمسؤول أو ولي الأمر.</div>';
    return false;
  }

  // 2) مطابقة محتوى التلاوة مع المهمة المطلوبة
  const rec = await analyzeRecitationContent(blob, task, transcript);
  const targetTxt = task.surah ? ('سورة ' + task.surah + ' (من الآية ' + (task.from || '-') + ' إلى ' + (task.to || task.from || '-') + ')') : (task.name || task.text || 'المقطع ال��طلوب');
  if(rec.pct < RECITATION_MIN_PCT) {
    // لا يُحفظ التسجيل المرفوض ولا يُرسل للمسؤول ئذا لم طابق المقرر.
    showToast('❌ التلاوة لا تئابق ' + targetTxt + ' — لم يتم حفظ التسجيل', 'error');
    if(statusEl) statusEl.textContent = 'مرفوض — أعد الرفع ❌';
    if(aiBox) aiBox.innerHTML = '<div class="alert alert-danger"><strong>🚫 قرر الذكاء ااصطناعي — المحتوى غير مطابق:</strong><br>' +
      'المطلوب: <strong>' + targetTxt + '</strong><br>' +
      'نسبة مطابقة المحتوى: <strong>' + rec.pct + '%</strong> (الحد الأدنى ' + RECITATION_MIN_PCT + '%)' + (rec.txtPct !== null && rec.txtPct !== undefined ? ' | مطابقة النص المنطوق: ' + rec.txtPct + '%' : '') + '<br>' +
      (rec.reason ? 'السبب: ' + rec.reason + '<br>' : '') +
      '✋ لم تُرسل الرسالة لمسؤول — يرجى راءة المقطع المطلوب نفسه ورفع ملف تسجيل آخر.</div>';
    return false;
  }

  if(aiBox) aiBox.innerHTML = '<div class="alert alert-success"><strong>✅ تقرير الذكاء اءءا��طنعي:</strong><br>' +
    (matchPct !== null ? 'مطابقة البصمة الصوية: <strong>' + matchPct + '%</strong><br>' : '') +
    'مطابقة التلاوة مع ' + targetTxt + ': <strong>' + rec.pct + '%</strong>' + (rec.txtPct !== null && rec.txtPct !== undefined ? ' (تطابق النص ' + rec.txtPct + '%)' : '') + ' | مدة التسجيل: ' + rec.dur + ' ثانية<br>تم إرسال التسجيل للمسؤول.</div>';

  let messages = getData('messages');
  if(!task.originalTaskIndex && task.originalTaskIndex !== 0) task.originalTaskIndex = taskIdx;
  messages.push({
    type: 'student', sender: currentUser.name, senderId: currentUser.id,
    receiverType: 'admin', text: 'تم إرسال تسجيل صوتي من الطالب ' + currentUser.name + '. ' + (task.name || task.text || ''),
    fileData: dataUrl, fileName: fileName || 'voice_recording.webm', fileType: 'voice',
    voiceMatch: matchPct, recitationMatch: rec.pct, recitationTarget: targetTxt,
    aiReport: 'مئابقة البصمة: ' + (matchPct !== null ? matchPct + '%' : 'غير متاحة') + ' | مطابقة التلاوة: ' + rec.pct + '%' + (rec.reason ? ' | ' + rec.reason : ''),
    taskIndex: task.originalTaskIndex !== undefined ? task.originalTaskIndex : taskIdx,
    time: new Date().toLocaleString('ar-EG'), approved: false, read: false
  });
  setData('messages', messages);

  let students = getData('students');
  const idx = students.findIndex(function(x){ return x.id === currentUser.id; });
  if(idx >= 0 && students[idx].tasks[taskIdx]) {
    students[idx].tasks[taskIdx].submitted = true;
    students[idx].tasks[taskIdx].rejected = false;
    students[idx].tasks[taskIdx].submittedAt = new Date().toLocaleString('ar-EG');
    if(!students[idx].tasks[taskIdx].originalTaskIndex && students[idx].tasks[taskIdx].originalTaskIndex !== 0) {
      students[idx].tasks[taskIdx].originalTaskIndex = taskIdx;
    }
    setData('students', students);
    currentUser = students[idx];
    saveSessionState();
  }
  proctorStop(true);
  showToast('✅ تم التحقق من الصوت والمحتوى وإرسال التسجيل للمسؤول', 'success');
  renderStudentTasks();
  return true;
}

// رفع ملف تسيل صوتي جاهز من جهاز الءءءءالب (يمر بنفس اتحقق)
async function uploadVoiceTaskFile(taskIdx, input) {
  const file = input.files[0];
  if(!file) return;
  const statusEl = document.getElementById('stVoiceStatus_' + taskIdx);
  if(statusEl) statusEl.textContent = 'جاري التحقق من الملف...';
  const dataUrl = await blobToDataURL(file);
  const ok = await verifyAndSubmitRecitation(taskIdx, file, dataUrl, '', 'stVoiceAI_' + taskIdx, statusEl, file.name);
  input.value = '';
  if(ok && statusEl) statusEl.textContent = 'تم الإرسال ✅';
}

function recordStudentVoice(taskIdx){
const task=currentUser&&currentUser.tasks&&currentUser.tasks[taskIdx];if(!task)return;
if(task.proctorEnabled===false){beginStudentVoiceRecording(taskIdx);return}
if(!proctor.active||!proctor.context||proctor.context.taskIndex!==taskIdx){openProctorGate({type:task.type,id:String(task.originalTaskIndex??taskIdx),taskIndex:taskIdx},function(){renderStudentTasks();setTimeout(function(){beginStudentVoiceRecording(taskIdx)},80)});return}
beginStudentVoiceRecording(taskIdx);
}
async function beginStudentVoiceRecording(taskIdx) {
  const btn = document.getElementById('stVoiceBtn_' + taskIdx);
  const status = document.getElementById('stVoiceStatus_' + taskIdx);
  const preview = document.getElementById('stVoicePreview_' + taskIdx);
  if(!btn || !status || !preview) return;
  if(btn.dataset.recording === 'true') return;
  try {
    const stream = await safeGetMic();
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    const asr = startArabicASR();
    recorder.ondataavailable = e => { if(e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      preview.src = url; preview.style.display = 'block';
      stream.getTracks().forEach(t => t.stop());
      if(asr) asr.stop();
      await new Promise(r => setTimeout(r, 600));
      const transcript = asr ? (asr.text || '') : '';
      const dataUrl = await blobToDataURL(blob);
      await verifyAndSubmitRecitation(taskIdx, blob, dataUrl, transcript, 'stVoiceAI_' + taskIdx, status, 'voice_recording.webm');
      btn.dataset.recording = 'false';
      btn.classList.remove('recording');
    };
    recorder.start();
    registerAudioRecorder('student-task-'+taskIdx,recorder,stream,{statusId:'stVoiceStatus_'+taskIdx,buttonId:'stVoiceBtn_'+taskIdx});
    btn.dataset.recording = 'true';
    btn.classList.add('recording');
    status.textContent = 'اري التسجيل... (اضغط مرة أخرى للإيقاف)';
    btn.onclick = function() { if(recorder.state !== 'inactive') recorder.stop(); };
  } catch(err) { alert('لا يمكن الوصول للميكروفون.'); }
}

// ====== AI VOICE FINGERPRINT ENGINE ======
function _fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const ang = -2 * Math.PI / len;
    const wr = Math.cos(ang), wi = Math.sin(ang);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        const ncr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = ncr;
      }
    }
  }
}

async function computeVoicePrint(blob) {
  // بصة محلية متعددة السمات: طيف صوتي + مركز الطيف + عبور الصفر + إحصاءات زمنية.
  // لا نرفع البصمة الخام إلى Gemini وGroq؛ تبقى المقارنة على جهاز المستخدم.
  try{
    const buf=await blob.arrayBuffer(),AC=window.AudioContext||window.webkitAudioContext,ctx=new AC(),audio=await ctx.decodeAudioData(buf.slice(0)),ch=audio.getChannelData(0);
    const N=1024,hop=512,bands=48,bandSum=new Float64Array(bands),bandSq=new Float64Array(bands),cent=[] ,zcr=[],ener=[];let frames=0;
    for(let off=0;off+N<=ch.length;off+=hop){
      let energy=0,zc=0;for(let i=0;i<N;i++){const x=ch[off+i];energy+=x*x;if(i&&((ch[off+i]>=0)!==(ch[off+i-1]>=0)))zc++}
      const rms=Math.sqrt(energy/N);if(rms<0.008)continue;
      const re=new Float64Array(N),im=new Float64Array(N);
      for(let i=0;i<N;i++){const w=0.54-0.46*Math.cos(2*Math.PI*i/(N-1));re[i]=ch[off+i]*w}
      _fft(re,im);let total=0,weighted=0;const bandsNow=new Float64Array(bands);
      for(let k=1;k<N/2;k++){const mag=Math.sqrt(re[k]*re[k]+im[k]*im[k]);total+=mag;weighted+=mag*(k*audio.sampleRate/N)}
      const centroid=total?weighted/total:0;
      for(let b=0;b<bands;b++){
        const lo=Math.max(1,Math.floor(Math.pow(N/2,b/bands))),hi=Math.min(N/2,Math.max(lo+1,Math.floor(Math.pow(N/2,(b+1)/bands))));let sum=0,c=0;
        for(let k=lo;k<hi;k++){sum+=Math.sqrt(re[k]*re[k]+im[k]*im[k]);c++}
        bandsNow[b]=Math.log1p(c?sum/c:0);bandSum[b]+=bandsNow[b];bandSq[b]+=bandsNow[b]*bandsNow[b];
      }
      cent.push(Math.min(1,centroid/(audio.sampleRate/2)));zcr.push(Math.min(1,zc/N));ener.push(Math.min(1,rms*10));frames++;
    }
    try{ctx.close()}catch(e){}
    if(frames<8)return null;
    const vec=[];
    for(let b=0;b<bands;b++){const m=bandSum[b]/frames,v=Math.max(0,bandSq[b]/frames-m*m);vec.push(m,Math.sqrt(v))}
    const avg=a=>a.reduce((x,y)=>x+y,0)/a.length;
    const std=a=>{const m=avg(a);return Math.sqrt(Math.max(0,avg(a.map(x=>(x-m)*(x-m)))))};
    vec.push(avg(cent),std(cent),avg(zcr),std(zcr),avg(ener),std(ener));
    // تطبيع المتجه حتى تصبح المقارنة أقل حساسية لمستوى الصوت.
    const mean=avg(vec);const centered=vec.map(x=>x-mean);const norm=Math.sqrt(centered.reduce((a,b)=>a+b*b,0))||1;
    return centered.map(x=>+(x/norm).toFixed(6));
  }catch(e){return null}
}

function voiceCosine(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let d = 0;
  for (let i = 0; i < a.length; i++) d += a[i] * b[i];
  return d;
}
function voiceMatchPercent(a, b) { return Math.round(Math.max(0, Math.min(1, (voiceCosine(a, b) + 1) / 2)) * 100); }
const VOICE_MATCH_THRESHOLD = 78;      // نسبة قبول مطابقة صوت الطالب
const VOICE_DUPLICATE_THRESHOLD = 93;  // نسبة اعتبار البصمة مكررة لطالب آخر

// ====== فحص جودة موحد قبل إرسال البصمة الصوتية إلى الخادم ======
async function inspectVoiceQuality(blob){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('المتصفح لا يدعم تحليل الصوت.');
  const ctx=new AC();try{
    const audio=await ctx.decodeAudioData((await blob.arrayBuffer()).slice(0)),data=audio.getChannelData(0);
    if(audio.duration<2.5)throw new Error('التسجيل قصير جدًا. سجّل صوتًا واضحًا لمدة خمس ثوانٍ على الأقل.');
    let energy=0,peak=0,clipped=0,voiced=0,frames=0;const frame=Math.max(1,Math.floor(audio.sampleRate*.03));
    for(let i=0;i<data.length;i++){const x=Math.abs(data[i]);energy+=x*x;peak=Math.max(peak,x);if(x>.985)clipped++}
    for(let off=0;off+frame<data.length;off+=frame){let sum=0;for(let i=0;i<frame;i++)sum+=data[off+i]*data[off+i];frames++;if(Math.sqrt(sum/frame)>.012)voiced++}
    const rms=Math.sqrt(energy/Math.max(1,data.length)),voicedRatio=voiced/Math.max(1,frames),clippedRatio=clipped/Math.max(1,data.length);
    if(rms<.008||voicedRatio<.25)throw new Error('لم يظهر صوت واضح في التسجيل. اقترب من الميكروفون وسجّل في مكان هادئ.');
    if(clippedRatio>.02||peak>=.999)throw new Error('مستوى الصوت مرتفع ويسبب تشويشًا. ابتعد قليلًا عن الميكروفون وأعد التسجيل.');
    return {duration:audio.duration,rms,voicedRatio,clippedRatio};
  }finally{try{await ctx.close()}catch(e){}}
}

async function voiceAudioPayload(blob){
  await inspectVoiceQuality(blob);
  // Gemini يدعم WAV/MP3/OGG/MP4، بينما تسجيل المتصفح يكون غالباً WebM/Opus.
  // نحول WebM وOpus دائماً إلى WAV قبل الإرسال حتى لا يفشل Gemini ثم يسقط الطلب بالكامل.
  const supported=/^audio\/(wav|x-wav|mpeg|mp3|mp4|x-m4a|m4a|ogg)(;|$)/i.test(blob.type||'');
  let audioBlob=blob;
  if(!supported){audioBlob=await blobToWav(blob);}
  if(!audioBlob) throw new Error('تعذر تجهز التسجيل بصيغة يدعمها Gemini');
  if(audioBlob.size>2800000) throw new Error('حجم التسجيل كبير جداً للتحليل الصوتي. سجّل مقطعاً أقصر من دقيقة ونصف.');
  return {audioBase64:await audioBlobToBase64(audioBlob),mimeType:audioBlob.type.split(';')[0]||'audio/wav'};
}
async function geminiVoiceProfile(blob){
  const audio=await voiceAudioPayload(blob);
  const data=await callStudentAI('voice_print',audio,0.05);
  if(!data||!data.speaker||data.usable===false)throw new Error((data&&data.reason)||'لم يتمكن Gemini من إنشاء بصمة صالحة');
  return data;
}
async function verifyVoiceIdentity(blob,student){
  const profile=(student&&student.voiceProfile)?student.voiceProfile:null;
  if(!profile)throw new Error('لا توجد بصمة Gemini مرجعية مفوءءة لهذا الطالءء');
  const audio=await voiceAudioPayload(blob);
  const data=await callStudentAI('voice_match',Object.assign({referenceProfile:profile},audio),0.05);
  if(!data||typeof data.matchPercent!=='number')throw new Error('لم يُرجع Gemini نتيجة مطابقة صالحة');
  return {pct:data.matchPercent,engine:'gemini',reason:data.reason||'',sameSpeaker:data.sameSpeaker===true};
}

function blobToDataURL(blob) {
  return new Promise(res => { const r = new FileReader(); r.onload = e => res(e.target.result); r.readAsDataURL(blob); });
}
// ====== تحويل الصوت المسجّل (webm/ogg) إلى WAV ======
// Gemini وGroq يقبل صوت الإدخال بصيغة wav أو mp3 فقط، بينما المتصفح يسجّل غالباً صيغة WebM.
// نفكّ الترميز عبر Web Audio ثم نعيد ترميزه PCM 16-bit أحادي القناة بمعدل 12kHz.
// يحافظ المعدل على وضوح الكلءءم ويُبقي تسجيل الدقيقة والنصف دون حد طلبت Vercel بعد Base64.
async function blobToWav(blob) {
  try {
  const buf = await blob.arrayBuffer();
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(buf.slice(0));
  await ctx.close();
  const targetRate = 12000;
    const srcData = decoded.getChannelData(0); // نأخذ القناة الأولى (أحادي)
    const ratio = decoded.sampleRate / targetRate;
    const outLen = Math.floor(srcData.length / ratio);
    const out = new Float32Array(outLen);
    for (let i = 0; i < outLen; i++) out[i] = srcData[Math.floor(i * ratio)] || 0;
    // كتابة رأس WAV (PCM 16-bit mono)
    const bytesPerSample = 2;
    const dataSize = outLen * bytesPerSample;
    const ab = new ArrayBuffer(44 + dataSize);
    const view = new DataView(ab);
    const writeStr = (off, s) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + dataSize, true); writeStr(8, 'WAVE');
    writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
    view.setUint16(22, 1, true); view.setUint32(24, targetRate, true);
    view.setUint32(28, targetRate * bytesPerSample, true); view.setUint16(32, bytesPerSample, true);
    view.setUint16(34, 16, true); writeStr(36, 'data'); view.setUint32(40, dataSize, true);
    let off = 44;
    for (let i = 0; i < outLen; i++) {
      let s = Math.max(-1, Math.min(1, out[i]));
      view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
      off += 2;
    }
    return new Blob([view], { type: 'audio/wav' });
  } catch (e) { return null; }
}
function dataURLToBlob(dataUrl) {
  try {
    const parts = dataUrl.split(',');
    const mime = (parts[0].match(/:(.*?);/) || [, 'audio/webm'])[1];
    const bin = atob(parts[1]);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: mime });
  } catch (e) { return null; }
}

// ====== QURAN AYAH IMAGES (صور الآيات ارسم العثماني المُشكَّل) ======
function surahNumber(name) {
  const i = ALL_SURAHS_ORDERED.indexOf((name || '').trim());
  return i === -1 ? 0 : i + 1;
}
function ayahImageUrl(sNum, ayah) {
  return 'https://cdn.islamic.network/quran/images/' + sNum + '_' + ayah + '.png';
}
function buildAyatImagesHTML(surah, from, to, width) {
  const sNum = surahNumber(surah);
  const f = parseInt(from) || 0, t = parseInt(to) || f;
  if (!sNum || !f) return '<p style="color:var(--text-light)">اختر السورة ورقم الآية أولاً</p>';
  const max = SURAH_AYAH_COUNTS[surah] || t;
  const end = Math.min(Math.max(t, f), max);
  const w = width || 92;
  let html = '<div class="ayat-images" style="direction:rtl; text-align:center; overflow:auto;">';
  html += '<div style="font-weight:700; color:var(--primary); margin-bottom:10px;">سورة ' + surah + ' — من الآية ' + f + ' إلى الآية ' + end + '</div>';
  for (let a = f; a <= end; a++) {
    html += '<div style="background:#fffdf5; border:1px solid #e6dcc3; border-radius:10px; padding:10px; margin-bottom:10px; overflow:auto;">' +
      '<img loading="lazy" src="' + ayahImageUrl(sNum, a) + '" alt="الآية ' + a + ' من سورة ' + surah + '" ' +
      'style="width:' + w + '%; max-width:none; height:auto;">' +
      '<div style="font-size:0.8rem; color:var(--text-light); margin-top:6px;">﴿ ' + a + ' </div></div>';
  }
  html += '</div>';
  return html;
}
let _ayatZoom = 92;
function openAyatViewer(surah, from, to) {
  if (!surahNumber(surah)) { showToast('❌ اختر السورة ئولاً', 'error'); return; }
  if (!parseInt(from)) { showToast('❌ حدد رقم الآية أولاً', 'error'); return; }
  _ayatZoom = 92;
  let modal = document.getElementById('ayatViewerModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'ayatViewerModal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.75); backdrop-filter:blur(4px); z-index:99999; display:flex; align-items:center; justify-content:center; padding:12px;';
    modal.innerHTML = '<div style="background:var(--card,#fff); border-radius:14px; width:100%; max-width:900px; max-height:92vh; display:flex; flex-direction:column; overflow:hidden;">' +
      '<div style="display:flex; gap:8px; align-items:center; justify-content:space-between; padding:12px; border-bottom:1px solid #ddd; flex-wrap:wrap;">' +
      '<strong id="ayatViewerTitle" style="color:var(--primary);">📖 عرض الآيات</strong>' +
      '<div style="display:flex; gap:6px;">' +
      '<button class="btn btn-xs btn-info" onclick="zoomAyat(25)">➕ تكبير</button>' +
      '<button class="btn btn-xs btn-info" onclick="zoomAyat(100)">🔍 تكبير ئوي</button>' +
      '<button class="btn btn-xs btn-info" onclick="zoomAyat(-25)">➖ تصغير</button>' +
      '<button class="btn btn-xs btn-secondary" onclick="zoomAyatReset()">↺ الحجم الأصلي</button>' +
      '<span id="ayatZoomLabel" style="align-self:center; font-size:0.85rem; color:var(--text-light);">100%</span>' +
      '<button class="btn btn-xs btn-danger" onclick="closeAyatViewer()">✖ إغلاق</button>' +
      '</div></div>' +
      '<div id="ayatViewerBody" style="overflow:auto; padding:14px; background:#fffdf5;"></div></div>';
    document.body.appendChild(modal);
  }
  modal.style.display = 'flex';
  modal.dataset.surah = surah; modal.dataset.from = from; modal.dataset.to = to || from;
  document.getElementById('ayatViewerBody').innerHTML = buildAyatImagesHTML(surah, from, to, _ayatZoom);
}
function zoomAyat(delta) {
  const modal = document.getElementById('ayatViewerModal');
  if (!modal) return;
  _ayatZoom = Math.max(40, Math.min(1200, _ayatZoom + delta));
  document.getElementById('ayatViewerBody').innerHTML = buildAyatImagesHTML(modal.dataset.surah, modal.dataset.from, modal.dataset.to, _ayatZoom);
  const lbl = document.getElementById('ayatZoomLabel');
  if (lbl) lbl.textContent = Math.round(_ayatZoom / 92 * 100) + '%';
}
function zoomAyatReset() { _ayatZoom = 92; zoomAyat(0); }
function closeAyatViewer() {
  const modal = document.getElementById('ayatViewerModal');
  if (modal) modal.style.display = 'none';
}
function toggleInlineAyat(boxId, surah, from, to) {
  const box = document.getElementById(boxId);
  if (!box) return;
  if (box.dataset.open === '1') { box.innerHTML = ''; box.dataset.open = '0'; return; }
  box.innerHTML = buildAyatImagesHTML(surah, from, to, 95);
  box.dataset.open = '1';
}


function renderStudentChart() {
  const s = currentUser;
  const sessions = s.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  if(finalizedSessions.length === 0) {
    document.getElementById('studentChartSection').innerHTML = '<div class="page" style="margin-top:20px;"><h4 style="color:var(--primary); margin-bottom:15px;">📊 مخطط التقييم</h4><div class="alert alert-info">لا توجد تقييمات نهائية مسجلة عد. سيتم ظهور المخطط بعد إغلاق أول تسميع.</div></div>'; return;
  }
  const canvasId = 'chart_' + s.id;
  document.getElementById('studentChartSection').innerHTML = '<div class="chart-container"><h4 style="color:var(--primary); margin-bottom:15px;">📊 مخطط تقييم حفظ القرآن الكريم</h4><canvas id="'+canvasId+'" width="1100" height="550" style="max-width:100%; height:auto;"></canvas><div class="chart-legend"><div class="legend-item"><div class="legend-dot" style="background:#6f42c1"></div><span>المجموع</span></div></div><div style="margin-top:15px;"><button class="btn btn-info" onclick="showStudentFullChart()">ءءءء عرض المخطط الكامل في صفحة منفصة</button></div></div>';
  setTimeout(() => drawTotalOnlyChart(canvasId, finalizedSessions), 100);
}

function showStudentFullChart() {
  const s = currentUser;
  const finalizedSessions = s.sessions ? s.sessions.filter(sess => !sess.isDraft) : [];
  if(finalizedSessions.length === 0) return;
  showPage('fullChartPage');
  const canvasId = 'fullChartCanvas';
  document.getElementById('fullChartContainer').innerHTML = 
    '<canvas id="'+canvasId+'" width="1200" height="650" style="max-width:100%; height:auto; border-radius:10px;"></canvas>'+
    '<div class="chart-legend" style="margin-top:20px;"><div class="legend-item"><div class="legend-dot" style="background:#6f42c1"></div><span>المجموع</span></div></div>';
  setTimeout(() => drawTotalOnlyChart(canvasId, finalizedSessions), 100);
}

function renderStudentInbox() {
  if (typeof window.renderUnifiedMessenger === 'function') { window.renderUnifiedMessenger('student'); return; }
  const msgs = getData('messages');
  const myMsgs = msgs.filter(m => m.receiverType === 'student' && m.receiverId === currentUser.id);
  if(myMsgs.length === 0) { document.getElementById('studentInboxList').innerHTML = '<div class="alert alert-info">لا توجد رسائل</div>'; renderVoiceBox('student'); return; }
  let html = '';
  const allMsgs = msgs;
  myMsgs.slice().reverse().forEach(m => {
    let fileBtn = '';
    if(m.sourceMsgId) {
      const src = allMsgs.find(x => x.id === m.sourceMsgId);
      if(src && src.fileData && src.shareWithParent) {
        fileBtn = '<div style="margin:8px 0;"><button class="btn btn-sm btn-info" onclick="openMessageFileById(\''+m.sourceMsgId+'\', true)">👁️ الاطلاع على الملف لمرسل (عرض فقط)</button></div>';
      }
    }
    html += '<div class="msg-item"><span class="sender">'+m.sender+'</span><span class="badge badge-primary">'+m.type+'</span><p style="margin:8px 0">'+m.text+'</p>'+voiceAudioHTML(m)+fileBtn+(m.reply ? '<div class="msg-reply"><strong>رد المسؤول:</strong> '+m.reply+(m.replyVoice ? ' <audio controls src="'+m.replyVoice+'" style="height:38px; vertical-align:middle;"></audio>' : '')+'</div>' : '')+'<span class="time">🕐 '+m.time+'</span></div>';
  });
  document.getElementById('studentInboxList').innerHTML = html;
  renderVoiceBox('student');
}

function markStudentMessagesRead() {
  let msgs = getData('messages');
  let changed = false;
  msgs.forEach(m => {
    if(m.receiverType === 'student' && m.receiverId === currentUser.id && !m.read) {
      m.read = true; changed = true;
    }
  });
  if(changed) setData('messages', msgs);
  updateStudentMsgBadge();
}

function updateStudentMsgBadge() {
  const msgs = getData('messages');
  const count = currentUser ? msgs.filter(m => m.receiverType === 'student' && m.receiverId === currentUser.id && !m.read).length : 0;
  const badge = document.getElementById('studentMsgBadge');
  if (!badge) return;
  badge.textContent = count; badge.classList.toggle('hidden', count === 0);
}

async function sendStudentChat() {
  const input = document.getElementById('studentChatInput'); const text=input.value.trim(); if(!text)return; input.value='';
  const chatDiv=document.getElementById('studentChatMessages');const typing=document.createElement('div');typing.className='ai-msg bot';typing.textContent='جاري التفكير...';chatDiv.innerHTML+='<div class="ai-msg user">'+escapeHtml(text)+'</div>';chatDiv.appendChild(typing);chatDiv.scrollTop=chatDiv.scrollHeight;
  const s=currentUser||{}; const last=(s.sessions||[]).filter(x=>!x.isDraft).slice(-1)[0]||null;
  try{
    const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'assistant',model:getSelectedAIModel(),prompt:'سؤال الطالب: '+text+'\nبيانات الطالب: '+JSON.stringify({name:s.name,juz:s.juz,surah:s.surah,lastSession:last,tasks:s.tasks||[],examResults:(s.examResults||[]).slice(-3)})})});
    const data=await readApiJson(res,'تعذر رد Gemini وGroq');
    const reply=escapeHtml(data.result||'لم يصل رد.').replace(/\n/g,'<br>');typing.innerHTML=reply;
  }catch(e){typing.innerHTML=escapeHtml(localSmartChatReply(text,'student'))+'<br><small>رد محي محدود بسبب تعذر Gemini وGroq.</small>'}
  chatDiv.scrollTop=chatDiv.scrollHeight;
}

function parentLogin() {
  const name = document.getElementById('parentName').value.trim();
  const pass = document.getElementById('parentPass').value.trim();
  const students = getData('students');
  const matched = students.filter(s => s.parent === name && s.parentPass === pass);
  if(matched.length === 0) {
    document.getElementById('parentLoginAlert').innerHTML = '<div class="alert alert-danger">❌ الاسم أو ائرقم السري غير صحيح</div>'; return;
  }
  currentUser = matched; currentType = 'parent';
  saveSessionState();
  const devices = getData('devices');
  devices.push({type:'parent', user:name, time:new Date().toLocaleString('ar-EG'), agent:navigator.userAgent});
  setData('devices', devices);
  renderParentDashboard(); showPage('parentDashboard');
}

function renderParentDashboard() {
  checkAndFinalizeDrafts();
  const children = currentUser;
  const welcomeMsgs = generateParentWelcome(children[0]);
  document.getElementById('parentWelcome').innerHTML = '<div class="welcome-msg"><h4>🌟 '+welcomeMsgs.title+'</h4><p>'+welcomeMsgs.body+'</p></div>';

  let html = '<div style="display:flex; gap:20px; flex-wrap:wrap;">';
  children.forEach(s => {
    const isQuran = s.subjects && s.subjects.some(sub => sub.name.includes('قرآن'));
    html += '<div style="flex:1; min-width:350px;"><div class="page" style="margin-top:0; border-right:5px solid var(--primary);">';
    html += '<h4 style="color:var(--primary); margin-bottom:15px;">👨🎓 '+s.name+'</h4>';
    html += '<p><strong>السن:</strong> '+(s.age || '-')+' سنة</p>';
    html += '<p><strong>المادة:</strong> <span class="badge badge-primary">'+(s.subjects ? s.subjects.map(sub=>sub.name).join('، ') : '-')+'</span></p>';
    html += '<p><strong>المدرس:</strong> '+(s.subjects ? s.subjects.map(sub => sub.teacher || '-').join('<br>') : '-')+'</p>';
    html += '<hr style="border:0; border-top:1px solid var(--border); margin:15px 0;">';

    if(isQuran) {
      html += '<div style="margin-top:15px; padding:15px; background:linear-gradient(135deg, rgba(31,88,69,0.08), rgba(179,138,67,0.1)); border-radius:10px; border:1px solid var(--primary);">';
      html += '<h5 style="color:var(--primary); margin-bottom:10px;">📖 بيانات الحفظ</h5>';
      if(s.juz) html += '<p><strong>الجزء:</strong> <span class="score-badge">'+s.juz+'</span></p>';
      if(s.surah) html += '<p><strong>السورة:</strong> <span class="score-badge">'+s.surah+'</span></p>';
      html += '</div>';

      const draft = s.sessions ? s.sessions.find(sess => sess.isDraft) : null;
      if(draft) {
        html += '<div style="margin-top:15px; padding:15px; background:linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.1)); border-radius:10px; border:2px solid var(--warning);">';
        html += '<h5 style="color:var(--warning); margin-bottom:10px;">📝 تسميع اليوم (مسودة)</h5>';
        draft.elements.forEach(e => {
          html += '<p>'+e.name+': '+(e.surah || '-')+' من آية '+(e.from || '-')+' إلى '+(e.to || '-')+' <span class="badge '+getRatingClass(e.rating)+'">'+getRatingLabel(e.rating)+'</span></p>';
        });
        html += '<div style="text-align:center; margin-top:10px;"><span class="score-badge">المجموع: '+draft.totalScore+' درجة</span></div>';
        const timeLeft = Math.max(0, 24 - ((Date.now() - draft.draftCreatedAt) / (60 * 60 * 1000)));
        html += '<p style="margin-top:8px; color:var(--text-light); font-size:0.9rem;">⏰ متبقي '+timeLeft.toFixed(1)+' ساعة للإغلق النهائي</p>';
        html += '</div>';
      }

      const finalizedSessions = s.sessions ? s.sessions.filter(sess => !sess.isDraft) : [];
      if(finalizedSessions.length > 0) {
        const last = finalizedSessions[finalizedSessions.length - 1];
        html += '<div style="margin-top:15px; padding:15px; background:var(--table-header); border-radius:10px;">';
        html += '<h5 style="color:var(--primary); margin-bottom:10px;">🎙️ آخر تسميع نهائي ('+last.date+')</h5>';
        last.elements.forEach(e => {
          html += '<p>'+e.name+': '+(e.surah || '-')+' من آية '+(e.from || '-')+' إلى '+(e.to || '-')+' <span class="badge '+getRatingClass(e.rating)+'">'+getRatingLabel(e.rating)+'</span></p>';
        });
        html += '<div style="text-align:center; margin-top:10px;"><span class="score-badge">المجموع: '+last.totalScore+' د��جة</span></div>';
        if(last.finalizedAt) html += '<p style="margin-top:8px; color:var(--success); font-size:0.9rem;">✅ تم الإغلاق النهائي: '+last.finalizedAt+'</p>';
        html += '</div>';
      }

      if(finalizedSessions.length > 0) {
        const chartId = 'parent_chart_' + s.id;
        html += '<div class="chart-container" style="margin-top:15px;"><h5 style="color:var(--primary); margin-bottom:10px;">📊 مخطط التقييم</h5><canvas id="'+chartId+'" width="900" height="400" style="max-width:100%; height:auto;"></canvas></div>';
        setTimeout(() => drawTotalOnlyChart(chartId, finalizedSessions), 200);
      }

      html += '<div class="report-box" style="margin-top:15px;"><h5 style="color:var(--primary); margin-bottom:10px;">🤖 التقرير الذكي</h5><p>'+generateAIReport(s)+'</p></div>';
    }

    if(s.tasks && s.tasks.length > 0) {
      html += '<div style="margin-top:15px;"><h5 style="color:var(--primary); margin-bottom:10px;">📝 المهام الحالية</h5>';
      s.tasks.forEach(task => {
        const status = task.approved ? '✅ تمت الموافقة' : (task.rejected ? '❌ تم الرفض' : '⏳ قيد لانتظار');
        html += '<p><strong>'+(task.type === 'homework' ? '📝 واجب' : task.type === 'reading' ? '📖 قراءة' : '🎙️ تسجيل صوتي')+':</strong> '+(task.name || task.text || '')+' — '+status+'</p>';
      });
      html += '</div>';
    }

    html += '<p style="margin-top:10px; color:var(--text-light); font-size:0.9rem;">🕐 تاريخ التسجيل: '+s.createdAt+'</p></div></div>';
  });
  html += '</div>';
  document.getElementById('parentInfo').innerHTML = html;
}

function renderParentInbox() {
  if (typeof window.renderUnifiedMessenger === 'function') { window.renderUnifiedMessenger('parent'); return; }
  const msgs = getData('messages');
  const myMsgs = msgs.filter(m => m.receiverType === 'parent' && m.receiverName === currentUser[0].parent);
  if(myMsgs.length === 0) { document.getElementById('parentInboxList').innerHTML = '<div class="alert alert-info">لا توجد رسائل</div>'; renderVoiceBox('parent'); return; }
  let html = '';
  myMsgs.slice().reverse().forEach(m => {
    html += '<div class="msg-item"><span class="sender">'+m.sender+'</span><span class="badge badge-primary">'+m.type+'</span><p style="margin:8px 0">'+m.text+'</p>'+voiceAudioHTML(m)+(m.reply ? '<div class="msg-reply"><strong>رد المسؤول:</strong> '+m.reply+(m.replyVoice ? ' <audio controls src="'+m.replyVoice+'" style="height:38px; vertical-align:middle;"></audio>' : '')+'</div>' : '')+'<span class="time">🕐 '+m.time+'</span></div>';
  });
  document.getElementById('parentInboxList').innerHTML = html;
  renderVoiceBox('parent');
}

function markParentMessagesRead() {
  let msgs = getData('messages');
  let changed = false;
  msgs.forEach(m => {
    if(m.receiverType === 'parent' && m.receiverName === currentUser[0].parent && !m.read) {
      m.read = true; changed = true;
    }
  });
  if(changed) setData('messages', msgs);
  updateParentMsgBadge();
}

function updateParentMsgBadge() {
  const msgs = getData('messages');
  const parentName = Array.isArray(currentUser) && currentUser[0] ? currentUser[0].parent : null;
  const count = parentName ? msgs.filter(m => m.receiverType === 'parent' && m.receiverName === parentName && !m.read).length : 0;
  const badge = document.getElementById('parentMsgBadge');
  if (!badge) return;
  badge.textContent = count; badge.classList.toggle('hidden', count === 0);
}

async function sendParentChat() {
  const input=document.getElementById('parentChatInput');const text=input.value.trim();if(!text)return;input.value='';
  const chatDiv=document.getElementById('parentChatMessages');const typing=document.createElement('div');typing.className='ai-msg bot';typing.textContent='جاري تحليل البيانات...';chatDiv.innerHTML+='<div class="ai-msg user">'+escapeHtml(text)+'</div>';chatDiv.appendChild(typing);chatDiv.scrollTop=chatDiv.scrollHeight;
  const child=currentUser&&currentUser[0]?currentUser[0]:{}; const last=(child.sessions||[]).filter(x=>!x.isDraft).slice(-1)[0]||null;
  try{
    const res=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({mode:'assistant',model:getSelectedAIModel(),prompt:'سؤال ولي الأمر: '+text+'\nبانات الابن/الابنة: '+JSON.stringify({name:child.name,juz:child.juz,surah:child.surah,lastSession:last,tasks:child.tasks||[],examResults:(child.examResults||[]).slice(-3)})})});
    const data=await readApiJson(res,'تعذر رد Gemini وGroq');const reply=escapeHtml(data.result||'لم يصل رد.').replace(/\n/g,'<br>');typing.innerHTML=reply;
  }catch(e){typing.innerHTML=escapeHtml(localSmartChatReply(text,'parent'))+'<br><small>��د محلي محدود بسبب تعذر Gemini وGroq.</small>'}
  chatDiv.scrollTop=chatDiv.scrollHeight;
}

function renderParentRecords() {
  const children = currentUser;
  if(!children || children.length === 0) {
    document.getElementById('parentRecordsContent').innerHTML = '<div class="alert alert-info">لا يوجد بيانات</div>';
    return;
  }
  let html = '';
  children.forEach(s => {
    const isQuran = s.subjects && s.subjects.some(sub => sub.name.includes('قرآن'));
    const finalizedSessions = s.sessions ? s.sessions.filter(sess => !sess.isDraft) : [];
    html += '<div class="page" style="margin-bottom:20px; border-right:5px solid var(--primary);">';
    html += '<h3 style="color:var(--primary); margin-bottom:15px;">👨‍🎓 '+s.name+'</h3>';
    if(!isQuran) {
      html += '<div class="alert alert-info">هذا الطالب غير مسجل في حلقة القرآن</div>';
    } else if(finalizedSessions.length === 0) {
      html += '<div class="alert alert-info">لا توجد تسميعات نهائية مسجلة بد</div>';
    } else {
      const grouped = {};
      finalizedSessions.forEach(sess => {
        if(!grouped[sess.date]) grouped[sess.date] = [];
        grouped[sess.date].push(sess);
      });
      Object.keys(grouped).sort().reverse().forEach(date => {
        html += '<div class="history-day">';
        html += '<div class="history-day-header">ءء '+date+'</div>';
        grouped[date].forEach(sess => {
          sess.elements.forEach((el, ei) => {
            html += '<div class="history-element" style="border-right-color:'+(el.color || 'var(--info)')+';">';
            html += '<div class="history-element-name">'+(ei+1)+'. '+el.name+'</div>';
            html += '<div class="history-element-details">';
            html += '<div class="history-detail"><strong>السورة:</strong> '+(el.surah || '-')+'</div>';
            html += '<div class="history-detail"><strong>من آية:</strong> '+(el.from || '-')+'</div>';
            html += '<div class="history-detail"><strong>إلى آية:</strong> '+(el.to || '-')+'</div>';
            html += '<div class="history-detail"><strong>التقييم:</strong> <span class="badge '+getRatingClass(el.rating)+'">'+getRatingLabel(el.rating)+'</span></div>';
            if(el.isHomework) html += '<div class="history-detail"><span class="badge badge-success">📝 واجب</span></div>';
            if(el.isVoice) html += '<div class="history-detail"><span class="badge badge-primary">🎙️ تسجيل صوتي</span></div>';
            html += '</div></div>';
          });
          html += '<div style="text-align:center; margin-top:15px; padding-top:15px; border-top:2px dashed var(--border);">';
          html += '<span class="score-badge">الم��موع: '+sess.totalScore+' درجة</span>';
          if(sess.finalizedAt) html += '<p style="margin-top:8px; color:var(--success); font-size:0.9rem;"> تم الإغلاق النهائي: '+sess.finalizedAt+'</p>';
          if(sess.notes) html += '<p style="margin-top:10px; color:var(--text-light);"><strong>ملاحظات:</strong> '+sess.notes+'</p>';
          html += '</div>';
        });
        html += '</div>';
      });
    }
    html += renderParentExamResults(s);
    html += renderTaskArchiveHtml(s);
    html += '</div>';
  });
  document.getElementById('parentRecordsContent').innerHTML = html;
}

function renderParentPendingTasks() {
  const children = currentUser;
  if(!children || children.length === 0) {
    document.getElementById('parentPendingTasksContent').innerHTML = '<div class="alert alert-info">لا يوجد بيانات</div>';
    return;
  }
  let html = '';
  children.forEach(s => {
    const tasks = s.tasks || [];
    const pendingTasks = tasks.filter(t => !t.approved && !t.rejected).sort((a, b) => (b.sentAt || 0) - (a.sentAt || 0));
    const todayStr = new Date().toISOString().split('T')[0];
    const approvedToday = (s.completedTasks || []).filter(t => (t.day || todayStr) === todayStr);
    const rejectedToday = (s.rejectedLog || []).filter(t => (t.day || todayStr) === todayStr);
    html += '<div class="page" style="margin-bottom:20px; border-right:5px solid var(--warning);">';
    html += '<h3 style="color:var(--warning); margin-bottom:15px;">🎓 '+s.name+'</h3>';
    if(pendingTasks.length === 0) {
      html += '<div class="alert alert-success">✅ لا توجد مهام قيد الانتظار — الطالب على قدر المسؤولية!</div>';
    } else {
      html += '<div style="background:linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,152,0,0.1)); border-radius:15px; padding:15px; margin-bottom:15px;">';
      html += '<h4 style="color:var(--warning); margin-bottom:10px;">⏳ عدد المهام المعلقة: '+pendingTasks.length+'</h4>';
      html += '</div>';
      pendingTasks.forEach((task, i) => {
        const sentTime = task.sentAt ? new Date(task.sentAt).toLocaleString('ar-EG') : 'غير محدءء';
        const hoursPassed = task.sentAt ? Math.floor((Date.now() - task.sentAt) / (1000 * 60 * 60)) : 0;
        const urgency = hoursPassed > 12 ? '<span class="badge badge-danger">🔴 عاجل</span>' : (hoursPassed > 6 ? '<span class="badge badge-warning">🟠 قريب</span>' : '<span class="badge badge-info">🟢 حديث</span>');
        html += '<div class="task-card" style="border-right-color:var(--warning);">';
        html += '<h5>'+urgency+' '+(task.type === 'homework' ? '📝 واجب' : task.type === 'reading' ? '📖 قراءة' : '🎙️ تسجيل صوتي')+': '+(task.name || task.text || '')+'</h5>';
        if(task.surah) html += '<p><strong>السورة:</strong> '+task.surah+' | <strong>من آية:</strong> '+(task.from || '-')+' | <strong>إلى آية:</strong> '+(task.to || '-')+'</p>';
        html += '<p style="color:var(--text-light); font-size:0.9rem;">🕐 تم الإرسال: '+sentTime+'</p>';
        if(hoursPassed > 0) html += '<p style="color:var(--danger); font-size:0.85rem;">⏱️ مر '+hoursPassed+' ساعة على إرسال المهمة</p>';
        html += '</div>';
      });
    }

    // المهام التي وافق عليها المسؤول اليوم
    html += '<h4 style="color:var(--success); margin:15px 0 10px;">✅ المهام الموافق عليها اليوم ('+approvedToday.length+')</h4>';
    if(approvedToday.length === 0) {
      html += '<div class="alert alert-info">لا توجد مهام تمت الموافقة عليها اليوم</div>';
    } else {
      approvedToday.slice().reverse().forEach(task => {
        html += '<div class="task-card" style="border-right-color:var(--success);">';
        html += '<h5 style="color:var(--success);">✅ '+(task.type === 'homework' ? '📝 واجب' : task.type === 'reading' ? '📖 قراءة' : '🎙 تسجيل صوتي')+': '+(task.name || task.text || '')+'</h5>';
        if(task.surah) html += '<p><strong>السورة:</strong> '+task.surah+' | <strong>من آية:</strong> '+(task.from || '-')+' | <strong>إلى آية:</strong> '+(task.to || '-')+'</p>';
        html += '<p style="color:var(--text-light); font-size:0.9rem;">🕐 '+(task.approvedAt || '')+'</p>';
        if(task.sourceMsgId) html += '<button class="btn btn-sm btn-info" onclick="openMessageFileById(\''+task.sourceMsgId+'\', true)">👁️ الاطلاع عل�� الملف (عرض فقط)</button>';
        html += '</div>';
      });
    }

    // المهام التي رفضها المسؤول اليوم
    html += '<h4 style="color:var(--danger); margin:15px 0 10px;">❌ المهام المرفوضة اليوم ('+rejectedToday.length+')</h4>';
    if(rejectedToday.length === 0) {
      html += '<div class="alert alert-info">لا توجد مهام مرفوضة اليوم</div>';
    } else {
      rejectedToday.slice().reverse().forEach(task => {
        html += '<div class="task-card" style="border-right-color:var(--danger);">';
        html += '<h5 style="color:var(--danger);">❌ '+(task.type === 'homework' ? '📝 واجب' : task.type === 'reading' ? '📖 قراءة' : '🎙️ تسجيل صوتي')+': '+(task.name || task.text || '')+'</h5>';
        if(task.surah) html += '<p><strong>السورة:</strong> '+task.surah+' | <strong>من آية:</strong> '+(task.from || '-')+' | <strong>إلى آية:</strong> '+(task.to || '-')+'</p>';
        html += '<p style="color:var(--text-light); font-size:0.9rem;">🕐 '+(task.rejectedAt || '')+'</p>';
        if(task.sourceMsgId) html += '<button class="btn btn-sm btn-info" onclick="openMessageFileById(\''+task.sourceMsgId+'\', true)">👁️ ا��اطلاع على الملف (عرض فقط)</button>';
        html += '</div>';
      });
    }

    html += '</div>';
  });
  document.getElementById('parentPendingTasksContent').innerHTML = html;
}

function renderParentFullChart() {
  const children = currentUser;
  const finalizedSessions = children[0].sessions ? children[0].sessions.filter(sess => !sess.isDraft) : [];
  if(finalizedSessions.length === 0) {
    document.getElementById('parentChartContainer').innerHTML = '<div class="alert alert-info">لا توجد بيانات كافية ءءلمخطط</div>'; return;
  }
  const canvasId = 'parentFullChart';
  document.getElementById('parentChartContainer').innerHTML = 
    '<canvas id="'+canvasId+'" width="1200" height="650" style="max-width:100%; height:auto; border-radius:10px;"></canvas>'+
    '<div class="chart-legend" style="margin-top:20px;"><div class="legend-item"><div class="legend-dot" style="background:#6f42c1"></div><span>المجموع</span></div></div>';
  setTimeout(() => drawTotalOnlyChart(canvasId, finalizedSessions), 100);
}

function uploadFile(input) {
  const file = input.files[0];
  if(!file) return;
  const desc = document.getElementById('fileDesc').value.trim() || file.name;
  const category = document.getElementById('fileCategory').value;
  const targetSel = document.getElementById('fileTarget');
  const targetId = targetSel ? targetSel.value : 'all';
  const progressDiv = document.getElementById('fileUploadProgress');
  progressDiv.innerHTML = '<div class="alert alert-info">⏳ جاري رفع الملف...</div>';

  const reader = new FileReader();
  reader.onprogress = function(e) {
    if(e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      progressDiv.innerHTML = '<div class="alert alert-info">⏳ جاري الرفع... '+pct+'%</div>';
    }
  };
  reader.onload = function(e) {
    let files = getData('uploadedFiles', []);
    const fileData = {
      id: Date.now(),
      name: file.name,
      desc: desc,
      category: category,
      audience: category,
      targetId: targetId,
      size: file.size,
      type: file.type,
      data: e.target.result,
      uploadedAt: new Date().toLocaleString('ar-EG'),
      uploadedBy: currentUser ? (currentUser.mobile || currentUser.name || 'مسؤول') : 'مءءؤول'
    };
    files.push(fileData);
    setData('uploadedFiles', files);
    progressDiv.innerHTML = '<div class="alert alert-success">✅ تم رفع الملف بنجاح!</div>';
    document.getElementById('fileDesc').value = '';
    document.getElementById('fileInput').value = '';
    renderFiles();
    setTimeout(() => { progressDiv.innerHTML = ''; }, 5000);
  };
  reader.onerror = function() {
    progressDiv.innerHTML = '<div class="alert alert-danger">❌ فشل رفع الملف</div>';
  };
  reader.readAsDataURL(file);
}

function renderFiles() {
  let files = getData('uploadedFiles', []);
  const categoryLabels = {student:'👨‍🎓 الطالب', parent:'👨‍👩‍👧 ولي ءءلأمر', general:'عام', quran:'قرآن', lessons:'دروس', exams:'اختبار��ت', reports:'تقارير'};

  if(files.length === 0) {
    document.getElementById('filesList').innerHTML = '<div class="alert alert-info">لا توجد لفات مرفوعة عد</div>';
    return;
  }

  let html = '<h4 style="color:var(--primary); margin-bottom:15px;">📁 الملفات المرفوعة ('+files.length+')</h4>';
  html += '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">';
  files.slice().reverse().forEach(f => {
    const sizeMB = (f.size / (1024*1024)).toFixed(2);
    const icon = f.type && f.type.startsWith('image/') ? '🖼️' : f.type && f.type.startsWith('audio/') ? '🎵' : f.type && f.type.startsWith('video/') ? '🎬' : f.type && f.type.includes('pdf') ? '' : '📎';
    html += '<div style="background:var(--table-header); border-radius:12px; padding:15px; border:2px solid var(--border); transition:0.2s;" onmouseover="this.style.borderColor=&quot;var(--primary)&quot;" onmouseout="this.style.borderColor=&quot;var(--border)&quot;">';
    html += '<div style="font-size:2.5rem; text-align:center; margin-bottom:10px;">'+icon+'</div>';
    html += '<h5 style="color:var(--primary); margin-bottom:5px; word-break:break-word;">'+f.desc+'</h5>';
    html += '<p style="color:var(--text-light); font-size:0.85rem; margin-bottom:8px;">'+f.name+'</p>';
    html += '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">';
    html += '<span class="badge badge-primary">'+(categoryLabels[f.category] || f.category)+'</span>';
    html += '<span class="badge badge-info">'+fileTargetLabel(f)+'</span>';
    html += '<span class="badge badge-secondary">'+sizeMB+' MB</span>';
    html += '</div>';
    html += '<p style="color:var(--text-light); font-size:0.8rem; margin-bottom:12px;">🕐 '+f.uploadedAt+'</p>';
    html += '<div style="display:flex; gap:8px;">';
    html += '<a href="'+f.data+'" download="'+f.name+'" class="btn btn-sm btn-success" style="text-decoration:none;">⬇️ تحميل</a>';
    html += '<button class="btn btn-sm btn-primary" onclick="viewFile('+f.id+')">👁️ عرض</button>';
    html += '<button class="btn btn-sm btn-danger" onclick="deleteFile('+f.id+')">🗑️ حذف</button>';
    html += '</div>';
    html += '</div>';
  });
  html += '</div>';
  document.getElementById('filesList').innerHTML = html;
}

function renderFileTargetSelect() {
  const catSel = document.getElementById('fileCategory');
  const sel = document.getElementById('fileTarget');
  if(!catSel || !sel) return;
  const cat = catSel.value;
  const students = getData('students', []);
  let html = '<option value="all">' + (cat === 'parent' ? 'كل أولياء الأمور' : 'كل الطلا') + '</option>';
  students.forEach(st => {
    const label = cat === 'parent' ? ((st.parent || 'ولي أمر') + ' — ولي أمر ' + st.name) : st.name;
    html += '<option value="' + st.id + '">' + label + '</option>';
  });
  sel.innerHTML = html;
}

function fileTargetLabel(f) {
  const aud = f.audience || f.category;
  if(!f.targetId || f.targetId === 'all') return aud === 'parent' ? 'كل أولياء الأمور' : 'كل الكلاب';
  const st = getData('students', []).find(x => String(x.id) === String(f.targetId));
  if(!st) return 'مستلم محءءد';
  return aud === 'parent' ? ('ولي أمر ' + st.name) : st.name;
}

function getFilesForUser(role) {
  const files = getData('uploadedFiles', []);
  let ids = [];
  if(role === 'student' && currentUser && !Array.isArray(currentUser)) ids = [String(currentUser.id)];
  if(role === 'parent' && Array.isArray(currentUser)) ids = currentUser.map(k => String(k.id));
  return files.filter(f => {
    const aud = f.audience || f.category;
    if(aud !== role) return false;
    if(!f.targetId || f.targetId === 'all') return true;
    return ids.includes(String(f.targetId));
  });
}

function renderUserFiles(role) {
  const box = document.getElementById(role === 'student' ? 'studentFilesContent' : 'parentFilesContent');
  if(!box) return;
  const files = getFilesForUser(role);
  if(files.length === 0) { box.innerHTML = '<div class="alert alert-info">لا توجد ملفات مرسلة إليك حتى الآن</div>'; return; }
  let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(300px, 1fr)); gap:15px;">';
  files.slice().reverse().forEach(f => {
    const sizeMB = (f.size / (1024*1024)).toFixed(2);
    const icon = f.type && f.type.startsWith('image/') ? '🖼' : f.type && f.type.startsWith('audio/') ? '🎵' : f.type && f.type.startsWith('video/') ? '' : f.type && f.type.includes('pdf') ? '📄' : '📎';
    html += '<div style="background:var(--table-header); border-radius:12px; padding:15px; border:2px solid var(--border);">';
    html += '<div style="font-size:2.5rem; text-align:center; margin-bottom:10px;">' + icon + '</div>';
    html += '<h5 style="color:var(--primary); margin-bottom:5px; word-break:break-word;">' + f.desc + '</h5>';
    html += '<p style="color:var(--text-light); font-size:0.85rem; margin-bottom:8px;">' + f.name + '</p>';
    html += '<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;"><span class="badge badge-secondary">' + sizeMB + ' MB</span><span class="badge badge-primary">من المسؤل</span></div>';
    html += '<p style="color:var(--text-light); font-size:0.8rem; margin-bottom:12px;">🕐 ' + f.uploadedAt + '</p>';
    html += '<div style="display:flex; gap:8px;">';
    html += '<a href="' + f.data + '" download="' + f.name + '" class="btn btn-sm btn-success" style="text-decoration:none;">⬇️ تمي��</a>';
    html += '<button class="btn btn-sm btn-primary" onclick="viewFile(' + f.id + ')">👁️ عر</button>';
    html += '</div></div>';
  });
  html += '</div>';
  box.innerHTML = html;
}

function viewFile(id) {
  let files = getData('uploadedFiles', []);
  const f = files.find(x => x.id === id);
  if(!f) return;
  openFileModal(f.data, f.name, f.desc, f.type);
}

function openFileModal(fileData, fileName, desc, fileType, readonly) {
  const modal = document.getElementById('fileViewModal');
  const content = document.getElementById('fileModalContent');
  const downloadBtn = document.getElementById('fileModalDownload');
  if(!modal || !content || !downloadBtn) return;
  downloadBtn.href = fileData;
  downloadBtn.download = fileName || 'file';
  downloadBtn.style.display = readonly ? 'none' : '';
  let html = '<h3 style="color:var(--primary); margin-bottom:15px; padding-left:50px;">'+(desc || fileName || 'عرض الملف')+'</h3>';
  if(fileType && fileType.startsWith('image/')) {
    html += '<div style="text-align:center;"><img src="'+fileData+'" style="max-width:100%; max-height:70vh; border-radius:10px; box-shadow:0 5px 20px rgba(0,0,0,0.2);"></div>';
  } else if(fileType && fileType.startsWith('audio/')) {
    html += '<div style="text-align:center; padding:40px;"><audio controls src="'+fileData+'" style="width:100%;"></audio></div>';
  } else if(fileType && fileType.startsWith('video/')) {
    html += '<div style="text-align:center;"><video controls src="'+fileData+'" style="max-width:100%; max-height:70vh; border-radius:10px;"></video></div>';
  } else if(fileType && fileType.includes('pdf')) {
    html += '<div style="height:70vh;"><iframe src="'+fileData+'" style="width:100%; height:100%; border:none; border-radius:10px;"></iframe></div>';
  } else {
    html += '<div style="text-align:center; padding:40px;"><div style="font-size:4rem; margin-bottom:20px;">📎</div><p>هذا الملف لا يمكن عرضه مباشرة</p><p style="color:var(--text-light);">'+(fileName || 'ملف')+'</p></div>';
  }
  content.innerHTML = html;
  modal.classList.remove('hidden');
}

function openMessageFile(msgIdx) {
  const msgs = getData('messages');
  const m = msgs[msgIdx];
  if(!m || !m.fileData) return;
  openFileModal(m.fileData, m.fileName || 'file', 'ملف من '+m.sender, m.fileType === 'homework' ? 'image/jpeg' : m.fileType === 'reading' || m.fileType === 'voice' ? 'audio/webm' : '');
}

function closeFileModal() {
  const modal = document.getElementById('fileViewModal');
  const content = document.getElementById('fileModalContent');
  if(modal) modal.classList.add('hidden');
  if(content) content.innerHTML = '';
}

function deleteFile(id) {
  if(!confirm('هل أنت متأكد من حذف هذا الملف؟')) return;
  let files = getData('uploadedFiles', []);
  files = files.filter(f => f.id !== id);
  setData('uploadedFiles', files);
  renderFiles();
}

function generateAIReport(student) {
  const sessions = student.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  if(finalizedSessions.length === 0) return 'لم يتم تسجيل أي تسميع نهائ�� بعد. بداية جيدة تنتظرك! 💪';
  const last3 = finalizedSessions.slice(-3);
  const avgScore = last3.reduce((sum, s) => sum + s.totalScore, 0) / last3.length;
  let report = '';
  if(avgScore >= 14) report = 'ممتاز يا '+student.name+'! 🌟 مستواك رائع جداً. أنت تحفظ بثباءء وتميز. استمر في المراجعة وستكون من حفاظ كتاب الله.';
  else if(avgScore >= 10) report = 'جيد جداً يا '+student.name+'! 👍 أداؤك ممتاز مع مجال للتحسين في المراجعة. ��افظ على الاستمرارة.';
  else if(avgScore >= 6) report = 'جيد يا '+student.name+'! 📚 مستواك في تقدم مستمر. أنصحك بزيادة وقت المراجعة اليومي.';
  else report = 'لا تيأس يا '+student.name+'! 💪 كل بداية صعبة. حافظ على التكرار والمراجعة اليومية وسترى التحسن قريباً.';
  report += '<br><br>📊 متوسط آخر 3 تس��يعات: <strong>'+avgScore.toFixed(1)+' / 16</strong><br>📈 عدد التسميعات المسجلة: '+finalizedSessions.length;
  return report;
}

function generateWelcomeMessages(student) {
  const sessions = student.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  const last = finalizedSessions.length > 0 ? finalizedSessions[finalizedSessions.length - 1] : null;
  const dayOfWeek = new Date().getDay();
  const templates = [
    {title: 'هلاً بك يا '+student.name+'! 🌟', body: 'يوم جديد، فرصة جديدة للتقرب من كتاب الله. اجعل لنفسك ورداً يومياً لا يفوتك، فالقرآن نور يُهدى به الله من شيء.'},
    {title: 'صباح التفاؤل يا '+student.name+'! ☀️', body: 'تذكر ن كل حرف تقرأه في كتاب الله له أجر عظيم. لا تستهن بمراجعة صفحة واحدة، فالقليل الدائم خير من الكثير المنقطع.'},
    {title: 'مرحباً يا '+student.name+'! 📖', body: 'القرآن كلام الله، فاجعل له قلباً خاشعاً ولساناً رطباً. ابدأ يومك بآية، وانتهِ به بآية وسترى الفرق في حياتك.'},
    {title: 'مساء الخير يا '+student.name+'! 🌙', body: 'اللهم اجعل القرآن ربيع قلبك. خصص وقتاً للمراجعة قبل النوم، فإنها تثبت الحفظ وتجعله متياً.'},
    {title: 'يوم مبارك يا '+student.name+'! ✨', body: 'حافظ على الاستمرارية في الحفظ، فالقرآن يُحفظ بالتكرار والمراجعة. ثق بالله، فهو معك في كل خطوة.'}
  ];
  const base = templates[dayOfWeek % templates.length];
  if(last) {
    base.body += '<br><br>📊 آخر تسميعك النهائي كان بتاريخ '+last.date+' بمجموع <strong>'+last.totalScore+' درجة</strong>. ';
    if(last.totalScore >= 14) base.body += 'أداء رائع! استمر في هذا المستوى الممتاز. 🌟';
    else if(last.totalScore >= 10) base.body += 'جيد جداً! مع قليل ن المراجعة ستصل للتميز. 👍';
    else if(last.totalScore >= 6) base.body += 'مستوى جيد، لكن يحتاج لمزيد من التركيز والمراجعة اليومية. 📚';
    else base.body += 'لا تيأس! كل بداية صعبة. حافظ على التكرار وسترى التحسن قريباً. 💪';
  }
  return base;
}

function generateParentWelcome(student) {
  const sessions = student.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  const last = finalizedSessions.length > 0 ? finalizedSessions[finalizedSessions.length - 1] : null;
  const templates = [
    {title: 'أهلاً بك! 🌟', body: 'ابنك '+student.name+' يخطو خطوات جميلة في رحل��ه مع القرآن. دعمه وتحفي��ه هما سر التقدم.'},
    {title: 'تقرير يومي! 📊', body: 'متابعة ابنك تُثمر بالخر. احرص على سؤاله عن حفظه يومياً، فالاهتمام يُشعره بأهمية ما يفعله.'},
    {title: 'مساء الخير! 🌙', body: 'القرآن غذاء الروح. شجع ابنك '+student.name+' لى الاستمرار، وذكّه بأ الله يُضاعف الأجر لمن يتب في سبيله.'}
  ];
  const base = templates[Math.floor(Math.random() * templates.length)];
  if(last) {
    base.body += '<br><br>📊 آخر تسميع ن��ائي لـ '+student.name+' كان بتاريخ '+last.date+' بمجموع <strong>'+last.totalScore+' درجة</strong>. ';
    if(last.totalScore >= 14) base.body += 'أداء مءءتاز! ابنك يُظهر تفوقاً واضحاً. استمر في تشجيعه. 🌟';
    else if(last.totalScore >= 10) base.body += 'مستوى جي جداً. مع دعمك المستمر سيصل للتميز. ����';
    else base.body += 'يحتاج لبعض الدعم والمراجعة. جالسه يومياً وشاركه الحفظ. 💪';
  }
  return base;
}

function generateAIResponse(text, student) {
  const raw = (text || '').trim();
  const lower = raw.toLowerCase();
  const has = function(){ for(var i=0;i<arguments.length;i++){ if(lower.indexOf(arguments[i])!==-1) return true; } return false; };
  const sessions = student.sessions || [];
  const finalizedSessions = sessions.filter(sess => !sess.isDraft);
  const last = finalizedSessions.length > 0 ? finalizedSessions[finalizedSessions.length - 1] : null;
  const tasks = student.tasks || [];
  const pending = tasks.filter(t => !t.approved);
  const name = student.name || 'صديقي';

  // تحية
  if(has('السلا','مرحبا','مرحباً','هلا','اهلا','أهلا','صباح','مساء')) {
    return 'وعليكم السلام ورحمة الله وبركاته '+name+'! ءءء<br><br>أنا <strong>مساعدك الذكي</strong> في رحلتك مع القرآن، متاح ئك 24 ساعة.<br>جرّب أن تكتب:<br>• <em>ستواي</em> — لعرض آخر تقييم وتحليله<br>• <em>مهاءء</em> — لعرض الوجبءءءت والتسجيلات المطلوبة<br>• <em>لآيات</em> — لمعرفة كيف ترى آيات تسءءيعك كصورة<br>• <em>خطة</em> — لخطة حفظ يومية مصصة ك<br>• <em>تحفيز</em> — لجرعة همة 💪';
  }
  // شكر
  if(has('شكرا','شكراً','جزاك','بارك الله','تمام','ok')) {
    return 'وإياك '+name+' 🌸 دائماً في خدمتك. استمر، فكل حرف تحءءظه لك به ��سنة والحسنة بعشر أمثالها.';
  }
  // المستوى / التقييم
  if(has('مستوى','مستواي','تقييم','درجات','درجة','نتيجة','نتيجتي')) {
    if(!last) return 'مرحباً '+name+'! 🌟<br><br>لم ُسجَّل أي تسميع نهائي بعد. ابدأ اليوم، وسيظهر تقييءءك هنا فور اعتماد من المسؤول.';
    let r = '📊 <strong>آخر تسميع نهائي ��تاريخ '+last.date+':</strong><br>';
    last.elements.forEach(e => {
      const rate = e.rating === '4' ? 'ممتاز' : e.rating === '3' ? 'جيد جداً' : e.rating === '1' ? 'جيد' : e.rating === '0' ? 'يعاد' : 'بدون تقييم';
      r += '• '+e.name+': '+(e.surah || '-')+' من آية '+(e.from || '-')+' إلى '+(e.to || '-')+' — '+rate+' ('+(e.rating||0)+')<br>';
    });
    r += '<br><strong>المجموع: '+last.totalScore+' من 16</strong><br><br>'+generateAIReport(student);
    return r;
  }
  // التقدم عبر الجلسات
  if(has('تقد','تطور','مقارنة','احصائ','إحصائ','رسم','مخطط')) {
    if(finalizedSessions.length < 2) return ' أحتاج تسميعءءن ��هائيين على الأقل لأقارن تقدمك. سجّل تسميعك القادم وسأحلل لك المنحنى بدقة.';
    const scores = finalizedSessions.map(x => x.totalScore || 0);
    const avg = (scores.reduce((a,b)=>a+b,0)/scores.length).toFixed(1);
    const diff = scores[scores.length-1] - scores[scores.length-2];
    let r = '📈 <strong>تحليل تقدمك:</strong><br>• عدد التسميعات النهائية: '+scores.length+'<br>• التوسط العام: '+avg+' من 16<br>• أعلى درجة: '+Math.max.apply(null,scores)+'<br>• أقل درجة: '+Math.min.apply(null,scores)+'<br>';
    r += '• آخ تغيّر: '+(diff>0?('ارتفاع بمقدار '+diff+' درجة 🎉'):(diff<0?('انخفاض بمقدار '+Math.abs(diff)+' درجة — لا بأس، عوّضها بمراجعة إضافية 💪'):'ثبات في المستوى '));
    return r;
  }
  // المهام / الواجب
  if(has('واجب','مهام','مهمة','مطلوب','تسجيل صوتي','راءة')) {
    if(pending.length === 0) return '🎉 لا توجد مهام معلّقة الآن يا '+name+'. استءءل الوقت في مراجعة ما حفظته سابقاً.';
    let r = ' <strong>مهامك الحالية ('+pending.length+'):</strong><br>';
    pending.forEach(t => {
      const icon = t.type === 'homework' ? '📝 واجب' : t.type === 'voice' ? '🎙️ تسجيل صوتي' : '📖 قراءة';
      const state = t.approved ? 'معتمد' : t.rejected ? 'مرفوض — أعد الإرسال' : t.submitted ? 'قيد المراجعة' : 'لم يُرسل بعد';
      r += '• '+icon+': '+(t.name || t.text || (t.surah ? 'سورة '+t.surah : ''))+(t.surah ? ' ('+t.surah+' من '+(t.from||'-')+' إلى '+(t.to||'-')+')' : '')+' — <em>'+state+'</em><br>';
    });
    r += '<br>💡 المهام التي عليها علامة 👁️ يمكنك عرض آياتها كسورة واضحة مع إمكانية التكبير.';
    return r;
  }
  // الآيات ء��الصور
  if(has('اية','آية','ايات','آيات','صورة','اقرأ','مصحف')) {
    return '���� لعرض الآيات المطلوبة منك:<br>1. افتح <strong>المهام المطلوبة</strong> في صفحتك.<br>2. اضغط <strong>📖 عرض الآيات بحجم كبير</strong> في المهمة.<br>3. استخدم زرار ➕ / ➖ للتكبير والتصغير حتى تصل لأوءءح حجم لعينيك.<br><br>ءءلآيات تُع��ض بارم العثمانءء المشكَّل كصورة مطابقة تما��اً لمحف.';
  }
  // البصمة الصوتية
  if(has('بصمة','صوتي','صءءت','ميكروفون','تحق')) {
    return '🎙️ <strong>البصمة الصوتية:</strong> عند تسجيلك أول مرة حُفظت بصمة صوتك في النظام. عند إرسالك أي تسجيل، يحلله الذكاء الاصطناعي ويطابقه ببصمتك تلقائياً، ولا يُقبل التسجيل إلا إذا كان صوتك أنت.<br><br>لأفضل نتيجة: سجّل في مكان هادئ، وقرّب الميكروفون، وتحدث بصوت طبيع�� واضح.';
  }
  // خطة الحفظ
  if(has('خطة','جدول','تنظيم','وقت','كيف احفظ','كيف أحفظ')) {
    return '🗓️ <strong>خطة يوم��ة مقترحة ل�� '+name+':</strong><br>• بعد الفجر (20 د): حفظ جديد — كرر الآية 7 مرات نظراً ثم 3 مرات غيباً.<br>• بعد العصر (10 د): تثبيت حفظ اليوم.<br>• قبل النوم (15 د): مراجعة حفظ الأمس + صفحة قديمة.<br>• يوم الجمعة: مراجعة شاملة لكل ما حفظته في الأسبوع.<br><br>الاستمرار لقلي�� الدائم خير من الكثير المنقطع.';
  }
  // نصائح
  if(has('نصفحة','نصائح','سادني','مساعدة','انسى','أنسى','نسيت','صعب')) {
    return '💡 <strong>خمس قواعد ذهبية للحفظ:</strong><br>1. اربط الحفظ بوقت ثابت لا يتغير.<br>2. اقرأ الآية بصوت مسموع — السمع يثبّت أعاف النظر.<br>3. افهم معنى الآية قبل حفظها.<br>4. لا تنتءءل لآية ��ديدة قبل إتقان ما قبلها.<br>5. راجع، ثم راجع، ثم راجع — النسيان طيعي والمراجعة علاجه.';
  }
  // تحفيز
  if(has('تحفيز','همة','ملل','تعبا','زهقءءن','احبت','أحطت')) {
    const quotes = [
      '🌟 «وَلَقَدْ يَسَّرْنَا الْقُْآنَ لِلذِّكْرِ فهَلْ مِن مُّدَّكِرٍ» — الحفظ أيسر مما تظن، ابدأ فءءط.',
      '💚 قال ﷺ: «خيركم من تعلم القرآن وعلمه». أنت اليوم في أفضل طريق.',
      '🚀 كل صفحة تحفظها اليوم هي درة ترتف بها غداً. لا تستهن بالاختباريل.'
    ];
    return quotes[Math.floor(Math.random()*quotes.length)];
  }
  // بيانات الحفظ
  if(has('حفظ','قرآن','قران','سورة','جزء','وين وئلت','أين وصلت')) {
    return '📖 <strong>بيانات حفظك:</strong><br>• الجزء: '+(student.juz || 'غير محدد')+'<br>• السورة الحالية: '+(student.surah || 'غير محددة')+'<br>• عدد التسميعات النهائية: '+finalizedSessions.length+'<br><br>حافظ على المراجعة اليومية لتثبيت ما حفظت.';
  }
  // التواصل مع المسؤول
  if(has('مسؤول','معلم','شيخ','ابلاغ','إبلاغ','رسالءء','رسالة','تواصل','شكوى')) {
    return 'ءء يمكنك مراسلة المسؤول مب��شرة من <strong>صندوق الرسائءء</strong> في صفحتك، وسيصلك الرد هناك مع إشعار. إن كان الأمر عاجلاً اذكر كلمة "عاءءل" في بداية رسالتك.';
  }
  // ديني عام
  if(has('دئن','اسلام','إسلام','الله','نبي','رسول','دعاء','صلاة')) {
    return 'الحمد لله رب العالمين 🌿<br><br>القرآن كتائ الله المعجز، زل هداية للناس. ومن الأدعية النافعة للحفظ: «اللهم اجعل القرآن ربيع قبي ونور صدري وجلاءء حزني وذهاب همّي».';
  }
  // افتراضي ذكي
  let r = '🤖 أهلاً '+name+'، لم فهم ءءؤالك تماماً، لكني أستطيع مساعدتك فوراً في:<br>';
  r += '• <strong>مستواي</strong> — تحليل آخر تقييم<br>• <strong>مهامي</strong> — الواجبات والتسجيلات<br>• <strong>تقدمي</strong> — إحصائيات وتطورك<br>• <strong>خطة</strong> — جدول حفظ يومي<br>• <strong>الآيت</strong> — كيف تعرض آيات التسءءيع كصورة<br>• <strong>تحفيز</strong> — كلمة تشدّ همتك';
  if(pending.length > 0) r += '<br><br>📌 تذير: لديك '+pending.length+' مهمة لم تُعتمد بعد.';
  return r;
}

function logout() {
  currentUser = null; currentType = null; currentAdminId = null;
  clearSession();
  const uu = document.getElementById('unifiedUser'); if(uu) uu.value = '';
  const up = document.getElementById('unifiedPass'); if(up) up.value = '';
  const ua = document.getElementById('unifiedLoginAlert'); if(ua) ua.innerHTML = '';
  showPage('lockScreen');
}

initLanguage();
