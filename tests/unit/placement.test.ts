/**
 * Seviye tespit sınavı testleri.
 *
 * NEDEN BU TESTLER: Sınavın çıktısı öğrencinin göreceği bütün içeriği
 * belirliyor — yanlış ölçüm, aylarca yanlış seviyede çalışmak demek.
 * "Çalışıyor mu" diye sormuyoruz; sınavın KURALLARINI zorluyoruz:
 * her şeyi bilen B2 çıkmalı, hiçbir şey bilmeyen A1 çıkmalı, sınav
 * hiçbir öğrenciye cevaplayamayacağı bir soru sormamalı ve rapor
 * ölçmediği beceri hakkında hüküm vermemeli.
 *
 * Öğrenci taklit ediliyor: gerçek soru üreteçleri çalışıyor, cevabı
 * veren taraf simüle ediliyor. Böylece hem üreteçler hem sınav mantığı
 * birlikte sınanıyor.
 */
import { describe, expect, it } from 'vitest';
import {
  PLACEMENT_LENGTH,
  applyAnswer,
  finishPlacement,
  isPlacementDone,
  levelFromAbility,
  makeRng,
  nextItem,
  startPlacement,
  type PlacementResult,
  type SkillId,
} from '@/features/teacher/placement';

/**
 * Sınavı baştan sona koşturur.
 *
 * `answers(item)` öğrenciyi temsil eder: soruyu doğru cevaplayacak mı?
 */
function run(
  seed: number,
  answers: (difficulty: number, skill: SkillId, index: number) => boolean,
): PlacementResult {
  const rng = makeRng(seed);
  let state = startPlacement();
  let guard = 0;

  while (!isPlacementDone(state)) {
    if (++guard > PLACEMENT_LENGTH + 5) throw new Error('sınav bitmiyor');
    const item = nextItem(state, rng);
    expect(item).not.toBeNull();
    state = applyAnswer(state, item!, answers(item!.difficulty, item!.skill, item!.index), 6000);
  }

  return finishPlacement(state);
}

const perfect = () => true;
const clueless = () => false;

describe('seviye tahmini', () => {
  it('her şeyi bilen öğrenci B2 çıkar', () => {
    for (const seed of [1, 7, 42, 1234, 99999]) {
      expect(run(seed, perfect).level).toBe('B2');
    }
  });

  it('hiçbir şey bilmeyen öğrenci A1 çıkar', () => {
    for (const seed of [1, 7, 42, 1234, 99999]) {
      expect(run(seed, clueless).level).toBe('A1');
    }
  });

  it('yalnızca A1 sorularını bilen öğrenci A1 ya da A2 çıkar, daha yukarı değil', () => {
    for (const seed of [3, 11, 500]) {
      const level = run(seed, (d) => d <= 1).level;
      expect(['A1', 'A2']).toContain(level);
    }
  });

  it('B1 ve altını bilen öğrenci B2 çıkmaz', () => {
    for (const seed of [5, 13, 777]) {
      const level = run(seed, (d) => d <= 3).level;
      expect(['A2', 'B1']).toContain(level);
    }
  });

  it('yetenek sayısı her zaman 1–4 aralığında kalır', () => {
    for (const seed of [2, 8, 64]) {
      for (const student of [perfect, clueless]) {
        const r = run(seed, student);
        expect(r.ability).toBeGreaterThanOrEqual(1);
        expect(r.ability).toBeLessThanOrEqual(4);
      }
    }
  });
});

describe('sınavın kendisi', () => {
  it('tam olarak PLACEMENT_LENGTH soru sorar', () => {
    const r = run(21, (d) => d < 3);
    expect(r.total).toBe(PLACEMENT_LENGTH);
  });

  it('aynı soruyu iki kez sormaz', () => {
    const rng = makeRng(31);
    let state = startPlacement();
    while (!isPlacementDone(state)) {
      const item = nextItem(state, rng)!;
      state = applyAnswer(state, item, item.difficulty <= 2, 5000);
    }
    expect(new Set(state.askedKeys).size).toBe(state.askedKeys.length);
  });

  it('hiçbir soru yazarak cevaplanmaz — sınav klavyeyi değil dili ölçer', () => {
    const rng = makeRng(77);
    let state = startPlacement();
    while (!isPlacementDone(state)) {
      const item = nextItem(state, rng)!;
      expect(item.question.kind).not.toBe('type');
      state = applyAnswer(state, item, true, 5000);
    }
  });

  it('beceriler tek bir alana yığılmaz — en az dört beceri ölçülür', () => {
    const r = run(19, (d) => d <= 2);
    const olculen = (Object.keys(r.skills) as SkillId[]).filter((k) => r.skills[k].asked > 0);
    expect(olculen.length).toBeGreaterThanOrEqual(4);
  });

  it('ilk soru her zaman ısınma sorusudur — cümle dizme ya da fiil çekimi değil', () => {
    // Sınava giren biri ilk ekranda ağır bir soru görürse ölçüm
    // başlamadan biter. Tohumdan bağımsız olmalı.
    for (const seed of [1, 2, 3, 9, 55, 900, 12345]) {
      const first = nextItem(startPlacement(), makeRng(seed))!;
      expect(['harf', 'hareke', 'kelime']).toContain(first.skill);
    }
  });

  it('harf sorusu ileri seviyede sorulmaz', () => {
    const rng = makeRng(101);
    let state = startPlacement();
    while (!isPlacementDone(state)) {
      const item = nextItem(state, rng)!;
      if (item.skill === 'harf') expect(item.difficulty).toBeLessThanOrEqual(2);
      state = applyAnswer(state, item, true, 4000);
    }
  });
});

describe('rapor', () => {
  it('iki sorudan az sorulan beceri hakkında hüküm verilmez', () => {
    const r = run(23, clueless);
    for (const key of [...r.weak, ...r.strong]) {
      expect(r.skills[key].asked).toBeGreaterThanOrEqual(2);
    }
  });

  it('her şeyi bilen öğrencinin zayıf alanı yoktur', () => {
    expect(run(37, perfect).weak).toEqual([]);
  });

  it('hiçbir şey bilmeyen öğrencinin güçlü alanı yoktur', () => {
    expect(run(37, clueless).strong).toEqual([]);
  });

  it('tutarlı öğrencide güven düşük kalmaz', () => {
    // Uçlarda tahmin erken oturur; hâlâ "düşük" diyorsa güven ölçütü bozuktur.
    expect(run(41, perfect).confidence).not.toBe('düşük');
    expect(run(41, clueless).confidence).not.toBe('düşük');
  });
});

describe('seviye eşikleri', () => {
  it('sınırlar bitişik — arada boşluk yok', () => {
    expect(levelFromAbility(1)).toBe('A1');
    expect(levelFromAbility(1.79)).toBe('A1');
    expect(levelFromAbility(1.8)).toBe('A2');
    expect(levelFromAbility(2.79)).toBe('A2');
    expect(levelFromAbility(2.8)).toBe('B1');
    expect(levelFromAbility(3.69)).toBe('B1');
    expect(levelFromAbility(3.7)).toBe('B2');
    expect(levelFromAbility(4)).toBe('B2');
  });

  it('aralık dışı değerler kırpılır', () => {
    expect(levelFromAbility(-3)).toBe('A1');
    expect(levelFromAbility(99)).toBe('B2');
  });
});
