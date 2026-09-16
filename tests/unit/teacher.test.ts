/**
 * Öğretmen modu — ders motoru testleri.
 *
 * NEDEN: Dersler veriden ÜRETİLİYOR. Katalogdan bir fiil çıkarıldığında
 * ya da bir konu adı değiştiğinde ders sessizce boş kalabilir; kullanıcı
 * bunu "karta bastım, bir şey olmadı" diye yaşar. Burada her dersin
 * gerçekten kurulduğu, her adımın dolu olduğu ve her sorunun cevabının
 * kendi ölçütünden geçtiği doğrulanıyor.
 */
import { describe, expect, it } from 'vitest';
import {
  LESSONS,
  answerMatches,
  availableLessons,
  type Lesson,
} from '@/features/teacher/lesson';
import { VERB_BY_ID } from '@/data/catalog';
import { WORD_BY_ID } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import type { CEFR } from '@/types/hebrew';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];

/** Aynı tohumla kurulan ders her seferinde aynı olmalı. */
describe('ders kurulumu', () => {
  it('B2 seviyesinde her ders kurulabiliyor', () => {
    const failed = LESSONS.filter((m) => m.build('B2', 7) === null).map((m) => m.id);
    expect(failed, `kurulamayan dersler: ${failed.join(', ')}`).toEqual([]);
  });

  it('her seviyede en az bir ders var', () => {
    for (const level of LEVELS) {
      expect(availableLessons(level).length, `${level} seviyesinde ders yok`).toBeGreaterThan(0);
    }
  });

  it('aynı tohum aynı dersi verir — ders ortasında soru değişmez', () => {
    for (const m of LESSONS) {
      const a = m.build('B2', 42);
      const b = m.build('B2', 42);
      expect(JSON.stringify(a)).toBe(JSON.stringify(b));
    }
  });

  it('farklı tohum farklı soru üretir — yenile düğmesi işe yarıyor', () => {
    // Tek tek değil, TOPLUCA bakıyoruz: küçük havuzlu bir ders aynı
    // soruyu iki tohumda da seçebilir, bu bir hata değil. Hiçbir dersin
    // değişmemesi ise tohumun hiç kullanılmadığı anlamına gelir.
    const changed = LESSONS.filter(
      (m) => JSON.stringify(m.build('B2', 1)) !== JSON.stringify(m.build('B2', 999)),
    );
    expect(changed.length).toBeGreaterThan(LESSONS.length / 2);
  });
});

describe('ders içeriği', () => {
  const all: Lesson[] = LESSONS.map((m) => m.build('B2', 7)).filter((l): l is Lesson => l !== null);

  it('her ders altı adımla akar: tanıtım, kural, örnek, birlikte, tek başına, özet', () => {
    for (const l of all) {
      expect(l.steps.map((s) => s.kind), l.id).toEqual([
        'intro',
        'rule',
        'model',
        'guided',
        'solo',
        'summary',
      ]);
    }
  });

  it('her adımın söylenecek cümlesi ve başlığı dolu', () => {
    for (const l of all) {
      for (const s of l.steps) {
        expect(s.say.trim().length, `${l.id}/${s.kind} say boş`).toBeGreaterThan(10);
        expect(s.title.trim().length, `${l.id}/${s.kind} title boş`).toBeGreaterThan(0);
      }
    }
  });

  it('anlatım adımları ya açıklama ya örnek taşır — boş ekran yok', () => {
    for (const l of all) {
      for (const s of l.steps) {
        if (s.question) continue;
        const filled = (s.lines?.length ?? 0) + (s.pieces?.length ?? 0);
        expect(filled, `${l.id}/${s.kind} içeriksiz`).toBeGreaterThan(0);
      }
    }
  });

  it('her ders iki soru sorar: biri ipuçlu, biri değil', () => {
    for (const l of all) {
      const withQ = l.steps.filter((s) => s.question);
      expect(withQ.length, l.id).toBe(2);
      expect(withQ[0]!.kind).toBe('guided');
      expect(withQ[1]!.kind).toBe('solo');
    }
  });
});

describe('sorular', () => {
  const all = LESSONS.map((m) => m.build('B2', 7)).filter((l): l is Lesson => l !== null);
  const questions = all.flatMap((l) =>
    l.steps.filter((s) => s.question).map((s) => ({ lesson: l.id, q: s.question! })),
  );

  it('doğru cevap kendi ölçütünden geçiyor', () => {
    for (const { lesson, q } of questions) {
      expect(answerMatches(q.answer, q.answer), lesson).toBe(true);
    }
  });

  it('şıklı soruda doğru cevap şıklar arasında ve şıklar tekil', () => {
    for (const { lesson, q } of questions) {
      if (!q.choices) continue;
      expect(new Set(q.choices).size, `${lesson} şıkları yineleniyor`).toBe(q.choices.length);
      const hits = q.choices.filter((c) => answerMatches(c, q.answer));
      expect(hits.length, `${lesson} doğru şık sayısı`).toBe(1);
    }
  });

  it('ipucu ve gerekçe boş değil — "yanlış" demek öğretmez', () => {
    for (const { lesson, q } of questions) {
      expect(q.hint.trim().length, `${lesson} ipucu boş`).toBeGreaterThan(5);
      expect(q.why.trim().length, `${lesson} gerekçe boş`).toBeGreaterThan(15);
    }
  });

  it('seslendirilecek metinde hareke yok — sentezleyiciyi yanıltır', () => {
    for (const { lesson, q } of questions) {
      expect(/[֑-ׇ]/.test(q.speak), `${lesson} speak harekeli`).toBe(false);
    }
  });

  it('SRS kaynağı gerçekten katalogda var — uydurma anahtar yok', () => {
    for (const { lesson, q } of questions) {
      if (!q.source) continue;
      const { kind, id } = q.source;
      const exists =
        kind === 'verb'
          ? VERB_BY_ID.has(id)
          : kind === 'word'
            ? WORD_BY_ID.has(id)
            : kind === 'phrase'
              ? PHRASES.some((p) => p.id === id)
              : false;
      expect(exists, `${lesson}: ${kind}:${id} katalogda yok`).toBe(true);
    }
  });
});

describe('cevap karşılaştırma', () => {
  it('hareke farkı cevabı bozmaz', () => {
    expect(answerMatches('כּוֹתֵב', 'כותב')).toBe(true);
  });

  it('sofit harf seçimi cevabı bozmaz — ekran klavyesinde tuzak kurmuyoruz', () => {
    expect(answerMatches('הולכ', 'הולך')).toBe(true);
    expect(answerMatches('אומרים', 'אומרים')).toBe(true);
  });

  it('boşluk ve kesme işareti önemsiz', () => {
    expect(answerMatches(' מה נשמע ', 'מה נשמע')).toBe(true);
  });

  it('gerçekten farklı kelime kabul edilmiyor', () => {
    expect(answerMatches('כותב', 'קורא')).toBe(false);
    expect(answerMatches('', 'כותב')).toBe(false);
  });
});
