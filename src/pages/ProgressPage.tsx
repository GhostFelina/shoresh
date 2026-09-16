import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Flame, RotateCcw, Trash2 } from 'lucide-react';
import { overallStats, weakItems, type ItemProgress, type OverallStats } from '@/lib/progress';
import { dbAvailable, wipeProgress } from '@/lib/db';
import { parseItemKey } from '@/engine/srs';
import { VERB_BY_ID } from '@/data/catalog';
import { WORD_BY_ID } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import { LETTER_BY_ID, NIQQUD_BY_ID } from '@/data/alefbet';
import { FORM_LABEL, type HebrewForm } from '@/types/hebrew';
import { MixedText } from '@/components/MixedText';

/**
 * Öğe anahtarını okunabilir bir satıra çevirir.
 *
 * Anahtar `verb:כתב:paal:present` gibi teknik bir dizedir; öğrenciye
 * "כּוֹתֵב — yazmak · ŞİMDİKİ" diye gösterilmeli. Katalogda bulunamayan
 * anahtar null döner: veri değişip bir öğe kaldırılmışsa eski ilerleme
 * kaydı ekranda çöp olarak görünmesin.
 */
function describe(key: string): { he: string; tr: string; axis?: string } | null {
  const { kind, id, axis } = parseItemKey(key);

  if (kind === 'verb') {
    const v = VERB_BY_ID.get(id);
    if (!v) return null;
    const axisLabel = axis && axis in FORM_LABEL ? FORM_LABEL[axis as HebrewForm].short : undefined;
    return { he: v.lemma.vocalized, tr: v.tr[0] ?? '', axis: axisLabel };
  }
  if (kind === 'word') {
    const w = WORD_BY_ID.get(id);
    if (!w) return null;
    return { he: w.vocalized, tr: w.tr[0] ?? '', axis: axis === 'gender' ? 'CİNSİYET' : undefined };
  }
  if (kind === 'phrase') {
    const p = PHRASES.find((x) => x.id === id || x.plain === id);
    if (!p) return null;
    return { he: p.he, tr: p.tr };
  }
  if (kind === 'letter') {
    const l = LETTER_BY_ID.get(id);
    return l ? { he: l.glyph, tr: l.nameTr } : null;
  }
  if (kind === 'niqqud') {
    const n = NIQQUD_BY_ID.get(id);
    return n ? { he: n.mark, tr: n.nameTr } : null;
  }
  return null;
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone?: string }) {
  return (
    <div className="card-2 px-4 py-3">
      <div
        className="text-2xl font-bold tabular-nums"
        style={{ color: tone ?? 'var(--color-brand-300)' }}
      >
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [weak, setWeak] = useState<ItemProgress[]>([]);
  const [available, setAvailable] = useState<boolean | null>(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    const ok = await dbAvailable();
    setAvailable(ok);
    if (!ok) return;
    setStats(await overallStats());
    setWeak(await weakItems(15));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const reset = async () => {
    await wipeProgress();
    setConfirming(false);
    await load();
  };

  if (available === false) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">İlerleme</h1>
        <section className="card-2 space-y-1 p-4">
          <h2 className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#fbbf24' }}>
            <AlertTriangle className="size-3.5" />
            İlerleme kaydedilemiyor
          </h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Tarayıcı yerel veritabanını açamadı. Gizli sekmede ya da site verisi kapalıyken
            böyle olur. Uygulamanın geri kalanı normal çalışır — yalnızca neyi ne kadar
            bildiğin hatırlanmaz.
          </p>
        </section>
      </div>
    );
  }

  const empty = stats !== null && stats.attempts === 0;
  const accuracy =
    stats && stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
  const maxDay = stats ? Math.max(1, ...stats.lastWeek.map((d) => d.attempts)) : 1;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">İlerleme</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Uygulama neyi ne zaman tekrar etmen gerektiğini kendisi hesaplar. Her cevabın
          doğruluğu, süresi ve kullandığın ipucu sayısı ölçülür — 2 saniyede hatırlanan kelime
          ile 9 saniyede sökülen kelime aynı derecede bilinmiş sayılmaz.
        </p>
      </header>

      {empty ? (
        <section className="card space-y-3 p-6 text-center">
          <h2 className="text-lg font-bold">Henüz kayıt yok</h2>
          <p className="mx-auto max-w-md text-sm" style={{ color: 'var(--text-dim)' }}>
            Bir oyun oynadığında her cevabın kaydedilir ve hangi öğeyi ne zaman tekrar etmen
            gerektiği buradan hesaplanır.
          </p>
          <Link
            to="/oyunlar"
            className="inline-block rounded-lg px-4 py-2 text-sm font-semibold transition hover:brightness-110"
            style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
          >
            Oyunlara git
          </Link>
        </section>
      ) : (
        stats && (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat value={stats.touched} label="çalışılan öğe" />
              <Stat value={stats.strong} label="oturmuş" />
              <Stat value={stats.due} label="tekrar bekliyor" tone="#fbbf24" />
              <Stat value={stats.weak} label="zayıf" tone="#f87171" />
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat value={`%${stats.averageMastery}`} label="ortalama hâkimiyet" />
              <Stat value={`%${accuracy}`} label="doğruluk" />
              <Stat value={stats.attempts} label="toplam cevap" />
              <div className="card-2 px-4 py-3">
                <div
                  className="flex items-center gap-1.5 text-2xl font-bold tabular-nums"
                  style={{ color: stats.streak > 0 ? '#fb923c' : 'var(--text-dim)' }}
                >
                  <Flame className="size-5" />
                  {stats.streak}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                  günlük seri
                </div>
              </div>
            </div>

            {/* Son yedi gün */}
            <section className="card space-y-3 p-5">
              <h2 className="text-sm font-semibold">Son yedi gün</h2>
              <div className="flex items-end gap-2" style={{ height: '5rem' }}>
                {stats.lastWeek.map((d) => {
                  const h = Math.round((d.attempts / maxDay) * 100);
                  const label = new Date(d.day).toLocaleDateString('tr-TR', { weekday: 'short' });
                  return (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${Math.max(3, h)}%`,
                          background:
                            d.attempts > 0 ? 'var(--color-brand-400)' : 'var(--surface-2)',
                        }}
                        title={`${d.attempts} cevap, ${d.correct} doğru`}
                      />
                      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Zayıf öğeler */}
            {weak.length > 0 && (
              <section className="card space-y-2 p-5">
                <h2 className="text-sm font-semibold">Zorlandıkların</h2>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  Sık yanıldığın ya da hatırlaman uzun süren öğeler. Bunlar tekrar kuyruğunda
                  öne alınır.
                </p>
                <ul className="space-y-1">
                  {weak.map((p) => {
                    const d = describe(p.key);
                    if (!d) return null;
                    return (
                      <li
                        key={p.key}
                        className="card-2 flex items-center gap-3 px-3 py-2"
                      >
                        <span className="he he-vocalized w-28 shrink-0 text-lg">{d.he}</span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          <MixedText>{d.tr}</MixedText>
                        </span>
                        {d.axis && (
                          <span
                            className="shrink-0 text-[10px]"
                            style={{ color: 'var(--text-dim)' }}
                          >
                            {d.axis}
                          </span>
                        )}
                        <span
                          className="w-10 shrink-0 text-right text-xs tabular-nums"
                          style={{ color: '#f87171' }}
                        >
                          %{p.mastery}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </>
        )
      )}

      {/* Sıfırlama */}
      {!empty && (
        <section className="card-2 space-y-2 p-4">
          <h2 className="text-xs font-semibold">İlerlemeyi sıfırla</h2>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            Bütün cevaplar, tekrar takvimi ve günlük seri silinir. Geri alınamaz.
          </p>
          {confirming ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void reset()}
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: '#f87171', color: '#1a0505' }}
              >
                <Trash2 className="size-3.5" />
                Evet, hepsini sil
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="card px-3 py-1.5 text-xs transition hover:brightness-125"
              >
                Vazgeç
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="card flex items-center gap-2 px-3 py-1.5 text-xs transition hover:brightness-125"
            >
              <RotateCcw className="size-3.5" />
              Sıfırla
            </button>
          )}
        </section>
      )}
    </div>
  );
}
