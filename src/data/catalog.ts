/**
 * Katalog — ham kök tablolarını doğrulayıp kanonik `HebrewVerb[]` üretir.
 *
 * Hiçbir satır doğrudan uygulamaya geçmez; önce buradan geçer. Geçersiz
 * satır SESSİZCE ATILMAZ — `CATALOG_ISSUES` içinde nedeniyle raporlanır
 * ve birim test bu dizinin boş olmasını bekler. Böylece veri bozulması
 * "uygulamada bir şeyler tuhaf" diye değil, kırmızı testle fark edilir.
 */
import { conjugate, lemmaOf } from '@/engine/binyan';
import {
  BINYANIM,
  GZAROT,
  priorityScore,
  verbId,
  type Binyan,
  type CEFR,
  type Gizra,
  type HebrewScores,
  type HebrewVerb,
} from '@/types/hebrew';
import { ALL_TABLES } from './roots';

export interface CatalogIssue {
  line: string;
  reason: string;
}

const CEFR_SET = new Set<CEFR>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const BINYAN_SET = new Set<string>(BINYANIM);
const GIZRA_SET = new Set<string>(GZAROT);

/** Geçerli İbrani harfleri — kökte başka bir şey bulunmamalı. */
const HEBREW_LETTER = /^[א-ת]$/;

const issues: CatalogIssue[] = [];
const fail = (line: string, reason: string): null => {
  issues.push({ line, reason });
  return null;
};

function parseScores(raw: string, line: string): HebrewScores | null {
  const parts = raw.split(',').map((n) => Number(n.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n) || n < 0 || n > 100)) {
    return fail(line, 'skorlar 0-100 arasi 4 sayi olmali (siklik,ulpan,konusma,yazi)');
  }
  const [frequency, ulpan, speaking, written] = parts as [number, number, number, number];
  return { frequency, ulpan, speaking, written };
}

/** Yorum ve boş satırları atarak tabloyu satırlara böler. */
const rows = (table: string): string[] =>
  table
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith('#'));

function parseRow(line: string): HebrewVerb | null {
  const f = line.split('|');
  if (f.length !== 6) return fail(line, `6 alan bekleniyor, ${f.length} bulundu`);
  const [rootRaw, binyanRaw, gizraRaw, trRaw, cefrRaw, scoreRaw] = f as [
    string, string, string, string, string, string,
  ];

  const letters = [...rootRaw.trim()];
  if (letters.length !== 3) {
    return fail(line, `kok uc harfli olmali, ${letters.length} harf bulundu`);
  }
  if (!letters.every((ch) => HEBREW_LETTER.test(ch))) {
    return fail(line, 'kokte Ibrani harfi olmayan karakter var');
  }
  if (!BINYAN_SET.has(binyanRaw)) return fail(line, `gecersiz binyan: ${binyanRaw}`);
  if (!GIZRA_SET.has(gizraRaw)) return fail(line, `gecersiz gizra: ${gizraRaw}`);
  if (!CEFR_SET.has(cefrRaw as CEFR)) return fail(line, `gecersiz CEFR: ${cefrRaw}`);

  const binyan = binyanRaw as Binyan;
  const gizra = gizraRaw as Gizra;

  /**
   * Motor yalnızca shlemim için doğrudur. Zayıf bir kök bu tabloya
   * yanlışlıkla girerse üretilen çekim sessizce HATALI olur — bu yüzden
   * burada sert biçimde reddediliyor.
   */
  if (gizra !== 'shlemim') {
    return fail(line, `zayif kok (${gizra}) motorla turetilemez, irregular.ts'e ait`);
  }

  const meanings = trRaw
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  if (meanings.length === 0) return fail(line, 'Turkce anlam bos');

  const scores = parseScores(scoreRaw, line);
  if (!scores) return null;

  let table;
  try {
    table = conjugate(letters, binyan);
  } catch (err) {
    return fail(line, `cekim uretilemedi: ${(err as Error).message}`);
  }

  return {
    id: verbId(letters, binyan),
    root: letters,
    rootDisplay: letters.join('־'),
    binyan,
    gizra,
    lemma: lemmaOf(table),
    tr: meanings,
    cefr: cefrRaw as CEFR,
    scores,
    table,
    source: 'generated',
    // Üretilmiş hareke elle doğrulanmış veri kadar kesin sayılmaz.
    confidence: 0.9,
  };
}

/** Kanonik fiil listesi — öncelik skoruna göre sıralı. */
export const VERBS: HebrewVerb[] = (() => {
  const out: HebrewVerb[] = [];
  const seen = new Set<string>();

  for (const table of ALL_TABLES) {
    for (const line of rows(table)) {
      const verb = parseRow(line);
      if (!verb) continue;
      if (seen.has(verb.id)) {
        fail(line, `yinelenen kimlik: ${verb.id}`);
        continue;
      }
      seen.add(verb.id);
      out.push(verb);
    }
  }

  return out.sort((a, b) => priorityScore(b) - priorityScore(a));
})();

/** Doğrulama sırasında reddedilen satırlar. Boş olmalı. */
export const CATALOG_ISSUES: readonly CatalogIssue[] = issues;

export const VERB_BY_ID = new Map(VERBS.map((v) => [v.id, v]));

/** CEFR seviyesine göre fiiller — günlük doz motorunun kaynağı. */
export function verbsByLevel(level: CEFR): HebrewVerb[] {
  return VERBS.filter((v) => v.cefr === level);
}

/** Aynı kökün başka binyanlardaki karşılıkları — "tuzak" paneli buradan beslenir. */
export function siblingsOf(verb: HebrewVerb): HebrewVerb[] {
  const key = verb.root.join('');
  return VERBS.filter((v) => v.root.join('') === key && v.id !== verb.id);
}

/** Katalog özeti — ana sayfadaki sayaçlar. */
export const CATALOG_STATS = {
  total: VERBS.length,
  byBinyan: Object.fromEntries(
    BINYANIM.map((b) => [b, VERBS.filter((v) => v.binyan === b).length]),
  ) as Record<Binyan, number>,
  byLevel: Object.fromEntries(
    (['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as CEFR[]).map((l) => [
      l,
      VERBS.filter((v) => v.cefr === l).length,
    ]),
  ) as Record<CEFR, number>,
  /** Üretilen toplam çekim biçimi sayısı — motorun ürettiği gerçek hacim. */
  totalForms: VERBS.reduce((n, v) => {
    const t = v.table;
    return (
      n +
      1 +
      Object.keys(t.past).length +
      Object.keys(t.present).length +
      Object.keys(t.future).length +
      Object.keys(t.imperative).length
    );
  }, 0),
};
