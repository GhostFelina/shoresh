import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Languages, Type } from 'lucide-react';
import { CATALOG_STATS, CATALOG_ISSUES } from '@/data/catalog';
import { WRITTEN_SENTENCE_COUNT } from '@/data/sentences';
import { PHRASES } from '@/data/phrases';
import { LEXICON_STATS } from '@/data/lexicon';
import { LETTERS_ALPHABETIC } from '@/data/alefbet';
import { canSpeakHebrew, speechStatus } from '@/lib/speech';

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card-2 px-4 py-3">
      <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
        {typeof value === 'number' ? value.toLocaleString('tr-TR') : value}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </div>
    </div>
  );
}

const PATH = [
  {
    to: '/alefbet',
    icon: Type,
    step: '1',
    title: 'Harfleri tanı',
    body: '22 harf, 5 sofit biçim. Benzeyen harfleri ayırt etmeyi öğren: ב/כ, ד/ר, ה/ח.',
  },
  {
    to: '/okuma',
    icon: BookOpen,
    step: '2',
    title: 'Harekeyle oku',
    body: 'Ünlüler harfin altındadır. Dokuz işaretle her kelimeyi okuyabilir hâle gel.',
  },
  {
    to: '/verb',
    icon: Languages,
    step: '3',
    title: 'Kökten çek',
    body: 'Üç harfli kök yedi kalıba oturur. Fiil ezberlemezsin, kalıbı öğrenirsin.',
  },
];

export default function HomePage() {
  const speechReady = canSpeakHebrew();

  return (
    <div className="space-y-6">
      {/* Giriş */}
      <section className="card overflow-hidden">
        <div className="space-y-4 p-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="he he-serif text-5xl leading-none" style={{ color: 'var(--color-brand-400)' }}>
              שֹׁרֶשׁ
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Kökten İbranice</h1>
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Sıfırdan Modern İvrit — A1'den B1'e
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-relaxed">
            İbranicede her fiil üç harfli bir <strong>kökten</strong> (שורש) doğar. O kök yedi
            kalıptan birine oturur ve bütün çekim tablosu kalıptan çıkar. Bu uygulama sana tek tek
            fiil ezberletmez — <strong>kalıbı</strong> öğretir, gerisini motor üretir.
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat value={CATALOG_STATS.total} label="fiil (kök + binyan)" />
            <Stat value={LEXICON_STATS.total} label="kelime" />
            <Stat value={PHRASES.length} label="kalıp ifade" />
            <Stat value={CATALOG_STATS.totalForms} label="çekim biçimi" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat value={LETTERS_ALPHABETIC.length} label="alfabe harfi" />
            <Stat value={WRITTEN_SENTENCE_COUNT} label="örnek cümle" />
            <Stat value={CATALOG_STATS.irregular} label="düzensiz fiil" />
            <Stat value={11} label="alıştırma oyunu" />
          </div>
        </div>
      </section>

      {/* Öğrenme yolu */}
      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
          Öğrenme yolu
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          {PATH.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="card group space-y-2 p-4 transition hover:brightness-125"
            >
              <div className="flex items-center gap-2">
                <span
                  className="grid size-7 place-items-center rounded-lg text-xs font-bold"
                  style={{ background: 'var(--surface-2)', color: 'var(--color-brand-300)' }}
                >
                  {s.step}
                </span>
                <s.icon className="size-4" style={{ color: 'var(--color-accent-400)' }} />
                <h3 className="font-semibold">{s.title}</h3>
                <ArrowLeft className="mr-auto size-4 rotate-180 opacity-0 transition group-hover:opacity-60" />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
                {s.body}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Neden kök */}
      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Kök nasıl çalışır</h2>
        <p className="text-sm leading-relaxed">
          <span className="he text-lg">כ־ת־ב</span> kökü "yazmak" ile ilgili her şeyi taşır.
          Kalıba göre anlam değişir:
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            ['כָּתַב', 'katav', 'yazdı', "Pa'al — temel"],
            ['נִכְתַּב', 'nihtav', 'yazıldı', "Nif'al — edilgen"],
            ['הִכְתִּיב', 'hihtiv', 'yazdırdı', "Hif'il — ettirgen"],
            ['הִתְכַּתֵּב', 'hitkatev', 'yazıştı', "Hitpa'el — karşılıklı"],
          ].map(([he, tr, mean, note]) => (
            <div key={he} className="card-2 flex items-baseline gap-3 px-3 py-2">
              <span className="he he-vocalized text-xl">{he}</span>
              <span className="text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
                {tr}
              </span>
              <span className="mr-auto text-sm">{mean}</span>
              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
                {note}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Dürüst durum bilgisi — ne çalıştığını saklamıyoruz */}
      <section className="card-2 space-y-1 p-4">
        <h2
          className="text-xs font-semibold"
          style={{ color: speechReady ? 'var(--color-brand-300)' : '#fbbf24' }}
        >
          Seslendirme: {speechStatus().layer === 'device-voice'
            ? 'cihaz sesi'
            : speechStatus().layer === 'online'
              ? 'çevrimiçi'
              : 'şu an kullanılamıyor'}
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {speechStatus().message}{' '}
          <Link to="/ses" className="underline" style={{ color: 'var(--color-brand-300)' }}>
            Ses sayfasından
          </Link>{' '}
          sınayabilir ve kalıcı çözümün adımlarını görebilirsin.
        </p>
      </section>

      {CATALOG_ISSUES.length > 0 && (
        <section className="card-2 space-y-1 p-4">
          <h2 className="text-xs font-semibold" style={{ color: '#f87171' }}>
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
