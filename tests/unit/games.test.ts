/**
 * Oyun üreteçlerinin sözleşme testleri.
 *
 * Soru üreteçleri katalogdan besleniyor; katalog değişince bir üreteç
 * sessizce bozulabilir (seçenek listesi tek elemana düşer, doğru cevap
 * seçenekler arasında bulunmaz gibi). Bu testler bunu yakalar.
 *
 * Rastgelelik dışarıdan veriliyor, böylece sonuç belirli olur.
 */
import { describe, expect, it } from 'vitest';
import { GAMES, buildQueue } from '@he/games/engine';
import type { CEFR } from '@he/types';

/** Belirli (deterministik) sözde-rastgele üreteç. */
function seeded(seed: number): () => number {
  let x = seed >>> 0;
  return () => {
    x = (x * 1664525 + 1013904223) >>> 0;
    return x / 0x100000000;
  };
}

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];

describe('oyun üreteçleri', () => {
  it('on bir oyun kayıtlı', () => {
    expect(GAMES).toHaveLength(11);
    expect(new Set(GAMES.map((g) => g.id)).size).toBe(11);
  });

  for (const game of GAMES) {
    for (const level of LEVELS) {
      it(`${game.title} — ${level} seviyesinde geçerli soru üretir`, () => {
        const queue = buildQueue(game, level, 10, seeded(42));
        expect(queue.length, 'kuyruk bos').toBeGreaterThan(0);

        for (const q of queue) {
          expect(q.prompt.length, 'bos soru metni').toBeGreaterThan(0);

          if (q.kind === 'choice') {
            // En az iki seçenek olmalı, yoksa soru sorulmuş sayılmaz.
            expect(q.options.length, 'tek secenek').toBeGreaterThanOrEqual(2);
            // Doğru cevap gerçekten seçenekler arasında olmalı.
            expect(q.answer).toBeGreaterThanOrEqual(0);
            expect(q.answer).toBeLessThan(q.options.length);
            expect(q.options[q.answer]!.length).toBeGreaterThan(0);
            // Seçenekler birbirinden farklı olmalı.
            expect(new Set(q.options).size).toBe(q.options.length);
            expect(q.explain.length).toBeGreaterThan(0);
          }

          if (q.kind === 'type') {
            expect(q.accept.length).toBeGreaterThan(0);
            expect(q.answer.length).toBeGreaterThan(0);
            expect(q.hints.length).toBeGreaterThan(0);
          }

          if (q.kind === 'order') {
            // Sıra dizisi, sözcük dizisinin bir permütasyonu olmalı.
            expect(q.order.length).toBe(q.tokens.length);
            expect([...q.order].sort((a, b) => a - b)).toEqual(
              q.tokens.map((_, i) => i),
            );
            // Doğru sıra gerçekten anlamlı bir cümle vermeli.
            expect(q.order.map((i) => q.tokens[i]).join(' ').length).toBeGreaterThan(0);
            expect(q.tokens.length).toBeGreaterThanOrEqual(3);
          }
        }
      });
    }
  }

  it('aynı soru bir tur içinde iki kez gelmez', () => {
    for (const game of GAMES) {
      const queue = buildQueue(game, 'B1', 10, seeded(7));
      /*
       * Ayirt edici anahtar motorun kullandiginin aynisi olmali.
       * Kulak Testi'nde soru metni her zaman "Ne duydun?" oldugu icin
       * anahtar `audio` alanini da tasimak zorunda; tasimazsa test
       * motoru degil kendini olcer.
       */
      const keys = queue.map((q) =>
        q.kind === 'order'
          ? `o|${q.audio}`
          : `${q.prompt}|${'display' in q ? (q.display ?? '') : ''}|${q.audio ?? ''}`,
      );
      expect(new Set(keys).size, game.title).toBe(keys.length);
    }
  });
});

describe('cümle kurucu sıralaması', () => {
  it('karıştırılmış diziden doğru sıra yeniden kurulabilir', () => {
    const game = GAMES.find((g) => g.id === 'cumle-kurucu')!;
    const queue = buildQueue(game, 'B2', 8, seeded(99));
    const orders = queue.filter((q) => q.kind === 'order');
    expect(orders.length).toBeGreaterThan(0);

    for (const q of orders) {
      if (q.kind !== 'order') continue;
      const rebuilt = q.order.map((i) => q.tokens[i]).join(' ');
      // Yeniden kurulan cümle, boşluk farkı dışında özgün cümleyle aynı
      // sözcükleri aynı sırada taşımalı.
      expect(rebuilt.split(' ').length).toBe(q.tokens.length);
    }
  });
});
