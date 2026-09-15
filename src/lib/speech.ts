/**
 * İbranice seslendirme — katmanlı çözüm.
 *
 * SORUN: Tarayıcının kendi konuşma sentezleyicisi (Web Speech API) sıfır
 * bağımlılık ve çevrimdışı çalışma sunuyor, AMA İbranice ses paketi her
 * cihazda kurulu değil. Windows'ta neredeyse hiç yok; macOS ve Android'de
 * genelde var. Tek katmanla yetinilirse kullanıcının yarısı düğmeye basıp
 * hiçbir şey duymuyor ve uygulamayı bozuk sanıyor.
 *
 * ÇÖZÜM — sırayla denenen üç katman:
 *   1. Cihazda kurulu İbranice ses (he-IL) → en iyisi, çevrimdışı çalışır
 *   2. Google Translate seslendirme akışı → ses paketi olmayan cihazlarda
 *      devreye girer; `<audio>` öğesiyle çalındığı için CORS engeline
 *      takılmaz (medya oynatma çapraz kaynak isteğe tabi değildir)
 *   3. Hiçbiri yoksa → SESSİZ KALMAZ, durum bildirir ve arayüz kullanıcıya
 *      ne yapacağını söyler
 *
 * Katman 2 internet ister. Çevrimdışıyken katman 1 yoksa ses de yoktur;
 * bu dürüstçe raporlanır, "çalıyormuş gibi" yapılmaz.
 */

export type SpeechLayer = 'device-voice' | 'google-tts' | 'none';

export interface SpeechStatus {
  /** Hangi katman kullanılabilir durumda? */
  layer: SpeechLayer;
  /** Cihazda İbranice ses paketi bulundu mu? */
  hasDeviceVoice: boolean;
  /** Ağ erişimi var mı (katman 2 için gerekli)? */
  online: boolean;
  /** Kullanıcıya gösterilecek açıklama. */
  message: string;
}

let cachedVoices: SpeechSynthesisVoice[] = [];
/** Katman 2 başarısız olursa bir daha denenmesin diye. */
let googleTtsBroken = false;

function voices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  if (cachedVoices.length === 0) cachedVoices = window.speechSynthesis.getVoices();
  return cachedVoices;
}

// Sesler bazı tarayıcılarda eşzamansız yüklenir; olay gelince önbelleği tazele.
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cachedVoices = window.speechSynthesis.getVoices();
  });
}

/** Cihazda kurulu İbranice ses varsa döner. */
export function hebrewVoice(): SpeechSynthesisVoice | null {
  const all = voices();
  return (
    all.find((v) => v.lang === 'he-IL') ??
    all.find((v) => v.lang.startsWith('he')) ??
    // Eski kod: İbranicenin ISO kodu vaktiyle 'iw' idi, hâlâ böyle
    // etiketleyen sistemler var.
    all.find((v) => v.lang.startsWith('iw')) ??
    null
  );
}

const isOnline = (): boolean =>
  typeof navigator === 'undefined' ? true : navigator.onLine !== false;

/** Şu an hangi katmanla ses çıkabilir? */
export function speechStatus(): SpeechStatus {
  const hasDeviceVoice = hebrewVoice() !== null;
  const online = isOnline();

  if (hasDeviceVoice) {
    return {
      layer: 'device-voice',
      hasDeviceVoice,
      online,
      message: 'Cihazındaki İbranice ses kullanılıyor — çevrimdışı da çalışır.',
    };
  }
  if (online && !googleTtsBroken) {
    return {
      layer: 'google-tts',
      hasDeviceVoice,
      online,
      message:
        'Cihazında İbranice ses paketi yok; çevrimiçi seslendirme kullanılıyor. ' +
        'Çevrimdışı da dinlemek istersen işletim sistemine İbranice ses paketi ekleyebilirsin.',
    };
  }
  return {
    layer: 'none',
    hasDeviceVoice,
    online,
    message: googleTtsBroken
      ? 'Çevrimiçi seslendirmeye ulaşılamadı. İşletim sistemine İbranice ses paketi eklemek kalıcı çözüm olur.'
      : 'Çevrimdışısın ve cihazında İbranice ses paketi yok, bu yüzden seslendirme çalışmıyor.',
  };
}

export interface SpeakOptions {
  /** Okuma hızı. Yeni başlayan için 0.75 iyi bir değer. */
  rate?: number;
  onStart?: () => void;
  onEnd?: () => void;
  /** Hiçbir katman çalışmazsa çağrılır. */
  onUnavailable?: (status: SpeechStatus) => void;
}

/** Şu an çalan ses — yenisi başlayınca durdurulur. */
let currentAudio: HTMLAudioElement | null = null;

function stopAudioElement(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = '';
    currentAudio = null;
  }
}

/**
 * Google Translate seslendirme adresi.
 *
 * `tl=iw` — Google, İbranice için hâlâ eski ISO kodunu bekliyor.
 * `client=tw-ob` — web oynatıcı istemcisi.
 * Metin uzunluğu sınırlı olduğu için kırpılıyor; uygulamada seslendirilen
 * en uzun şey kısa bir cümle, bu sınıra takılmıyor.
 */
function googleTtsUrl(text: string, rate: number): string {
  const q = encodeURIComponent(text.slice(0, 180));
  const ttsspeed = rate < 0.85 ? '0.4' : '1';
  return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=iw&ttsspeed=${ttsspeed}&q=${q}`;
}

/** Katman 2 — çevrimiçi seslendirme. */
function speakViaGoogle(text: string, opts: SpeakOptions): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(googleTtsUrl(text, opts.rate ?? 0.8));
      audio.crossOrigin = 'anonymous';
      currentAudio = audio;

      let settled = false;
      const done = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      audio.addEventListener('playing', () => opts.onStart?.());
      audio.addEventListener('ended', () => {
        opts.onEnd?.();
        done(true);
      });
      audio.addEventListener('error', () => {
        googleTtsBroken = true;
        done(false);
      });

      // Ses hiç başlamazsa sonsuza kadar beklemeyelim.
      window.setTimeout(() => {
        if (!settled && audio.paused) {
          googleTtsBroken = true;
          done(false);
        }
      }, 4000);

      void audio.play().catch(() => {
        googleTtsBroken = true;
        done(false);
      });
    } catch {
      googleTtsBroken = true;
      resolve(false);
    }
  });
}

/** Katman 1 — cihazın kendi sesi. */
function speakViaDevice(text: string, opts: SpeakOptions): boolean {
  const voice = hebrewVoice();
  if (!voice) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = opts.rate ?? 0.85;
  if (opts.onStart) utterance.addEventListener('start', opts.onStart);
  if (opts.onEnd) utterance.addEventListener('end', opts.onEnd);
  window.speechSynthesis.speak(utterance);
  return true;
}

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

  if (isOnline() && !googleTtsBroken) {
    const ok = await speakViaGoogle(clean, opts);
    if (ok) return;
  }

  opts.onUnavailable?.(speechStatus());
}

/** Harekeleri siler — sentezleyiciye ham harfler gider. */
function stripMarks(text: string): string {
  return text.replace(/[֑-ׇ]/g, '');
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined') return;
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  stopAudioElement();
}

/** Seslendirme hiç mümkün mü? Arayüz düğmeyi buna göre gösterir. */
export function canSpeakHebrew(): boolean {
  return speechStatus().layer !== 'none';
}
