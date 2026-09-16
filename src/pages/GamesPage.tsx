import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Lightbulb, RotateCcw, Volume2, X } from 'lucide-react';
import {
  GAMES,
  GAME_BY_ID,
  buildQueue,
  type ChoiceQuestion,
  type GameMeta,
  type OrderQuestion,
  type Question,
  type TypeQuestion,
} from '@/features/games/engine';
import { hasUserGesture, speak, speechStatus } from '@/lib/speech';
import type { CEFR } from '@/types/hebrew';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];
const ROUND_LENGTH = 10;

/**
 * Seslendirme düğmesi.
 *
 * Üç ayrı başarısızlık durumu var ve üçü ayrı şey söyler:
 *  - `blocked`  → tarayıcı otomatik oynatmayı engelledi; kullanıcı dokununca çalışır
 *  - `failed`   → hiçbir katman ses veremedi
 *  - `playing`  → çalıyor
 * Üçünü "bozuk" diye tek kovaya atmak kullanıcıyı yanıltırdı.
 */
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
    // Bitiş olayı gelmezse düğme sonsuza kadar "çalıyor" kalmasın.
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
      className={`card-2 grid shrink-0 place-items-center transition hover:brightness-125 ${
        big ? 'size-20' : 'size-10'
      }`}
      style={{ borderColor: border }}
      aria-label={state === 'blocked' ? 'Dinlemek için dokun' : 'Seslendir'}
      title={
        state === 'blocked'
          ? 'Tarayıcı otomatik sesi engelledi — dokununca çalar'
          : state === 'failed'
            ? 'Ses verilemedi'
            : 'Seslendir'
      }
    >
      <Volume2 className={big ? 'size-8' : 'size-4'} />
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Oyun çalıştırıcısı
 * ------------------------------------------------------------------ */

interface RunState {
  index: number;
  correct: number;
  streak: number;
  bestStreak: number;
  answered: boolean;
  chosen: number | null;
  typed: string;
  hintsUsed: number;
  wasRight: boolean;
}

const FRESH: RunState = {
  index: 0,
  correct: 0,
  streak: 0,
  bestStreak: 0,
  answered: false,
  chosen: null,
  typed: '',
  hintsUsed: 0,
  wasRight: false,
};

function Runner({ game, level, onExit }: { game: GameMeta; level: CEFR; onExit: () => void }) {
  const [seed, setSeed] = useState(0);
  const [s, setS] = useState<RunState>(FRESH);

  const queue = useMemo(
    () => buildQueue(game, level, ROUND_LENGTH, Math.random),
    // `seed` değişince yeni tur kurulur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [game, level, seed],
  );

  const q: Question | undefined = queue[s.index];
  const finished = s.index >= queue.length;

  /**
   * Sesli sorularda soru gelir gelmez bir kez çalsın — ama yalnızca
   * kullanıcı sayfayla etkileştiyse. Aksi hâlde tarayıcı engeller ve
   * boşuna bir hata üretiriz.
   */
  useEffect(() => {
    if (q?.audio && game.needsAudio && !s.answered && hasUserGesture()) {
      void speak(q.audio, { slow: true });
    }
  }, [q, game.needsAudio, s.answered]);

  const restart = () => {
    setS(FRESH);
    setSeed((n) => n + 1);
  };

  const commit = (right: boolean) => {
    setS((prev) => {
      const streak = right ? prev.streak + 1 : 0;
      return {
        ...prev,
        answered: true,
        wasRight: right,
        correct: prev.correct + (right ? 1 : 0),
        streak,
        bestStreak: Math.max(prev.bestStreak, streak),
      };
    });
  };

  const next = () =>
    setS((prev) => ({
      ...prev,
      index: prev.index + 1,
      answered: false,
      chosen: null,
      typed: '',
      hintsUsed: 0,
      wasRight: false,
    }));

  if (finished) {
    const pct = Math.round((s.correct / Math.max(1, queue.length)) * 100);
    return (
      <div className="card space-y-4 p-6 text-center">
        <h2 className="text-xl font-bold">Tur bitti</h2>
        <div className="text-5xl font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
          {s.correct}/{queue.length}
        </div>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          %{pct} doğru · en uzun seri {s.bestStreak}
        </p>
        <p className="mx-auto max-w-md text-xs" style={{ color: 'var(--text-dim)' }}>
          {pct >= 80
            ? 'Bu seviyeyi oturtmuşsun. Bir üst seviyeye geçmeyi dene.'
            : pct >= 50
              ? 'Temel var ama otomatikleşmemiş. Aynı seviyede birkaç tur daha iyi gelir.'
              : 'Bu seviye henüz erken. Önce ilgili sayfadan üzerinden geçmek daha hızlı ilerletir.'}
        </p>
        <div className="flex justify-center gap-2">
          <button
            type="button"
            onClick={restart}
            className="card-2 flex items-center gap-2 px-4 py-2 text-sm transition hover:brightness-125"
          >
            <RotateCcw className="size-4" />
            Yeni tur
          </button>
          <button
            type="button"
            onClick={onExit}
            className="card-2 px-4 py-2 text-sm transition hover:brightness-125"
          >
            Oyunlara dön
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="space-y-4">
      {/* Üst şerit */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onExit}
          className="card-2 grid size-9 place-items-center transition hover:brightness-125"
          aria-label="Çık"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{game.title}</div>
          <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {level} · soru {s.index + 1}/{queue.length}
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
            {s.correct}
          </div>
          <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
            seri {s.streak}
          </div>
        </div>
      </div>

      {/* İlerleme çubuğu */}
      <div className="h-1 overflow-hidden rounded" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full origin-left transition-transform"
          style={{
            background: 'var(--color-brand-400)',
            transform: `scaleX(${s.index / queue.length})`,
            width: '100%',
          }}
        />
      </div>

      {/* Soru */}
      <div className="card space-y-4 p-5">
        <p className="text-sm font-medium">{q.prompt}</p>

        {q.kind !== 'order' && q.display && (
          <div className="flex items-center justify-center gap-4 py-2">
            <span
              className={`he he-vocalized ${q.serif ? 'he-serif' : ''} text-center text-5xl`}
            >
              {q.display}
            </span>
            {q.audio && <SpeakButton text={q.audio} />}
          </div>
        )}

        {q.kind !== 'order' && !q.display && q.audio && (
          <div className="flex justify-center py-4">
            <SpeakButton text={q.audio} big />
          </div>
        )}

        {q.kind === 'order' ? (
          <OrderBody
            q={q}
            state={s}
            onCheck={(right) => commit(right)}
          />
        ) : q.kind === 'choice' ? (
          <ChoiceBody
            q={q}
            state={s}
            onPick={(i) => {
              if (s.answered) return;
              setS((prev) => ({ ...prev, chosen: i }));
              commit(i === q.answer);
            }}
          />
        ) : (
          <TypeBody
            q={q}
            state={s}
            onChange={(v) => setS((prev) => ({ ...prev, typed: v }))}
            onHint={() => setS((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }))}
            onSubmit={() => {
              if (s.answered) return;
              const given = s.typed.trim().toLowerCase();
              const ok = q.accept.some(
                (a) => a.replace(/[֑-ׇ]/g, '').toLowerCase() === given,
              );
              commit(ok);
            }}
          />
        )}

        {/* Cevaptan sonra: açıklama. Asıl öğretim burada. */}
        {s.answered && (
          <div
            className="space-y-2 rounded-lg p-3"
            style={{
              background: 'var(--surface-2)',
              boxShadow: `inset 3px 0 0 ${s.wasRight ? 'var(--color-brand-400)' : '#f87171'}`,
            }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              {s.wasRight ? (
                <>
                  <Check className="size-4" style={{ color: 'var(--color-brand-400)' }} />
                  Doğru
                </>
              ) : (
                <>
                  <X className="size-4" style={{ color: '#f87171' }} />
                  {q.kind === 'order' ? (
                    <span>
                      Doğrusu:{' '}
                      <span className="he he-vocalized text-lg">
                        {q.order.map((i) => q.tokens[i]).join(' ')}
                      </span>
                    </span>
                  ) : q.kind === 'type' ? (
                    <span>
                      Doğrusu: <span className="he he-vocalized text-lg">{q.answer}</span>
                    </span>
                  ) : (
                    <span>
                      Doğrusu:{' '}
                      <span className={q.optionsAreHebrew ? 'he text-lg' : ''}>
                        {q.options[q.answer]}
                      </span>
                    </span>
                  )}
                </>
              )}
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              {q.explain}
            </p>
            <button
              type="button"
              onClick={next}
              className="w-full rounded-lg py-2 text-sm font-semibold transition hover:brightness-110"
              style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
            >
              {s.index + 1 >= queue.length ? 'Sonucu gör' : 'Sonraki'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


/**
 * Sözcük dizme gövdesi.
 *
 * Sürükle-bırak YOK: dokunmatik ekranda sürükleme hem zor hem de erişilebilir
 * değil. Bunun yerine sözcüğe dokunulur, cümleye eklenir; yanlış eklenen
 * sözcüğe dokununca geri alınır. Klavyeyle de çalışır.
 *
 * İbranice sağdan sola dizildiği için kurulan cümle `dir="rtl"` içinde
 * gösteriliyor — soldan sağa dizilseydi doğru sıra ekranda ters görünürdü.
 */
function OrderBody({
  q,
  state,
  onCheck,
}: {
  q: OrderQuestion;
  state: RunState;
  onCheck: (right: boolean) => void;
}) {
  const [placed, setPlaced] = useState<number[]>([]);

  // Yeni soruya geçilince dizilim sıfırlanır.
  useEffect(() => {
    setPlaced([]);
  }, [q]);

  const remaining = q.tokens.map((_, i) => i).filter((i) => !placed.includes(i));
  const complete = placed.length === q.tokens.length;

  const check = () => {
    const right =
      placed.length === q.order.length && placed.every((v, i) => v === q.order[i]);
    onCheck(right);
  };

  return (
    <div className="space-y-3">
      <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        Sözcüklere sırayla dokun. Yanlış koyduğunu geri almak için üstteki sözcüğe dokun.
      </p>

      {/* Kurulan cümle */}
      <div
        className="card-2 he he-vocalized min-h-16 rounded-lg px-3 py-3 text-xl"
        dir="rtl"
      >
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
                disabled={state.answered}
                onClick={() => setPlaced((prev) => prev.filter((_, i) => i !== pos))}
                className="rounded px-2 py-0.5 transition hover:brightness-125"
                style={{ background: 'var(--surface)' }}
              >
                {q.tokens[idx]}
              </button>
            ))}
          </span>
        )}
      </div>

      {/* Havuz */}
      <div className="flex flex-wrap gap-2" dir="rtl">
        {remaining.map((idx) => (
          <button
            key={idx}
            type="button"
            disabled={state.answered}
            onClick={() => setPlaced((prev) => [...prev, idx])}
            className="card-2 he he-vocalized px-3 py-2 text-lg transition hover:brightness-125"
          >
            {q.tokens[idx]}
          </button>
        ))}
        {remaining.length === 0 && (
          <span className="text-xs opacity-50" dir="ltr">
            bütün sözcükler yerleştirildi
          </span>
        )}
      </div>

      {!state.answered && (
        <button
          type="button"
          onClick={check}
          disabled={!complete}
          className="w-full rounded-lg py-2 text-sm font-semibold transition hover:brightness-110 disabled:opacity-40"
          style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
        >
          {complete ? 'Kontrol et' : `${q.tokens.length - placed.length} sözcük kaldı`}
        </button>
      )}
    </div>
  );
}

function ChoiceBody({
  q,
  state,
  onPick,
}: {
  q: ChoiceQuestion;
  state: RunState;
  onPick: (i: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {q.options.map((opt, i) => {
        const isAnswer = i === q.answer;
        const isChosen = i === state.chosen;
        let border = 'var(--border)';
        if (state.answered && isAnswer) border = 'var(--color-brand-400)';
        else if (state.answered && isChosen) border = '#f87171';

        return (
          <button
            key={`${opt}-${i}`}
            type="button"
            disabled={state.answered}
            onClick={() => onPick(i)}
            className="card-2 px-4 py-3 text-center transition hover:brightness-125 disabled:cursor-default"
            style={{ borderColor: border }}
          >
            <span
              className={
                q.optionsAreHebrew
                  ? `he he-vocalized ${q.serif ? 'he-serif' : ''} text-3xl`
                  : 'text-sm font-medium'
              }
            >
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function TypeBody({
  q,
  state,
  onChange,
  onHint,
  onSubmit,
}: {
  q: TypeQuestion;
  state: RunState;
  onChange: (v: string) => void;
  onHint: () => void;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        İbranice harfle ya da Latin harfle okunuşunu yazabilirsin — ikisi de kabul edilir.
      </p>
      <div className="flex gap-2">
        <input
          value={state.typed}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          disabled={state.answered}
          placeholder="cevabını yaz…"
          className="card-2 he-vocalized min-w-0 flex-1 bg-transparent px-3 py-2.5 text-lg outline-none"
          dir="auto"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={onHint}
          disabled={state.answered || state.hintsUsed >= q.hints.length}
          className="card-2 grid size-11 shrink-0 place-items-center transition hover:brightness-125 disabled:opacity-40"
          aria-label="İpucu"
        >
          <Lightbulb className="size-4" />
        </button>
      </div>

      {state.hintsUsed > 0 && (
        <ul className="space-y-0.5">
          {q.hints.slice(0, state.hintsUsed).map((h) => (
            <li key={h} className="text-xs" style={{ color: 'var(--color-accent-400)' }}>
              → {h}
            </li>
          ))}
        </ul>
      )}

      {!state.answered && (
        <button
          type="button"
          onClick={onSubmit}
          className="w-full rounded-lg py-2 text-sm font-semibold transition hover:brightness-110"
          style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
        >
          Kontrol et
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sayfa
 * ------------------------------------------------------------------ */

export default function GamesPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [level, setLevel] = useState<CEFR>('A1');

  const game = gameId ? GAME_BY_ID.get(gameId as GameMeta['id']) : undefined;
  const audio = speechStatus();

  if (game) {
    return (
      <Runner
        game={game}
        level={level}
        onExit={() => navigate('/oyunlar')}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Oyunlar</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          On bir oyun, on bir ayrı beceri. Hepsi aynı veriden beslenir — katalog düzeltilince
          oyunlar da düzelir. Sorular her turda yeniden üretilir, ezberlenecek sabit bir
          liste yok.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Seviye:
        </span>
        {LEVELS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className="card-2 px-3 py-1 text-xs transition hover:brightness-125"
            style={{
              borderColor: level === l ? 'var(--color-brand-400)' : 'var(--border)',
              color: level === l ? 'var(--color-brand-300)' : 'var(--text-dim)',
            }}
          >
            {l}
          </button>
        ))}
        <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          — seçilen seviyeye kadar öğrendiğin her şey soruya girer
        </span>
      </div>

      {audio.layer === 'none' && (
        <div className="card-2 space-y-1 p-3">
          <h2 className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
            Kulak Testi şu an oynanamaz
          </h2>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {audio.message}
          </p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {GAMES.map((g) => {
          const blocked = g.needsAudio && audio.layer === 'none';
          return (
            <button
              key={g.id}
              type="button"
              disabled={blocked}
              onClick={() => navigate(`/oyunlar/${g.id}`)}
              className="card space-y-2 p-4 text-left transition hover:brightness-125 disabled:opacity-50"
            >
              <div className="flex items-baseline gap-2">
                <h2 className="text-base font-bold">{g.title}</h2>
                <span className="he text-sm" style={{ color: 'var(--color-brand-300)' }}>
                  {g.he}
                </span>
                <span
                  className="mr-auto rounded px-1.5 py-0.5 text-[10px]"
                  style={{ background: 'var(--surface-2)', color: 'var(--color-accent-400)' }}
                >
                  {g.teaches}
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {g.why}
              </p>
              {blocked && (
                <p className="text-[11px]" style={{ color: '#fbbf24' }}>
                  Ses gerekiyor — şu an kullanılamıyor.
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
