/**
 * מְרֻבָּעִים — dört harfli (quadriliteral) kökler.
 *
 * NEDEN AYRI BİR AİLE: Klasik İbranice üç harfli kök üzerine kuruludur,
 * ama Modern İvrit dört harfli köklerle büyümeye devam ediyor ve bunların
 * çoğu GÜNLÜK kelimelerdir:
 *   תִּכְנֵן planladı · אִרְגֵּן örgütledi · שִׁכְנֵעַ ikna etti
 *   טִלְפֵּן telefon etti · תִּרְגֵּם çevirdi · פִּרְסֵם yayımladı
 * Üçüncü harfi olmayan bir şablonla çekilemezler; kalıpları pi'el'e
 * benzer ama ortada iki ünsüz taşır.
 *
 * Yalnızca pi'el / pu'al / hitpa'el kalıplarında bulunurlar — pa'al ve
 * hif'il dört harfli kök almaz. Bu yüzden burada üç binyan var.
 */
import { buildConjugation, normalizeFinals } from './niqqud';
import {
  FUTURE_PREFIX_LETTER,
  FUTURE_SUFFIX,
  FUTURE_SUFFIXED,
  HIRIK,
  HIRIK_MALE,
  HOLAM_MALE,
  KAMATZ,
  PAST_SHAPE,
  PAST_SUFFIX,
  PATAH,
  SHURUK,
  SHVA,
  affix,
  dot,
  rt,
  v,
  vl,
  type Segment,
} from './morphology';
import { HATAF_PATAH, SEGOL, TZERE } from './niqqud';
import type {
  Binyan,
  Conjugation,
  ConjugationTable,
  ImperativeSlot,
  Person,
  PresentSlot,
} from '@/types/hebrew';

type Root4 = [string, string, string, string];

interface QuadTemplate {
  infinitive: (r: Root4) => Segment[];
  past: (r: Root4, p: Person) => Segment[];
  present: (r: Root4, s: PresentSlot) => Segment[];
  future: (r: Root4, p: Person) => Segment[];
  imperative?: (r: Root4, s: ImperativeSlot) => Segment[];
}

/**
 * Dört harfli kökün şimdiki/çoğul kuyruğu.
 * Üç harfli kökteki mantığın aynısı: çoğul ekinin ünlüsü SON kök
 * harfine yazılır, ekin kendisine değil.
 */
function quadTail(c: string, d: string, s: PresentSlot): Segment[] {
  if (s === 'ms') return [rt(vl(c, TZERE)), rt(dot(d))];
  if (s === 'fs') return [rt(vl(c, SEGOL)), rt(v(d, SEGOL)), affix('ת')];
  if (s === 'mp') return [rt(vl(c, SHVA)), rt(dot(d) + HIRIK), affix('ים')];
  return [rt(vl(c, SHVA)), rt(dot(d) + HOLAM_MALE), affix('ת')];
}

/* ------------------------------------------------------------------ *
 * PI'EL — תִּכְנֵן / מְתַכְנֵן / יְתַכְנֵן
 * ------------------------------------------------------------------ */

const QUAD_PIEL: QuadTemplate = {
  infinitive: ([a, b, c, d]) => [
    affix('ל' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, SHVA)),
    rt(vl(c, TZERE)),
    rt(dot(d)),
  ],

  past: ([a, b, c, d], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [rt(vl(a, HIRIK)), rt(v(b, SHVA))];
    if (shape === 'bare') return [...head, rt(vl(c, TZERE)), rt(dot(d))];
    if (p === 'hi') {
      return [...head, rt(vl(c, SHVA)), rt(dot(d) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(SHURUK)];
    // תִּכְנַנְתִּי — ek gelince tzere patah'a iner
    return [...head, rt(vl(c, PATAH)), rt(v(d, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c, d], s) => [
    affix('מ' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, SHVA)),
    ...quadTail(c, d, s),
  ],

  future: ([a, b, c, d], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA)),
      rt(v(a, PATAH)),
      rt(v(b, SHVA)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(vl(c, TZERE)), rt(dot(d))];
  },

  imperative: ([a, b, c, d], s) => {
    const head: Segment[] = [rt(vl(a, PATAH)), rt(v(b, SHVA))];
    if (s === 'ata') return [...head, rt(vl(c, TZERE)), rt(dot(d))];
    return [
      ...head,
      rt(vl(c, SHVA)),
      rt(dot(d)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ------------------------------------------------------------------ *
 * HITPA'EL — הִתְאַרְגֵּן / מִתְאַרְגֵּן / יִתְאַרְגֵּן
 * ------------------------------------------------------------------ */

const QUAD_HITPAEL: QuadTemplate = {
  infinitive: ([a, b, c, d]) => [
    affix('ל' + SHVA + 'ה' + HIRIK + 'ת' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, SHVA)),
    rt(vl(c, TZERE)),
    rt(dot(d)),
  ],

  past: ([a, b, c, d], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [
      affix('ה' + HIRIK + 'ת' + SHVA),
      rt(v(a, PATAH)),
      rt(v(b, SHVA)),
    ];
    if (shape === 'bare') return [...head, rt(vl(c, TZERE)), rt(dot(d))];
    if (p === 'hi') {
      return [...head, rt(vl(c, SHVA)), rt(dot(d) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(SHURUK)];
    return [...head, rt(vl(c, PATAH)), rt(v(d, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c, d], s) => [
    affix('מ' + HIRIK + 'ת' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, SHVA)),
    ...quadTail(c, d, s),
  ],

  future: ([a, b, c, d], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(vl(pre, p === 'ani' ? SEGOL : HIRIK) + 'ת' + SHVA),
      rt(v(a, PATAH)),
      rt(v(b, SHVA)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(vl(c, TZERE)), rt(dot(d))];
  },

  imperative: ([a, b, c, d], s) => {
    const head: Segment[] = [
      affix('ה' + HIRIK + 'ת' + SHVA),
      rt(v(a, PATAH)),
      rt(v(b, SHVA)),
    ];
    if (s === 'ata') return [...head, rt(vl(c, TZERE)), rt(dot(d))];
    return [
      ...head,
      rt(vl(c, SHVA)),
      rt(dot(d)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ------------------------------------------------------------------ *
 * PU'AL — תֻּכְנַן / מְתֻכְנָן. Edilgen: mastar ve emir yok.
 * ------------------------------------------------------------------ */

const QUAD_PUAL: QuadTemplate = {
  infinitive: ([a, b, c, d]) => [
    // Pu'al'de mastar yoktur; sözlük biçimini verir.
    rt(vl(a, 'ֻ')),
    rt(v(b, SHVA)),
    rt(vl(c, PATAH)),
    rt(dot(d)),
  ],

  past: ([a, b, c, d], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [rt(vl(a, 'ֻ')), rt(v(b, SHVA))];
    if (shape === 'bare') return [...head, rt(vl(c, PATAH)), rt(dot(d))];
    if (p === 'hi') {
      return [...head, rt(vl(c, SHVA)), rt(dot(d) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(SHURUK)];
    return [...head, rt(vl(c, PATAH)), rt(v(d, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c, d], s) => {
    const head: Segment[] = [affix('מ' + SHVA), rt(v(a, 'ֻ')), rt(v(b, SHVA))];
    if (s === 'ms') return [...head, rt(vl(c, KAMATZ)), rt(dot(d))];
    if (s === 'fs') return [...head, rt(vl(c, SEGOL)), rt(v(d, SEGOL)), affix('ת')];
    if (s === 'mp') return [...head, rt(vl(c, SHVA)), rt(dot(d) + HIRIK), affix('ים')];
    return [...head, rt(vl(c, SHVA)), rt(dot(d) + HOLAM_MALE), affix('ת')];
  },

  future: ([a, b, c, d], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA)),
      rt(v(a, 'ֻ')),
      rt(v(b, SHVA)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vl(c, SHVA)), rt(dot(d)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(vl(c, PATAH)), rt(dot(d))];
  },
};

const QUAD_TEMPLATES: Partial<Record<Binyan, QuadTemplate>> = {
  piel: QUAD_PIEL,
  pual: QUAD_PUAL,
  hitpael: QUAD_HITPAEL,
};

/** Dört harfli kök bu binyanda çekilebilir mi? */
export function supportsQuad(binyan: Binyan): boolean {
  return QUAD_TEMPLATES[binyan] !== undefined;
}

const TABLE_PERSONS: Person[] = ['ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'atem', 'hem'];
const PRESENT_ALL: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];
const IMPERATIVE_ALL: ImperativeSlot[] = ['ata', 'at', 'atem'];

/** Dört harfli kökün tam çekim tablosu. */
export function conjugateQuad(rootLetters: string[], binyan: Binyan): ConjugationTable {
  const t = QUAD_TEMPLATES[binyan];
  if (!t) {
    throw new Error(
      `Dort harfli kok yalnizca pi'el / pu'al / hitpa'el kaliplarinda bulunur; ` +
        `${binyan} icin sablon yok.`,
    );
  }
  /**
   * Kök sofit biçimde gelmiş olabilir (ת־כ־נ־ן). Harf ek aldığında
   * kelime ortasına düşer ve normal biçime dönmek zorundadır —
   * תִּכְנַנְתִּי, תִּכְנַןְתִּי değil. Sofit en sonda bir kez uygulanır.
   */
  const r = rootLetters.map((ch) => normalizeFinals(ch)) as Root4;

  const past: Partial<Record<Person, Conjugation>> = {};
  for (const p of TABLE_PERSONS) past[p] = buildConjugation(t.past(r, p));

  const present = Object.fromEntries(
    PRESENT_ALL.map((s) => [s, buildConjugation(t.present(r, s))]),
  ) as Partial<Record<PresentSlot, Conjugation>>;

  const future: Partial<Record<Person, Conjugation>> = {};
  for (const p of TABLE_PERSONS) future[p] = buildConjugation(t.future(r, p));

  const imperative: Partial<Record<ImperativeSlot, Conjugation>> = {};
  if (t.imperative) {
    for (const s of IMPERATIVE_ALL) imperative[s] = buildConjugation(t.imperative(r, s));
  }

  return {
    infinitive: buildConjugation(t.infinitive(r)),
    past,
    present,
    future,
    imperative,
  };
}
