/**
 * Ödül katmanı — motoru veritabanına bağlar.
 *
 * `engine/reward.ts` kuralları tutar (saf, test edilebilir); burası o
 * kuralları gerçek kayıtlara uygular. Ayrımın sebebi: XP hesabı
 * veritabanına gömülü olsaydı tek bir kuralı sınamak için sahte bir
 * IndexedDB kurmak gerekirdi ve kimse sınamazdı.
 *
 * VERİTABANI YOKSA SESSİZCE GEÇİLİR: Gizli sekmede ya da site verisi
 * kapalıyken IndexedDB açılmaz. O zaman XP birikmez ama oyun, ders ve
 * içerik çalışmaya devam eder. Ödül sistemi bir kolaylıktır; uygulamayı
 * çalışamaz hâle getirmemeli.
 */
import {
  BADGES,
  earnedBadges,
  goalXp,
  rankFor,
  rewardFor,
  type DailyGoalId,
  type RewardSnapshot,
} from '@/engine/reward';
import { DEFAULT_GOAL } from '@/engine/reward';
import { db, dbAvailable, today, type AttemptRecord } from './db';
import { masteryPercent } from '@/engine/srs';
import type { CEFR } from '@/core/types';

export interface AwardInput {
  correct: boolean;
  elapsedMs: number;
  hintsUsed: number;
  cefr?: CEFR;
}

export interface AwardResult {
  xp: number;
  parts: Array<{ label: string; amount: number }>;
  /** Kazanımdan SONRAKİ toplam. */
  totalXp: number;
  todayXp: number;
  /** Bu cevapla rütbe atlandı mı? */
  rankedUp: boolean;
  /** Bu cevapla günlük hedef tamamlandı mı? */
  goalReached: boolean;
}

/* ------------------------------------------------------------------ *
 * Günlük hedef tercihi
 * ------------------------------------------------------------------ */

const GOAL_KEY = 'shoresh.dailyGoal';

export function readGoal(): DailyGoalId {
  try {
    const v = localStorage.getItem(GOAL_KEY);
    return (v as DailyGoalId) ?? DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

export function writeGoal(id: DailyGoalId): void {
  try {
    localStorage.setItem(GOAL_KEY, id);
  } catch {
    /* yazamadıysak bu oturumda geçerli kalır */
  }
}

/* ------------------------------------------------------------------ *
 * XP yazımı
 * ------------------------------------------------------------------ */

/** Toplam XP — günlük kayıtların toplamı. Ayrı sayaç tutulmuyor. */
export async function totalXp(): Promise<number> {
  if (!(await dbAvailable())) return 0;
  const rows = await db.days.toArray();
  return rows.reduce((n, d) => n + (d.xp ?? 0), 0);
}

export async function todayXp(now: Date = new Date()): Promise<number> {
  if (!(await dbAvailable())) return 0;
  return (await db.days.get(today(now)))?.xp ?? 0;
}

/**
 * Bir cevabın ödülünü hesaplayıp yazar.
 *
 * `recordAnswer` ile AYRI çağrılıyor, içine gömülmedi: SRS kaydı
 * öğrenme durumunu, bu ise motivasyon katmanını tutuyor. Biri
 * başarısız olursa öteki yine de çalışsın istiyoruz — ödül yazılamadı
 * diye tekrar programının bozulması kabul edilemez.
 */
export async function awardAnswer(
  input: AwardInput,
  now: Date = new Date(),
): Promise<AwardResult | null> {
  if (!(await dbAvailable())) return null;

  try {
    const day = today(now);

    /*
     * OKU-DEĞİŞTİR-YAZ TEK İŞLEMDE.
     *
     * Bu kod önce işlem (transaction) dışında okuyup dışarıda yazıyordu
     * ve `recordAnswer` ile AYNI gün satırına yazdığı için ikisi
     * yarışıyordu: biri satırı okuyup beklerken öteki yazıyor, sonra
     * birincinin yazması ötekinin alanını eski değerine döndürüyordu.
     * Sonuç ölçüldü — XP birikiyor ama `attempts` sıfırlanıyor, dolayısıyla
     * seri hep 0 kalıyordu.
     *
     * IndexedDB aynı depoya açılan işlemleri sıraya sokuyor; okuma ve
     * yazma tek işlemin içinde olunca iki taraf birbirini ezemiyor.
     */
    const outcome = await db.transaction('rw', db.days, async () => {
      const dayRows = await db.days.toArray();

      const before = dayRows.reduce((n, d) => n + (d.xp ?? 0), 0);
      const streak = streakFrom(dayRows.filter((d) => d.attempts > 0).map((d) => d.day), now);

      const reward = rewardFor({ ...input, streak });

      const row = dayRows.find((d) => d.day === day) ?? {
        day,
        attempts: 0,
        correct: 0,
        learned: 0,
        studyMs: 0,
        xp: 0,
      };
      const beforeToday = row.xp ?? 0;
      const afterToday = beforeToday + reward.xp;

      await db.days.put({ ...row, xp: afterToday });
      return { reward, before, beforeToday, afterToday };
    });

    const { reward, before, beforeToday, afterToday } = outcome;
    const after = before + reward.xp;
    const goal = goalXp(readGoal());

    return {
      xp: reward.xp,
      parts: reward.parts,
      totalXp: after,
      todayXp: afterToday,
      // Eşik bu cevapla GEÇİLDİYSE kutlanır; zaten geçilmişse değil.
      rankedUp: rankFor(after).index > rankFor(before).index,
      goalReached: beforeToday < goal && afterToday >= goal,
    };
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Özet — rozet ölçütlerinin baktığı tablo
 * ------------------------------------------------------------------ */

/**
 * Seri hesabı.
 *
 * BUGÜN çalışılmamışsa seri kırılmış sayılmaz — gün bitmedi. Dünden
 * geriye kesintisiz sayılır, bugün varsa başa eklenir. Aksi hâlde
 * sabah uygulamayı açan biri serisini sıfır görürdü.
 */
function streakFrom(days: string[], now: Date): number {
  const set = new Set(days);
  let streak = 0;
  const cursor = new Date(now);
  if (set.has(today(cursor))) streak = 1;
  cursor.setDate(cursor.getDate() - 1);
  while (set.has(today(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** İpucusuz art arda doğru serisinin en uzunu. */
export function longestCleanRun(attempts: AttemptRecord[]): number {
  let best = 0;
  let run = 0;
  for (const a of [...attempts].sort((x, y) => x.at - y.at)) {
    if (a.correct && a.hintsUsed === 0) {
      run++;
      if (run > best) best = run;
    } else {
      run = 0;
    }
  }
  return best;
}

const EMPTY_SNAPSHOT: RewardSnapshot = {
  totalXp: 0,
  correct: 0,
  attempts: 0,
  streak: 0,
  touched: 0,
  strong: 0,
  strongVerbs: 0,
  lettersSeen: 0,
  lessonAnswers: 0,
  fastCorrect: 0,
  bestCleanRun: 0,
  activeDays: 0,
};

/**
 * Rozet ölçütlerinin baktığı özet.
 *
 * MALİYET NOTU: `attempts` tablosunun tamamını okuyor. Uzun kullanımda
 * on binlerce satır olabilir; bu yüzden özet HER CEVAPTA değil, yalnızca
 * ilerleme sayfası açıldığında ve bir oturum bittiğinde hesaplanıyor.
 * Her cevapta çağrılsaydı oyun akışı takılırdı.
 */
export async function rewardSnapshot(now: Date = new Date()): Promise<RewardSnapshot> {
  if (!(await dbAvailable())) return EMPTY_SNAPSHOT;

  try {
    const [attempts, progress, dayRows] = await Promise.all([
      db.attempts.toArray(),
      db.progress.toArray(),
      db.days.toArray(),
    ]);

    const strongRows = progress.filter((r) => masteryPercent(r.srs) >= 80);

    return {
      totalXp: dayRows.reduce((n, d) => n + (d.xp ?? 0), 0),
      correct: dayRows.reduce((n, d) => n + d.correct, 0),
      attempts: dayRows.reduce((n, d) => n + d.attempts, 0),
      streak: streakFrom(dayRows.filter((d) => d.attempts > 0).map((d) => d.day), now),
      touched: progress.length,
      strong: strongRows.length,
      strongVerbs: strongRows.filter((r) => r.key.startsWith('verb:')).length,
      // Harf öğeleri `letter:<harf>` biçiminde; eksen taşımadıkları için
      // farklı anahtar sayısı doğrudan görülen harf sayısını verir.
      lettersSeen: new Set(
        progress.filter((r) => r.key.startsWith('letter:')).map((r) => r.key),
      ).size,
      lessonAnswers: attempts.filter((a) => a.gameId === 'ogretmen').length,
      fastCorrect: attempts.filter((a) => a.correct && a.elapsedMs > 0 && a.elapsedMs < 3000)
        .length,
      bestCleanRun: longestCleanRun(attempts),
      activeDays: dayRows.filter((d) => d.attempts > 0).length,
    };
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

/* ------------------------------------------------------------------ *
 * Rozetler
 * ------------------------------------------------------------------ */

export interface BadgeState {
  id: string;
  unlockedAt: number | null;
  celebrated: boolean;
}

/** Kazanılmış rozetleri yazar ve YENİ kazanılanları döndürür. */
export async function syncBadges(snapshot: RewardSnapshot): Promise<string[]> {
  if (!(await dbAvailable())) return [];
  try {
    const earned = earnedBadges(snapshot);
    const existing = new Set((await db.badges.toArray()).map((b) => b.id));
    const fresh = earned.filter((id) => !existing.has(id));
    if (fresh.length > 0) {
      await db.badges.bulkPut(
        fresh.map((id) => ({ id, unlockedAt: Date.now(), celebrated: false })),
      );
    }
    return fresh;
  } catch {
    return [];
  }
}

/** Kutlaması gösterilmemiş rozetler. */
export async function uncelebratedBadges(): Promise<string[]> {
  if (!(await dbAvailable())) return [];
  try {
    const rows = await db.badges.toArray();
    return rows.filter((b) => !b.celebrated).map((b) => b.id);
  } catch {
    return [];
  }
}

export async function markCelebrated(ids: string[]): Promise<void> {
  if (ids.length === 0 || !(await dbAvailable())) return;
  try {
    const rows = await db.badges.bulkGet(ids);
    await db.badges.bulkPut(
      rows.filter((r): r is NonNullable<typeof r> => Boolean(r)).map((r) => ({
        ...r,
        celebrated: true,
      })),
    );
  } catch {
    /* kutlama işareti kaydedilemezse en fazla bir kez daha gösterilir */
  }
}

/** Bütün rozetlerin durumu — kazanılmış ve kazanılmamış. */
export async function badgeStates(): Promise<BadgeState[]> {
  const unlocked = new Map<string, { unlockedAt: number; celebrated: boolean }>();
  if (await dbAvailable()) {
    try {
      for (const row of await db.badges.toArray()) {
        unlocked.set(row.id, { unlockedAt: row.unlockedAt, celebrated: row.celebrated });
      }
    } catch {
      /* okunamadıysa hepsi kilitli görünür */
    }
  }
  return BADGES.map((b) => ({
    id: b.id,
    unlockedAt: unlocked.get(b.id)?.unlockedAt ?? null,
    celebrated: unlocked.get(b.id)?.celebrated ?? false,
  }));
}
