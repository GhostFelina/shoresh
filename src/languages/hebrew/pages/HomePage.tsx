/**
 * Ana sayfa.
 *
 * NEDEN YENİDEN YAZILDI: Kullanıcı "çok dar, amatör ve garip" dedi ve
 * komple değiştirme izni verdi. Eski düzenin somut sorunları:
 *   - Sekiz sayaç iki sıra hâlinde art arda diziliydi; hepsi aynı
 *     ağırlıkta olduğu için hiçbiri okunmuyordu. Sayı listesi bir
 *     iddia değildir.
 *   - Giriş paneli düz bir kartı; sayfanın "başladığı" yer belli
 *     olmuyordu.
 *   - İkonlar çıplak duruyordu — kullanıcının "emoji gibi" dediği şey
 *     buydu; ikonlar artık kaba (`icon-chip`) oturuyor.
 *   - Kabuk 1024px'te kalıyordu, sayfa dar görünüyordu.
 *
 * SAYFA DÜZENİ ARTIK BİR SIRA ANLATIYOR: ne olduğu (giriş) → bugün ne
 * yapmalısın (varsa) → nereden başlanır (yol) → neden işe yarar (kök) →
 * sistemin dürüst durumu.
 *
 * DİLE ÖZEL DEĞİL, DİLİN VERİSİYLE ÇALIŞIR: sayaçlar dil modülünün
 * `stats()` çıktısından geliyor. Korece eklendiğinde bu sayfanın
 * düzeni aynı kalıp içeriği değişecek.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Flame, Languages, Sparkles, Type } from 'lucide-react';
import { CATALOG_ISSUES } from '@he/data/catalog';
import { MixedText } from '@/components/MixedText';
import { overallStats, type OverallStats } from '@/lib/progress';
import { canSpeakHebrew, speechStatus } from '@/lib/speech';
import { useLanguage, useLanguagePath } from '@/app/LanguageContext';
import { usePageWidth } from '@/app/Layout';

/*
 * Yollar dil ÖNEKSİZ yazılıyor; önek çizim sırasında ekleniyor.
 * Mutlak yazılsalardı Korece eklendiğinde bu üç bağlantı İbranice'ye
 * çakılı kalırdı — nitekim ilk taşımada tam olarak öyle kaldılar ve
 * bağlantı bütünlüğü testi yakaladı.
 */
const PATH = [
  {
    to: 'alefbet',
    icon: Type,
    step: '01',
    title: 'Harfleri tanı',
    body: '22 harf, 5 sofit biçim. Benzeyen harfleri ayırt etmeyi öğren: ב/כ, ד/ר, ה/ח.',
  },
  {
    to: 'okuma',
    icon: BookOpen,
    step: '02',
    title: 'Harekeyle oku',
    body: 'Ünlüler harfin altındadır. Dokuz işaretle her kelimeyi okuyabilir hâle gel.',
  },
  {
    to: 'verb',
    icon: Languages,
    step: '03',
    title: 'Kökten çek',
    body: 'Üç harfli kök yedi kalıba oturur. Fiil ezberlemezsin, kalıbı öğrenirsin.',
  },
];

/** Kökün kalıba göre anlam değiştirmesi — uygulamanın tek iddiası. */
const KOK_ORNEK: Array<[string, string, string, string]> = [
  ['כָּתַב', 'katav', 'yazdı', "Pa'al — temel"],
  ['נִכְתַּב', 'nihtav', 'yazıldı', "Nif'al — edilgen"],
  ['הִכְתִּיב', 'hihtiv', 'yazdırdı', "Hif'il — ettirgen"],
  ['הִתְכַּתֵּב', 'hitkatev', 'yazıştı', "Hitpa'el — karşılıklı"],
];

/**
 * Sayaç.
 *
 * NEDEN ÜÇÜ ÖNDE, GERİSİ ŞERİTTE: Sekiz sayının hepsi aynı boyda
 * olunca göz hiçbirine takılmıyordu. Üç tanesi büyük (uygulamanın
 * ölçeğini anlatan üç sayı), kalanlar tek satırlık bir şeritte.
 */
function BuyukSayac({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="min-w-0">
      <div className="kpi text-3xl leading-none sm:text-4xl">
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="mt-1 truncate text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
    </div>
  );
}

/**
 * Bugünün dersi.
 *
 * NEDEN ANA SAYFADA: Aralıklı tekrarın işe yaraması için öğrencinin
 * "bugün ne yapmalıyım" sorusuna tek bakışta cevap bulması gerekir.
 * Menüde gizli bir sayfada dursaydı kimse vadesi gelen tekrarları
 * zamanında yapmazdı ve sistem kâğıt üzerinde kalırdı.
 */
function TodayCard() {
  const yol = useLanguagePath();
  const [stats, setStats] = useState<OverallStats | null>(null);

  useEffect(() => {
    void overallStats().then(setStats);
  }, []);

  // Hiç çalışılmamışsa şerit gösterilmez — boş sayaçlar cesaret kırar.
  if (!stats || stats.attempts === 0) return null;

  const kutular: Array<[number, string, string]> = [
    [stats.due, 'tekrar bekliyor', 'var(--warn)'],
    [stats.weak, 'zayıf', 'var(--danger)'],
    [stats.strong, 'oturmuş', 'var(--ok)'],
  ];

  return (
    <section className="card card-lit space-y-4 p-5 sm:p-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="icon-chip icon-chip-sm">
          <Sparkles className="size-4" />
        </span>
        <h2 className="me-auto text-base font-semibold">Bugünün dersi</h2>
        {stats.streak > 0 && (
          <span
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              color: 'var(--warn)',
              background: 'color-mix(in srgb, var(--warn) 12%, transparent)',
            }}
          >
            <Flame className="size-3.5" />
            {stats.streak} günlük seri
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {kutular.map(([sayi, etiket, renk]) => (
          <div key={etiket} className="card-2 px-3 py-3">
            <div className="numeric text-2xl font-bold leading-none" style={{ color: renk }}>
              {sayi}
            </div>
            <div className="mt-1.5 text-[10px]" style={{ color: 'var(--text-dim)' }}>
              {etiket}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={yol('oyunlar')} className="btn btn-primary">
          {stats.due > 0 ? `${stats.due} tekrarı çöz` : 'Çalışmaya devam et'}
        </Link>
        <Link to={yol('ilerleme')} className="btn btn-secondary">
          İlerlemeyi gör
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  const yol = useLanguagePath();
  const dil = useLanguage();
  const speechReady = canSpeakHebrew();

  /*
   * Ana sayfa GENİŞ. Kullanıcının "çok dar" şikâyeti buydu: kabuğun
   * 1024px sınırında dört sayaç yan yana sığmıyor, kartlar da alt
   * alta yığılıyordu.
   */
  usePageWidth('wide');

  const sayaclar = dil.stats();
  const one = sayaclar.slice(0, 3);
  const serit = sayaclar.slice(3);

  return (
    <div className="space-y-6">
      {/* ---- Giriş ---- */}
      <section className="hero p-6 sm:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1 space-y-5">
            <span className="eyebrow">{dil.englishName} · A1 → B2</span>

            <h1 className="title-gradient text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              Kökten İbranice
            </h1>

            <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
              İbranicede her fiil üç harfli bir <strong>kökten</strong> (
              <MixedText>שורש</MixedText>) doğar. O kök yedi kalıptan birine oturur ve bütün
              çekim tablosu kalıptan çıkar. Bu uygulama sana tek tek fiil ezberletmez —{' '}
              <strong>kalıbı</strong> öğretir, gerisini motor üretir.
            </p>

            <div className="flex flex-wrap gap-2">
              <Link to={yol('ogretmen')} className="btn btn-primary">
                Derse başla
              </Link>
              <Link to={yol('verb')} className="btn btn-secondary">
                Çekim motorunu gör
              </Link>
            </div>
          </div>

          {/*
            Kökün kendisi sayfanın görsel çapası. Dekoratif değil:
            uygulamanın adının ve fikrinin kaynağı bu kelime.
          */}
          <div className="shrink-0 lg:w-72">
            <div className="card card-lit flex flex-col items-center gap-2 p-6">
              <span
                className="he he-serif text-6xl leading-none sm:text-7xl"
                style={{ color: 'var(--accent-text)' }}
              >
                שֹׁרֶשׁ
              </span>
              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                şoreş — kök
              </span>
            </div>
          </div>
        </div>

        <hr className="hairline my-7" />

        {/* Üç büyük sayı: uygulamanın ölçeği. */}
        <div className="grid grid-cols-3 gap-4 sm:gap-8">
          {one.map((s) => (
            <BuyukSayac key={s.label} value={s.value} label={s.label} />
          ))}
        </div>

        {/* Kalanlar tek satırlık şeritte — bilgi, iddia değil. */}
        {serit.length > 0 && (
          <ul
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs"
            style={{ color: 'var(--text-dim)' }}
          >
            {serit.map((s) => (
              <li key={s.label} className="flex items-baseline gap-1.5">
                <span className="numeric font-semibold" style={{ color: 'var(--text)' }}>
                  {s.value.toLocaleString('tr-TR')}
                </span>
                {s.label}
              </li>
            ))}
          </ul>
        )}
      </section>

      <TodayCard />

      {/* ---- Öğrenme yolu ---- */}
      <section className="space-y-3">
        <h2 className="eyebrow">Öğrenme yolu</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PATH.map((s) => (
            <Link
              key={s.to}
              to={yol(s.to)}
              className="card card-interactive card-lit group flex flex-col gap-3 p-5"
            >
              <div className="flex items-center gap-3">
                <span className="icon-chip">
                  <s.icon className="size-5" />
                </span>
                <span
                  className="numeric ms-auto text-2xl font-bold leading-none"
                  style={{ color: 'color-mix(in srgb, var(--text-dim) 45%, transparent)' }}
                >
                  {s.step}
                </span>
              </div>

              <h3 className="flex items-center gap-2 text-base font-semibold">
                {s.title}
                <ArrowLeft className="size-4 rotate-180 opacity-0 transition group-hover:opacity-70" />
              </h3>

              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                <MixedText>{s.body}</MixedText>
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* ---- Kök nasıl çalışır ---- */}
      <section className="card card-lit space-y-4 p-5 sm:p-6">
        <div className="space-y-1">
          <h2 className="eyebrow">Tek kök, dört anlam</h2>
          <p className="text-sm leading-relaxed">
            <span className="he text-lg">כ־ת־ב</span> kökü "yazmak" ile ilgili her şeyi taşır.
            Kalıba göre anlam değişir — ve bu tablo ezberlenmedi, üretildi.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          {KOK_ORNEK.map(([he, tr, mean, note]) => (
            <div key={he} className="card-2 flex items-baseline gap-3 px-4 py-3">
              <span className="he he-vocalized text-xl">{he}</span>
              <span className="text-xs italic" style={{ color: 'var(--accent-text)' }}>
                {tr}
              </span>
              <span className="ms-auto text-sm font-medium">{mean}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {note}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ---- Dürüst durum bilgisi — ne çalıştığını saklamıyoruz ---- */}
      <section className="card-2 space-y-1 p-4">
        <h2
          className="text-xs font-semibold"
          style={{ color: speechReady ? 'var(--accent-text)' : 'var(--warn)' }}
        >
          Seslendirme:{' '}
          {speechStatus().layer === 'device-voice'
            ? 'cihaz sesi'
            : speechStatus().layer === 'online'
              ? 'çevrimiçi'
              : 'şu an kullanılamıyor'}
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {speechStatus().message}{' '}
          <Link to={yol('ses')} className="underline" style={{ color: 'var(--accent-text)' }}>
            Ses sayfasından
          </Link>{' '}
          sınayabilir ve kalıcı çözümün adımlarını görebilirsin.
        </p>
      </section>

      {CATALOG_ISSUES.length > 0 && (
        <section className="card-2 space-y-1 p-4">
          <h2 className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>
            Veri doğrulama uyarısı — {CATALOG_ISSUES.length} satır reddedildi
          </h2>
          <ul className="space-y-0.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
            {CATALOG_ISSUES.slice(0, 5).map((i) => (
              <li key={i.line}>
                <code>{i.line}</code> — {i.reason}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
