/**
 * Karşılama sayfası — uygulamanın kök adresi.
 *
 * NEDEN VAR: Kök adres daha önce doğrudan son kullanılan dile
 * yönlendiriyordu. Tek dil varken bu doğruydu; dört dil görünür olunca
 * yanlış oldu — kullanıcı uygulamanın İbranice uygulaması olduğunu
 * sanıyordu. Artık uygulama önce KENDİNİ tanıtıyor, sonra kullanıcı
 * hangi dili öğreneceğini seçiyor.
 *
 * NEDEN KABUĞUN DIŞINDA: Kenar çubuğu bir dilin İÇİNDEKİ gezinmedir
 * (alfabe, fiiller, oyunlar). Henüz dil seçilmemişken o menüyü
 * göstermek, seçim yapılmış gibi davranmak olurdu.
 *
 * HAZIR DİLLER KAYIT DEFTERİNDEN, YAKINDA OLANLAR YOL HARİTASINDAN
 * geliyor. Sayfa hangi dilin var olduğuna kendi karar vermiyor: Korece
 * kurulduğu gün kartı kendiliğinden "hazır" tarafına geçecek ve bu
 * dosyada tek satır değişmeyecek.
 */
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  BrainCircuit,
  GraduationCap,
  Layers,
  Sparkles,
  Volume2,
  WifiOff,
} from 'lucide-react';
import { BRAND } from '@/core/brand';
import { ThemeToggle, useAppearance } from './Appearance';
import { languages } from '@/core/language';
import { PLANNED_LANGUAGES } from '@/core/roadmap';
import { FLAG_BY_LANGUAGE } from './Flags';
import { Logo } from './Logo';
import { APP_VERSION, BUILD_TIME, formatBuildTime } from '@/lib/version';

/**
 * Toz katmanı.
 *
 * Noktaların konumu ve hızı SABİT bir listeden geliyor, rastgele
 * üretilmiyor: rastgele olsaydı her çizimde yerleri değişir, React
 * yeniden çizdiğinde parçacıklar zıplardı.
 */
const TOZ = [
  { sol: '6%', sure: 15, gecikme: 0, boy: 3 },
  { sol: '17%', sure: 21, gecikme: 3, boy: 2 },
  { sol: '28%', sure: 17, gecikme: 6, boy: 4 },
  { sol: '39%', sure: 24, gecikme: 1, boy: 2 },
  { sol: '52%', sure: 19, gecikme: 8, boy: 3 },
  { sol: '63%', sure: 26, gecikme: 4, boy: 2 },
  { sol: '74%', sure: 16, gecikme: 11, boy: 3 },
  { sol: '86%', sure: 22, gecikme: 7, boy: 2 },
  { sol: '94%', sure: 18, gecikme: 13, boy: 3 },
];

function Toz() {
  return (
    <div className="dust" aria-hidden="true">
      {TOZ.map((t) => (
        <span
          key={t.sol}
          style={{
            left: t.sol,
            width: t.boy,
            height: t.boy,
            animationDuration: `${t.sure}s`,
            animationDelay: `${t.gecikme}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Uygulamanın ne yaptığını anlatan dört madde. */
const OZELLIKLER = [
  {
    icon: BrainCircuit,
    title: 'Çekimler üretilir, ezberletilmez',
    body: 'Kural motoru kökü ve kalıbı alıp bütün tabloyu kendisi çıkarır. Üretemediği bir birleşimi uydurmaz — reddeder ve bunu söyler.',
  },
  {
    icon: GraduationCap,
    title: 'Öğretmenli sınıf',
    body: 'Seviye tespit sınavı, günün programı ve gerekçesi, ölçülebilir ödev ve not. "Bugün ne çalışsam" sorusu ortadan kalkar.',
  },
  {
    icon: Layers,
    title: 'Aralıklı tekrar',
    body: 'Her cevap kaydedilir; bir biçimi ne zaman unutacağın hesaplanır ve tam o gün karşına çıkar.',
  },
  {
    icon: Volume2,
    title: 'Her biçim seslendirilir',
    body: 'Tabloda gördüğün her çekimi tıklayıp duyabilirsin. Ses paketi indirilince çevrimdışı da çalışır.',
  },
];

function DilKarti({
  id,
  nativeName,
  englishName,
  name,
  blurb,
  to,
  yakinda,
  oneCikan,
  ozet,
}: {
  id: string;
  nativeName: string;
  englishName: string;
  name: string;
  blurb: string;
  to?: string;
  yakinda?: boolean;
  /** Canlı olan dil — dördü aynı görünürse hangisinin açıldığı belirsiz kalır. */
  oneCikan?: boolean;
  /**
   * O DİLE ait sayılar. Karşılama ekranının üstünde durduğu sürece
   * bütün uygulamanın sayısı sanılıyordu; kartta durunca hangi dile
   * ait olduğu kendiliğinden belli oluyor.
   */
  ozet?: string;
}) {
  const Bayrak = FLAG_BY_LANGUAGE[id];

  const icerik = (
    <>
      <div className="flex items-center gap-3">
        {Bayrak ? <Bayrak className="h-5 w-7 shrink-0 overflow-hidden rounded-[4px]" /> : null}
        <span
          className="text-2xl font-semibold leading-none"
          style={{ color: yakinda ? 'var(--text-dim)' : 'var(--accent-text)' }}
        >
          {nativeName}
        </span>
        {yakinda ? (
          <span
            className="ms-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: 'var(--text-dim)',
              background: 'color-mix(in srgb, var(--text-dim) 14%, transparent)',
            }}
          >
            Yakında
          </span>
        ) : (
          <span
            className="ms-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
            style={{
              color: 'var(--ok)',
              background: 'color-mix(in srgb, var(--ok) 14%, transparent)',
            }}
          >
            Hazır
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <h3 className="text-base font-semibold">{name}</h3>
        <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
          {englishName}
        </p>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
        {blurb}
      </p>

      {ozet && (
        <p className="numeric text-[11px]" style={{ color: 'var(--accent-text)' }}>
          {ozet}
        </p>
      )}

      {!yakinda && (
        <span
          className="mt-auto flex items-center gap-1.5 text-xs font-semibold"
          style={{ color: 'var(--accent-text)' }}
        >
          Başla
          <ArrowLeft className="size-3.5 rotate-180" />
        </span>
      )}
    </>
  );

  if (yakinda || !to) {
    return (
      <div
        className="card card-lit flex h-full flex-col gap-3 p-5 opacity-60"
        aria-disabled="true"
      >
        {icerik}
      </div>
    );
  }

  return (
    <Link
      to={to}
      className={`card card-lit card-interactive flex h-full flex-col gap-3 p-5 ${
        oneCikan ? 'card-featured' : ''
      }`}
    >
      {icerik}
    </Link>
  );
}

/**
 * Bir dilin ilk iki sayacını tek satıra indirir.
 *
 * Modülün kendi `stats()` çıktısından geliyor; elle yazılsaydı içerik
 * büyüdükçe kart yalan söylerdi.
 */
function ozetle(d: { stats: () => Array<{ value: number; label: string }> }): string {
  return d
    .stats()
    .slice(0, 2)
    .map((s) => `${s.value.toLocaleString('tr-TR')} ${s.label}`)
    .join(' · ');
}

export default function LandingPage() {
  const hazir = languages();
  const ilkDil = hazir[0];
  const { theme, changeTheme } = useAppearance();

  /* Kaç dil var — kurulu olanlar + yol haritası. Elle sayılmıyor. */
  const toplamDil = hazir.length + PLANNED_LANGUAGES.length;

  return (
    <div className="min-h-dvh">
      {/*
        İnce üst bant. Kabuk burada YOK ama iki şey gerekli: markanın
        kendisi ve tema düğmesi — kullanıcı açık temadaysa karşılama
        ekranı koyu açılmamalı.
      */}
      <header className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-5">
        <Logo className="size-8" />
        <span className="text-sm font-bold tracking-tight">{BRAND.short}</span>
        <span
          className="rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums"
          style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
        >
          v{APP_VERSION}
        </span>
        <span className="ms-auto">
          <ThemeToggle theme={theme} onChange={changeTheme} />
        </span>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 pb-10 sm:pb-16">
        {/* ---------- Giriş ---------- */}
        <section className="hero relative p-6 sm:p-14">
          {/* Canlı zemin — yalnızca burada; uygulamanın içinde hareket dikkat dağıtır. */}
          <div className="aurora" aria-hidden="true" />
          <Toz />

          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-7 text-center">
            <span className="eyebrow reveal">Çok dilli öğrenme motoru</span>

            <div className="space-y-4 reveal" style={{ animationDelay: '90ms' }}>
              <h1 className="title-gradient text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
                {BRAND.name}
              </h1>
              <p
                className="text-lg font-medium sm:text-2xl"
                style={{ color: 'var(--accent-text)' }}
              >
                {BRAND.motto}
              </p>
            </div>

            <p
              className="reveal max-w-2xl text-sm leading-relaxed sm:text-base"
              style={{ animationDelay: '180ms' }}
            >
              Çoğu uygulama sana çekim tablosu ezberletir. Bu uygulama tabloyu{' '}
              <strong>üretir</strong>: dilin kendi kuralını öğretir, gerisini motor hesaplar.
              Öğrendiğin şey bir liste değil, o dilin nasıl çalıştığı.
            </p>

            {/* Dört dilin kendi yazısı — sayfanın ne olduğunu tek bakışta söylüyor. */}
            {/*
              Dört dilin kendi yazısı. Harfler sırayla parlıyor
              (`animationDelay`) — hepsi aynı anda parlasaydı yanıp
              sönen bir tabela olurdu.
            */}
            <div
              className="script-band reveal flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
              style={{ animationDelay: '240ms' }}
              aria-hidden="true"
            >
              <span className="he he-serif" style={{ animationDelay: '0s' }}>
                א
              </span>
              <span style={{ animationDelay: '1.5s' }}>한</span>
              <span style={{ animationDelay: '3s' }}>ع</span>
              <span style={{ animationDelay: '4.5s' }}>中</span>
            </div>

            {ilkDil && (
              <div
                className="reveal flex flex-wrap items-center justify-center gap-2"
                style={{ animationDelay: '320ms' }}
              >
                <Link to={`/${ilkDil.id}`} className="btn btn-primary text-base">
                  {ilkDil.name.tr} ile başla
                  <ArrowLeft className="size-4 rotate-180" />
                </Link>
                <a href="#nasil" className="btn btn-secondary text-base">
                  Nasıl çalışıyor?
                </a>
              </div>
            )}

            {/*
              SAYILAR DİLE BAĞLI DEĞİL. Burada bir zamanlar İbranicenin
              fiil ve kelime sayısı duruyordu; karşılama ekranı bütün
              dillerin ortak tanıtımı olduğu için yanlıştı — Korece
              eklendiğinde sayfa hâlâ İbranicenin sayılarını söylüyor
              olacaktı. Dile ait sayılar artık o dilin KARTINDA.
            */}
            <hr className="hairline w-full" />
            <div className="grid w-full grid-cols-3 gap-4 sm:gap-8">
              <div>
                <div className="kpi text-2xl leading-none sm:text-4xl">{toplamDil}</div>
                <div className="mt-1.5 text-[11px] sm:text-xs" style={{ color: 'var(--text-dim)' }}>
                  dil · {hazir.length} hazır, {PLANNED_LANGUAGES.length} yolda
                </div>
              </div>
              <div>
                <div className="kpi text-2xl leading-none sm:text-4xl">A1–B2</div>
                <div className="mt-1.5 text-[11px] sm:text-xs" style={{ color: 'var(--text-dim)' }}>
                  sıfırdan ileri düzeye
                </div>
              </div>
              <div>
                <div className="kpi text-2xl leading-none sm:text-4xl">0 ₺</div>
                <div className="mt-1.5 text-[11px] sm:text-xs" style={{ color: 'var(--text-dim)' }}>
                  ücret, abonelik, reklam yok
                </div>
              </div>
            </div>

            <div
              className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs"
              style={{ color: 'var(--text-dim)' }}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5" style={{ color: 'var(--accent-text)' }} />
                Ücretsiz ve reklamsız
              </span>
              <span className="flex items-center gap-1.5">
                <WifiOff className="size-3.5" style={{ color: 'var(--accent-text)' }} />
                Çevrimdışı çalışır
              </span>
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-3.5" style={{ color: 'var(--accent-text)' }} />
                A1'den B2'ye
              </span>
            </div>
          </div>
        </section>

        {/* ---------- Dil seçimi ---------- */}
        <section className="space-y-4">
          <div className="space-y-1 text-center">
            <h2 className="eyebrow">Hangi dili öğreneceksin?</h2>
            <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
              Seçtiğin dil kendi çalışma alanını açar. Sonradan değiştirebilirsin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {hazir.map((d) => (
              <DilKarti
                key={d.id}
                id={d.id}
                nativeName={d.nativeName}
                englishName={d.englishName}
                name={d.name.tr}
                blurb={d.blurb.tr}
                to={`/${d.id}`}
                oneCikan
                ozet={ozetle(d)}
              />
            ))}
            {PLANNED_LANGUAGES.map((d) => (
              <DilKarti
                key={d.id}
                id={d.id}
                nativeName={d.nativeName}
                englishName={d.englishName}
                name={d.name}
                blurb={d.blurb}
                yakinda
              />
            ))}
          </div>
        </section>

        {/* ---------- Ne yapıyor ---------- */}
        <section id="nasil" className="scroll-mt-8 space-y-4">
          <h2 className="eyebrow text-center">Nasıl çalışıyor</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {OZELLIKLER.map((o) => (
              <article key={o.title} className="card card-lit flex gap-4 p-5">
                <span className="icon-chip">
                  <o.icon className="size-5" />
                </span>
                <div className="min-w-0 space-y-1">
                  <h3 className="text-sm font-semibold">{o.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                    {o.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Sonraki diller ---------- */}
        <section className="card card-lit space-y-4 p-5 sm:p-6">
          <div className="space-y-1">
            <h2 className="eyebrow">Sırada ne var</h2>
            <p className="text-sm leading-relaxed">
              Her dilin kendi üretici çekirdeği var. "Aynı uygulama başka kelimelerle" olmayacak —
              her dil kendi kuralıyla kurulacak.
            </p>
          </div>

          <ul className="grid gap-3 sm:grid-cols-3">
            {PLANNED_LANGUAGES.map((d) => (
              <li key={d.id} className="card-2 space-y-1 p-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{d.name}</span>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    {d.nativeName}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                  {d.engine}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- Alt bilgi ---------- */}
        <footer
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs"
          style={{ color: 'var(--text-dim)' }}
        >
          <span>
            {BRAND.name} v{APP_VERSION}
          </span>
          <span aria-hidden="true">·</span>
          <span>{BRAND.promise}</span>
          <span aria-hidden="true">·</span>
          <span>Son güncelleme: {formatBuildTime(BUILD_TIME)}</span>
        </footer>
      </main>
    </div>
  );
}
