/**
 * Ödül motoru testleri.
 *
 * NEDEN AYRINTILI: Bu sayılar öğrencinin gördüğü tek geri bildirim.
 * Bir hesap hatası "neden 14 XP aldım" sorusunu cevapsız bırakır ve
 * sessizce yıllarca sürer. Ayrıca sistemin ASIL riski şişmedir: her
 * tıklamaya bol puan veren bir kurgu önce heyecan verir, sonra sayılar
 * anlamını yitirir. Aşağıdaki testlerin bir kısmı doğrudan bunu bekliyor.
 */
import { describe, expect, it } from 'vitest';
import {
  BADGES,
  DAILY_GOALS,
  DEFAULT_GOAL,
  RANKS,
  earnedBadges,
  goalXp,
  rankFor,
  rewardFor,
  streakMultiplier,
  type RewardSnapshot,
} from '@/engine/reward';

const answer = (over: Partial<Parameters<typeof rewardFor>[0]> = {}) =>
  rewardFor({ correct: true, elapsedMs: 8000, hintsUsed: 0, ...over });

describe('XP hesabı', () => {
  it('doğru cevap yanlıştan belirgin biçimde değerli', () => {
    const dogru = answer().xp;
    const yanlis = answer({ correct: false }).xp;
    expect(dogru).toBeGreaterThan(yanlis * 3);
  });

  it('yanlış cevap yine de puan alır — cesaret kırmıyoruz', () => {
    expect(answer({ correct: false }).xp).toBeGreaterThan(0);
  });

  it('hız ödülü var ama küçük — tahmin etmeyi ödüllendirmiyoruz', () => {
    const hizli = answer({ elapsedMs: 1500 }).xp;
    const yavas = answer({ elapsedMs: 9000 }).xp;
    expect(hizli).toBeGreaterThan(yavas);
    // Hızlı yanlış, yavaş doğrudan iyi OLMAMALI.
    expect(hizli).toBeLessThan(answer({ correct: false }).xp * 4 + yavas);
    expect(hizli - yavas).toBeLessThanOrEqual(5);
  });

  it('ipucu puanı düşürür ama sıfırlamaz', () => {
    const ipucusuz = answer().xp;
    const ipuculu = answer({ hintsUsed: 1 }).xp;
    expect(ipuculu).toBeLessThan(ipucusuz);
    expect(ipuculu).toBeGreaterThanOrEqual(1);
  });

  it('en düşük değer 1 — hiçbir cevap sıfır etmiyor', () => {
    expect(answer({ correct: false, hintsUsed: 5 }).xp).toBeGreaterThanOrEqual(1);
  });

  it('zor seviye daha çok değer', () => {
    expect(answer({ cefr: 'B2' }).xp).toBeGreaterThan(answer({ cefr: 'A1' }).xp);
  });

  it('seri çarpanı %50 ile sınırlı — bir gün kaçırmak felaket olmamalı', () => {
    expect(streakMultiplier(0)).toBe(1);
    expect(streakMultiplier(3)).toBeCloseTo(1.24, 2);
    expect(streakMultiplier(100)).toBe(1.5);
  });

  it('parçalar toplamı sonuca yakın — gösterilen döküm uydurma değil', () => {
    const r = answer({ elapsedMs: 1200, hintsUsed: 1, cefr: 'B1', streak: 5 });
    const sum = r.parts.reduce((n, p) => n + p.amount, 0);
    expect(Math.abs(sum - r.xp)).toBeLessThanOrEqual(1);
  });

  it('elli doğru cevap bir rütbe atlatmıyor — şişme yok', () => {
    const fifty = answer().xp * 50;
    expect(fifty).toBeLessThan(RANKS[2]!.at);
  });
});

describe('rütbeler', () => {
  it('eşikler artan sırada ve sıfırdan başlıyor', () => {
    expect(RANKS[0]!.at).toBe(0);
    for (let i = 1; i < RANKS.length; i++) {
      expect(RANKS[i]!.at).toBeGreaterThan(RANKS[i - 1]!.at);
    }
  });

  it('her rütbenin İbranice karşılığı var — ödül aynı zamanda kelime', () => {
    for (const r of RANKS) {
      expect(r.he, r.name).toMatch(/[֐-׿]/);
      expect(r.blurb.length).toBeGreaterThan(8);
    }
  });

  it('sıfır XP ilk rütbe', () => {
    const s = rankFor(0);
    expect(s.index).toBe(0);
    expect(s.next?.at).toBe(RANKS[1]!.at);
  });

  it('eşiğin tam üstünde bir sonraki rütbeye geçiyor', () => {
    expect(rankFor(RANKS[1]!.at).index).toBe(1);
    expect(rankFor(RANKS[1]!.at - 1).index).toBe(0);
  });

  it('son rütbede ilerleme tam ve sonraki yok', () => {
    const s = rankFor(RANKS.at(-1)!.at + 5000);
    expect(s.next).toBeNull();
    expect(s.progress).toBe(1);
    expect(s.remaining).toBe(0);
  });

  it('ilerleme 0 ile 1 arasında kalıyor', () => {
    for (const xp of [0, 1, 299, 300, 1500, 9999, 23999]) {
      const s = rankFor(xp);
      expect(s.progress, `xp=${xp}`).toBeGreaterThanOrEqual(0);
      expect(s.progress, `xp=${xp}`).toBeLessThanOrEqual(1);
    }
  });

  it('negatif değer çökmüyor', () => {
    expect(rankFor(-100).index).toBe(0);
  });
});

describe('günlük hedef', () => {
  it('varsayılan hedef listede', () => {
    expect(DAILY_GOALS.some((g) => g.id === DEFAULT_GOAL)).toBe(true);
  });

  it('hedefler artan ve ulaşılabilir', () => {
    for (let i = 1; i < DAILY_GOALS.length; i++) {
      expect(DAILY_GOALS[i]!.xp).toBeGreaterThan(DAILY_GOALS[i - 1]!.xp);
    }
    // En hafif hedef birkaç doğru cevapla tutmalı; tutmazsa "hafif"
    // adı yalan olur.
    const birCevap = rewardFor({ correct: true, elapsedMs: 5000, hintsUsed: 0 }).xp;
    expect(DAILY_GOALS[0]!.xp / birCevap).toBeLessThanOrEqual(6);
  });

  it('bilinmeyen hedef varsayılana düşüyor', () => {
    expect(goalXp('yok' as never)).toBe(90);
  });
});

const EMPTY: RewardSnapshot = {
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

describe('rozetler', () => {
  it('kimlikler tekil', () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it('her rozet nasıl kazanılacağını ve ne anlama geldiğini söylüyor', () => {
    for (const b of BADGES) {
      expect(b.how.trim().length, b.id).toBeGreaterThan(8);
      expect(b.meaning.trim().length, b.id).toBeGreaterThan(15);
    }
  });

  it('boş kullanıcı hiçbir rozet almıyor', () => {
    expect(earnedBadges(EMPTY)).toEqual([]);
  });

  it('ilk doğru cevapta ilk rozet geliyor — erken bir kazanım şart', () => {
    expect(earnedBadges({ ...EMPTY, correct: 1 })).toContain('ilk-adim');
  });

  it('ölçüt sağlanınca rozet veriliyor', () => {
    expect(earnedBadges({ ...EMPTY, streak: 7 })).toContain('hafta');
    expect(earnedBadges({ ...EMPTY, streak: 30 })).toContain('ay');
    expect(earnedBadges({ ...EMPTY, lettersSeen: 22 })).toContain('alefbet');
    expect(earnedBadges({ ...EMPTY, strongVerbs: 50 })).toContain('kok-ustasi');
  });

  it('eşiğin altında rozet verilmiyor', () => {
    expect(earnedBadges({ ...EMPTY, streak: 6 })).not.toContain('hafta');
    expect(earnedBadges({ ...EMPTY, lettersSeen: 21 })).not.toContain('alefbet');
  });

  it('ilerleme göstergesi hedefi aşmıyor', () => {
    const dolu: RewardSnapshot = {
      totalXp: 99999,
      correct: 99999,
      attempts: 99999,
      streak: 999,
      touched: 9999,
      strong: 9999,
      strongVerbs: 9999,
      lettersSeen: 99,
      lessonAnswers: 9999,
      fastCorrect: 9999,
      bestCleanRun: 9999,
      activeDays: 9999,
    };
    for (const b of BADGES) {
      const p = b.progress?.(dolu);
      if (!p) continue;
      expect(p.at, b.id).toBeLessThanOrEqual(p.of);
    }
  });

  it('her rozetin ölçütü gerçekten ulaşılabilir', () => {
    // Bütün sayaçları sonuna kadar açınca HER rozet düşmeli. Düşmeyen
    // bir rozet, ölçütü hiç sağlanamayan bir rozettir.
    const dolu: RewardSnapshot = {
      totalXp: 999999,
      correct: 999999,
      attempts: 999999,
      streak: 9999,
      touched: 99999,
      strong: 99999,
      strongVerbs: 99999,
      lettersSeen: 22,
      lessonAnswers: 99999,
      fastCorrect: 99999,
      bestCleanRun: 99999,
      activeDays: 99999,
    };
    expect(earnedBadges(dolu).length).toBe(BADGES.length);
  });
});
