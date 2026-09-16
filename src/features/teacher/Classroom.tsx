/**
 * Sınıf — öğretmen modunun giriş ekranı.
 *
 * NEDEN DERS LİSTESİ DEĞİL: Yetmiş dersin kataloğu, öğrenciye her
 * açılışta "bugün ne yapsam" sorusunu sordurur ve çoğu zaman cevabı
 * "boş ver" olur. Gerçek bir sınıfta bu soru sorulmaz: öğretmen bugünün
 * işini söyler, gerekçesini söyler, sonra derse geçilir. Katalog
 * duruyor — ama artık ekranın merkezinde değil, altında.
 *
 * Ekranın sırası bilinçli:
 *   1) Öğretmenin seni karşılaması  (kim olduğunu hatırlıyor)
 *   2) Bugünün programı             (ne yapacağız, neden)
 *   3) Öğretmene sor                (takıldığın yeri sorabildiğin köşe)
 *   4) Seviye kartı                 (nerede olduğun, ölçümle)
 *   5) Bütün dersler                (kendi başına gezmek isteyene)
 */
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check as CheckIcon,
  ClipboardList,
  Flame,
  GraduationCap,
  MicOff,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Volume2,
} from 'lucide-react';
import {
  LESSON_GROUPS,
  availableLessons,
  readLessonProgress,
  type LessonProgress,
} from '@/features/teacher/lesson';
import { buildDailyPlan, planMinutes, type PlanEntry } from '@/features/teacher/plan';
import { classroomMood } from '@/features/teacher/persona';
import { SKILL_LABEL, readPlacement, type PlacementResult, type SkillId } from '@/features/teacher/placement';
import { TeacherChat } from '@/features/teacher/TeacherChat';
import { MixedText } from '@/components/MixedText';
import { overallStats, type OverallStats } from '@/lib/progress';
import { today } from '@/lib/db';
import type { CEFR } from '@/types/hebrew';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];

/**
 * Son çalışmanın üstünden kaç gün geçti?
 *
 * `lastWeek` yalnızca yedi gün taşıyor. Yedi günün hepsi boşsa ve hiç
 * cevap verilmişse "en az yedi" diyoruz — tam sayıyı bilmiyoruz ve
 * uydurmuyoruz. Hiç cevap yoksa cevap `null`: öğrenci yeni.
 */
function daysSinceLastStudy(stats: OverallStats, now = new Date()): number | null {
  const withWork = stats.lastWeek.filter((d) => d.attempts > 0);
  if (withWork.length === 0) return stats.attempts > 0 ? 7 : null;

  const last = withWork[withWork.length - 1]!.day;
  const [y, m, d] = last.split('-').map(Number);
  // new Date('YYYY-MM-DD') UTC gece yarısı sayar ve gün kayar (AI_HANDOFF §3).
  const lastDate = new Date(y!, m! - 1, d!);
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
}

const PLAN_ICON: Record<PlanEntry['kind'], typeof GraduationCap> = {
  exam: ClipboardList,
  resume: PlayCircle,
  review: RotateCcw,
  weak: Sparkles,
  next: GraduationCap,
};

const PLAN_TAG: Record<PlanEntry['kind'], string> = {
  exam: 'ölçüm',
  resume: 'yarım kalan',
  review: 'tekrar',
  weak: 'eksik alan',
  next: 'sıradaki',
};

export function Classroom({
  level,
  onLevel,
  voiceOn,
  coachAvailable,
  onVoice,
}: {
  level: CEFR;
  onLevel: (l: CEFR) => void;
  voiceOn: boolean;
  coachAvailable: boolean;
  onVoice: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<LessonProgress>(() => readLessonProgress());
  const [placement] = useState<PlacementResult | null>(() => readPlacement());
  const [stats, setStats] = useState<OverallStats | null>(null);

  // İlerleme sayıları IndexedDB'den geliyor; sayfa onları BEKLEMEDEN
  // çiziliyor. Beklenseydi sınıfa her girişte boş bir ekran görünürdü.
  useEffect(() => {
    let alive = true;
    void overallStats().then((s) => {
      if (alive) setStats(s);
    });
    setProgress(readLessonProgress());
    return () => {
      alive = false;
    };
  }, []);

  const lessons = useMemo(() => availableLessons(level), [level]);

  const plan = useMemo(
    () =>
      buildDailyPlan({
        placement,
        progress,
        level,
        dueCount: stats?.due ?? 0,
        lessons,
      }),
    [placement, progress, level, stats?.due, lessons],
  );

  const mood = useMemo(
    () =>
      classroomMood({
        hour: new Date().getHours(),
        streak: stats?.streak ?? 0,
        daysSinceLast: stats ? daysSinceLastStudy(stats) : null,
        placed: placement !== null,
      }),
    [stats, placement],
  );

  const doneToday = progress.done;
  const totalDone = Object.keys(doneToday).length;

  return (
    <section className="space-y-8">
      {/* ---------------- 1) Kürsü ---------------- */}
      <header className="card relative overflow-hidden p-6">
        {/*
          Arka plandaki halka yalnızca süs değil: başlık bloğunu sayfanın
          geri kalanından ayırıyor. Sınıfa girdiğinde gözün ilk gideceği
          yer burası olmalı.
        */}
        <span
          aria-hidden
          className="pointer-events-none absolute -end-16 -top-24 size-64 rounded-full opacity-[0.07]"
          style={{ background: 'var(--color-brand-400)' }}
        />

        <div className="relative space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
              style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
            >
              {placement ? `${placement.level} sınıfı` : 'sınıf henüz belirlenmedi'}
            </span>
            {(stats?.streak ?? 0) > 0 && (
              <span
                className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px]"
                style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
              >
                <Flame className="size-3" /> {stats!.streak} günlük seri
              </span>
            )}
            <span className="ms-auto numeric text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {today()}
            </span>
          </div>

          <div>
            {/*
              Sayfa kendini TANITMALI. Karşılama cümlesi tek başına
              durduğunda ekran sıcak ama yönsüz kalıyordu: menüden gelen
              biri nerede olduğunu ancak kenar çubuğuna bakarak anlıyordu.
              E2E testi de tam bunu yakaladı.
            */}
            <p
              className="text-[11px] font-semibold uppercase tracking-[0.14em]"
              style={{ color: 'var(--text-dim)' }}
            >
              Öğretmen Modu
            </p>
            <h1 className="mt-1 text-2xl font-semibold">{mood.greeting}.</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {mood.line}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {plan.length > 0 && (
              <button
                type="button"
                onClick={() => navigate(plan[0]!.to)}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
                style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
              >
                {plan[0]!.kind === 'exam' ? 'Sınava başla' : 'Derse başla'}
                <ArrowRight className="size-4" />
              </button>
            )}
            <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
              bugün ~{planMinutes(plan)} dakika · {totalDone} ders tamamlandı
            </span>

            <button
              type="button"
              onClick={() => onVoice(!voiceOn)}
              disabled={!coachAvailable}
              className="card-2 card-interactive ms-auto flex items-center gap-2 px-3 py-1.5 text-xs disabled:opacity-50"
              title={
                coachAvailable
                  ? 'Öğretmenin Türkçe sesi'
                  : 'Bu cihazda Türkçe konuşma sesi yok — ders yazıyla devam eder'
              }
            >
              {voiceOn && coachAvailable ? <Volume2 className="size-3.5" /> : <MicOff className="size-3.5" />}
              {coachAvailable ? (voiceOn ? 'Sesli anlatım açık' : 'Sesli anlatım kapalı') : 'Türkçe ses yok'}
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- 2) Bugünün programı ---------------- */}
      <section className="space-y-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">Bugünün programı</h2>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            öğretmen seçti — her maddenin gerekçesi yazıyor
          </span>
        </div>

        <ol className="space-y-2.5">
          {plan.map((entry, i) => {
            const Icon = PLAN_ICON[entry.kind];
            return (
              <li key={`${entry.kind}-${entry.lessonId ?? i}`}>
                <button
                  type="button"
                  onClick={() => navigate(entry.to)}
                  className="card card-interactive flex w-full items-start gap-4 p-4 text-start"
                >
                  <span
                    className="grid size-10 shrink-0 place-items-center rounded-lg"
                    style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
                  >
                    <Icon className="size-5" />
                  </span>

                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--accent-text)' }}
                      >
                        {PLAN_TAG[entry.kind]}
                      </span>
                      <span className="numeric text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        ~{entry.minutes} dk
                      </span>
                    </span>
                    <span className="block text-sm font-semibold">
                      <MixedText>{entry.title}</MixedText>
                    </span>
                    <span className="block text-xs" style={{ color: 'var(--text-dim)' }}>
                      {entry.subtitle}
                    </span>
                    {/* Gerekçe: öğrenci neden bu dersi yaptığını bilmeli. */}
                    <span
                      className="mt-1.5 block border-s-2 ps-2.5 text-xs italic leading-relaxed"
                      style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}
                    >
                      {entry.because}
                    </span>
                  </span>

                  <ArrowRight className="mt-2 size-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------------- 3) Öğretmene sor ---------------- */}
      <TeacherChat level={level} lessonsDone={totalDone} streak={stats?.streak ?? 0} />

      {/* ---------------- 4) Seviye kartı ---------------- */}
      <section className="card space-y-3 p-5">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="text-sm font-semibold">Seviyen</h2>
          <button
            type="button"
            onClick={() => navigate('/ogretmen/seviye-tespit')}
            className="ms-auto text-xs underline-offset-2 hover:underline"
            style={{ color: 'var(--accent-text)' }}
          >
            {placement ? 'karneyi aç / tekrar ölç' : 'sınava gir'}
          </button>
        </div>

        {placement ? (
          <>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {new Date(placement.at).toLocaleDateString('tr-TR')} tarihinde ölçüldü ·{' '}
              {placement.total} sorudan {placement.correct} doğru · güven: {placement.confidence}
            </p>
            {placement.weak.length > 0 && (
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Eksik alanlar: {placement.weak.map((k: SkillId) => SKILL_LABEL[k]).join(', ')}
              </p>
            )}
          </>
        ) : (
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Seviyeni ölçmedik. Sınav 18 soru sürer, yazma yok, ses gerekmez — sonunda hangi
            becerinin eksik olduğunu gösteren bir karne çıkar.
          </p>
        )}

        {/*
          Elle seviye seçimi DURUYOR ama ikincil.
          Ölçüm her zaman doğru olmayabilir ve öğrenci kendi kararını
          verebilmeli; sadece artık ekranın ilk sorusu bu değil.
        */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Ders listesi seviyesi:
          </span>
          {LEVELS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => onLevel(l)}
              className={`card-2 card-interactive px-2.5 py-1 text-xs ${l === level ? 'is-selected' : ''}`}
            >
              {l}
            </button>
          ))}
        </div>
      </section>

      {/* ---------------- 5) Bütün dersler ---------------- */}
      <section className="space-y-5">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-semibold">Bütün dersler</h2>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            kendi başına gezmek istersen
          </span>
        </div>

        {LESSON_GROUPS.map((group) => {
          const inGroup = lessons.filter((m) => m.group === group.id);
          if (inGroup.length === 0) return null;
          const doneCount = inGroup.filter((m) => progress.done[m.id]).length;

          return (
            <section key={group.id} className="space-y-2">
              <div className="flex flex-wrap items-baseline gap-2">
                <h3 className="text-sm font-semibold">{group.title}</h3>
                <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {group.blurb}
                </span>
                <span
                  className="ms-auto numeric text-xs"
                  style={{
                    color: doneCount === inGroup.length ? 'var(--accent-text)' : 'var(--text-dim)',
                  }}
                >
                  {doneCount} / {inGroup.length}
                </span>
              </div>

              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inGroup.map((m) => {
                  const done = Boolean(progress.done[m.id]);
                  return (
                    <li key={m.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/ogretmen/${m.id}`)}
                        className="card card-interactive h-full w-full space-y-1 p-4 text-start"
                        style={done ? { borderColor: 'var(--color-brand-400)' } : undefined}
                      >
                        <span className="flex items-center gap-1.5">
                          <span
                            className="text-[11px] font-medium uppercase tracking-wide"
                            style={{ color: 'var(--accent-text)' }}
                          >
                            {m.from}
                          </span>
                          {done && (
                            <CheckIcon className="size-3.5" style={{ color: 'var(--color-brand-400)' }} />
                          )}
                        </span>
                        <h4 className="text-sm font-semibold">
                          <MixedText>{m.title}</MixedText>
                        </h4>
                        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                          {m.subtitle}
                        </p>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}

        {lessons.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Bu seviyede kurulabilen ders yok.
          </p>
        )}
      </section>

      {!coachAvailable && (
        <p className="card-2 p-3 text-xs" style={{ color: 'var(--text-dim)' }}>
          Bu cihazda Türkçe konuşma sesi kurulu değil, bu yüzden öğretmen sesli anlatmıyor.
          Dersin bütün metni ekranda duruyor; İbranice örnekler yine seslendiriliyor.
        </p>
      )}
    </section>
  );
}
