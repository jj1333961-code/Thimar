export type IdentityKind = 'numeric' | 'alphanumeric' | 'passport-or-local-id'

export type CountryRule = {
  iso2: string
  dialCode: string
  identity: IdentityKind
  identityPattern: string
  identityHintAr: string
  identityHintEn: string
  phoneLengths: readonly number[]
}

type IdentityRule = Pick<CountryRule, 'identity' | 'identityPattern' | 'identityHintAr' | 'identityHintEn'>

// ISO 3166-1 alpha-2 territories are included so every country picker stays complete.
const COUNTRY_ISO2 = `
AF AL DZ AS AD AO AI AQ AG AR AM AW AU AT AZ BS BH BD BB BY BE BZ BJ BM BT BO BQ BA BW BV BR IO BN BG BF BI CV KH CM CA KY CF TD CL CN CX CC CO KM CG CD CK CR CI HR CU CW CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FK FO FJ FI FR GF PF TF GA GM GE DE GH GI GR GL GD GP GU GT GG GN GW GY HT HM VA HN HK HU IS IN ID IR IQ IE IM IL IT JM JP JE JO KZ KE KI KP KR KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MQ MR MU YT MX FM MD MC MN ME MS MA MZ MM NA NR NP NL NC NZ NI NE NG NU NF MK MP NO OM PK PW PS PA PG PY PE PH PN PL PT PR QA RE RO RU RW BL SH KN LC MF PM VC WS SM ST SA SN RS SC SL SG SX SK SI SB SO ZA GS SS ES LK SD SR SJ SE CH SY TW TJ TZ TH TL TG TK TO TT TN TR TM TC TV UG UA AE GB US UM UY UZ VU VE VG VN VI WF EH YE ZM ZW AX XK
`.trim().split(/\s+/)

const DIAL_CODES: Record<string, string> = {
  AF:'93', AL:'355', DZ:'213', AS:'1', AD:'376', AO:'244', AI:'1', AQ:'672', AG:'1', AR:'54', AM:'374', AW:'297', AU:'61', AT:'43', AZ:'994',
  BS:'1', BH:'973', BD:'880', BB:'1', BY:'375', BE:'32', BZ:'501', BJ:'229', BM:'1', BT:'975', BO:'591', BQ:'599', BA:'387', BW:'267', BV:'47', BR:'55', IO:'246', BN:'673', BG:'359', BF:'226', BI:'257',
  CV:'238', KH:'855', CM:'237', CA:'1', KY:'1', CF:'236', TD:'235', CL:'56', CN:'86', CX:'61', CC:'61', CO:'57', KM:'269', CG:'242', CD:'243', CK:'682', CR:'506', CI:'225', HR:'385', CU:'53', CW:'599', CY:'357', CZ:'420',
  DK:'45', DJ:'253', DM:'1', DO:'1', EC:'593', EG:'20', SV:'503', GQ:'240', ER:'291', EE:'372', SZ:'268', ET:'251',
  FK:'500', FO:'298', FJ:'679', FI:'358', FR:'33', GF:'594', PF:'689', TF:'262', GA:'241', GM:'220', GE:'995', DE:'49', GH:'233', GI:'350', GR:'30', GL:'299', GD:'1', GP:'590', GU:'1', GT:'502', GG:'44', GN:'224', GW:'245', GY:'592',
  HT:'509', HM:'672', VA:'39', HN:'504', HK:'852', HU:'36', IS:'354', IN:'91', ID:'62', IR:'98', IQ:'964', IE:'353', IM:'44', IL:'972', IT:'39', JM:'1', JP:'81', JE:'44', JO:'962',
  KZ:'7', KE:'254', KI:'686', KP:'850', KR:'82', KW:'965', KG:'996', LA:'856', LV:'371', LB:'961', LS:'266', LR:'231', LY:'218', LI:'423', LT:'370', LU:'352', MO:'853', MG:'261', MW:'265', MY:'60', MV:'960', ML:'223', MT:'356', MH:'692', MQ:'596', MR:'222', MU:'230', YT:'262', MX:'52', FM:'691', MD:'373', MC:'377', MN:'976', ME:'382', MS:'1', MA:'212', MZ:'258', MM:'95',
  NA:'264', NR:'674', NP:'977', NL:'31', NC:'687', NZ:'64', NI:'505', NE:'227', NG:'234', NU:'683', NF:'672', MK:'389', MP:'1', NO:'47', OM:'968', PK:'92', PW:'680', PS:'970', PA:'507', PG:'675', PY:'595', PE:'51', PH:'63', PN:'64', PL:'48', PT:'351', PR:'1', QA:'974', RE:'262', RO:'40', RU:'7', RW:'250', BL:'590', SH:'290', KN:'1', LC:'1', MF:'590', PM:'508', VC:'1', WS:'685', SM:'378', ST:'239', SA:'966', SN:'221', RS:'381', SC:'248', SL:'232', SG:'65', SX:'1', SK:'421', SI:'386', SB:'677', SO:'252', ZA:'27', GS:'500', SS:'211', ES:'34', LK:'94', SD:'249', SR:'597', SJ:'47', SE:'46', CH:'41', SY:'963', TW:'886', TJ:'992', TZ:'255', TH:'66', TL:'670', TG:'228', TK:'690', TO:'676', TT:'1', TN:'216', TR:'90', TM:'993', TC:'1', TV:'688', UG:'256', UA:'380', AE:'971', GB:'44', US:'1', UM:'1', UY:'598', UZ:'998', VU:'678', VE:'58', VG:'1', VN:'84', VI:'1', WF:'681', EH:'212', YE:'967', ZM:'260', ZW:'263', AX:'358', XK:'383'
}

const PHONE_LENGTHS: Record<string, readonly number[]> = {
  AF:[9], AL:[8,9], DZ:[9], AD:[6,9], AO:[9], AR:[10], AM:[8], AU:[9], AT:[10,11], AZ:[9], BH:[8], BD:[10], BY:[9], BE:[9], BZ:[7], BJ:[8], BT:[8], BO:[8], BA:[8], BW:[8], BR:[10,11], BN:[7], BG:[8,9], BF:[8], BI:[8], CV:[7], KH:[8,9], CM:[9], CA:[10], CF:[8], TD:[8], CL:[9], CN:[11], CO:[10], KM:[7], CG:[9], CD:[9], CK:[5], CR:[8], CI:[10], HR:[8,9], CU:[8], CY:[8], CZ:[9], DK:[8], DJ:[8], DO:[10], EC:[9], EG:[10], SV:[8], GQ:[9], ER:[7], EE:[7,8], SZ:[8], ET:[9], FK:[5], FO:[6], FJ:[7], FI:[9,10], FR:[9], GA:[7], GM:[7], GE:[9], DE:[10,11], GH:[9], GI:[8], GR:[10], GL:[6], GT:[8], GN:[9], GW:[9], GY:[7], HT:[8], HN:[8], HK:[8], HU:[9], IS:[7], IN:[10], ID:[10,11,12], IR:[10], IQ:[10,11], IE:[9], IL:[9], IT:[9,10], JP:[10], JO:[9], KZ:[10], KE:[9], KI:[5], KP:[10], KR:[9,10], KW:[8], KG:[9], LA:[8,10], LV:[8], LB:[7,8], LS:[8], LR:[7,8], LY:[9], LI:[7], LT:[8], LU:[9], MO:[8], MG:[9], MW:[9], MY:[9,10], MV:[7], ML:[8], MT:[8], MH:[7], MR:[8], MU:[8], MX:[10], FM:[7], MD:[8], MC:[8,9], MN:[8], ME:[8], MA:[9], MZ:[9], MM:[8,10], NA:[9], NR:[7], NP:[10], NL:[9], NC:[6], NZ:[8,9], NI:[8], NE:[8], NG:[10], NU:[4], MK:[8], NO:[8], OM:[8], PK:[10], PW:[7], PS:[9], PA:[8], PG:[8], PY:[9], PE:[9], PH:[10], PL:[9], PT:[9], PR:[10], QA:[8], RO:[9], RU:[10,11], RW:[9], SA:[9], SN:[9], RS:[9], SC:[7], SL:[8], SG:[8], SK:[9], SI:[8], SB:[7], SO:[8], ZA:[9], SS:[9], ES:[9], LK:[9], SD:[9], SR:[7], SE:[9], CH:[9], SY:[9], TW:[9], TJ:[9], TZ:[9], TH:[9], TL:[8], TG:[8], TO:[5], TT:[10], TN:[8], TR:[10], TM:[8], TC:[10], TV:[5], UG:[9], UA:[9], AE:[9], GB:[10], US:[10], UY:[8], UZ:[9], VU:[7], VE:[10], VN:[9,10], WF:[6], YE:[9], ZM:[9], ZW:[9]
}

const DEFAULT_IDENTITY: IdentityRule = {
  identity: 'passport-or-local-id',
  identityPattern: '^[A-Za-z0-9]{6,24}$',
  identityHintAr: 'أدخل الهوية الوطنية أو رقم جواز السفر: حروف وأرقام من 6 إلى 24 خانة.',
  identityHintEn: 'Enter a national ID or passport number: 6–24 letters and numbers.'
}

const IDENTITY_RULES: Record<string, IdentityRule> = {
  EG: { identity:'numeric', identityPattern:'^\\d{14}$', identityHintAr:'الرقم القومي المصري: 14 رقماً بالضبط.', identityHintEn:'Egyptian national ID: exactly 14 digits.' },
  SA: { identity:'numeric', identityPattern:'^[12]\\d{9}$', identityHintAr:'الهوية السعودية: 10 أرقام وتبدأ بـ 1 أو 2.', identityHintEn:'Saudi ID: 10 digits starting with 1 or 2.' },
  AE: { identity:'numeric', identityPattern:'^784\\d{12}$', identityHintAr:'الهوية الإماراتية: 15 رقماً وتبدأ بـ 784.', identityHintEn:'Emirates ID: 15 digits starting with 784.' },
  QA: { identity:'numeric', identityPattern:'^\\d{11}$', identityHintAr:'الهوية القطرية: 11 رقماً.', identityHintEn:'Qatar ID: 11 digits.' },
  KW: { identity:'numeric', identityPattern:'^\\d{12}$', identityHintAr:'الهوية الكويتية: 12 رقماً.', identityHintEn:'Kuwait Civil ID: 12 digits.' },
  BH: { identity:'numeric', identityPattern:'^\\d{9}$', identityHintAr:'الهوية البحرينية: 9 أرقام.', identityHintEn:'Bahrain ID: 9 digits.' },
  OM: { identity:'numeric', identityPattern:'^\\d{8,9}$', identityHintAr:'الهوية العُمانية: 8 أو 9 أرقام.', identityHintEn:'Oman ID: 8 or 9 digits.' },
  JO: { identity:'numeric', identityPattern:'^\\d{10}$', identityHintAr:'الهوية الأردنية: 10 أرقام.', identityHintEn:'Jordanian ID: 10 digits.' },
  MA: { identity:'alphanumeric', identityPattern:'^[A-Z]{1,2}\\d{5,7}$', identityHintAr:'البطاقة المغربية: حرف أو حرفان متبوعان بأرقام.', identityHintEn:'Moroccan ID: one or two letters followed by digits.' },
  DZ: { identity:'numeric', identityPattern:'^(?:\\d{10}|\\d{18})$', identityHintAr:'الهوية الجزائرية: 10 أو 18 رقماً حسب نوع الوثيقة.', identityHintEn:'Algerian ID: 10 or 18 digits, depending on the document.' },
  TN: { identity:'numeric', identityPattern:'^\\d{8}$', identityHintAr:'الهوية التونسية: 8 أرقام.', identityHintEn:'Tunisian ID: 8 digits.' },
  TR: { identity:'numeric', identityPattern:'^\\d{11}$', identityHintAr:'الهوية التركية: 11 رقماً.', identityHintEn:'Turkish ID: 11 digits.' },
  IR: { identity:'numeric', identityPattern:'^\\d{10}$', identityHintAr:'الهوية الإيرانية: 10 أرقام.', identityHintEn:'Iranian national number: 10 digits.' },
  IQ: { identity:'numeric', identityPattern:'^\\d{10,12}$', identityHintAr:'الهوية العراقية: من 10 إلى 12 رقماً.', identityHintEn:'Iraqi ID: 10–12 digits.' },
  LB: { identity:'numeric', identityPattern:'^\\d{8}$', identityHintAr:'الهوية اللبنانية: 8 أرقام.', identityHintEn:'Lebanese ID: 8 digits.' },
  SY: { identity:'numeric', identityPattern:'^\\d{11}$', identityHintAr:'الهوية السورية: 11 رقماً.', identityHintEn:'Syrian ID: 11 digits.' },
  PS: { identity:'numeric', identityPattern:'^\\d{9}$', identityHintAr:'الهوية الفلسطينية: 9 أرقام.', identityHintEn:'Palestinian ID: 9 digits.' },
  BR: { identity:'numeric', identityPattern:'^\\d{11}$', identityHintAr:'الهوية البرازيلية CPF: 11 رقماً.', identityHintEn:'Brazilian CPF: 11 digits.' },
  MX: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{13,18}$', identityHintAr:'المعرّف المكسيكي CURP أو RFC: حروف وأرقام من 13 إلى 18 خانة.', identityHintEn:'Mexican CURP or RFC: 13–18 letters and numbers.' },
  AR: { identity:'numeric', identityPattern:'^\\d{7,8}$', identityHintAr:'الهوية الأرجنتينية DNI: 7 أو 8 أرقام.', identityHintEn:'Argentine DNI: 7 or 8 digits.' },
  CL: { identity:'numeric', identityPattern:'^\\d{7,9}$', identityHintAr:'الهوية التشيلية: من 7 إلى 9 أرقام.', identityHintEn:'Chilean ID: 7–9 digits.' },
  CO: { identity:'numeric', identityPattern:'^\\d{6,10}$', identityHintAr:'الهوية الكولومبية: من 6 إلى 10 أرقام.', identityHintEn:'Colombian ID: 6–10 digits.' },
  PE: { identity:'numeric', identityPattern:'^\\d{8}$', identityHintAr:'الهوية البيروفية: 8 أرقام.', identityHintEn:'Peruvian DNI: 8 digits.' },
  IN: { identity:'numeric', identityPattern:'^\\d{12}$', identityHintAr:'الهوية الهندية Aadhaar: 12 رقماً.', identityHintEn:'Indian Aadhaar: 12 digits.' },
  PK: { identity:'numeric', identityPattern:'^\\d{13}$', identityHintAr:'الهوية الباكستانية CNIC: 13 رقماً.', identityHintEn:'Pakistani CNIC: 13 digits.' },
  ID: { identity:'numeric', identityPattern:'^\\d{16}$', identityHintAr:'الهوية الإندونيسية: 16 رقماً.', identityHintEn:'Indonesian ID: 16 digits.' },
  MY: { identity:'numeric', identityPattern:'^\\d{12}$', identityHintAr:'الهوية الماليزية: 12 رقماً.', identityHintEn:'Malaysian ID: 12 digits.' },
  SG: { identity:'alphanumeric', identityPattern:'^[STFG]\\d{7}[A-Z]$', identityHintAr:'الهوية السنغافورية: حرف، 7 أرقام، ثم حرف.', identityHintEn:'Singapore ID: a letter, 7 digits, then a letter.' },
  PH: { identity:'numeric', identityPattern:'^\\d{12}$', identityHintAr:'الهوية الفلبينية: 12 رقماً.', identityHintEn:'Philippine national ID: 12 digits.' },
  CN: { identity:'numeric', identityPattern:'^\\d{18}$', identityHintAr:'الهوية الصينية: 18 رقماً.', identityHintEn:'Chinese ID: 18 digits.' },
  JP: { identity:'numeric', identityPattern:'^\\d{12}$', identityHintAr:'رقم الهوية الياباني My Number: 12 رقماً.', identityHintEn:'Japanese My Number: 12 digits.' },
  KR: { identity:'numeric', identityPattern:'^\\d{13}$', identityHintAr:'الهوية الكورية: 13 رقماً.', identityHintEn:'Korean resident number: 13 digits.' },
  TW: { identity:'alphanumeric', identityPattern:'^[A-Z]\\d{9}$', identityHintAr:'الهوية التايوانية: حرف و9 أرقام.', identityHintEn:'Taiwan ID: one letter and 9 digits.' },
  TH: { identity:'numeric', identityPattern:'^\\d{13}$', identityHintAr:'الهوية التايلاندية: 13 رقماً.', identityHintEn:'Thai ID: 13 digits.' },
  VN: { identity:'numeric', identityPattern:'^\\d{9,12}$', identityHintAr:'الهوية الفيتنامية: من 9 إلى 12 رقماً.', identityHintEn:'Vietnamese ID: 9–12 digits.' },
  DE: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{9,10}$', identityHintAr:'الهوية الألمانية أو الجواز: 9 أو 10 حروف وأرقام.', identityHintEn:'German ID or passport: 9–10 letters and numbers.' },
  FR: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{9}$', identityHintAr:'الهوية أو الجواز الفرنسي: 9 حروف وأرقام.', identityHintEn:'French ID or passport: 9 letters and numbers.' },
  GB: { identity:'alphanumeric', identityPattern:'^[A-Z]{2}\\d{6}[A-Z]$', identityHintAr:'رقم الهوية البريطاني: حرفان و6 أرقام وحرف.', identityHintEn:'UK identifier: 2 letters, 6 digits, then a letter.' },
  IT: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{16}$', identityHintAr:'المعرّف الإيطالي Codice Fiscale: 16 خانة.', identityHintEn:'Italian Codice Fiscale: 16 characters.' },
  ES: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{8,9}$', identityHintAr:'الهوية الإسبانية: من 8 إلى 9 حروف وأرقام.', identityHintEn:'Spanish ID: 8–9 letters and numbers.' },
  PT: { identity:'numeric', identityPattern:'^\\d{8,9}$', identityHintAr:'الهوية البرتغالية: 8 أو 9 أرقام.', identityHintEn:'Portuguese ID: 8 or 9 digits.' },
  RU: { identity:'numeric', identityPattern:'^\\d{10}$', identityHintAr:'جواز أو هوية روسية: 10 أرقام.', identityHintEn:'Russian passport or ID: 10 digits.' },
  ZA: { identity:'numeric', identityPattern:'^\\d{13}$', identityHintAr:'الهوية الجنوب أفريقية: 13 رقماً.', identityHintEn:'South African ID: 13 digits.' },
  AU: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{8,10}$', identityHintAr:'هوية أو جواز أسترالي: من 8 إلى 10 حروف وأرقام.', identityHintEn:'Australian ID or passport: 8–10 letters and numbers.' },
  NZ: { identity:'alphanumeric', identityPattern:'^[A-Z0-9]{7,9}$', identityHintAr:'هوية أو جواز نيوزيلندي: من 7 إلى 9 حروف وأرقام.', identityHintEn:'New Zealand ID or passport: 7–9 letters and numbers.' }
}

export const COUNTRY_RULES: readonly CountryRule[] = COUNTRY_ISO2.map((iso2) => {
  const identity = IDENTITY_RULES[iso2] ?? DEFAULT_IDENTITY
  return {
    iso2,
    dialCode: DIAL_CODES[iso2] ?? '',
    identity: identity.identity,
    identityPattern: identity.identityPattern,
    identityHintAr: identity.identityHintAr,
    identityHintEn: identity.identityHintEn,
    phoneLengths: PHONE_LENGTHS[iso2] ?? [7, 8, 9, 10, 11, 12, 13, 14, 15],
  }
}).filter((rule) => Boolean(rule.dialCode))

export function getCountryRule(iso2: string) {
  return COUNTRY_RULES.find((country) => country.iso2 === String(iso2 || '').toUpperCase()) ?? COUNTRY_RULES.find((country) => country.iso2 === 'EG')!
}

function normalizeDigits(value: string) {
  return String(value || '').replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit))).replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
}

export function normalizeLocalPhone(value: string) {
  return normalizeDigits(value).replace(/\D/g, '').replace(/^0+/, '')
}

export function normalizeIdentity(value: string) {
  return normalizeDigits(value).trim().replace(/[\s-]/g, '').toUpperCase()
}

export function formatInternationalPhone(iso2: string, local: string) {
  const rule = getCountryRule(iso2)
  const normalized = normalizeLocalPhone(local)
  return normalized ? `+${rule.dialCode}${normalized}` : `+${rule.dialCode}`
}

export function validatePhone(iso2: string, local: string) {
  const rule = getCountryRule(iso2)
  const normalized = normalizeLocalPhone(local)
  return rule.phoneLengths.includes(normalized.length)
}

export function validateIdentity(iso2: string, value: string) {
  const rule = getCountryRule(iso2)
  const normalized = normalizeIdentity(value)
  return new RegExp(rule.identityPattern).test(normalized)
}

export function identityHint(iso2: string, locale: 'ar' | 'en' = 'ar') {
  const rule = getCountryRule(iso2)
  return locale === 'en' ? rule.identityHintEn : rule.identityHintAr
}

export { COUNTRY_ISO2 }
