/**
 * Günün ders programı — öğretmenin bugün ne yapacağına karar verdiği yer.
 *
 * NEDEN PROGRAM VAR: Yetmiş dersin listesi, öğrenciye "nereden
 * başlayayım" sorusunu her açılışta yeniden sordurur. Gerçek bir
 * öğretmen bunu sormaz; sınıfa girer ve "bugün şunu çalışıyoruz" der.
 * Seçimin gerekçesi de söylenir — öğrenci neden o dersi yaptığını
 * bilmiyorsa, ders keyfî görünür.
 *
 * NEDEN SAF FONKSİYON: Karar kuralları arayüzden ayrı tutuluyor ki
 * test edilebilsin. "Zayıf beceri önce gelir", "tamamlanmış ders
 * önerilmez" gibi kurallar ekranı açıp bakarak değil, testle zorlanıyor.
 *
 * NEDEN YAPAY ZEKÂ SEÇMİYOR: Bu karar için gereken her şey elimizde —
 * sınav sonucu, tamamlanan dersler, tekrar kuyruğu. Bir dil modeline
 * sorulsaydı her açılışta başka bir program çıkar, çevrimdışı hiç
 * çalışmaz ve öğrenci "dün neden başka şey demişti" derdi. Yapay zekâ
 * bu programı AÇIKLAMAK ve sohbetle işlemek için var, seçmek için değil.
 */
import type { LessonGroupId, LessonMeta, LessonProgress } from '@he/teacher/lesson';
import type { PlacementResult, SkillId } from '@he/teacher/placement';
import type { CEFR } from '@he/types';

/** Zayıf beceri → o beceriyi çalıştıran ders kümesi. */
const SKILL_GROUP: Record<SkillId, LessonGroupId> = {
  harf: 'okuma',
  hareke: 'okuma',
  kelime: 'soz',
  kok: 'kok',
  fiil: 'zaman',
  cumle: 'yapi',
};

export type PlanKind = 'exam' | 'resume' | 'weak' | 'review' | 'next';

export interface PlanEntry {
  kind: PlanKind;
  /** Ders kimliği (ders girdilerinde) — yoksa rotayla ayırt edilir. */
  lessonId?: string;
  title: string;
  subtitle: string;
  /** Öğretmenin gerekçesi — ekranda "neden bu" olarak duruyor. */
  because: string;
  to: string;
  minutes: number;
}

export interface PlanInput {
  placement: PlacementResult | null;
  progress: LessonProgress;
  level: CEFR;
  /** Bugün tekrar zamanı gelmiş öğe sayısı. */
  dueCount: number;
  /** `availableLessons(level)` çıktısı. */
  lessons: LessonMeta[];
}

/** Programda en fazla kaç madde olur. */
export const PLAN_MAX = 4;

/**
 * NEDEN DÖRT: Bir ders saatine sığan iş kadar. Daha uzun bir liste
 * "bitiremedim" duygusu üretir; günlük hedef zaten ödül sisteminde ayrı
 * tutuluyor ve orayla yarışmamalı.
 */
export function buildDailyPlan(input: PlanInput): PlanEntry[] {
  const { placement, progress, dueCount, lessons } = input;

  // Seviye bilinmiyorsa başka hiçbir öneri dürüst olmaz: hangi dersin
  // "sıradaki" olduğu bilinemez. Tek madde, tek iş.
  if (!placement) {
    return [
      {
        kind: 'exam',
        title: 'Seviye tespit sınavı',
        subtitle: '18 soru · yaklaşık 6 dakika',
        because:
          'Seviyeni ölçmeden ders seçmek, kitabı ortadan açmak gibi. Bir kez ölçelim, sonrası kendiliğinden gelsin.',
        to: '/ogretmen/seviye-tespit',
        minutes: 6,
      },
    ];
  }

  const out: PlanEntry[] = [];
  const used = new Set<string>();

  const push = (e: PlanEntry) => {
    if (out.length >= PLAN_MAX) return;
    if (e.lessonId && used.has(e.lessonId)) return;
    if (e.lessonId) used.add(e.lessonId);
    out.push(e);
  };

  const notDone = (m: LessonMeta) => !progress.done[m.id];

  // 1) Yarıda kalan ders — her zaman ilk sırada.
  // Yeni bir ders önerip yarım kalanı listenin altına atmak, öğrencinin
  // başladığı işi bitirmemesini öğretir.
  const open = progress.open;
  if (open) {
    const meta = lessons.find((m) => m.id === open.id);
    if (meta) {
      push({
        kind: 'resume',
        lessonId: meta.id,
        title: meta.title,
        subtitle: `${open.step + 1}. adımda kalmıştın`,
        because: 'Yarım kalan bir ders, hiç başlanmamış dersten daha değerli — önce onu kapatalım.',
        to: `/ogretmen/${meta.id}`,
        minutes: 4,
      });
    }
  }

  // 2) Tekrar kuyruğu — dünün bilgisi bugün unutulmadan.
  if (dueCount > 0) {
    push({
      kind: 'review',
      title: 'Tekrar zamanı',
      subtitle: `${dueCount} öğe tekrar bekliyor`,
      because:
        'Tekrar aralığı dolan öğeler tam unutulmak üzere olanlardır; bugün bakılırsa kalıcı olur, yarına kalırsa baştan öğrenilir.',
      to: '/ilerleme',
      minutes: 5,
    });
  }

  // 3) Zayıf beceriden ders — sınavın asıl karşılığı burada.
  for (const skill of placement.weak) {
    const group = SKILL_GROUP[skill];
    const meta = lessons.find((m) => m.group === group && notDone(m));
    if (!meta) continue;
    push({
      kind: 'weak',
      lessonId: meta.id,
      title: meta.title,
      subtitle: meta.subtitle,
      because: `Sınavda en çok burada zorlandın — ${group === 'okuma' ? 'okuma' : meta.title.toLowerCase()} üzerine gidiyoruz.`,
      to: `/ogretmen/${meta.id}`,
      minutes: 6,
    });
  }

  /*
   * 4) Sıradaki ders — YALNIZCA BİR TANE.
   *
   * NEDEN BİR: Program dört maddeye kadar "sıradaki ders" ile
   * doldurulduğunda dört kart da aynı gerekçeyi taşıyordu ("sıradaki
   * konu bu"). Seçilmiş bir program değil, doldurulmuş bir liste gibi
   * görünüyordu — ölçülmedi, ekrana bakılınca görüldü. Öğretmenin
   * seçtiği tek bir yeni konu, dört rastgele konudan değerli.
   */
  const sonraki = lessons.find(notDone);
  if (sonraki) {
    push({
      kind: 'next',
      lessonId: sonraki.id,
      title: sonraki.title,
      subtitle: sonraki.subtitle,
      because: 'Sıradaki konu bu; öncekiler tamam.',
      to: `/ogretmen/${sonraki.id}`,
      minutes: 6,
    });
  }

  return out;
}

/** Programın toplam süresi — "bugün ~20 dakika" yazısı bunu okuyor. */
export function planMinutes(plan: PlanEntry[]): number {
  return plan.reduce((sum, e) => sum + e.minutes, 0);
}
