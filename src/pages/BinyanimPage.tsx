import { conjugate } from '@/engine/binyan';
import { CATALOG_STATS } from '@/data/catalog';
import { BINYANIM, BINYAN_LABEL, BINYAN_PAIRS, type Binyan } from '@/types/hebrew';

/**
 * Örnek kök ק־ט־ל değil כ־ת־ב seçildi.
 *
 * Geleneksel dilbilgisi kitapları binyanları פ־ע־ל ya da ק־ט־ל köküyle
 * anlatır; ikisi de öğrencinin günlük hayatta kullanmayacağı köklerdir
 * (ק־ט־ל "öldürmek"). כ־ת־ב "yazmak" yedi binyanın hepsinde anlamlı bir
 * fiil verir ve öğrenci kalıbı bildiği bir kelimeyle eşleştirir.
 */
const DEMO_ROOT = ['כ', 'ת', 'ב'];

const SENSE: Record<Binyan, string> = {
  paal: 'yazdı',
  nifal: 'yazıldı',
  piel: 'yazışma tuttu / kaleme aldı',
  pual: 'kaleme alındı',
  hifil: 'yazdırdı',
  hufal: 'yazdırıldı',
  hitpael: 'yazıştı',
};

export default function BinyanimPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">Yedi binyan</h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          İbranicede fiil ezberlenmez, kalıba oturur. Aynı üç harfli kök yedi ayrı kalıpta yedi
          ayrı anlam verir. Aşağıdaki tablonun tamamı <span className="he">כ־ת־ב</span> kökünden,
          çekim motoruyla üretildi.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-2">
        {BINYANIM.map((b) => {
          const t = conjugate(DEMO_ROOT, b);
          const pair = BINYAN_PAIRS[b];
          return (
            <section key={b} className="card space-y-3 p-4">
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-lg font-bold">{BINYAN_LABEL[b].tr}</h2>
                <span className="he text-lg" style={{ color: 'var(--accent-text)' }}>
                  {BINYAN_LABEL[b].he}
                </span>
                {pair && (
                  <span className="mr-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    edilgeni: {BINYAN_LABEL[pair].tr}
                  </span>
                )}
              </div>

              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {BINYAN_LABEL[b].sense}
              </p>

              <dl className="space-y-1 text-sm">
                {(
                  [
                    ['geçmiş', t.past.hu],
                    ['şimdiki', t.present.ms],
                    ['gelecek', t.future.hu],
                    ['mastar', t.infinitive],
                  ] as const
                ).map(([label, c]) =>
                  c ? (
                    <div key={label} className="card-2 flex items-center gap-3 px-3 py-1.5">
                      <dt className="w-16 shrink-0 text-[11px]" style={{ color: 'var(--text-dim)' }}>
                        {label}
                      </dt>
                      <dd className="he he-vocalized flex-1 text-lg">{c.vocalized}</dd>
                      <dd className="text-xs italic" style={{ color: 'var(--accent-text)' }}>
                        {c.translit}
                      </dd>
                    </div>
                  ) : null,
                )}
              </dl>

              <p className="text-xs">
                <span style={{ color: 'var(--text-dim)' }}>Anlam: </span>
                {SENSE[b]}
              </p>

              <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                Katalogda {CATALOG_STATS.byBinyan[b]} fiil
              </p>
            </section>
          );
        })}
      </div>
    </div>
  );
}
