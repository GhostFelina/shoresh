/**
 * Oyun soru üreteçleri.
 *
 * TASARIM: Altı oyunun altısı da AYNI veri havuzundan beslenir — alfabe,
 * harekeler, katalog ve çekim motoru. Oyunlar için ayrı bir "oyun verisi"
 * yazılmıyor; yazılsaydı katalog düzeltildiğinde oyunlar eskide kalırdı.
 *
 * Dosya SAF kalır: rastgelelik dışarıdan enjekte edilebilir bir `rng` ile
 * gelir, böylece testler belirli (deterministik) sonuç alabilir.
 */
import { LETTERS, NIQQUDIM } from '@/data/alefbet';
import { VERBS } from '@/data/catalog';
import { PHRASES } from '@/data/phrases';
import {
  BINYAN_LABEL,
  FORM_LABEL,
  PERSON_LABEL,
  PRESENT_LABEL,
  type CEFR,
  type HebrewVerb,
  type Person,
  type PresentSlot,
} from '@/types/hebrew';

export type GameId =
  | 'harf-avi'
  | 'hareke-ustasi'
  | 'kok-avcisi'
  | 'binyan-esleme'
  | 'zaman-makinesi'
  | 'kulak-testi';

/** Çoktan seçmeli soru — beş oyunun ortak biçimi. */
export interface ChoiceQuestion {
  kind: 'choice';
  /** Soru metni (Türkçe). */
  prompt: string;
  /** Ekranda büyük gösterilecek İbranice (varsa). */
  display?: string;
  /** Seslendirilecek harekesiz metin (varsa). */
  audio?: string;
  /** İbranice gösterim serif yazı tipiyle mi (harf oyunu için). */
  serif?: boolean;
  options: string[];
  /** Doğru seçeneğin `options` içindeki sırası. */
  answer: number;
  /** Seçeneklerin İbranice olup olmadığı — yön (RTL) buna göre ayarlanır. */
  optionsAreHebrew?: boolean;
  /** Cevaptan sonra gösterilen açıklama — asıl öğretim burada. */
  explain: string;
}

/** Yazarak cevaplanan soru. */
export interface TypeQuestion {
  kind: 'type';
  prompt: string;
  display?: string;
  /** İbranice gösterim serif yazı tipiyle mi. */
  serif?: boolean;
  audio?: string;
  /** Kabul edilen cevaplar — harekesiz yazım ve okunuş. */
  accept: string[];
  /** Ekranda gösterilen doğru cevap. */
  answer: string;
  explain: string;
  /** Kademeli ipuçları. */
  hints: string[];
}

export type Question = ChoiceQuestion | TypeQuestion;

export type Rng = () => number;

/* ------------------------------------------------------------------ *
 * Yardımcılar
 * ------------------------------------------------------------------ */

const pick = <T,>(arr: readonly T[], rng: Rng): T => arr[Math.floor(rng() * arr.length)]!;

function shuffle<T>(arr: T[], rng: Rng): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/**
 * Doğru cevabı ve çeldiricileri karıştırıp seçenek listesi kurar.
 *
 * Çeldiriciler ASLA rastgele seçilmez: aynı türden, karıştırılması
 * gerçekten olası adaylardan gelir. Rastgele çeldirici soruyu kolaylaştırır
 * ve öğrenciye hiçbir şey öğretmez — asıl öğrenme "neden bu değil de o"
 * ayrımında.
 */
function buildOptions(
  correct: string,
  pool: string[],
  rng: Rng,
  count = 4,
): { options: string[]; answer: number } {
  const distractors = shuffle(
    [...new Set(pool.filter((x) => x !== correct))],
    rng,
  ).slice(0, count - 1);
  const options = shuffle([correct, ...distractors], rng);
  return { options, answer: options.indexOf(correct) };
}

/** Seviyeye kadar olan fiiller — oyun havuzu. */
function verbPool(level: CEFR): HebrewVerb[] {
  const order: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const max = order.indexOf(level);
  const pool = VERBS.filter((v) => order.indexOf(v.cefr) <= max);
  return pool.length > 0 ? pool : VERBS;
}

/* ================================================================== *
 * 1) HARF AVI — harf tanıma ve karıştırılan harfleri ayırma
 * ================================================================== */

export function harfAvi(rng: Rng): ChoiceQuestion {
  const letter = pick(LETTERS, rng);

  /**
   * Çeldiriciler önce o harfin BİLİNEN karışıklarından gelir (ב/כ, ד/ר).
   * Yoksa alfabeden rastgele tamamlanır. Böylece oyun "harfleri biliyor
   * musun" değil, "hangi ikiliyi karıştırıyorsun" sorusunu sorar.
   */
  const confusables = (letter.confusedWith ?? [])
    .map((id) => LETTERS.find((l) => l.id === id)?.glyph)
    .filter((g): g is string => Boolean(g));
  const pool = [...confusables, ...LETTERS.map((l) => l.glyph)];

  const { options, answer } = buildOptions(letter.glyph, pool, rng);

  return {
    kind: 'choice',
    prompt: `"${letter.nameTr}" harfi hangisi?`,
    options,
    answer,
    optionsAreHebrew: true,
    serif: true,
    explain:
      `${letter.glyph} = ${letter.nameTr} · ses: ${
        letter.sound.withDagesh
          ? `${letter.sound.withDagesh} (noktalı) / ${letter.sound.plain}`
          : letter.sound.plain
      }` + (letter.noteTr ? ` — ${letter.noteTr}` : ''),
  };
}

/* ================================================================== *
 * 2) HAREKE USTASI — harekeli yazıyı doğru okuma
 * ================================================================== */

export function harekeUstasi(rng: Rng, level: CEFR): ChoiceQuestion {
  // Yarı yarıya: hareke işaretinin sesi / gerçek kelimenin okunuşu.
  if (rng() < 0.45) {
    const n = pick(NIQQUDIM, rng);
    const { options, answer } = buildOptions(
      n.sound,
      NIQQUDIM.map((x) => x.sound),
      rng,
    );
    return {
      kind: 'choice',
      prompt: 'Bu hareke hangi sesi verir?',
      display: n.id === 'shuruk' ? n.mark : 'בּ' + n.mark,
      serif: true,
      options,
      answer,
      explain: `${n.nameTr} (${n.nameHe}) = "${n.sound}"${n.noteTr ? ` — ${n.noteTr}` : ''}`,
    };
  }

  const pool = verbPool(level);
  const verb = pick(pool, rng);
  const c = verb.table.present.ms;
  const { options, answer } = buildOptions(
    c.translit,
    pool.map((v) => v.table.present.ms.translit),
    rng,
  );
  return {
    kind: 'choice',
    prompt: 'Bu kelime nasıl okunur?',
    display: c.vocalized,
    audio: c.plain,
    options,
    answer,
    explain: `${c.vocalized} → "${c.translit}" · harekesiz yazımı ${c.plain} · anlamı: ${verb.tr[0]}`,
  };
}

/* ================================================================== *
 * 3) KÖK AVCISI — çekilmiş biçimden üç harfli kökü çıkarma
 *
 * İbranicenin ÇEKİRDEK becerisi budur. Bir sözlükte kelime aramak,
 * bilmediğin bir fiili tahmin etmek, hepsi kökü görebilmeye bağlı.
 * ================================================================== */

export function kokAvcisi(rng: Rng, level: CEFR): ChoiceQuestion {
  const pool = verbPool(level);
  const verb = pick(pool, rng);

  // Kökü en çok gizleyen biçimleri seçiyoruz: ön ekli ve sonekli olanlar.
  const candidates = [
    verb.table.present.mp,
    verb.table.future.hu,
    verb.table.past.ani,
    verb.table.infinitive,
    verb.table.present.fs,
  ].filter(Boolean);
  const form = pick(candidates, rng)!;

  const { options, answer } = buildOptions(
    verb.rootDisplay,
    pool.map((v) => v.rootDisplay),
    rng,
  );

  return {
    kind: 'choice',
    prompt: 'Bu biçimin kökü hangisi?',
    display: form.vocalized,
    audio: form.plain,
    options,
    answer,
    optionsAreHebrew: true,
    explain:
      `${form.vocalized} ("${form.translit}") → kök ${verb.rootDisplay}, ` +
      `binyan ${BINYAN_LABEL[verb.binyan].tr}. Anlamı: ${verb.tr[0]}.`,
  };
}

/* ================================================================== *
 * 4) BİNYAN EŞLEME — kalıbı tanıma
 * ================================================================== */

export function binyanEsleme(rng: Rng, level: CEFR): ChoiceQuestion {
  const pool = verbPool(level);
  const verb = pick(pool, rng);
  const form = pick([verb.table.present.ms, verb.table.past.hu ?? verb.table.present.ms], rng);

  const { options, answer } = buildOptions(
    BINYAN_LABEL[verb.binyan].tr,
    pool.map((v) => BINYAN_LABEL[v.binyan].tr),
    rng,
  );

  return {
    kind: 'choice',
    prompt: 'Bu fiil hangi binyanda?',
    display: form.vocalized,
    audio: form.plain,
    options,
    answer,
    explain:
      `${BINYAN_LABEL[verb.binyan].tr} (${BINYAN_LABEL[verb.binyan].he}) — ` +
      `${BINYAN_LABEL[verb.binyan].sense}. Kök ${verb.rootDisplay}, anlamı "${verb.tr[0]}".`,
  };
}

/* ================================================================== *
 * 5) ZAMAN MAKİNESİ — istenen kişi ve zamanda biçimi ÜRETME
 *
 * Tek yazarak cevaplanan oyun. Tanımak ile üretebilmek aynı şey değildir;
 * çoktan seçmeli bir soru "biliyorum" hissi verir ama konuşurken o biçim
 * ağızdan çıkmaz. Bu oyun o farkı kapatmak için var.
 * ================================================================== */

const TYPE_PERSONS: Person[] = ['ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'atem', 'hem'];
const TYPE_SLOTS: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];

export function zamanMakinesi(rng: Rng, level: CEFR): TypeQuestion {
  const pool = verbPool(level);
  const verb = pick(pool, rng);
  const forms = ['present', 'past', 'future'] as const;
  const form = pick(forms, rng);

  if (form === 'present') {
    const slot = pick(TYPE_SLOTS, rng);
    const c = verb.table.present[slot];
    return {
      kind: 'type',
      prompt: `"${verb.tr[0]}" — şimdiki zaman, ${PRESENT_LABEL[slot].tr}`,
      display: verb.rootDisplay,
      audio: c.plain,
      accept: [c.plain, c.vocalized, c.translit.toLowerCase()],
      answer: c.vocalized,
      explain: `${c.vocalized} · "${c.translit}" · ${BINYAN_LABEL[verb.binyan].tr}`,
      hints: [
        `Binyan: ${BINYAN_LABEL[verb.binyan].tr}`,
        `İlk harfler: ${c.plain.slice(0, 2)}…`,
        `Okunuşu: ${c.translit}`,
      ],
    };
  }

  const person = pick(TYPE_PERSONS, rng);
  const table = form === 'past' ? verb.table.past : verb.table.future;
  const c = table[person] ?? verb.table.present.ms;
  return {
    kind: 'type',
    prompt: `"${verb.tr[0]}" — ${FORM_LABEL[form].tr}, ${PERSON_LABEL[person].tr}`,
    display: verb.rootDisplay,
    audio: c.plain,
    accept: [c.plain, c.vocalized, c.translit.toLowerCase()],
    answer: c.vocalized,
    explain: `${c.vocalized} · "${c.translit}" · ${BINYAN_LABEL[verb.binyan].tr}`,
    hints: [
      `Binyan: ${BINYAN_LABEL[verb.binyan].tr}`,
      `İlk harfler: ${c.plain.slice(0, 2)}…`,
      `Okunuşu: ${c.translit}`,
    ],
  };
}

/* ================================================================== *
 * 6) KULAK TESTİ — duyduğunu anlama
 * ================================================================== */

export function kulakTesti(rng: Rng, level: CEFR): ChoiceQuestion {
  const order: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const max = order.indexOf(level);
  const phrasePool = PHRASES.filter((p) => order.indexOf(p.cefr) <= max);

  // Kalıplar ve fiiller karışık gelsin: biri hazır ifade, diğeri çekim.
  if (phrasePool.length > 3 && rng() < 0.5) {
    const p = pick(phrasePool, rng);
    const { options, answer } = buildOptions(
      p.tr,
      phrasePool.map((x) => x.tr),
      rng,
    );
    return {
      kind: 'choice',
      prompt: 'Ne duydun?',
      audio: p.plain,
      options,
      answer,
      explain: `${p.he} · "${p.translit}" · ${p.tr}${p.literal ? ` (birebir: ${p.literal})` : ''}`,
    };
  }

  const pool = verbPool(level);
  const verb = pick(pool, rng);
  const c = verb.table.present.ms;
  const { options, answer } = buildOptions(
    verb.tr[0]!,
    pool.map((v) => v.tr[0]!),
    rng,
  );
  return {
    kind: 'choice',
    prompt: 'Ne duydun?',
    audio: c.plain,
    options,
    answer,
    explain: `${c.vocalized} · "${c.translit}" · ${verb.tr.join(', ')}`,
  };
}

/* ------------------------------------------------------------------ *
 * Kayıt defteri
 * ------------------------------------------------------------------ */

export interface GameMeta {
  id: GameId;
  title: string;
  he: string;
  /** Ne öğretiyor — kart üzerinde yazan bir cümle. */
  teaches: string;
  /** Neden bu oyun var — kartın altındaki açıklama. */
  why: string;
  /** Mikrofon/hoparlör gerekiyor mu? */
  needsAudio: boolean;
  generate: (rng: Rng, level: CEFR) => Question;
}

export const GAMES: GameMeta[] = [
  {
    id: 'harf-avi',
    title: 'Harf Avı',
    he: 'צַיִד אוֹתִיּוֹת',
    teaches: 'Harf tanıma',
    why: 'Çeldiriciler rastgele değil, o harfin bilinen karıştırıldığı harfler: ב/כ, ד/ר, ה/ח. Oyun "harfleri biliyor musun" değil, "hangi ikiliyi karıştırıyorsun" diye sorar.',
    needsAudio: false,
    generate: (rng) => harfAvi(rng),
  },
  {
    id: 'hareke-ustasi',
    title: 'Hareke Ustası',
    he: 'אַלּוּף הַנִּקּוּד',
    teaches: 'Harekeli okuma',
    why: 'Harekeler ünlüleri taşır. Bu oyun hem işaretin sesini hem de gerçek bir kelimenin okunuşunu sorar — ikisi ayrı beceridir.',
    needsAudio: false,
    generate: (rng, level) => harekeUstasi(rng, level),
  },
  {
    id: 'kok-avcisi',
    title: 'Kök Avcısı',
    he: 'צַיָּד הַשֹּׁרֶשׁ',
    teaches: 'Kökü çıkarma',
    why: 'İbranicenin çekirdek becerisi. Sözlükte kelime aramak, bilmediğin bir fiili tahmin etmek — hepsi kökü görebilmeye bağlı. Sorular kökü en çok gizleyen çekim biçimlerinden seçilir.',
    needsAudio: false,
    generate: (rng, level) => kokAvcisi(rng, level),
  },
  {
    id: 'binyan-esleme',
    title: 'Binyan Eşleme',
    he: 'הַתְאָמַת בִּנְיָן',
    teaches: 'Kalıbı tanıma',
    why: 'Aynı kök yedi kalıpta yedi ayrı anlam verir. Kalıbı tanımak, cümlenin kimin yaptığını mı kime yapıldığını mı anlattığını anlamak demektir.',
    needsAudio: false,
    generate: (rng, level) => binyanEsleme(rng, level),
  },
  {
    id: 'zaman-makinesi',
    title: 'Zaman Makinesi',
    he: 'מְכוֹנַת זְמַן',
    teaches: 'Çekimi üretme',
    why: 'Tek yazarak oynanan oyun. Tanımak ile üretebilmek aynı şey değildir: çoktan seçmeli soru "biliyorum" hissi verir ama konuşurken o biçim ağızdan çıkmaz.',
    needsAudio: false,
    generate: (rng, level) => zamanMakinesi(rng, level),
  },
  {
    id: 'kulak-testi',
    title: 'Kulak Testi',
    he: 'מִבְחַן שְׁמִיעָה',
    teaches: 'Duyduğunu anlama',
    why: 'Yazıyı okumak ile konuşmayı yakalamak ayrı becerilerdir. Bu oyunda ekranda İbranice yazmaz — yalnızca ses vardır.',
    needsAudio: true,
    generate: (rng, level) => kulakTesti(rng, level),
  },
];

export const GAME_BY_ID = new Map(GAMES.map((g) => [g.id, g]));

/** Bir oyun için soru kuyruğu üretir; aynı soru arka arkaya gelmez. */
export function buildQueue(game: GameMeta, level: CEFR, count: number, rng: Rng): Question[] {
  const out: Question[] = [];
  const seen = new Set<string>();
  let guard = 0;

  while (out.length < count && guard < count * 25) {
    guard++;
    const q = game.generate(rng, level);
    const key = `${q.prompt}|${q.display ?? ''}|${q.audio ?? ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(q);
  }
  return out;
}
