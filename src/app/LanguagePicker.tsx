/**
 * Öğrenilen dil seçici — marka adının altında.
 *
 * NEDEN BURADA: Kullanıcının istediği yer "mantıklı bir konum": hangi
 * dili çalıştığın, uygulamanın kimliğinin hemen yanında görünmeli.
 * Üst bantta dursaydı tema ve palet düğmelerinin arasında kaybolur,
 * bir ayar gibi görünürdü — oysa bu bir ayar değil, o anki bağlam.
 *
 * NEDEN TEK DİLDE DE GÖRÜNÜYOR: Şu an yalnızca İbranice var. Düğme
 * gizlenseydi kullanıcı uygulamanın tek dilli olduğunu sanır, ikinci dil
 * geldiğinde de yeni bir şey öğrenmesi gerekirdi. Şimdi görünüyor ve
 * hangi dili çalıştığını söylüyor; Korece eklendiğinde aynı yerde bir
 * seçenek daha çıkacak, başka hiçbir şey değişmeyecek.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronDown } from 'lucide-react';
import { languages } from '@/core/language';
import { useLanguage } from './LanguageContext';

export function LanguagePicker({ onNavigate }: { onNavigate?: () => void }) {
  const dil = useLanguage();
  const hepsi = languages();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const kutu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const kapat = (e: PointerEvent) => {
      if (!kutu.current?.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('pointerdown', kapat);
    window.addEventListener('keydown', esc);
    return () => {
      window.removeEventListener('pointerdown', kapat);
      window.removeEventListener('keydown', esc);
    };
  }, [open]);

  const tekDil = hepsi.length <= 1;

  return (
    <div className="relative" ref={kutu}>
      <button
        type="button"
        onClick={() => !tekDil && setOpen((o) => !o)}
        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition"
        style={{
          background: open ? 'var(--surface-2)' : 'transparent',
          cursor: tekDil ? 'default' : 'pointer',
        }}
        aria-label="Öğrenilen dil"
        aria-expanded={tekDil ? undefined : open}
        title={tekDil ? `Öğrenilen dil: ${dil.name.tr}` : 'Öğrenilen dili değiştir'}
      >
        <span
          className="he shrink-0 text-base"
          style={{ color: 'var(--accent-text)' }}
          aria-hidden="true"
        >
          {dil.nativeName}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-xs font-semibold">{dil.englishName}</span>
          <span className="block truncate text-[10px]" style={{ color: 'var(--text-dim)' }}>
            {dil.name.tr}
          </span>
        </span>
        {!tekDil && (
          <ChevronDown
            className="size-3.5 shrink-0 transition"
            style={{
              color: 'var(--text-dim)',
              transform: open ? 'rotate(180deg)' : 'none',
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="card absolute inset-x-0 z-50 mt-1 overflow-hidden p-1"
          style={{ animation: 'shoresh-pop 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)' }}
          role="menu"
        >
          {hepsi.map((l) => (
            <button
              key={l.id}
              type="button"
              role="menuitemradio"
              aria-checked={l.id === dil.id}
              onClick={() => {
                setOpen(false);
                onNavigate?.();
                navigate(`/${l.id}`);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-start transition"
              style={{ background: l.id === dil.id ? 'var(--surface-2)' : 'transparent' }}
            >
              <span className="he shrink-0 text-base" style={{ color: 'var(--accent-text)' }}>
                {l.nativeName}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-semibold">{l.englishName}</span>
                <span
                  className="block truncate text-[10px] leading-tight"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {l.blurb.tr}
                </span>
              </span>
              {l.id === dil.id && (
                <Check className="size-3.5 shrink-0" style={{ color: 'var(--accent-text)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
