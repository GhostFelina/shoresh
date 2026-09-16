/**
 * Aralıklı tekrar (SRS) — neyin ne zaman tekrar edileceğine karar verir.
 *
 * NEDEN SABİT ARALIK MERDİVENİ DEĞİL: "1 → 3 → 7 → 14 gün" gibi sabit bir
 * merdiven herkese aynı davranır. Oysa aynı öğrencinin iki kelimesi bile
 * aynı hızda unutulmaz: שָׁלוֹם bir kez görülür ve kalır, הִסְתַּדֵּר beş kez
 * tekrar ister. FSRS her öğe için ayrı bir kararlılık (stability) ve
 * zorluk (difficulty) değeri tutar ve aralığı ona göre uzatır.
 *
 * ÜSTÜNE EKLENEN: FSRS yalnızca "doğru/yanlış" alır. Biz ayrıca CEVAP
 * SÜRESİNİ ve İPUCU kullanımını da ölçüyoruz, çünkü ikisi aynı şey değil:
 * 2 saniyede hatırlanan kelime ile 9 saniyede sökülen kelime aynı derecede
 * bilinmiyor. İkincisi daha erken tekrar etmeli.
 *
 * Dosya SAF kalır: veritabanı, DOM, ağ yok. Böylece her kural testlenebilir.
 */
import {
  FSRS,
  Rating,
  State,
  createEmptyCard,
  generatorParameters,
  type Card,
  type Grade,
} from 'ts-fsrs';

/** Öğrenilebilir her şeyin kararlı kimliği. */
export type ItemKind = 'verb' | 'word' | 'phrase' | 'letter' | 'niqqud';

/**
 * Öğe anahtarı — `tür:kimlik[:eksen]`.
 *
 * Fiilde EKSEN önemli: bir öğrenci geçmiş zamanı oturtup geleceği hiç
 * bilmiyor olabilir. Tek bir "כתב fiilini biliyor" kaydı bunu gizler,
 * ayrı eksenler gizlemez.
 */
export type ItemKey = string;

export const itemKey = (kind: ItemKind, id: string, axis?: string): ItemKey =>
  axis ? `${kind}:${id}:${axis}` : `${kind}:${id}`;

export function parseItemKey(key: ItemKey): { kind: ItemKind; id: string; axis?: string } {
  const [kind, ...rest] = key.split(':');
  // Fiil kimlikleri kendi içinde ':' taşır (כתב:paal), bu yüzden son
  // parça eksen sayılır ancak bilinen bir eksen adıysa.
  const AXES = new Set(['infinitive', 'past', 'present', 'future', 'imperative', 'meaning', 'gender']);
  const last = rest.at(-1);
  if (last && AXES.has(last)) {
    return { kind: kind as ItemKind, id: rest.slice(0, -1).join(':'), axis: last };
  }
  return { kind: kind as ItemKind, id: rest.join(':') };
}

/** Kullanıcının bir soruya verdiği cevabın ham ölçümü. */
export interface AnswerSignal {
  correct: boolean;
  /** Cevap süresi (ms). */
  elapsedMs: number;
  /** Kullanılan ipucu sayısı. */
  hintsUsed: number;
  /** Soru çoktan seçmeli miydi, yazarak mı cevaplandı? */
  mode: 'choice' | 'type' | 'order';
}

/** Bir öğenin hafıza durumu. */
export interface SrsState {
  card: Card;
  /** Ortalama cevap süresi (ms), üssel hareketli ortalama. */
  avgResponseMs: number;
  seen: number;
  correct: number;
}

/** Bu sürenin altındaki doğru cevap "otomatikleşmiş" sayılır. */
export const AUTOMATIC_MS = 2500;
/** Bu sürenin üstündeki doğru cevap "zorlanarak hatırlama" sayılır. */
export const SLOW_MS = 8000;

const fsrs = new FSRS(
  generatorParameters({
    request_retention: 0.9,
    maximum_interval: 365,
    enable_fuzz: true,
    enable_short_term: true,
  }),
);

export function createSrsState(): SrsState {
  return { card: createEmptyCard(), avgResponseMs: 0, seen: 0, correct: 0 };
}

/**
 * Ham cevabı FSRS derecesine çevirir.
 *
 *  - hızlı + ipucusuz + yazarak doğru  → Easy
 *  - normal doğru                       → Good
 *  - yavaş ya da ipuçlu doğru           → Hard
 *  - yanlış                             → Again
 *
 * Çoktan seçmelide "Easy" verilmez: dört seçenek arasından tanımak,
 * kelimeyi kendi başına üretebilmek değildir.
 */
export function toRating(signal: AnswerSignal): Grade {
  if (!signal.correct) return Rating.Again;
  if (signal.hintsUsed >= 2) return Rating.Hard;
  if (signal.elapsedMs > SLOW_MS) return Rating.Hard;
  if (signal.hintsUsed === 1) return Rating.Good;
  if (signal.mode === 'choice') return Rating.Good;
  if (signal.elapsedMs <= AUTOMATIC_MS) return Rating.Easy;
  return Rating.Good;
}

/** Bir cevaptan sonra yeni durumu hesaplar. */
export function review(state: SrsState, signal: AnswerSignal, now: Date = new Date()): SrsState {
  const result = fsrs.next(state.card, now, toRating(signal));
  const alpha = 0.3;
  return {
    card: result.card,
    avgResponseMs:
      state.seen === 0
        ? signal.elapsedMs
        : Math.round(state.avgResponseMs * (1 - alpha) + signal.elapsedMs * alpha),
    seen: state.seen + 1,
    correct: state.correct + (signal.correct ? 1 : 0),
  };
}

/** Bu öğe şu an tekrar edilmeli mi? */
export function isDue(state: SrsState, now: Date = new Date()): boolean {
  return new Date(state.card.due).getTime() <= now.getTime();
}

/** Ne kadar gecikmiş? Sıralı kuyrukta en gecikmiş önce gelir. */
export function overdueDays(state: SrsState, now: Date = new Date()): number {
  return (now.getTime() - new Date(state.card.due).getTime()) / 86_400_000;
}

export const isNew = (state: SrsState): boolean => state.card.state === State.New;

/** Zayıf öğe — tekrar dozu artırılmalı. */
export function isWeak(state: SrsState): boolean {
  if (state.seen < 3) return false;
  const accuracy = state.correct / state.seen;
  return state.card.lapses >= 2 || accuracy < 0.7 || state.avgResponseMs > SLOW_MS;
}

/** Otomatikleşmiş mi — asıl hedef bu. */
export function isAutomatic(state: SrsState): boolean {
  return (
    state.seen >= 4 &&
    state.correct / state.seen >= 0.9 &&
    state.avgResponseMs > 0 &&
    state.avgResponseMs <= AUTOMATIC_MS
  );
}

export type Bucket = 'new' | 'due' | 'weak' | 'known';

export function bucketOf(state: SrsState, now: Date = new Date()): Bucket {
  if (isNew(state)) return 'new';
  if (isWeak(state)) return 'weak';
  if (isDue(state, now)) return 'due';
  return 'known';
}

/**
 * Öğrenme yüzdesi — tek sayıya indirgenmiş hâkimiyet.
 *
 * Yalnızca doğruluk oranına bakmak yanıltıcı olurdu: iki kez görülüp iki
 * kez bilinen bir kelime %100 görünür ama unutulmaya en yakın olandır.
 * Bu yüzden FSRS kararlılığı (kaç gün dayanacağı) ağırlıklı sayılıyor.
 */
export function masteryPercent(state: SrsState): number {
  if (state.seen === 0) return 0;
  const accuracy = state.correct / state.seen;
  // 30 günlük kararlılık tam puan sayılır.
  const stability = Math.min(1, (state.card.stability ?? 0) / 30);
  const speed = state.avgResponseMs > 0 ? Math.min(1, AUTOMATIC_MS / state.avgResponseMs) : 0;
  return Math.round((accuracy * 0.45 + stability * 0.4 + speed * 0.15) * 100);
}

export { Rating, State };
export type { Card };
