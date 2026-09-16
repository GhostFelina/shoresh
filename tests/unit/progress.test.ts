/**
 * Kalıcı ilerleme katmanının testleri.
 *
 * `fake-indexeddb` sayesinde gerçek Dexie kodu çalışıyor — sahte bir
 * katman değil. Böylece şema, indeks ve işlem (transaction) mantığı da
 * sınanmış oluyor.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  dueItems,
  getProgress,
  getProgressMap,
  overallStats,
  recordAnswer,
  weakItems,
} from '@/lib/progress';
import { db, today, wipeProgress } from '@/lib/db';
import { itemKey } from '@/engine/srs';

const KEY = itemKey('verb', 'כתב:paal', 'present');
const OTHER = itemKey('word', 'בַּיִת:noun');

const ok = { correct: true, elapsedMs: 1500, hintsUsed: 0, mode: 'type' as const };
const bad = { correct: false, elapsedMs: 9000, hintsUsed: 2, mode: 'type' as const };

beforeEach(async () => {
  await wipeProgress();
});

describe('cevap kaydı', () => {
  it('ilk cevap hem ilerleme hem deneme kaydı oluşturur', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'kelime-avi', ok, now);

    const p = await getProgress(KEY);
    expect(p).not.toBeNull();
    expect(p!.srs.seen).toBe(1);
    expect(p!.srs.correct).toBe(1);

    expect(await db.attempts.count()).toBe(1);
    const dayRow = await db.days.get(today(now));
    expect(dayRow?.attempts).toBe(1);
    expect(dayRow?.learned).toBe(1);
  });

  it('aynı öğenin ikinci cevabı yeni öğrenilen saymaz', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'kelime-avi', ok, now);
    await recordAnswer(KEY, 'kelime-avi', ok, now);

    const dayRow = await db.days.get(today(now));
    expect(dayRow?.attempts).toBe(2);
    expect(dayRow?.learned, 'ikinci görülüş yeni öğrenme değildir').toBe(1);
  });

  it('vade alanı indeksli olarak yazılır', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'kelime-avi', ok, now);
    const row = await db.progress.get(KEY);
    expect(row!.dueAt).toBe(new Date(row!.srs.card.due).getTime());
    expect(row!.dueAt).toBeGreaterThan(now.getTime());
  });
});

describe('tekrar kuyruğu', () => {
  it('vadesi gelmemiş öğe kuyruğa girmez', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'kelime-avi', ok, now);
    expect(await dueItems(10, now)).toHaveLength(0);
  });

  it('vadesi geçince kuyruğa girer', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'kelime-avi', ok, now);
    const later = new Date(now.getTime() + 60 * 86_400_000);
    const due = await dueItems(10, later);
    expect(due).toHaveLength(1);
    expect(due[0]!.key).toBe(KEY);
  });

  it('en gecikmiş öğe önce gelir', async () => {
    const base = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, base);
    await recordAnswer(OTHER, 'g', ok, new Date(base.getTime() + 20 * 86_400_000));
    const later = new Date(base.getTime() + 400 * 86_400_000);
    const due = await dueItems(10, later);
    expect(due.length).toBeGreaterThanOrEqual(2);
    expect(due[0]!.overdue).toBeGreaterThanOrEqual(due[1]!.overdue);
  });
});

describe('zayıf öğeler', () => {
  it('art arda yanılınan öğe zayıf listesine düşer', async () => {
    const now = new Date('2026-03-10T09:00:00');
    for (let i = 0; i < 4; i++) await recordAnswer(KEY, 'g', bad, now);
    const weak = await weakItems(10);
    expect(weak.map((w) => w.key)).toContain(KEY);
  });
});

describe('genel istatistik', () => {
  it('hiç kayıt yokken sıfır döner ve çökmez', async () => {
    const s = await overallStats();
    expect(s.attempts).toBe(0);
    expect(s.touched).toBe(0);
    expect(s.streak).toBe(0);
    expect(s.lastWeek).toHaveLength(7);
  });

  it('doğru ve toplam sayıları birikir', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, now);
    await recordAnswer(OTHER, 'g', bad, now);
    const s = await overallStats(now);
    expect(s.attempts).toBe(2);
    expect(s.correct).toBe(1);
    expect(s.touched).toBe(2);
  });

  it('art arda günler seriyi büyütür', async () => {
    const d1 = new Date('2026-03-08T09:00:00');
    const d2 = new Date('2026-03-09T09:00:00');
    const d3 = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, d1);
    await recordAnswer(KEY, 'g', ok, d2);
    await recordAnswer(KEY, 'g', ok, d3);
    expect((await overallStats(d3)).streak).toBe(3);
  });

  it('bugün çalışılmamışsa dünkü seri korunur', async () => {
    /*
     * Gün henüz bitmedi; sabah uygulamayı açan biri serisini sıfır
     * görmemeli. Dünden geriye kesintisiz sayılır.
     */
    const yesterday = new Date('2026-03-09T09:00:00');
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, yesterday);
    expect((await overallStats(now)).streak).toBe(1);
  });

  it('arada boş gün varsa seri kırılır', async () => {
    await recordAnswer(KEY, 'g', ok, new Date('2026-03-05T09:00:00'));
    await recordAnswer(KEY, 'g', ok, new Date('2026-03-10T09:00:00'));
    expect((await overallStats(new Date('2026-03-10T12:00:00'))).streak).toBe(1);
  });
});

describe('toplu okuma', () => {
  it('birden çok anahtar tek sorguda okunur', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, now);
    await recordAnswer(OTHER, 'g', ok, now);
    const map = await getProgressMap([KEY, OTHER, 'verb:yok:paal']);
    expect(map.size).toBe(2);
    expect(map.has(KEY)).toBe(true);
    expect(map.has('verb:yok:paal')).toBe(false);
  });
});

describe('sıfırlama', () => {
  it('her şeyi siler', async () => {
    const now = new Date('2026-03-10T09:00:00');
    await recordAnswer(KEY, 'g', ok, now);
    await wipeProgress();
    expect(await db.attempts.count()).toBe(0);
    expect(await db.progress.count()).toBe(0);
    expect(await db.days.count()).toBe(0);
  });
});
