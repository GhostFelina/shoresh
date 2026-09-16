import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Download, Loader2, Trash2, Volume2, X } from 'lucide-react';
import {
  diagnose,
  hebrewVoice,
  onSpeechStatusChange,
  speak,
  speechStatus,
  voiceInstallGuide,
  type DiagnosticResult,
  type SpeechStatus,
} from '@/lib/speech';
import {
  clearPack,
  downloadPack,
  estimatedMegabytes,
  packSections,
  packStatus,
  type DownloadProgress,
  type PackStatus,
} from '@/lib/audio-pack';

/** Sınama için kısa, tanıdık örnekler. */
const SAMPLES = [
  { he: 'שָׁלוֹם', plain: 'שלום', translit: 'şalom', tr: 'merhaba' },
  { he: 'תּוֹדָה רַבָּה', plain: 'תודה רבה', translit: 'toda raba', tr: 'çok teşekkürler' },
  { he: 'אֲנִי לוֹמֵד עִבְרִית', plain: 'אני לומד עברית', translit: 'ani lomed ivrit', tr: 'İbranice öğreniyorum' },
  { he: 'מַה נִּשְׁמָע', plain: 'מה נשמע', translit: 'ma nişma', tr: 'naber' },
];

const LAYER_LABEL: Record<SpeechStatus['layer'], string> = {
  'device-voice': 'Cihaz sesi (çevrimdışı çalışır)',
  online: 'Çevrimiçi seslendirme',
  none: 'Ses yok',
};


/**
 * Ses paketi bölümü.
 *
 * "Ses paketi indir" isteğinin gerçek karşılığı bu: uygulamanın
 * seslendirdiği bütün metinler bir kez çekilip tarayıcının kalıcı
 * önbelleğine konuyor. Sonrasında uygulama çevrimdışı konuşuyor ve her
 * klip anında başlıyor.
 */
function AudioPack() {
  const [status, setStatus] = useState<PackStatus | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sections = useMemo(() => packSections(), []);
  const refresh = useCallback(() => {
    void packStatus().then(setStatus);
  }, []);

  useEffect(refresh, [refresh]);

  const start = async () => {
    setBusy(true);
    setProgress({ done: 0, total: status?.total ?? 0, failed: 0 });
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      await downloadPack(setProgress, ctrl.signal);
    } finally {
      abortRef.current = null;
      setBusy(false);
      refresh();
    }
  };

  const stop = () => abortRef.current?.abort();

  const wipe = async () => {
    await clearPack();
    setProgress(null);
    refresh();
  };

  const total = status?.total ?? 0;
  const cached = status?.cached ?? 0;
  const pct = total > 0 ? Math.min(100, Math.round((cached / total) * 100)) : 0;
  const mb = estimatedMegabytes(total);

  return (
    <section className="card space-y-3 p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="mr-auto text-sm font-semibold">Ses paketi — çevrimdışı dinleme</h2>
        <span className="numeric text-xs" style={{ color: 'var(--text-dim)' }}>
          {cached.toLocaleString('tr-TR')} / {total.toLocaleString('tr-TR')} klip · ~{mb} MB
        </span>
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
        Uygulamanın seslendirdiği her şey sonlu bir kümedir: harf adları, harekeler, kelimeler,
        kalıplar, fiiller ve örnek cümleler. Hepsini bir kez indirirsen uygulama internetsiz de
        konuşur ve her klip beklemeden başlar.
      </p>

      {/* İlerleme */}
      <div className="h-1.5 overflow-hidden rounded" style={{ background: 'var(--surface-2)' }}>
        <div
          className="h-full origin-left transition-transform"
          style={{
            background: 'var(--color-brand-400)',
            width: '100%',
            transform: `scaleX(${
              progress && progress.total > 0 ? progress.done / progress.total : pct / 100
            })`,
          }}
        />
      </div>

      {progress && busy && (
        <p className="numeric text-xs" style={{ color: 'var(--text-dim)' }}>
          {progress.done.toLocaleString('tr-TR')} / {progress.total.toLocaleString('tr-TR')}
          {progress.failed > 0 && ` · ${progress.failed} klip alınamadı, sonra yeniden denenebilir`}
        </p>
      )}

      {status && !status.available ? (
        <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
          {status.reason}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {busy ? (
            <button
              type="button"
              onClick={stop}
              className="card-2 flex items-center gap-2 px-4 py-2 text-sm card-interactive"
            >
              <Loader2 className="size-4 animate-spin" />
              Durdur
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void start()}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold card-interactive"
              style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
            >
              <Download className="size-4" />
              {cached > 0 ? 'Eksikleri indir' : `Ses paketini indir (~${mb} MB)`}
            </button>
          )}
          {cached > 0 && !busy && (
            <button
              type="button"
              onClick={() => void wipe()}
              className="card-2 flex items-center gap-2 px-3 py-2 text-xs card-interactive"
            >
              <Trash2 className="size-3.5" />
              Paketi sil
            </button>
          )}
        </div>
      )}

      <details>
        <summary
          className="cursor-pointer text-[11px] select-none"
          style={{ color: 'var(--text-dim)' }}
        >
          Pakette ne var?
        </summary>
        <ul className="space-y-0.5 pt-1.5">
          {sections.map((sec) => (
            <li
              key={sec.id}
              className="flex justify-between text-[11px]"
              style={{ color: 'var(--text-dim)' }}
            >
              <span>{sec.label}</span>
              <span className="tabular-nums">{sec.texts.length.toLocaleString('tr-TR')}</span>
            </li>
          ))}
        </ul>
        <p className="pt-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
          Fiillerin tam çekim tablosu pakete girmiyor: 367 fiil × 24 biçim yaklaşık 8.800 klip
          eder ve paket 80 MB’ı aşardı. Sözlük biçimi, mastar ve şimdiki zamanın dört hâli
          alınıyor; kalan biçimler çevrimiçi çalınmaya devam ediyor.
        </p>
      </details>
    </section>
  );
}

export default function SoundPage() {
  const [status, setStatus] = useState<SpeechStatus>(() => speechStatus());
  const [results, setResults] = useState<DiagnosticResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [playing, setPlaying] = useState<string | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);

  // Ses paketleri geç yüklenebilir, ağ durumu değişebilir — durum canlı tutulur.
  useEffect(() => onSpeechStatusChange(setStatus), []);

  const guide = voiceInstallGuide();
  const voice = hebrewVoice();

  const runDiagnostics = async () => {
    setRunning(true);
    setResults(null);
    const r = await diagnose();
    setResults(r);
    setRunning(false);
  };

  const play = (s: (typeof SAMPLES)[number]) => {
    setLastError(null);
    setPlaying(s.plain);
    void speak(s.plain, {
      slow: true,
      onEnd: () => setPlaying(null),
      onUnavailable: (st) => {
        setPlaying(null);
        setLastError(st.message);
      },
      onBlocked: () => {
        setPlaying(null);
        setLastError(
          'Tarayıcı sesi engelledi. Sayfada bir yere tıkladıktan sonra tekrar dene — ' +
            'bu bir hata değil, tarayıcıların otomatik ses kuralı.',
        );
      },
    });
    window.setTimeout(() => setPlaying((p) => (p === s.plain ? null : p)), 8000);
  };

  const dotColor =
    status.layer === 'device-voice'
      ? 'var(--color-brand-400)'
      : status.layer === 'online'
        ? '#fbbf24'
        : '#f87171';

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">Ses</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          İbranice seslendirme üç katman hâlinde çalışır. Önce cihazında kurulu İbranice ses
          denenir — en iyisi odur, çevrimdışı da çalışır. Yoksa çevrimiçi seslendirmeye düşülür.
          Hiçbiri yoksa uygulama sessiz kalmaz, nedenini burada söyler.
        </p>
      </header>

      {/* Mevcut durum */}
      <section className="card space-y-3 p-5">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full" style={{ background: dotColor }} />
          <h2 className="text-sm font-semibold">Şu anki katman: {LAYER_LABEL[status.layer]}</h2>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {status.message}
        </p>
        {voice && (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Kullanılan ses: <span style={{ color: 'var(--text)' }}>{voice.name}</span> ({voice.lang})
          </p>
        )}
      </section>

      {/* Sınama */}
      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Dene</h2>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Bir örneğe dokun. Ses çıkmıyorsa aşağıdaki tanılama nerede takıldığını söyler.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2">
          {SAMPLES.map((s) => (
            <button
              key={s.plain}
              type="button"
              onClick={() => play(s)}
              className="card-2 flex items-center gap-3 px-3 py-2.5 text-right card-interactive"
              style={{
                borderColor: playing === s.plain ? 'var(--color-brand-400)' : 'var(--border)',
              }}
            >
              <span className="he he-vocalized flex-1 text-xl">{s.he}</span>
              <span className="flex-1 text-left">
                <span className="block text-xs italic" style={{ color: 'var(--accent-text)' }}>
                  {s.translit}
                </span>
                <span className="block text-xs">{s.tr}</span>
              </span>
              {playing === s.plain ? (
                <Loader2 className="size-4 shrink-0 animate-spin" />
              ) : (
                <Volume2 className="size-4 shrink-0 opacity-60" />
              )}
            </button>
          ))}
        </div>
        {lastError && (
          <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
            {lastError}
          </p>
        )}
      </section>

      <AudioPack />

      {/* Tanılama */}
      <section className="card space-y-3 p-5">
        <div className="flex items-center gap-3">
          <h2 className="mr-auto text-sm font-semibold">Tanılama</h2>
          <button
            type="button"
            onClick={() => void runDiagnostics()}
            disabled={running}
            className="card-2 flex items-center gap-2 px-3 py-1.5 text-xs card-interactive disabled:opacity-50"
          >
            {running && <Loader2 className="size-3.5 animate-spin" />}
            {running ? 'Sınanıyor…' : 'Sınamayı çalıştır'}
          </button>
        </div>

        {results && (
          <ul className="space-y-1">
            {results.map((r) => (
              <li key={r.step} className="card-2 flex items-start gap-3 px-3 py-2">
                {r.ok ? (
                  <Check className="mt-0.5 size-4 shrink-0" style={{ color: 'var(--color-brand-400)' }} />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0" style={{ color: '#f87171' }} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium">{r.step}</span>
                  <span className="block text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    {r.detail}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}

        {!results && !running && (
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Her katmanı tek tek sınar ve nerede takıldığını gösterir.
          </p>
        )}
      </section>

      {/* Kalıcı çözüm */}
      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Kalıcı çözüm — {guide.platform}</h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          İşletim sistemine İbranice ses paketi eklersen seslendirme internetsiz de çalışır,
          anında başlar ve telaffuz belirgin biçimde daha iyi olur. Bir kereliktir.
        </p>
        <ol className="space-y-1.5">
          {guide.steps.map((step, i) => (
            <li key={step} className="flex items-start gap-2.5 text-sm">
              <span
                className="grid size-5 shrink-0 place-items-center rounded text-[10px] font-bold"
                style={{ background: 'var(--surface-2)', color: 'var(--accent-text)' }}
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        {status.hasDeviceVoice && (
          <p className="text-xs" style={{ color: 'var(--accent-text)' }}>
            Cihazında zaten İbranice ses var — bu adımlara gerek yok.
          </p>
        )}
      </section>
    </div>
  );
}
