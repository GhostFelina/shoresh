/**
 * Görünüm denetimi — tema (koyu/açık) ve palet (marka rengi).
 *
 * NEDEN AYRI DOSYA: İkisi tek bir durum gibi davranıyor — palet
 * uygulanırken hangi temada olduğumuzu bilmek zorunda, çünkü her paletin
 * koyu ve açık için ayrı ton takımı var. Tema anahtarı `Shell` içinde,
 * palet seçici başka yerde dursaydı biri ötekinin değişiminden habersiz
 * kalır ve açık temada koyu tema tonları ekranda kalırdı.
 *
 * SEÇİM CİHAZDA KALIR: Sunucuya gitmez, hesap gerektirmez. Gizli sekmede
 * `localStorage` erişimi hata fırlatabilir; görünüm bir kolaylıktır,
 * uygulamayı düşürmemeli — bu yüzden her okuma/yazma korumalı.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, Moon, Palette, Sun } from 'lucide-react';
import { DEFAULT_PALETTE, PALETTES, applyPalette } from '@/lib/palette';

export type Theme = 'dark' | 'light';

const read = (key: string, fallback: string): string => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const write = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* yazamadıysak sorun değil — bu oturumda yine de doğru görünür */
  }
};

/**
 * Renk geçişini yumuşatır.
 *
 * Geçiş kuralı KALICI değil: her öğeye sürekli `transition` vermek,
 * sayfa içi her renk değişimini (kart vurgusu, düğme basılması)
 * geciktirirdi. Sınıf yalnızca değişim anında takılıp kaldırılıyor.
 */
function withTransition(fn: () => void): void {
  const root = document.documentElement;
  root.classList.add('palette-shift');
  fn();
  window.setTimeout(() => root.classList.remove('palette-shift'), 320);
}

export function useAppearance() {
  const [theme, setTheme] = useState<Theme>(() => (read('shoresh.theme', 'dark') as Theme) ?? 'dark');
  const [palette, setPalette] = useState<string>(() =>
    read('shoresh.palette', DEFAULT_PALETTE),
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    applyPalette(palette, theme);
    write('shoresh.theme', theme);
    write('shoresh.palette', palette);
  }, [theme, palette]);

  const changeTheme = useCallback((next: Theme) => withTransition(() => setTheme(next)), []);
  const changePalette = useCallback((next: string) => withTransition(() => setPalette(next)), []);

  return { theme, palette, changeTheme, changePalette };
}

export function ThemeToggle({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (t: Theme) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(theme === 'dark' ? 'light' : 'dark')}
      className="card-2 grid size-9 place-items-center card-interactive"
      aria-label={theme === 'dark' ? 'Açık temaya geç' : 'Koyu temaya geç'}
      title={theme === 'dark' ? 'Açık tema' : 'Koyu tema'}
    >
      {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </button>
  );
}

export function PalettePicker({
  theme,
  palette,
  onChange,
}: {
  theme: Theme;
  palette: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  /*
   * Dışarı tıklayınca kapanır. `pointerdown` kullanılıyor, `click`
   * değil: tıklama olayı listedeki bir düğmeye denk gelirse önce o
   * çalışır ve panel bir kare boyunca açık kalıp göz kırpar.
   */
  useEffect(() => {
    if (!open) return;
    const close = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', close);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const current = PALETTES.find((p) => p.id === palette) ?? PALETTES[0]!;
  const tones = theme === 'light' ? current.light : current.dark;

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="card-2 grid size-9 place-items-center card-interactive"
        aria-label="Renk paleti"
        aria-expanded={open}
        title={`Renk paleti — ${current.name}`}
        style={{ borderColor: open ? tones.brand400 : 'var(--border)' }}
      >
        <Palette className="size-4" style={{ color: tones.accentText }} />
      </button>

      {open && (
        <div
          className="card absolute end-0 z-50 mt-2 w-60 overflow-hidden p-1.5"
          style={{ animation: 'shoresh-pop 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)' }}
          role="menu"
        >
          <p
            className="px-2 pb-1.5 pt-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-dim)' }}
          >
            Renk paleti
          </p>
          {PALETTES.map((p) => {
            const t = theme === 'light' ? p.light : p.dark;
            const active = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  onChange(p.id);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start transition"
                style={{ background: active ? 'var(--surface-2)' : 'transparent' }}
              >
                {/* Üç ton yan yana: seçmeden önce paletin nasıl duracağı görünsün. */}
                <span className="flex shrink-0 gap-1" aria-hidden="true">
                  {[t.brand400, t.accent400, t.accentFem].map((c) => (
                    <span
                      key={c}
                      className="size-3.5 rounded-full"
                      style={{ background: c, boxShadow: '0 0 0 1px rgb(0 0 0 / 0.25) inset' }}
                    />
                  ))}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">{p.name}</span>
                  <span
                    className="block truncate text-[10px] leading-tight"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {p.blurb}
                  </span>
                </span>
                {active && <Check className="size-3.5 shrink-0" style={{ color: t.accentText }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
