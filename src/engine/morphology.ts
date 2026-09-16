/**
 * Çekim şablonlarının ortak dili.
 *
 * Hem tam kök (shlemim) hem zayıf kök (gzarot) şablonları buradaki
 * yardımcıları kullanır. Ayrı dosyada durmasının sebebi dairesel
 * içe aktarmayı kesmek: `binyan.ts` shlemim'i, `gzarot.ts` zayıf
 * kökleri tanımlar, ikisi de buraya bakar, biri diğerine bakmaz.
 */
import {
  BEGADKEFAT,
  DAGESH,
  HIRIK,
  HOLAM,
  KAMATZ,
  PATAH,
  SHIN_DOT,
  SHVA,
  affix,
  root as rt,
  type Segment,
} from './niqqud';
import type { ImperativeSlot, Person, PresentSlot } from '@/types/hebrew';

/** Üç harfli kök. */
export type Root3 = [string, string, string];

/* ------------------------------------------------------------------ *
 * Harf yardımcıları
 * ------------------------------------------------------------------ */

/**
 * Şin/sin noktası.
 *
 * ש harfi iki ayrı ses taşır ve hangisi olduğu YALNIZCA noktadan anlaşılır:
 *   שׁ (sağ üstte nokta) = "ş"   — שָׁמַר "korudu"
 *   שׂ (sol üstte nokta) = "s"   — עָשָׂה "yaptı"
 * Veri tarafı sin harfini 'שׂ' olarak yazar; çıplak 'ש' varsayılan olarak
 * şin sayılır ve noktası burada eklenir. Nokta atlanırsa harekeli metin
 * okunamaz hâle gelir, çünkü öğrenci hangi sesi çıkaracağını bilemez.
 */
export function dot(letter: string): string {
  return letter === 'ש' ? 'ש' + SHIN_DOT : letter;
}

/**
 * Dageş hazak (כפול) — harfi ikizleyen dageş.
 * Pi'el / Pu'al / Hitpa'el kalıplarının ortak imzası ve pe-nun'da
 * düşen נ'nin bıraktığı iz (יִפֹּל).
 */
export function strong(letter: string): string {
  if (letter === 'ש') return 'ש' + DAGESH + SHIN_DOT;
  // Sin olarak gelmişse (שׂ) noktası korunur, dageş harfin hemen ardına girer.
  if (letter.startsWith('ש')) return 'ש' + DAGESH + letter.slice(1);
  return letter + DAGESH;
}

/**
 * Dageş kal — yalnızca begadkefat harflerinde, kelime başında ya da
 * şva nah'tan sonra. לִכְתּוֹב'daki ת bunu alır, לִשְׁמוֹר'daki מ almaz.
 */
export function light(letter: string): string {
  return BEGADKEFAT.has(letter) ? strong(letter) : dot(letter);
}

/** Harfin nokta/hareke taşımayan temel biçimi — karşılaştırma için. */
export const baseLetter = (letter: string): string => letter.charAt(0);

/** Harf + hareke(ler) — dageşsiz. */
export const v = (letter: string, ...marks: string[]): string => dot(letter) + marks.join('');
/** Harf + hareke(ler) — dageş hazak ile. */
export const vs = (letter: string, ...marks: string[]): string => strong(letter) + marks.join('');
/** Harf + hareke(ler) — begadkefat ise dageş kal ile. */
export const vl = (letter: string, ...marks: string[]): string => light(letter) + marks.join('');

/** Holam male — חוֹלָם מָלֵא, yani ו + ֹ. Modern yazımda standart. */
export const HOLAM_MALE = 'ו' + HOLAM;
/** Şuruk — וּ. */
export const SHURUK = 'ו' + DAGESH;
/** Hirik male — ִי. */
export const HIRIK_MALE = HIRIK + 'י';

/* ------------------------------------------------------------------ *
 * Çekim ekleri — bütün binyanlarda ortak
 * ------------------------------------------------------------------ */

/** Geçmiş zaman kişi ekleri. Kök son harfinin harekesi ayrı belirlenir. */
export const PAST_SUFFIX: Record<Person, string> = {
  ani: 'תִּי',
  ata: 'תָּ',
  at: 'תְּ',
  hu: '',
  hi: KAMATZ + 'ה',
  anachnu: 'נוּ',
  atem: 'תֶּם',
  aten: 'תֶּן',
  hem: 'וּ',
};

/**
 * Açık heceden sonra gelen geçmiş zaman ekleri — dageşsiz.
 *
 * NEDEN İKİ TAKIM: Dageş kal, begadkefat harfi ŞVA NAH'tan sonra gelince
 * düşer. Tam kökte durum budur (כָּתַבְ‌תִּי — ב şva nah taşır, ת dageş alır).
 * Ama zayıf köklerde ekten önce bir ÜNLÜ vardır:
 *   קָנִיתִי  (hirik male'den sonra)   — ת dageşsiz
 *   מָצָאתִי  (sessiz א'ten sonra)      — ת dageşsiz
 * Tek takım ek kullanılsaydı bu fiiller קָנִיתִּי diye yanlış çıkardı.
 */
export const PAST_SUFFIX_OPEN: Record<Person, string> = {
  ani: 'תִי',
  ata: 'תָ',
  at: 'ת',
  hu: '',
  hi: KAMATZ + 'ה',
  anachnu: 'נוּ',
  atem: 'תֶם',
  aten: 'תֶן',
  hem: 'וּ',
};

/**
 * Geçmiş zamanda kök son harfinin (R3) harekesi kişiye göre değişir:
 *  - hu           → hareke yok        (כָּתַב)
 *  - hi / hem     → kök sesi düşer    (כָּתְבָה / כָּתְבוּ)
 *  - diğerleri    → şva nah           (כָּתַבְתִּי)
 */
export type PastShape = 'bare' | 'reduced' | 'shva';

export const PAST_SHAPE: Record<Person, PastShape> = {
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
export const FUTURE_PREFIX_LETTER: Record<Person, string> = {
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
export const FUTURE_SUFFIXED = new Set<Person>(['at', 'atem', 'aten', 'hem']);

export const FUTURE_SUFFIX: Partial<Record<Person, string>> = {
  at: HIRIK_MALE,
  atem: SHURUK,
  aten: 'נָה',
  hem: SHURUK,
};

/**
 * Şimdiki zaman kuyruğu — son kök harfi + çoğul eki.
 *
 * Çoğul ekinin ünlüsü SON KÖK HARFİNE yazılır, ekin kendisine değil:
 *   כּוֹתֵב → כּוֹתְבִים   (ב hirik alır, ardından ים)
 *   כּוֹתֵב → כּוֹתְבוֹת   (ב holam alır, ardından ת)
 * Ek dizesi 'ים' / 'ות' diye tek parça tutulursa ünlü iki kez yazılır
 * (כּוֹתְבוֹות gibi). Dişil tekil binyandan binyana değiştiği için
 * burada değil, her şablonun içinde kurulur.
 */
export function presentTail(last: string, s: PresentSlot): Segment[] {
  if (s === 'ms') return [rt(dot(last))];
  if (s === 'mp') return [rt(dot(last) + HIRIK), affix('ים')];
  return [rt(dot(last) + HOLAM_MALE), affix('ת')]; // fp
}

/**
 * ל״ה (lamed-hey) köklerin şimdiki ve gelecek kuyruğu.
 *
 * Son harf ה bir ünsüz değil, ünlü işaretidir: eklerde tamamen düşer.
 *   קוֹנֶה → קוֹנִים (ה yok)   /   קוֹנוֹת (ה yok)
 * Bu yüzden bu köklerde `presentTail` kullanılamaz.
 */
export function lamedHeyPresentTail(s: PresentSlot): Segment[] {
  if (s === 'ms') return [affix('ֶה')]; // segol + ה
  if (s === 'fs') return [affix(KAMATZ + 'ה')];
  if (s === 'mp') return [affix(HIRIK_MALE + 'ם')];
  return [affix(HOLAM_MALE + 'ת')]; // fp
}


/**
 * Hitpa'el metatezi (שיכול אותיות) — ıslıklı kök harfi ile ön ekin ת'si
 * YER DEĞİŞTİRİR. İbranicenin en çok gözden kaçan kurallarından biridir
 * ve uygulanmazsa üretilen fiil yanlış olur:
 *   ס → הִסְתַּדֵּר   (הִתְסַדֵּר değil)
 *   שׁ → הִשְׁתַּמֵּשׁ
 *   צ → הִצְטַדֵּק   (ת vurgulu ט'ye döner)
 *   ז → הִזְדַּקֵּן   (ת sesli ד'ye döner)
 * Hem üç harfli hem ל״ה hitpa'el şablonları buna bakar; tek yerde
 * durmazsa biri düzeltilip diğeri unutulur.
 */
export const METATHESIS: Record<string, string> = {
  ס: 'ת',
  ש: 'ת',
  צ: 'ט',
  ז: 'ד',
};

/**
 * İlk kök harfi diş ünsüzüyse ön ekteki ת YER DEĞİŞTİRMEZ, KAYNAŞIR.
 *
 * ד, ט ve ת ağızda ת ile aynı noktada oluşuyor; iki komşu ses tek bir
 * ikizleşmiş sese düşüyor ve ortada AYRI bir harf kalmıyor:
 *   ט־פ־ל → הִטַּפֵּל   (הִטְטַּפֵּל DEĞİL)
 *   ד־ב־ר → הִדַּבֵּר
 *
 * İlk yazılışta bu iki harf metatez haritasına kendine eşleyecek biçimde
 * konmuştu (ד→ד, ט→ט) ve harf İKİ KEZ yazılıyordu. Hata VERB
 * sayfasının uçtan uca testinde, ekrana dökülen metinde görüldü.
 */
export const ASSIMILATES = new Set(['ד', 'ט', 'ת']);

/** Kökün ilk harfi metatez tetikliyor mu? */
export const swapsWithTav = (letter: string): string | undefined =>
  METATHESIS[letter.charAt(0)];

/** Modern konuşma İvritinde tabloya yazılan kişiler. */
export const TABLE_PERSONS: Person[] = [
  'ani',
  'ata',
  'at',
  'hu',
  'hi',
  'anachnu',
  'atem',
  'hem',
];

export const PRESENT_ALL: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];
export const IMPERATIVE_ALL: ImperativeSlot[] = ['ata', 'at', 'atem'];

/** Bir binyan+gizra çiftinin bütün biçimlerini üreten şablon kümesi. */
export interface BinyanTemplate {
  infinitive?: (r: Root3) => Segment[];
  past: (r: Root3, p: Person) => Segment[];
  present: (r: Root3, s: PresentSlot) => Segment[];
  future?: (r: Root3, p: Person) => Segment[];
  imperative?: (r: Root3, s: ImperativeSlot) => Segment[];
}

/**
 * Gırtlaksı harfler (א ה ח ע) şva taşıyamaz; yerine "hatef" adı verilen
 * yarım hareke alırlar. עָמַד kökünün gelecek zamanı bu yüzden
 * יַעְמֹד değil יַעֲמֹד'dur.
 */
export const HATAF_PATAH_MARK = 'ֲ';

export const shvaOrHatef = (letter: string): string =>
  GUTTURAL_SET.has(letter) ? HATAF_PATAH_MARK : SHVA;

const GUTTURAL_SET = new Set(['א', 'ה', 'ח', 'ע']);

export { affix, rt, PATAH, KAMATZ, SHVA, HIRIK, DAGESH, HOLAM };
export type { Segment };
