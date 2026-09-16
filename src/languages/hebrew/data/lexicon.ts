/**
 * Sözlük — fiil dışı söz varlığı: isim, sıfat, zarf, sayı.
 *
 * NEDEN AYRI BİR KATMAN: Fiiller kökten ÜRETİLİR, isimler üretilmez.
 * İbranicede isim de kökten doğar (כ־ת־ב → מִכְתָּב "mektup", כְּתֹבֶת
 * "adres") ama hangi kalıbın hangi anlamı vereceği öngörülebilir değildir.
 * Bu yüzden isimler veri olarak yazılır, kuralla türetilmez.
 *
 * CİNSİYET ZORUNLU: İbranicede cinsiyetsiz isim yoktur ve sıfat, sayı,
 * fiil hepsi isme uyar. "Büyük ev" בַּיִת גָּדוֹל ama "büyük daire"
 * דִּירָה גְּדוֹלָה. Cinsiyeti bilmeden doğru cümle kurulamaz — o yüzden
 * veri modelinde isteğe bağlı değil, zorunlu alan.
 *
 * SATIR BİÇİMİ
 *   harekeli | harekesiz | okunuş | türkçe (;) | tür | cins | konu | CEFR [| çoğul-harekesiz]
 *
 * Harekesiz yazım ELLE yazılır, harekeliden türetilmez: İbranicede isim
 * ktiv male’si düzenli değildir (מִלָּה → מילה ama מִשְׁפָּחָה → משפחה).
 * Kuralla türetmeye çalışmak sessizce yanlış yazım üretirdi.
 */
import type { CEFR, Gender, HebrewWord, WordClass } from '@he/types';
import { transliterate } from '@he/engine/niqqud';
import { LEXICON_TABLES } from './lexicon-tables';

export interface LexiconIssue {
  line: string;
  reason: string;
}

const CEFR_SET = new Set<CEFR>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const CLASS_SET = new Set<WordClass>([
  'noun',
  'adjective',
  'adverb',
  'preposition',
  'number',
  'phrase',
]);

const issues: LexiconIssue[] = [];
const fail = (line: string, reason: string): null => {
  issues.push({ line, reason });
  return null;
};

/** Harekesiz yazımda hareke kalmamalı — seslendirmeye bu gider. */
const MARKS = /[֑-ׇ]/;

function parseRow(line: string): HebrewWord | null {
  const f = line.split('|').map((x) => x.trim());
  if (f.length < 8 || f.length > 9) {
    return fail(line, `8 veya 9 alan bekleniyor, ${f.length} bulundu`);
  }
  const [vocalized, plain, translitRaw, trRaw, classRaw, genderRaw, topic, cefrRaw, pluralPlain] =
    f as [string, string, string, string, string, string, string, string, string | undefined];

  if (!vocalized) return fail(line, 'harekeli yazim bos');
  if (!plain) return fail(line, 'harekesiz yazim bos');
  if (MARKS.test(plain)) return fail(line, 'harekesiz alanda hareke var');
  if (!CLASS_SET.has(classRaw as WordClass)) return fail(line, `gecersiz tur: ${classRaw}`);
  if (!CEFR_SET.has(cefrRaw as CEFR)) return fail(line, `gecersiz CEFR: ${cefrRaw}`);
  if (!topic) return fail(line, 'konu bos');

  const wordClass = classRaw as WordClass;

  /*
   * Cinsiyet isim ve sıfatlarda ZORUNLU. Zarf ve edatta anlamsızdır ve
   * '-' ile geçilir. Boş bırakılmasına izin verilseydi eksik veri sessizce
   * geçer, öğrenci yanlış uyum kurardı.
   */
  let gender: Gender | undefined;
  if (genderRaw === 'm' || genderRaw === 'f') gender = genderRaw;
  else if (genderRaw !== '-') return fail(line, `gecersiz cinsiyet: ${genderRaw}`);

  if ((wordClass === 'noun' || wordClass === 'adjective') && !gender) {
    return fail(line, 'isim ve sifatta cinsiyet zorunlu');
  }

  const tr = trRaw.split(';').map((x) => x.trim()).filter(Boolean);
  if (tr.length === 0) return fail(line, 'Turkce anlam bos');

  const word: HebrewWord = {
    /*
     * Kimlik HAREKELİ yazımdan kurulur, harekesizden değil.
     * İbranicede harekesiz yazım çok anlamlıdır: מורה hem מוֹרֶה
     * "öğretmen (erkek)" hem מוֹרָה "öğretmen (kadın)"; חברה hem
     * חֲבֵרָה "arkadaş" hem חֶבְרָה "şirket". Harekesiz yazım kimlik
     * yapılsaydı bu çiftlerden biri sessizce elenirdi.
     */
    id: vocalized + ':' + wordClass,
    vocalized,
    plain,
    // Okunuş yazılmadıysa harekeli yazımdan türetilir.
    translit: translitRaw || transliterate(vocalized),
    tr,
    wordClass,
    topic,
    cefr: cefrRaw as CEFR,
    scores: { frequency: 0, ulpan: 0, speaking: 0, written: 0 },
  };
  if (gender) word.gender = gender;
  if (pluralPlain) {
    word.plural = { vocalized: pluralPlain, plain: pluralPlain, translit: '' };
  }
  return word;
}

const rows = (table: string): string[] =>
  table
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

export const WORDS: HebrewWord[] = (() => {
  const out: HebrewWord[] = [];
  const seen = new Set<string>();
  for (const table of LEXICON_TABLES) {
    for (const line of rows(table)) {
      const w = parseRow(line);
      if (!w) continue;
      if (seen.has(w.id)) {
        fail(line, `yinelenen kimlik: ${w.id}`);
        continue;
      }
      seen.add(w.id);
      out.push(w);
    }
  }
  return out;
})();

export const LEXICON_ISSUES: readonly LexiconIssue[] = issues;

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

/** Konu listesi — sözlük sayfasındaki süzgeçler. */
export const TOPICS: string[] = [...new Set(WORDS.map((w) => w.topic))].sort((a, b) =>
  a.localeCompare(b, 'tr'),
);

export function wordsByTopic(topic: string): HebrewWord[] {
  return WORDS.filter((w) => w.topic === topic);
}

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export function wordsUpToLevel(level: CEFR): HebrewWord[] {
  const max = LEVELS.indexOf(level);
  return WORDS.filter((w) => LEVELS.indexOf(w.cefr) <= max);
}

/**
 * Eş yazımlılar — harekesiz yazımı aynı, anlamı farklı kelimeler.
 *
 * İbranice okumanın en zor yanı budur: harekesiz metinde מורה gördüğünde
 * hangisi olduğunu yalnızca cümleden çıkarırsın. Bunları ayrı göstermek,
 * öğrenciye "burada bağlama bakman gerekecek" demektir.
 */
export const HOMOGRAPHS: Array<{ plain: string; words: HebrewWord[] }> = (() => {
  const byPlain = new Map<string, HebrewWord[]>();
  for (const w of WORDS) {
    const list = byPlain.get(w.plain) ?? [];
    list.push(w);
    byPlain.set(w.plain, list);
  }
  return [...byPlain.entries()]
    .filter(([, list]) => list.length > 1)
    .map(([plain, words]) => ({ plain, words }));
})();

export const LEXICON_STATS = {
  total: WORDS.length,
  byClass: {
    noun: WORDS.filter((w) => w.wordClass === 'noun').length,
    adjective: WORDS.filter((w) => w.wordClass === 'adjective').length,
    adverb: WORDS.filter((w) => w.wordClass === 'adverb').length,
    preposition: WORDS.filter((w) => w.wordClass === 'preposition').length,
    number: WORDS.filter((w) => w.wordClass === 'number').length,
    phrase: WORDS.filter((w) => w.wordClass === 'phrase').length,
  },
  byLevel: Object.fromEntries(
    LEVELS.map((l) => [l, WORDS.filter((w) => w.cefr === l).length]),
  ) as Record<CEFR, number>,
  topics: TOPICS.length,
  /** Eril/dişil dağılımı — uyum alıştırmaları için havuz büyüklüğü. */
  masculine: WORDS.filter((w) => w.gender === 'm').length,
  feminine: WORDS.filter((w) => w.gender === 'f').length,
  /** Harekesiz yazımı aynı olan kelime öbeği sayısı. */
  homographs: HOMOGRAPHS.length,
};

export const WORD_CLASS_LABEL: Record<WordClass, string> = {
  noun: 'isim',
  adjective: 'sıfat',
  adverb: 'zarf',
  preposition: 'edat',
  number: 'sayı',
  phrase: 'ifade',
};
