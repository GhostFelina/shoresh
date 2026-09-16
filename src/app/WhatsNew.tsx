/**
 * Sürüm notu kutusu — yeni sürümde ekranın ortasında açılır.
 *
 * NEDEN OTOMATİK AÇILIYOR: Uygulama her hafta büyüyor ve yeni bölümler
 * sessizce ekleniyordu. Kullanıcının bunu fark etmesi için sol menüyü
 * baştan sona okuması gerekiyordu — kimse okumaz. Kutu bir kez açılır,
 * okunur, kapatılır ve bir daha o sürüm için açılmaz.
 *
 * NEDEN KENDİ KENDİNE KAPANMIYOR: Zamanlayıcıyla kapanan bir kutu
 * okumaya başlayanın elinden kaçar. Yalnızca "Kapat" ile ya da Esc ile
 * kapanıyor — ikisi de kullanıcının kararı. Arka plana tıklamak
 * KAPATMIYOR; yanlışlıkla kapanmasın diye.
 *
 * NEDEN "BU SANA NE KAZANDIRIYOR" BÖLÜMÜ VAR: Değişiklik listesi bir iş
 * listesidir. Öğrenci "peki bana ne" diye sorar ve haklıdır; her sürümde
 * o sorunun cevabı da yazılıyor.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import {
  CHANGE_LABEL,
  CHANGE_TINT,
  LATEST,
  releasesSince,
  type Release,
} from '@/data/changelog';
import { BUILD_TIME, formatBuildTime } from '@/lib/version';
import { MixedText } from '@/components/MixedText';

const SEEN_KEY = 'shoresh.seenVersion';

const readSeen = (): string | null => {
  try {
    return localStorage.getItem(SEEN_KEY);
  } catch {
    // Gizli sekmede okunamaz. O zaman kutu her açılışta gösterilir —
    // sessizce hiç göstermemekten iyidir.
    return null;
  }
};

const writeSeen = (v: string): void => {
  try {
    localStorage.setItem(SEEN_KEY, v);
  } catch {
    /* yazamadıysak bu oturumda kapalı kalır, yeter */
  }
};

function ReleaseBody({ release }: { release: Release }) {
  return (
    <section className="space-y-4">
      <header className="space-y-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-base font-semibold">{release.title}</h3>
          <span
            className="rounded px-1.5 py-px text-[10px] font-semibold tabular-nums"
            style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
          >
            v{release.version}
          </span>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          <MixedText>{release.summary}</MixedText>
        </p>
      </header>

      <ul className="space-y-2">
        {release.changes.map((c, i) => (
          <li
            key={c.text}
            className="flex gap-2.5 text-sm leading-relaxed"
            /* Maddeler sırayla geliyor: göz listeyi yukarıdan aşağı
               izliyor, hepsi birden belirince nereden başlayacağını
               bilemiyor. Gecikme maddeye 40ms — toplamda göze çarpmıyor. */
            style={{
              animation: `shoresh-rise 320ms ease both`,
              animationDelay: `${90 + i * 40}ms`,
            }}
          >
            <span
              className="mt-0.5 shrink-0 rounded px-1.5 py-px text-[10px] font-semibold"
              style={{
                color: CHANGE_TINT[c.kind],
                background: `color-mix(in srgb, ${CHANGE_TINT[c.kind]} 14%, transparent)`,
              }}
            >
              {CHANGE_LABEL[c.kind]}
            </span>
            <span className="min-w-0">
              <MixedText>{c.text}</MixedText>
            </span>
          </li>
        ))}
      </ul>

      {release.benefits.length > 0 && (
        <div className="space-y-2">
          <h4
            className="text-[11px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--accent-text)' }}
          >
            Bu sana ne kazandırıyor
          </h4>
          <ul className="grid gap-2 sm:grid-cols-2">
            {release.benefits.map((b) => (
              <li key={b.title} className="card-2 space-y-1 p-3">
                <p className="text-xs font-semibold">{b.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  <MixedText>{b.text}</MixedText>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export function WhatsNewDialog({
  releases,
  onClose,
}: {
  releases: Release[];
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    // Kutu açıkken arkadaki sayfa kaymasın.
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const many = releases.length > 1;

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whats-new-title"
    >
      {/* Arka plan — tıklamayı YUTUYOR ama kapatmıyor. */}
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
        className="card relative flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-hidden"
        style={{ animation: 'shoresh-dialog 380ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        {/* Üst şerit — paletten gelen renk geçişi, kutunun kimliği. */}
        <div
          className="h-1 w-full shrink-0"
          style={{
            background:
              'linear-gradient(90deg, var(--color-brand-400), var(--color-accent-400), var(--accent-fem))',
            backgroundSize: '200% 100%',
            animation: 'shoresh-sheen 3.2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />

        <header className="flex items-start gap-3 px-5 pb-3 pt-4">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-brand-400) 16%, transparent)',
              color: 'var(--accent-text)',
              animation: 'shoresh-pulse 2.4s ease-in-out infinite',
            }}
          >
            <Sparkles className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="whats-new-title" className="text-lg font-semibold">
              {many ? `${releases.length} yeni sürüm` : 'Yeni sürüm'}
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Son güncelleme: {formatBuildTime(BUILD_TIME)}
            </p>
          </div>
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

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 pb-4">
          {releases.map((r) => (
            <ReleaseBody key={r.version} release={r} />
          ))}
        </div>

        <footer
          className="flex shrink-0 items-center gap-3 border-t px-5 py-3"
          style={{ background: 'var(--surface-2)' }}
        >
          <p className="min-w-0 flex-1 truncate text-xs" style={{ color: 'var(--text-dim)' }}>
            Notlara sayfa altındaki bağlantıdan yeniden ulaşabilirsin.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{ background: 'var(--color-brand-500)', color: 'var(--on-accent)' }}
          >
            Kapat
          </button>
        </footer>
      </div>
    </div>
  );
}

/**
 * Kutuyu yöneten kanca.
 *
 * `open` ile elle de açılabiliyor — sayfa altındaki "Sürüm notları"
 * bağlantısı bunu kullanıyor. Kutuyu kapatmak notları kaybetmemeli.
 */
export function useWhatsNew() {
  const [manual, setManual] = useState<Release[] | null>(null);
  const [auto, setAuto] = useState<Release[] | null>(null);

  useEffect(() => {
    const seen = readSeen();
    if (seen === LATEST.version) return;
    const list = releasesSince(seen);
    if (list.length > 0) setAuto(list);
  }, []);

  const close = useCallback(() => {
    writeSeen(LATEST.version);
    setAuto(null);
    setManual(null);
  }, []);

  const openAll = useCallback(() => setManual([LATEST]), []);

  return { releases: manual ?? auto, close, openAll };
}
