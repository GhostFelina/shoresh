import { useState } from 'react';
import { Delete, Keyboard, X } from 'lucide-react';

/**
 * Ekran klavyesi — İbranice harfler.
 *
 * NEDEN GEREKLİ: Uygulamanın kullanıcısı Türkçe klavye kullanıyor ve
 * İbranice harf YAZAMIYOR. "Zaman Makinesi" gibi yazarak cevaplanan
 * oyunlarda bu, oyunu oynanamaz kılıyordu. Latin harfle okunuş yazmak
 * kabul ediliyor ama bu bir ödün: İbranice harfle yazabilmek ayrı bir
 * beceridir ve asıl öğretilmesi gereken odur.
 *
 * DÜZEN: İsrail standart klavyesinin harf sırası. Alfabetik dizmek daha
 * kolay görünürdü ama öğrenci gerçek bir klavyede bu düzenle karşılaşacak;
 * buradaki alışkanlık oraya taşınsın diye aynısı kullanılıyor.
 *
 * SOFİT HARFLER: Ayrı bir sırada değil, ait oldukları harfin yanında
 * duruyor (İsrail klavyesinde olduğu gibi ך kaf'ın yanında). Ayrı satıra
 * alınsaydı öğrenci onları ayrı harfler sanırdı — oysa aynı harfin
 * kelime sonundaki biçimi.
 */

/** İsrail standart klavye düzeni, üç sıra. */
const ROWS: string[][] = [
  ['ק', 'ר', 'א', 'ט', 'ו', 'ן', 'ם', 'פ'],
  ['ש', 'ד', 'ג', 'כ', 'ע', 'י', 'ח', 'ל', 'ך', 'ף'],
  ['ז', 'ס', 'ב', 'ה', 'נ', 'מ', 'צ', 'ת', 'ץ'],
];

export interface HebrewKeyboardProps {
  /** Harf eklenince çağrılır. */
  onInsert: (char: string) => void;
  /** Son karakteri sil. */
  onBackspace: () => void;
  /** Hepsini sil. */
  onClear: () => void;
  disabled?: boolean;
}

export function HebrewKeyboard({
  onInsert,
  onBackspace,
  onClear,
  disabled = false,
}: HebrewKeyboardProps) {
  return (
    <div className="card-2 space-y-1.5 p-2" dir="rtl">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-center gap-1">
          {row.map((ch) => (
            <button
              key={ch}
              type="button"
              disabled={disabled}
              onClick={() => onInsert(ch)}
              /*
               * `min-w` ile sabit genişlik: harflerin görsel eni çok
               * farklı (י dar, ם geniş). Sabitlenmezse tuşlar zıplar ve
               * kas hafızası oluşmaz.
               */
              className="he he-serif min-w-9 flex-1 rounded-md py-2 text-xl card-interactive disabled:opacity-40"
              style={{ background: 'var(--surface)' }}
              aria-label={`${ch} harfini ekle`}
            >
              {ch}
            </button>
          ))}
        </div>
      ))}

      <div className="flex justify-center gap-1">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onInsert(' ')}
          className="flex-1 rounded-md py-2 text-xs card-interactive disabled:opacity-40"
          style={{ background: 'var(--surface)', color: 'var(--text-dim)' }}
          aria-label="Boşluk ekle"
        >
          boşluk
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className="grid min-w-12 place-items-center rounded-md py-2 card-interactive disabled:opacity-40"
          style={{ background: 'var(--surface)' }}
          aria-label="Son harfi sil"
        >
          <Delete className="size-4" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={onClear}
          className="grid min-w-12 place-items-center rounded-md py-2 card-interactive disabled:opacity-40"
          style={{ background: 'var(--surface)' }}
          aria-label="Hepsini sil"
        >
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}

/**
 * Klavyeyi açıp kapatan düğme ve panel.
 *
 * Varsayılan KAPALI: İbranice klavyesi kurulu olan ya da Latin harfle
 * cevaplamayı tercih eden kullanıcıya her soruda üç sıra tuş göstermek
 * ekranı boğardı. Bir kez açıldığında tercih hatırlanıyor.
 */
export function HebrewKeyboardToggle(props: HebrewKeyboardProps) {
  const [open, setOpen] = useState<boolean>(() => {
    try {
      return localStorage.getItem('shoresh.keyboard') === 'open';
    } catch {
      return false;
    }
  });

  const toggle = () => {
    const next = !open;
    setOpen(next);
    try {
      localStorage.setItem('shoresh.keyboard', next ? 'open' : 'closed');
    } catch {
      /* tercih saklanamadıysa sorun değil, bu oturumda yine çalışır */
    }
  };

  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={toggle}
        className="card-2 flex items-center gap-2 px-3 py-1.5 text-xs card-interactive"
        aria-expanded={open}
      >
        <Keyboard className="size-3.5" />
        {open ? 'Klavyeyi gizle' : 'İbranice klavye'}
      </button>
      {open && <HebrewKeyboard {...props} />}
    </div>
  );
}
