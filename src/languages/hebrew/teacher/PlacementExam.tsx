/**
 * Seviye tespit sınavı — ekran.
 *
 * NEDEN CEVAPTAN SONRA "DOĞRU/YANLIŞ" GÖSTERİLMİYOR: Burası ders değil
 * ÖLÇÜM. Her sorudan sonra doğruyu göstermek üç şeyi bozar: öğrenci
 * sınav sırasında öğrenmeye başlar (ölçüm kayar), art arda "yanlış"
 * gören öğrenci sınavı bırakır, ve doğruyu gören öğrenci sonraki
 * sorularda örüntüyü kopyalar. Bütün geri bildirim sonda, karnede
 * veriliyor — orada da tek tek cevaplar değil, beceri haritası.
 *
 * NEDEN XP VERİLMİYOR: Ödül sisteminin tek kuralı "şişirme yok"
 * (bkz. engine/reward.ts). Tahminle işaretlenen on sekiz soruya puan
 * ödenseydi, sınav en kolay XP kaynağı olurdu. Yine de cevaplar tekrar
 * programına YAZILIYOR: sınavda bilinmeyen bir kelime, ertesi gün
 * tekrar listesinde çıksın diye.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, ClipboardList, Timer, X } from 'lucide-react';
import type { ChoiceQuestion, OrderQuestion } from '@he/games/engine';
import {
  PLACEMENT_LENGTH,
  SKILL_ADVICE,
  SKILL_LABEL,
  applyAnswer,
  finishPlacement,
  isPlacementDone,
  makeRng,
  nextItem,
  readPlacement,
  startPlacement,
  writePlacement,
  type PlacementItem,
  type PlacementResult,
  type PlacementState,
  type SkillId,
} from '@he/teacher/placement';
import { MixedText } from '@/components/MixedText';
import { recordAnswer } from '@/lib/progress';
import type { CEFR } from '@he/types';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];

/* ------------------------------------------------------------------ *
 * Soru gövdeleri
 * ------------------------------------------------------------------ */

function ChoiceBody({ q, onAnswer }: { q: ChoiceQuestion; onAnswer: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);

  useEffect(() => {
    setPicked(null);
  }, [q]);

  return (
    <div className="space-y-4">
      {q.display && (
        <div
          className={`he he-display grid place-items-center rounded-xl py-8 text-5xl ${q.serif ? 'he-serif' : ''}`}
          style={{ background: 'var(--surface-2)' }}
          dir="rtl"
        >
          {q.display}
        </div>
      )}

      <ul className="grid gap-2 sm:grid-cols-2">
        {q.options.map((opt, i) => (
          <li key={`${opt}-${i}`}>
            <button
              type="button"
              disabled={picked !== null}
              onClick={() => {
                setPicked(i);
                // Kısa bir bekleme: seçim ekranda görünsün, sonra geçsin.
                // Anında geçilseydi öğrenci neye bastığını göremezdi.
                window.setTimeout(() => onAnswer(i === q.answer), 220);
              }}
              className={`card-2 card-interactive w-full px-4 py-3 text-start ${picked === i ? 'is-selected' : ''}`}
              style={picked === i ? { borderColor: 'var(--color-brand-400)' } : undefined}
            >
              <span className={q.optionsAreHebrew ? 'he text-lg' : 'text-sm'} dir={q.optionsAreHebrew ? 'rtl' : 'ltr'}>
                {opt}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OrderBody({ q, onAnswer }: { q: OrderQuestion; onAnswer: (correct: boolean) => void }) {
  const [placed, setPlaced] = useState<number[]>([]);

  useEffect(() => {
    setPlaced([]);
  }, [q]);

  const remaining = q.tokens.map((_, i) => i).filter((i) => !placed.includes(i));
  const complete = placed.length === q.tokens.length;

  return (
    <div className="space-y-3">
      <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        Sözcüklere sırayla dokun. Geri almak için üstteki sözcüğe dokun.
      </p>

      <div className="card-2 he he-vocalized min-h-16 rounded-lg px-3 py-3 text-xl" dir="rtl">
        {placed.length === 0 ? (
          <span className="text-sm opacity-40" dir="ltr">
            henüz boş
          </span>
        ) : (
          <span className="flex flex-wrap gap-2">
            {placed.map((idx, pos) => (
              <button
                key={`${idx}-${pos}`}
                type="button"
                onClick={() => setPlaced((prev) => prev.filter((_, i) => i !== pos))}
                className="card-interactive rounded px-2 py-0.5"
                style={{ background: 'var(--surface)' }}
              >
                {q.tokens[idx]}
              </button>
            ))}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2" dir="rtl">
        {remaining.map((idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setPlaced((prev) => [...prev, idx])}
            className="card-2 he he-vocalized card-interactive px-3 py-2 text-lg"
          >
            {q.tokens[idx]}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!complete}
        onClick={() =>
          onAnswer(placed.length === q.order.length && placed.every((v, i) => v === q.order[i]))
        }
        className="card-interactive w-full rounded-lg py-2 text-sm font-semibold disabled:opacity-40"
        style={{ background: 'var(--color-brand-500)', color: 'var(--on-accent)' }}
      >
        {complete ? 'Cevabı ver' : `${q.tokens.length - placed.length} sözcük kaldı`}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sınav
 * ------------------------------------------------------------------ */

export function PlacementExam({
  onDone,
  onCancel,
}: {
  onDone: (result: PlacementResult) => void;
  onCancel: () => void;
}) {
  const rng = useMemo(() => makeRng(Date.now() % 1000000), []);
  const [state, setState] = useState<PlacementState>(() => startPlacement());
  const [item, setItem] = useState<PlacementItem | null>(() => null);
  const askedAt = useRef<number>(Date.now());

  // İlk soruyu kur. Sonrakiler cevap işlendikçe geliyor.
  useEffect(() => {
    setItem(nextItem(startPlacement(), rng));
  }, [rng]);

  const answer = useCallback(
    (correct: boolean) => {
      if (!item) return;
      const elapsedMs = Date.now() - askedAt.current;

      // Cevap tekrar programına yazılıyor (XP yok — dosya başındaki not).
      void recordAnswer(item.question.itemKey, 'seviye-tespit', {
        correct,
        elapsedMs,
        hintsUsed: 0,
        mode: item.question.kind === 'choice' ? 'choice' : 'order',
      });

      const next = applyAnswer(state, item, correct, elapsedMs);
      setState(next);
      askedAt.current = Date.now();

      if (isPlacementDone(next)) {
        const result = finishPlacement(next);
        writePlacement(result);
        onDone(result);
        return;
      }
      setItem(nextItem(next, rng));
    },
    [item, state, rng, onDone],
  );

  if (!item) return null;

  const done = state.answers.length;
  const q = item.question;

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <ClipboardList className="size-5 shrink-0" style={{ color: 'var(--accent-text)' }} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold">Seviye tespit sınavı</h1>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {SKILL_LABEL[item.skill]} · soru {item.index} / {PLACEMENT_LENGTH}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="card-2 card-interactive grid size-9 place-items-center"
            aria-label="Sınavdan çık"
            title="Sınavdan çık — ilerleme kaydedilmez"
          >
            <X className="size-4" />
          </button>
        </div>

        {/*
          İlerleme çubuğu var ama PUAN yok: kaç doğru yaptığını görmek,
          ölçüm sırasında öğrenciyi tahmin etmeye ya da bırakmaya iter.
        */}
        <div className="flex gap-1">
          {Array.from({ length: PLACEMENT_LENGTH }, (_, i) => (
            <span
              key={i}
              className="h-1.5 flex-1 rounded-full transition-colors"
              style={{ background: i < done ? 'var(--color-brand-400)' : 'var(--border)' }}
            />
          ))}
        </div>
      </header>

      <article className="card space-y-4 p-5">
        <h2 className="text-base font-medium">
          <MixedText>{q.prompt}</MixedText>
        </h2>

        {q.kind === 'order' ? (
          <OrderBody q={q} onAnswer={answer} />
        ) : q.kind === 'choice' ? (
          <ChoiceBody q={q} onAnswer={answer} />
        ) : null}
      </article>

      <p className="flex items-center justify-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
        <Timer className="size-3.5" />
        Doğru cevaplar sonda gösterilir — bu bir ölçüm, ders değil.
      </p>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Akış: karne mi, sınav mı
 * ------------------------------------------------------------------ */

/**
 * Sınav rotasının sahibi.
 *
 * Daha önce ölçülmüşse ÖNCE KARNE gösteriliyor, sınav değil. Sebebi:
 * "seviye tespit" bağlantısına tıklayanların çoğu sonucu görmek ister;
 * doğrudan sınava sokmak, mevcut ölçümü kazara silmeye davet olurdu.
 */
export function PlacementFlow({
  onApplyLevel,
  onExit,
}: {
  onApplyLevel: (level: CEFR) => void;
  onExit: () => void;
}) {
  const stored = useMemo(() => readPlacement(), []);
  const [result, setResult] = useState<PlacementResult | null>(stored);
  const [taking, setTaking] = useState(stored === null);

  if (taking) {
    return (
      <PlacementExam
        onDone={(r) => {
          setResult(r);
          setTaking(false);
        }}
        onCancel={onExit}
      />
    );
  }

  if (!result) return null;

  return (
    <PlacementReport
      result={result}
      onApply={() => {
        onApplyLevel(result.level);
        onExit();
      }}
      onRetake={() => setTaking(true)}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Karne
 * ------------------------------------------------------------------ */

export function PlacementReport({
  result,
  onApply,
  onRetake,
}: {
  result: PlacementResult;
  onApply: () => void;
  onRetake: () => void;
}) {
  // Yetenek 1–4 aralığında; çubuk üzerindeki konumu yüzdeye çeviriyoruz.
  const pos = ((result.ability - 1) / 3) * 100;

  const rated = (Object.keys(result.skills) as SkillId[]).filter((k) => result.skills[k].asked > 0);

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <header className="card space-y-4 p-6 text-center">
        <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Seviyen
        </p>
        <p className="text-5xl font-bold" style={{ color: 'var(--accent-text)' }}>
          {result.level}
        </p>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {result.total} sorudan {result.correct} doğru · güven: {result.confidence}
        </p>

        {/* Dört basamaklı şerit — seviyenin neresinde olduğu görünsün. */}
        <div className="space-y-1.5 pt-2">
          <div className="relative h-2 rounded-full" style={{ background: 'var(--border)' }}>
            <span
              className="absolute inset-y-0 start-0 rounded-full"
              style={{ width: `${pos}%`, background: 'var(--color-brand-400)' }}
            />
            <span
              className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full ring-2"
              style={{
                insetInlineStart: `calc(${pos}% - 0.375rem)`,
                background: 'var(--accent-text)',
                // Halka arka planla aynı: nokta çubuğun üstünde "oyulmuş" görünsün.
                ['--tw-ring-color' as string]: 'var(--surface)',
              }}
            />
          </div>
          <div className="flex justify-between text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {LEVELS.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </div>
        </div>
      </header>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Beceri haritası</h2>
        <ul className="space-y-2.5">
          {rated.map((key) => {
            const s = result.skills[key];
            const ratio = s.correct / s.asked;
            const weak = result.weak.includes(key);
            return (
              <li key={key} className="space-y-1">
                <div className="flex items-baseline gap-2 text-xs">
                  <span className="font-medium">{SKILL_LABEL[key]}</span>
                  <span className="numeric ms-auto" style={{ color: 'var(--text-dim)' }}>
                    {s.correct}/{s.asked}
                  </span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.round(ratio * 100)}%`,
                      background: weak ? 'var(--accent-fem)' : 'var(--color-brand-400)',
                    }}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {result.weak.length > 0 && (
        <section className="card space-y-2 p-5">
          <h2 className="text-sm font-semibold">Önce buraya bakacağız</h2>
          <ul className="space-y-1.5 text-sm" style={{ color: 'var(--text-dim)' }}>
            {result.weak.map((k) => (
              <li key={k}>• {SKILL_ADVICE[k]}</li>
            ))}
          </ul>
        </section>
      )}

      {result.strong.length > 0 && (
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          İyi durumda: {result.strong.map((k) => SKILL_LABEL[k]).join(', ')}.
        </p>
      )}

      {/*
        Güven düşükse SÖYLÜYORUZ. Sessizce bir seviye atamak, yanlış
        seviyede haftalarca çalışmaya yol açar; öğrenci ölçümün ne kadar
        kesin olduğunu bilmeli.
      */}
      {result.confidence === 'düşük' && (
        <p className="card-2 p-3 text-xs" style={{ color: 'var(--text-dim)' }}>
          Cevaplar iniş çıkışlıydı, bu yüzden tahmin kesin değil. Birkaç ders sonra
          sınavı tekrarlarsan ölçüm oturur.
        </p>
      )}

      <footer className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onApply}
          className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold"
          style={{ background: 'var(--color-brand-500)', color: 'var(--on-accent)' }}
        >
          <Check className="size-4" /> {result.level} sınıfına geç
        </button>
        <button
          type="button"
          onClick={onRetake}
          className="card-2 card-interactive flex items-center gap-2 px-4 py-2.5 text-sm"
        >
          Tekrar ölç <ArrowRight className="size-4" />
        </button>
      </footer>
    </section>
  );
}
