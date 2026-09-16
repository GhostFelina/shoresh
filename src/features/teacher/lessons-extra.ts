/**
 * Öğretmen modu — ikinci parti dersler.
 *
 * NEDEN AYRI DOSYA: `lesson.ts` ilk elde beş ders türü kurdu (binyan
 * şimdiki/geçmiş, zayıf kök, kelime konusu, kalıp) ve yedi yüz satırı
 * aştı. Bu dosya, öğrencinin gerçekten takıldığı ama ilk partide
 * karşılığı olmayan yerleri kapatıyor:
 *
 *   gelecek zaman   — dört ön ek (א־ת־י־נ) ve kişiye göre seçimi
 *   emir kipi       — olumlu emir ile olumsuz emrin AYRI kurulması
 *   aynı kök        — כתב → כָּתַב / נִכְתַּב / הִכְתִּיב / הִתְכַּתֵּב
 *   benzeyen harf   — ב/כ, ד/ר, ה/ח/ת gibi okuma tuzakları
 *   hareke aileleri — hangi işaret hangi sesi veriyor
 *   sayı uyumu      — İbranicenin ters cinsiyet uyumu
 *   edat çekimi     — לִי / לְךָ / לוֹ tablosu
 *   cümle kurma     — sözdizimi, elle yazılmış cümleler üzerinden
 *
 * ÜÇÜ ELLE YAZILDI (sayı, edat, olumsuz emir). Sebebi kestirmecilik
 * değil: bunlar kalıptan TÜRETİLEMEZ. שְׁתֵּי־שְׁנַיִם, לִי־לְךָ־לוֹ
 * dizileri düzensizdir; kuralla üretmeye çalışmak sessizce yanlış biçim
 * üretirdi — motorun fiilde reddettiği şeyin aynısı.
 */
import { VERBS } from '@/data/catalog';
import { LETTERS, NIQQUDIM } from '@/data/alefbet';
import { stripNiqqud } from '@/engine/niqqud';
import { WRITTEN_SENTENCES } from '@/data/sentences';
import {
  BINYAN_LABEL,
  PERSON_LABEL,
  type Binyan,
  type CEFR,
  type Conjugation,
  type HebrewVerb,
  type Person,
} from '@/types/hebrew';
import type { Lesson, LessonQuestion, LessonStep, Piece } from './lesson';

/* ------------------------------------------------------------------ *
 * Ortak yardımcılar
 * ------------------------------------------------------------------ */

export function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const pick = <T,>(arr: readonly T[], rng: () => number): T => arr[Math.floor(rng() * arr.length)] ?? arr[0]!;

function sample<T>(arr: readonly T[], n: number, rng: () => number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  while (out.length < n && pool.length > 0) {
    out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]!);
  }
  return out;
}

const LEVEL_ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
const upTo = (level: CEFR): CEFR[] => LEVEL_ORDER.slice(0, LEVEL_ORDER.indexOf(level) + 1);

const piece = (c: Conjugation, gloss: string): Piece => ({
  vocalized: c.vocalized,
  plain: c.plain,
  translit: c.translit,
  gloss,
});

/**
 * Dersi kurar.
 *
 * Adım sırası HER derste aynı: tanıtım → kural → örnek → birlikte(ler)
 * → tek başına(lar) → özet. Sıra sabit çünkü öğrenme sırası sabit;
 * her dersin kendi düzenini kurması öğrenciyi her derste yeniden
 * yönünü bulmaya zorlardı.
 *
 * Birden çok "birlikte" ve "tek başına" adımı olabiliyor: tek soruluk
 * bir ders konuyu anlatır ama oturtmaz.
 */
export function assemble(opts: {
  id: string;
  title: string;
  subtitle: string;
  level: CEFR;
  intro: { title: string; say: string; lines: string[] };
  rule: { title: string; say: string; lines: string[]; pieces?: Piece[] };
  model: { title: string; say: string; pieces: Piece[]; lines?: string[] };
  guided: LessonQuestion[];
  solo: LessonQuestion[];
  summary: { title: string; say: string; lines: string[]; pieces?: Piece[] };
}): Lesson {
  const steps: LessonStep[] = [
    { kind: 'intro', ...opts.intro },
    { kind: 'rule', ...opts.rule },
    { kind: 'model', ...opts.model },
    ...opts.guided.map(
      (q, i): LessonStep => ({
        kind: 'guided',
        title: opts.guided.length > 1 ? `Birlikte ${i + 1}` : 'Birlikte deneyelim',
        say:
          i === 0
            ? 'Sıra sende. İpucu düğmesi hazır, takılırsan kullan.'
            : 'Bir tane daha. Aynı kuralı uygula.',
        question: q,
      }),
    ),
    ...opts.solo.map(
      (q, i): LessonStep => ({
        kind: 'solo',
        title: opts.solo.length > 1 ? `Tek başına ${i + 1}` : 'Şimdi tek başına',
        say: i === 0 ? 'Bu sefer ipucu yok. Cevabı yaz.' : 'Son soru. Kendine güven.',
        question: q,
      }),
    ),
    { kind: 'summary', ...opts.summary },
  ];
  return { id: opts.id, title: opts.title, subtitle: opts.subtitle, level: opts.level, steps };
}


/**
 * Şıkları tekilleştirir ve istenen sayıya tamamlar.
 *
 * NEDEN GEREKLİ: İbranicede farklı kişiler AYNI biçimi paylaşabiliyor —
 * gelecek zamanda "sen (erkek)" ile "o (kadın)" ikisi de תִּכְתֹּב.
 * Doğrudan örneklenirse aynı şık iki kez listeye girer ve soru
 * cevaplanamaz hâle gelir. Test bunu yakaladı.
 *
 * Yeterli farklı seçenek yoksa liste KISA kalır; uydurma bir şık
 * eklemek, var olmayan bir biçimi doğruymuş gibi göstermek olurdu.
 */
function uniqueChoices(correct: string, others: string[], rng: () => number, want = 4): string[] {
  const seen = new Set([correct]);
  const out = [correct];
  for (const o of others) {
    if (out.length >= want) break;
    if (seen.has(o)) continue;
    seen.add(o);
    out.push(o);
  }
  return out.sort(() => rng() - 0.5);
}

function verbsFor(binyan: Binyan, level: CEFR): HebrewVerb[] {
  const levels = new Set(upTo(level));
  return VERBS.filter((v) => v.binyan === binyan && levels.has(v.cefr) && v.gizra === 'shlemim');
}

/* ================================================================== *
 * Gelecek zaman
 * ================================================================== */

const FUTURE_TEACH: Person[] = ['ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'hem'];

export function futureLesson(binyan: Binyan, level: CEFR, rng: () => number): Lesson | null {
  const pool = verbsFor(binyan, level).filter((v) => FUTURE_TEACH.every((p) => v.table.future[p]));
  if (pool.length < 4) return null;

  const label = BINYAN_LABEL[binyan];
  const model = pool[0]!;
  const [g1, g2, s1, s2] = sample(pool.slice(1), 4, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  const forms = FUTURE_TEACH.map((p) => piece(model.table.future[p]!, PERSON_LABEL[p].tr));

  const question = (v: HebrewVerb, p: Person, choices: boolean): LessonQuestion => {
    const a = v.table.future[p]!;
    const wrong = sample(
      FUTURE_TEACH.filter((x) => x !== p),
      3,
      rng,
    ).map((x) => v.table.future[x]!.plain);
    const q: LessonQuestion = {
      prompt: `${v.rootDisplay} (${v.tr[0]}) — "${PERSON_LABEL[p].tr}" gelecek zaman biçimi${choices ? ' hangisi?' : 'ni yaz.'}`,
      answer: a.plain,
      answerVocalized: a.vocalized,
      answerTranslit: a.translit,
      hint: `Ön ek: ${p === 'ani' ? 'א' : p === 'hu' || p === 'hem' ? 'י' : p === 'anachnu' ? 'נ' : 'ת'}. Örnekteki ${model.table.future[p]!.plain} biçimine bak.`,
      why: `Doğrusu ${a.plain} (${a.translit}). Gelecek zamanda kişi SONDAN değil BAŞTAN belli olur; ${PERSON_LABEL[p].tr} için ön ek ${p === 'ani' ? 'א' : p === 'hu' || p === 'hem' ? 'י' : p === 'anachnu' ? 'נ' : 'ת'}.`,
      speak: a.plain,
      source: { kind: 'verb', id: v.id, axis: 'future' },
    };
    if (choices) q.choices = uniqueChoices(a.plain, wrong, rng);
    return q;
  };

  return assemble({
    id: `binyan-future-${binyan}`,
    title: `${label.tr} — gelecek zaman`,
    subtitle: 'Ön ekler: א ת י נ',
    level,
    intro: {
      title: `${label.tr} — gelecek zaman`,
      say: 'Gelecek zaman İbranicenin en düzenli yanıdır. Kişi sondan değil, baştan belli olur.',
      lines: [
        'Geçmiş zamanda kişi SONDAKİ ekten anlaşılır: כָּתַבְתִּי.',
        'Gelecek zamanda kişi BAŞTAKİ harften anlaşılır: אֶכְתֹּב.',
        'Dört ön ek vardır ve hepsi bir kelimede saklıdır: אֵיתָן (א־י־ת־נ).',
      ],
    },
    rule: {
      title: 'Dört ön ek',
      say: 'Ben için alef, o için yod, sen ve o dişil için tav, biz için nun. Hepsi bu.',
      lines: [
        'אֲנִי → א  ·  אַתָּה / אַתְּ / הִיא → ת',
        'הוּא / הֵם → י  ·  אֲנַחְנוּ → נ',
        'Dişil ve çoğul ayrıca SON ek alır: תִּכְתְּבִי, יִכְתְּבוּ.',
        'DİKKAT: "sen (erkek)" ile "o (kadın)" AYNI biçimdir — ikisi de תִּכְתֹּב. Hangisi olduğunu yalnızca cümleden çıkarırsın.',
        'Ön ekleri hatırlamak için: אֵיתָן — dört harfi dört ön ektir.',
      ],
    },
    model: {
      title: `Örnek: ${model.rootDisplay} (${model.tr[0]})`,
      say: 'Tabloyu dinle. Baştaki harfin nasıl değiştiğine dikkat et.',
      pieces: forms,
    },
    guided: [question(g1, 'ani', true), question(g2, 'hu', true)],
    solo: [question(s1, 'at', false), question(s2, 'anachnu', false)],
    summary: {
      title: 'Özet',
      say: 'Gelecek zamanı bir binyanda öğrendiysen ön ekleri hepsinde aynıdır.',
      lines: [
        'Ön ekler: א (ben) · ת (sen, o dişil) · י (o eril, onlar) · נ (biz).',
        'Dişil ve çoğulda ayrıca son ek gelir.',
        'İbranicede gelecek zaman aynı zamanda RİCA kipidir: תִּכְתֹּב hem "yazacaksın" hem "yaz lütfen".',
      ],
      pieces: forms.slice(0, 4),
    },
  });
}

/* ================================================================== *
 * Emir kipi — olumlu ve olumsuz AYRI kurulur
 * ================================================================== */

export function imperativeLesson(binyan: Binyan, level: CEFR, rng: () => number): Lesson | null {
  const pool = verbsFor(binyan, level).filter(
    (v) => v.table.imperative.ata && v.table.imperative.at && v.table.imperative.atem,
  );
  if (pool.length < 4) return null;

  const label = BINYAN_LABEL[binyan];
  const model = pool[0]!;
  const [g1, g2, s1, s2] = sample(pool.slice(1), 4, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  const slots = ['ata', 'at', 'atem'] as const;
  const slotTr = { ata: 'sen (erkek)', at: 'sen (kadın)', atem: 'siz' } as const;
  const forms = slots.map((s) => piece(model.table.imperative[s]!, slotTr[s]));

  const question = (v: HebrewVerb, slot: (typeof slots)[number], choices: boolean): LessonQuestion => {
    const a = v.table.imperative[slot]!;
    const wrong = sample(
      slots.filter((x) => x !== slot),
      2,
      rng,
    ).map((x) => v.table.imperative[x]!.plain);
    const q: LessonQuestion = {
      prompt: `${v.rootDisplay} (${v.tr[0]}) — "${slotTr[slot]}" emir biçimi${choices ? ' hangisi?' : 'ni yaz.'}`,
      answer: a.plain,
      answerVocalized: a.vocalized,
      answerTranslit: a.translit,
      hint: `Emir, gelecek zamandan ön ek atılarak kurulur. Örnek: ${model.table.imperative[slot]!.plain}`,
      why: `Doğrusu ${a.plain} (${a.translit}). Emir kipi gelecek zamanın ön eksiz hâlidir; ${slotTr[slot]} biçimi ${slot === 'at' ? 'ִי' : slot === 'atem' ? 'וּ' : 'eksiz'} ile kurulur.`,
      speak: a.plain,
      source: { kind: 'verb', id: v.id, axis: 'imperative' },
    };
    if (choices) q.choices = uniqueChoices(a.plain, wrong, rng, 3);
    return q;
  };

  const future2ms = model.table.future.ata;

  return assemble({
    id: `binyan-imperative-${binyan}`,
    title: `${label.tr} — emir kipi`,
    subtitle: 'Olumlu ve olumsuz ayrı kurulur',
    level,
    intro: {
      title: `${label.tr} — emir kipi`,
      say: 'Emir kipinin kendi biçimi var ama günlük konuşmada çoğu zaman gelecek zaman kullanılıyor.',
      lines: [
        'Emir, gelecek zamanın ÖN EKSİZ hâlidir.',
        future2ms
          ? `${future2ms.vocalized} ("yazacaksın") → ${model.table.imperative.ata!.vocalized} ("yaz")`
          : 'Gelecek zamandan ön ek atılır.',
        'Günlük konuşmada kibarlık için gelecek zaman tercih edilir; emir kipi sert durur.',
      ],
    },
    rule: {
      title: 'Olumsuz emir AYRI kurulur',
      say: 'En önemli nokta bu: olumsuz emir, emir kipinin başına olumsuzluk getirilerek yapılmaz.',
      lines: [
        'Olumlu: כְּתֹב ("yaz")',
        'Olumsuz: אַל תִּכְתֹּב ("yazma") — אַל + GELECEK zaman.',
        'לֹא תִּכְתֹּב demek "yazmayacaksın" olur; yasak değil, kehanet.',
        'Bu ayrım sık karıştırılır ve cümlenin anlamını tamamen değiştirir.',
      ],
    },
    model: {
      title: `Örnek: ${model.rootDisplay} (${model.tr[0]})`,
      say: 'Üç biçimi dinle.',
      pieces: forms,
    },
    guided: [question(g1, 'ata', true), question(g2, 'at', true)],
    solo: [question(s1, 'atem', false), question(s2, 'ata', false)],
    summary: {
      title: 'Özet',
      say: 'Emir gelecek zamandan türer, olumsuzu אל ile kurulur.',
      lines: [
        'Emir = gelecek zaman eksi ön ek.',
        'Olumsuz emir = אַל + gelecek zaman.',
        'לֹא + gelecek = yasak değil, gelecekte olmayacak demek.',
      ],
      pieces: forms,
    },
  });
}

/* ================================================================== *
 * Aynı kök, farklı binyan
 * ================================================================== */

export function rootAcrossBinyanimLesson(
  root: string,
  level: CEFR,
  rng: () => number,
): Lesson | null {
  const levels = new Set(upTo(level));
  const family = VERBS.filter((v) => v.root.join('') === root && levels.has(v.cefr));
  if (family.length < 3) return null;

  const forms = family.map((v) =>
    piece(v.lemma, `${BINYAN_LABEL[v.binyan].tr} — ${v.tr[0]}`),
  );
  const display = family[0]!.rootDisplay;

  const question = (target: HebrewVerb, choices: boolean): LessonQuestion => {
    const wrong = family.filter((v) => v.id !== target.id).map((v) => v.lemma.plain);
    const q: LessonQuestion = {
      prompt: `${display} kökü — "${target.tr[0]}" anlamı hangi biçimde${choices ? '?' : '? Yaz.'}`,
      answer: target.lemma.plain,
      answerVocalized: target.lemma.vocalized,
      answerTranslit: target.lemma.translit,
      hint: `${BINYAN_LABEL[target.binyan].tr} kalıbı — ${BINYAN_LABEL[target.binyan].sense}.`,
      why: `Doğrusu ${target.lemma.plain} (${target.lemma.translit}), ${BINYAN_LABEL[target.binyan].tr} kalıbı. Aynı kök başka kalıpta başka anlam verir — seçtiğin biçim aynı kökün başka bir yüzü.`,
      speak: target.lemma.plain,
      source: { kind: 'verb', id: target.id, axis: 'past' },
    };
    if (choices) q.choices = uniqueChoices(target.lemma.plain, wrong, rng);
    return q;
  };

  const [g1, g2] = sample(family, 2, rng);
  const [s1, s2] = sample(family, 2, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  return assemble({
    id: `root-family-${root}`,
    title: `${display} — aynı kök, ${family.length} kalıp`,
    subtitle: 'Kalıp anlamı nasıl değiştiriyor',
    level,
    intro: {
      title: `${display} kökü`,
      say: 'İbranicede asıl öğrenme sıçraması burada olur: bir kökü tanıyorsan onun bütün kalıplarını çok daha ucuza öğrenirsin.',
      lines: [
        'Kök anlamın ÇEKİRDEĞİNİ taşır; kalıp o çekirdeğe yön verir.',
        'Aynı kök yapan, yapılan, yaptıran ve kendi kendine yapan hâllere girer.',
        `Bu derste ${display} kökünün ${family.length} kalıbını yan yana göreceksin.`,
      ],
    },
    rule: {
      title: 'Kalıpların anlamı',
      say: 'Yedi kalıbın her birinin bir işi var. Bu kökte hangileri varsa onları göreceğiz.',
      lines: family.map(
        (v) => `${BINYAN_LABEL[v.binyan].tr} — ${BINYAN_LABEL[v.binyan].sense} → ${v.tr[0]}`,
      ),
    },
    model: {
      title: 'Yan yana',
      say: 'Hepsini dinle. Kök harfleri aynı, aralarındaki sesler değişiyor.',
      pieces: forms,
    },
    guided: [question(g1, true), question(g2, true)],
    solo: [question(s1, false), question(s2, false)],
    summary: {
      title: 'Özet',
      say: 'Bir kökü öğrendiğinde bir kelime değil, bir aile öğrenmiş olursun.',
      lines: [
        'Kök = anlamın çekirdeği. Kalıp = o anlama verilen yön.',
        'Yeni bir fiil gördüğünde önce kökünü çıkar; tanıdıksa yarısını zaten biliyorsun.',
        'Harekesiz metinde kalıbı ayırt etmek okumanın anahtarıdır.',
      ],
      pieces: forms,
    },
  });
}

/* ================================================================== *
 * Benzeyen harfler
 * ================================================================== */

export function letterPairLesson(groupId: string, rng: () => number): Lesson | null {
  const group = LETTER_GROUPS.find((g) => g.id === groupId);
  if (!group) return null;

  const letters = group.ids
    .map((id) => LETTERS.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));
  if (letters.length < 2) return null;

  const pieces: Piece[] = letters.map((l) => ({
    vocalized: l.glyph,
    plain: l.glyph,
    translit: l.nameTr,
    gloss: `${l.nameTr} — ses: ${l.sound.withDagesh ? `${l.sound.withDagesh} / ${l.sound.plain}` : l.sound.plain}`,
  }));

  const question = (target: (typeof letters)[number], choices: boolean): LessonQuestion => ({
    prompt: `"${target.nameTr}" harfi hangisi?`,
    answer: target.glyph,
    answerVocalized: target.nameHe,
    answerTranslit: target.nameTr,
    ...(choices ? { choices: letters.map((l) => l.glyph).sort(() => rng() - 0.5) } : {}),
    // `noteTr` isteğe bağlı; boşsa ipucu yerine ses bilgisi veriliyor —
    // boş bir ipucu düğmesi tıklandığında hiçbir şey göstermezdi.
    hint: target.noteTr ?? `Sesi: ${target.sound.plain}`,
    why: `Doğrusu ${target.glyph} (${target.nameTr}). ${target.noteTr ?? `Sesi: ${target.sound.plain}`}`,
    // Harekesiz gidiyor: harekeler sentezleyiciyi yanıltıyor.
    speak: stripNiqqud(target.nameHe),
    source: { kind: 'letter', id: target.id },
  });

  const [g1, g2] = sample(letters, 2, rng);
  const [s1, s2] = sample(letters, 2, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  return assemble({
    id: `letters-${group.id}`,
    title: `${group.title} — benzeyen harfler`,
    subtitle: group.subtitle,
    level: 'A1',
    intro: {
      title: group.title,
      say: 'Bu harfler birbirine benziyor ve okuma hatalarının büyük kısmı buradan çıkıyor.',
      lines: [
        'İbranice okumanın ilk engeli bilinmeyen harfler değil, BENZEYEN harflerdir.',
        group.why,
        'Farkı bir kez gördüğünde bir daha karıştırmazsın.',
      ],
    },
    rule: {
      title: 'Ayırt etme',
      say: group.rule,
      lines: letters.map((l) => `${l.glyph} ${l.nameTr} — ${l.noteTr ?? `sesi: ${l.sound.plain}`}`),
    },
    model: {
      title: 'Yan yana',
      say: 'Harflerin adlarını dinle ve şekillerini karşılaştır.',
      pieces,
    },
    guided: [question(g1, true), question(g2, true)],
    solo: [question(s1, false), question(s2, false)],
    summary: {
      title: 'Özet',
      say: 'Bu grubu ayırt edebiliyorsan okuma hızın gözle görülür artar.',
      lines: [group.rule, 'Harekesiz metinde bu ayrımlar daha da önemli hâle gelir.'],
      pieces,
    },
  });
}

interface LetterGroup {
  id: string;
  title: string;
  subtitle: string;
  ids: string[];
  why: string;
  rule: string;
}

/**
 * Karıştırılan harf grupları.
 *
 * Gruplar `alefbet.ts` içindeki `confusedWith` alanından TÜRETİLEBİLİRDİ
 * ama türetilmedi: o alan "hangisiyle karışır" bilgisini verir, "neden
 * karışır ve nasıl ayırt edilir" bilgisini vermez. Ders için ikincisi
 * gerekli ve o bir öğretme kararı, veri değil.
 */
const LETTER_GROUPS: LetterGroup[] = [
  {
    id: 'bet-kaf',
    title: 'ב · כ',
    subtitle: 'Alt köşe yuvarlak mı köşeli mi',
    ids: ['bet', 'kaf'],
    why: 'İkisi de kapalı bir kutu gibi; fark alt köşede.',
    rule: 'ב alt köşesi KÖŞELİ ve altta küçük bir çıkıntısı var. כ tamamen YUVARLAK, çıkıntısı yok.',
  },
  {
    id: 'dalet-resh',
    title: 'ד · ר',
    subtitle: 'Sağ üst köşe var mı',
    ids: ['dalet', 'resh'],
    why: 'İkisi de sağa doğru bir çatı ve aşağı inen bir bacaktan ibaret.',
    rule: 'ד sağ üstte küçük bir ÇIKINTI taşır. ר yumuşak bir kavisle iner, çıkıntısı yoktur.',
  },
  {
    id: 'he-het-tav',
    title: 'ה · ח · ת',
    subtitle: 'Sol bacak ayrık mı bitişik mi',
    ids: ['hey', 'het', 'tav'],
    why: 'Üçü de iki bacaklı; fark bacakların bağlanma biçiminde.',
    rule: 'ה sol bacağı AYRIK. ח bitişik ve düz. ת sol bacağı içe kıvrık.',
  },
  {
    id: 'vav-zayin-nun',
    title: 'ו · ז · ן',
    subtitle: 'İnce dikey harfler',
    ids: ['vav', 'zayin', 'nun'],
    why: 'Üçü de tek bir dikey çizgiye benziyor.',
    rule: 'ו düz bir çizgi, üstü sağa hafif taşar. ז üstü GENİŞ bir şapka taşır. ן satırın ALTINA iner.',
  },
  {
    id: 'mem-samech',
    title: 'ם · ס',
    subtitle: 'Kapalı ama farklı',
    ids: ['mem-sofit', 'samech'],
    why: 'İkisi de kapalı bir halka.',
    rule: 'ם köşeli bir kare. ס yuvarlak bir daire.',
  },
  {
    id: 'ayin-tzadi',
    title: 'ע · צ',
    subtitle: 'İki kollu harfler',
    ids: ['ayin', 'tsadi'],
    why: 'İkisinde de sol üstten gelen bir kol var.',
    rule: 'ע kolları AYRI, tabanda birleşir. צ kolu gövdeye ORTADAN yapışır.',
  },
  {
    id: 'gimel-nun',
    title: 'ג · נ',
    subtitle: 'Küçük ve kancalı',
    ids: ['gimel', 'nun'],
    why: 'İkisi de küçük ve tek kancalı.',
    rule: 'ג iki bacaklı, sağ bacağı kısa. נ tek bacaklı, tabanı sağa kıvrık.',
  },
];

/* ================================================================== *
 * Hareke aileleri
 * ================================================================== */

export function niqqudGroupLesson(sound: string, rng: () => number): Lesson | null {
  const marks = NIQQUDIM.filter((n) => n.group === sound);
  if (marks.length < 2) return null;

  const pieces: Piece[] = marks.map((n) => ({
    vocalized: 'א' + n.mark,
    plain: stripNiqqud(n.nameHe),
    translit: n.nameTr,
    gloss: `"${n.sound}" sesi — ${n.noteTr ?? 'harfin altına yazılır'}`,
  }));

  const question = (target: (typeof marks)[number], choices: boolean): LessonQuestion => ({
    prompt: `"${target.nameTr}" işareti hangisi?`,
    answer: 'א' + target.mark,
    answerVocalized: 'א' + target.mark,
    answerTranslit: target.nameTr,
    ...(choices ? { choices: marks.map((n) => 'א' + n.mark).sort(() => rng() - 0.5) } : {}),
    /*
     * Bu derste hareke SİLİNMEDEN karşılaştırılıyor.
     *
     * Normalde cevap karşılaştırması harekeleri atar — öğrenci ekran
     * klavyesiyle hareke yazmak zorunda kalmasın diye. Ama bu dersin
     * konusu tam olarak harekenin kendisi: אָ ile אַ harekesiz
     * bakıldığında ikisi de א olur ve iki şık aynı cevaba dönüşür.
     * Test bunu yakaladı.
     */
    exact: true,
    hint: target.noteTr ?? `"${target.sound}" sesini verir.`,
    why: `Doğrusu ${target.nameTr}. ${target.noteTr ?? `"${target.sound}" sesini verir.`}`,
    speak: stripNiqqud(target.nameHe),
    source: { kind: 'niqqud', id: target.id },
  });

  const [g1, g2] = sample(marks, 2, rng);
  const [s1, s2] = sample(marks, 2, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  return assemble({
    id: `niqqud-${sound}`,
    title: `"${sound}" sesi — hareke ailesi`,
    subtitle: `${marks.length} farklı işaret, tek ses`,
    level: 'A1',
    intro: {
      title: `"${sound}" sesini veren işaretler`,
      say: `Modern İbranicede ${marks.length} ayrı işaret aynı "${sound}" sesini veriyor. Bu bir karmaşa değil, tarihin izi.`,
      lines: [
        'Harekeler harfin ALTINA, içine ya da yanına yazılır.',
        `Bu grubun hepsi "${sound}" okunur — aralarındaki fark yazımda, seste değil.`,
        'Eskiden farklı okunurlardı; modern konuşmada ayrım kalktı ama yazım korundu.',
      ],
    },
    rule: {
      title: 'Hangisi nerede',
      say: 'Şekilleri farklı, sesleri aynı. Okurken ayırt etmen gerekmez; yazarken gerekir.',
      lines: marks.map((n) => `${n.nameTr} (${n.nameHe}) — ${n.noteTr ?? `"${n.sound}" sesi`}`),
    },
    model: {
      title: 'Alef üzerinde',
      say: 'Hepsini alef harfi üzerinde gör ve dinle.',
      pieces,
    },
    guided: [question(g1, true), question(g2, true)],
    solo: [question(s1, false), question(s2, false)],
    summary: {
      title: 'Özet',
      say: 'Okurken rahat ol: bu grubun hepsi aynı sesi veriyor.',
      lines: [
        `Bu ailedeki ${marks.length} işaret "${sound}" okunur.`,
        'Harekesiz günlük metinde bu işaretler zaten yazılmaz.',
        'Harekeli metin sözlükte, çocuk kitabında ve şiirde karşına çıkar.',
      ],
      pieces,
    },
  });
}

/* ================================================================== *
 * Sayı uyumu — ELLE yazıldı
 * ================================================================== */

/**
 * NEDEN ELLE: İbranice sayılar düzensizdir ve TERS uyum gösterir —
 * dişil isimle eril görünüşlü sayı kullanılır. Kuralla üretmeye
 * çalışmak sessizce yanlış biçim üretirdi; motorun fiilde reddettiği
 * şeyin aynısı.
 */
export function numberAgreementLesson(rng: () => number): Lesson {
  const table: Array<[string, string, string, string]> = [
    ['1', 'אֶחָד', 'אַחַת', 'ehad / ahat'],
    ['2', 'שְׁנַיִם', 'שְׁתַּיִם', 'şnayim / ştayim'],
    ['3', 'שְׁלוֹשָׁה', 'שָׁלוֹשׁ', 'şloşa / şaloş'],
    ['4', 'אַרְבָּעָה', 'אַרְבַּע', 'arbaa / arba'],
    ['5', 'חֲמִשָּׁה', 'חָמֵשׁ', 'hamişa / hameş'],
    ['6', 'שִׁשָּׁה', 'שֵׁשׁ', 'şişa / şeş'],
    ['7', 'שִׁבְעָה', 'שֶׁבַע', 'şiva / şeva'],
    ['8', 'שְׁמוֹנָה', 'שְׁמוֹנֶה', 'şmona / şmone'],
    ['9', 'תִּשְׁעָה', 'תֵּשַׁע', 'tişa / teşa'],
    ['10', 'עֲשָׂרָה', 'עֶשֶׂר', 'asara / eser'],
  ];

  const pieces: Piece[] = table.slice(0, 6).map(([n, m, f, tr]) => ({
    vocalized: `${m} · ${f}`,
    plain: m.replace(/[֑-ׇ]/g, ''),
    translit: tr,
    gloss: `${n} — eril isimle ${tr.split(' / ')[0]}, dişil isimle ${tr.split(' / ')[1]}`,
  }));

  const row = pick(table.slice(2), rng);
  const row2 = pick(table.slice(2), rng);
  const strip = (s: string) => s.replace(/[֑-ׇ]/g, '');

  const q = (r: typeof row, feminine: boolean, choices: boolean): LessonQuestion => {
    const answer = feminine ? r[2] : r[1];
    const other = feminine ? r[1] : r[2];
    return {
      prompt: `"${r[0]}" sayısı — ${feminine ? 'DİŞİL' : 'ERİL'} bir isimle hangisi kullanılır?${choices ? '' : ' Yaz.'}`,
      answer: strip(answer),
      answerVocalized: answer,
      answerTranslit: r[3].split(' / ')[feminine ? 1 : 0] ?? r[3],
      ...(choices ? { choices: [strip(answer), strip(other)].sort(() => rng() - 0.5) } : {}),
      hint: feminine
        ? 'Dişil isimle KISA biçim kullanılır — ־ָה eki YOKTUR.'
        : 'Eril isimle ־ָה ekli biçim kullanılır. Evet, tersi gibi görünüyor.',
      why: `Doğrusu ${strip(answer)}. İbranicede sayı uyumu TERSTİR: ־ָה ekli biçim ERİL isimle, eksiz biçim DİŞİL isimle gider. ${feminine ? 'שָׁלוֹשׁ בָּנוֹת' : 'שְׁלוֹשָׁה בָּנִים'} gibi.`,
      speak: strip(answer),
    };
  };

  return assemble({
    id: 'sayi-uyumu',
    title: 'Sayılar — ters uyum',
    subtitle: 'İbranicenin en şaşırtıcı kuralı',
    level: 'A2',
    intro: {
      title: 'Sayılarda ters uyum',
      say: 'İbranicede sayılar isme uyar ama ters uyar. Bu kuralı bilmeyen herkes ilk seferde yanlış söyler.',
      lines: [
        'Türkçede sayı değişmez: üç kız, üç oğlan.',
        'İbranicede sayının iki biçimi var ve hangisinin kullanılacağı ismin cinsiyetine bağlı.',
        'Ama beklediğin gibi değil — TERSİ.',
      ],
    },
    rule: {
      title: 'Kural',
      say: 'Dişil görünen ה ekli biçim eril isimle kullanılır. Eksiz görünen biçim dişil isimle kullanılır.',
      lines: [
        'שְׁלוֹשָׁה בָּנִים — üç oğlan (ERİL isim, ־ָה ekli sayı)',
        'שָׁלוֹשׁ בָּנוֹת — üç kız (DİŞİL isim, eksiz sayı)',
        'Yani sayının "dişil görünen" hâli erille, "eril görünen" hâli dişille gider.',
        'Tek istisna 1: אֶחָד erille, אַחַת dişille — burada uyum normal ve sayı isimden SONRA gelir.',
      ],
    },
    model: {
      title: 'Tablo',
      say: 'İlk altı sayıyı dinle. Solda eril, sağda dişil biçim.',
      pieces,
      lines: ['Her satırda: eril isimle kullanılan · dişil isimle kullanılan.'],
    },
    guided: [q(row, false, true), q(row2, true, true)],
    solo: [q(row2, false, false), q(row, true, false)],
    summary: {
      title: 'Özet',
      say: 'Ters uyum. Bunu bir kez oturttuğunda bir daha şaşırmazsın.',
      lines: [
        '־ָה ekli sayı → ERİL isim',
        'Eksiz sayı → DİŞİL isim',
        '1 sayısı kuralın dışında: isimden sonra gelir ve normal uyar.',
        'Sayarken (bir, iki, üç…) dişil biçim kullanılır: אַחַת, שְׁתַּיִם, שָׁלוֹשׁ.',
      ],
      pieces: pieces.slice(0, 3),
    },
  });
}

/* ================================================================== *
 * Edat çekimi — ELLE yazıldı
 * ================================================================== */

/**
 * NEDEN ELLE: Edatların kişi ekleriyle birleşimi düzenli değildir
 * (לִי ama עָלַי, שֶׁלִּי ama אִתִּי) ve her edat kendi tablosunu taşır.
 * Kuralla üretilemez.
 */
export function prepositionLesson(rng: () => number): Lesson {
  const rows: Array<[Person, string, string, string]> = [
    ['ani', 'לִי', 'li', 'bana'],
    ['ata', 'לְךָ', 'leha', 'sana (erkeğe)'],
    ['at', 'לָךְ', 'lah', 'sana (kadına)'],
    ['hu', 'לוֹ', 'lo', 'ona (erkeğe)'],
    ['hi', 'לָהּ', 'la', 'ona (kadına)'],
    ['anachnu', 'לָנוּ', 'lanu', 'bize'],
    ['hem', 'לָהֶם', 'lahem', 'onlara'],
  ];

  const pieces: Piece[] = rows.map(([p, he, tr, gloss]) => ({
    vocalized: he,
    plain: he.replace(/[֑-ׇ]/g, ''),
    translit: tr,
    gloss: `${gloss} · ${PERSON_LABEL[p].tr}`,
  }));

  const strip = (s: string) => s.replace(/[֑-ׇ]/g, '');

  const q = (row: (typeof rows)[number], choices: boolean): LessonQuestion => {
    const wrong = sample(
      rows.filter((r) => r[0] !== row[0]),
      3,
      rng,
    ).map((r) => strip(r[1]));
    return {
      prompt: `"${row[3]}" nasıl söylenir?${choices ? '' : ' Yaz.'}`,
      answer: strip(row[1]),
      answerVocalized: row[1],
      answerTranslit: row[2],
      ...(choices ? { choices: uniqueChoices(strip(row[1]), wrong, rng) } : {}),
      hint: `לְ edatı + ${PERSON_LABEL[row[0]].tr} eki. Okunuşu "${row[2]}".`,
      why: `Doğrusu ${strip(row[1])} (${row[2]}) = ${row[3]}. Edatlar İbranicede ayrı kelime değil, kişiye göre ÇEKİLİR.`,
      speak: strip(row[1]),
    };
  };

  const [g1, g2, s1, s2] = sample(rows, 4, rng);

  return assemble({
    id: 'edat-cekimi',
    title: 'Edatlar kişiye göre çekilir',
    subtitle: 'לִי · לְךָ · לוֹ',
    level: 'A2',
    intro: {
      title: 'Edat da çekilir',
      say: 'İbranicede edatlar ayrı kelime olarak kalmaz; kişiye göre çekilir ve tek kelime olur.',
      lines: [
        'Türkçede "bana" derken "ben" + "-e" birleşir; İbranice de benzer şekilde çalışır.',
        'לְ ("-e, -a") edatı kişi ekleri alarak לִי, לְךָ, לוֹ olur.',
        'Bu çok sık geçer: יֵשׁ לִי ("bende var"), תֵּן לִי ("bana ver"), אָמַרְתִּי לוֹ ("ona dedim").',
      ],
    },
    rule: {
      title: 'Nerede kullanılır',
      say: 'Sahiplik, verme ve söyleme fiillerinin hepsi bu edatla kurulur.',
      lines: [
        'İbranicede "sahip olmak" fiili YOKTUR: יֵשׁ לִי = "bende var".',
        'כּוֹאֵב לִי = "canım acıyor" — birebir "bana ağrıyor".',
        'קָשֶׁה לִי = "bana zor geliyor".',
        'Yani bu tablo bir dilbilgisi süsü değil, günlük konuşmanın omurgası.',
      ],
    },
    model: {
      title: 'Tam tablo',
      say: 'Yedi biçimi dinle ve tekrarla.',
      pieces,
    },
    guided: [q(g1!, true), q(g2!, true)],
    solo: [q(s1!, false), q(s2!, false)],
    summary: {
      title: 'Özet',
      say: 'Bu tabloyu ezberlemek bir dilbilgisi konusu değil, konuşmaya başlamanın şartı.',
      lines: [
        'לְ edatı kişiye göre çekilir: לִי, לְךָ, לָךְ, לוֹ, לָהּ, לָנוּ, לָהֶם.',
        'יֵשׁ לִי / אֵין לִי — İbranicede sahiplik böyle kurulur.',
        'Öbür edatlar (עַל, אֶת, עִם, שֶׁל) da benzer biçimde çekilir ama her birinin kendi tablosu vardır.',
      ],
      pieces: pieces.slice(0, 4),
    },
  });
}

/* ================================================================== *
 * Cümle kurma
 * ================================================================== */

export function sentenceLesson(level: CEFR, rng: () => number): Lesson | null {
  const levels = new Set(upTo(level));
  const byId = new Map(VERBS.map((v) => [v.id, v]));
  const pool = Object.entries(WRITTEN_SENTENCES)
    .filter(([id]) => {
      const v = byId.get(id);
      return v !== undefined && levels.has(v.cefr);
    })
    .flatMap(([, list]) => list)
    .filter((s) => s.note);

  if (pool.length < 6) return null;

  const shown = sample(pool, 5, rng);
  const pieces: Piece[] = shown.map((s) => ({
    vocalized: s.he,
    plain: s.plain,
    translit: s.translit,
    gloss: s.tr,
  }));

  const q = (target: (typeof pool)[number], choices: boolean): LessonQuestion => {
    const wrong = sample(
      pool.filter((s) => s.plain !== target.plain),
      3,
      rng,
    ).map((s) => s.tr);
    return {
      prompt: choices
        ? `${target.plain} — ne demek?`
        : `"${target.tr}" cümlesini İbranice yaz.`,
      answer: choices ? target.tr : target.plain,
      answerVocalized: target.he,
      answerTranslit: target.translit,
      ...(choices ? { choices: uniqueChoices(target.tr, wrong, rng) } : {}),
      hint: target.note ?? `Okunuşu: ${target.translit}`,
      why: `${target.plain} = ${target.tr}. ${target.note ?? ''}`,
      speak: target.plain,
    };
  };

  const [g1, g2] = sample(pool, 2, rng);
  const [s1, s2] = sample(pool, 2, rng);
  if (!g1 || !g2 || !s1 || !s2) return null;

  return assemble({
    id: `cumle-${level.toLowerCase()}`,
    title: `Cümle kurma — ${level}`,
    subtitle: 'Sözdizimi ve fiilin istediği edat',
    level,
    intro: {
      title: 'Kelimeleri cümleye çevirmek',
      say: 'Kelimeleri bilmek cümle kurmaya yetmez. Sıralama ve fiilin istediği edat ayrı bir bilgi.',
      lines: [
        'İbranicede sıra genelde özne — fiil — nesne, Türkçeden farklı.',
        'Belirli nesnenin önüne אֶת gelir; bu Türkçede karşılığı olmayan bir işarettir.',
        'Her fiilin istediği edat farklıdır ve fiille birlikte öğrenilir.',
      ],
    },
    rule: {
      title: 'Üç kural',
      say: 'Sıra, et işareti ve fiilin edatı. Üçü de cümle kurarken aynı anda gerekir.',
      lines: [
        '1. Sıra: אֲנִי קוֹרֵא סֵפֶר — "ben okuyorum kitap".',
        '2. Belirli nesne: אֶת gelir — אֲנִי קוֹרֵא אֶת הַסֵּפֶר.',
        '3. Fiilin edatı: לְחַכּוֹת לְ־ ("beklemek"), לַעֲזֹר לְ־ ("yardım etmek").',
      ],
    },
    model: {
      title: 'Beş cümle',
      say: 'Her cümleyi dinle, altındaki notu oku.',
      pieces,
    },
    guided: [q(g1, true), q(g2, true)],
    solo: [q(s1, false), q(s2, false)],
    summary: {
      title: 'Özet',
      say: 'Cümleyi bütün olarak ezberlemek, kelimeleri tek tek bilmekten daha hızlı ilerletir.',
      lines: [
        'Yeni bir fiil öğrenirken onunla bir CÜMLE öğren; edatı da beraber gelsin.',
        'אֶת yalnızca BELİRLİ nesnede kullanılır.',
        'Sıra bozulabilir ama vurgusu değişir; yeni başlayan düz sırayla kalsın.',
      ],
      pieces: pieces.slice(0, 3),
    },
  });
}

/* ------------------------------------------------------------------ *
 * Bu dosyanın kattığı derslerin listesi
 * ------------------------------------------------------------------ */

export const LETTER_GROUP_IDS = LETTER_GROUPS.map((g) => g.id);
export const LETTER_GROUP_TITLES = new Map(LETTER_GROUPS.map((g) => [g.id, g.title]));
export const NIQQUD_GROUPS = [...new Set(NIQQUDIM.map((n) => n.group))].filter(
  (g) => NIQQUDIM.filter((n) => n.group === g).length >= 2,
);

/** Üç ya da daha çok binyanda geçen kökler — aile dersi için. */
export function familyRoots(level: CEFR): string[] {
  const levels = new Set(upTo(level));
  const counts = new Map<string, number>();
  for (const v of VERBS) {
    if (!levels.has(v.cefr)) continue;
    const r = v.root.join('');
    counts.set(r, (counts.get(r) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= 3)
    .map(([r]) => r)
    .sort();
}

/* ================================================================== *
 * Kalıbı TANIMA — harekesiz metinde binyanı nasıl ayırt edersin
 * ================================================================== */

/**
 * Bu ders öbürlerinden farklı bir soru soruyor.
 *
 * Zaman dersleri "bu kalıp nasıl çekilir" diye sorar. Bu ders "önümdeki
 * kelime hangi kalıpta" diye sorar — okurken gereken beceri budur.
 * Harekesiz metinde ünlüler görünmez; kalıbı ele veren şey EK harfler:
 * מ, ה, נ, ת. Bunu tanıyan öğrenci hiç görmediği bir fiilin anlamını
 * bile tahmin edebilir.
 */
const BINYAN_SIGNS: Partial<Record<Binyan, { signs: string[]; how: string[] }>> = {
  paal: {
    signs: ['Ek harf YOK'],
    how: [
      'Şimdiki zamanda üç kök harfi çıplak durur: כותב, לומד, אוכל.',
      'Geçmişte de eksizdir: כתב, למד.',
      'Kelimede fazladan harf görmüyorsan büyük ihtimalle pa‘al.',
    ],
  },
  nifal: {
    signs: ['נ (geçmiş, şimdiki)', 'ה (mastar, gelecek)'],
    how: [
      'Geçmiş ve şimdiki zamanda başta נ: נכתב, נמצא.',
      'Mastarda להי־ ile başlar: להיכתב, להימצא.',
      'Anlamı çoğu zaman edilgen: "yazıldı", "bulundu".',
    ],
  },
  piel: {
    signs: ['מ (şimdiki)', 'Ek harf yok (geçmiş)'],
    how: [
      'Şimdiki zamanda başta מ: מדבר, מספר, מלמד.',
      'Geçmişte eksizdir ama ortadaki harf ikizdir: דיבר, סיפר.',
      'Harekesiz yazımda ikizleşme י ile görünür: דיבר, לימד.',
    ],
  },
  hifil: {
    signs: ['מ (şimdiki)', 'ה (geçmiş, mastar)'],
    how: [
      'Şimdiki zamanda מ + kök: מכתיב, מסביר, מתחיל.',
      'Geçmişte ה ile başlar: הכתיב, הסביר.',
      'Ortada çoğu zaman י görünür: מתחיל, הסביר → hif‘il işareti.',
      'Anlamı ettirgendir: "yazdırdı", "başlattı".',
    ],
  },
  hitpael: {
    signs: ['מת (şimdiki)', 'הת (geçmiş, mastar)'],
    how: [
      'En kolay tanınan kalıp: başta מת ya da הת.',
      'מתלבש, מתקלח, התחתן, להתראות.',
      'Anlamı dönüşlü ya da karşılıklı: "kendi kendine yapar".',
      'İlk kök harfi ıslıklıysa (ס ש צ ז) harfler yer değiştirir: הסתכל, הצטרף.',
    ],
  },
};

export function binyanSignLesson(binyan: Binyan, level: CEFR, rng: () => number): Lesson | null {
  const info = BINYAN_SIGNS[binyan];
  if (!info) return null;

  const levels = new Set(upTo(level));
  const mine = VERBS.filter((v) => v.binyan === binyan && levels.has(v.cefr) && v.table.present.ms);
  const others = VERBS.filter(
    (v) => v.binyan !== binyan && levels.has(v.cefr) && v.table.present.ms,
  );
  if (mine.length < 4 || others.length < 6) return null;

  const label = BINYAN_LABEL[binyan];
  const shown = sample(mine, 5, rng);
  const pieces = shown.map((v) =>
    piece(v.table.present.ms!, `${v.tr[0]} · ${v.rootDisplay}`),
  );

  const question = (choices: boolean): LessonQuestion => {
    const target = pick(mine, rng);
    const wrong = sample(others, 3, rng).map((v) => v.table.present.ms!.plain);
    const a = target.table.present.ms!;
    const q: LessonQuestion = {
      prompt: choices
        ? `Hangisi ${label.tr} kalıbında?`
        : `${target.rootDisplay} kökünün ${label.tr} kalıbındaki şimdiki zaman biçimini yaz.`,
      answer: a.plain,
      answerVocalized: a.vocalized,
      answerTranslit: a.translit,
      hint: `${label.tr} işareti: ${info.signs.join(' · ')}`,
      why: `Doğrusu ${a.plain} (${a.translit}). ${label.tr} kalıbının işareti: ${info.signs.join(' · ')}. Öbür seçenekler başka kalıplardan.`,
      speak: a.plain,
      source: { kind: 'verb', id: target.id, axis: 'present' },
    };
    if (choices) q.choices = uniqueChoices(a.plain, wrong, rng);
    return q;
  };

  return assemble({
    id: `binyan-sign-${binyan}`,
    title: `${label.tr} — kalıbı tanı`,
    subtitle: 'Harekesiz metinde ayırt etme',
    level,
    intro: {
      title: `${label.tr} nasıl tanınır`,
      say: 'Bu ders çekmeyi değil TANIMAYI öğretiyor. Okurken asıl gereken beceri bu.',
      lines: [
        'Harekesiz metinde ünlüler görünmez; kalıbı ele veren şey EK harflerdir.',
        `${label.tr} — ${label.sense}.`,
        'Kalıbı tanıyan öğrenci, hiç görmediği bir fiilin anlamını bile tahmin edebilir.',
      ],
    },
    rule: {
      title: 'İşaretler',
      say: `${label.tr} kalıbının işaretleri şunlar.`,
      lines: [`İşaret: ${info.signs.join(' · ')}`, ...info.how],
    },
    model: {
      title: 'Beş örnek',
      say: 'Hepsi aynı kalıpta. Ortak olan şeyi kendin bul.',
      pieces,
    },
    guided: [question(true), question(true)],
    solo: [question(false), question(false)],
    summary: {
      title: 'Özet',
      say: 'Kalıbı tanımak, sözlüğe bakmadan anlam tahmin edebilmek demek.',
      lines: [
        `${label.tr} işareti: ${info.signs.join(' · ')}`,
        `Anlamı: ${label.sense}`,
        'Yeni bir fiil gördüğünde önce ek harflere bak, sonra kökü çıkar.',
      ],
      pieces: pieces.slice(0, 3),
    },
  });
}

export const SIGN_BINYANIM = Object.keys(BINYAN_SIGNS) as Binyan[];
