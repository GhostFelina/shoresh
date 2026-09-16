/**
 * Zayıf kök şablonları — ikinci parti.
 *
 * NEDEN AYRI DOSYA: `gzarot.ts` ilk elde en sık geçen sınıfları kapsadı
 * ve bin satırı aştı. Burada, katalog genişletilirken motorun REDDETTİĞİ
 * birleşimler var. Reddedilmeleri doğruydu: eksik şablonu tam kök
 * şablonuyla doldurmak, öğrenciye var olmayan bir biçim öğretmek olurdu.
 * Doğru çözüm şablonu yazmak — bu dosya onu yapıyor.
 *
 * Kapsanan birleşimler ve neden gerekli oldukları:
 *   nifal + ל״גרונית    נִפְתַּח, נִשְׁמַע   — tzere yerine patah
 *   nifal + פ״גרונית    נֶעֱצַר, נֶהֱרַג    — ön ek segol; gelecekte tzere ile uzama
 *   nifal + ל״א         נִמְצָא            — א sessizleşir, ek öncesi tzere
 *   hifil + פ״א         הֶאֱמִין           — ön ek segol + hatef
 *   hifil + ל״א         הִמְצִיא           — geçmişte ek öncesi tzere
 *   hitpael + ל״גרונית  הִתְקַלֵּחַ         — son gırtlaksıda patah genuva
 *   piel/hitpael + ע״ר  בֵּרֵךְ, הִצְטָרֵף  — dageş düşer, önceki ünlü uzar
 */
import {
  FUTURE_PREFIX_LETTER,
  FUTURE_SUFFIX,
  FUTURE_SUFFIXED,
  HIRIK_MALE,
  HOLAM_MALE,
  KAMATZ,
  ASSIMILATES,
  METATHESIS,
  PAST_SHAPE,
  PAST_SUFFIX,
  PAST_SUFFIX_OPEN,
  PATAH,
  SHURUK,
  SHVA,
  affix,
  dot,
  light,
  presentTail,
  rt,
  strong,
  v,
  vl,
  vs,
  type BinyanTemplate,
  type Root3,
  type Segment,
} from './morphology';
import { HATAF_PATAH, HATAF_SEGOL, HIRIK, SEGOL, TZERE } from './niqqud';
import type { Binyan, Gizra } from '@/types/hebrew';

type TemplateKey = `${Binyan}:${Gizra}`;

/* ================================================================== *
 * NIFAL + ל״גרונית — son harf ח/ע.
 *
 * Gırtlaksı harf tzere ile bitemez; kalıbın tzere’si patah’a iner:
 * נִכְתַּב/יִכָּתֵב karşısında נִשְׁמַע/יִשָּׁמַע.
 * Dişil tekilde de aynı — נִכְתֶּבֶת ama נִשְׁמַעַת.
 * ================================================================== */

const NIFAL_LAMED_GUTTURAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + HIRIK),
    rt(vs(a, KAMATZ)),
    rt(v(b, PATAH)),
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
    // נִשְׁמַעַת — segol yerine iki patah; gırtlaksı segol taşımaz.
    if (s === 'fs') return [...head, rt(vl(b, PATAH)), rt(v(c, PATAH)), affix('ת')];
    return [...head, rt(vl(b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(vs(a, KAMATZ))];
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(rt(v(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(v(b, PATAH)), rt(dot(c)));
    }
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [affix('ה' + HIRIK), rt(vs(a, KAMATZ))];
    if (s === 'ata') segs.push(rt(v(b, PATAH)), rt(dot(c)));
    else {
      segs.push(rt(v(b, SHVA)), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * NIFAL + פ״גרונית — ilk harf א/ה/ח/ע.
 *
 * İki ayrı şey olur:
 *  1. Geçmiş ve şimdiki zamanda ön ek נִ değil נֶ olur ve gırtlaksı harf
 *     şva yerine hatef segol taşır: נֶעֱצַר, נֶהֱרַג. ח istisna — şva
 *     taşıyabildiği için נֶחְתַּם.
 *  2. Gelecek ve mastarda gırtlaksı dageş alamaz; kaybolan dageşin yerini
 *     ön ekteki ünlü uzaması doldurur: יִכָּתֵב karşısında יֵעָצֵר.
 * ================================================================== */

/** Gırtlaksının şva yerine taşıdığı hareke. ח şva taşıyabilir, ötekiler hayır. */
const headSegol = (letter: string): string => (letter === 'ח' ? SHVA : HATAF_SEGOL);

/**
 * Hatef, ardından şva gelince TAM ünlüye açılır: נֶעֱצַר ama נֶעֶצְרָה.
 * Üst üste iki yarım ünlü okunamayacağı için dilin kendi düzeltmesi.
 */
const headOpened = (letter: string): string => (letter === 'ח' ? SHVA : SEGOL);

/** Gırtlaksı hatef taşıyorsa ardındaki begadkefat dageş kal ALMAZ. */
const afterHead = (head: string, letter: string, ...marks: string[]): string =>
  headSegol(head) === SHVA ? vl(letter, ...marks) : v(letter, ...marks);

const NIFAL_PE_GUTTURAL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + TZERE),
    rt(v(a, KAMATZ)),
    rt(v(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    if (shape === 'reduced') {
      return [
        affix('נ' + SEGOL),
        rt(v(a, headOpened(a))),
        rt(afterHead(a, b, SHVA)),
        rt(dot(c) + (p === 'hi' ? KAMATZ : '')),
        affix(p === 'hi' ? 'ה' : SHURUK),
      ];
    }
    const head: Segment[] = [affix('נ' + SEGOL), rt(v(a, headSegol(a)))];
    if (shape === 'bare') return [...head, rt(afterHead(a, b, PATAH)), rt(dot(c))];
    return [...head, rt(afterHead(a, b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('נ' + SEGOL), rt(v(a, headSegol(a)))];
    if (s === 'fs') {
      return [...head, rt(afterHead(a, b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    }
    return [...head, rt(afterHead(a, b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    // יֵעָצֵר — dageş yerine ön ekte tzere; hirik olsaydı hece kapalı kalırdı.
    const segs: Segment[] = [affix(vl(pre, TZERE)), rt(v(a, KAMATZ))];
    if (FUTURE_SUFFIXED.has(p)) {
      segs.push(rt(v(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!));
    } else {
      segs.push(rt(v(b, TZERE)), rt(dot(c)));
    }
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [affix('ה' + TZERE), rt(v(a, KAMATZ))];
    if (s === 'ata') segs.push(rt(v(b, TZERE)), rt(dot(c)));
    else {
      segs.push(rt(v(b, SHVA)), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * NIFAL + ל״א — son harf א: נִמְצָא.
 *
 * א ses vermez; kendinden önceki ünlüyü uzatır ve kişi eki DAGEŞSİZ
 * gelir. נִכְתַּבְתִּי karşısında נִמְצֵאתִי.
 * ================================================================== */

const NIFAL_LAMED_ALEF: BinyanTemplate = {
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
      segs.push(rt(vl(b, KAMATZ)), rt(dot(c)));
    } else {
      segs.push(rt(vl(b, TZERE)), rt(dot(c)), affix(PAST_SUFFIX_OPEN[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('נ' + HIRIK), rt(v(a, SHVA))];
    if (s === 'fs') return [...head, rt(vl(b, TZERE)), rt(dot(c)), affix('ת')];
    return [...head, rt(vl(b, KAMATZ)), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [affix(vl(pre, p === 'ani' ? SEGOL : HIRIK)), rt(vs(a, KAMATZ))];
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
 * HIFIL + פ״א — ilk harf א: הֶאֱמִין, הֶאֱכִיל.
 *
 * א şva taşıyamaz; hatef alır ve ön ekteki hirik segol’e açılır.
 * הִכְתִּיב karşısında הֶאֱמִין, מַכְתִּיב karşısında מַאֲמִין.
 * ================================================================== */

const HIFIL_PE_ALEF: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA + 'ה' + PATAH),
    rt(v(a, HATAF_PATAH)),
    rt(vl(b) + HIRIK_MALE),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    const segs: Segment[] = [affix('ה' + SEGOL), rt(v(a, HATAF_SEGOL))];
    if (shape === 'reduced') {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c)));
    } else {
      segs.push(rt(vl(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [
      affix('מ' + PATAH),
      rt(v(a, HATAF_PATAH)),
      rt(vl(b) + HIRIK_MALE),
    ];
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [
      affix(vl(pre, PATAH)),
      rt(v(a, HATAF_PATAH)),
      rt(vl(b) + HIRIK_MALE),
      rt(dot(c)),
    ];
    if (FUTURE_SUFFIXED.has(p)) segs.push(affix(FUTURE_SUFFIX[p]!));
    return segs;
  },

  imperative: ([a, b, c], s) => {
    const segs: Segment[] = [affix('ה' + PATAH), rt(v(a, HATAF_PATAH))];
    if (s === 'ata') segs.push(rt(vl(b, TZERE)), rt(dot(c)));
    else {
      segs.push(rt(vl(b) + HIRIK_MALE), rt(dot(c)));
      segs.push(affix(s === 'at' ? HIRIK_MALE : SHURUK));
    }
    return segs;
  },
};

/* ================================================================== *
 * HIFIL + ל״א — son harf א: הִמְצִיא, הִקְרִיא.
 *
 * Tek fark geçmişteki ekli biçimlerde: א sessiz olduğu için önceki ünlü
 * patah değil tzere olur ve ek dageş almaz — הִכְתַּבְתִּי ama הִמְצֵאתִי.
 * ================================================================== */

const HIFIL_LAMED_ALEF: BinyanTemplate = {
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
      segs.push(rt(vl(b, TZERE)), rt(dot(c)), affix(PAST_SUFFIX_OPEN[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + PATAH), rt(v(a, SHVA)), rt(vl(b) + HIRIK_MALE)];
    if (s === 'fs') return [...head, rt(dot(c) + KAMATZ), affix('ה')];
    return [...head, ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const segs: Segment[] = [
      affix(vl(pre, PATAH)),
      rt(v(a, SHVA)),
      rt(vl(b) + HIRIK_MALE),
      rt(dot(c)),
    ];
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
 * HITPAEL — ortak baş kurma.
 *
 * Metatez: ilk kök harfi ıslıklıysa (ס ש צ ז) ön ekteki ת ile yer
 * değiştirir — הִסְתַּדֵּר, הִצְטָרֵף. Kural üç zamanda da aynı işlediği
 * için tek yerde duruyor.
 *
 * `carrierVowel` gövdeden ÖNCEKİ harfin harekesi: normal hitpael’de
 * patah (הִתְלַבֵּשׁ), orta harf ר/א olduğunda kamatz (הִתְקָרֵב).
 */
function hitpaelOpen(r: Root3, head: string, carrierVowel: string): Segment[] {
  /*
   * İlk harf diş ünsüzüyse (ד ט ת) ön ekteki ת yer değiştirmez, YUTULUR:
   * kök harfi ikizleşip gövdenin harekesini üstlenir ve ortada ayrı bir
   * harf kalmaz.
   */
  if (ASSIMILATES.has(r[0])) return [affix(head), rt(strong(r[0]) + carrierVowel)];

  const swapped = METATHESIS[r[0]];
  if (!swapped) return [affix(head + 'ת' + SHVA), rt(v(r[0], carrierVowel))];
  // Yer değiştiren harf gövdenin harekesini üstlenir; ilk kök harfi şva alır.
  return [affix(head), rt(v(r[0], SHVA)), affix(light(swapped) + carrierVowel)];
}

/** Metatezde ilk kök harfi başa taşındığı için gövdede orta ve son harf kalır. */
const hitpaelRest = (r: Root3): [string, string] => [r[1], r[2]];

/* ================================================================== *
 * HITPAEL + ל״גרונית — son harf ח/ע: הִתְקַלֵּחַ, הִתְפַּתֵּחַ.
 *
 * Tek değişiklik son harfte: tzere’den sonra gelen ח/ע patah genuva
 * ("çalınmış patah") alır — yazıda görünür, hecede sayılmaz. Dişil
 * tekilde ise segol yerine patah: מִתְקַלַּחַת.
 * ================================================================== */

const HITPAEL_LAMED_GUTTURAL: BinyanTemplate = {
  infinitive: (r) => {
    const [b, c] = hitpaelRest(r);
    return [
      affix('ל' + SHVA),
      ...hitpaelOpen(r, 'ה' + HIRIK, PATAH),
      rt(vs(b, TZERE)),
      rt(dot(c) + PATAH),
    ];
  },

  past: (r, p) => {
    const [b, c] = hitpaelRest(r);
    const shape = PAST_SHAPE[p];
    const head = hitpaelOpen(r, 'ה' + HIRIK, PATAH);
    if (shape === 'bare') return [...head, rt(vs(b, TZERE)), rt(dot(c) + PATAH)];
    if (shape === 'reduced') {
      return [
        ...head,
        rt(vs(b, SHVA)),
        rt(dot(c) + (p === 'hi' ? KAMATZ : '')),
        affix(p === 'hi' ? 'ה' : SHURUK),
      ];
    }
    return [...head, rt(vs(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: (r, s) => {
    const [b, c] = hitpaelRest(r);
    const head = hitpaelOpen(r, 'מ' + HIRIK, PATAH);
    if (s === 'ms') return [...head, rt(vs(b, TZERE)), rt(dot(c) + PATAH)];
    // מִתְקַלַּחַת — gırtlaksı segol taşımaz, iki patah gelir.
    if (s === 'fs') return [...head, rt(vs(b, PATAH)), rt(v(c, PATAH)), affix('ת')];
    if (s === 'mp') return [...head, rt(vs(b, SHVA)), rt(dot(c) + HIRIK), affix('ים')];
    return [...head, rt(vs(b, SHVA)), rt(dot(c) + HOLAM_MALE), affix('ת')];
  },

  future: (r, p) => {
    const [b, c] = hitpaelRest(r);
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head = hitpaelOpen(r, vl(pre, p === 'ani' ? SEGOL : HIRIK), PATAH);
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(vs(b, SHVA)), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(vs(b, TZERE)), rt(dot(c) + PATAH)];
  },

  imperative: (r, s) => {
    const [b, c] = hitpaelRest(r);
    const head = hitpaelOpen(r, 'ה' + HIRIK, PATAH);
    if (s === 'ata') return [...head, rt(vs(b, TZERE)), rt(dot(c) + PATAH)];
    return [
      ...head,
      rt(vs(b, SHVA)),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/* ================================================================== *
 * ע״ר / ע״א — orta harf ר veya א, pi‘el ailesinde.
 *
 * Bu ailede orta harf dageş hazak taşır: דִּבֵּר, הִתְלַבֵּשׁ. ר ve א dageş
 * alamaz ve ח/ע gibi "sanal ikizleme" de yapmaz; kaybolan dageşin yerini
 * ÖNCEKİ ÜNLÜNÜN UZAMASI doldurur:
 *   hirik → tzere : דִּבֵּר ama בֵּרֵךְ
 *   patah → kamatz: לְדַבֵּר ama לְבָרֵךְ, הִתְלַבֵּשׁ ama הִתְקָרֵב
 *
 * ח/ע ile karıştırılmasın diye ayrı bir gizra: שִׂחֵק (uzama YOK) ile
 * בֵּרֵךְ (uzama VAR) aynı şablonla çekilemez.
 * ================================================================== */

/** ר şva alır, א hatef patah — ikisi de tam ünlü taşıyamaz. */
const midReduced = (letter: string): string => (letter === 'א' ? HATAF_PATAH : SHVA);

const AYIN_RESH_PIEL: BinyanTemplate = {
  infinitive: ([a, b, c]) => [
    affix('ל' + SHVA),
    rt(v(a, KAMATZ)),
    rt(v(b, TZERE)),
    rt(dot(c)),
  ],

  past: ([a, b, c], p) => {
    const shape = PAST_SHAPE[p];
    // בֵּרֵךְ — hirik tzere’ye uzar.
    const segs: Segment[] = [rt(vl(a, TZERE))];
    if (shape === 'reduced') {
      segs.push(rt(v(b, midReduced(b))), rt(dot(c) + (p === 'hi' ? KAMATZ : '')));
      segs.push(affix(p === 'hi' ? 'ה' : SHURUK));
    } else if (shape === 'bare') {
      segs.push(rt(v(b, TZERE)), rt(dot(c)));
    } else {
      segs.push(rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p]));
    }
    return segs;
  },

  present: ([a, b, c], s) => {
    const head: Segment[] = [affix('מ' + SHVA), rt(v(a, KAMATZ))];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    return [...head, rt(v(b, s === 'ms' ? TZERE : midReduced(b))), ...presentTail(c, s)];
  },

  future: ([a, b, c], p) => {
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head: Segment[] = [
      affix(p === 'ani' ? 'א' + HATAF_PATAH : vl(pre, SHVA)),
      rt(v(a, KAMATZ)),
    ];
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, midReduced(b))), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, TZERE)), rt(dot(c))];
  },

  imperative: ([a, b, c], s) => {
    const head: Segment[] = [rt(vl(a, KAMATZ))];
    if (s === 'ata') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    return [
      ...head,
      rt(v(b, midReduced(b))),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

const AYIN_RESH_HITPAEL: BinyanTemplate = {
  infinitive: (r) => {
    const [b, c] = hitpaelRest(r);
    return [
      affix('ל' + SHVA),
      ...hitpaelOpen(r, 'ה' + HIRIK, KAMATZ),
      rt(v(b, TZERE)),
      rt(dot(c)),
    ];
  },

  past: (r, p) => {
    const [b, c] = hitpaelRest(r);
    const shape = PAST_SHAPE[p];
    const head = hitpaelOpen(r, 'ה' + HIRIK, KAMATZ);
    if (shape === 'bare') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    if (shape === 'reduced') {
      return [
        ...head,
        rt(v(b, midReduced(b))),
        rt(dot(c) + (p === 'hi' ? KAMATZ : '')),
        affix(p === 'hi' ? 'ה' : SHURUK),
      ];
    }
    return [...head, rt(v(b, PATAH)), rt(v(c, SHVA)), affix(PAST_SUFFIX[p])];
  },

  present: (r, s) => {
    const [b, c] = hitpaelRest(r);
    const head = hitpaelOpen(r, 'מ' + HIRIK, KAMATZ);
    if (s === 'ms') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    if (s === 'fs') return [...head, rt(v(b, SEGOL)), rt(v(c, SEGOL)), affix('ת')];
    if (s === 'mp') return [...head, rt(v(b, midReduced(b))), rt(dot(c) + HIRIK), affix('ים')];
    return [...head, rt(v(b, midReduced(b))), rt(dot(c) + HOLAM_MALE), affix('ת')];
  },

  future: (r, p) => {
    const [b, c] = hitpaelRest(r);
    const pre = FUTURE_PREFIX_LETTER[p]!;
    const head = hitpaelOpen(r, vl(pre, p === 'ani' ? SEGOL : HIRIK), KAMATZ);
    if (FUTURE_SUFFIXED.has(p)) {
      return [...head, rt(v(b, midReduced(b))), rt(dot(c)), affix(FUTURE_SUFFIX[p]!)];
    }
    return [...head, rt(v(b, TZERE)), rt(dot(c))];
  },

  imperative: (r, s) => {
    const [b, c] = hitpaelRest(r);
    const head = hitpaelOpen(r, 'ה' + HIRIK, KAMATZ);
    if (s === 'ata') return [...head, rt(v(b, TZERE)), rt(dot(c))];
    return [
      ...head,
      rt(v(b, midReduced(b))),
      rt(dot(c)),
      affix(s === 'at' ? HIRIK_MALE : SHURUK),
    ];
  },
};

/**
 * Bu dosyanın kattığı şablonlar. `gzarot.ts` bunları kendi haritasına
 * katar; tek bir yerden okunsun diye ayrı ihraç ediliyor.
 */
export const MORE_TEMPLATES: Partial<Record<TemplateKey, BinyanTemplate>> = {
  'nifal:lamed-guttural': NIFAL_LAMED_GUTTURAL,
  'nifal:pe-guttural': NIFAL_PE_GUTTURAL,
  'nifal:lamed-alef': NIFAL_LAMED_ALEF,
  'hifil:pe-alef': HIFIL_PE_ALEF,
  'hifil:lamed-alef': HIFIL_LAMED_ALEF,
  'hitpael:lamed-guttural': HITPAEL_LAMED_GUTTURAL,
  'piel:ayin-resh': AYIN_RESH_PIEL,
  'hitpael:ayin-resh': AYIN_RESH_HITPAEL,
};
