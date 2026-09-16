/**
 * Ödül arayüzü — üst bantta durum göstergesi, kazanımlarda kutlama.
 *
 * NEDEN BAĞLAM (context): XP hem oyunlardan hem öğretmen modundan
 * kazanılıyor ama gösterge üst bantta, yani her ikisinin de dışında.
 * Her sayfa kendi sayacını tutsaydı oyundan çıkınca sayı eski değerine
 * dönerdi.
 *
 * NEDEN KUTLAMA KISA: Rütbe atlama ve rozet bir kez, iki saniye
 * görünüyor ve akışı durdurmuyor — oyunun ortasında tam ekran bir
 * pencere açmak ödülü cezaya çevirir. Ayrıntıya bakmak isteyen
 * İlerleme sayfasına gidiyor.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Award, Flame, Target } from 'lucide-react';
import { BADGE_BY_ID, goalXp, rankFor } from '@/engine/reward';
import {
  awardAnswer,
  markCelebrated,
  readGoal,
  rewardSnapshot,
  syncBadges,
  todayXp as readTodayXp,
  totalXp as readTotalXp,
  type AwardInput,
} from '@/lib/rewards';

interface Celebration {
  id: string;
  kind: 'rank' | 'goal' | 'badge';
  title: string;
  detail: string;
  he?: string;
}

interface RewardContextValue {
  totalXp: number;
  todayXp: number;
  streak: number;
  goal: number;
  /** Bir cevabı ödüllendirir ve kazanılan XP'yi döndürür. */
  award: (input: AwardInput) => Promise<number>;
  /** Sayıları veritabanından tazeler. */
  refresh: () => Promise<void>;
  /** Son cevapta kazanılan XP — geçici rozet için. */
  lastGain: { xp: number; at: number } | null;
}

const RewardContext = createContext<RewardContextValue | null>(null);

export function useRewards(): RewardContextValue {
  const ctx = useContext(RewardContext);
  if (ctx) return ctx;
  /*
   * Sağlayıcı dışında çağrılırsa ÇÖKMÜYOR, işlevsiz bir sürüm dönüyor.
   * Sebep: ödül sistemi bir kolaylık; bir sayfa yanlışlıkla sağlayıcı
   * dışında kalırsa o sayfanın tamamen beyaz açılması kabul edilemez.
   */
  return {
    totalXp: 0,
    todayXp: 0,
    streak: 0,
    goal: goalXp(readGoal()),
    award: async () => 0,
    refresh: async () => {},
    lastGain: null,
  };
}

export function RewardProvider({ children }: { children: ReactNode }) {
  const [totalXp, setTotalXp] = useState(0);
  const [todayXp, setTodayXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [goal, setGoal] = useState(() => goalXp(readGoal()));
  const [queue, setQueue] = useState<Celebration[]>([]);
  const [lastGain, setLastGain] = useState<{ xp: number; at: number } | null>(null);

  const refresh = useCallback(async () => {
    const [total, today, snap] = await Promise.all([
      readTotalXp(),
      readTodayXp(),
      rewardSnapshot(),
    ]);
    setTotalXp(total);
    setTodayXp(today);
    setStreak(snap.streak);
    setGoal(goalXp(readGoal()));

    const fresh = await syncBadges(snap);
    if (fresh.length > 0) {
      setQueue((q) => [
        ...q,
        ...fresh.map((id) => {
          const b = BADGE_BY_ID.get(id);
          return {
            id: `badge-${id}`,
            kind: 'badge' as const,
            title: b?.name ?? 'Yeni rozet',
            detail: b?.meaning ?? '',
          };
        }),
      ]);
      void markCelebrated(fresh);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  /*
   * Rozet taraması pahalı (bütün cevap tablosunu okuyor), bu yüzden her
   * cevapta değil, cevap akışı DURULDUĞUNDA yapılıyor. Zamanlayıcı her
   * cevapta sıfırlanıyor; oyun boyunca hiç çalışmıyor, tur bitince bir
   * kez çalışıyor.
   */
  const settle = useRef<number | null>(null);
  const scheduleScan = useCallback(() => {
    if (settle.current !== null) window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => void refresh(), 2500);
  }, [refresh]);

  const award = useCallback(
    async (input: AwardInput): Promise<number> => {
      const result = await awardAnswer(input);
      if (!result) return 0;

      setTotalXp(result.totalXp);
      setTodayXp(result.todayXp);
      setLastGain({ xp: result.xp, at: Date.now() });

      const fresh: Celebration[] = [];
      if (result.rankedUp) {
        const r = rankFor(result.totalXp).rank;
        fresh.push({
          id: `rank-${r.name}-${result.totalXp}`,
          kind: 'rank',
          title: `${r.name} oldun`,
          detail: r.blurb,
          he: r.he,
        });
      }
      if (result.goalReached) {
        fresh.push({
          id: `goal-${new Date().toDateString()}`,
          kind: 'goal',
          title: 'Günlük hedef tamam',
          detail: `Bugün ${result.todayXp} XP. Seri korunuyor.`,
        });
      }
      if (fresh.length > 0) setQueue((q) => [...q, ...fresh]);

      scheduleScan();
      return result.xp;
    },
    [scheduleScan],
  );

  const value = useMemo<RewardContextValue>(
    () => ({ totalXp, todayXp, streak, goal, award, refresh, lastGain }),
    [totalXp, todayXp, streak, goal, award, refresh, lastGain],
  );

  return (
    <RewardContext.Provider value={value}>
      {children}
      <CelebrationLayer queue={queue} onDone={(id) => setQueue((q) => q.filter((c) => c.id !== id))} />
    </RewardContext.Provider>
  );
}

/* ------------------------------------------------------------------ *
 * Kutlama
 * ------------------------------------------------------------------ */

const ICONS = { rank: Award, goal: Target, badge: Award } as const;

function CelebrationLayer({
  queue,
  onDone,
}: {
  queue: Celebration[];
  onDone: (id: string) => void;
}) {
  // Aynı anda yalnızca biri; üst üste binen kutlamalar okunmuyor.
  const current = queue[0];

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => onDone(current.id), 3200);
    return () => window.clearTimeout(t);
  }, [current, onDone]);

  if (!current) return null;
  const Icon = ICONS[current.kind];

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-16 z-[70] flex justify-center px-4"
      role="status"
      aria-live="polite"
    >
      <div
        className="card flex max-w-sm items-center gap-3 px-4 py-3"
        style={{
          animation: 'shoresh-celebrate 3.2s cubic-bezier(0.16, 1, 0.3, 1) both',
          borderColor: 'var(--color-brand-400)',
          boxShadow: '0 0 0 1px var(--color-brand-400), var(--shadow-lift)',
        }}
      >
        <span
          className="grid size-10 shrink-0 place-items-center rounded-xl"
          style={{
            background: 'color-mix(in srgb, var(--color-brand-400) 18%, transparent)',
            color: 'var(--accent-text)',
          }}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="flex items-baseline gap-2 text-sm font-semibold">
            {current.title}
            {current.he && (
              <span className="he text-base" style={{ color: 'var(--accent-text)' }}>
                {current.he}
              </span>
            )}
          </p>
          <p className="truncate text-xs" style={{ color: 'var(--text-dim)' }}>
            {current.detail}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Üst banttaki gösterge
 * ------------------------------------------------------------------ */

/** Günlük hedef halkası — dolan çember. */
function GoalRing({ ratio, label }: { ratio: number; label: string }) {
  const r = 9;
  const c = 2 * Math.PI * r;
  const filled = Math.max(0, Math.min(1, ratio));
  return (
    <span className="relative grid size-6 place-items-center" title={label}>
      <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
        <circle
          cx="12"
          cy="12"
          r={r}
          fill="none"
          stroke={filled >= 1 ? 'var(--color-brand-400)' : 'var(--accent-text)'}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - filled)}
          style={{ transition: 'stroke-dashoffset 500ms ease' }}
        />
      </svg>
    </span>
  );
}

export function RewardHud() {
  const { totalXp, todayXp, streak, goal, lastGain } = useRewards();
  const rank = rankFor(totalXp);
  const [flash, setFlash] = useState<number | null>(null);

  // Kazanılan XP kısa süre yanıp sönüyor — cevabın karşılığı görünsün.
  useEffect(() => {
    if (!lastGain) return;
    setFlash(lastGain.xp);
    const t = window.setTimeout(() => setFlash(null), 1400);
    return () => window.clearTimeout(t);
  }, [lastGain]);

  return (
    <div className="flex items-center gap-2.5 text-xs">
      {/* Seri — sıfırsa gösterilmiyor; boş bir alev cesaret kırar. */}
      {streak > 0 && (
        <span
          className="flex items-center gap-1 font-semibold tabular-nums"
          title={`${streak} gün arka arkaya`}
          style={{ color: 'var(--accent-fem)' }}
        >
          <Flame className="size-3.5" />
          {streak}
        </span>
      )}

      <span className="flex items-center gap-1.5" title={`Bugün ${todayXp} / ${goal} XP`}>
        <GoalRing ratio={goal > 0 ? todayXp / goal : 0} label={`Bugün ${todayXp} / ${goal} XP`} />
        <span className="hidden tabular-nums sm:inline" style={{ color: 'var(--text-dim)' }}>
          {todayXp}/{goal}
        </span>
      </span>

      <span
        className="relative hidden items-center gap-1.5 md:flex"
        title={`${rank.rank.name} · toplam ${totalXp} XP`}
      >
        <span className="font-semibold" style={{ color: 'var(--accent-text)' }}>
          {rank.rank.name}
        </span>
        {flash !== null && (
          <span
            className="absolute -top-4 end-0 font-bold tabular-nums"
            style={{
              color: 'var(--color-brand-400)',
              animation: 'shoresh-float 1.4s ease-out both',
            }}
          >
            +{flash}
          </span>
        )}
      </span>
    </div>
  );
}
