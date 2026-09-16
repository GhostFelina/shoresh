/**
 * Katalog — ham kök tablolarını doğrulayıp kanonik `HebrewVerb[]` üretir.
 *
 * Hiçbir satır doğrudan uygulamaya geçmez; önce buradan geçer. Geçersiz
 * satır SESSİZCE ATILMAZ — `CATALOG_ISSUES` içinde nedeniyle raporlanır
 * ve birim test bu dizinin boş olmasını bekler. Böylece veri bozulması
 * "uygulamada bir şeyler tuhaf" diye değil, kırmızı testle fark edilir.
 *
 * SATIR BİÇİMİ: kök | binyan | türkçe anlamlar (;) | CEFR | skorlar
 * Gizra YAZILMAZ — kökün harflerinden türetilir (`detectGizra`). Elle
 * yazılsaydı 500 satırda kaçınılmaz olarak yanlış sınıflanan kökler olur
 * ve o fiiller sessizce yanlış çekilirdi.
 */
import { conjugate, isSupported, lemmaOf } from '@/engine/binyan';
import { detectGizra } from '@/engine/detect-gizra';
import {
  BINYANIM,
  GZAROT,
  GIZRA_LABEL,
  priorityScore,
  verbId,
  type Binyan,
  type CEFR,
  type Gizra,
  type HebrewScores,
  type HebrewVerb,
} from '@/types/hebrew';
import { ALL_ROOT_TABLES } from './roots';
import { IRREGULAR_SEEDS, tableFromSeed } from './irregular';

export interface CatalogIssue {
  line: string;
  reason: string;
}

const CEFR_SET = new Set<CEFR>(['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
const BINYAN_SET = new Set<string>(BINYANIM);
const GIZRA_SET = new Set<string>(GZAROT);

/**
 * Kökü harflerine ayırır.
 *
 * שׂ (sin) iki kod noktasından oluşur ama TEK harftir; düz karakter
 * bölmesi onu iki harfe ayırıp kökü dört harfli sanmaya yol açar.
 */
const LETTER_RE = /ש[ׁׂ]|[א-ת]/gu;

function splitRoot(raw: string): string[] {
  return [...raw.trim().matchAll(LETTER_RE)].map((m) => m[0]);
}

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
  if (f.length !== 5 && f.length !== 6) {
    return fail(line, `5 veya 6 alan bekleniyor, ${f.length} bulundu`);
  }
  const [rootRaw, binyanRaw, trRaw, cefrRaw, scoreRaw, gizraOverride] = f as [
    string, string, string, string, string, string | undefined,
  ];

  const letters = splitRoot(rootRaw);
  if (letters.length !== 3 && letters.length !== 4) {
    return fail(line, `kok uc ya da dort harfli olmali, ${letters.length} harf bulundu`);
  }
  const isQuad = letters.length === 4;
  if (!BINYAN_SET.has(binyanRaw)) return fail(line, `gecersiz binyan: ${binyanRaw}`);
  if (!CEFR_SET.has(cefrRaw as CEFR)) return fail(line, `gecersiz CEFR: ${cefrRaw}`);

  const binyan = binyanRaw as Binyan;

  /**
   * Gizra normalde kökten türetilir. Altıncı alan bir KAÇIŞ KAPISIDIR:
   * נ ile başlayan her kök gelecek zamanda נ'yi düşürmez — לִנְפֹּל → יִפֹּל
   * ama לִנְשֹׁם → יִנְשֹׁם. Bu, kurala değil kelimeye bağlı bir ayrımdır ve
   * harflerden bilinemez. Böyle kökler burada açıkça sınıflandırılır.
   */
  let gizra: Gizra;
  if (isQuad) {
    // Dört harfli kökte zayıflık sınıfı anlamsızdır: kalıp zaten kendi
    // ailesine aittir ve harf düşmesi/ünlüleşme söz konusu değildir.
    gizra = 'shlemim';
  } else if (gizraOverride && gizraOverride.trim()) {
    const g = gizraOverride.trim();
    if (!GIZRA_SET.has(g)) return fail(line, `gecersiz gizra: ${g}`);
    gizra = g as Gizra;
  } else {
    gizra = detectGizra(letters, binyan);
  }

  /**
   * Pi'el ailesinde orta harf alef veya resh ise kalıp BAŞKA türlü bozulur:
   * dageş düşer ve önceki ünlü uzar (בֵּרֵךְ, תֵּאֵר). ח/ע'de ise ünlü
   * uzamaz, kalıp korunur. İki durum aynı gizra adını taşıdığı için burada
   * ayrılıyor; uzayan biçim için henüz şablon yok, o kökler reddediliyor.
   */
  const mid = letters[1]?.charAt(0);
  const MID_NO_DAGESH = 'אהחער'; // א ה ח ע ר
  const PIEL_FAMILY = binyan === 'piel' || binyan === 'pual' || binyan === 'hitpael';

  /**
   * ל״ה + pi'el ailesinde ORTA harf dageş alır (נִסָּה, חִכָּה). Orta harf
   * dageş alamayan bir harfse (א ה ח ע ר) kalıp bozulur — זִהָה, הִתְחָרָה.
   * Şablon dageşi koşulsuz eklediği için bu kökler burada durduruluyor.
   */
  if (!isQuad && gizra === 'lamed-hey' && PIEL_FAMILY && mid && MID_NO_DAGESH.includes(mid)) {
    return fail(line, `orta harf ${mid} dages alamaz — l"h pi'el kalibi bozulur, sablon yok`);
  }

  /*
   * Orta harf ר/א olan pi'el ailesi artik 'ayin-resh' gizrasina dusuyor
   * ve kendi sablonu var (בֵּרֵך, הִצְטָרֵף). Yalniz pu'al'in
   * karsiligi yazilmadi; o birlesim asagida desteklenmeyen olarak elenir.
   */

  /**
   * Motor bu birleşimi üretemiyorsa satır REDDEDİLİR. Tam kök şablonuna
   * düşüp "bir şeyler üretmek" en kötü seçenek olurdu: öğrenciye var
   * olmayan bir fiil biçimi öğretmek, o fiili hiç göstermemekten beterdir.
   */
  if (!isSupported(binyan, gizra, letters.length)) {
    return fail(
      line,
      `motor desteklemiyor: ${binyan} + ${gizra} (${GIZRA_LABEL[gizra].tr}) — sablon gerekiyor`,
    );
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
    table = conjugate(letters, binyan, gizra);
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
    confidence: gizra === 'shlemim' ? 0.95 : 0.9,
  };
}

/**
 * Düzensiz fiiller — motorun üretemediği, elle yazılmış tablolar.
 *
 * İbranicenin EN SIK fiilleri (הָלַךְ, הָיָה, לָקַח, נָתַן) hiçbir kalıba
 * uymaz. Kural yazmaya çalışmak her seferinde başka bir fiili bozar;
 * doğrusu olduğu gibi yazmaktır. Bunlar üretilen fiillerle aynı listeye
 * karışır — arayüz açısından fark yoktur, yalnızca `source` alanı ayrılır.
 */
function irregularVerbs(): HebrewVerb[] {
  return IRREGULAR_SEEDS.map((seed) => {
    const table = tableFromSeed(seed);
    return {
      id: verbId(seed.root, seed.binyan),
      root: seed.root,
      rootDisplay: seed.root.join('\u05be'),
      binyan: seed.binyan,
      gizra: 'irregular' as Gizra,
      lemma: lemmaOf(table),
      tr: seed.tr,
      cefr: seed.cefr,
      scores: seed.scores,
      table,
      source: 'explicit' as const,
      // Elle yazıldığı ve tek tek denetlendiği için tam güven.
      confidence: 1,
      traps: [
        {
          kind: 'spelling' as const,
          note: seed.why,
        },
      ],
    };
  });
}

/** Kanonik fiil listesi — öncelik skoruna göre sıralı. */
export const VERBS: HebrewVerb[] = (() => {
  const out: HebrewVerb[] = [];
  const seen = new Set<string>();

  // Düzensizler ÖNCE eklenir: aynı kök+binyan hem burada hem ham tabloda
  // varsa elle yazılmış olan kazanmalı, üretilmiş olan değil.
  for (const verb of irregularVerbs()) {
    seen.add(verb.id);
    out.push(verb);
  }

  for (const table of ALL_ROOT_TABLES) {
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

/** Doğrulama sırasında reddedilen satırlar. */
export const CATALOG_ISSUES: readonly CatalogIssue[] = issues;

export const VERB_BY_ID = new Map(VERBS.map((v) => [v.id, v]));

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** CEFR seviyesine göre fiiller — seviye sayfalarının kaynağı. */
export function verbsByLevel(level: CEFR): HebrewVerb[] {
  return VERBS.filter((v) => v.cefr === level);
}

/** Bu seviye ve altındaki her şey — "şu ana kadar öğrendiklerin" havuzu. */
export function verbsUpToLevel(level: CEFR): HebrewVerb[] {
  const max = LEVELS.indexOf(level);
  return VERBS.filter((v) => LEVELS.indexOf(v.cefr) <= max);
}

/** Aynı kökün başka binyanlardaki karşılıkları — kök panelini besler. */
export function siblingsOf(verb: HebrewVerb): HebrewVerb[] {
  const key = verb.root.join('');
  return VERBS.filter((v) => v.root.join('') === key && v.id !== verb.id);
}

/** Tek bir fiilin ürettiği toplam çekim biçimi sayısı. */
export function formCount(v: HebrewVerb): number {
  const t = v.table;
  return (
    1 +
    Object.keys(t.past).length +
    Object.keys(t.present).length +
    Object.keys(t.future).length +
    Object.keys(t.imperative).length
  );
}

/** Katalog özeti — ana sayfadaki sayaçlar. */
export const CATALOG_STATS = {
  total: VERBS.length,
  byBinyan: Object.fromEntries(
    BINYANIM.map((b) => [b, VERBS.filter((v) => v.binyan === b).length]),
  ) as Record<Binyan, number>,
  byLevel: Object.fromEntries(
    LEVELS.map((l) => [l, VERBS.filter((v) => v.cefr === l).length]),
  ) as Record<CEFR, number>,
  byGizra: VERBS.reduce<Record<string, number>>((acc, v) => {
    acc[v.gizra] = (acc[v.gizra] ?? 0) + 1;
    return acc;
  }, {}),
  /** Motorun ürettiği gerçek çekim hacmi. */
  totalForms: VERBS.reduce((n, v) => n + formCount(v), 0),
  /** Kaç ayrı üç harfli kök geçiyor (aynı kök birden çok binyanda olabilir). */
  distinctRoots: new Set(VERBS.map((v) => v.root.join(''))).size,
  /** Elle yazılmış düzensiz fiil sayısı. */
  irregular: VERBS.filter((v) => v.gizra === 'irregular').length,
};
