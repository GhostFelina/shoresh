import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  Lightbulb,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';
import {
  LESSON_BY_ID,
  answerMatches,
  clearLessonOpen,
  markLessonDone,
  markLessonOpen,
  readLessonProgress,
  type Lesson,
  type LessonStep,
  type Piece,
} from '@/features/teacher/lesson';
import { canCoachSpeak, coachReact, coachSay, stopCoach } from '@/lib/coach';
import { speak, stopSpeaking } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';
import { HebrewKeyboardToggle } from '@/components/HebrewKeyboard';
import { recordAnswer } from '@/lib/progress';
import { itemKey } from '@/engine/srs';
import { useRewards } from '@/app/Rewards';
import { Classroom } from '@/features/teacher/Classroom';
import { PlacementFlow } from '@/features/teacher/PlacementExam';
import { readPlacement } from '@/features/teacher/placement';
import type { CEFR } from '@/types/hebrew';

/** Koç sesini açık/kapalı tutar — tercih cihazda kalır. */
function useVoicePref(): [boolean, (v: boolean) => void] {
  const [on, setOn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shoresh.coach') !== 'off';
    } catch {
      return true;
    }
  });
  const set = useCallback((v: boolean) => {
    setOn(v);
    try {
      localStorage.setItem('shoresh.coach', v ? 'on' : 'off');
    } catch {
      /* özel pencerede yazılamayabilir — tercih oturumluk kalır */
    }
    if (!v) stopCoach();
  }, []);
  return [on, set];
}

function SpeakButton({ text, big = false }: { text: string; big?: boolean }) {
  const [state, setState] = useState<'idle' | 'playing' | 'failed' | 'blocked'>('idle');

  const play = useCallback(() => {
    setState('playing');
    void speak(text, {
      slow: true,
      onEnd: () => setState('idle'),
      onUnavailable: () => setState('failed'),
      onBlocked: () => setState('blocked'),
    });
    window.setTimeout(() => setState((s) => (s === 'playing' ? 'idle' : s)), 7000);
  }, [text]);

  const border =
    state === 'playing'
      ? 'var(--color-brand-400)'
      : state === 'failed'
        ? '#f87171'
        : state === 'blocked'
          ? '#fbbf24'
          : 'var(--border)';

  return (
    <button
      type="button"
      onClick={play}
      className={`card-2 grid shrink-0 place-items-center card-interactive ${big ? 'size-14' : 'size-9'}`}
      style={{ borderColor: border }}
      aria-label="Seslendir"
      title={state === 'blocked' ? 'Tarayıcı sesi engelledi — dokununca çalar' : 'Seslendir'}
    >
      <Volume2 className={big ? 'size-6' : 'size-4'} />
    </button>
  );
}

function PieceRow({ p }: { p: Piece }) {
  return (
    <li className="card-2 flex items-center gap-3 p-3">
      <SpeakButton text={p.plain} />
      <div className="min-w-0 flex-1">
        <div className="he text-xl leading-relaxed">
          <MixedText>{p.vocalized}</MixedText>
        </div>
        <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {p.translit} · {p.gloss}
        </div>
      </div>
    </li>
  );
}

/* ------------------------------------------------------------------ *
 * Adım gövdesi
 * ------------------------------------------------------------------ */

interface AnswerState {
  typed: string;
  chosen: string | null;
  checked: boolean;
  correct: boolean;
  hintOpen: boolean;
  reaction: string;
}

const EMPTY: AnswerState = {
  typed: '',
  chosen: null,
  checked: false,
  correct: false,
  hintOpen: false,
  reaction: '',
};

function StepBody({
  step,
  answer,
  setAnswer,
  voiceOn,
  onScored,
}: {
  step: LessonStep;
  answer: AnswerState;
  setAnswer: (fn: (a: AnswerState) => AnswerState) => void;
  voiceOn: boolean;
  onScored: (correct: boolean, hinted: boolean, elapsedMs: number) => void;
}) {
  const q = step.question;
  // Soru ekranda belirdiği an — SRS hız bileşeni buna bakıyor.
  const shownAt = useRef<number>(Date.now());
  useEffect(() => {
    shownAt.current = Date.now();
  }, [q?.prompt]);

  const check = useCallback(
    (given: string) => {
      if (!q || answer.checked) return;
      const ok = answerMatches(given, q.answer, q.exact);
      const line = voiceOn ? coachReact(ok ? 'correct' : 'wrong') : ok ? 'Doğru.' : 'Olmadı.';
      setAnswer((a) => ({ ...a, checked: true, correct: ok, reaction: line }));
      onScored(ok, answer.hintOpen, Date.now() - shownAt.current);
      // Doğru cevabı her hâlükârda İbranice olarak duyur — asıl öğreten bu.
      window.setTimeout(() => void speak(q.speak, { slow: true }), ok ? 700 : 1200);
    },
    [q, answer.checked, answer.hintOpen, voiceOn, setAnswer, onScored],
  );

  if (!q) {
    return (
      <div className="space-y-4">
        {step.lines && (
          <ul className="space-y-2 text-sm leading-relaxed">
            {step.lines.map((l) => (
              <li key={l} className="flex gap-2">
                <span style={{ color: 'var(--accent-text)' }}>—</span>
                <span>
                  <MixedText>{l}</MixedText>
                </span>
              </li>
            ))}
          </ul>
        )}
        {step.pieces && step.pieces.length > 0 && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {step.pieces.map((p) => (
              <PieceRow key={p.vocalized + p.gloss} p={p} />
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        <MixedText>{q.prompt}</MixedText>
      </p>

      {q.choices ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {q.choices.map((c) => {
            const isChosen = answer.chosen === c;
            const isRight = answerMatches(c, q.answer, q.exact);
            const show = answer.checked && (isChosen || isRight);
            return (
              <button
                key={c}
                type="button"
                disabled={answer.checked}
                onClick={() => {
                  setAnswer((a) => ({ ...a, chosen: c }));
                  check(c);
                }}
                className="card-2 card-interactive flex items-center justify-between gap-3 p-3 text-start"
                style={{
                  borderColor: show
                    ? isRight
                      ? 'var(--color-brand-400)'
                      : '#f87171'
                    : 'var(--border)',
                }}
              >
                <span className="he text-lg">
                  <MixedText>{c}</MixedText>
                </span>
                {show && (isRight ? <Check className="size-4" /> : <X className="size-4" />)}
              </button>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            value={answer.typed}
            onChange={(e) => setAnswer((a) => ({ ...a, typed: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === 'Enter') check(answer.typed);
            }}
            disabled={answer.checked}
            dir="rtl"
            placeholder="İbranice yaz…"
            className="he card-2 w-full p-3 text-xl outline-none"
            style={{ color: 'var(--text)' }}
          />
          <HebrewKeyboardToggle
            disabled={answer.checked}
            onInsert={(ch) => setAnswer((a) => ({ ...a, typed: a.typed + ch }))}
            onBackspace={() => setAnswer((a) => ({ ...a, typed: a.typed.slice(0, -1) }))}
            onClear={() => setAnswer((a) => ({ ...a, typed: '' }))}
          />
          {!answer.checked && (
            <button
              type="button"
              onClick={() => check(answer.typed)}
              className="card-2 card-interactive px-4 py-2 text-sm"
            >
              Kontrol et
            </button>
          )}
        </div>
      )}

      {/* İpucu — guided adımda teşvik edilir, solo adımda da açık ama not düşülür. */}
      {!answer.checked && (
        <button
          type="button"
          onClick={() => {
            setAnswer((a) => ({ ...a, hintOpen: true }));
            if (voiceOn) coachSay(q.hint);
          }}
          className="flex items-center gap-2 text-sm"
          style={{ color: 'var(--accent-text)' }}
        >
          <Lightbulb className="size-4" />
          {answer.hintOpen ? 'İpucu açık' : 'İpucu'}
        </button>
      )}

      {answer.hintOpen && !answer.checked && (
        <p className="card-2 p-3 text-sm" style={{ color: 'var(--text-dim)' }}>
          <MixedText>{q.hint}</MixedText>
        </p>
      )}

      {answer.checked && (
        <div
          className="card-2 space-y-2 p-4"
          style={{ borderColor: answer.correct ? 'var(--color-brand-400)' : '#f87171' }}
        >
          <p className="text-sm font-medium">{answer.reaction}</p>
          <div className="flex items-center gap-3">
            <SpeakButton text={q.speak} big />
            <div>
              <div className="he text-2xl">
                <MixedText>{q.answerVocalized}</MixedText>
              </div>
              <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {q.answerTranslit}
              </div>
            </div>
          </div>
          {/* Yanlışta gerekçe ŞART: "yanlış" demek öğretmez, öğrenci aynı yere döner. */}
          {!answer.correct && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              <MixedText>{q.why}</MixedText>
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Ders çalıştırıcısı
 * ------------------------------------------------------------------ */

function LessonRunner({
  lesson,
  level,
  onExit,
  onRestart,
  voiceOn,
  startAt = 0,
}: {
  lesson: Lesson;
  level: CEFR;
  onExit: () => void;
  onRestart: () => void;
  voiceOn: boolean;
  startAt?: number;
}) {
  const [index, setIndex] = useState(() => Math.min(startAt, lesson.steps.length - 1));
  const [answers, setAnswers] = useState<Record<number, AnswerState>>({});
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const spokenFor = useRef<number>(-1);
  const { award } = useRewards();

  const step = lesson.steps[index]!;
  const answer = answers[index] ?? EMPTY;
  const last = index === lesson.steps.length - 1;

  /*
   * Adıma girince öğretmen konuşur. `spokenFor` olmadan React'in her
   * yeniden çizimi cümleyi baştan söyletirdi — cevap yazarken her tuşta
   * öğretmenin yeniden konuşması dayanılmaz olurdu.
   */
  useEffect(() => {
    if (!voiceOn || spokenFor.current === index) return;
    spokenFor.current = index;
    coachSay(step.say);
  }, [index, step.say, voiceOn]);

  useEffect(() => () => {
    stopCoach();
    stopSpeaking();
  }, []);

  const setAnswer = useCallback(
    (fn: (a: AnswerState) => AnswerState) =>
      setAnswers((prev) => ({ ...prev, [index]: fn(prev[index] ?? EMPTY) })),
    [index],
  );

  const onScored = useCallback(
    (correct: boolean, hinted: boolean, elapsedMs: number) => {
      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
      /*
       * Ders de tekrar programına yazılır — oyunla AYNI havuza. Ayrı
       * tutulsaydı öğrenci bir fiili derste öğrenip oyunda yeniden
       * "hiç görülmemiş" sayılırdı.
       *
       * Yalnızca sorunun dayandığı gerçek öğe biliniyorsa yazılır;
       * uydurma bir anahtar üretmek SRS'i kirletirdi.
       */
      // Ödül, SRS kaydından bağımsız: kaynağı bilinmeyen soru da
      // emek ister ve XP kazandırır.
      void award({ correct, elapsedMs, hintsUsed: hinted ? 1 : 0, cefr: level });

      const src = step.question?.source;
      if (!src) return;
      void recordAnswer(itemKey(src.kind, src.id, src.axis), 'ogretmen', {
        correct,
        elapsedMs,
        hintsUsed: hinted ? 1 : 0,
        mode: step.question?.choices ? 'choice' : 'type',
      });
    },
    [step.question, award, level],
  );

  const go = (d: number) => {
    stopCoach();
    stopSpeaking();
    setIndex((i) => {
      const next = Math.min(lesson.steps.length - 1, Math.max(0, i + d));
      // "Nerede kaldım" her adımda yazılıyor: ders yarıda bırakılıp
      // sayfa kapatılsa bile listeye dönünce kaldığı yer görünüyor.
      markLessonOpen(lesson.id, next);
      return next;
    });
  };

  const finish = () => {
    markLessonDone(lesson.id);
    clearLessonOpen();
    onExit();
  };

  const blocked = step.question !== undefined && !answer.checked;

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="card-2 card-interactive flex items-center gap-2 px-3 py-2 text-sm"
        >
          <ArrowLeft className="size-4" /> Dersler
        </button>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold">{lesson.title}</h2>
          <p className="truncate text-xs" style={{ color: 'var(--text-dim)' }}>
            {lesson.subtitle} · {level}
          </p>
        </div>
        <button
          type="button"
          onClick={onRestart}
          className="card-2 card-interactive flex items-center gap-2 px-3 py-2 text-sm"
          title="Dersi baştan kur — sorular değişir"
        >
          <RotateCcw className="size-4" /> Yenile
        </button>
      </header>

      {/* Adım çubuğu */}
      <ol className="flex gap-1.5">
        {lesson.steps.map((s, i) => (
          <li
            key={s.kind + i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background:
                i < index
                  ? 'var(--color-brand-400)'
                  : i === index
                    ? 'var(--accent-text)'
                    : 'var(--border)',
            }}
          />
        ))}
      </ol>

      <article className="card space-y-4 p-5">
        <div className="flex items-start gap-3">
          <GraduationCap className="mt-0.5 size-5 shrink-0" style={{ color: 'var(--accent-text)' }} />
          <div className="min-w-0">
            <h3 className="text-base font-semibold">{step.title}</h3>
            {/* Öğretmenin söylediği cümle yazıyla da durur: ses kapalıysa ders eksilmez. */}
            <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              <MixedText>{step.say}</MixedText>
            </p>
          </div>
        </div>

        <StepBody
          step={step}
          answer={answer}
          setAnswer={setAnswer}
          voiceOn={voiceOn}
          onScored={onScored}
        />
      </article>

      <footer className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="card-2 card-interactive px-4 py-2 text-sm disabled:opacity-40"
        >
          Geri
        </button>
        {!last ? (
          <button
            type="button"
            onClick={() => go(1)}
            disabled={blocked}
            className="card-2 card-interactive flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40"
            title={blocked ? 'Önce soruyu cevapla' : 'Sonraki adım'}
          >
            Devam <ArrowRight className="size-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={finish}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
          >
            Dersi bitir
          </button>
        )}
        {score.total > 0 && (
          <span className="ms-auto text-sm" style={{ color: 'var(--text-dim)' }}>
            {score.correct}/{score.total} doğru
          </span>
        )}
      </footer>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Sayfa
 * ------------------------------------------------------------------ */

export default function TeacherPage() {
  const { lessonId } = useParams<{ lessonId?: string }>();
  const navigate = useNavigate();
  /*
   * Başlangıç seviyesi ölçümden geliyor, A1 sabitinden değil. Sabit
   * kalsaydı B1 çıkan öğrenci her girişte listeyi elle yukarı çekmek
   * zorunda kalırdı ve sınav hiçbir işe yaramazdı.
   */
  const [level, setLevel] = useState<CEFR>(() => readPlacement()?.level ?? 'A1');
  const [seed, setSeed] = useState(() => Date.now() % 100000);
  const [voiceOn, setVoiceOn] = useVoicePref();

  const coachAvailable = useMemo(() => canCoachSpeak(), []);
  const [progress, setProgress] = useState(() => readLessonProgress());

  // Listeye her dönüşte ilerleme tazeleniyor; ders bitince kart hemen
  // "tamamlandı" görünsün.
  useEffect(() => {
    if (!lessonId) setProgress(readLessonProgress());
  }, [lessonId]);

  const lesson = useMemo(() => {
    if (!lessonId) return null;
    return LESSON_BY_ID.get(lessonId)?.build(level, seed) ?? null;
  }, [lessonId, level, seed]);

  useEffect(() => () => stopCoach(), []);

  /*
   * Seviye tespit sınavı bir ders DEĞİL, ölçüm: kendi akışı var ve ders
   * motoruna sokulmuyor. Rota yine de öğretmen modunun altında duruyor —
   * sınav, sınıfın bir parçası; ayrı bir köşeye atılırsa kimse bulamaz.
   */
  if (lessonId === 'seviye-tespit') {
    return <PlacementFlow onApplyLevel={setLevel} onExit={() => navigate('/ogretmen')} />;
  }

  if (lessonId && lesson) {
    return (
      <LessonRunner
        lesson={lesson}
        level={level}
        voiceOn={voiceOn && coachAvailable}
        startAt={progress.open?.id === lessonId ? progress.open.step : 0}
        onExit={() => navigate('/ogretmen')}
        onRestart={() => setSeed(Date.now() % 100000)}
      />
    );
  }

  return (
    <Classroom
      level={level}
      onLevel={setLevel}
      voiceOn={voiceOn}
      coachAvailable={coachAvailable}
      onVoice={setVoiceOn}
    />
  );
}
