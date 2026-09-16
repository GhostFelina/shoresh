/**
 * İlerleme sayfasının ödül bölümleri — rütbe, günlük hedef, seri, rozetler.
 *
 * NEDEN AYRI DOSYA: İlerleme sayfası zaten tekrar programını (SRS)
 * anlatıyor ve o başlı başına bir konu. İkisi tek dosyada dursaydı
 * hangi bölümün hangi sisteme ait olduğu karışırdı — biri "neyi ne zaman
 * tekrar etmelisin", öteki "ne kadar yol aldın" sorusunu cevaplıyor.
 *
 * BİR TASARIM KARARI: Kazanılmamış rozetler de GÖSTERİLİYOR, ölçütüyle
 * ve ilerleme çubuğuyla birlikte. Gizli rozet bir kez sürpriz yaratır,
 * sonra "acaba başka ne var" belirsizliğine dönüşür ve öğrenci hedefsiz
 * kalır. Görünür ölçüt ise bir sonraki oturumun sebebidir.
 */
import { useCallback, useEffect, useState } from 'react';
import { Award, Flame, Lock, Target, TrendingUp } from 'lucide-react';
import {
  BADGES,
  DAILY_GOALS,
  RANKS,
  goalXp,
  rankFor,
  type DailyGoalId,
  type RewardSnapshot,
} from '@/engine/reward';
import { badgeStates, readGoal, rewardSnapshot, writeGoal, type BadgeState } from '@/lib/rewards';
import { db, dbAvailable, today } from '@/lib/db';

/** Dolan çubuk — rütbe ve rozet ilerlemesi aynı görünümü kullanıyor. */
function Bar({ ratio, tint = 'var(--color-brand-400)' }: { ratio: number; tint?: string }) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${pct}%`, background: tint, transition: 'width 600ms ease' }}
      />
    </div>
  );
}

export function RewardPanels() {
  const [snap, setSnap] = useState<RewardSnapshot | null>(null);
  const [badges, setBadges] = useState<BadgeState[]>([]);
  const [todayXp, setTodayXp] = useState(0);
  const [goal, setGoal] = useState<DailyGoalId>(() => readGoal());

  const load = useCallback(async () => {
    const s = await rewardSnapshot();
    setSnap(s);
    setBadges(await badgeStates());
    if (await dbAvailable()) {
      setTodayXp((await db.days.get(today()))?.xp ?? 0);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!snap) return null;

  const rank = rankFor(snap.totalXp);
  const goalTarget = goalXp(goal);
  const goalRatio = goalTarget > 0 ? todayXp / goalTarget : 0;
  const unlocked = new Set(badges.filter((b) => b.unlockedAt !== null).map((b) => b.id));

  return (
    <div className="space-y-4">
      {/* --- Rütbe --- */}
      <section className="card space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-brand-400) 16%, transparent)',
              color: 'var(--accent-text)',
            }}
          >
            <TrendingUp className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="flex items-baseline gap-2 text-lg font-bold">
              {rank.rank.name}
              <span className="he text-xl" style={{ color: 'var(--accent-text)' }}>
                {rank.rank.he}
              </span>
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {rank.rank.blurb}
            </p>
          </div>
          <div className="text-end">
            <div className="numeric text-xl font-bold" style={{ color: 'var(--accent-text)' }}>
              {snap.totalXp.toLocaleString('tr-TR')}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              toplam XP
            </div>
          </div>
        </div>

        <Bar ratio={rank.progress} />
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {rank.next
            ? `Sonraki rütbe ${rank.next.name} (${rank.next.he}) — ${rank.remaining.toLocaleString('tr-TR')} XP kaldı.`
            : `Son rütbedesin. ${RANKS.length} basamağın hepsini geçtin.`}
        </p>
      </section>

      {/* --- Günlük hedef ve seri --- */}
      <div className="grid gap-3 sm:grid-cols-2">
        <section className="card space-y-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Target className="size-4" style={{ color: 'var(--accent-text)' }} />
            Günlük hedef
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="numeric text-2xl font-bold" style={{ color: 'var(--accent-text)' }}>
              {todayXp}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
              / {goalTarget} XP
            </span>
            {goalRatio >= 1 && (
              <span className="ms-auto text-xs font-semibold" style={{ color: 'var(--color-brand-400)' }}>
                tamam
              </span>
            )}
          </div>
          <Bar ratio={goalRatio} />
          <div className="flex flex-wrap gap-1.5">
            {DAILY_GOALS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => {
                  setGoal(g.id);
                  writeGoal(g.id);
                }}
                title={g.blurb}
                className="card-2 card-interactive px-2.5 py-1 text-[11px]"
                style={{
                  borderColor: g.id === goal ? 'var(--color-brand-400)' : 'var(--border)',
                  color: g.id === goal ? 'var(--accent-text)' : 'var(--text-dim)',
                }}
              >
                {g.label} · {g.xp}
              </button>
            ))}
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Hedefi istediğin zaman değiştirebilirsin. Tutturulamayan bir hedef, hedefsiz
            çalışmaktan daha çok cesaret kırar.
          </p>
        </section>

        <section className="card space-y-3 p-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Flame className="size-4" style={{ color: 'var(--accent-fem)' }} />
            Seri
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="numeric text-2xl font-bold" style={{ color: 'var(--accent-fem)' }}>
              {snap.streak}
            </span>
            <span className="text-sm" style={{ color: 'var(--text-dim)' }}>
              gün arka arkaya
            </span>
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            {snap.streak === 0
              ? 'Bugün bir soru cevapla, seri başlasın.'
              : `Seri her gün kazandığın XP'yi %${Math.round((Math.min(0.5, snap.streak * 0.08)) * 100)} artırıyor. Bugün çalışmadıysan seri henüz kırılmadı — gün bitmedi.`}
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <div className="numeric text-sm font-semibold">{snap.activeDays}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                toplam gün
              </div>
            </div>
            <div>
              <div className="numeric text-sm font-semibold">{snap.correct}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                doğru cevap
              </div>
            </div>
            <div>
              <div className="numeric text-sm font-semibold">{snap.bestCleanRun}</div>
              <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                en uzun seri
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- Rozetler --- */}
      <section className="card space-y-3 p-4">
        <div className="flex items-baseline gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Award className="size-4" style={{ color: 'var(--accent-text)' }} />
            Rozetler
          </h3>
          <span className="numeric text-xs" style={{ color: 'var(--text-dim)' }}>
            {unlocked.size} / {BADGES.length}
          </span>
        </div>

        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {BADGES.map((b) => {
            const has = unlocked.has(b.id);
            const p = b.progress?.(snap);
            return (
              <li
                key={b.id}
                className="card-2 space-y-1.5 p-3"
                style={{
                  borderColor: has ? 'var(--color-brand-400)' : 'var(--border)',
                  opacity: has ? 1 : 0.72,
                }}
              >
                <div className="flex items-center gap-2">
                  {has ? (
                    <Award className="size-4 shrink-0" style={{ color: 'var(--accent-text)' }} />
                  ) : (
                    <Lock className="size-3.5 shrink-0" style={{ color: 'var(--text-dim)' }} />
                  )}
                  <span className="min-w-0 truncate text-xs font-semibold">{b.name}</span>
                  {p && !has && (
                    <span
                      className="ms-auto numeric shrink-0 text-[10px]"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      {p.at}/{p.of}
                    </span>
                  )}
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {has ? b.meaning : b.how}
                </p>
                {p && !has && <Bar ratio={p.of > 0 ? p.at / p.of : 0} tint="var(--accent-text)" />}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
