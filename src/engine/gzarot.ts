/**
 * Zayıf kök (גְּזָרוֹת) şablonları.
 *
 * NEDEN AYRI: Tam kökte (shlemim) üç kök harfi de sağlam ünsüzdür ve
 * kalıp hiç bozulmaz. Ama İbranicenin EN SIK kullanılan fiilleri zayıf
 * köklerdir — קָנָה, קָם, אָכַל, שָׁמַע, יָשַׁב… Bunlarda kök harflerinden
 * biri düşer, ünlüye dönüşür ya da komşusunun harekesini değiştirir.
 * Tam kök şablonuyla çekilirlerse sessizce YANLIŞ biçim üretilir.
 *
 * Her gizra için şablon, anahtarı `${binyan}:${gizra}` olan haritada.
 * Eşleşme yoksa `conjugate()` hata fırlatır; uydurma çekim üretmez.
 *
 * Kapsam dışı kalan kökler (ה־י־ה, ה־ל־כ, נ־ת־ן, ל־ק־ח gibi gerçek
 * düzensizler ve iki zayıflığı birden taşıyanlar) `data/irregular.ts`
 * içinde elle yazılmış tabloyla tutulur.
 */
import {
  DAGESH,
  FUTURE_PREFIX_LETTER,
  FUTURE_SUFFIX,
  FUTURE_SUFFIXED,
  HIRIK,
  HIRIK_MALE,
  HOLAM_MALE,
  KAMATZ,
  METATHESIS,
  PAST_SHAPE,
  PAST_SUFFIX,
  PAST_SUFFIX_OPEN,
  PATAH,
  SHURUK,
  SHVA,
  affix,
  dot,
  lamedHeyPresentTail,
  presentTail,
  rt,
  strong,
  v,
  vl,
  vs,
  type BinyanTemplate,
  type Segment,
} from './morphology';
import { HATAF_PATAH, HATAF_SEGOL, HOLAM, SEGOL, TZERE } from './niqqud';
import type { Binyan, Gizra } from '@/types/hebrew';

type TemplateKey = `${Binyan}:${Gizra}`;

/**
 * Gırtlaksı ilk harfin şva yerine aldığı hareke.
 * א ve ע yarım hareke (hatef) ister; ח ve ה sessiz şva taşıyabilir.
 * Bu yüzden לַעֲבֹד ama לַחְשֹׁב.
 */
const headReduced = (letter: string): string =>
  letter === 'ע' || letter === 'א' ? HATAF_PATAH : SHVA;

const headReducedSegol = (letter: string): string =>
  letter === 'ע' || letter === 'א' ? HATAF_SEGOL : SHVA;

/**
 * פ״גרונית kökünde ikinci harf dageş kal alır mı?
 *
 * Dageş kal yalnızca ŞVA NAH'tan sonra gelir. Gırtlaksı ilk harf hatef
 * (yarım ÜNLÜ) taşıyorsa ortada şva yoktur, dolayısıyla dageş de yoktur:
 *   ע־ב־ד → לַעֲבוֹד   (ע hatef patah taşır → ב dageşsiz)
 *   ח־ב־ר → לַחְבּוֹר   (ח şva nah taşır    → ב dageş alır)
 */
const stemAfterHead = (head: string, letter: string): string =>
  headReduced(head) === SHVA ? vl(letter) : dot(letter);

/* ================================================================== *
 * ל״ה — son harf ה. En kalabalık zayıf sınıf.
 * קָנָה, רָצָה, עָשָׂה, רָאָה, בָּנָה, שָׁתָה, עָנָה, נִסָּה…
 *
 * Buradaki ה bir ünsüz değil, ünlünün yazıdaki taşıyıcısıdır: ek
 * geldiği anda tamamen düşer (קוֹנֶה → קוֹנִים). Mastar da ת ile biter,
 * ה ile değil: לִקְנוֹת.
 * ================================================================== */

const LAMED_HEY_PAAL: BinyanTemplate = {
  infinitive: ([a, b]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(vl(b) + HOLAM_MALE),
    affix('ת'),
  ],

  past: ([a, b], p) => {
    const shape = PAST_SHAPE[p];
    if (shape === 'bare') return [rt(v(a, KAMATZ)), rt(v(b, KAMATZ)), affix('ה')]; // קָנָה
    if (p === 'hi') return [rt(v(a, KAMATZ)), rt(v(b, SHVA)), affix('תָ' + 'ה')]; // קָנְתָה
    if (p === 'hem') return [rt(v(a, KAMATZ)), rt(v(b)), affix(SHURUK)]; // קָנוּ
    // קָנִיתִי — kök ünlüsü hirik male olur, sonra normal kişi eki
    const first = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    return [rt(v(a, first)), rt(v(b) + HIRIK_MALE), affix(PAST_SUFFIX_OPEN[p])];
  },

  present: ([a, b], s) => [rt(vl(a) + HOLAM_MALE), rt(v(b)), ...lamedHeyPresentTail(s)],

  future: ([a, b], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(v(a, SHVA))];
    if (p === 'at') return [...head, rt(v(b) + HIRIK_MALE)]; // תִּקְנִי
    if (FUTURE_SUFFIXED.has(p)) return [...head, rt(v(b)), affix(SHURUK)]; // יִקְנוּ
    return [...head, rt(v(b, SEGOL)), affix('ה')]; // יִקְנֶה
  },

  imperative: ([a, b], s) => {
    const head: Segment[] = [rt(vl(a, SHVA))];
    if (s === 'ata') return [...head, rt(v(b, TZERE)), affix('ה')]; // קְנֵה
    if (s === 'at') return [...head, rt(v(b) + HIRIK_MALE)]; // קְנִי
    return [...head, rt(v(b)), affix(SHURUK)]; // קְנוּ
  },
};

/** ל״ה + pi'el — נִסָּה, חִכָּה, גִּלָּה, שִׁנָּה, קִוָּה, בִּלָּה */
const LAMED_HEY_PIEL: BinyanTemplate = {
  infinitive: ([a, b]) => [affix('ל' + SHVA), rt(v(a, PATAH)), rt(vs(b)) , affix('וֹת')],

  past: ([a, b], p) => {
    const shape = PAST_SHAPE[p];
    if (shape === 'bare') return [rt(vl(a, HIRIK)), rt(vs(b, KAMATZ)), affix('ה')]; // נִסָּה
    if (p === 'hi') return [rt(vl(a, HIRIK)), rt(vs(b, SHVA)), affix('תָה')];
    if (p === 'hem') return [rt(vl(a, HIRIK)), rt(vs(b)), affix(SHURUK)];
    return [rt(vl(a, HIRIK)), rt(vs(b) + HIRIK_MALE), affix(PAST_SUFFIX_OPEN[p])]; // נִסִּיתִי
  },

  present: ([a, b], s) => [
    affix('מ' + SHVA),
    rt(v(a, PATAH)),
    rt(vs(b)),
    ...lamedHeyPresentTail(s),
  ],

  future: ([a, b], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA)),
      rt(v(a, PATAH)),
    ];
    if (p === 'at') return [...head, rt(vs(b) + HIRIK_MALE)];
    if (FUTURE_SUFFIXED.has(p)) return [...head, rt(vs(b)), affix(SHURUK)];
    return [...head, rt(vs(b, SEGOL)), affix('ה')];
  },

  imperative: ([a, b], s) => {
    const head: Segment[] = [rt(vl(a, PATAH))];
    if (s === 'ata') return [...head, rt(vs(b, TZERE)), affix('ה')];
    if (s === 'at') return [...head, rt(vs(b) + HIRIK_MALE)];
    return [...head, rt(vs(b)), affix(SHURUK)];
  },
};

/** ל״ה + hif'il — הֶרְאָה, הִקְנָה, הֶעֱלָה, הִשְׁוָה */
const LAMED_HEY_HIFIL: BinyanTemplate = {
  infinitive: ([a, b]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(v(a, SHVA)),
    rt(vl(b)),
    affix('וֹת'),
  ],

  past: ([a, b], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + HIRIK), rt(v(a, SHVA))];
    if (shape === 'bare') return [...head, rt(vl(b, KAMATZ)), affix('ה')]; // הִקְנָה
    if (p === 'hi') return [...head, rt(vl(b, SHVA)), affix('תָה')];
    if (p === 'hem') return [...head, rt(vl(b)), affix(SHURUK)];
    return [...head, rt(vl(b) + HIRIK_MALE), affix(PAST_SUFFIX_OPEN[p])];
  },

  present: ([a, b], s) => [
    affix('מ' + PATAH),
    rt(v(a, SHVA)),
    rt(vl(b)),
    ...lamedHeyPresentTail(s),
  ],

  future: ([a, b], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, PATAH)), rt(v(a, SHVA))];
    if (p === 'at') return [...head, rt(vl(b) + HIRIK_MALE)];
    if (FUTURE_SUFFIXED.has(p)) return [...head, rt(vl(b)), affix(SHURUK)];
    return [...head, rt(vl(b, SEGOL)), affix('ה')];
  },
};


/**
 * ל״ה hitpa'el başı — metatez burada da geçerlidir.
 * Kök ıslıklı bir harfle başlıyorsa ön ekin ת'si onunla yer değiştirir:
 *   ש־נ־ה → הִשְׁתַּנָּה   (הִתְשַׁנָּה DEĞİL)
 * Üç harfli hitpa'el şablonunda bu kural zaten vardı; ל״ה ailesinde de
 * olmazsa en sık kullanılan "değişmek" fiili yanlış üretilir.
 */
function lamedHeyHitpaelHead(first: string, head: string): Segment[] {
  const swapped = METATHESIS[first];
  if (!swapped) return [affix(head + 'ת' + SHVA)];
  return [affix(head), rt(v(first, SHVA)), affix(swapped + DAGESH + PATAH)];
}

/** Metatezde ilk kök harfi ön eke taşındığı için gövdeden düşer. */
const lamedHeyBody = (a: string, b: string): [string, string] =>
  METATHESIS[a] ? [b, b] : [a, b];

/** ל״ה + hitpa'el — הִתְנַסָּה, הִתְרַצָּה, הִשְׁתַּנָּה, הִתְכַּסָּה */
const LAMED_HEY_HITPAEL: BinyanTemplate = {
  infinitive: ([a, b]) => {
    const [x, y] = lamedHeyBody(a, b);
    const head = lamedHeyHitpaelHead(a, 'ל' + SHVA + 'ה' + HIRIK);
    return METATHESIS[a]
      ? [...head, rt(vs(y)), affix('וֹת')]
      : [...head, rt(v(x, PATAH)), rt(vs(y)), affix('וֹת')];
  },

  past: ([a, b], p) => {
    const shape = PAST_SHAPE[p];
    const head = lamedHeyHitpaelHead(a, 'ה' + HIRIK);
    const [x, y] = lamedHeyBody(a, b);
    const stem: Segment[] = METATHESIS[a] ? [] : [rt(v(x, PATAH))];
    const body = [...head, ...stem];
    if (shape === 'bare') return [...body, rt(vs(y, KAMATZ)), affix('ה')];
    if (p === 'hi') return [...body, rt(vs(y, SHVA)), affix('תָה')];
    if (p === 'hem') return [...body, rt(vs(y)), affix(SHURUK)];
    return [...body, rt(vs(y) + HIRIK_MALE), affix(PAST_SUFFIX_OPEN[p])];
  },

  present: ([a, b], s) => {
    const swapped = METATHESIS[a];
    const [x, y] = lamedHeyBody(a, b);
    const head: Segment[] = swapped
      ? [affix('מ' + HIRIK), rt(v(a, SHVA)), affix(swapped + DAGESH + PATAH)]
      : [affix('מ' + HIRIK + 'ת' + SHVA), rt(v(x, PATAH))];
    return [...head, rt(vs(y)), ...lamedHeyPresentTail(s)];
  },

  future: ([a, b], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const swapped = METATHESIS[a];
    const [x, y] = lamedHeyBody(a, b);
    const prefix = vl(pre, p === 'ani' ? SEGOL : HIRIK);
    const head: Segment[] = swapped
      ? [affix(prefix), rt(v(a, SHVA)), affix(swapped + DAGESH + PATAH)]
      : [affix(prefix + 'ת' + SHVA), rt(v(x, PATAH))];
    if (p === 'at') return [...head, rt(vs(y) + HIRIK_MALE)];
    if (FUTURE_SUFFIXED.has(p)) return [...head, rt(vs(y)), affix(SHURUK)];
    return [...head, rt(vs(y, SEGOL)), affix('ה')];
  },
};

/* ================================================================== *
 * ע״ו / ע״י — "içi boş" kökler. Orta harf ünsüz değil, ünlüdür.
 * קָם / לָקוּם, שָׁר / לָשִׁיר, גָּר, רָץ, טָס, שָׂם
 *
 * Bu köklerin en çarpıcı özelliği: 3. tekil eril GEÇMİŞ ile ŞİMDİKİ
 * zaman aynı yazılır (הוּא קָם = "kalktı" ve "kalkar"). Hangisi olduğu
 * yalnızca cümleden anlaşılır.
 * ================================================================== */

/** Orta harf ו ise şuruk (וּ), י ise hirik male (ִי) okunur. */
const hollowVowel = (mid: string): string => (mid === 'י' ? HIRIK_MALE : SHURUK);

const AYIN_VAV_PAAL: BinyanTemplate = {
  infinitive: ([a, mid, c]) => [
    affix('ל' + KAMATZ),
    rt(vl(a) + hollowVowel(mid)),
    rt(dot(c)),
  ],

  past: ([a, mid, c], p) => {
    void mid;
    const shape = PAST_SHAPE[p];
    if (shape === 'bare') return [rt(vl(a, KAMATZ)), rt(dot(c))]; // קָם
    if (p === 'hi') return [rt(vl(a, KAMATZ)), rt(dot(c) + KAMATZ), affix('ה')]; // קָמָה
    if (p === 'hem') return [rt(vl(a, KAMATZ)), rt(dot(c)), affix(SHURUK)]; // קָמוּ
    // קַמְתִּי — ünlü kısalır, kök harfi şva alır
    return [rt(vl(a, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, mid, c], s) => {
    void mid;
    const head: Segment[] = [rt(vl(a, KAMATZ))];
    if (s === 'ms') return [...head, rt(dot(c))]; // קָם
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')]; // קָמָה
    return [...head, ...presentTail(c, s)]; // קָמִים / קָמוֹת
  },

  future: ([a, mid, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [
      affix(vl(pre, KAMATZ)),
      rt(vl(a) + hollowVowel(mid)),
      rt(dot(c)),
    ];
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },

  imperative: ([a, mid, c], s) => {
    const segs: Segment[] = [rt(vl(a) + hollowVowel(mid)), rt(dot(c))];
    if (s === 'at') segs.push(affix(HIRIK_MALE));
    else if (s === 'atem') segs.push(affix(SHURUK));
    return segs;
  },
};

/* ================================================================== *
 * פ״נ — ilk harf נ. Gelecek zamanda נ DÜŞER ve izini ikinci harfteki
 * dageş olarak bırakır: נָפַל ama יִפֹּל (יִנְפֹּל değil).
 * ================================================================== */

const PE_NUN_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(vl(b) + HOLAM_MALE),
    rt(dot(c)),
  ],

  // Geçmiş ve şimdiki zamanda נ yerinde durur — tam kök gibi çekilir.
  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(vl(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
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
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    void a; // נ gelecek zamanda tamamen düşer
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(strong(b) + SHVA), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(strong(b) + HOLAM_MALE), rt(dot(c))];
  },

  imperative: ([a, b, c], s) => {
    void a; // emir kipinde de נ düşer: פֹּל, גַּשׁ, סַע
    if (s === 'ata') return [rt(vl(b) + HOLAM_MALE), rt(dot(c))];
    return [rt(vl(b, SHVA)), rt(dot(c)), affix(s === 'at' ? HIRIK_MALE : SHURUK)];
  },
};

/* ================================================================== *
 * פ״י — ilk harf י. Gelecek zamanda ve mastarda י düşer:
 * יָשַׁב ama לָשֶׁבֶת / יֵשֵׁב. Mastar ת ile biter.
 * ================================================================== */

const PE_YOD_PAAL: BinyanTemplate = {
  // לָשֶׁבֶת / לָרֶדֶת — yod tamamen düşer, kalıp segol-segol-ת olur
  infinitive: ([, b, c]) => [
    affix('ל' + KAMATZ),
    rt(v(b, SEGOL)),
    rt(v(c, SEGOL)),
    affix('ת'),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(v(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(v(a) + HOLAM_MALE)];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([, b, c], p) => {
    // יֵשֵׁב — yod düşer, ön ek tzere alır
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, TZERE))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, TZERE)), rt(dot(c))];
  },

  imperative: ([, b, c], s) => {
    if (s === 'ata') return [rt(vl(b, TZERE)), rt(dot(c))]; // שֵׁב
    return [rt(vl(b, SHVA)), rt(dot(c)), affix(s === 'at' ? HIRIK_MALE : SHURUK)];
  },
};

/* ================================================================== *
 * פ״א — ilk harf א. Gelecek zamanda ön ekle kaynaşır:
 * אָכַל → יֹאכַל (יֶאֱכַל değil), 1. tekilde tek alef kalır: אֹכַל.
 * ================================================================== */

const PE_ALEF_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SEGOL),
    rt(v(a, HATAF_SEGOL)),
    rt(dot(b) + HOLAM_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(v(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(v(a) + HOLAM_MALE)];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    // 1. tekilde iki alef tek alefe iner: אֹכַל, אֶאֱכַל değil.
    // יֹאכַל — "o" sesini kökün א'i taşır, ו yazılmaz. 1. tekilde ise
    // ön ekin א'i ile kökünki tek harfe iner ve holam male olur: אֹכַל.
    const head: Segment[] =
      p === 'ani' ? [affix('א' + HOLAM_MALE)] : [affix(vl(pre) + HOLAM), rt(v(a))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, PATAH)), rt(dot(c))];
  },

  imperative: ([a, b, c], s) => {
    const head: Segment[] = [rt(v(a, HATAF_PATAH))];
    if (s === 'ata') return [...head, rt(dot(b) + HOLAM_MALE), rt(dot(c))];
    return [...head, rt(v(b, SHVA)), rt(dot(c)), affix(s === 'at' ? HIRIK_MALE : SHURUK)];
  },
};

/* ================================================================== *
 * ל״א — son harf א. Sessizleşir: מָצָא, קָרָא, בָּרָא.
 * Ek geldiğinde şva almaz (מָצָאתִי, מָצַאְתִּי değil).
 * ================================================================== */

const LAMED_ALEF_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(vl(b) + HOLAM_MALE),
    rt(v(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    if (shape === 'bare') return [rt(vl(a, KAMATZ)), rt(v(b, KAMATZ)), rt(v(c))]; // מָצָא
    if (p === 'hi') {
      return [rt(vl(a, KAMATZ)), rt(v(b, SHVA)), rt(v(c, KAMATZ)), affix('ה')];
    }
    if (p === 'hem') return [rt(vl(a, KAMATZ)), rt(v(b, SHVA)), rt(v(c)), affix(SHURUK)];
    // מָצָאתִי — alef sessiz, kendisinden önceki ünlü uzun kalır
    return [rt(vl(a, firstVowel)), rt(v(b, KAMATZ)), rt(v(c)), affix(PAST_SUFFIX_OPEN[p])];
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(vl(a) + HOLAM_MALE)];
    if (s === 'ms') return [...head, rt(v(b, TZERE)), rt(v(c))]; // מוֹצֵא
    if (s === 'fs') return [...head, rt(v(b, TZERE)), rt(v(c)), affix('ת')]; // מוֹצֵאת
    if (s === 'mp') return [...head, rt(v(b, SHVA)), rt(v(c) + HIRIK_MALE), affix('ם')];
    return [...head, rt(v(b, SHVA)), rt(v(c) + HOLAM_MALE), affix('ת')];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(v(a, SHVA))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, SHVA)), rt(v(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, KAMATZ)), rt(v(c))]; // יִמְצָא
  },

  imperative: ([a, b, c], s) => {
    if (s === 'ata') return [rt(vl(a, SHVA)), rt(v(b, KAMATZ)), rt(v(c))]; // מְצָא
    return [
      rt(vl(a, HIRIK)),
      rt(v(b, SHVA)),
      rt(v(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ================================================================== *
 * ל״גרונית — son harf ח veya ע. "Kaçak patah" (patah gnuva) alır:
 * שׁוֹמֵעַ, לִשְׁמוֹעַ. Gelecek zamanda kök ünlüsü patah olur: יִשְׁמַע.
 * ================================================================== */

const LAMED_GUTTURAL_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(vl(b) + HOLAM_MALE),
    rt(v(c, PATAH)), // kaçak patah
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(vl(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, SHVA)), rt(v(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, PATAH)), rt(v(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(vl(a) + HOLAM_MALE)];
    if (s === 'ms') return [...head, rt(v(b, TZERE)), rt(v(c, PATAH))]; // שׁוֹמֵעַ
    if (s === 'fs') return [...head, rt(v(b, PATAH)), rt(v(c, PATAH)), affix('ת')]; // שׁוֹמַעַת
    return [...head, rt(v(b, SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(v(a, SHVA))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, SHVA)), rt(v(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, PATAH)), rt(v(c))]; // יִשְׁמַע
  },

  imperative: ([a, b, c], s) => {
    if (s === 'ata') return [rt(vl(a, SHVA)), rt(v(b, PATAH)), rt(v(c))]; // שְׁמַע
    return [
      rt(vl(a, HIRIK)),
      rt(v(b, SHVA)),
      rt(v(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ================================================================== *
 * פ״גרונית — ilk harf א/ה/ח/ע. Şva taşıyamadığı için yarım hareke
 * (hatef) alır ve ön ek harekesi değişir: יַעֲבֹד, לַעֲבוֹד.
 * ================================================================== */

const PE_GUTTURAL_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + PATAH),
    rt(v(a, headReduced(a))),
    rt(stemAfterHead(a, b) + HOLAM_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? headReduced(a) : KAMATZ;
    const segs: Segment[] = [rt(v(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, SHVA)), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, PATAH)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [rt(v(a) + HOLAM_MALE)];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : SHVA)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    // אֶעֱבֹד / יַעֲבֹד — 1. tekilde segol, diğerlerinde patah
    const preVowel = p === 'ani' ? SEGOL : PATAH;
    const stemHead = p === 'ani' ? headReducedSegol(a) : headReduced(a);
    const head: Segment[] = [affix(vl(pre, preVowel)), rt(v(a, stemHead))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vl(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(stemAfterHead(a, b) + HOLAM_MALE), rt(dot(c))];
  },

  imperative: ([a, b, c], s) => {
    if (s === 'ata') {
      return [rt(v(a, HATAF_PATAH)), rt(dot(b) + HOLAM_MALE), rt(dot(c))];
    }
    return [
      rt(v(a, HIRIK)),
      rt(vl(b, SHVA)),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ================================================================== *
 * ע״גרונית — orta harf gırtlaksı. Dageş ALAMAZ, bu yüzden pi'el'de
 * kalıp bozulur ve önceki ünlü uzar: בֵּרֵךְ (בִּרֵּךְ değil).
 * Pa'al'de ise şva yerine hatef gelir: שָׁאַל → יִשְׁאַל.
 * ================================================================== */

const AYIN_GUTTURAL_PAAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + HIRIK),
    rt(v(a, SHVA)),
    rt(v(b) + HOLAM_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const firstVowel = p === 'atem' || p === 'aten' ? SHVA : KAMATZ;
    const segs: Segment[] = [rt(vl(a, firstVowel))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, headReduced(b))), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
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
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : headReduced(b))), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(v(a, SHVA))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, headReduced(b))), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, PATAH)), rt(dot(c))]; // יִשְׁאַל
  },

  imperative: ([a, b, c], s) => {
    if (s === 'ata') return [rt(vl(a, SHVA)), rt(v(b, PATAH)), rt(dot(c))];
    return [
      rt(vl(a, HIRIK)),
      rt(v(b, headReduced(b))),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};


/* ================================================================== *
 * HİF'İL zayıf aileleri — günlük dilde çok sık, kalıpları ayrı.
 * ================================================================== */

/**
 * הִפְעִיל + ע״ו — הֵבִין, הֵכִין, הֵקִים, הֵעִיר.
 * İçi boş kök hif'ilde ön eke tzere verir ve orta ünlü hirik male olur.
 */
const AYIN_VAV_HIFIL: BinyanTemplate = {
  infinitive: ([a, , c]) => [
    affix('ל' + SHVA + 'ה' + KAMATZ),
    rt(vl(a) + HIRIK_MALE),
    rt(dot(c)),
  ],

  past: ([a, , c], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + TZERE)];
    if (shape === 'bare') return [...head, rt(vl(a) + HIRIK_MALE), rt(dot(c))]; // הֵבִין
    if (p === 'hi') {
      return [...head, rt(vl(a) + HIRIK_MALE), rt(dot(c) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') return [...head, rt(vl(a) + HIRIK_MALE), rt(dot(c)), affix(SHURUK)];
    // הֵבַנְתִּי — ek gelince yod düşer, patah gelir
    return [...head, rt(vl(a, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, , c], s) => {
    const head: Segment[] = [affix('מ' + TZERE), rt(vl(a) + HIRIK_MALE)];
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, , c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, KAMATZ)), rt(vl(a) + HIRIK_MALE), rt(dot(c))];
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },

  imperative: ([a, , c], s) => {
    const segs: Segment[] = [affix('ה' + KAMATZ), rt(vl(a) + HIRIK_MALE), rt(dot(c))];
    if (s === 'at') segs.push(affix(HIRIK_MALE));
    else if (s === 'atem') segs.push(affix(SHURUK));
    return segs;
  },
};

/**
 * הִפְעִיל + פ״גרונית — הֶחְלִיט, הֶעֱבִיר, הֶחְזִיר.
 * Gırtlaksı ilk harf yüzünden ön ek hirik yerine segol alır.
 */
const PE_GUTTURAL_HIFIL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(v(a, headReduced(a))),
    rt(stemAfterHead(a, b) + HIRIK_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + SEGOL), rt(v(a, headReducedSegol(a)))];
    if (shape === 'bare') return [...head, rt(stemAfterHead(a, b) + HIRIK_MALE), rt(dot(c))];
    if (p === 'hi') {
      return [
        ...head,
        rt(stemAfterHead(a, b) + HIRIK_MALE),
        rt(dot(c) + KAMATZ),
        affix('ה'),
      ];
    }
    if (p === 'hem') {
      return [...head, rt(stemAfterHead(a, b) + HIRIK_MALE), rt(dot(c)), affix(SHURUK)];
    }
    return [
      ...head,
      rt(stemAfterHead(a, b) + PATAH),
      rt(v(c, SHVA)),
      affix(PAST_SUFFIX[p]),
    ];
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [
      affix('מ' + PATAH),
      rt(v(a, headReduced(a))),
      rt(stemAfterHead(a, b) + HIRIK_MALE),
    ];
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [
      affix(vl(pre, PATAH)),
      rt(v(a, headReduced(a))),
      rt(stemAfterHead(a, b) + HIRIK_MALE),
      rt(dot(c)),
    ];
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },
};


/**
 * הִפְעִיל + פ״נ — הִכִּיר, הִגִּיעַ, הִצִּיל, הִבִּיט.
 * נ tamamen düşer ve izini ikinci harfteki dageş olarak bırakır.
 */
const PE_NUN_HIFIL: BinyanTemplate = {
  infinitive: ([, b, c]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(strong(b) + HIRIK_MALE),
    rt(dot(c)),
  ],

  past: ([, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + HIRIK)];
    if (shape === 'bare') return [...head, rt(strong(b) + HIRIK_MALE), rt(dot(c))];
    if (p === 'hi') {
      return [...head, rt(strong(b) + HIRIK_MALE), rt(dot(c) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') {
      return [...head, rt(strong(b) + HIRIK_MALE), rt(dot(c)), affix(SHURUK)];
    }
    return [...head, rt(strong(b) + PATAH), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([, b, c], s) => {
    const head: Segment[] = [affix('מ' + PATAH), rt(strong(b) + HIRIK_MALE)];
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, PATAH)), rt(strong(b) + HIRIK_MALE), rt(dot(c))];
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },
};

/**
 * הִפְעִיל + ל״גרונית — הִצְלִיחַ, הִשְׁמִיעַ, הִפְתִּיעַ.
 * Tam kök hif'iliyle aynı, tek farkı son gırtlaksının kaçak patah'ı.
 */
const LAMED_GUTTURAL_HIFIL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(v(a, SHVA)),
    rt(vl(b) + HIRIK_MALE),
    rt(v(c, PATAH)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + HIRIK), rt(v(a, SHVA))];
    if (shape === 'bare') return [...head, rt(vl(b) + HIRIK_MALE), rt(v(c, PATAH))];
    if (p === 'hi') {
      return [...head, rt(vl(b) + HIRIK_MALE), rt(v(c, KAMATZ)), affix('ה')];
    }
    if (p === 'hem') {
      return [...head, rt(vl(b) + HIRIK_MALE), rt(v(c)), affix(SHURUK)];
    }
    return [...head, rt(vl(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + PATAH), rt(v(a, SHVA)), rt(vl(b) + HIRIK_MALE)];
    if (s === 'ms') return [...head, rt(v(c, PATAH))];
    if (s === 'fs') return [...head, rt(v(c, KAMATZ)), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [affix(vl(pre, PATAH)), rt(v(a, SHVA))];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vl(b) + HIRIK_MALE), rt(v(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(vl(b) + HIRIK_MALE), rt(v(c, PATAH))];
  },
};


/* ================================================================== *
 * ע״גרונית pi'el / hitpa'el — orta harf ח veya ע.
 *
 * Bu harfler dageş taşıyamaz. Ama ח ve ע'de "sanal ikizleme" olur:
 * dageş yazılmaz, buna karşılık önceki ünlü de UZAMAZ — kalıbın geri
 * kalanı aynen korunur. שִׂחֵק, הִתְרַחֵץ, נִחֵם böyle çekilir.
 *
 * (א ve ר'de durum farklıdır: orada önceki ünlü uzar — בֵּרֵךְ, תֵּאֵר.
 * O yüzden bu şablon yalnızca ח/ע için kullanılır; א/ר kökleri katalog
 * tarafından reddedilir.)
 * ================================================================== */

const AYIN_GUTTURAL_PIEL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [rt(vl(a, HIRIK))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, headReduced(b))), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, TZERE)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + SHVA), rt(v(a, PATAH))];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : headReduced(b))), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA)),
      rt(v(a, PATAH)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, headReduced(b))), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, TZERE)), rt(dot(c))];
  },

  imperative: ([a, b, c], s) => {
    const head: Segment[] = [rt(vl(a, PATAH))];
    if (s === 'ata') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    return [
      ...head,
      rt(v(b, headReduced(b))),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

const AYIN_GUTTURAL_HITPAEL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + HIRIK + 'ת' + SHVA),
    rt(v(a, PATAH)),
    rt(v(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const head: Segment[] = [affix('ה' + HIRIK + 'ת' + SHVA), rt(v(a, PATAH))];
    if (shape === 'bare') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    if (p === 'hi') {
      return [...head, rt(v(b, headReduced(b))), rt(dot(c) + KAMATZ), affix('ה')];
    }
    if (p === 'hem') {
      return [...head, rt(v(b, headReduced(b))), rt(dot(c)), affix(SHURUK)];
    }
    return [...head, rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + HIRIK + 'ת' + SHVA), rt(v(a, PATAH))];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : headReduced(b))), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(vl(pre, p === 'ani' ? SEGOL : HIRIK) + 'ת' + SHVA),
      rt(v(a, PATAH)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, headReduced(b))), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, TZERE)), rt(dot(c))];
  },
};

/* ------------------------------------------------------------------ *
 * Şablon haritası
 * ------------------------------------------------------------------ */

/**
 * Desteklenen binyan + gizra birleşimleri.
 *
 * Burada OLMAYAN bir birleşim `conjugate()` tarafından reddedilir.
 * Kasıtlı: eksik bir şablonu tam kök şablonuyla doldurmak, öğrenciye
 * var olmayan bir fiil biçimi öğretmek demektir.
 */
export const GIZRA_TEMPLATES: Partial<Record<TemplateKey, BinyanTemplate>> = {
  'paal:lamed-hey': LAMED_HEY_PAAL,
  'piel:lamed-hey': LAMED_HEY_PIEL,
  'hifil:lamed-hey': LAMED_HEY_HIFIL,
  'hitpael:lamed-hey': LAMED_HEY_HITPAEL,

  'paal:ayin-vav': AYIN_VAV_PAAL,

  'paal:pe-nun': PE_NUN_PAAL,
  'paal:pe-yod': PE_YOD_PAAL,
  'paal:pe-alef': PE_ALEF_PAAL,
  'paal:lamed-alef': LAMED_ALEF_PAAL,
  'paal:lamed-guttural': LAMED_GUTTURAL_PAAL,
  'paal:pe-guttural': PE_GUTTURAL_PAAL,
  'paal:ayin-guttural': AYIN_GUTTURAL_PAAL,
  'piel:ayin-guttural': AYIN_GUTTURAL_PIEL,
  'hitpael:ayin-guttural': AYIN_GUTTURAL_HITPAEL,

  'hifil:ayin-vav': AYIN_VAV_HIFIL,
  'hifil:pe-guttural': PE_GUTTURAL_HIFIL,
  'hifil:pe-nun': PE_NUN_HIFIL,
  'hifil:lamed-guttural': LAMED_GUTTURAL_HIFIL,
};

/**
 * Tam kök şablonunun zayıf kökte de DOĞRU olduğu birleşimler.
 *
 * Pi'el ve hitpa'el'de gırtlaksı İLK harf kalıbı bozmaz: o harf zaten
 * tam bir ünlü taşır (חִפֵּשׂ "aradı", הִתְחַתֵּן "evlendi"), araya şva
 * düşmediği için gırtlaksılık hiçbir kurala dokunmaz.
 *
 * Bu liste bir kolaylık değil, bir İDDİADIR: "bu birleşimde shlemim
 * şablonu doğru çekim üretir". Orta ya da son harfi gırtlaksı olanlar
 * burada YOKTUR — orada dageş düşer (בֵּרֵךְ) ya da kaçak patah gerekir
 * (שִׁלֵּחַ), ikisi de ayrı şablon ister.
 */
export const SHLEMIM_COMPATIBLE = new Set<TemplateKey>([
  // Pi'el ailesinde İLK kök harfi kalıba hiç dokunmaz: o harf her zaman
  // tam bir ünlü taşır (חִפֵּשׂ, נִגֵּן, אִחֵר, יִשֵּׁם), araya şva düşmez.
  // Bu yüzden ilk harf zayıf olsa bile tam kök şablonu doğru çekim üretir.
  'piel:pe-guttural',
  'piel:pe-nun',
  'piel:pe-yod',
  'piel:pe-alef',
  'pual:pe-guttural',
  'pual:pe-nun',
  'pual:pe-yod',
  'pual:pe-alef',
  'hitpael:pe-guttural',
  'hitpael:pe-nun',
  'hitpael:pe-yod',
  'hitpael:pe-alef',
  // Nif'al'de ilk harf zaten ön ekin ardından gelir; נ־ ile başlayan kök
  // kalıbı bozmaz (נִכְנַס gibi).
  'nifal:pe-nun',
  'nifal:ayin-guttural',
]);

/** Bu gizra hangi binyanlarda motorla üretilebiliyor? */
export function supportedBinyanim(gizra: Gizra): Binyan[] {
  return (Object.keys(GIZRA_TEMPLATES) as TemplateKey[])
    .filter((k) => k.endsWith(`:${gizra}`))
    .map((k) => k.split(':')[0] as Binyan);
}

export { DAGESH };
