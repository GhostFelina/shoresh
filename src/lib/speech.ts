/**
 * Seslendirme — Web Speech API üzerinden he-IL.
 *
 * NEDEN HARİCİ SERVİS YOK: ses dosyası indirmek ya da bir TTS API'sine
 * bağlanmak hem çevrimdışı çalışmayı bozar hem de her kelime için ağ
 * turu demektir. Tarayıcının kendi sentezleyicisi sıfır bağımlılık,
 * sıfır gecikme ve çevrimdışı çalışma sağlıyor.
 *
 * GERÇEKÇİ UYARI: İbranice ses her cihazda kurulu DEĞİLDİR. Windows'ta
 * genelde yok, macOS ve Android'de var. Bu yüzden `hebrewVoice()` null
 * dönebilir ve arayüz bunu sessizce yutmak yerine kullanıcıya söyler —
 * "tıkladım, ses çıkmadı, bozuk mu?" sorusunu baştan kesmek için.
 */

let cachedVoices: SpeechSynthesisVoice[] = [];

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

/** İbranice ses varsa döner. */
export function hebrewVoice(): SpeechSynthesisVoice | null {
  const all = voices();
  return (
    all.find((v) => v.lang === 'he-IL') ??
    all.find((v) => v.lang.startsWith('he')) ??
    all.find((v) => v.lang.startsWith('iw')) ?? // eski kod: İbranice 'iw' idi
    null
  );
}

/** Bu cihazda İbranice seslendirme mümkün mü? */
export function canSpeakHebrew(): boolean {
  return hebrewVoice() !== null;
}

export interface SpeakOptions {
  /** Yavaş okuma — yeni başlayan için 0.7 iyi bir değer. */
  rate?: number;
  onEnd?: () => void;
}

/**
 * İbranice metni seslendirir.
 *
 * Harekeler sentezleyiciyi yanıltabildiği için metin harekesiz gönderilir;
 * İbranice sesler harekesiz yazımı zaten doğru okur.
 */
export function speak(text: string, opts: SpeakOptions = {}): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = hebrewVoice();
  if (voice) utterance.voice = voice;
  utterance.lang = 'he-IL';
  utterance.rate = opts.rate ?? 0.85;
  if (opts.onEnd) utterance.addEventListener('end', opts.onEnd);
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
}
