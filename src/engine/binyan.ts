/**
 * Binyan çekim motoru — İbranice fiilin üretildiği yer.
 *
 * TEMEL FİKİR: İbranice fiil ezberlenmez, TÜRETİLİR. Üç harfli kök
 * (שורש) bir kalıba (בניין) oturur ve bütün tablo kalıptan çıkar.
 * Bu yüzden 1500 fiil için 1500 × 40 = 60.000 biçim elle yazılmaz;
 * kökler + kalıplar yazılır, gerisini bu dosya üretir.
 *
 * İKİ ŞABLON AİLESİ:
 *  - Bu dosya  → SHLEMIM (tam kök): kalıbın hiç bozulmadığı kökler.
 *  - gzarot.ts → ZAYIF kökler: ל״ה, ע״ו, פ״נ, פ״י, gırtlaksılar…
 *    Bunlarda kök harflerinden biri düşer, ünlüye dönüşür ya da
 *    komşusunu değiştirir; kalıp aynı kalmaz, ayrı şablon ister.
 *
 * `conjugate()` doğru aileyi gizraya bakarak seçer. Eşleşen şablon
 * yoksa SESSİZCE yanlış çekim üretmek yerine hata fırlatır.
 *
 * Dosya SAF kalır: DOM, veritabanı, ağ yok.
 */
import { buildConjugation, normalizeFinals, type Segment } from './niqqud';
import {
  FUTURE_PREFIX_LETTER,
  FUTURE_SUFFIX,
  FUTURE_SUFFIXED,
  HIRIK,
  HIRIK_MALE,
  HOLAM_MALE,
  IMPERATIVE_ALL,
  KAMATZ,
  PAST_SHAPE,
  PAST_SUFFIX,
  PATAH,
  PRESENT_ALL,
  SHURUK,
  SHVA,
  ASSIMILATES,
  METATHESIS,
  TABLE_PERSONS,
  affix,
  dot,
  light,
  presentTail,
  strong,
  rt,
  v,
  vl,
  vs,
  type BinyanTemplate,
  type Root3,
} from './morphology';
import { SEGOL, TZERE, KUBUTZ, HATAF_PATAH } from './niqqud';
import { GIZRA_TEMPLATES, SHLEMIM_COMPATIBLE } from './gzarot';
import { conjugateQuad, supportsQuad } from './meruba';
import type {
  Binyan,
  Conjugation,
  ConjugationTable,
  Gizra,
  ImperativeSlot,
  Person,
  PresentSlot,
} from '@/types/hebrew';

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


/**
 * Hitpa'el ön ekini kök birinci harfine göre kurar — ÜÇ ayrı durum.
 *
 * 1. NORMAL: הִתְ + kök. הִתְלַבֵּשׁ
 * 2. METATEZ: ilk harf ıslıklıysa (ס ש צ ז) ת ile YER DEĞİŞTİRİR ve
 *    bazıları ses değiştirir: צ→ט, ז→ד. הִסְתַּדֵּר, הִצְטָרֵף
 * 3. KAYNAŞMA: ilk harf diş ünsüzüyse (ד ט ת) ת yer değiştirmez,
 *    YUTULUR; ortada ayrı bir harf kalmaz. הִטַּפֵּל, הִדַּבֵּר
 *
 * Üçüncü durum başlangıçta metatez sayilmisti (ד→ד, ט→ט) ve harf İKİ
 * KEZ yazılıyordu: הִטְטַּפֵּל.
 *
 * Dageş `light()` ile veriliyor, elle değil: yer değiştiren harf ת ise
 * dageş kal alır (הִסְתַּדֵּר) ama ט begadkefat değildir ve almaz
 * (הִצְטַלֵּם). Elle eklenince הִצְטַּלֵּם çıkıyordu.
 */
function hitpaelPrefix(first: string, headVowel: string): Segment[] {
  if (ASSIMILATES.has(first)) {
    // ת yutuldu: kök harfi ikizleşip gövdenin patah'ını üstlenir.
    return [affix('ה' + headVowel), rt(strong(first) + PATAH)];
  }
  const swapped = METATHESIS[first];
  if (!swapped) {
    return [affix('ה' + headVowel + 'ת' + SHVA)];
  }
  return [affix('ה' + headVowel), rt(v(first, SHVA)), affix(light(swapped) + PATAH)];
}

/**
 * Gövdede kalan kök harfleri.
 *
 * Hem metatezde hem kaynaşmada ilk harf başa taşındığı için gövdeden
 * düşer; geriye iki harf kalır.
 */
const hitpaelBody = (r: Root3): [string, string, string] | [string, string] =>
  METATHESIS[r[0]] || ASSIMILATES.has(r[0]) ? [r[1], r[2]] : [r[0], r[1], r[2]];

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
  // Kural `hitpaelPrefix` ile AYNI; oradaki açıklamaya bak.
  if (ASSIMILATES.has(r[0])) return [affix(head), rt(strong(r[0]) + PATAH)];
  const swapped = METATHESIS[r[0]];
  if (!swapped) return [affix(head + 'ת' + SHVA)];
  return [affix(head), rt(v(r[0], SHVA)), affix(light(swapped) + PATAH)];
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
 * Şablon seçimi ve genel arayüz
 * ------------------------------------------------------------------ */

/** Tam kök şablonları — kalıbın bozulmadığı kökler. */
export const SHLEMIM_TEMPLATES: Record<Binyan, BinyanTemplate> = {
  paal: PAAL,
  nifal: NIFAL,
  piel: PIEL,
  pual: PUAL,
  hifil: HIFIL,
  hufal: HUFAL,
  hitpael: HITPAEL,
};

/**
 * Bir binyan+gizra çifti için şablon bulur.
 *
 * Sıra önemli: önce gizraya özel şablon aranır, yoksa tam kök şablonuna
 * DÜŞÜLMEZ. Zayıf bir kökü shlemim şablonuyla çekmek sessizce yanlış
 * biçim üretir — קָנָה yerine קָנַה gibi. Bu yüzden eşleşme yoksa
 * `undefined` döner ve çağıran taraf kökü reddeder.
 */
export function templateFor(binyan: Binyan, gizra: Gizra): BinyanTemplate | undefined {
  if (gizra === 'shlemim') return SHLEMIM_TEMPLATES[binyan];
  const specific = GIZRA_TEMPLATES[`${binyan}:${gizra}`];
  if (specific) return specific;
  // Kalıbın gerçekten bozulmadığı, açıkça listelenmiş birleşimler.
  if (SHLEMIM_COMPATIBLE.has(`${binyan}:${gizra}`)) return SHLEMIM_TEMPLATES[binyan];
  return undefined;
}

/** Bu binyan+gizra çifti motorla üretilebiliyor mu? */
export function isSupported(binyan: Binyan, gizra: Gizra, rootLength = 3): boolean {
  if (rootLength === 4) return supportsQuad(binyan);
  return templateFor(binyan, gizra) !== undefined;
}

/** Bu şablonda mastar var mı? Edilgen binyanlarda yoktur. */
export function hasInfinitive(binyan: Binyan, gizra: Gizra = 'shlemim'): boolean {
  return templateFor(binyan, gizra)?.infinitive !== undefined;
}

export function hasImperative(binyan: Binyan, gizra: Gizra = 'shlemim'): boolean {
  return templateFor(binyan, gizra)?.imperative !== undefined;
}

/**
 * Bir kök+binyan+gizra üçlüsünün tam çekim tablosunu üretir.
 *
 * Gizra verilmezse kök tam kök varsayılır. Yanlış gizra vermek yanlış
 * tablo demektir; `catalog.ts` gizrayı kökten DOĞRULAR ve uyuşmazlığı
 * rapor eder, böylece veri hatası testte görünür.
 */
export function conjugate(
  rootLetters: string[],
  binyan: Binyan,
  gizra: Gizra = 'shlemim',
): ConjugationTable {
  /**
   * Dört harfli kökler (מְרֻבָּעִים) ayrı bir ailedir: תִּכְנֵן, אִרְגֵּן,
   * טִלְפֵּן. Üç harfli şablonlarla çekilemezler, kendi motorlarına gider.
   */
  if (rootLetters.length === 4) return conjugateQuad(rootLetters, binyan);

  if (rootLetters.length !== 3) {
    throw new Error(
      `Çekim motoru üç ya da dört harfli kök bekler, ${rootLetters.length} harf geldi: ` +
        rootLetters.join(''),
    );
  }
  const t = templateFor(binyan, gizra);
  if (!t) {
    throw new Error(
      `Bu birleşim için şablon yok: ${binyan} + ${gizra} (${rootLetters.join('')}). ` +
        `gzarot.ts içine eklenmeli.`,
    );
  }

  /**
   * Kök harfleri sofit biçimde gelmiş olabilir (ק־ו־ם gibi). Çekimde
   * ek aldığı anda harf kelime ortasına düşer ve normal biçime dönmek
   * zorundadır — קָמָה, קָםָה değil. Sofit dönüşümü en sonda, bir kez,
   * `applyFinalForm` tarafından uygulanır.
   */
  const r = rootLetters.map((ch) => normalizeFinals(ch)) as Root3;

  const past: Partial<Record<Person, Conjugation>> = {};
  for (const p of TABLE_PERSONS) past[p] = buildConjugation(t.past(r, p));

  const present = Object.fromEntries(
    PRESENT_ALL.map((s) => [s, buildConjugation(t.present(r, s))]),
  ) as Partial<Record<PresentSlot, Conjugation>>;

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
  return table.past.hu ?? table.present.ms ?? table.infinitive;
}
