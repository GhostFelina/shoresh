import { NavLink } from 'react-router-dom';
import { useEffect, useState, type ReactNode } from 'react';
import { Moon, Sun } from 'lucide-react';
import { NAV_ITEMS } from './nav';

/** Markanın adını taşıyan işaret: ש harfinin üç çatalı = üç kök harfi. */
function Logo() {
  return (
    <svg viewBox="0 0 64 64" className="size-8 shrink-0" aria-hidden="true">
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

export default function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-20 border-b backdrop-blur-xl" style={{ background: 'color-mix(in srgb, var(--bg) 85%, transparent)' }}>
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <Logo />
          <div className="mr-auto leading-tight">
            <div className="text-base font-bold tracking-tight">Shoresh</div>
            <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              Modern İbranice
            </div>
          </div>
          <span className="he he-serif hidden text-2xl sm:block" style={{ color: 'var(--color-brand-400)' }}>
            שֹׁרֶשׁ
          </span>
          <ThemeToggle />
        </div>

        <nav className="mx-auto max-w-6xl overflow-x-auto px-4">
          <ul className="flex gap-1 pb-2">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      'flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition',
                      isActive ? 'font-semibold' : 'hover:brightness-125',
                    ].join(' ')
                  }
                  style={({ isActive }) => ({
                    background: isActive ? 'var(--surface-2)' : 'transparent',
                    color: isActive ? 'var(--color-brand-300)' : 'var(--text-dim)',
                  })}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-xs" style={{ color: 'var(--text-dim)' }}>
        Shoresh — kökten öğrenilen İbranice. Çekimler kural motoruyla üretilir, ezberle değil.
      </footer>
    </div>
  );
}
