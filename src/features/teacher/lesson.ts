/**
 * Öğretmen modu — ders motoru.
 *
 * NEDEN OYUNLARDAN AYRI: Oyunlar SINAR. Soruyu sorar, cevabı alır, puan
 * verir; öğrencinin konuyu zaten gördüğünü varsayar. Bu motor ÖĞRETİR:
 * önce kuralı söyler, sonra işlenmiş bir örnek gösterir, sonra ipuçlu
 * bir soru sorar, en sonunda ipuçsuz sorar. Yanlış cevapta puan
 * düşürmez — NEDEN yanlış olduğunu söyler.
 *
 * NEDEN AÇIKLAMALAR ELLE YAZILMADI: Ders içeriği kataloğun ve çekim
 * motorunun kendi bildiğinden üretiliyor. "Neden burada patah var"
 * sorusunun cevabı zaten `GIZRA_LABEL` ve `BINYAN_LABEL` içinde duruyor.
 * Ayrıca yazılsaydı, motor bir şablonu düzelttiğinde açıklama eski
 * kalırdı ve öğrenciye artık doğru olmayan bir gerekçe anlatırdık.
 *
 * NEDEN YAPAY ZEKÂ ÇAĞRISI YOK: Bir dil modeli her açılışta farklı
 * açıklama üretir, bazen yanlış çeker, çevrimdışı hiç çalışmaz ve
 * anahtar ister. Buradaki bilgi zaten kesin ve elimizde; onu tahmin
 * ettirmenin bir kazancı yok.
 */
import { VERBS } from '@/data/catalog';
import { WORDS } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import type { ItemKind } from '@/engine/srs';
import {
  BINYAN_LABEL,
  GIZRA_LABEL,
  PERSON_LABEL,
  PRESENT_LABEL,
  type Binyan,
  type CEFR,
  type Conjugation,
  type Gizra,
  type HebrewVerb,
  type Person,
  type PresentSlot,
} from '@/types/hebrew';

export type StepKind = 'intro' | 'rule' | 'model' | 'guided' | 'solo' | 'summary';

/** Öğrencinin ekranda gördüğü İbranice parça — üç yazımıyla birlikte. */
export interface Piece {
  vocalized: string;
  plain: string;
  translit: string;
  /** Türkçe karşılık ya da etiket. */
  gloss: string;
}

const piece = (c: Conjugation, gloss: string): Piece => ({
  vocalized: c.vocalized,
  plain: c.plain,
  translit: c.translit,
  gloss,
});

export interface LessonStep {
  kind: StepKind;
  /** Öğretmenin söyleyeceği Türkçe cümle. Koç sesi bunu okur. */
  say: string;
  /** Ekranda duran başlık. */
  title: string;
  /** Açıklama gövdesi — satır satır. */
  lines?: string[];
  /** Seslendirilecek ve gösterilecek İbranice parçalar. */
  pieces?: Piece[];
  /** Soru varsa. */
  question?: LessonQuestion;
}

export interface LessonQuestion {
  prompt: string;
  /** Doğru cevabın harekesiz yazımı — yazarak cevapta bu beklenir. */
  answer: string;
  /** Harekeli biçim — doğru cevaptan sonra gösterilir. */
  answerVocalized: string;
  answerTranslit: string;
  /** Şıklı soruysa dolu; yazma sorusuysa boş. */
  choices?: string[];
  /** Guided adımda açılabilen ipucu. */
  hint: string;
  /**
   * Yanlış cevabın ardından gösterilen gerekçe.
   * "Yanlış" demek yetmez; öğrenci bir dahaki sefere aynı yere düşer.
   */
  why: string;
  /** Seslendirilecek metin (harekesiz). */
  speak: string;
  /**
   * Sorunun dayandığı katalog öğesi.
   *
   * NEDEN VAR: Derste verilen cevap da tekrar programına yazılsın diye.
   * Ayrı tutulsaydı öğrenci bir fiili derste öğrenip oyunda yeniden
   * "hiç görülmemiş" sayılırdı. Uydurma bir anahtar üretmek yerine
   * gerçek öğeyi taşıyoruz; taşıyamadığımız soruda alan boş kalır ve
   * o soru SRS'e hiç yazılmaz.
   */
  source?: { kind: ItemKind; id: string; axis?: string };
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  level: CEFR;
  steps: LessonStep[];
}

/* ------------------------------------------------------------------ *
 * Rastgelelik — tohumlu, böylece aynı ders aynı sırayla açılır
 * ------------------------------------------------------------------ */

/**
 * Tohumlu üreteç.
 *
 * NEDEN Math.random DEĞİL: Ders ortasında bileşen yeniden çizilirse
 * (tema değişimi, pencere boyutu) sorular değişirdi ve öğrenci cevap
 * verdiği soruyu kaybederdi. Tohumla ders başından sonuna aynı kalır.
 */
function makeRng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

const pick = <T,>(arr: readonly T[], rng: () => number): T =>
  arr[Math.floor(rng() * arr.length)] ?? arr[0]!;

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

/* ------------------------------------------------------------------ *
 * Ders türü 1 — bir binyanın şimdiki zamanı
 * ------------------------------------------------------------------ */

const PRESENT_SLOTS: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];

function verbsFor(binyan: Binyan, level: CEFR): HebrewVerb[] {
  const levels = new Set(upTo(level));
  return VERBS.filter(
    (v) =>
      v.binyan === binyan &&
      levels.has(v.cefr) &&
      v.gizra === 'shlemim' &&
      PRESENT_SLOTS.every((s) => v.table.present[s]),
  );
}

function binyanPresentLesson(binyan: Binyan, level: CEFR, rng: () => number): Lesson | null {
  const pool = verbsFor(binyan, level);
  if (pool.length < 4) return null;

  const label = BINYAN_LABEL[binyan];
  const model = pool[0]!;
  const [guidedVerb, soloVerb] = sample(pool.slice(1), 2, rng);
  if (!guidedVerb || !soloVerb) return null;

  const modelForms = PRESENT_SLOTS.map((s) => piece(model.table.present[s]!, PRESENT_LABEL[s].tr));

  const guidedSlot: PresentSlot = 'fs';
  const soloSlot: PresentSlot = pick(['mp', 'fp'] as const, rng);

  const guidedAnswer = guidedVerb.table.present[guidedSlot]!;
  const soloAnswer = soloVerb.table.present[soloSlot]!;

  const wrongChoices = sample(
    PRESENT_SLOTS.filter((s) => s !== guidedSlot),
    3,
    rng,
  ).map((s) => guidedVerb.table.present[s]!.plain);

  const steps: LessonStep[] = [
    {
      kind: 'intro',
      title: `${label.tr} — şimdiki zaman`,
      say: `Bu derste ${label.tr} kalıbının şimdiki zamanını çalışacağız. ${label.sense}.`,
      lines: [
        `${label.tr} (${label.he}) — ${label.sense}.`,
        'İbranicede şimdiki zaman şahsa göre değil, CİNSİYET ve SAYIYA göre çekilir.',
        'Yani "ben yazıyorum" ile "sen yazıyorsun" aynı kelimedir; erkek ve kadın farklıdır.',
      ],
    },
    {
      kind: 'rule',
      title: 'Kural',
      say: 'Şimdiki zamanda dört biçim vardır: eril tekil, dişil tekil, eril çoğul, dişil çoğul. Ekler her fiilde aynıdır.',
      lines: [
        'Dört biçim: eril tekil, dişil tekil, eril çoğul, dişil çoğul.',
        'Ekler kökten bağımsızdır — bir kere öğrenilir, her fiile uyar.',
        `Örnek kök: ${model.rootDisplay} (${model.tr.join(', ')}).`,
      ],
    },
    {
      kind: 'model',
      title: `Örnek: ${model.rootDisplay}`,
      say: `Şimdi ${model.tr[0]} fiilini dört biçimde dinle. Her birine dokunup tekrar dinleyebilirsin.`,
      pieces: modelForms,
      lines: ['Her biçimi dinle, sonra kendi kendine tekrarla.'],
    },
    {
      kind: 'guided',
      title: 'Birlikte deneyelim',
      say: 'Sıra sende. İpucu düğmesi hazır, takılırsan kullan.',
      question: {
        prompt: `${guidedVerb.rootDisplay} kökü, ${label.tr} kalıbı — ${PRESENT_LABEL[guidedSlot].tr} biçimi hangisi?`,
        answer: guidedAnswer.plain,
        answerVocalized: guidedAnswer.vocalized,
        answerTranslit: guidedAnswer.translit,
        choices: [guidedAnswer.plain, ...wrongChoices].sort(() => rng() - 0.5),
        hint: `Dişil tekil çoğu kalıpta ־ֶת ya da ־ָה ile biter. Örnekteki ${modelForms[1]!.plain} biçimine bak.`,
        why: `${PRESENT_LABEL[guidedSlot].tr} biçimi ${guidedAnswer.plain}. Seçtiğin biçim başka bir cinsiyet ya da sayı — kök doğruydu, ek yanlıştı.`,
        speak: guidedAnswer.plain,
        source: { kind: 'verb', id: guidedVerb.id, axis: 'present' },
      },
    },
    {
      kind: 'solo',
      title: 'Şimdi tek başına',
      say: 'Bu sefer ipucu yok. Cevabı harekesiz yaz.',
      question: {
        prompt: `${soloVerb.rootDisplay} (${soloVerb.tr[0]}) — ${PRESENT_LABEL[soloSlot].tr} biçimini yaz.`,
        answer: soloAnswer.plain,
        answerVocalized: soloAnswer.vocalized,
        answerTranslit: soloAnswer.translit,
        hint: `Çoğul ekleri: eril ־ים, dişil ־וֹת.`,
        why: `Doğrusu ${soloAnswer.plain} (${soloAnswer.translit}). ${label.tr} kalıbında ${PRESENT_LABEL[soloSlot].tr} biçimi kökün üzerine ${soloSlot === 'mp' ? '־ים' : '־וֹת'} ekiyle kurulur.`,
        speak: soloAnswer.plain,
        source: { kind: 'verb', id: soloVerb.id, axis: 'present' },
      },
    },
    {
      kind: 'summary',
      title: 'Özet',
      say: `${label.tr} şimdiki zaman bitti. Dört biçim, bir kural.`,
      lines: [
        `${label.tr} — ${label.sense}.`,
        'Şimdiki zaman dört biçim: eril/dişil × tekil/çoğul.',
        'Ekler kökten bağımsız — yeni bir fiil gördüğünde aynı ekleri uygula.',
      ],
      pieces: modelForms,
    },
  ];

  return {
    id: `binyan-present-${binyan}`,
    title: `${label.tr} — şimdiki zaman`,
    subtitle: label.sense,
    level,
    steps,
  };
}

/* ------------------------------------------------------------------ *
 * Ders türü 2 — geçmiş zaman kişi ekleri
 * ------------------------------------------------------------------ */

const PAST_TEACH: Person[] = ['ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'hem'];

function pastLesson(binyan: Binyan, level: CEFR, rng: () => number): Lesson | null {
  const pool = verbsFor(binyan, level).filter((v) => PAST_TEACH.every((p) => v.table.past[p]));
  if (pool.length < 3) return null;

  const label = BINYAN_LABEL[binyan];
  const model = pool[0]!;
  const [guidedVerb, soloVerb] = sample(pool.slice(1), 2, rng);
  if (!guidedVerb || !soloVerb) return null;

  const modelForms = PAST_TEACH.map((p) => piece(model.table.past[p]!, PERSON_LABEL[p].tr));

  const guidedPerson: Person = 'ani';
  const soloPerson = pick(['at', 'anachnu', 'hem'] as const, rng);
  const guidedAnswer = guidedVerb.table.past[guidedPerson]!;
  const soloAnswer = soloVerb.table.past[soloPerson]!;

  const wrong = sample(
    PAST_TEACH.filter((p) => p !== guidedPerson),
    3,
    rng,
  ).map((p) => guidedVerb.table.past[p]!.plain);

  return {
    id: `binyan-past-${binyan}`,
    title: `${label.tr} — geçmiş zaman`,
    subtitle: 'Kişi ekleri',
    level,
    steps: [
      {
        kind: 'intro',
        title: `${label.tr} — geçmiş zaman`,
        say: 'Geçmiş zamanda şimdiki zamandan farklı olarak her şahsın kendi eki vardır. Cinsiyet de ayrıca çekilir.',
        lines: [
          'Şimdiki zaman cinsiyet ve sayı çeker; geçmiş zaman ŞAHIS çeker.',
          'Yani burada "ben" ile "sen" farklı kelimelerdir.',
          'Ekler sondadır ve kalıptan kalıba değişmez.',
        ],
      },
      {
        kind: 'rule',
        title: 'Ekler',
        say: 'Ben eki ti, sen erkek eki ta, sen kadın eki t, biz eki nu, onlar eki u. O erkek biçiminde hiç ek yoktur.',
        lines: [
          'ben → ־תִּי · sen(e) → ־תָּ · sen(k) → ־תְּ',
          'biz → ־נוּ · onlar → ־וּ',
          'o (erkek) → EK YOK. Sözlükler fiili bu biçimde listeler.',
          'o (kadın) → ־ָה',
        ],
      },
      {
        kind: 'model',
        title: `Örnek: ${model.rootDisplay} (${model.tr[0]})`,
        say: 'Tabloyu dinle. Ekin nereye geldiğine dikkat et.',
        pieces: modelForms,
      },
      {
        kind: 'guided',
        title: 'Birlikte',
        say: 'Hangisi "ben" biçimi?',
        question: {
          prompt: `${guidedVerb.rootDisplay} (${guidedVerb.tr[0]}) — "ben" biçimi hangisi?`,
          answer: guidedAnswer.plain,
          answerVocalized: guidedAnswer.vocalized,
          answerTranslit: guidedAnswer.translit,
          choices: [guidedAnswer.plain, ...wrong].sort(() => rng() - 0.5),
          hint: '"Ben" eki ־תִּי. Sonu תי ile biteni ara.',
          why: `"Ben" biçimi ${guidedAnswer.plain} (${guidedAnswer.translit}). Seçtiğin biçim başka bir şahsa ait — kök doğru, ek yanlış.`,
          speak: guidedAnswer.plain,
          source: { kind: 'verb', id: guidedVerb.id, axis: 'past' },
        },
      },
      {
        kind: 'solo',
        title: 'Tek başına',
        say: 'Şimdi yazarak dene.',
        question: {
          prompt: `${soloVerb.rootDisplay} (${soloVerb.tr[0]}) — "${PERSON_LABEL[soloPerson].tr}" biçimini yaz.`,
          answer: soloAnswer.plain,
          answerVocalized: soloAnswer.vocalized,
          answerTranslit: soloAnswer.translit,
          hint: `${PERSON_LABEL[soloPerson].tr} eki: ${soloPerson === 'at' ? '־תְּ' : soloPerson === 'anachnu' ? '־נוּ' : '־וּ'}`,
          why: `Doğrusu ${soloAnswer.plain} (${soloAnswer.translit}). ${PERSON_LABEL[soloPerson].tr} eki kökün sonuna gelir, kök harfleri değişmez.`,
          speak: soloAnswer.plain,
          source: { kind: 'verb', id: soloVerb.id, axis: 'past' },
        },
      },
      {
        kind: 'summary',
        title: 'Özet',
        say: 'Geçmiş zamanın ekleri bunlar. Bir fiilde öğrendiğin ek hepsinde aynı.',
        lines: [
          'Geçmiş zaman şahıs çeker, ekler sondadır.',
          '"O (erkek)" biçimi eksizdir — sözlük biçimi odur.',
          'Ekler kalıptan bağımsızdır; yeni bir binyan öğrenince ekleri tekrar öğrenmezsin.',
        ],
        pieces: modelForms.slice(0, 5),
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Ders türü 3 — zayıf kök sınıfı (gizra)
 * ------------------------------------------------------------------ */

function gizraLesson(gizra: Gizra, level: CEFR, rng: () => number): Lesson | null {
  const levels = new Set(upTo(level));
  const pool = VERBS.filter((v) => v.gizra === gizra && levels.has(v.cefr));
  const strong = VERBS.filter(
    (v) => v.gizra === 'shlemim' && v.binyan === 'paal' && levels.has(v.cefr),
  );
  if (pool.length < 3 || strong.length === 0) return null;

  const label = GIZRA_LABEL[gizra];
  const model = pool[0]!;
  const reference = strong[0]!;
  const [guidedVerb, soloVerb] = sample(pool.slice(1), 2, rng);
  if (!guidedVerb || !soloVerb) return null;

  const modelForms: Piece[] = [
    piece(model.table.infinitive, 'mastar'),
    piece(model.lemma, 'o (erkek), geçmiş'),
  ];
  const present = model.table.present.ms;
  if (present) modelForms.push(piece(present, 'eril tekil, şimdiki'));

  const guidedAnswer = guidedVerb.table.infinitive;
  const soloAnswer = soloVerb.lemma;

  const wrong = sample(
    pool.filter((v) => v.id !== guidedVerb.id),
    3,
    rng,
  ).map((v) => v.table.infinitive.plain);

  return {
    id: `gizra-${gizra}`,
    title: `${label.he} — ${label.tr}`,
    subtitle: 'Zayıf kök sınıfı',
    level,
    steps: [
      {
        kind: 'intro',
        title: label.he,
        say: `Bu ders bir zayıf kök sınıfı üzerine. ${label.tr}.`,
        lines: [
          `${label.he} — ${label.tr}.`,
          'Zayıf kök demek, kök harflerinden birinin kalıbı bozması demektir.',
          'Kalıbı ezberlemek yetmez; nerede bozulduğunu görmek gerekir.',
        ],
      },
      {
        kind: 'rule',
        title: 'Tam kökle karşılaştır',
        say: 'Önce sağlam bir kökle karşılaştıralım. Farkı gören, kuralı ezberlemek zorunda kalmaz.',
        lines: [
          `Sağlam kök: ${reference.rootDisplay} → ${reference.table.infinitive.vocalized}`,
          `Bu sınıf : ${model.rootDisplay} → ${model.table.infinitive.vocalized}`,
          label.tr,
        ],
        pieces: [
          piece(reference.table.infinitive, `sağlam kök — ${reference.tr[0]}`),
          piece(model.table.infinitive, `${label.he} — ${model.tr[0]}`),
        ],
      },
      {
        kind: 'model',
        title: `Örnek: ${model.rootDisplay}`,
        say: 'Aynı kökün üç biçimini dinle.',
        pieces: modelForms,
      },
      {
        kind: 'guided',
        title: 'Birlikte',
        say: 'Mastar biçimini bul.',
        question: {
          prompt: `${guidedVerb.rootDisplay} (${guidedVerb.tr[0]}) — mastarı hangisi?`,
          answer: guidedAnswer.plain,
          answerVocalized: guidedAnswer.vocalized,
          answerTranslit: guidedAnswer.translit,
          choices: [guidedAnswer.plain, ...wrong].sort(() => rng() - 0.5),
          hint: `Bu sınıfta mastar ${model.table.infinitive.plain} gibi kurulur. Kök harflerini oraya yerleştir.`,
          why: `Doğrusu ${guidedAnswer.plain} (${guidedAnswer.translit}). ${label.tr} — seçtiğin biçim başka bir kökün mastarı.`,
          speak: guidedAnswer.plain,
          source: { kind: 'verb', id: guidedVerb.id, axis: 'infinitive' },
        },
      },
      {
        kind: 'solo',
        title: 'Tek başına',
        say: 'Sözlük biçimini yaz. Yani o, erkek, geçmiş zaman.',
        question: {
          prompt: `${soloVerb.rootDisplay} (${soloVerb.tr[0]}) — sözlük biçimini yaz.`,
          answer: soloAnswer.plain,
          answerVocalized: soloAnswer.vocalized,
          answerTranslit: soloAnswer.translit,
          hint: `Sözlük biçimi "o (erkek), geçmiş zaman"dır ve ek almaz. Örnek: ${model.lemma.plain}`,
          why: `Doğrusu ${soloAnswer.plain} (${soloAnswer.translit}). ${label.tr} — bu yüzden sağlam kök kalıbına benzemiyor.`,
          speak: soloAnswer.plain,
          source: { kind: 'verb', id: soloVerb.id, axis: 'past' },
        },
      },
      {
        kind: 'summary',
        title: 'Özet',
        say: 'Bu sınıfı tanıdın. Bundan sonra aynı harfi gördüğünde ne olacağını bilirsin.',
        lines: [
          `${label.he}: ${label.tr}`,
          'Zayıf kökü tanımak, o kökteki bütün biçimleri tahmin edebilmek demektir.',
          `Bu sınıfta uygulamada ${pool.length} fiil var.`,
        ],
        pieces: modelForms,
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Ders türü 4 — kelime konusu (isim + cinsiyet)
 * ------------------------------------------------------------------ */

function topicLesson(topic: string, level: CEFR, rng: () => number): Lesson | null {
  const levels = new Set(upTo(level));
  const pool = WORDS.filter(
    (w) => w.topic === topic && levels.has(w.cefr) && (w.gender === 'm' || w.gender === 'f'),
  );
  if (pool.length < 6) return null;

  const shown = sample(pool, 6, rng);
  const [guidedWord, soloWord] = sample(
    pool.filter((w) => !shown.includes(w)).length >= 2
      ? pool.filter((w) => !shown.includes(w))
      : pool,
    2,
    rng,
  );
  if (!guidedWord || !soloWord) return null;

  const pieces: Piece[] = shown.map((w) => ({
    vocalized: w.vocalized,
    plain: w.plain,
    translit: w.translit,
    gloss: `${w.tr[0]} · ${w.gender === 'm' ? 'eril' : 'dişil'}`,
  }));

  const distractors = sample(
    pool.filter((w) => w.id !== guidedWord.id),
    3,
    rng,
  ).map((w) => w.plain);

  return {
    id: `topic-${topic}`,
    title: `${topic} — kelimeler`,
    subtitle: 'İsimler ve cinsiyetleri',
    level,
    steps: [
      {
        kind: 'intro',
        title: `Konu: ${topic}`,
        say: `Bu derste ${topic} konusundaki kelimeleri çalışacağız. Her ismin cinsiyetini de öğreneceğiz.`,
        lines: [
          'İbranicede cinsiyetsiz isim yoktur.',
          'Sıfat, sayı ve fiil isme uyar — cinsiyeti bilmeden doğru cümle kurulamaz.',
          'Bu yüzden her kelimeyi cinsiyetiyle birlikte öğren.',
        ],
      },
      {
        kind: 'rule',
        title: 'Kaba kural ve sınırı',
        say: 'Sonu he ya da tav ile biten isimler genellikle dişildir. Ama bu kural kesin değil; istisnalar günlük kelimelerde yoğunlaşır.',
        lines: [
          'Sonu ־ָה veya ־ֶת olan isimler ÇOĞUNLUKLA dişil.',
          'Ama בַּיִת (ev) erildir, אֶבֶן (taş) dişildir — ikisi de kurala uymaz.',
          'Kural bir ön tahmindir; kelimeyi cinsiyetiyle ezberlemenin yerini tutmaz.',
        ],
      },
      {
        kind: 'model',
        title: 'Kelimeler',
        say: 'Hepsini dinle. Cinsiyeti yüksek sesle tekrar et.',
        pieces,
      },
      {
        kind: 'guided',
        title: 'Birlikte',
        say: 'Hangisi doğru kelime?',
        question: {
          prompt: `"${guidedWord.tr[0]}" İbranice nasıl yazılır?`,
          answer: guidedWord.plain,
          answerVocalized: guidedWord.vocalized,
          answerTranslit: guidedWord.translit,
          choices: [guidedWord.plain, ...distractors].sort(() => rng() - 0.5),
          hint: `Okunuşu "${guidedWord.translit}" ile başlıyor.`,
          why: `Doğrusu ${guidedWord.plain} (${guidedWord.translit}) — ${guidedWord.gender === 'm' ? 'eril' : 'dişil'}. Öbür seçenekler aynı konudan ama başka kelimeler.`,
          speak: guidedWord.plain,
          source: { kind: 'word', id: guidedWord.id },
        },
      },
      {
        kind: 'solo',
        title: 'Tek başına',
        say: 'Yazarak dene.',
        question: {
          prompt: `"${soloWord.tr[0]}" kelimesini harekesiz yaz.`,
          answer: soloWord.plain,
          answerVocalized: soloWord.vocalized,
          answerTranslit: soloWord.translit,
          hint: `Okunuşu: ${soloWord.translit}`,
          why: `Doğrusu ${soloWord.plain} (${soloWord.translit}) — ${soloWord.gender === 'm' ? 'eril' : 'dişil'}.`,
          speak: soloWord.plain,
          source: { kind: 'word', id: soloWord.id },
        },
      },
      {
        kind: 'summary',
        title: 'Özet',
        say: 'Bu konudaki kelimeleri gördün. Cinsiyeti kelimenin parçası say.',
        lines: [
          'Her ismi cinsiyetiyle birlikte ezberle.',
          'Sonu ־ָה / ־ֶת çoğunlukla dişil — ama sadece çoğunlukla.',
          `Uygulamada bu konuda ${pool.length} kelime var.`,
        ],
        pieces: pieces.slice(0, 4),
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Ders türü 5 — kalıplar
 * ------------------------------------------------------------------ */

function phraseLesson(level: CEFR, rng: () => number): Lesson | null {
  const levels = new Set(upTo(level));
  const pool = PHRASES.filter((p) => levels.has(p.cefr) && p.literal);
  if (pool.length < 6) return null;

  const shown = sample(pool, 5, rng);
  const [guided, solo] = sample(pool, 2, rng);
  if (!guided || !solo) return null;

  const pieces: Piece[] = shown.map((p) => ({
    vocalized: p.he,
    plain: p.plain,
    translit: p.translit,
    gloss: `${p.tr}${p.literal ? ` · birebir: ${p.literal}` : ''}`,
  }));

  const distractors = sample(
    pool.filter((p) => p.id !== guided.id),
    3,
    rng,
  ).map((p) => p.tr);

  return {
    id: 'phrases',
    title: 'Kalıplar — olduğu gibi öğrenilenler',
    subtitle: 'Birebir çeviri neden yetmez',
    level,
    steps: [
      {
        kind: 'intro',
        title: 'Kalıp nedir',
        say: 'Kalıp, kelime kelime çevrilince anlamı çıkmayan hazır ifadedir. Çözmeye çalışma, olduğu gibi öğren.',
        lines: [
          'מַה נִּשְׁמָע kelime kelime "ne duyuluyor" demektir; anlamı "naber"dir.',
          'Kalıplar çekim motorundan geçmez, sözlükten de çıkarılamaz.',
          'Ama nereden geldiğini bilmek, benzer kalıplarla karıştırmayı önler.',
        ],
      },
      {
        kind: 'rule',
        title: 'Nasıl çalışılır',
        say: 'Önce anlamı, sonra birebir çevirisi. Birebir çeviri ezberi tutturur, anlamı değil.',
        lines: [
          'Önce: bu ne zaman söylenir?',
          'Sonra: kelime kelime ne demek?',
          'En son: sesli tekrar. Kalıp, sesiyle birlikte akılda kalır.',
        ],
      },
      {
        kind: 'model',
        title: 'Beş kalıp',
        say: 'Dinle ve tekrarla.',
        pieces,
      },
      {
        kind: 'guided',
        title: 'Birlikte',
        say: 'Bu kalıbın anlamı ne?',
        question: {
          prompt: `${guided.plain} — ne demek?`,
          answer: guided.tr,
          answerVocalized: guided.he,
          answerTranslit: guided.translit,
          choices: [guided.tr, ...distractors].sort(() => rng() - 0.5),
          hint: guided.literal ? `Birebir çevirisi: ${guided.literal}` : `Okunuşu: ${guided.translit}`,
          why: `${guided.plain} = ${guided.tr}.${guided.literal ? ` Birebir çevirisi "${guided.literal}" — anlamıyla arasındaki mesafe tam da bunu kalıp yapan şey.` : ''}`,
          speak: guided.plain,
          source: { kind: 'phrase', id: guided.id },
        },
      },
      {
        kind: 'solo',
        title: 'Tek başına',
        say: 'Bu sefer kalıbı yaz.',
        question: {
          prompt: `"${solo.tr}" kalıbını harekesiz yaz.`,
          answer: solo.plain,
          answerVocalized: solo.he,
          answerTranslit: solo.translit,
          hint: `Okunuşu: ${solo.translit}`,
          why: `Doğrusu ${solo.plain} (${solo.translit}).${solo.literal ? ` Birebir: ${solo.literal}.` : ''}`,
          speak: solo.plain,
          source: { kind: 'phrase', id: solo.id },
        },
      },
      {
        kind: 'summary',
        title: 'Özet',
        say: 'Kalıplar dili doğal gösteren şeydir. Dilbilgisi doğru olduğu hâlde kalıpsız konuşma yabancı durur.',
        lines: [
          'Kalıbı parçalama, bütün olarak kullan.',
          'Birebir çeviriyi bilmek karıştırmayı önler.',
          `Uygulamada ${PHRASES.length} kalıp var.`,
        ],
        pieces: pieces.slice(0, 3),
      },
    ],
  };
}

/* ------------------------------------------------------------------ *
 * Ders kataloğu
 * ------------------------------------------------------------------ */

export interface LessonMeta {
  id: string;
  title: string;
  subtitle: string;
  /** Hangi seviyeden itibaren anlamlı. */
  from: CEFR;
  build: (level: CEFR, seed: number) => Lesson | null;
}

const TAUGHT_BINYANIM: Binyan[] = ['paal', 'piel', 'hifil', 'hitpael', 'nifal'];

/**
 * Öğretilen gizra sınıfları.
 *
 * Hepsi değil: tam kök zaten "kural" dersinde anlatılıyor, düzensizler
 * kalıba uymadığı için ders konusu olamaz. Kalanlar öğrencinin gerçekten
 * takıldığı yerler.
 */
const TAUGHT_GZAROT: Gizra[] = [
  'lamed-hey',
  'ayin-vav',
  'pe-nun',
  'pe-guttural',
  'lamed-guttural',
  'lamed-alef',
  'ayin-resh',
];

const TAUGHT_TOPICS = ['aile', 'ev', 'yemek', 'şehir', 'zaman', 'vücut', 'iş', 'doğa', 'sağlık'];

export const LESSONS: LessonMeta[] = [
  ...TAUGHT_BINYANIM.map((b) => ({
    id: `binyan-present-${b}`,
    title: `${BINYAN_LABEL[b].tr} — şimdiki zaman`,
    subtitle: BINYAN_LABEL[b].sense,
    from: (b === 'paal' ? 'A1' : 'A2') as CEFR,
    build: (level: CEFR, seed: number) => binyanPresentLesson(b, level, makeRng(seed)),
  })),
  ...TAUGHT_BINYANIM.map((b) => ({
    id: `binyan-past-${b}`,
    title: `${BINYAN_LABEL[b].tr} — geçmiş zaman`,
    subtitle: 'Kişi ekleri',
    from: (b === 'paal' ? 'A1' : 'A2') as CEFR,
    build: (level: CEFR, seed: number) => pastLesson(b, level, makeRng(seed)),
  })),
  ...TAUGHT_GZAROT.map((g) => ({
    id: `gizra-${g}`,
    title: `${GIZRA_LABEL[g].he} — zayıf kök`,
    subtitle: GIZRA_LABEL[g].tr,
    from: 'A2' as CEFR,
    build: (level: CEFR, seed: number) => gizraLesson(g, level, makeRng(seed)),
  })),
  ...TAUGHT_TOPICS.map((t) => ({
    id: `topic-${t}`,
    title: `${t} — kelimeler`,
    subtitle: 'İsimler ve cinsiyetleri',
    from: 'A1' as CEFR,
    build: (level: CEFR, seed: number) => topicLesson(t, level, makeRng(seed)),
  })),
  {
    id: 'phrases',
    title: 'Kalıplar',
    subtitle: 'Olduğu gibi öğrenilen ifadeler',
    from: 'A1' as CEFR,
    build: (level: CEFR, seed: number) => phraseLesson(level, makeRng(seed)),
  },
];

export const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));

/** Seçilen seviyede gerçekten kurulabilen dersler. */
export function availableLessons(level: CEFR): LessonMeta[] {
  const allowed = new Set(upTo(level));
  return LESSONS.filter((m) => allowed.has(m.from) && m.build(level, 1) !== null);
}

/**
 * Cevabı karşılaştırır.
 *
 * Harekeler, boşluk farkları ve sofit harfler görmezden gelinir: öğrenci
 * ekrandaki klavyeyle yazarken sofit biçimi seçmek zorunda kalmasın diye.
 * Yanlış cevabı yakalamak amaç; yazım tuzağı kurmak değil.
 */
export function answerMatches(given: string, expected: string): boolean {
  const norm = (s: string): string =>
    s
      .normalize('NFC')
      .replace(/[֑-ׇ]/g, '')
      .replace(/ך/g, 'כ')
      .replace(/ם/g, 'מ')
      .replace(/ן/g, 'נ')
      .replace(/ף/g, 'פ')
      .replace(/ץ/g, 'צ')
      .replace(/[\s'"׳״]/g, '')
      .toLocaleLowerCase('tr');
  return norm(given) === norm(expected);
}
