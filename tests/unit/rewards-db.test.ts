/**
 * Ödül katmanının veritabanı davranışı.
 *
 * NEDEN GERÇEK BİR VERİTABANIYLA: Buradaki asıl risk hesap değil,
 * EŞZAMANLILIK. Her cevap iki ayrı yazma tetikliyor — biri tekrar
 * programına (`recordAnswer`), öteki ödül katmanına (`awardAnswer`) —
 * ve ikisi AYNI gün satırına dokunuyor. Saf birim testi bunu göremez.
 *
 * Bir kez ölçüldü ve gerçekten oldu: ikisi işlem (transaction) dışında
 * oku-değiştir-yaz yapınca XP birikiyor ama `attempts` sıfırlanıyor,
 * dolayısıyla seri hep 0 kalıyordu. Aşağıdaki test tam olarak o durumu
 * kuruyor.
 */
import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { db, today, wipeProgress } from '@/lib/db';
import { recordAnswer } from '@/lib/progress';
import {
  awardAnswer,
  badgeStates,
  longestCleanRun,
  rewardSnapshot,
  syncBadges,
  totalXp,
} from '@/lib/rewards';

beforeEach(async () => {
  await wipeProgress();
});

describe('XP yazımı', () => {
  it('kazanılan XP gün satırına yazılıyor', async () => {
    const r = await awardAnswer({ correct: true, elapsedMs: 5000, hintsUsed: 0 });
    expect(r).not.toBeNull();
    expect(r!.xp).toBeGreaterThan(0);
    expect(await totalXp()).toBe(r!.xp);
  });

  it('art arda cevaplarda toplam birikiyor', async () => {
    let beklenen = 0;
    for (let i = 0; i < 5; i++) {
      const r = await awardAnswer({ correct: true, elapsedMs: 5000, hintsUsed: 0 });
      beklenen += r!.xp;
    }
    expect(await totalXp()).toBe(beklenen);
  });

  it('cevap kaydı ile ödül kaydı BİRBİRİNİ EZMİYOR', async () => {
    /*
     * İkisi eşzamanlı başlatılıyor — gerçek kullanımda da öyle oluyor,
     * `commit()` ikisini de beklemeden çağırıyor. İşlem dışında
     * oku-değiştir-yaz yapılsaydı biri ötekinin alanını eski değerine
     * döndürürdü.
     */
    await Promise.all([
      recordAnswer('verb:test:paal:present', 'kok-avcisi', {
        correct: true,
        elapsedMs: 1200,
        hintsUsed: 0,
        mode: 'choice',
      }),
      awardAnswer({ correct: true, elapsedMs: 1200, hintsUsed: 0 }),
    ]);

    const row = await db.days.get(today());
    expect(row, 'gün satırı yazılmadı').toBeDefined();
    expect(row!.attempts, 'cevap sayısı ödül yazımıyla ezilmiş').toBe(1);
    expect(row!.xp ?? 0, 'XP cevap kaydıyla ezilmiş').toBeGreaterThan(0);
  });

  it('on eşzamanlı cevapta hiçbir kayıt kaybolmuyor', async () => {
    const isler: Promise<unknown>[] = [];
    for (let i = 0; i < 10; i++) {
      isler.push(
        recordAnswer(`verb:test${i}:paal:present`, 'kok-avcisi', {
          correct: true,
          elapsedMs: 1500,
          hintsUsed: 0,
          mode: 'choice',
        }),
        awardAnswer({ correct: true, elapsedMs: 1500, hintsUsed: 0 }),
      );
    }
    await Promise.all(isler);

    const row = await db.days.get(today());
    expect(row!.attempts).toBe(10);
    expect(row!.xp ?? 0).toBeGreaterThan(0);
  });

  it('seri, bugün çalışılınca 1 oluyor', async () => {
    await recordAnswer('verb:test:paal:present', 'kok-avcisi', {
      correct: true,
      elapsedMs: 1000,
      hintsUsed: 0,
      mode: 'choice',
    });
    await awardAnswer({ correct: true, elapsedMs: 1000, hintsUsed: 0 });
    const snap = await rewardSnapshot();
    expect(snap.streak).toBe(1);
    expect(snap.activeDays).toBe(1);
  });
});

describe('özet', () => {
  it('boş veritabanında her sayaç sıfır', async () => {
    const s = await rewardSnapshot();
    expect(s.totalXp).toBe(0);
    expect(s.correct).toBe(0);
    expect(s.streak).toBe(0);
    expect(s.touched).toBe(0);
  });

  it('öğretmen modundaki cevaplar ayrı sayılıyor', async () => {
    await recordAnswer('word:test:noun', 'ogretmen', {
      correct: true,
      elapsedMs: 900,
      hintsUsed: 0,
      mode: 'choice',
    });
    await recordAnswer('word:test2:noun', 'kok-avcisi', {
      correct: true,
      elapsedMs: 900,
      hintsUsed: 0,
      mode: 'choice',
    });
    const s = await rewardSnapshot();
    expect(s.lessonAnswers).toBe(1);
    expect(s.attempts).toBe(2);
  });

  it('hızlı doğrular sayılıyor, yavaşlar sayılmıyor', async () => {
    await recordAnswer('word:h1:noun', 'oyun', {
      correct: true,
      elapsedMs: 1200,
      hintsUsed: 0,
      mode: 'choice',
    });
    await recordAnswer('word:h2:noun', 'oyun', {
      correct: true,
      elapsedMs: 8000,
      hintsUsed: 0,
      mode: 'choice',
    });
    expect((await rewardSnapshot()).fastCorrect).toBe(1);
  });
});

describe('ipucusuz seri', () => {
  const at = (correct: boolean, hintsUsed: number, ms: number) => ({
    key: 'k',
    gameId: 'g',
    correct,
    elapsedMs: 0,
    hintsUsed,
    at: ms,
    day: '2026-01-01',
  });

  it('boş listede sıfır', () => {
    expect(longestCleanRun([])).toBe(0);
  });

  it('en uzun kesintisiz diziyi buluyor', () => {
    expect(
      longestCleanRun([at(true, 0, 1), at(true, 0, 2), at(false, 0, 3), at(true, 0, 4)]),
    ).toBe(2);
  });

  it('ipucu seriyi kırıyor', () => {
    expect(longestCleanRun([at(true, 0, 1), at(true, 1, 2), at(true, 0, 3)])).toBe(1);
  });

  it('sıra zamana göre kuruluyor, dizideki sıraya göre değil', () => {
    expect(longestCleanRun([at(true, 0, 3), at(true, 0, 1), at(true, 0, 2)])).toBe(3);
  });
});

describe('rozetler', () => {
  it('ölçüt sağlanınca yazılıyor ve bir daha YENİ sayılmıyor', async () => {
    const snap = { ...(await rewardSnapshot()), correct: 1 };
    const ilk = await syncBadges(snap);
    expect(ilk).toContain('ilk-adim');

    const ikinci = await syncBadges(snap);
    expect(ikinci, 'aynı rozet iki kez kutlanıyor').toEqual([]);
  });

  it('durum listesi kazanılmışları işaretliyor', async () => {
    await syncBadges({ ...(await rewardSnapshot()), correct: 1 });
    const states = await badgeStates();
    const ilk = states.find((b) => b.id === 'ilk-adim');
    expect(ilk?.unlockedAt).not.toBeNull();
    // Kazanılmamışlar da listede duruyor — ölçütleri görünsün diye.
    expect(states.find((b) => b.id === 'ay')?.unlockedAt).toBeNull();
    expect(states.length).toBeGreaterThan(5);
  });

  it('ilerleme silinince rozetler de siliniyor', async () => {
    await syncBadges({ ...(await rewardSnapshot()), correct: 1 });
    await wipeProgress();
    const states = await badgeStates();
    expect(states.every((b) => b.unlockedAt === null)).toBe(true);
  });
});
