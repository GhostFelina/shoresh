/**
 * Sürüm geçmişi — uygulamanın kayıt defteri.
 *
 * NEDEN SÜRÜM KUTUSUNDAN AYRI: Kutu bir DUYURU — yeni sürümde bir kez
 * açılır, okunur, kapatılır. Bu ise bir KAYIT: istendiği zaman açılır ve
 * her şey orada durur. İkisini tek bileşen yapmak, duyuruyu kapatan
 * kullanıcının geçmişi de kaybetmesi demekti.
 *
 * SIRA ESKİDEN YENİYE: Duyuru kutusunda en yeni üstte, çünkü orada soru
 * "ne değişti". Burada soru "bu uygulama nasıl buraya geldi" ve onun
 * cevabı baştan okunur. Kullanıcı isterse tek düğmeyle ters çevirebiliyor.
 *
 * ZAMAN DAMGALARI GERÇEK: Her sürümün yayın anı, o sürümün yayın
 * commit'inin zamanıdır. Elle yazılan bir saat yayına çıkmayan bir
 * değişiklikte de güncellenir ve kaydı yalan yapar.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownUp, History, X } from 'lucide-react';
import {
  CHANGE_LABEL,
  CHANGE_TINT,
  RELEASES,
  type Release,
} from '@/data/changelog';
import { BUILD_TIME, formatBuildTime } from '@/lib/version';
import { MixedText } from '@/components/MixedText';

/** Tam tarih ve saat — kullanıcının kendi saat dilimine çevrilerek. */
function stamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'tarih bilinmiyor';
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

/** İki sürüm arasında geçen süre — geçmişin ritmi görünsün. */
function gap(current: string, previous: string | undefined): string | null {
  if (!previous) return null;
  const ms = new Date(current).getTime() - new Date(previous).getTime();
  if (!Number.isFinite(ms) || ms <= 0) return null;
  const dakika = Math.round(ms / 60000);
  if (dakika < 60) return `${dakika} dakika sonra`;
  const saat = Math.round(dakika / 60);
  if (saat < 24) return `${saat} saat sonra`;
  return `${Math.round(saat / 24)} gün sonra`;
}

function ReleaseRow({ release, previous }: { release: Release; previous?: Release }) {
  const counts = release.changes.reduce<Record<string, number>>((acc, c) => {
    acc[c.kind] = (acc[c.kind] ?? 0) + 1;
    return acc;
  }, {});
  const since = gap(release.releasedAt, previous?.releasedAt);

  return (
    <li className="relative ps-6">
      {/* Zaman çizgisi noktası */}
      <span
        className="absolute start-0 top-1.5 size-2.5 rounded-full"
        style={{ background: 'var(--color-brand-400)', boxShadow: '0 0 0 3px var(--surface)' }}
        aria-hidden="true"
      />

      <div className="space-y-2 pb-6">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span
            className="rounded px-1.5 py-px text-[11px] font-semibold tabular-nums"
            style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
          >
            v{release.version}
          </span>
          <h3 className="text-sm font-semibold">{release.title}</h3>
          <span className="numeric text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {stamp(release.releasedAt)}
          </span>
          {since && (
            <span className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              · önceki sürümden {since}
            </span>
          )}
        </div>

        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          <MixedText>{release.summary}</MixedText>
        </p>

        {/* Değişiklik türü sayaçları — ayrıntıya girmeden ağırlık görünsün. */}
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(counts) as Array<keyof typeof CHANGE_LABEL>).map((k) => (
            <span
              key={k}
              className="rounded px-1.5 py-px text-[10px] font-semibold"
              style={{
                color: CHANGE_TINT[k],
                background: `color-mix(in srgb, ${CHANGE_TINT[k]} 14%, transparent)`,
              }}
            >
              {CHANGE_LABEL[k]} {counts[k]}
            </span>
          ))}
        </div>

        <ul className="space-y-1">
          {release.changes.map((c) => (
            <li key={c.text} className="flex gap-2 text-xs leading-relaxed">
              <span aria-hidden="true" style={{ color: CHANGE_TINT[c.kind] }}>
                •
              </span>
              <span className="min-w-0">
                <MixedText>{c.text}</MixedText>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

export function VersionHistoryDialog({ onClose }: { onClose: () => void }) {
  // Varsayılan ESKİDEN YENİYE: burada soru "bu uygulama nasıl buraya geldi".
  const [oldestFirst, setOldestFirst] = useState(true);
  const closeRef = useRef<HTMLButtonElement>(null);

  const list = useMemo(
    () => (oldestFirst ? [...RELEASES].reverse() : RELEASES),
    [oldestFirst],
  );

  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const first = RELEASES.at(-1);
  const last = RELEASES[0];
  const totalChanges = RELEASES.reduce((n, r) => n + r.changes.length, 0);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="history-title"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--bg) 72%, rgb(0 0 0 / 0.6))',
          backdropFilter: 'blur(6px)',
          animation: 'shoresh-fade 220ms ease both',
        }}
        aria-hidden="true"
      />

      <div
        className="card relative flex max-h-[86dvh] w-full max-w-2xl flex-col overflow-hidden"
        style={{ animation: 'shoresh-dialog 380ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{
            background:
              'linear-gradient(90deg, var(--accent-fem), var(--color-accent-400), var(--color-brand-400))',
            backgroundSize: '200% 100%',
            animation: 'shoresh-sheen 3.2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />

        <header className="flex items-start gap-3 px-5 pb-3 pt-4">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-accent-400) 16%, transparent)',
              color: 'var(--accent-text-alt)',
            }}
          >
            <History className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="history-title" className="text-lg font-semibold">
              Sürüm geçmişi
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              {RELEASES.length} sürüm · {totalChanges} değişiklik ·{' '}
              {first && last
                ? `${stamp(first.releasedAt).split(' ').slice(0, 3).join(' ')} — bugün`
                : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOldestFirst((v) => !v)}
            className="card-2 card-interactive flex shrink-0 items-center gap-1.5 px-2 py-1.5 text-[11px]"
            title={oldestFirst ? 'Yeniden eskiye sırala' : 'Eskiden yeniye sırala'}
          >
            <ArrowDownUp className="size-3.5" />
            {oldestFirst ? 'eskiden yeniye' : 'yeniden eskiye'}
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="card-2 grid size-8 shrink-0 place-items-center card-interactive"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
          {/* Zaman çizgisi — noktaları birleştiren dikey çizgi. */}
          <ol
            className="relative"
            style={{ boxShadow: 'inset 1px 0 0 var(--border)' }}
          >
            {list.map((r, i) => (
              <ReleaseRow
                key={r.version}
                release={r}
                {...(oldestFirst ? (list[i - 1] ? { previous: list[i - 1]! } : {}) : list[i + 1] ? { previous: list[i + 1]! } : {})}
              />
            ))}
          </ol>
        </div>

        <footer
          className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t px-5 py-3 text-xs"
          style={{ background: 'var(--surface-2)', color: 'var(--text-dim)' }}
        >
          <span>Son derleme: {formatBuildTime(BUILD_TIME)}</span>
          <span className="ms-auto">
            Zaman damgaları yayın anından alınır, elle yazılmaz.
          </span>
        </footer>
      </div>
    </div>
  );
}

/** Üst banttaki geçmiş düğmesi. */
export function VersionHistoryButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-2 grid size-9 place-items-center card-interactive"
      aria-label="Sürüm geçmişi"
      title="Sürüm geçmişi — tüm güncellemeler"
    >
      <History className="size-4" />
    </button>
  );
}
