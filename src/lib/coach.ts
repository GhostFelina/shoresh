/**
 * Koç sesi — öğretmenin TÜRKÇE konuşan yanı.
 *
 * NEDEN AYRI KATMAN: `speech.ts` İbraniceyi seslendirir ve bunu yapmak
 * için sunucu vekilimize gitmek zorunda — çünkü ölçtük, cihazlarda
 * İbranice ses yok. Türkçe için durum TAM TERSİ: Windows’ta Microsoft
 * Tolga, Android’de Google Türkçe, iOS’ta Yelda hazır kurulu geliyor.
 * Yani öğretmenin yönergeleri ağ olmadan, gecikmesiz ve bedava
 * söylenebilir.
 *
 * Bu ayrım ölçümden çıktı: `scripts/audio-check.mjs` bu makinede
 * "1 ses: Microsoft Tolga (tr-TR), İbranice YOK" dedi. Elimizdeki sesi
 * kullanmamak, olmayan sesi aramaktan daha büyük kayıp olurdu.
 *
 * SESSİZ KALMAK HATA DEĞİL: Türkçe ses bulunamazsa koç susar, arayüz
 * yazıyla devam eder. Ders akışı sese bağlı değildir.
 */

const hasSynth = (): boolean => typeof window !== 'undefined' && 'speechSynthesis' in window;

let cache: SpeechSynthesisVoice[] = [];

function voices(): SpeechSynthesisVoice[] {
  if (!hasSynth()) return [];
  if (cache.length === 0) cache = window.speechSynthesis.getVoices();
  return cache;
}

if (hasSynth()) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    cache = window.speechSynthesis.getVoices();
  });
}

/** Cihazdaki Türkçe ses. Yoksa null — koç susar. */
export function turkishVoice(): SpeechSynthesisVoice | null {
  const all = voices();
  return all.find((v) => v.lang === 'tr-TR') ?? all.find((v) => v.lang.startsWith('tr')) ?? null;
}

export const canCoachSpeak = (): boolean => turkishVoice() !== null;

let current: SpeechSynthesisUtterance | null = null;

/** Koçun konuşmasını keser. Ders adımı değişince çağrılır. */
export function stopCoach(): void {
  if (!hasSynth()) return;
  window.speechSynthesis.cancel();
  current = null;
}

export interface CoachOptions {
  /** Yeni başlayan için biraz yavaş. */
  rate?: number;
  onEnd?: () => void;
}

/**
 * Türkçe cümleyi seslendirir.
 *
 * Bir önceki cümleyi keser: ders adımları hızlı geçilebiliyor ve
 * kesilmeseydi öğrenci iki cümlenin üst üste bindiğini duyardı.
 */
export function coachSay(text: string, opts: CoachOptions = {}): void {
  const voice = turkishVoice();
  if (!voice || !hasSynth()) {
    opts.onEnd?.();
    return;
  }
  stopCoach();

  const u = new SpeechSynthesisUtterance(text);
  u.voice = voice;
  u.lang = voice.lang;
  u.rate = opts.rate ?? 0.95;
  u.addEventListener('end', () => {
    current = null;
    opts.onEnd?.();
  });
  u.addEventListener('error', () => {
    current = null;
    opts.onEnd?.();
  });
  current = u;
  window.speechSynthesis.speak(u);
}

/* ------------------------------------------------------------------ *
 * Tepkiler
 * ------------------------------------------------------------------ */

export type Reaction = 'correct' | 'wrong' | 'streak' | 'hint' | 'done';

/**
 * Tepki cümleleri — her tür için birkaç seçenek.
 *
 * NEDEN BİRDEN FAZLA: Tek cümle olsaydı üçüncü soruda anlamını
 * yitirirdi; "Doğru!" her seferinde aynı tonda söylenince öğrenci onu
 * duymayı bırakır. Rastgele seçim, geri bildirimi canlı tutuyor.
 *
 * NEDEN ABARTISIZ: "Muhteşemsin!" gibi bir cümle bir kelimeyi doğru
 * bilmenin karşılığı değil. Öğrenci bunu fark eder ve övgüyü ciddiye
 * almayı bırakır — o zaman gerçekten iyi gittiğinde söylenecek söz
 * kalmaz.
 */
const LINES: Record<Reaction, string[]> = {
  correct: ['Doğru.', 'Evet, bu.', 'Tam isabet.', 'Doğru bildin.'],
  wrong: ['Olmadı.', 'Bu değil.', 'Yakın ama değil.', 'Bir daha bak.'],
  streak: ['Üst üste doğru, iyi gidiyorsun.', 'Kalıbı yakaladın.', 'Ard arda doğru.'],
  hint: ['İpucu veriyorum.', 'Şuna dikkat et.', 'Bak bakalım.'],
  done: ['Ders bitti.', 'Bu bölümü tamamladın.', 'Buraya kadar iyiydi.'],
};

let lastIndex: Partial<Record<Reaction, number>> = {};

/** Aynı cümleyi arka arkaya söylemeyen rastgele seçici. */
export function reactionLine(kind: Reaction): string {
  const list = LINES[kind];
  if (list.length === 1) return list[0]!;
  let i = Math.floor(Math.random() * list.length);
  if (i === lastIndex[kind]) i = (i + 1) % list.length;
  lastIndex = { ...lastIndex, [kind]: i };
  return list[i]!;
}

/** Tepkiyi hem döndürür hem seslendirir — arayüz aynı metni yazar. */
export function coachReact(kind: Reaction): string {
  const line = reactionLine(kind);
  coachSay(line, { rate: 1 });
  return line;
}

/** Tarayıcı sekmesi kapanırken konuşma takılı kalmasın. */
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', stopCoach);
}

export const coachSpeaking = (): boolean => current !== null;
