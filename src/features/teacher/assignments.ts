/**
 * Ödev, görev ve not.
 *
 * NEDEN ÖDEV VAR: Uygulama şu ana kadar "canın isterse çalış" diyordu.
 * Bir öğretmenin öğrenciden farkı, işi ADLANDIRMASI ve ARKASINI
 * SORMASIDIR: "bunu yarına kadar yap" diyen biri olmadan çoğu kişi
 * yarın açmaz. Ödev bir baskı aracı değil, bir sözleşme: ne yapılacağı
 * belli, ne zamana kadar belli, yapılıp yapılmadığı ÖLÇÜLEBİLİR.
 *
 * NEDEN HER MADDE ÖLÇÜLEBİLİR: "Kelime çalış" bir ödev değildir, çünkü
 * yapıldığı doğrulanamaz. Buradaki her madde uygulamanın zaten tuttuğu
 * bir veriye bakıyor:
 *   ders   → o ders ödevden SONRA tamamlandı mı (lesson progress)
 *   oyun   → o oyunda ödevden sonra kaç doğru verildi (attempts)
 *   tekrar → verilen öğelerden kaçı ödevden sonra çalışıldı (attempts)
 * Hiçbiri öğrencinin beyanına dayanmıyor; "yaptım" düğmesi yok.
 *
 * NEDEN NOT DONDURULUYOR: Not, teslim anının fotoğrafıdır. Canlı
 * hesaplansaydı dünkü ödevin notu bugün çalıştıkça değişirdi ve karne
 * diye bir şey olmazdı.
 *
 * NEDEN YAPAY ZEKÂ YOK: Ödevin verilmesi de notlandırılması da ölçülen
 * veriden çıkıyor. Modele sorulsaydı her açılışta başka ödev çıkar,
 * çevrimdışı hiç çalışmaz ve not tartışılabilir olurdu. Modelin işi
 * açık uçlu cevabı yorumlamak (bkz. lib/ai.ts `degerlendirme`), ödevi
 * uydurmak değil.
 */
import type { LessonGroupId, LessonMeta, LessonProgress } from '@/features/teacher/lesson';
import type { PlacementResult, SkillId } from '@/features/teacher/placement';
import type { CEFR } from '@/types/hebrew';

export type TaskKind = 'ders' | 'oyun' | 'tekrar';

export interface AssignmentTask {
  kind: TaskKind;
  /** Ekranda görünen iş. */
  title: string;
  /** Ders kimliği ya da oyun kimliği. */
  targetId?: string;
  /** Tekrar görevinde ölçülecek öğe anahtarları. */
  itemKeys?: string[];
  /** Kaç doğru cevap gerekiyor (oyun ve tekrar görevlerinde). */
  need: number;
  /** Nereye gidilecek. */
  to: string;
}

export interface Assignment {
  id: string;
  title: string;
  /** Öğretmenin bu ödevi neden verdiği — öğrenci görüyor. */
  reason: string;
  tasks: AssignmentTask[];
  /** YYYY-MM-DD. */
  assignedDay: string;
  dueDay: string;
  /** epoch ms — "bundan sonraki cevaplar sayılır" sınırı. */
  assignedAt: number;
  /** Teslim edildiğinde dondurulan not. */
  result?: AssignmentResult;
}

export interface AssignmentResult {
  score: number;
  letter: string;
  comment: string;
  submittedAt: number;
  /** Zamanında mı teslim edildi. */
  onTime: boolean;
}

/* ------------------------------------------------------------------ *
 * Ödev üretimi
 * ------------------------------------------------------------------ */

/** Zayıf beceri → o beceriyi çalıştıran oyun. */
const SKILL_GAME: Record<SkillId, { id: string; title: string }> = {
  harf: { id: 'harf-avi', title: 'Harf Avı' },
  hareke: { id: 'hareke-ustasi', title: 'Hareke Ustası' },
  kelime: { id: 'kelime-esleme', title: 'Kelime Eşleme' },
  kok: { id: 'kok-avcisi', title: 'Kök Avcısı' },
  fiil: { id: 'zaman-makinesi', title: 'Zaman Makinesi' },
  cumle: { id: 'cumle-kurucu', title: 'Cümle Kurucu' },
};

export interface AssignInput {
  day: string;
  now: number;
  level: CEFR;
  placement: PlacementResult | null;
  progress: LessonProgress;
  lessons: LessonMeta[];
  /** Tekrar bekleyen öğe anahtarları. */
  dueKeys: string[];
}

/** Bir günün ödevi — en fazla üç madde. */
export const TASK_MAX = 3;

/**
 * NEDEN ÜÇ MADDE: Ödev bitirilebilir olmalı. Beş maddelik bir ödev
 * yarım kalır ve yarım kalan ödev, hiç verilmemiş ödevden daha
 * caydırıcıdır — öğrenci "zaten yetişemiyorum" der.
 */
export function buildAssignment(input: AssignInput): Assignment | null {
  const { day, now, placement, progress, lessons, dueKeys } = input;

  const tasks: AssignmentTask[] = [];
  const notDone = (m: LessonMeta) => !progress.done[m.id];

  // 1) Bir ders — zayıf alandan varsa ondan, yoksa sıradaki.
  const weakGroups = new Set<LessonGroupId>(
    (placement?.weak ?? []).map((s) =>
      s === 'harf' || s === 'hareke'
        ? 'okuma'
        : s === 'kelime'
          ? 'soz'
          : s === 'kok'
            ? 'kok'
            : s === 'fiil'
              ? 'zaman'
              : 'yapi',
    ),
  );
  const ders =
    lessons.find((m) => notDone(m) && weakGroups.has(m.group)) ?? lessons.find(notDone);

  if (ders) {
    tasks.push({
      kind: 'ders',
      title: ders.title,
      targetId: ders.id,
      need: 1,
      to: `/ogretmen/${ders.id}`,
    });
  }

  // 2) Tekrar — unutulmak üzere olan öğeler.
  if (dueKeys.length > 0) {
    const need = Math.min(10, dueKeys.length);
    tasks.push({
      kind: 'tekrar',
      title: `${need} öğeyi tekrar et`,
      itemKeys: dueKeys.slice(0, 40),
      need,
      to: '/ilerleme',
    });
  }

  // 3) Bir oyun — zayıf beceriyi çalıştıran.
  const zayif = placement?.weak[0];
  const oyun = zayif ? SKILL_GAME[zayif] : SKILL_GAME.kelime;
  tasks.push({
    kind: 'oyun',
    title: `${oyun.title} — 10 doğru`,
    targetId: oyun.id,
    need: 10,
    to: `/oyunlar/${oyun.id}`,
  });

  if (tasks.length === 0) return null;

  const reason = zayif
    ? `Sınavda ${zayif === 'fiil' ? 'fiil çekiminde' : 'bu alanda'} zorlandın; ödev oraya yükleniyor.`
    : 'Bugünün işi: bir yeni konu, bir tekrar, bir alıştırma.';

  return {
    id: `odev-${day}`,
    title: `${day} ödevi`,
    reason,
    tasks: tasks.slice(0, TASK_MAX),
    assignedDay: day,
    dueDay: nextDay(day),
    assignedAt: now,
  };
}

/** YYYY-MM-DD → ertesi gün. `new Date(metin)` UTC sayar, o yüzden parçalanıyor. */
export function nextDay(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(y!, m! - 1, d! + 1);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${p(dt.getMonth() + 1)}-${p(dt.getDate())}`;
}

/* ------------------------------------------------------------------ *
 * İlerleme ölçümü
 * ------------------------------------------------------------------ */

/** Ödevin ölçüleceği ham veri — çağıran taraf veritabanından toplar. */
export interface AssignmentEvidence {
  /** Ödevden sonra tamamlanan ders kimlikleri. */
  lessonsDone: Set<string>;
  /** Oyun kimliği → ödevden sonraki doğru cevap sayısı. */
  correctByGame: Map<string, number>;
  /** Oyun kimliği → ödevden sonraki toplam cevap sayısı. */
  totalByGame: Map<string, number>;
  /** Ödevden sonra çalışılan öğe anahtarları. */
  touchedKeys: Set<string>;
  /** Ödevden sonraki bütün cevaplar: doğru / toplam / ipucu. */
  correct: number;
  total: number;
  hints: number;
}

export interface TaskProgress {
  task: AssignmentTask;
  done: number;
  need: number;
  complete: boolean;
}

export function taskProgress(task: AssignmentTask, ev: AssignmentEvidence): TaskProgress {
  let done = 0;

  if (task.kind === 'ders') {
    done = task.targetId && ev.lessonsDone.has(task.targetId) ? 1 : 0;
  } else if (task.kind === 'oyun') {
    done = ev.correctByGame.get(task.targetId ?? '') ?? 0;
  } else {
    const keys = task.itemKeys ?? [];
    done = keys.filter((k) => ev.touchedKeys.has(k)).length;
  }

  return { task, done: Math.min(done, task.need), need: task.need, complete: done >= task.need };
}

export function assignmentComplete(a: Assignment, ev: AssignmentEvidence): boolean {
  return a.tasks.every((t) => taskProgress(t, ev).complete);
}

/* ------------------------------------------------------------------ *
 * Notlandırma
 * ------------------------------------------------------------------ */

export interface Grade {
  score: number;
  letter: string;
  comment: string;
}

/**
 * Harf karşılıkları.
 *
 * NEDEN "ZAYIF" YOK: Not öğrenciyi etiketlemek için değil, nerede
 * olduğunu söylemek için var. En alt basamak "tekrar" — yani yapılacak
 * bir iş, bir yargı değil.
 */
const SCALE: Array<{ min: number; letter: string; comment: string }> = [
  { min: 90, letter: 'pekiyi', comment: 'Konu oturmuş. Bir sonraki basamağa geçebiliriz.' },
  { min: 75, letter: 'iyi', comment: 'Sağlam. Birkaç ayrıntı dışında hazırsın.' },
  { min: 60, letter: 'orta', comment: 'Temel yerinde, hız ve kesinlik gelişecek.' },
  { min: 45, letter: 'geçer', comment: 'Yürüyor ama zorlanıyorsun; bu konuyu bir tur daha çalışalım.' },
  { min: 0, letter: 'tekrar', comment: 'Bu konu henüz oturmadı. Baştan, yavaşça bakacağız.' },
];

/**
 * Ödev notu.
 *
 * Ölçüt üç parça:
 *   - doğruluk (asıl ağırlık)
 *   - eksik bırakılan madde (yapılmayan iş puanı düşürür)
 *   - ipucu kullanımı (hafif etki)
 *
 * NEDEN ŞİŞİRME YOK: Ödül motorunun kuralı burada da geçerli. Her
 * ödeve "pekiyi" veren bir öğretmenin notu bilgi taşımaz; öğrenci de
 * ikinci haftadan sonra bakmaz.
 */
export function gradeAssignment(a: Assignment, ev: AssignmentEvidence): Grade {
  const tamamlanan = a.tasks.filter((t) => taskProgress(t, ev).complete).length;
  const oran = a.tasks.length > 0 ? tamamlanan / a.tasks.length : 0;

  // Hiç cevap verilmemişse doğruluk 0 sayılır — "veri yok" iyi not demek değil.
  const dogruluk = ev.total > 0 ? ev.correct / ev.total : 0;

  // İpucu cezası küçük: ipucu kullanmak öğrenmenin parçası, kopya değil.
  const ipucuCezasi = ev.total > 0 ? Math.min(0.1, (ev.hints / ev.total) * 0.2) : 0;

  const ham = (dogruluk * 0.6 + oran * 0.4 - ipucuCezasi) * 100;
  const score = Math.max(0, Math.min(100, Math.round(ham)));
  const basamak = SCALE.find((s) => score >= s.min) ?? SCALE[SCALE.length - 1]!;

  return { score, letter: basamak.letter, comment: basamak.comment };
}

/* ------------------------------------------------------------------ *
 * Kayıt
 * ------------------------------------------------------------------ */

const KEY = 'shoresh.assignments';

/** En fazla kaç ödev saklanıyor — karne bu kadar geriye bakar. */
const KEEP = 60;

export function readAssignments(): Assignment[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Assignment[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeAssignments(list: Assignment[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-KEEP)));
  } catch {
    /* gizli pencerede yazılamaz — ödev oturumluk kalır */
  }
}

/** Bugünün ödevi (varsa). */
export function todaysAssignment(list: Assignment[], day: string): Assignment | null {
  return list.find((a) => a.assignedDay === day) ?? null;
}

/**
 * Teslim: notu hesaplar ve DONDURUR.
 *
 * Aynı ödev iki kez teslim edilmiyor; ilk not kalıcı. Yeniden
 * hesaplanabilseydi öğrenci notu beğenmeyince tekrar deneyerek
 * yükseltirdi ve not, çalışmanın değil ısrarın ölçüsü olurdu.
 */
export function submitAssignment(
  a: Assignment,
  ev: AssignmentEvidence,
  now: number,
  today: string,
): Assignment {
  if (a.result) return a;
  const grade = gradeAssignment(a, ev);
  return {
    ...a,
    result: {
      ...grade,
      submittedAt: now,
      onTime: today <= a.dueDay,
    },
  };
}
