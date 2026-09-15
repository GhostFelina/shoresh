/**
 * Binyan çekim motoru — İbranice fiilin üretildiği yer.
 *
 * TEMEL FİKİR: İbranice fiil ezberlenmez, TÜRETİLİR. Üç harfli kök
 * (שורש) bir kalıba (בניין) oturur ve bütün tablo kalıptan çıkar.
 * Bu yüzden 2000 fiil için 2000 × 40 = 80.000 biçim elle yazılmaz;
 * 2000 kök + 7 kalıp yazılır, gerisini bu dosya üretir.
 *
 * KAPSAM: Buradaki şablonlar SHLEMIM (tam kök) içindir — kalıbın
 * bozulmadığı köklerdir ve söz varlığının çoğunluğunu oluşturur.
 * Zayıf kökler (gzarot: ל״ה, ע״ו, פ״נ ...) kalıbı kırar; onlar
 * `data/irregular.ts` içinde AÇIK tabloyla durur. Bu ayrım
 * "düzenliyi türet, düzensizi sakla" kuralının İbranice karşılığıdır.
 *
 * Dosya SAF kalır: DOM, veritabanı, ağ yok.
 */
import {
  DAGESH,
  HATAF_PATAH,
  HIRIK,
  HOLAM,
  KAMATZ,
  KUBUTZ,
  PATAH,
  SEGOL,
  SHIN_DOT,
  SHVA,
  TZERE,
  BEGADKEFAT,
  affix,
  buildConjugation,
  root as rt,
  type Segment,
} from './niqqud';
import type {
  Binyan,
  Conjugation,
  ConjugationTable,
  ImperativeSlot,
  Person,
  PresentSlot,
} from '@/types/hebrew';

/* ------------------------------------------------------------------ *
 * Harf yardımcıları
 * ------------------------------------------------------------------ */

/** Şin noktası — ש yazıldığında ׁ işareti zorunludur, שׂ (sin) ayrı verilir. */
function dot(letter: string): string {
  return letter === 'ש' ? 'ש' + SHIN_DOT : letter;
}

/**
 * Dageş hazak (כפול) — harfi ikizleyen dageş.
 * Pi'el / Pu'al / Hitpa'el kalıplarının ortak imzası. Gırtlaksılar ve
 * ר dageş almaz; o kökler zaten ayrı gizraya düşer, burada gelmezler.
 */
function strong(letter: string): string {
  return letter === 'ש' ? 'ש' + DAGESH + SHIN_DOT : letter + DAGESH;
}

/**
 * Dageş kal — yalnızca begadkefat harflerinde, kelime başında ya da
 * şva nah'tan sonra. לִכְתּוֹב'daki ת bunu alır, לִשְׁמוֹר'daki מ almaz.
 */
function light(letter: string): string {
  return BEGADKEFAT.has(letter) ? strong(letter) : dot(letter);
}

/** Harf + hareke(ler) — okunurluk için kısa sarmalayıcı. */
const v = (letter: string, ...marks: string[]): string => dot(letter) + marks.join('');
const vs = (letter: string, ...marks: string[]): string => strong(letter) + marks.join('');
const vl = (letter: string, ...marks: string[]): string => light(letter) + marks.join('');

/** Holam male — חוֹלָם מָלֵא, yani ו + ֹ. Modern yazımda standart. */
const HOLAM_MALE = 'ו' + HOLAM;
/** Şuruk — וּ. */
const SHURUK = 'ו' + DAGESH;
/** Hirik male — ִי. */
const HIRIK_MALE = HIRIK + 'י';

/* ------------------------------------------------------------------ *
 * Çekim ekleri — bütün binyanlarda ortak
 * ------------------------------------------------------------------ */

/** Geçmiş zaman kişi ekleri. Kök harfi hangi harekeyi alacak ayrı belirlenir. */
const PAST_SUFFIX: Record<Person, string> = {
  ani: 'תִּי',
  ata: 'תָּ',
  at: 'תְּ',
  hu: '',
  hi: KAMATZ + 'ה', // R3 kamatz alır, sonra ה — 'reduced' biçimde ayrıca kurulur
  anachnu: 'נוּ',
  atem: 'תֶּם',
  aten: 'תֶּן',
  hem: 'וּ',
};

/**
 * Geçmiş zamanda kök son harfinin (R3) harekesi kişiye göre değişir:
 *  - hu           → hareke yok        (כָּתַב)
 *  - hi / hem     → kök sesli düşer   (כָּתְבָה / כָּתְבוּ)
 *  - diğerleri    → şva nah           (כָּתַבְתִּי)
 */
type PastShape = 'bare' | 'reduced' | 'shva';

const PAST_SHAPE: Record<Person, PastShape> = {
  ani: 'shva',
  ata: 'shva',
  at: 'shva',
  hu: 'bare',
  hi: 'reduced',
  anachnu: 'shva',
  atem: 'shva',
  aten: 'shva',
  hem: 'reduced',
};

/** Gelecek zaman ön ekleri — binyana göre harekesi değişir, harfi değişmez. */
const FUTURE_PREFIX_LETTER: Record<Person, string> = {
  ani: 'א',
  ata: 'ת',
  at: 'ת',
  hu: 'י',
  hi: 'ת',
  anachnu: 'נ',
  atem: 'ת',
  aten: 'ת',
  hem: 'י',
};

/** Gelecek zamanda sonek alan kişiler — kök sesi düşer. */
const FUTURE_SUFFIXED = new Set<Person>(['at', 'atem', 'aten', 'hem']);

const FUTURE_SUFFIX: Partial<Record<Person, string>> = {
  at: HIRIK_MALE,
  atem: SHURUK,
  aten: 'נָה',
  hem: SHURUK,
};

/* ------------------------------------------------------------------ *
 * Şablon tipi
 * ------------------------------------------------------------------ */

type Root3 = [string, string, string];

/** Bir binyanın bütün biçimlerini üreten şablon kümesi. */
interface BinyanTemplate {
  infinitive?: (r: Root3) => Segment[];
  past: (r: Root3, p: Person) => Segment[];
  present: (r: Root3, s: PresentSlot) => Segment[];
  future?: (r: Root3, p: Person) => Segment[];
  imperative?: (r: Root3, s: ImperativeSlot) => Segment[];
}

/**
 * Şimdiki zaman kuyruğu — son kök harfi + çoğul eki.
 *
 * Çoğul ekinin ünlüsü SON KÖK HARFİNE yazılır, ekin kendisine değil:
 *   כּוֹתֵב → כּוֹתְבִים   (ב hirik alır, ardından ים)
 *   כּוֹתֵב → כּוֹתְבוֹת   (ב holam alır, ardından ת)
 * Bu yüzden ek dizesi 'ים' / 'ות' diye tek parça tutulamaz; tutulursa
 * ünlü iki kez yazılır (כּוֹתְבוֹות gibi). Dişil tekil binyandan binyana
 * değiştiği için burada değil, her şablonun içinde kurulur.
 */
function presentTail(last: string, s: PresentSlot): Segment[] {
  if (s === 'ms') return [rt(dot(last))];
  if (s === 'mp') return [rt(dot(last) + HIRIK), affix('ים')];
  return [rt(dot(last) + HOLAM_MALE), affix('ת')]; // fp
}

/* ================================================================== *
 * PA'AL — פָּעַל (קל). Temel etken binyan.
 * Örnek kök: כ־ת־ב → כָּתַב / כּוֹתֵב / יִכְתּוֹב
 * ================================================================== */

const PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(vl(b) + HOLAM_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    // atem/aten'de ilk kök harfi şvaya iner: כְּתַבְתֶּם
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(vl(a, firstVowel))];

    if (shape === 'reduced') {
      // כָּתְבָה / כָּתְבוּ — orta harf şva, sonek doğrudan R3'e
      segs.push(rt(v(b, SHVA)));
      segs.push(rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(vl(a) + HOLAM_MALE)];
    // כּוֹתֶבֶת — dişil tekilde iki segol, sonra ת
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    // אֶ / תִּ / יִ / נִ — ani segol alır, diğerleri hirik.
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK))];
    segs.push(rt(v(a, SHVA)));
    if (FUTURE_SUFFIXED.has(p)) {
      // תִּכְתְּבִי — orta harf şva, kök sesi düşer
      segs.push(rt(vl(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(vl(b) + HOLAM_MALE), rt(dot(c)));
    }
    return segs;
  },

  imperative: ([a, b, c], s) => {
    // כְּתוֹב — baştaki şva "şva na"dır, ardından gelen begadkefat dageş ALMAZ.
    // (Mastardaki לִכְ ise şva nah'tır, orada ת dageş alır: לִכְתּוֹב.)
    if (s === 'ata') return [rt(vl(a, SHVA)), rt(dot(b) + HOLAM_MALE), rt(dot(c))];
    // כִּתְבִי / כִּתְבוּ — ilk harf ünlü taşıdığı için ת yine dageşsiz.
    return [
      rt(vl(a, HIRIK)),
      rt(v(b, SHVA)),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ================================================================== *
 * NIF'AL — נִפְעַל. Pa'al'in edilgeni / dönüşlüsü.
 * Örnek: כ־ת־ב → נִכְתַּב "yazıldı" / יִכָּתֵב
 * ================================================================== */

const NIFAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + HIRIK),
    rt(vs(a, KAMATZ)),
    rt(v(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [affix('נ' + HIRIK), rt(v(a, SHVA))];
    if (shape === 'reduced') {
      segs.push(rt(vl(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vl(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(vl(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('נ' + HIRIK), rt(v(a, SHVA))];
    if (s === 'fs') return [...head, rt(vl(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(vl(b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK))];
    segs.push(rt(vs(a, KAMATZ)));
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(rt(v(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(v(b, TZERE)), rt(dot(c)));
    }
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [affix('ה' + HIRIK), rt(vs(a, KAMATZ))];
    if (s === 'ata') segs.push(rt(v(b, TZERE)), rt(dot(c)));
    else {
      segs.push(rt(v(b, SHVA)), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * PI'EL — פִּעֵל. Yoğunluk / ettirgenlik. Orta harf dageşlidir.
 * Örnek: ד־ב־ר → דִּבֵּר "konuştu" / מְדַבֵּר
 * ================================================================== */

const PIEL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA),
    rt(v(a, PATAH)),
    rt(vs(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [rt(vl(a, HIRIK))];
    if (shape === 'reduced') {
      segs.push(rt(vs(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vs(b, TZERE)), rt(dot(c)));
    } else {
      // דִּבַּרְתִּי — sonek gelince tzere patah'a iner
      segs.push(rt(vs(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + SHVA), rt(v(a, PATAH))];
    if (s === 'fs') return [...head, rt(vs(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(vs(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    // אֲדַבֵּר — alef hatef patah alır, diğer ön ekler şva.
    const segs: Segment[] = [affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA))];
    segs.push(rt(v(a, PATAH)));
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(rt(vs(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(vs(b, TZERE)), rt(dot(c)));
    }
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [rt(vl(a, PATAH))];
    if (s === 'ata') segs.push(rt(vs(b, TZERE)), rt(dot(c)));
    else {
      segs.push(rt(vs(b, SHVA)), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * PU'AL — פֻּעַל. Pi'el'in edilgeni. Mastar ve emir kipi YOKTUR.
 * Örnek: ד־ב־ר → דֻּבַּר "konuşuldu" / מְדֻבָּר
 * ================================================================== */

const PUAL: BinyanTemplate = {
  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [rt(vl(a, KUBUTZ))];
    if (shape === 'reduced') {
      segs.push(rt(vs(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vs(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(vs(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + SHVA), rt(v(a, KUBUTZ))];
    if (s === 'fs') return [...head, rt(vs(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(vs(b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA))];
    segs.push(rt(v(a, KUBUTZ)));
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(rt(vs(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(vs(b, PATAH)), rt(dot(c)));
    }
    return segs;
  },
};

/* ================================================================== *
 * HIF'IL — הִפְעִיל. Ettirgen: "yaptırmak".
 * Örnek: כ־ת־ב → הִכְתִּיב "yazdırdı" / מַכְתִּיב
 * ================================================================== */

const HIFIL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(v(a, SHVA)),
    rt(vl(b) + HIRIK_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [affix('ה' + HIRIK), rt(v(a, SHVA))];
    if (shape === 'reduced') {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c)));
    } else {
      // הִכְתַּבְתִּי — yod düşer, patah gelir
      segs.push(rt(vl(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + PATAH), rt(v(a, SHVA)), rt(vl(b) + HIRIK_MALE)];
    // מַכְתִּיבָה — hif'il dişil tekili ת değil ה ile biter.
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, PATAH)), rt(v(a, SHVA))];
    segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c)));
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [affix('ה' + PATAH), rt(v(a, SHVA))];
    if (s === 'ata') segs.push(rt(vl(b, TZERE)), rt(dot(c)));
    else {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * HUF'AL — הֻפְעַל. Hif'il'in edilgeni. Mastar ve emir YOKTUR.
 * Örnek: כ־ת־ב → הֻכְתַּב / מֻכְתָּב
 * ================================================================== */

const HUFAL: BinyanTemplate = {
  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [affix('ה' + KUBUTZ), rt(v(a, SHVA))];
    if (shape === 'reduced') {
      segs.push(rt(vl(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vl(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(vl(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + KUBUTZ), rt(v(a, SHVA))];
    if (s === 'fs') return [...head, rt(vl(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(vl(b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, KUBUTZ)), rt(v(a, SHVA))];
    segs.push(rt(vl(b, PATAH)), rt(dot(c)));
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },
};

/* ================================================================== *
 * HITPA'EL — הִתְפַּעֵל. Dönüşlü / karşılıklı.
 * Örnek: ל־ב־ש → הִתְלַבֵּשׁ "giyindi" / מִתְלַבֵּשׁ
 *
 * ÖZEL KURAL — metatez (שיכול אותיות): kök ıslıklı bir harfle
 * başlıyorsa ön ekin ת'si kök harfiyle YER DEĞİŞTİRİR:
 *   ס → הִסְתַּדֵּר   (הִתְסַדֵּר değil)
 *   שׁ → הִשְׁתַּמֵּשׁ
 *   ז → הִזְדַּקֵּן  (ת ayrıca ד'ye dönüşür — sesli uyum)
 * Bu, İbranicenin en çok gözden kaçan kurallarından biridir ve
 * uygulanmazsa üretilen fiil yanlış olur.
 * ================================================================== */

/** Metatez tetikleyen harfler ve ת'nin aldığı biçim. */
const METATHESIS: Record<string, string> = {
  ס: 'ת',
  ש: 'ת',
  שׂ: 'ת',
  צ: 'ט', // הִצְטַדֵּק — ת vurgulu ט olur
  ז: 'ד', // הִזְדַּקֵּן — ת sesli ד olur
  ד: 'ד',
  ט: 'ט',
};

/** Hitpa'el ön ekini kök birinci harfine göre kurar. */
function hitpaelPrefix(first: string, headVowel: string): Segment[] {
  const swapped = METATHESIS[first];
  if (!swapped) {
    // Normal sıra: הִתְ + kök
    return [affix('ה' + headVowel + 'ת' + SHVA)];
  }
  // Metatez: kök harfi öne geçer, ת (veya dönüşmüş hâli) arkasına düşer.
  // Yer değiştiren ת gövdenin patah'ını üstlenir: הִסְתַּדֵּר.
  return [affix('ה' + headVowel), rt(v(first, SHVA)), affix(swapped + DAGESH + PATAH)];
}

/** Metatezde kök ilk harfi ön eke taşındığı için gövdeden düşer. */
const hitpaelBody = (r: Root3): [string, string, string] | [string, string] =>
  METATHESIS[r[0]] ? [r[1], r[2]] : [r[0], r[1], r[2]];

const HITPAEL: BinyanTemplate = {
  infinitive: (r) => {
    // לְהִתְלַבֵּשׁ — ל şva alır, ה hirik. İkisini karıştırmak sık yapılan hata.
    const segs: Segment[] = [affix('ל' + SHVA), ...hitpaelPrefix(r[0], HIRIK)];
    return [...segs, ...hitpaelStem(hitpaelBody(r), TZERE)];
  },

  past: (r, p) => {
    const shape = PAST_SHAPE[p];
    const body = hitpaelBody(r);
    const segs: Segment[] = [...hitpaelPrefix(r[0], HIRIK)];
    if (shape === 'reduced') {
      segs.push(...hitpaelStem(body, SHVA));
      const last = segs.pop()!;
      segs.push(rt(last.text + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(...hitpaelStem(body, TZERE));
    } else {
      segs.push(...hitpaelStem(body, PATAH, SHVA));
      segs.push(affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: (r, s) => {
    const body = hitpaelBody(r);
    const head = hitpaelHead(r, 'מ' + HIRIK);
    if (s === 'fs') return [...head, ...hitpaelStem(body, SEGOL, SEGOL), affix('ת')];
    if (s === 'ms') return [...head, ...hitpaelStem(body, TZERE)];
    if (s === 'mp') return [...head, ...hitpaelStem(body, SHVA, HIRIK), affix('ים')];
    return [...head, ...hitpaelStem(body, SHVA, HOLAM_MALE), affix('ת')];
  },

  future: (r, p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const body = hitpaelBody(r);
    const segs: Segment[] = hitpaelHead(r, vl(pre, p === 'ani' ? SEGOL : HIRIK));
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(...hitpaelStem(body, SHVA));
      segs.push(affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(...hitpaelStem(body, TZERE));
    }
    return segs;
  },

  imperative: (r, s) => {
    const body = hitpaelBody(r);
    const segs: Segment[] = [...hitpaelPrefix(r[0], HIRIK)];
    if (s === 'ata') segs.push(...hitpaelStem(body, TZERE));
    else {
      segs.push(...hitpaelStem(body, SHVA));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/**
 * Hitpa'el başı — verilen ön ek harfini (הִ / מִ / תִּ / יִ) kurar ve
 * gerekiyorsa metatezi uygular. Üç zamanda da aynı kural işlediği için
 * tek yerde duruyor; ayrı ayrı yazılsa biri düzeltilip diğeri unutulur.
 */
function hitpaelHead(r: Root3, head: string): Segment[] {
  const swapped = METATHESIS[r[0]];
  if (!swapped) return [affix(head + 'ת' + SHVA)];
  return [affix(head), rt(v(r[0], SHVA)), affix(swapped + DAGESH + PATAH)];
}

/**
 * Hitpa'el gövdesi — metatezden sonra geriye kalan kök harfleri.
 * İki harf kaldıysa (metatez oldu) ilk harf dageşli+patah, ikinci sesli.
 * Üç harf kaldıysa ilk patah, ikinci dageşli, üçüncü sessiz.
 */
function hitpaelStem(
  body: [string, string, string] | [string, string],
  stemVowel: string,
  lastVowel = '',
): Segment[] {
  if (body.length === 2) {
    const [x, y] = body;
    return [rt(vs(x, stemVowel)), rt(dot(y) + lastVowel)];
  }
  const [x, y, z] = body;
  return [rt(v(x, PATAH)), rt(vs(y, stemVowel)), rt(dot(z) + lastVowel)];
}

/* ------------------------------------------------------------------ *
 * Genel arayüz
 * ------------------------------------------------------------------ */

const TEMPLATES: Record<Binyan, BinyanTemplate> = {
  paal: PAAL,
  nifal: NIFAL,
  piel: PIEL,
  pual: PUAL,
  hifil: HIFIL,
  hufal: HUFAL,
  hitpael: HITPAEL,
};

/** Modern konuşma İvritinde tabloya yazılan kişiler. */
const TABLE_PERSONS: Person[] = [
  'ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'atem', 'hem',
];

const PRESENT_ALL: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];
const IMPERATIVE_ALL: ImperativeSlot[] = ['ata', 'at', 'atem'];

/** Bu binyanda mastar ve emir kipi var mı? Edilgenlerde yoktur. */
export function hasInfinitive(binyan: Binyan): boolean {
  return TEMPLATES[binyan].infinitive !== undefined;
}

export function hasImperative(binyan: Binyan): boolean {
  return TEMPLATES[binyan].imperative !== undefined;
}

/**
 * Bir kök+binyan çiftinin tam çekim tablosunu üretir.
 *
 * Yalnızca SHLEMIM kökler için doğrudur. Zayıf kök verildiğinde de
 * bir tablo döner — ama o tablo yanlıştır; çağıran taraf gizrayı
 * kontrol edip zayıf kökleri açık tablodan almak zorundadır.
 * `catalog.ts` bu kontrolü yapar ve ihlali test düşürür.
 */
export function conjugate(rootLetters: string[], binyan: Binyan): ConjugationTable {
  if (rootLetters.length !== 3) {
    throw new Error(
      `Çekim motoru üç harfli kök bekler, ${rootLetters.length} harf geldi: ${rootLetters.join('')}`,
    );
  }
  const r = rootLetters as Root3;
  const t = TEMPLATES[binyan];

  const past: Partial<Record<Person, Conjugation>> = {};
  for (const p of TABLE_PERSONS) past[p] = buildConjugation(t.past(r, p));

  const present = Object.fromEntries(
    PRESENT_ALL.map((s) => [s, buildConjugation(t.present(r, s))]),
  ) as Record<PresentSlot, Conjugation>;

  const future: Partial<Record<Person, Conjugation>> = {};
  if (t.future) for (const p of TABLE_PERSONS) future[p] = buildConjugation(t.future(r, p));

  const imperative: Partial<Record<ImperativeSlot, Conjugation>> = {};
  if (t.imperative) {
    for (const s of IMPERATIVE_ALL) imperative[s] = buildConjugation(t.imperative(r, s));
  }

  const infinitive = t.infinitive
    ? buildConjugation(t.infinitive(r))
    : // Edilgen binyanlarda mastar yoktur; sözlük biçimi 3. tekil erildir.
      past.hu!;

  return { infinitive, past, present, future, imperative };
}

/** Sözlük biçimi — İbranice sözlükler fiili 3. tekil eril geçmişle listeler. */
export function lemmaOf(table: ConjugationTable): Conjugation {
  return table.past.hu ?? table.present.ms;
}
