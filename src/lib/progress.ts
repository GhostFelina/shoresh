/**
 * İlerleme — cevapları kaydeder, neyin tekrar edileceğine karar verir.
 *
 * Bu katman SRS motoru (saf, kural) ile veritabanı (yan etkili) arasındaki
 * köprüdür. Oyunlar ve sayfalar doğrudan Dexie'ye dokunmaz; buradan geçer.
 * Böylece "cevap kaydedildiğinde ne olur" sorusunun tek bir cevabı olur.
 *
 * HATA POLİTİKASI: Veritabanı açılamazsa (gizli sekme, site verisi kapalı)
 * kayıt SESSİZCE atlanır ve uygulama çalışmaya devam eder. İlerleme kaydı
 * bir kolaylıktır; öğrenme içeriğinin kendisi zaten cihazda ve çevrimdışı.
 * Bir oyunun ortasında veritabanı yüzünden çökmek kabul edilemez.
 */
import {
  bucketOf,
  createSrsState,
  isDue,
  masteryPercent,
  overdueDays,
  review,
  type AnswerSignal,
  type Bucket,
  type ItemKey,
  type SrsState,
} from '@/engine/srs';
import { db, dbAvailable, today, type ProgressRecord } from './db';

/** Bir cevabı kaydeder ve öğenin yeni SRS durumunu döndürür. */
export async function recordAnswer(
  key: ItemKey,
  gameId: string,
  signal: AnswerSignal,
  now: Date = new Date(),
): Promise<SrsState | null> {
  if (!(await dbAvailable())) return null;

  const day = today(now);

  try {
    return await db.transaction('rw', db.attempts, db.progress, db.days, async () => {
      const existing = await db.progress.get(key);
      const before = existing?.srs ?? createSrsState();
      const after = review(before, signal, now);

      await db.progress.put({
        key,
        srs: after,
        updatedAt: now.getTime(),
        dueAt: new Date(after.card.due).getTime(),
      });

      await db.attempts.add({
        key,
        gameId,
        correct: signal.correct,
        elapsedMs: signal.elapsedMs,
        hintsUsed: signal.hintsUsed,
        at: now.getTime(),
        day,
      });

      const dayRow = (await db.days.get(day)) ?? {
        day,
        attempts: 0,
        correct: 0,
        learned: 0,
        studyMs: 0,
      };
      await db.days.put({
        ...dayRow,
        attempts: dayRow.attempts + 1,
        correct: dayRow.correct + (signal.correct ? 1 : 0),
        // "Öğrenilen" = bugün İLK KEZ görülen öğe. Tekrar görülenler
        // sayılmaz, yoksa sayı çalışma süresini değil tekrarı ölçerdi.
        learned: dayRow.learned + (existing ? 0 : 1),
        studyMs: dayRow.studyMs + Math.min(signal.elapsedMs, 60_000),
      });

      return after;
    });
  } catch {
    // Kayıt başarısız olursa oyun durmaz.
    return null;
  }
}

export interface ItemProgress {
  key: ItemKey;
  srs: SrsState;
  bucket: Bucket;
  mastery: number;
  overdue: number;
}

function toItemProgress(row: ProgressRecord, now: Date): ItemProgress {
  return {
    key: row.key,
    srs: row.srs,
    bucket: bucketOf(row.srs, now),
    mastery: masteryPercent(row.srs),
    overdue: overdueDays(row.srs, now),
  };
}

/** Tek bir öğenin durumu. */
export async function getProgress(key: ItemKey): Promise<ItemProgress | null> {
  if (!(await dbAvailable())) return null;
  const row = await db.progress.get(key);
  return row ? toItemProgress(row, new Date()) : null;
}

/** Birden çok öğenin durumu — liste sayfaları için tek sorguda. */
export async function getProgressMap(keys: ItemKey[]): Promise<Map<ItemKey, ItemProgress>> {
  const out = new Map<ItemKey, ItemProgress>();
  if (!(await dbAvailable()) || keys.length === 0) return out;
  const now = new Date();
  const rows = await db.progress.bulkGet(keys);
  for (const row of rows) {
    if (row) out.set(row.key, toItemProgress(row, now));
  }
  return out;
}

/**
 * Vadesi gelmiş öğeler — "bugünün dersi".
 *
 * En gecikmiş olan önce gelir: bir kelimeyi üç gün geciktirmek onu bir gün
 * geciktirmekten daha çok unutturmuştur, önce o tazelenmeli.
 */
export async function dueItems(limit = 40, now: Date = new Date()): Promise<ItemProgress[]> {
  if (!(await dbAvailable())) return [];
  const rows = await db.progress.where('dueAt').belowOrEqual(now.getTime()).toArray();
  return rows
    .map((r) => toItemProgress(r, now))
    .sort((a, b) => b.overdue - a.overdue)
    .slice(0, limit);
}

/** Zayıf öğeler — sık yanılınan ya da yavaş hatırlananlar. */
export async function weakItems(limit = 20): Promise<ItemProgress[]> {
  if (!(await dbAvailable())) return [];
  const now = new Date();
  const rows = await db.progress.toArray();
  return rows
    .map((r) => toItemProgress(r, now))
    .filter((p) => p.bucket === 'weak')
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, limit);
}

export interface OverallStats {
  /** Hiç görülmüş öğe sayısı. */
  touched: number;
  /** Şu an tekrar bekleyen. */
  due: number;
  /** Zayıf sayılan. */
  weak: number;
  /** Otomatikleşmiş sayılan (mastery >= 80). */
  strong: number;
  /** Bütün öğelerin ortalama hâkimiyeti. */
  averageMastery: number;
  /** Toplam cevap sayısı. */
  attempts: number;
  /** Toplam doğru. */
  correct: number;
  /** Arka arkaya çalışılan gün sayısı. */
  streak: number;
  /** Son 7 günün günlük özeti (eski → yeni). */
  lastWeek: Array<{ day: string; attempts: number; correct: number }>;
}

const EMPTY_STATS: OverallStats = {
  touched: 0,
  due: 0,
  weak: 0,
  strong: 0,
  averageMastery: 0,
  attempts: 0,
  correct: 0,
  streak: 0,
  lastWeek: [],
};

/**
 * Seri (streak) hesabı.
 *
 * BUGÜN çalışılmamışsa seri KIRILMIŞ sayılmaz — gün henüz bitmedi.
 * Dünden geriye doğru kesintisiz gün sayılır, bugün varsa başa eklenir.
 * Aksi hâlde sabah uygulamayı açan biri serisini sıfır görürdü.
 */
function computeStreak(days: Set<string>, now: Date): number {
  let streak = 0;
  const cursor = new Date(now);

  if (days.has(today(cursor))) streak = 1;
  cursor.setDate(cursor.getDate() - 1);

  while (days.has(today(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export async function overallStats(now: Date = new Date()): Promise<OverallStats> {
  if (!(await dbAvailable())) return EMPTY_STATS;

  const [rows, dayRows] = await Promise.all([db.progress.toArray(), db.days.toArray()]);

  /*
   * Kayıt yokken erkenden çıkmıyoruz. Çıksaydık `lastWeek` boş dönerdi ve
   * ilerleme sayfasındaki yedi günlük grafik hiç çizilmezdi — grafiğin
   * boş hâli de bilgidir, "bu hafta çalışılmamış" demektir.
   */
  const items = rows.map((r) => toItemProgress(r, now));
  const masterySum = items.reduce((n, p) => n + p.mastery, 0);

  const attempts = dayRows.reduce((n, d) => n + d.attempts, 0);
  const correct = dayRows.reduce((n, d) => n + d.correct, 0);

  const lastWeek: OverallStats['lastWeek'] = [];
  const cursor = new Date(now);
  cursor.setDate(cursor.getDate() - 6);
  for (let i = 0; i < 7; i++) {
    const key = today(cursor);
    const row = dayRows.find((d) => d.day === key);
    lastWeek.push({ day: key, attempts: row?.attempts ?? 0, correct: row?.correct ?? 0 });
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    touched: items.length,
    due: items.filter((p) => isDue(p.srs, now)).length,
    weak: items.filter((p) => p.bucket === 'weak').length,
    strong: items.filter((p) => p.mastery >= 80).length,
    averageMastery: items.length > 0 ? Math.round(masterySum / items.length) : 0,
    attempts,
    correct,
    streak: computeStreak(new Set(dayRows.filter((d) => d.attempts > 0).map((d) => d.day)), now),
    lastWeek,
  };
}
