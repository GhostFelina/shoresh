/**
 * Aralıklı tekrar kurallarının kilidi.
 *
 * Bu motorun hataları sessizdir: yanlış bir aralık uygulamayı çökertmez,
 * yalnızca öğrenciye yanlış zamanda soru sorar ve kimse fark etmez.
 * Bu yüzden kurallar tek tek sınanıyor.
 */
import { describe, expect, it } from 'vitest';
import {
  AUTOMATIC_MS,
  SLOW_MS,
  bucketOf,
  createSrsState,
  isDue,
  isWeak,
  itemKey,
  masteryPercent,
  parseItemKey,
  review,
  toRating,
  Rating,
} from '@/engine/srs';

const signal = (over: Partial<Parameters<typeof review>[1]> = {}) => ({
  correct: true,
  elapsedMs: 3000,
  hintsUsed: 0,
  mode: 'type' as const,
  ...over,
});

describe('öğe anahtarı', () => {
  it('fiil ekseniyle birlikte kurulur ve geri çözülür', () => {
    const k = itemKey('verb', 'כתב:paal', 'present');
    expect(k).toBe('verb:כתב:paal:present');
    const parsed = parseItemKey(k);
    expect(parsed.kind).toBe('verb');
    expect(parsed.id).toBe('כתב:paal');
    expect(parsed.axis).toBe('present');
  });

  it('eksensiz anahtar da doğru çözülür', () => {
    const parsed = parseItemKey(itemKey('word', 'בַּיִת:noun'));
    expect(parsed.kind).toBe('word');
    expect(parsed.id).toBe('בַּיִת:noun');
    expect(parsed.axis).toBeUndefined();
  });
});

describe('derecelendirme', () => {
  it('yanlış cevap her zaman Again', () => {
    expect(toRating(signal({ correct: false, elapsedMs: 100 }))).toBe(Rating.Again);
  });

  it('hızlı, ipucusuz, yazarak doğru cevap Easy', () => {
    expect(toRating(signal({ elapsedMs: AUTOMATIC_MS - 100 }))).toBe(Rating.Easy);
  });

  it('çoktan seçmelide Easy verilmez — tanımak üretmek değildir', () => {
    expect(toRating(signal({ elapsedMs: 500, mode: 'choice' }))).toBe(Rating.Good);
  });

  it('yavaş doğru cevap Hard', () => {
    expect(toRating(signal({ elapsedMs: SLOW_MS + 1000 }))).toBe(Rating.Hard);
  });

  it('iki ipucu kullanıldıysa Hard', () => {
    expect(toRating(signal({ hintsUsed: 2, elapsedMs: 500 }))).toBe(Rating.Hard);
  });
});

describe('tekrar takvimi', () => {
  it('yeni öğe hemen vadesi gelmiş sayılır', () => {
    expect(bucketOf(createSrsState())).toBe('new');
  });

  it('doğru cevaptan sonra vade ileriye atılır', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    const after = review(createSrsState(), signal(), now);
    expect(isDue(after, now)).toBe(false);
    expect(new Date(after.card.due).getTime()).toBeGreaterThan(now.getTime());
  });

  it('yanlış cevap sayacı artırır ve öğeyi öne çeker', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    let s = review(createSrsState(), signal(), now);
    const dueAfterCorrect = new Date(s.card.due).getTime();
    s = review(s, signal({ correct: false }), now);
    expect(new Date(s.card.due).getTime()).toBeLessThan(dueAfterCorrect);
    expect(s.correct).toBe(1);
    expect(s.seen).toBe(2);
  });

  it('art arda yanılınan öğe zayıf sayılır', () => {
    const now = new Date('2026-01-01T10:00:00Z');
    let s = createSrsState();
    for (let i = 0; i < 4; i++) s = review(s, signal({ correct: false }), now);
    expect(isWeak(s)).toBe(true);
    expect(bucketOf(s, now)).toBe('weak');
  });
});

describe('hâkimiyet yüzdesi', () => {
  it('hiç görülmemiş öğe sıfırdır', () => {
    expect(masteryPercent(createSrsState())).toBe(0);
  });

  it('hızlı ve doğru tekrarlar yüzdeyi yükseltir', () => {
    let s = createSrsState();
    let now = new Date('2026-01-01T10:00:00Z');
    for (let i = 0; i < 6; i++) {
      s = review(s, signal({ elapsedMs: 1200 }), now);
      now = new Date(now.getTime() + 86_400_000);
    }
    expect(masteryPercent(s)).toBeGreaterThan(50);
  });

  it('iki kez görülüp iki kez bilinen öğe %100 sayılmaz', () => {
    /*
     * Yalnızca doğruluk oranına bakılsaydı bu öğe %100 görünürdü. Oysa
     * kararlılığı henüz düşük ve unutulmaya en yakın olan bu tür öğelerdir.
     */
    let s = createSrsState();
    const now = new Date('2026-01-01T10:00:00Z');
    s = review(s, signal(), now);
    s = review(s, signal(), now);
    expect(masteryPercent(s)).toBeLessThan(100);
  });
});
