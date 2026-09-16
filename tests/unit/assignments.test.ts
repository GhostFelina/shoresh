/**
 * Ödev ve not testleri.
 *
 * Buradaki kurallar öğretmenin dürüstlüğü:
 *   - Ödev ölçülebilir olmalı ("yaptım" düğmesi yok).
 *   - Hiç çalışmayan öğrenci iyi not almamalı.
 *   - Not teslim anında donmalı; sonradan çalışınca değişmemeli.
 *   - Ödev bitirilebilir olmalı (en fazla üç madde).
 * Bunlar ekrana bakarak fark edilmez; testle tutuluyor.
 */
import { describe, expect, it } from 'vitest';
import {
  TASK_MAX,
  assignmentComplete,
  buildAssignment,
  gradeAssignment,
  nextDay,
  submitAssignment,
  taskProgress,
  type Assignment,
  type AssignmentEvidence,
} from '@he/teacher/assignments';
import { availableLessons, type LessonProgress } from '@he/teacher/lesson';
import type { PlacementResult, SkillId } from '@he/teacher/placement';

const LESSONS = availableLessons('A2');

function placement(weak: SkillId[] = []): PlacementResult {
  const skills = {} as PlacementResult['skills'];
  for (const k of ['harf', 'hareke', 'kelime', 'kok', 'fiil', 'cumle'] as SkillId[]) {
    skills[k] = { asked: 3, correct: 2 };
  }
  return {
    level: 'A2',
    ability: 2.2,
    confidence: 'orta',
    skills,
    weak,
    strong: [],
    correct: 12,
    total: 18,
    at: Date.now(),
  };
}

const bosKanit = (): AssignmentEvidence => ({
  lessonsDone: new Set(),
  correctByGame: new Map(),
  totalByGame: new Map(),
  touchedKeys: new Set(),
  correct: 0,
  total: 0,
  hints: 0,
});

const odev = (weak: SkillId[] = [], dueKeys: string[] = []): Assignment =>
  buildAssignment({
    day: '2026-09-17',
    now: 1_000_000,
    level: 'A2',
    placement: placement(weak),
    progress: { done: {} } as LessonProgress,
    lessons: LESSONS,
    dueKeys,
  })!;

describe('ödev üretimi', () => {
  it('en fazla üç madde — ödev bitirilebilir olmalı', () => {
    const a = odev(['fiil'], ['k1', 'k2', 'k3']);
    expect(a.tasks.length).toBeLessThanOrEqual(TASK_MAX);
  });

  it('her maddenin ölçülebilir bir hedefi var', () => {
    const a = odev(['kelime'], ['k1']);
    for (const t of a.tasks) {
      expect(t.need).toBeGreaterThan(0);
      expect(t.to.startsWith('/')).toBe(true);
      // Ders ve oyun maddeleri bir hedefe, tekrar maddesi anahtarlara bağlı.
      if (t.kind === 'tekrar') expect((t.itemKeys ?? []).length).toBeGreaterThan(0);
      else expect(t.targetId).toBeTruthy();
    }
  });

  it('zayıf alan varsa oyun maddesi oraya yöneliyor', () => {
    const a = odev(['kok']);
    const oyun = a.tasks.find((t) => t.kind === 'oyun');
    expect(oyun?.targetId).toBe('kok-avcisi');
  });

  it('tekrar bekleyen yoksa tekrar maddesi yazılmaz — uydurma iş verilmez', () => {
    const a = odev(['fiil'], []);
    expect(a.tasks.some((t) => t.kind === 'tekrar')).toBe(false);
  });

  it('teslim günü ertesi gün', () => {
    expect(odev().dueDay).toBe('2026-09-18');
  });

  it('ay ve yıl sonunda gün hesabı kaymıyor', () => {
    expect(nextDay('2026-09-30')).toBe('2026-10-01');
    expect(nextDay('2026-12-31')).toBe('2027-01-01');
    expect(nextDay('2028-02-28')).toBe('2028-02-29');
  });

  it('gerekçe boş bırakılmaz', () => {
    expect(odev(['fiil']).reason.length).toBeGreaterThan(20);
  });
});

describe('ilerleme ölçümü', () => {
  it('ders maddesi ancak ders tamamlanınca biter', () => {
    const a = odev();
    const ders = a.tasks.find((t) => t.kind === 'ders')!;
    const ev = bosKanit();
    expect(taskProgress(ders, ev).complete).toBe(false);

    ev.lessonsDone.add(ders.targetId!);
    expect(taskProgress(ders, ev).complete).toBe(true);
  });

  it('oyun maddesi yeterli DOĞRU cevap isteniyor — oynamak yetmiyor', () => {
    const a = odev(['kelime']);
    const oyun = a.tasks.find((t) => t.kind === 'oyun')!;
    const ev = bosKanit();

    ev.totalByGame.set(oyun.targetId!, 40);
    ev.correctByGame.set(oyun.targetId!, 3);
    expect(taskProgress(oyun, ev).complete).toBe(false);

    ev.correctByGame.set(oyun.targetId!, 10);
    expect(taskProgress(oyun, ev).complete).toBe(true);
  });

  it('tekrar maddesi verilen öğelere bakıyor, başka öğelere değil', () => {
    const a = odev([], ['a', 'b', 'c']);
    const tekrar = a.tasks.find((t) => t.kind === 'tekrar')!;
    const ev = bosKanit();

    // Başka öğeler çalışıldı — ödev ilerlememeli.
    ev.touchedKeys.add('x');
    ev.touchedKeys.add('y');
    expect(taskProgress(tekrar, ev).done).toBe(0);

    ev.touchedKeys.add('a');
    expect(taskProgress(tekrar, ev).done).toBe(1);
  });

  it('gösterilen ilerleme hedefi aşmıyor', () => {
    const a = odev(['kelime']);
    const oyun = a.tasks.find((t) => t.kind === 'oyun')!;
    const ev = bosKanit();
    ev.correctByGame.set(oyun.targetId!, 999);
    expect(taskProgress(oyun, ev).done).toBe(oyun.need);
  });

  it('ödev ancak bütün maddeler bitince tamamlanmış sayılır', () => {
    const a = odev([], ['a']);
    const ev = bosKanit();
    for (const t of a.tasks) {
      if (t.kind === 'ders') ev.lessonsDone.add(t.targetId!);
    }
    expect(assignmentComplete(a, ev)).toBe(false);
  });
});

describe('notlandırma', () => {
  it('hiç çalışmayan öğrenci iyi not almaz', () => {
    const g = gradeAssignment(odev(), bosKanit());
    expect(g.score).toBe(0);
    expect(g.letter).toBe('tekrar');
  });

  it('veri yokluğu iyi not sayılmaz', () => {
    // total = 0 iken doğruluk 1 sayılsaydı, uygulamayı hiç açmayan
    // öğrenci ödevden tam alırdı.
    const ev = bosKanit();
    ev.lessonsDone = new Set(odev().tasks.map((t) => t.targetId ?? ''));
    expect(gradeAssignment(odev(), ev).score).toBeLessThan(60);
  });

  it('her şeyi eksiksiz yapan öğrenci en üst basamağa çıkar', () => {
    const a = odev([], ['a', 'b']);
    const ev = bosKanit();
    for (const t of a.tasks) {
      if (t.kind === 'ders') ev.lessonsDone.add(t.targetId!);
      if (t.kind === 'oyun') ev.correctByGame.set(t.targetId!, t.need);
      if (t.kind === 'tekrar') for (const k of t.itemKeys!) ev.touchedKeys.add(k);
    }
    ev.correct = 40;
    ev.total = 40;
    const g = gradeAssignment(a, ev);
    expect(g.score).toBeGreaterThanOrEqual(90);
    expect(g.letter).toBe('pekiyi');
  });

  it('ipucu kullanmak notu uçurmaz — ipucu kopya değil', () => {
    const a = odev();
    const ev = bosKanit();
    for (const t of a.tasks) {
      if (t.kind === 'ders') ev.lessonsDone.add(t.targetId!);
      if (t.kind === 'oyun') ev.correctByGame.set(t.targetId!, t.need);
    }
    ev.correct = 30;
    ev.total = 30;

    const ipucusuz = gradeAssignment(a, { ...ev, hints: 0 }).score;
    const ipuculu = gradeAssignment(a, { ...ev, hints: 30 }).score;
    expect(ipucusuz - ipuculu).toBeLessThanOrEqual(10);
    expect(ipuculu).toBeLessThan(ipucusuz);
  });

  it('puan her zaman 0–100 arasında', () => {
    const a = odev();
    const ev = bosKanit();
    ev.correct = 100;
    ev.total = 1; // tutarsız veri
    const g = gradeAssignment(a, ev);
    expect(g.score).toBeGreaterThanOrEqual(0);
    expect(g.score).toBeLessThanOrEqual(100);
  });

  it('en alt basamak bir yargı değil, yapılacak bir iş', () => {
    expect(gradeAssignment(odev(), bosKanit()).comment).toMatch(/bakacağız|çalışalım/);
  });
});

describe('teslim', () => {
  it('not teslim anında donuyor — sonradan çalışmak değiştirmiyor', () => {
    const a = odev();
    const zayif = bosKanit();
    const teslim = submitAssignment(a, zayif, 2_000_000, '2026-09-18');
    const ilkPuan = teslim.result!.score;

    const guclu = bosKanit();
    guclu.correct = 50;
    guclu.total = 50;
    for (const t of a.tasks) {
      if (t.kind === 'ders') guclu.lessonsDone.add(t.targetId!);
      if (t.kind === 'oyun') guclu.correctByGame.set(t.targetId!, t.need);
    }

    const ikinci = submitAssignment(teslim, guclu, 3_000_000, '2026-09-18');
    expect(ikinci.result!.score).toBe(ilkPuan);
  });

  it('zamanında teslim işaretleniyor', () => {
    const a = odev();
    expect(submitAssignment(a, bosKanit(), 1, '2026-09-18').result!.onTime).toBe(true);
    expect(submitAssignment(a, bosKanit(), 1, '2026-09-25').result!.onTime).toBe(false);
  });
});
