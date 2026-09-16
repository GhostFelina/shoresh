/**
 * Hareke (ניקוד) katmanı — yazım biçimleri arası dönüşüm.
 *
 * Üç yazım aynı anda gerekir:
 *  1. `vocalized` — harekeli. Yeni başlayan yalnızca bunu okuyabilir.
 *  2. `plain`     — harekesiz (כתיב מלא). İsrail'de fiilen yazılan biçim;
 *                   sokak tabelası, gazete, WhatsApp hep budur.
 *  3. `translit`  — Latin harfli okunuş, Türkçe ses değerleriyle.
 *
 * Bu dosya SAF kalır: DOM, veri tabanı, ağ yok. Böylece her kural
 * birim testle kilitlenebilir.
 */

/* ------------------------------------------------------------------ *
 * Unicode sabitleri — sihirli sayı bırakmıyoruz
 * ------------------------------------------------------------------ */

export const SHVA = 'ְ'; // ְ
export const HATAF_SEGOL = 'ֱ'; // ֱ
export const HATAF_PATAH = 'ֲ'; // ֲ
export const HATAF_KAMATZ = 'ֳ'; // ֳ
export const HIRIK = 'ִ'; // ִ
export const TZERE = 'ֵ'; // ֵ
export const SEGOL = 'ֶ'; // ֶ
export const PATAH = 'ַ'; // ַ
export const KAMATZ = 'ָ'; // ָ
export const HOLAM = 'ֹ'; // ֹ
export const KUBUTZ = 'ֻ'; // ֻ
export const DAGESH = 'ּ'; // ּ
export const SHIN_DOT = 'ׁ'; // ׁ
export const SIN_DOT = 'ׂ'; // ׂ

/** Ünlü işaretleri — dageş ve şin noktası ünlü DEĞİLDİR, ayrı tutulur. */
export const VOWEL_MARKS = [
  SHVA, HATAF_SEGOL, HATAF_PATAH, HATAF_KAMATZ, HIRIK, TZERE,
  SEGOL, PATAH, KAMATZ, HOLAM, KUBUTZ,
] as const;

/** Harekesizleştirmede silinecek her şey. */
const ALL_MARKS = new Set<string>([...VOWEL_MARKS, DAGESH, SHIN_DOT, SIN_DOT]);

/** Bir karakter hareke/nokta mı? */
export const isMark = (ch: string): boolean => ALL_MARKS.has(ch);

/** Begadkefat — dageş kal alıp sesi değişen altı harf. */
export const BEGADKEFAT = new Set(['ב', 'ג', 'ד', 'כ', 'פ', 'ת']);

/** Gırtlaksı harfler — dageş almaz, şva yerine hatef alır. */
export const GUTTURALS = new Set(['א', 'ה', 'ח', 'ע']);

/** Sonda biçim değiştiren harfler. */
export const FINAL_MAP: Record<string, string> = {
  כ: 'ך',
  מ: 'ם',
  נ: 'ן',
  פ: 'ף',
  צ: 'ץ',
};

/** Sofit biçimden normal biçime. */
export const UNFINAL_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(FINAL_MAP).map(([k, v]) => [v, k]),
);

/**
 * Kelimenin son harfini sofit biçimine çevirir.
 *
 * NEDEN AYRI FONKSİYON: çekim ekleri kelime sonunu sürekli değiştirir.
 * כָּתַב (sonda ב, sofit yok) → כָּתַבְתִּי (son harf י). Ama
 * שָׁמַר → שׁוֹמֵר değil de מ ile biten bir kökte (שׂם) son harf ם olur.
 * Bu yüzden sofit dönüşümü ekleme bittikten SONRA, tek yerden uygulanır.
 */
export function applyFinalForm(word: string): string {
  const chars = [...word];
  // Son harfi bul — harekeler sondan sonra gelebilir.
  for (let i = chars.length - 1; i >= 0; i--) {
    const ch = chars[i]!;
    if (isMark(ch)) continue;
    const final = FINAL_MAP[ch];
    if (final) chars[i] = final;
    break;
  }
  return chars.join('');
}

/** Sofit biçimleri normale çevirir — karşılaştırma ve arama için. */
export function normalizeFinals(word: string): string {
  return [...word].map((ch) => UNFINAL_MAP[ch] ?? ch).join('');
}

/** Tüm harekeleri siler. Ham "harfler" dizisi bırakır. */
export function stripNiqqud(word: string): string {
  return [...word].filter((ch) => !isMark(ch)).join('');
}

/* ------------------------------------------------------------------ *
 * Segment modeli — ktiv male kuralının çalışabilmesi için
 * ------------------------------------------------------------------ */

/**
 * Üretilen biçim, kök harfleriyle ek/ön ek harflerini AYIRARAK tutulur.
 *
 * NEDEN: Harekesiz yazımda (כתיב מלא) hiriki yod ile yazma kuralı
 * kök harflerinde geçerlidir, ön eklerde değil:
 *   דִּבֵּר   → דיבר   (ד kök harfi, hirik yod alır)
 *   תִּכְתְּבִי → תכתבי  (ת gelecek zaman ön eki, yod ALMAZ)
 *   הִתְלַבֵּשׁ → התלבש  (ה binyan ön eki, yod almaz)
 * Bu ayrım harekeli metinden geriye dönük tahmin edilemez; üretim
 * sırasında biliniyor, o yüzden üretim sırasında işaretleniyor.
 */
export interface Segment {
  text: string;
  /** Ön ek / çekim eki mi? true ise ktiv male yod'u eklenmez. */
  affix: boolean;
}

export const root = (text: string): Segment => ({ text, affix: false });
export const affix = (text: string): Segment => ({ text, affix: true });

/** Segmentleri harekeli tek dizeye birleştirir ve sofit uygular. */
export function toVocalized(segments: Segment[]): string {
  return finalKafShva(applyFinalForm(segments.map((s) => s.text).join('')));
}

/**
 * Kelime sonundaki ך’a sessiz şva ekler: הָלַךְ, חָתַךְ, לְבָרֵךְ.
 *
 * NEDEN AYRI ADIM: Bu şva yalnızca HAREKELİ yazıma aittir; harekesiz
 * yazımda hiçbir işaret bulunmaz. İki yazımı da üreten
 * `applyFinalForm` içine konsaydı harekesiz biçime de sızardı — nitekim
 * ilk denemede tam olarak o oldu ve “harekesizde hareke kalmaz” testi
 * kırmızıya döndü.
 *
 * Koşul: son harf ך ve ardında hiç hareke yoksa. Hareke varsa (ekli
 * -ְךָ gibi) dokunulmaz.
 */
function finalKafShva(word: string): string {
  const chars = [...word];
  const last = chars.at(-1);
  return last === 'ך' ? word + SHVA : word;
}

/**
 * Harekesiz (ktiv male) yazım üretir.
 *
 * Akademi kuralının uygulanan çekirdeği:
 *  - kök harfindeki hirik    → harf + י     (סִפֵּר → סיפר)
 *  - ön/çekim ekindeki hirik → değişmez      (תִּכְתֹּב → תכתוב)
 *  - holam haser             → harf + ו     (יִכְתֹּב → יכתוב)
 *  - kubutz                  → harf + ו     (שֻׁלַּח → שולח)
 *  - kelime içi ünsüz ו      → וו ikizlenir (תָּוֶךְ → תווך)
 * Sonra bütün harekeler silinir.
 */
export function toPlain(segments: Segment[]): string {
  /**
   * Harfleri, ünlü görevindeki ו / י ile ünsüz olanları AYIRARAK biriktiririz.
   * Ayrım şart: kelime ortasındaki ÜNSÜZ ו ikizlenir, ünlü ו ikizlenmez.
   * לִכְתּוֹב'daki ו bir ünlüdür → לכתוב. Ünsüz sayılsaydı לכתווב çıkardı.
   */
  const out: Array<{ ch: string; vocalic: boolean }> = [];
  const push = (ch: string, vocalic = false) => out.push({ ch, vocalic });

  /**
   * Bütün segmentleri TEK diziye düzleştiriyoruz, her karakter kendi
   * "ek mi kök mü" bilgisini taşıyarak.
   *
   * NEDEN DÜZLEŞTİRME ŞART: hirik kararı bir SONRAKİ harfin harekesine
   * bakar, o harf çoğu zaman bir sonraki segmenttedir.
   *   כִּתְבִי → [כִּ][תְ][בִ][י] : כ'nın hiriki, ת'nin şvasını görmeli.
   * Segment segment gezilirse bu bakış segment sınırında körleşir ve
   * כיתבי gibi yanlış yazımlar üretilir.
   */
  const flat: Array<{ ch: string; affix: boolean }> = [];
  for (const seg of segments) {
    for (const ch of seg.text) flat.push({ ch, affix: seg.affix });
  }

  for (let i = 0; i < flat.length; i++) {
    const { ch, affix: isAffix } = flat[i]!;

    if (isMark(ch)) {
      // Hareke: ktiv male harfini gerektiriyor mu?
      if (ch === HIRIK && !isAffix && needsYod(flat, i)) {
        push('י', true);
      } else if (ch === HOLAM) {
        // חוֹלָם מָלֵא zaten ו taşıyor; o ו bir önceki adımda yazıldı.
        const prev = out.at(-1);
        if (prev?.ch === 'ו') prev.vocalic = true;
        // Ardından א geliyorsa "o" sesini o א taşır, ו yazılmaz: יֹאכַל → יאכל.
        else if (nextLetter(flat, i) !== 'א') push('ו', true);
      } else if (ch === KUBUTZ) {
        push('ו', true);
      }
      continue; // hareke işaretinin kendisi harekesiz yazıma geçmez
    }

    // Şuruk (וּ) — ו + dageş birleşimi ünlüdür, ünsüz sayılmaz.
    push(ch, ch === 'ו' && flat[i + 1]?.ch === DAGESH);
  }

  return applyFinalForm(doubleMedialVav(out));
}

/**
 * Kök harfindeki hirik, harekesiz yazımda yod ile yazılır mı?
 *
 * Akademi kuralının işleyen çekirdeği: hirik yod alır, AMA ardından
 * şva nah gelen kapalı hecede almaz.
 *   דִּבֵּר   → דיבר   (ardından בּ + tzere geliyor, şva değil → yod)
 *   כִּתְבִי  → כתבי   (ardından ת + şva geliyor → yod yok)
 *   סִפֵּר   → סיפר   (yod)
 *   הִגִּיעַ → הגיע   (zaten yod var, ikincisi yazılmaz)
 */
/** Verilen konumdan sonraki ilk gerçek harf (hareke değil). */
function nextLetter(flat: Array<{ ch: string }>, from: number): string | undefined {
  for (let i = from + 1; i < flat.length; i++) {
    if (!isMark(flat[i]!.ch)) return flat[i]!.ch;
  }
  return undefined;
}

function needsYod(flat: Array<{ ch: string }>, hirikIndex: number): boolean {
  // Bu harfin kalan işaretlerini atla, sonraki harfi bul.
  let j = hirikIndex + 1;
  while (j < flat.length && isMark(flat[j]!.ch)) j++;

  const nextLetter = flat[j]?.ch;
  if (nextLetter === undefined) return true; // kelime sonu — yod yazılır
  if (nextLetter === 'י') return false; // ardından yod geliyor, ikizlenmez

  // Sonraki harfin işaretleri: şva varsa kapalı hece, yod yazılmaz.
  for (let k = j + 1; k < flat.length && isMark(flat[k]!.ch); k++) {
    if (flat[k]!.ch === SHVA) return false;
  }
  return true;
}


/**
 * Kelime ortasındaki ÜNSÜZ ו ikizlenir (כתיב מלא kuralı).
 * Başta ve sonda ikizlenmez. Ünlü görevindeki ו (וֹ / וּ) zaten
 * `toPlain` içinde üretildiği için buraya tek başına gelmez.
 */
function doubleMedialVav(letters: Array<{ ch: string; vocalic: boolean }>): string {
  const out: string[] = [];
  for (let i = 0; i < letters.length; i++) {
    const cur = letters[i]!;
    out.push(cur.ch);
    const isMedial = i > 0 && i < letters.length - 1;
    // Yalnızca ÜNSÜZ ve kelime ortasındaki ו ikizlenir.
    if (cur.ch === 'ו' && !cur.vocalic && isMedial) out.push('ו');
  }
  return out.join('');
}

/* ------------------------------------------------------------------ *
 * Latin harfli okunuş — Türkçe ses değerleriyle
 * ------------------------------------------------------------------ */

/**
 * NEDEN TÜRKÇE SES DEĞERİ: Uygulamanın dili Türkçe. "chashav" yazımı
 * bir Türk'e "çaşav" dedirtir; doğrusu "haşav". Bu yüzden ş/h/ts
 * kullanılıyor, İngilizce sözlük geleneği (sh/kh/ts) değil.
 */
const CONSONANT_TR: Record<string, string> = {
  א: '', // sessiz taşıyıcı
  ב: 'v', // dageşliyse b — aşağıda ayrıca ele alınır
  ג: 'g',
  ד: 'd',
  ה: 'h',
  ו: 'v',
  ז: 'z',
  ח: 'h', // gırtlaktan, Türkçe "h"ye yakın
  ט: 't',
  י: 'y',
  כ: 'h', // dageşliyse k
  ך: 'h',
  ל: 'l',
  מ: 'm',
  ם: 'm',
  נ: 'n',
  ן: 'n',
  ס: 's',
  ע: '', // modern İvritte sessiz
  פ: 'f', // dageşliyse p
  ף: 'f',
  צ: 'ts',
  ץ: 'ts',
  ק: 'k',
  ר: 'r',
  ש: 'ş', // sin noktalıysa s
  ת: 't',
};

/** Dageş alınca sesi değişen harfler. */
const DAGESH_SOUND: Record<string, string> = { ב: 'b', כ: 'k', פ: 'p' };

const VOWEL_TR: Record<string, string> = {
  [HIRIK]: 'i',
  [TZERE]: 'e',
  [SEGOL]: 'e',
  [PATAH]: 'a',
  [KAMATZ]: 'a',
  [HOLAM]: 'o',
  [KUBUTZ]: 'u',
  [HATAF_SEGOL]: 'e',
  [HATAF_PATAH]: 'a',
  [HATAF_KAMATZ]: 'o',
};

/**
 * Harekeli yazımdan okunuş üretir.
 *
 * Şva kararı — şva na (seslenir) mi şva nah (sessiz) mi:
 *  - kelimenin ilk harfinde  → na  (כְּתֹב = ktov'daki gibi hafif "e")
 *  - iki şva yan yana ise    → ilki nah, ikincisi na
 *  - diğer her yerde         → nah (sessiz)
 * Modern konuşmada şva na çoğu zaman tamamen düşer; bu yüzden
 * kelime başındaki şva "e" olarak değil, boş olarak okunur ve
 * öğrenciye ünsüz kümesi olduğu gibi gösterilir (ktov, şalom değil).
 */
export function transliterate(vocalized: string): string {
  const chars = [...vocalized];
  let out = '';
  let letterIndex = 0;

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    if (isMark(ch)) continue;

    // Bu harfin taşıdığı işaretleri topla.
    const marks: string[] = [];
    let j = i + 1;
    while (j < chars.length && isMark(chars[j]!)) {
      marks.push(chars[j]!);
      j++;
    }

    const base = UNFINAL_MAP[ch] ?? ch;
    const hasDagesh = marks.includes(DAGESH);
    const hasSinDot = marks.includes(SIN_DOT);

    /*
     * Kelime SONUNDAKİ ה sessizdir — yalnızca kendinden önceki ünlüyü
     * taşır: קָנָה "kana" (kanah değil), עוֹשֶׂה "ose" (oseh değil).
     * Ses çıkarması için içinde mappiq denen nokta bulunmalıdır (שֶׁלָּהּ
     * "şela-h"). Bu kural uygulanmazsa bütün ל״ה fiilleri yanlış okunur —
     * ki bunlar İbranicenin en kalabalık fiil sınıfıdır.
     */
    const isLast = chars.slice(j).every(isMark);
    if (base === 'ה' && isLast && !hasDagesh) {
      i = j - 1;
      letterIndex++;
      continue;
    }

    // Ünsüz sesi
    let sound: string;
    if (base === 'ש') sound = hasSinDot ? 's' : 'ş';
    else if (hasDagesh && DAGESH_SOUND[base]) sound = DAGESH_SOUND[base]!;
    else sound = CONSONANT_TR[base] ?? base;

    // ו ve י ünlü görevindeyse ünsüz olarak yazılmaz.
    const isHolamVav = base === 'ו' && marks.includes(HOLAM);
    const isShurukVav = base === 'ו' && hasDagesh && marks.length === 1 && letterIndex > 0;
    if (isHolamVav) {
      out += 'o';
      i = j - 1;
      letterIndex++;
      continue;
    }
    if (isShurukVav) {
      out += 'u';
      i = j - 1;
      letterIndex++;
      continue;
    }

    out += sound;

    // Ünlü sesi
    const vowel = marks.find((m) => m in VOWEL_TR);
    if (vowel) out += VOWEL_TR[vowel]!;

    i = j - 1;
    letterIndex++;
  }

  return out;
}

/** Üç yazımı birden üretir — veri katmanının tek giriş noktası. */
export function buildConjugation(segments: Segment[]): {
  vocalized: string;
  plain: string;
  translit: string;
} {
  const vocalized = toVocalized(segments);
  return {
    vocalized,
    plain: toPlain(segments),
    translit: transliterate(vocalized),
  };
}
