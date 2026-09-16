import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Flame, RotateCcw, Trash2 } from 'lucide-react';
import { overallStats, weakItems, type ItemProgress, type OverallStats } from '@/lib/progress';
import { dbAvailable, wipeProgress } from '@/lib/db';
import { MixedText } from '@/components/MixedText';
import { RewardPanels } from '@/features/rewards/RewardPanels';
import { useLanguage, useLanguagePath } from '@/app/LanguageContext';

/**
 * Öğe anahtarını okunabilir bir satıra çevirir.
 *
 * Anahtar `verb:כתב:paal:present` gibi teknik bir dizedir; öğrenciye
 * "כּוֹתֵב — yazmak · ŞİMDİKİ" diye gösterilmeli. Katalogda bulunamayan
 * anahtar null döner: veri değişip bir öğe kaldırılmışsa eski ilerleme
 * kaydı ekranda çöp olarak görünmesin.
 */

/**
 * YYYY-MM-DD'yi gün adına çevirir.
 *
 * Elle parçalanıyor: `new Date('2026-09-16')` tarihi UTC gece yarısı
 * sayar ve UTC'nin gerisindeki saat dilimlerinde bir ÖNCEKİ günü
 * gösterir. Gün etiketinin yanlış olması grafiği sessizce yalan yapar.
 */
function weekdayLabel(day: string): string {
  const [y, m, d] = day.split('-').map(Number) as [number, number, number];
  return new Date(y, m - 1, d).toLocaleDateString('tr-TR', { weekday: 'short' });
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone?: string }) {
  return (
    <div className="card-2 px-4 py-3">
      <div
        className="text-2xl numeric font-bold"
        style={{ color: tone ?? 'var(--accent-text)' }}
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
  const yol = useLanguagePath();
  /*
   * Anahtarı okunabilir hâle çevirmek DİLİN işi. Burada yapılsaydı
   * sayfa İbranice kataloğunu içeri almak zorunda kalır ve Korece
   * eklendiğinde "hangi dil?" koşulları buraya sızardı.
   */
  const dil = useLanguage();
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
        <h1 className="title-gradient text-2xl font-bold tracking-tight">İlerleme</h1>
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
        <h1 className="title-gradient text-2xl font-bold tracking-tight">İlerleme</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Uygulama neyi ne zaman tekrar etmen gerektiğini kendisi hesaplar. Her cevabın
          doğruluğu, süresi ve kullandığın ipucu sayısı ölçülür — 2 saniyede hatırlanan kelime
          ile 9 saniyede sökülen kelime aynı derecede bilinmiş sayılmaz.
        </p>
      </header>

      {/*
        Ödül bölümleri SRS bölümlerinden ÖNCE geliyor. Sebebi sıralama
        değil öncelik: sayfayı açan kişi önce "ne kadar yol aldım"
        sorusunun cevabını arıyor; "neyi tekrar etmeliyim" ondan sonra
        gelen bir soru.
      */}
      <RewardPanels />

      {empty ? (
        <section className="card space-y-3 p-6 text-center">
          <h2 className="text-lg font-bold">Henüz kayıt yok</h2>
          <p className="mx-auto max-w-md text-sm" style={{ color: 'var(--text-dim)' }}>
            Bir oyun oynadığında her cevabın kaydedilir ve hangi öğeyi ne zaman tekrar etmen
            gerektiği buradan hesaplanır.
          </p>
          <Link
            to={yol('oyunlar')}
            className="inline-block rounded-lg px-4 py-2 text-sm font-semibold card-interactive"
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
                  className="flex items-center gap-1.5 text-2xl numeric font-bold"
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
              {/*
                Çubuklar MUTLAK konumla çiziliyor.
                Önceki yazımda yüzde yükseklikli bir çubuk, yüksekliği
                `auto` olan bir sütunun içindeydi; CSS'te yüzde yükseklik
                böyle bir kapsayıcıda çözülmez ve çubukların hepsi sıfır
                yükseklikte kalıyordu — grafik boş görünüyordu. Şimdi
                yüzde, yüksekliği flex ile KESİNLEŞMİŞ bir raya göre
                hesaplanıyor.
              */}
              <div className="flex items-stretch gap-2" style={{ height: '6rem' }}>
                {stats.lastWeek.map((d) => {
                  const h = Math.round((d.attempts / maxDay) * 100);
                  return (
                    <div key={d.day} className="flex flex-1 flex-col gap-1">
                      <div className="relative flex-1">
                        <div
                          className="absolute inset-x-0 bottom-0 rounded-t transition-all"
                          style={{
                            height: `${Math.max(4, h)}%`,
                            background:
                              d.attempts > 0 ? 'var(--color-brand-400)' : 'var(--surface-2)',
                          }}
                          title={`${d.attempts} cevap, ${d.correct} doğru`}
                        />
                      </div>
                      <span
                        className="shrink-0 text-center text-[10px]"
                        style={{ color: 'var(--text-dim)' }}
                      >
                        {weekdayLabel(d.day)}
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
                    const d = dil.describeItem(p.key);
                    if (!d) return null;
                    return (
                      <li
                        key={p.key}
                        className="card-2 flex items-center gap-3 px-3 py-2"
                      >
                        <span className="he he-vocalized w-28 shrink-0 text-lg">{d.native}</span>
                        <span className="min-w-0 flex-1 truncate text-sm">
                          <MixedText>{d.meaning}</MixedText>
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
                          className="w-10 shrink-0 text-right numeric text-xs"
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
                className="card px-3 py-1.5 text-xs card-interactive"
              >
                Vazgeç
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="card flex items-center gap-2 px-3 py-1.5 text-xs card-interactive"
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
