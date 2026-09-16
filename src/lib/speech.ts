/**
 * İbranice seslendirme.
 *
 * SORUN: Tarayıcının kendi konuşma sentezleyicisi (Web Speech API) sıfır
 * bağımlılık ve çevrimdışı çalışma sunuyor, AMA İbranice ses paketi her
 * cihazda kurulu değil. Windows'ta neredeyse hiç yok. Tek katmanla
 * yetinilirse kullanıcıların yarısı düğmeye basıp hiçbir şey duymuyor.
 *
 * ÜÇ KATMAN, sırayla denenir:
 *   1. Cihazda kurulu İbranice ses (he-IL) — en iyisi, çevrimdışı çalışır
 *   2. Çevrimiçi seslendirme akışı — ses paketi olmayan cihazlarda devreye girer
 *   3. Hiçbiri yoksa sessiz kalmaz, durumu ve çözümünü bildirir
 *
 * ── Katman 2'nin çalışması için bilinmesi gereken üç şey ──
 *
 * 1. `crossOrigin` AYARLANMAZ. Seslendirme uç noktası
 *    `Access-Control-Allow-Origin` göndermiyor; `crossOrigin` ayarlamak
 *    tarayıcıyı CORS denetimine zorlar, denetim başarısız olur ve ses HİÇ
 *    yüklenmez. Ayarlanmazsa kaynak sıradan bir medya olarak çalınır —
 *    uç nokta `Cross-Origin-Resource-Policy: cross-origin` ile buna
 *    açıkça izin veriyor. Bu tek satır, sesin çalışıp çalışmamasını
 *    belirliyor.
 *
 * 2. KALICI KİLİT YOK. Tek bir ağ hatası katmanı sonsuza kadar kapatmamalı;
 *    art arda birkaç hatadan sonra kısa bir süre dinlendirilir, sonra
 *    yeniden denenir.
 *
 * 3. TARAYICI OTOMATİK OYNATMAYI ENGELLER. Kullanıcı sayfayla henüz
 *    etkileşmediyse ses çalmaz. Bu bir hata değil, tarayıcı kuralıdır;
 *    `hasUserGesture()` ile ayırt edilir ki arayüz "bozuk" demek yerine
 *    "dinlemek için dokun" desin.
 */

export type SpeechLayer = 'device-voice' | 'online' | 'none';

export interface SpeechStatus {
  layer: SpeechLayer;
  hasDeviceVoice: boolean;
  online: boolean;
  /** Kullanıcı sayfayla etkileşti mi? Otomatik oynatma buna bağlı. */
  gestureReady: boolean;
  message: string;
}

/* ------------------------------------------------------------------ *
 * Cihaz sesleri
 * ------------------------------------------------------------------ */

let cachedVoices: SpeechSynthesisVoice[] = [];

const hasSynth = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

function voices(): SpeechSynthesisVoice[] {
  if (!hasSynth()) return [];
  if (cachedVoices.length === 0) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

if (hasSynth()) {
  // Sesler bazı tarayıcılarda eşzamansız yüklenir.
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
    notify();
  });
}

/** Cihazda kurulu İbranice ses varsa döner. */
export function hebrewVoice(): SpeechSynthesisVoice | null {
  const all = voices();
  return (
    all.find((v) => v.lang === 'he-IL') ??
    all.find((v) => v.lang.startsWith('he')) ??
    // İbranicenin ISO kodu vaktiyle 'iw' idi; hâlâ böyle etiketleyen
    // sistemler var.
    all.find((v) => v.lang.startsWith('iw')) ??
    null
  );
}

/* ------------------------------------------------------------------ *
 * Kullanıcı etkileşimi — otomatik oynatma kuralı
 * ------------------------------------------------------------------ */

let gestureSeen = false;

if (typeof window !== 'undefined') {
  const mark = () => {
    if (gestureSeen) return;
    gestureSeen = true;
    notify();
  };
  for (const ev of ['pointerdown', 'keydown', 'touchstart'] as const) {
    window.addEventListener(ev, mark, { once: true, passive: true });
  }
}

export const hasUserGesture = (): boolean => gestureSeen;

/* ------------------------------------------------------------------ *
 * Çevrimiçi katman
 * ------------------------------------------------------------------ */

const isOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine !== false;

/**
 * Art arda hata sayacı. Kalıcı kilit yerine kısa dinlenme:
 * üç hatadan sonra katman 60 saniye devre dışı kalır, sonra yeniden denenir.
 * Geçici bir ağ kesintisi seslendirmeyi kalıcı olarak öldürmemeli.
 */
let onlineFailures = 0;
let onlineRestingUntil = 0;
const FAILURE_LIMIT = 3;
const REST_MS = 60_000;

const onlineUsable = (): boolean =>
  isOnline() && Date.now() >= onlineRestingUntil;

function noteOnlineFailure(): void {
  onlineFailures++;
  if (onlineFailures >= FAILURE_LIMIT) {
    onlineRestingUntil = Date.now() + REST_MS;
    onlineFailures = 0;
    notify();
  }
}

function noteOnlineSuccess(): void {
  onlineFailures = 0;
  onlineRestingUntil = 0;
}

/**
 * Seslendirme adresi.
 * `tl=iw` — servis İbranice için hâlâ eski ISO kodunu bekliyor.
 * Metin uzunluğu sınırlı; uygulamada seslendirilen en uzun şey kısa bir
 * cümle olduğu için bu sınıra takılmıyoruz.
 */
function ttsUrl(text: string, slow: boolean): string {
  const q = encodeURIComponent(text.slice(0, 180));
  return (
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&client=tw-ob&tl=iw&ttsspeed=${slow ? '0.4' : '1'}&q=${q}`
  );
}

/* ------------------------------------------------------------------ *
 * Durum bildirimi — arayüz buna abone olur
 * ------------------------------------------------------------------ */

type Listener = (s: SpeechStatus) => void;
const listeners = new Set<Listener>();

function notify(): void {
  const s = speechStatus();
  for (const l of listeners) l(s);
}

export function onSpeechStatusChange(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
}

/** Şu an hangi katmanla ses çıkabilir? */
export function speechStatus(): SpeechStatus {
  const hasDeviceVoice = hebrewVoice() !== null;
  const online = isOnline();
  const gestureReady = gestureSeen;

  if (hasDeviceVoice) {
    return {
      layer: 'device-voice',
      hasDeviceVoice,
      online,
      gestureReady,
      message: 'Cihazındaki İbranice ses kullanılıyor — çevrimdışı da çalışır.',
    };
  }
  if (onlineUsable()) {
    return {
      layer: 'online',
      hasDeviceVoice,
      online,
      gestureReady,
      message:
        'Cihazında İbranice ses paketi yok; çevrimiçi seslendirme kullanılıyor. ' +
        'Çevrimdışı da dinlemek istersen işletim sistemine İbranice ses paketi ekleyebilirsin.',
    };
  }
  return {
    layer: 'none',
    hasDeviceVoice,
    online,
    gestureReady,
    message: online
      ? 'Çevrimiçi seslendirmeye ulaşılamadı. Birazdan yeniden denenecek; ' +
        'kalıcı çözüm için işletim sistemine İbranice ses paketi eklenebilir.'
      : 'Çevrimdışısın ve cihazında İbranice ses paketi yok, bu yüzden seslendirme çalışmıyor.',
  };
}

/* ------------------------------------------------------------------ *
 * Ses önbelleği
 * ------------------------------------------------------------------ */

/**
 * Aynı kelime oyunlarda ve tablolarda defalarca çalınıyor. İndirilen ses
 * bellekte tutulursa ikinci çalma anında başlar ve ağ trafiği oluşmaz.
 * Sınır var: sınırsız büyürse uzun bir oturumda bellek şişer.
 */
const audioCache = new Map<string, string>();
const CACHE_LIMIT = 200;

function cacheGet(key: string): string | undefined {
  return audioCache.get(key);
}

function cacheSet(key: string, url: string): void {
  if (audioCache.size >= CACHE_LIMIT) {
    const oldest = audioCache.keys().next().value;
    if (oldest) audioCache.delete(oldest);
  }
  audioCache.set(key, url);
}

/* ------------------------------------------------------------------ *
 * Oynatma
 * ------------------------------------------------------------------ */

export interface SpeakOptions {
  /** Yavaş okuma — yeni başlayan için tercih edilir. */
  slow?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  /** Hiçbir katman çalışmadıysa. */
  onUnavailable?: (status: SpeechStatus) => void;
  /**
   * Tarayıcı otomatik oynatmayı engellediyse. Bu bir HATA DEĞİLDİR;
   * arayüz "bozuk" demek yerine "dinlemek için dokun" demeli.
   */
  onBlocked?: () => void;
}

let currentAudio: HTMLAudioElement | null = null;

function stopAudioElement(): void {
  if (!currentAudio) return;
  currentAudio.pause();
  currentAudio.removeAttribute('src');
  currentAudio.load();
  currentAudio = null;
}

/** Katman 1 — cihazın kendi sesi. */
function speakViaDevice(text: string, opts: SpeakOptions): boolean {
  const voice = hebrewVoice();
  if (!voice) return false;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = opts.slow ? 0.6 : 0.85;
  if (opts.onStart) u.addEventListener('start', opts.onStart);
  if (opts.onEnd) u.addEventListener('end', opts.onEnd);
  window.speechSynthesis.speak(u);
  return true;
}

type OnlineResult = 'ok' | 'failed' | 'blocked';

/** Katman 2 — çevrimiçi seslendirme. */
function speakOnline(text: string, opts: SpeakOptions): Promise<OnlineResult> {
  return new Promise((resolve) => {
    const key = `${opts.slow ? 's' : 'n'}|${text}`;
    const src = cacheGet(key) ?? ttsUrl(text, Boolean(opts.slow));

    const audio = new Audio();
    /*
     * crossOrigin AYARLANMIYOR — açıklaması dosyanın başında.
     * Ayarlanırsa CORS denetimi devreye girer ve ses hiç yüklenmez.
     */
    audio.preload = 'auto';
    audio.src = src;
    currentAudio = audio;

    let settled = false;
    const finish = (r: OnlineResult) => {
      if (settled) return;
      settled = true;
      if (r === 'ok') {
        noteOnlineSuccess();
        cacheSet(key, src);
      } else if (r === 'failed') {
        noteOnlineFailure();
      }
      resolve(r);
    };

    audio.addEventListener('playing', () => opts.onStart?.());
    audio.addEventListener('ended', () => {
      opts.onEnd?.();
      finish('ok');
    });
    audio.addEventListener('error', () => finish('failed'));

    // Ses hiç başlamazsa sonsuza kadar beklemeyelim.
    const timer = window.setTimeout(() => {
      if (!settled && audio.paused && audio.currentTime === 0) finish('failed');
    }, 6000);
    audio.addEventListener('playing', () => window.clearTimeout(timer));

    void audio.play().then(
      () => {
        /* 'playing' olayı gerisini halleder */
      },
      (err: unknown) => {
        /*
         * NotAllowedError = tarayıcı otomatik oynatmayı engelledi.
         * Bu bir ağ/servis hatası DEĞİL, bu yüzden hata sayacına yazılmaz;
         * yoksa kullanıcı hiç tıklamadığı için katman gereksiz yere
         * dinlenmeye alınırdı.
         */
        const name = (err as { name?: string })?.name;
        finish(name === 'NotAllowedError' ? 'blocked' : 'failed');
      },
    );
  });
}

/** Harekeleri siler — sentezleyiciye ham harfler gider. */
const stripMarks = (text: string): string => text.replace(/[֑-ׇ]/g, '');

/**
 * İbranice metni seslendirir.
 *
 * Metin HAREKESİZ gönderilir: harekeler sentezleyiciyi yanıltır ve
 * İbranice sesler harekesiz yazımı zaten doğru okur.
 */
export async function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (typeof window === 'undefined') return;

  stopSpeaking();
  const clean = stripMarks(text).trim();
  if (!clean) return;

  if (speakViaDevice(clean, opts)) return;

  if (onlineUsable()) {
    const r = await speakOnline(clean, opts);
    if (r === 'ok') return;
    if (r === 'blocked') {
      opts.onBlocked?.();
      return;
    }
  }

  opts.onUnavailable?.(speechStatus());
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  if (hasSynth()) window.speechSynthesis.cancel();
  stopAudioElement();
}

/** Seslendirme hiç mümkün mü? Arayüz düğmeyi buna göre gösterir. */
export const canSpeakHebrew = (): boolean => speechStatus().layer !== 'none';

/* ------------------------------------------------------------------ *
 * Tanılama — "ses çalışmıyor" bir daha muamma olmasın
 * ------------------------------------------------------------------ */

export interface DiagnosticResult {
  step: string;
  ok: boolean;
  detail: string;
}

/**
 * Her katmanı tek tek sınar ve nerede takıldığını söyler.
 * Kullanıcıya "bozuk" demek yerine hangi adımın düştüğünü göstermek,
 * hem sorunu çözülebilir kılar hem de bizi tahminden kurtarır.
 */
export async function diagnose(): Promise<DiagnosticResult[]> {
  const out: DiagnosticResult[] = [];

  out.push({
    step: 'Tarayıcı konuşma desteği',
    ok: hasSynth(),
    detail: hasSynth()
      ? 'Web Speech API mevcut.'
      : 'Tarayıcı konuşma sentezini desteklemiyor.',
  });

  const all = voices();
  const hv = hebrewVoice();
  out.push({
    step: 'Cihazda İbranice ses',
    ok: hv !== null,
    detail: hv
      ? `Bulundu: ${hv.name} (${hv.lang})`
      : `İbranice ses yok. Cihazda ${all.length} ses kurulu, hiçbiri İbranice değil.`,
  });

  out.push({
    step: 'Ağ bağlantısı',
    ok: isOnline(),
    detail: isOnline() ? 'Çevrimiçi.' : 'Çevrimdışı — yalnızca cihaz sesi çalışabilir.',
  });

  out.push({
    step: 'Sayfayla etkileşim',
    ok: gestureSeen,
    detail: gestureSeen
      ? 'Etkileşim algılandı, ses çalabilir.'
      : 'Henüz tıklama algılanmadı. Tarayıcılar etkileşim öncesi ses çalmayı engeller.',
  });

  if (isOnline()) {
    const reachable = await new Promise<boolean>((resolve) => {
      const probe = new Audio();
      probe.preload = 'auto';
      probe.src = ttsUrl('שלום', false);
      const done = (v: boolean) => resolve(v);
      probe.addEventListener('loadedmetadata', () => done(true), { once: true });
      probe.addEventListener('canplaythrough', () => done(true), { once: true });
      probe.addEventListener('error', () => done(false), { once: true });
      window.setTimeout(() => done(false), 6000);
    });
    out.push({
      step: 'Çevrimiçi seslendirme',
      ok: reachable,
      detail: reachable
        ? 'Ses akışına ulaşıldı.'
        : 'Ses akışına ulaşılamadı (ağ engeli ya da servis erişilemez).',
    });
  }

  return out;
}

/** İşletim sistemine İbranice ses paketi ekleme yönergesi. */
export function voiceInstallGuide(): { platform: string; steps: string[] } {
  const ua = typeof navigator === 'undefined' ? '' : navigator.userAgent;

  if (/Windows/i.test(ua)) {
    return {
      platform: 'Windows',
      steps: [
        'Ayarlar → Saat ve Dil → Dil ve Bölge',
        '"Dil ekle" → Hebrew (עברית) seç',
        'Dil seçeneklerinde "Metin okuma" (Text-to-speech) kutusunu işaretle',
        'Kurulum bitince tarayıcıyı tamamen kapatıp yeniden aç',
      ],
    };
  }
  if (/Mac OS X|Macintosh/i.test(ua)) {
    return {
      platform: 'macOS',
      steps: [
        'Sistem Ayarları → Erişilebilirlik → Konuşulan İçerik',
        'Sistem Sesi → Sesi Yönet',
        'Hebrew altından bir ses indir',
        'Safari/Chrome’u yeniden başlat',
      ],
    };
  }
  if (/Android/i.test(ua)) {
    return {
      platform: 'Android',
      steps: [
        'Ayarlar → Erişilebilirlik → Metin okuma çıkışı',
        'Google Metin Okuma Motoru → Dilleri yükle',
        'עברית (İbranice) indir',
      ],
    };
  }
  if (/iPhone|iPad/i.test(ua)) {
    return {
      platform: 'iOS',
      steps: [
        'Ayarlar → Erişilebilirlik → Konuşulan İçerik → Sesler',
        'Hebrew seç ve indir',
      ],
    };
  }
  return {
    platform: 'Bilinmeyen sistem',
    steps: ['İşletim sisteminin konuşma/erişilebilirlik ayarlarından İbranice ses paketi ekle.'],
  };
}
