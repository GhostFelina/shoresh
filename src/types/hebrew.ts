/**
 * Shoresh — Modern İbranice (İvrit) domain modeli.
 *
 * TASARIM KARARI — neden "fiil" bir satır değil, bir çarpım:
 * Batı dillerinde bir fiil (yazmak, yazdı, yazılmış) gibi sabit sayıda
 * hücreyle temsil edilir. İbranicede fiil bir dizi değil bir ÇARPIMDIR:
 * şoreş (3 harfli kök) × binyan (7 kalıp) × zaman × şahıs/cinsiyet/sayı.
 * Aynı kök farklı binyanda bambaşka anlam alır:
 *   ל־מ־ד → לוֹמֵד "öğrenir" (pa'al) / מְלַמֵּד "öğretir" (pi'el)
 * Bu yüzden öğrenme birimi "fiil" değil KÖK+BİNYAN çiftidir; SRS ve
 * mastery de bu eksende çalışır. İki binyan ayrı ayrı öğrenilir.
 */

/* ------------------------------------------------------------------ *
 * Alfabe ve okuma
 * ------------------------------------------------------------------ */

/** Harfin yazı sistemindeki rolü. */
export type LetterKind =
  | 'consonant' // normal ünsüz
  | 'mater' // א ה ו י — ünlü görevi de görebilir (imot kria)
  | 'final'; // sofit biçim: ך ם ן ף ץ

/** Tek bir İbrani harfi. */
export interface HebrewLetter {
  /** Kararlı kimlik — harfin Latin adı: 'alef', 'bet', 'kaf-sofit'. */
  id: string;
  /** Harfin kendisi. */
  glyph: string;
  /** Harfin İbranice adı: א → 'אָלֶף'. */
  nameHe: string;
  /** Türkçe okunuşuyla adı: 'alef', 'bet', 'kaf'. */
  nameTr: string;
  kind: LetterKind;
  /** Sofit (sonda) biçimi varsa. */
  finalGlyph?: string;
  /** Bu harf hangi normal harfin sofit hâli (yalnızca kind === 'final'). */
  baseId?: string;
  /** Dageş'li / dageş'siz ses ayrımı: ב = v, בּ = b. */
  sound: { plain: string; withDagesh?: string };
  /** Gematria (sayısal) değeri. */
  gematria: number;
  /** Türkçe konuşana özel telaffuz uyarısı. */
  noteTr?: string;
  /** Karıştırılan harfler — görsel ayrım alıştırmasının kaynağı. */
  confusedWith?: string[];
  /** Öğretim sırası — düşük olan önce öğretilir. */
  order: number;
}

/** Hareke (ניקוד) — ünlü işareti. */
export interface Niqqud {
  id: string;
  /** İşaretin kendisi, taşıyıcı harfle birlikte gösterilir. */
  mark: string;
  nameHe: string;
  nameTr: string;
  /** Çıkardığı ses — Türkçe ses değeriyle. */
  sound: string;
  /** Uzun/kısa ayrımı modern İvritte duyulmaz; yine de sınıfı tutulur. */
  group: 'a' | 'e' | 'i' | 'o' | 'u' | 'shva';
  noteTr?: string;
  order: number;
}

/* ------------------------------------------------------------------ *
 * Fiil sistemi
 * ------------------------------------------------------------------ */

/** Yedi binyan — fiil kalıpları. */
export type Binyan =
  | 'paal' // פָּעַל (קל) — temel etken
  | 'nifal' // נִפְעַל — edilgen / dönüşlü
  | 'piel' // פִּעֵל — yoğun / ettirgen
  | 'pual' // פֻּעַל — pi'el'in edilgeni
  | 'hifil' // הִפְעִיל — ettirgen
  | 'hufal' // הֻפְעַל — hif'il'in edilgeni
  | 'hitpael'; // הִתְפַּעֵל — dönüşlü / karşılıklı

export const BINYANIM: readonly Binyan[] = [
  'paal',
  'nifal',
  'piel',
  'pual',
  'hifil',
  'hufal',
  'hitpael',
] as const;

/** Etken binyanlar — yeni başlayan önce bunları öğrenir. */
export const ACTIVE_BINYANIM: readonly Binyan[] = ['paal', 'piel', 'hifil', 'hitpael'] as const;

/** Edilgen binyanlar — kendi başlarına çekilmez, etken eşinden türer. */
export const PASSIVE_BINYANIM: readonly Binyan[] = ['nifal', 'pual', 'hufal'] as const;

export const BINYAN_LABEL: Record<Binyan, { he: string; tr: string; sense: string }> = {
  paal: { he: 'פָּעַל', tr: "Pa'al", sense: 'Temel etken — yapar' },
  nifal: { he: 'נִפְעַל', tr: "Nif'al", sense: 'Edilgen / dönüşlü — yapılır' },
  piel: { he: 'פִּעֵל', tr: "Pi'el", sense: 'Yoğun / ettirgen — iyice yapar' },
  pual: { he: 'פֻּעַל', tr: "Pu'al", sense: "Pi'el'in edilgeni — iyice yapılır" },
  hifil: { he: 'הִפְעִיל', tr: "Hif'il", sense: 'Ettirgen — yaptırır' },
  hufal: { he: 'הֻפְעַל', tr: "Huf'al", sense: "Hif'il'in edilgeni — yaptırılır" },
  hitpael: { he: 'הִתְפַּעֵל', tr: "Hitpa'el", sense: 'Dönüşlü — kendi kendine yapar' },
};

/** Binyan çiftleri — hangi edilgen hangi etkenden gelir. */
export const BINYAN_PAIRS: Partial<Record<Binyan, Binyan>> = {
  paal: 'nifal',
  piel: 'pual',
  hifil: 'hufal',
};

/**
 * Zaman/biçim ekseni — öğrenmenin ana ekseni.
 *
 * Mastery ve SRS her biçim için AYRI çalışır: bir öğrenci geçmiş zamanı
 * oturtup geleceği hiç bilmiyor olabilir. Tek bir "%64 öğrendin" sayısı
 * bunu gizler; beş ayrı eksen gizlemez.
 */
export type HebrewForm = 'infinitive' | 'past' | 'present' | 'future' | 'imperative';

export const HEBREW_FORMS: readonly HebrewForm[] = [
  'infinitive',
  'past',
  'present',
  'future',
  'imperative',
] as const;

export const FORM_LABEL: Record<HebrewForm, { he: string; tr: string; short: string }> = {
  infinitive: { he: 'שֵׁם הַפֹּעַל', tr: 'Mastar', short: 'MASTAR' },
  past: { he: 'עָבָר', tr: 'Geçmiş zaman', short: 'GEÇMİŞ' },
  present: { he: 'הוֹוֶה', tr: 'Şimdiki zaman', short: 'ŞİMDİKİ' },
  future: { he: 'עָתִיד', tr: 'Gelecek zaman', short: 'GELECEK' },
  imperative: { he: 'צִוּוּי', tr: 'Emir kipi', short: 'EMİR' },
};

/**
 * Şahıs/cinsiyet/sayı etiketi.
 *
 * Modern İvrit konuşma dilinde אַתֶּן (aten) ayrımını büyük ölçüde yitirdi
 * ve 3. çoğulda הֵן (hen) yerine הֵם (hem) tek biçim olarak kullanılıyor.
 * Tablo ikisini de taşır ama günlük doz `MODERN_PERSONS` üzerinden gider.
 */
export type Person =
  | 'ani'
  | 'ata'
  | 'at'
  | 'hu'
  | 'hi'
  | 'anachnu'
  | 'atem'
  | 'aten'
  | 'hem';

/** Şimdiki zaman şahıs değil, cinsiyet+sayı çeker — sıfat gibi davranır. */
export type PresentSlot = 'ms' | 'fs' | 'mp' | 'fp';

/** Emir kipi yalnızca 2. şahsa çekilir. */
export type ImperativeSlot = 'ata' | 'at' | 'atem';

export const PERSONS: readonly Person[] = [
  'ani',
  'ata',
  'at',
  'hu',
  'hi',
  'anachnu',
  'atem',
  'aten',
  'hem',
] as const;

/** Modern konuşma İvritinde fiilen kullanılan şahıslar. */
export const MODERN_PERSONS: readonly Person[] = [
  'ani',
  'ata',
  'at',
  'hu',
  'hi',
  'anachnu',
  'atem',
  'hem',
] as const;

export const PRESENT_SLOTS: readonly PresentSlot[] = ['ms', 'fs', 'mp', 'fp'] as const;
export const IMPERATIVE_SLOTS: readonly ImperativeSlot[] = ['ata', 'at', 'atem'] as const;

export const PERSON_LABEL: Record<Person, { he: string; tr: string }> = {
  ani: { he: 'אֲנִי', tr: 'ben' },
  ata: { he: 'אַתָּה', tr: 'sen (erkek)' },
  at: { he: 'אַתְּ', tr: 'sen (kadın)' },
  hu: { he: 'הוּא', tr: 'o (erkek)' },
  hi: { he: 'הִיא', tr: 'o (kadın)' },
  anachnu: { he: 'אֲנַחְנוּ', tr: 'biz' },
  atem: { he: 'אַתֶּם', tr: 'siz (erkek/karma)' },
  aten: { he: 'אַתֶּן', tr: 'siz (kadın)' },
  hem: { he: 'הֵם', tr: 'onlar' },
};

export const PRESENT_LABEL: Record<PresentSlot, { he: string; tr: string }> = {
  ms: { he: 'זָכָר יָחִיד', tr: 'eril tekil' },
  fs: { he: 'נְקֵבָה יְחִידָה', tr: 'dişil tekil' },
  mp: { he: 'זָכָר רַבִּים', tr: 'eril çoğul' },
  fp: { he: 'נְקֵבָה רַבּוֹת', tr: 'dişil çoğul' },
};

export const IMPERATIVE_LABEL: Record<ImperativeSlot, { he: string; tr: string }> = {
  ata: { he: 'אַתָּה', tr: 'sen (erkek)' },
  at: { he: 'אַתְּ', tr: 'sen (kadın)' },
  atem: { he: 'אַתֶּם', tr: 'siz' },
};

/**
 * Gizra (גזרה) — kökün düzenlilik sınıfı.
 *
 * Batı dillerindeki "düzenli/düzensiz" ikili ayrımının İbranice karşılığı,
 * ama ikili değil: kökün HANGİ harfi kalıbı bozuyor, ona göre sınıflanır.
 * Çekim motoru shlemim'i (tam kök) türetir; zayıf kökler açık tabloda durur.
 * Bu, "düzenli fiili türet, düzensizi veri olarak sakla" kuralının
 * İbranicedeki doğru karşılığıdır.
 */
export type Gizra =
  | 'shlemim' // tam kök — כתב, למד. Motor türetir.
  | 'pe-nun' // 1. harf נ — נפל, נתן (düşer)
  | 'pe-yod' // 1. harf י — ישב, ידע
  | 'pe-alef' // 1. harf א — אכל, אמר
  | 'pe-guttural' // 1. harf ע/ח/ה — עבד, חשב
  | 'ayin-guttural' // 2. harf ע/ח/ה/א — שאל, בחר
  | 'ayin-vav' // içi boş kök — קום, שיר, בוא
  | 'lamed-hey' // 3. harf ה — קנה, רצה, עשה
  | 'lamed-alef' // 3. harf א — מצא, קרא
  | 'lamed-guttural' // 3. harf ע/ח — שמע, שלח
  | 'kfulim'; // ikiz kök — סבב, תמם

export const GZAROT: readonly Gizra[] = [
  'shlemim',
  'pe-nun',
  'pe-yod',
  'pe-alef',
  'pe-guttural',
  'ayin-guttural',
  'ayin-vav',
  'lamed-hey',
  'lamed-alef',
  'lamed-guttural',
  'kfulim',
] as const;

export const GIZRA_LABEL: Record<Gizra, { he: string; tr: string }> = {
  shlemim: { he: 'שְׁלֵמִים', tr: 'Tam kök — kalıp bozulmaz' },
  'pe-nun': { he: 'פ״נ', tr: 'İlk harf נ — çoğu biçimde düşer' },
  'pe-yod': { he: 'פ״י', tr: 'İlk harf י — mastar ve gelecekte değişir' },
  'pe-alef': { he: 'פ״א', tr: 'İlk harf א — gelecekte kaynaşır' },
  'pe-guttural': { he: 'פ״גרונית', tr: 'İlk harf gırtlaksı — hatef harekesi alır' },
  'ayin-guttural': { he: 'ע״גרונית', tr: 'Orta harf gırtlaksı — dageş almaz' },
  'ayin-vav': { he: 'ע״ו', tr: 'İçi boş kök — orta harf ünlüye dönüşür' },
  'lamed-hey': { he: 'ל״ה', tr: 'Son harf ה — eklerde düşer' },
  'lamed-alef': { he: 'ל״א', tr: 'Son harf א — sessizleşir' },
  'lamed-guttural': { he: 'ל״גרונית', tr: 'Son harf ע/ח — patah alır' },
  kfulim: { he: 'כְּפוּלִים', tr: 'İkiz kök — 2. ve 3. harf aynı' },
};

/** CEFR seviyesi — seviye testinde ve günlük dozda kullanılır. */
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Öğrenme önceliği için çok boyutlu puanlama. */
export interface HebrewScores {
  /** 0-100, konuşma dilindeki genel sıklık. */
  frequency: number;
  /** 0-100, ulpan müfredatındaki ağırlık. */
  ulpan: number;
  /** 0-100, günlük konuşmada kullanım. */
  speaking: number;
  /** 0-100, yazılı dil / haber / resmî metin. */
  written: number;
}

/** Tek bir çekilmiş biçim. */
export interface Conjugation {
  /** Harekeli yazım — yeni başlayan bunu okur. */
  vocalized: string;
  /** Harekesiz (ktiv male) — İsrail'de fiilen yazılan biçim. */
  plain: string;
  /** Latin harfli okunuş — Türkçe ses değerleriyle. */
  translit: string;
}

/** Bir kök+binyan çiftinin tam çekim tablosu. */
export interface ConjugationTable {
  infinitive: Conjugation;
  past: Partial<Record<Person, Conjugation>>;
  present: Record<PresentSlot, Conjugation>;
  future: Partial<Record<Person, Conjugation>>;
  imperative: Partial<Record<ImperativeSlot, Conjugation>>;
}

/** Tuzak/varyant bilgisi — normal fiil gibi öğretilmez, uyarıyla gelir. */
export interface HebrewTrap {
  kind:
    | 'same-root-other-binyan' // לוֹמֵד / מְלַמֵּד
    | 'confusable-pair' // benzer sesli iki kök
    | 'spelling' // ktiv male ile harekeli yazım farkı
    | 'preposition' // fiilin istediği edat: לְחַכּוֹת לְ־
    | 'gender-agreement';
  /** Kullanıcıya gösterilecek kısa Türkçe uyarı. */
  note: string;
  /** Karıştırıldığı diğer öğenin id'si (varsa). */
  confusedWith?: string;
}

/** Mikro bağlam — fiili cümle içinde gösteren katman. */
export interface HebrewContext {
  /** Zaman biçimleri için birer doğal cümle. */
  sentences: Partial<Record<HebrewForm, { he: string; translit: string; tr: string }>>;
  /** Fiilin istediği edat: לְחַכּוֹת לְ־ ("beklemek" -i). */
  preposition?: { he: string; tr: string };
}

/**
 * Kanonik fiil kaydı — öğrenme birimi.
 *
 * Kimlik kök+binyan'dır: 'למד:paal' ile 'למד:piel' AYRI öğelerdir,
 * çünkü anlamları ("öğrenmek" / "öğretmek") ayrıdır ve ayrı öğrenilir.
 */
export interface HebrewVerb {
  /** Kararlı kimlik: '<kök><binyan>' — 'כתב:paal'. */
  id: string;
  /** Kök harfleri, ayrı ayrı: ['כ','ת','ב']. */
  root: string[];
  /** Kökün gösterim biçimi: 'כ־ת־ב'. */
  rootDisplay: string;
  binyan: Binyan;
  gizra: Gizra;
  /** Sözlük biçimi — 3. tekil eril geçmiş. İbranice sözlükler böyle listeler. */
  lemma: Conjugation;
  /** Türkçe anlam(lar). */
  tr: string[];
  cefr: CEFR;
  scores: HebrewScores;
  /** Tam çekim tablosu — motor türetir ya da açık tablodan gelir. */
  table: ConjugationTable;
  /** Çekim motordan mı türetildi, elle mi yazıldı? */
  source: 'generated' | 'explicit';
  traps?: HebrewTrap[];
  context?: HebrewContext;
  /** Veri güven skoru 0-1. Üretilmiş harekede 1'in altında kalır. */
  confidence: number;
}

/* ------------------------------------------------------------------ *
 * Kelime (fiil dışı söz varlığı)
 * ------------------------------------------------------------------ */

/** İbranicede her ismin cinsiyeti vardır — sıfat ve fiil ona uyar. */
export type Gender = 'm' | 'f';

export type WordClass = 'noun' | 'adjective' | 'adverb' | 'preposition' | 'number' | 'phrase';

export interface HebrewWord {
  id: string;
  vocalized: string;
  plain: string;
  translit: string;
  tr: string[];
  wordClass: WordClass;
  /** İsim ve sıfatlarda zorunlu — İbranicede cinsiyetsiz isim yoktur. */
  gender?: Gender;
  /** Çoğul biçim: düzensiz çoğullar (אִישׁ → אֲנָשִׁים) açık yazılır. */
  plural?: Conjugation;
  /** Konu kümesi — 'aile', 'yemek', 'şehir'. */
  topic: string;
  cefr: CEFR;
  scores: HebrewScores;
  noteTr?: string;
}

/**
 * Öncelik skoru — 0-100. Yüksek olan önce öğretilir.
 *
 * Ağırlıklar yeni başlayana göre dengelendi: konuşma sıklığı her şeyin
 * önünde, yazılı dil en sonda. Bir ulpan öğrencisi önce konuşur.
 */
export function priorityScore(
  v: Pick<HebrewVerb, 'scores' | 'cefr' | 'gizra' | 'binyan'>,
): number {
  const s = v.scores;
  const weighted = s.frequency * 0.35 + s.speaking * 0.3 + s.ulpan * 0.2 + s.written * 0.15;
  const cefrBonus: Record<CEFR, number> = { A1: 8, A2: 6, B1: 3, B2: 0, C1: -4, C2: -8 };
  // Pa'al temel binyandır; öğrenci önce onu oturtmalı. Edilgenler en sona.
  const binyanBonus = v.binyan === 'paal' ? 4 : PASSIVE_BINYANIM.includes(v.binyan) ? -6 : 0;
  // Zayıf kökler ezber yükü getirir; hafif öncelik alır ki erken yayılsın.
  const gizraBonus = v.gizra === 'shlemim' ? 0 : 3;
  return Math.max(0, Math.min(100, weighted + cefrBonus[v.cefr] + binyanBonus + gizraBonus));
}

/** Kök+binyan kimliği üretir. */
export const verbId = (root: string[], binyan: Binyan): string => `${root.join('')}:${binyan}`;

/** Kimliği bileşenlerine ayırır. */
export function parseVerbId(id: string): { root: string[]; binyan: Binyan } {
  const idx = id.lastIndexOf(':');
  return {
    root: [...id.slice(0, idx)],
    binyan: id.slice(idx + 1) as Binyan,
  };
}
