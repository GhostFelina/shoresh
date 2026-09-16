import { Volume2 } from 'lucide-react';
import { NIQQUDIM } from '@he/data/alefbet';
import { speak } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';

/**
 * Okuma alıştırması için taşıyıcı harf: ב seçildi çünkü hem çok sık
 * geçer hem de harekesi altında net görünür. א ya da ע seçilseydi
 * "harfin kendi sesi yok" karışıklığı ünlü dersine bulaşırdı.
 */
const CARRIER = 'ב';

/** Harekeli okumadan harekesiz okumaya geçiş örnekleri. */
const READING_STEPS = [
  { vocalized: 'שָׁלוֹם', plain: 'שלום', translit: 'şalom', tr: 'merhaba; barış' },
  { vocalized: 'תּוֹדָה', plain: 'תודה', translit: 'toda', tr: 'teşekkürler' },
  { vocalized: 'בַּיִת', plain: 'בית', translit: 'bayit', tr: 'ev' },
  { vocalized: 'סֵפֶר', plain: 'ספר', translit: 'sefer', tr: 'kitap' },
  { vocalized: 'יֶלֶד', plain: 'ילד', translit: 'yeled', tr: 'çocuk' },
  { vocalized: 'מַיִם', plain: 'מים', translit: 'mayim', tr: 'su' },
  { vocalized: 'אִמָּא', plain: 'אמא', translit: 'ima', tr: 'anne' },
  { vocalized: 'כֶּלֶב', plain: 'כלב', translit: 'kelev', tr: 'köpek' },
];

export default function ReadingPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">Harekeler ve okuma</h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          İbrani alfabesinde ünlü harf yoktur. Ünlüler harfin altına ya da üstüne konan küçük
          işaretlerle verilir. Bu işaretlere <span className="he">נִקּוּד</span> (nikud) denir.
        </p>
      </header>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Dokuz temel hareke</h2>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Modern İvritte uzun/kısa ünlü ayrımı DUYULMAZ. Kamatz ile patah aynı "a", tzere ile segol
          aynı "e" okunur. Bu yüzden ses grubuna göre öğrenmek yeterli.
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {NIQQUDIM.map((n) => (
            <div key={n.id} className="card-2 space-y-1 p-3">
              <div className="flex items-baseline gap-3">
                <span className="he he-serif text-3xl leading-none">
                  {n.id === 'shuruk' ? n.mark : CARRIER + n.mark}
                </span>
                <span className="text-lg font-bold" style={{ color: 'var(--accent-text)' }}>
                  {n.sound}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-medium">{n.nameTr}</span>
                <span className="he text-xs" style={{ color: 'var(--text-dim)' }}>
                  {n.nameHe}
                </span>
              </div>
              {n.noteTr && (
                <p className="text-[11px] leading-snug" style={{ color: 'var(--text-dim)' }}>
                  <MixedText>{n.noteTr}</MixedText>
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Harekeliden harekesize</h2>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Gerçek hayatta İsrail'de harekesiz yazı okursun: gazete, tabela, WhatsApp. Harekeler
          yalnızca çocuk kitaplarında, şiirde ve sözlükte bulunur. Hedef, sağdaki sütuna bakıp
          okuyabilmek.
        </p>

        <div className="space-y-1">
          <div
            className="grid grid-cols-[1fr_1fr_6rem_1fr_2.5rem] gap-2 px-3 text-[10px] uppercase tracking-wide"
            style={{ color: 'var(--text-dim)' }}
          >
            <span>Harekeli</span>
            <span>Harekesiz</span>
            <span>Okunuş</span>
            <span>Anlam</span>
            <span />
          </div>
          {READING_STEPS.map((w) => (
            <div key={w.plain} className="card-2 grid grid-cols-[1fr_1fr_6rem_1fr_2.5rem] items-center gap-2 px-3 py-2">
              <span className="he he-vocalized he-serif text-xl">{w.vocalized}</span>
              <span className="he he-serif text-xl">{w.plain}</span>
              <span className="text-xs italic" style={{ color: 'var(--accent-text)' }}>
                {w.translit}
              </span>
              <span className="text-xs">{w.tr}</span>
              <button
                type="button"
                onClick={() => speak(w.plain)}
                className="grid size-8 place-items-center rounded-lg card-interactive"
                style={{ background: 'var(--surface)' }}
                aria-label={`${w.tr} kelimesini seslendir`}
              >
                <Volume2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
