import { NavLink } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { NAV_GROUPS } from './nav';

/** Markanın işareti: ש harfinin üç çatalı = üç kök harfi. */
function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={`${className} shrink-0`} aria-hidden="true">
      <defs>
        <linearGradient id="shoresh-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-brand-300)" />
          <stop offset="1" stopColor="var(--color-accent-500)" />
        </linearGradient>
      </defs>
      <g
        fill="none"
        stroke="url(#shoresh-mark)"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 18v12c0 4 2 7 6 8" />
        <path d="M32 16v22" />
        <path d="M44 18v12c0 4-2 7-6 8" />
        <path d="M20 46h24" />
      </g>
    </svg>
  );
}

/** Tema anahtarı — seçim cihazda kalır, sunucuya gitmez. */
function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      return (localStorage.getItem('shoresh.theme') as 'dark' | 'light') ?? 'dark';
    } catch {
      // Gizli sekmede ya da site verisi kapalıyken localStorage patlar;
      // tema bir kolaylıktır, uygulamayı düşürmemeli.
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('shoresh.theme', theme);
    } catch {
      /* yazamadıysak sorun değil — bu oturumda yine de doğru görünür */
    }
  }, [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="card-2 grid size-9 place-items-center transition hover:brightness-125"
      aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

/** Kenar çubuğunun içeriği — masaüstünde sabit, telefonda çekmecede. */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5 pb-8">
      {NAV_GROUPS.map((group) => (
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
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className="group flex items-center gap-2.5 rounded-lg px-3 py-2 transition"
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    color: isActive ? 'var(--color-brand-300)' : 'var(--text-dim)',
                    boxShadow: isActive ? 'inset 2px 0 0 var(--color-brand-400)' : 'none',
                  })}
                >
                  {item.icon ? (
                    <item.icon className="size-4 shrink-0" />
                  ) : (
                    <span
                      className="grid size-5 shrink-0 place-items-center rounded text-[10px] font-bold tabular-nums"
                      style={{ background: 'var(--surface-2)' }}
                    >
                      {item.badge}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.label}</span>
                    <span className="block truncate text-[10px] opacity-70">{item.hint}</span>
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
        <div className="mb-5 flex items-center gap-2.5 px-2">
          <Logo />
          <div className="leading-tight">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold tracking-tight">Shoresh</span>
              <span
                className="rounded px-1 py-px text-[9px] font-semibold tabular-nums"
                style={{ background: 'var(--surface-2)', color: 'var(--color-brand-300)' }}
              >
                v{__APP_VERSION__}
              </span>
            </div>
            <div className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
              Modern İbranice
            </div>
          </div>
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
            <div className="mb-5 flex items-center gap-2.5 px-2">
              <Logo />
              <div className="mr-auto flex items-baseline gap-1.5">
                <span className="text-base font-bold">Shoresh</span>
                <span
                  className="rounded px-1 py-px text-[9px] font-semibold tabular-nums"
                  style={{ background: 'var(--surface-2)', color: 'var(--color-brand-300)' }}
                >
                  v{__APP_VERSION__}
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
            <span className="text-sm font-bold">Shoresh</span>
            <span className="text-[9px] tabular-nums" style={{ color: 'var(--text-dim)' }}>
              v{__APP_VERSION__}
            </span>
          </span>
          <span
            className="he he-serif mr-auto hidden text-2xl lg:block"
            style={{ color: 'var(--color-brand-400)' }}
          >
            שֹׁרֶשׁ
          </span>
          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>

        <footer
          className="mx-auto max-w-5xl px-4 pb-10 pt-4 text-xs"
          style={{ color: 'var(--text-dim)' }}
        >
          Shoresh v{__APP_VERSION__} — kökten öğrenilen İbranice. Çekimler kural motoruyla
          üretilir, ezberle değil.
        </footer>
      </div>
    </div>
  );
}
