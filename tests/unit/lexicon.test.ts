/**
 * Sözlük bütünlüğü.
 *
 * Cinsiyet İbranicede uyumun kaynağıdır: yanlış ya da eksik bir cinsiyet,
 * öğrenciye yanlış sıfat uyumu öğretir ve bu hata sonradan çok zor
 * düzelir. Bu yüzden kontroller sert.
 */
import { describe, expect, it } from 'vitest';
import {
  HOMOGRAPHS,
  LEXICON_ISSUES,
  LEXICON_STATS,
  TOPICS,
  WORDS,
} from '@/data/lexicon';

describe('sözlük bütünlüğü', () => {
  it('hiçbir satır reddedilmez', () => {
    const report = LEXICON_ISSUES.map((i) => `${i.line} → ${i.reason}`).join('\n');
    expect(LEXICON_ISSUES.length, `Reddedilen satırlar:\n${report}`).toBe(0);
  });

  it('her isim ve sıfatın cinsiyeti var', () => {
    for (const w of WORDS) {
      if (w.wordClass === 'noun' || w.wordClass === 'adjective') {
        expect(w.gender, `${w.id} cinsiyetsiz`).toBeDefined();
      }
    }
  });

  it('harekesiz yazımda hiç hareke kalmaz — seslendirmeye bu gider', () => {
    const MARKS = /[\u0591-\u05C7]/;
    for (const w of WORDS) {
      expect(MARKS.test(w.plain), `${w.id} → ${w.plain}`).toBe(false);
      if (w.plural) {
        expect(MARKS.test(w.plural.plain), `${w.id} çoğul → ${w.plural.plain}`).toBe(false);
      }
    }
  });

  it('her kelimenin okunuşu ve Türkçesi dolu', () => {
    for (const w of WORDS) {
      expect(w.translit.length, w.id).toBeGreaterThan(0);
      expect(w.tr.length, w.id).toBeGreaterThan(0);
      expect(w.vocalized.length, w.id).toBeGreaterThan(0);
    }
  });

  it('kimlikler tekil', () => {
    expect(new Set(WORDS.map((w) => w.id)).size).toBe(WORDS.length);
  });

  it('yeterli hacim ve konu çeşitliliği var', () => {
    expect(LEXICON_STATS.total).toBeGreaterThan(300);
    expect(TOPICS.length).toBeGreaterThan(15);
    expect(LEXICON_STATS.byClass.noun).toBeGreaterThan(200);
    expect(LEXICON_STATS.byClass.adjective).toBeGreaterThan(30);
    // Her iki cinsiyet de uyum alıştırması için yeterli sayıda olmalı.
    expect(LEXICON_STATS.masculine).toBeGreaterThan(50);
    expect(LEXICON_STATS.feminine).toBeGreaterThan(50);
  });

  it('eş yazımlılar gerçekten farklı harekeli biçimler', () => {
    for (const g of HOMOGRAPHS) {
      const vocalized = g.words.map((w) => w.vocalized);
      expect(new Set(vocalized).size, `${g.plain} aynı harekeli biçimi tekrarlıyor`).toBe(
        vocalized.length,
      );
    }
  });

  it('A1 seviyesi günlük hayatın çekirdeğini kapsar', () => {
    const a1 = WORDS.filter((w) => w.cefr === 'A1').map((w) => w.plain);
    for (const must of ['בית', 'מים', 'לחם', 'ילד', 'יום', 'ספר', 'יד']) {
      expect(a1, `${must} A1'de yok`).toContain(must);
    }
  });
});
