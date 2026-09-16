import { NavLink } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { LanguagePicker } from './LanguagePicker';
import { APP_VERSION } from '@/lib/version';
import { PalettePicker, ThemeToggle, useAppearance } from './Appearance';
import { WhatsNewDialog, useWhatsNew } from './WhatsNew';
import { RewardHud } from './Rewards';
import { usePageWidthClass } from './Layout';
import { VersionHistoryButton, VersionHistoryDialog } from './VersionHistory';
import { FeedbackButton, FeedbackDialog } from './Feedback';
import { BUILD_TIME, formatBuildTime } from '@/lib/version';
import { Logo } from './Logo';
import { BRAND } from '@/core/brand';

/** Kenar çubuğunun içeriği — masaüstünde sabit, telefonda çekmecede. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  /*
   * Menü DİL MODÜLÜNDEN geliyor, burada yazılı değil. Burada yazılı
   * olsaydı ikinci dil eklemek kabuğa "hangi dil?" koşulları serpmek
   * olurdu ve her yeni dilde o koşullardan biri unutulurdu.
   */
  const dil = useLanguage();
  const yol = (path: string) => (path ? `/${dil.id}/${path}` : `/${dil.id}`);

  return (
    <nav className="space-y-4 pb-6">
      {dil.nav.map((group) => (
        <div key={group.id} className="space-y-1">
          {group.title && (
            <h2
              className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-dim)' }}
            >
              {group.title}
            </h2>
          )}
          <ul className="space-y-0.5">
            {group.items.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={yol(item.path)}
                  end={item.end}
                  onClick={onNavigate}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-1.5 transition"
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    // Etkin girişin rengi kendi tonu; yoksa marka rengi.
                    color: isActive ? (item.tint ?? 'var(--accent-text)') : 'var(--text-dim)',
                    boxShadow: isActive
                      ? `inset 2px 0 0 ${item.tint ?? 'var(--color-brand-400)'}`
                      : 'none',
                  })}
                >
                  {item.icon ? (
                    <item.icon className="size-4 shrink-0" />
                  ) : (
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded text-[10px] numeric font-bold"
                      style={{
                        background: item.tint
                          ? `color-mix(in srgb, ${item.tint} 18%, var(--surface-2))`
                          : 'var(--surface-2)',
                        color: item.tint ?? 'inherit',
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-[10px] leading-tight opacity-70">{item.hint}</span>
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { theme, palette, changeTheme, changePalette } = useAppearance();
  const whatsNew = useWhatsNew();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  // Sayfa kendi genişliğini bildiriyor; kabuk yalnızca uyguluyor.
  const genislik = usePageWidthClass();

  // Çekmece açıkken arkadaki sayfa kaymasın.
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  return (
    <div className="min-h-dvh lg:flex">
      {/* Masaüstü kenar çubuğu */}
      <aside
        className="sticky top-0 hidden h-dvh w-64 shrink-0 overflow-y-auto border-l-0 border-r px-3 py-4 lg:block"
        style={{ background: 'var(--surface)' }}
      >
        <div className="mb-4 flex items-center gap-2.5 px-2">
          <Logo />
          <div className="leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight">{BRAND.short}</span>
              <span
                className="rounded px-1 py-px text-[9px] font-semibold tabular-nums"
                style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
              >
                v{APP_VERSION}
              </span>
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {BRAND.motto}
            </div>
          </div>
        </div>
        <div className="mb-3 px-1">
          <LanguagePicker />
        </div>

        <SidebarContent />
      </aside>

      {/* Telefon çekmecesi */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setDrawerOpen(false)}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
          <div
            className="absolute inset-y-0 left-0 w-72 overflow-y-auto border-r px-3 py-4"
            style={{ background: 'var(--surface)' }}
          >
            <div className="mb-4 flex items-center gap-2.5 px-2">
              <Logo />
              <div className="mr-auto flex items-baseline gap-1.5">
                <span className="text-base font-bold">{BRAND.short}</span>
                <span
                  className="rounded px-1 py-px text-[9px] font-semibold tabular-nums"
                  style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
                >
                  v{APP_VERSION}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="card-2 grid size-8 place-items-center"
                aria-label="Kapat"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mb-3 px-1">
              <LanguagePicker onNavigate={() => setDrawerOpen(false)} />
            </div>

            <SidebarContent onNavigate={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      <div className="min-w-0 flex-1">
        {/* Üst bant — telefonda menü düğmesini taşır */}
        <header
          className="sticky top-0 z-20 flex items-center gap-3 border-b px-4 py-3 backdrop-blur-xl"
          style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="card-2 grid size-9 place-items-center lg:hidden"
            aria-label="Menüyü aç"
          >
            <Menu className="size-4" />
          </button>
          <Logo className="size-7 lg:hidden" />
          <span className="mr-auto flex items-baseline gap-1.5 lg:hidden">
            <span className="text-sm font-bold">{BRAND.short}</span>
            <span className="text-[9px] tabular-nums" style={{ color: 'var(--text-dim)' }}>
              v{APP_VERSION}
            </span>
          </span>
          {/*
            Üst bantta DİLİN kendi yazısı duruyor, ürünün adı değil:
            burada שֹׁרֶשׁ sabit yazılıydı ve Korece açıldığında ekranın
            ortasında İbranice bir kelime kalacaktı.
          */}
          <span
            className="mr-auto hidden text-sm font-medium lg:block"
            style={{ color: 'var(--text-dim)' }}
          >
            {BRAND.name}
          </span>
          <RewardHud />
          <FeedbackButton onOpen={() => setFeedbackOpen(true)} />
          <VersionHistoryButton onOpen={() => setHistoryOpen(true)} />
          <PalettePicker theme={theme} palette={palette} onChange={changePalette} />
          <ThemeToggle theme={theme} onChange={changeTheme} />
        </header>

        <main className={`mx-auto ${genislik} px-4 py-6 transition-[max-width] duration-300`}>
          {children}
        </main>

        <footer
          className={`mx-auto ${genislik} space-y-1 px-4 pb-10 pt-4 text-xs`}
          style={{ color: 'var(--text-dim)' }}
        >
          <p>
            {BRAND.name} v{APP_VERSION} — {BRAND.motto} {BRAND.promise}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {/* Damga derleme anında gömülüyor; elle yazılsaydı yayına
                çıkmayan bir değişiklikte de güncellenir ve yalan söylerdi. */}
            <span>Son güncelleme: {formatBuildTime(BUILD_TIME)}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={whatsNew.openAll}
              className="underline underline-offset-2 transition"
              style={{ color: 'var(--accent-text)' }}
            >
              Sürüm notları
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="underline underline-offset-2 transition"
              style={{ color: 'var(--accent-text)' }}
            >
              Tüm geçmiş
            </button>
          </p>
        </footer>
      </div>

      {whatsNew.releases && (
        <WhatsNewDialog releases={whatsNew.releases} onClose={whatsNew.close} />
      )}

      {historyOpen && <VersionHistoryDialog onClose={() => setHistoryOpen(false)} />}

      {feedbackOpen && <FeedbackDialog onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
