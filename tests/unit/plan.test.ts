/**
 * Günün ders programı testleri.
 *
 * Buradaki kurallar öğretmenin karakteri: yarım işi önce bitirtir,
 * tamamlanmış dersi tekrar önermez, sınavda zayıf çıkan beceriyi
 * atlamaz. Kural testle zorlanmazsa, arayüz değiştikçe sessizce
 * kaybolur.
 */
import { describe, expect, it } from 'vitest';
import { PLAN_MAX, buildDailyPlan, planMinutes, type PlanInput } from '@he/teacher/plan';
import { availableLessons, type LessonProgress } from '@he/teacher/lesson';
import type { PlacementResult, SkillId } from '@he/teacher/placement';

const LESSONS = availableLessons('A2');

function placement(over: Partial<PlacementResult> = {}): PlacementResult {
  const skills = {} as PlacementResult['skills'];
  for (const k of ['harf', 'hareke', 'kelime', 'kok', 'fiil', 'cumle'] as SkillId[]) {
    skills[k] = { asked: 3, correct: 2 };
  }
  return {
    level: 'A2',
    ability: 2.2,
    confidence: 'orta',
    skills,
    weak: [],
    strong: [],
    correct: 12,
    total: 18,
    at: Date.now(),
    ...over,
  };
}

const input = (over: Partial<PlanInput> = {}): PlanInput => ({
  placement: placement(),
  progress: { done: {} } as LessonProgress,
  level: 'A2',
  dueCount: 0,
  lessons: LESSONS,
  ...over,
});

describe('seviye bilinmiyorken', () => {
  it('tek madde önerilir ve o da sınavdır', () => {
    const plan = buildDailyPlan(input({ placement: null }));
    expect(plan).toHaveLength(1);
    expect(plan[0]!.kind).toBe('exam');
    expect(plan[0]!.to).toBe('/ogretmen/seviye-tespit');
  });

  it('tekrar bekleyen öğe olsa bile önce sınav istenir', () => {
    // Seviye bilinmeden "sıradaki ders" diye bir şey yok; program
    // uydurma bir sıra göstermektense tek işi söyler.
    const plan = buildDailyPlan(input({ placement: null, dueCount: 40 }));
    expect(plan.map((e) => e.kind)).toEqual(['exam']);
  });
});

describe('program sırası', () => {
  it('yarım kalan ders her zaman ilk sırada', () => {
    const open = LESSONS[3]!;
    const plan = buildDailyPlan(
      input({ progress: { done: {}, open: { id: open.id, step: 2 } }, dueCount: 9 }),
    );
    expect(plan[0]!.kind).toBe('resume');
    expect(plan[0]!.lessonId).toBe(open.id);
  });

  it('tekrar kuyruğu, yeni dersten önce gelir', () => {
    const plan = buildDailyPlan(input({ dueCount: 12 }));
    const review = plan.findIndex((e) => e.kind === 'review');
    const next = plan.findIndex((e) => e.kind === 'next');
    expect(review).toBeGreaterThanOrEqual(0);
    expect(review).toBeLessThan(next);
  });

  it('programda en fazla BİR "sıradaki ders" olur', () => {
    // Dört madde de "sıradaki konu bu" derse program seçilmiş değil,
    // doldurulmuş görünür.
    const plan = buildDailyPlan(input({ dueCount: 0 }));
    expect(plan.filter((e) => e.kind === 'next')).toHaveLength(1);
  });

  it('tekrar bekleyen yoksa tekrar maddesi görünmez', () => {
    expect(buildDailyPlan(input({ dueCount: 0 })).some((e) => e.kind === 'review')).toBe(false);
  });
});

describe('zayıf beceri', () => {
  it('sınavda zayıf çıkan beceri için ders önerilir', () => {
    const plan = buildDailyPlan(input({ placement: placement({ weak: ['fiil'] }) }));
    const weak = plan.find((e) => e.kind === 'weak');
    expect(weak).toBeDefined();
    // Fiil zayıfsa önerilen ders "zamanlar" kümesinden olmalı.
    const meta = LESSONS.find((m) => m.id === weak!.lessonId);
    expect(meta?.group).toBe('zaman');
  });

  it('okuma zayıfsa harf/hareke dersi önerilir', () => {
    const plan = buildDailyPlan(input({ placement: placement({ weak: ['harf'] }) }));
    const weak = plan.find((e) => e.kind === 'weak');
    const meta = LESSONS.find((m) => m.id === weak!.lessonId);
    expect(meta?.group).toBe('okuma');
  });

  it('gerekçe boş bırakılmaz — her madde nedenini söyler', () => {
    const plan = buildDailyPlan(input({ placement: placement({ weak: ['kelime'] }), dueCount: 5 }));
    for (const e of plan) expect(e.because.length).toBeGreaterThan(20);
  });
});

describe('sınırlar', () => {
  it('tamamlanmış ders önerilmez', () => {
    const done: Record<string, number> = {};
    for (const m of LESSONS.slice(0, 10)) done[m.id] = Date.now();
    const plan = buildDailyPlan(input({ progress: { done } }));
    for (const e of plan) {
      if (e.lessonId) expect(done[e.lessonId]).toBeUndefined();
    }
  });

  it('aynı ders iki kez önerilmez', () => {
    const plan = buildDailyPlan(
      input({ placement: placement({ weak: ['harf', 'hareke', 'kelime'] }) }),
    );
    const ids = plan.filter((e) => e.lessonId).map((e) => e.lessonId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('program PLAN_MAX maddeyi aşmaz', () => {
    const plan = buildDailyPlan(
      input({
        placement: placement({ weak: ['harf', 'hareke', 'kelime', 'kok', 'fiil', 'cumle'] }),
        dueCount: 30,
        progress: { done: {}, open: { id: LESSONS[0]!.id, step: 1 } },
      }),
    );
    expect(plan.length).toBeLessThanOrEqual(PLAN_MAX);
  });

  it('bütün dersler bitmişse program çökmez', () => {
    const done: Record<string, number> = {};
    for (const m of LESSONS) done[m.id] = Date.now();
    const plan = buildDailyPlan(input({ progress: { done }, dueCount: 3 }));
    expect(plan.every((e) => !e.lessonId)).toBe(true);
  });

  it('süre toplamı maddelerin toplamıdır', () => {
    const plan = buildDailyPlan(input({ dueCount: 4 }));
    expect(planMinutes(plan)).toBe(plan.reduce((s, e) => s + e.minutes, 0));
  });
});
