/**
 * Ödev kanıtını veritabanından toplar.
 *
 * NEDEN AYRI DOSYA: `assignments.ts` saf ve test edilebilir — kural
 * orada. Burası kuralın baktığı veriyi getiriyor. Karıştırılsaydı ödev
 * kurallarını test etmek için IndexedDB kurmak gerekirdi.
 *
 * NEDEN "ÖDEVDEN SONRAKİ" CEVAPLAR: Ödev bir zaman aralığıdır. Sınır
 * konmasaydı dün yapılan çalışma bugünün ödevini bitirmiş sayılırdı ve
 * ödev vermek anlamsızlaşırdı.
 */
import { db, dbAvailable } from '@/lib/db';
import { readLessonProgress } from '@/features/teacher/lesson';
import type { AssignmentEvidence } from '@/features/teacher/assignments';

const BOS: AssignmentEvidence = {
  lessonsDone: new Set(),
  correctByGame: new Map(),
  totalByGame: new Map(),
  touchedKeys: new Set(),
  correct: 0,
  total: 0,
  hints: 0,
};

/** `since` (epoch ms) anından sonraki bütün çalışma. */
export async function collectEvidence(since: number): Promise<AssignmentEvidence> {
  const lessons = readLessonProgress();
  const lessonsDone = new Set(
    Object.entries(lessons.done)
      .filter(([, at]) => at >= since)
      .map(([id]) => id),
  );

  if (!(await dbAvailable())) return { ...BOS, lessonsDone };

  // `at` indeksli: bütün geçmişi taramak yerine aralık sorgusu.
  const rows = await db.attempts.where('at').above(since).toArray();

  const ev: AssignmentEvidence = {
    lessonsDone,
    correctByGame: new Map(),
    totalByGame: new Map(),
    touchedKeys: new Set(),
    correct: 0,
    total: 0,
    hints: 0,
  };

  for (const r of rows) {
    ev.total += 1;
    ev.hints += r.hintsUsed;
    if (r.correct) ev.correct += 1;

    ev.totalByGame.set(r.gameId, (ev.totalByGame.get(r.gameId) ?? 0) + 1);
    if (r.correct) {
      ev.correctByGame.set(r.gameId, (ev.correctByGame.get(r.gameId) ?? 0) + 1);
      /*
       * Tekrar görevi yalnızca DOĞRU cevaplanan öğeyi sayıyor.
       * Yanlış cevap da çalışmadır ama "tekrar ettim" demek için
       * öğenin hatırlanmış olması gerekir; yoksa on kez yanlış
       * cevaplayan öğrenci ödevi bitirmiş görünürdü.
       */
      ev.touchedKeys.add(r.key);
    }
  }

  return ev;
}
