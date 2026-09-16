/**
 * Yapay zekâ istemcisi — taşıma katmanı.
 *
 * Burada yönerge YOK, kişilik YOK, İbranice YOK: yalnızca "isteği
 * sunucuya götür, cevabı getir, hatayı dürüstçe söyle". Yönergeler
 * `api/ai.js` içinde, sunucuda duruyor (sebebi orada yazılı).
 *
 * NEDEN AYRI DOSYA: Öğretmen sohbeti, yanlış cevabın açıklaması ve
 * ödev değerlendirmesi aynı borudan geçiyor. Üçü de kendi içinde
 * "bağlı mı, kota doldu mu, ağ gitti mi" sorularını çözmeye kalksaydı
 * üç ayrı yanlış davranış çıkardı.
 */

export type AiTask = 'sohbet' | 'aciklama' | 'degerlendirme';

/**
 * Hata TÜRÜ, hata metni değil.
 *
 * Arayüzün "anahtar yok" ile "ağ gitti"ye farklı tepki vermesi gerek:
 * birincisinde özelliği kapatmak, ikincisinde tekrar denemek doğru.
 * Tek bir metin dönseydi arayüz metnin içinde kelime aramak zorunda
 * kalırdı ve çeviri değişince bozulurdu.
 */
export type AiErrorKind = 'anahtar-yok' | 'ag' | 'kota' | 'sunucu' | 'iptal';

export class AiError extends Error {
  readonly kind: AiErrorKind;
  constructor(kind: AiErrorKind, message: string) {
    super(message);
    this.name = 'AiError';
    this.kind = kind;
  }
}

/** Kullanıcıya gösterilecek dürüst cümle — teknik ayrıntı değil. */
export function aiErrorLine(err: unknown): string {
  if (!(err instanceof AiError)) return 'Beklenmeyen bir şey oldu.';
  switch (err.kind) {
    case 'anahtar-yok':
      return 'Yapay zekâ öğretmen henüz bağlı değil. Dersler ve alıştırmalar normal çalışıyor.';
    case 'ag':
      return 'İnternete ulaşamadım. Bağlantını kontrol edip tekrar dene.';
    case 'kota':
      return 'Çok hızlı gittik, biraz bekleyelim.';
    default:
      return 'Şu an cevap veremedim. Birazdan tekrar dener misin?';
  }
}

/* ------------------------------------------------------------------ *
 * Kurulum yoklaması
 * ------------------------------------------------------------------ */

let probeCache: Promise<boolean> | null = null;

/**
 * Yapay zekâ bağlı mı?
 *
 * Sonuç ÖNBELLEKLENİYOR: her bileşen kendi açılışında sorarsa aynı
 * cevabı almak için beş istek gider. Anahtar oturum ortasında
 * eklenmiyor, bu yüzden bir kez sormak yeterli.
 */
export function aiReady(): Promise<boolean> {
  if (!probeCache) {
    probeCache = fetch('/api/ai?probe=1')
      .then((r) => (r.ok ? r.json() : { ready: false }))
      .then((d: { ready?: boolean }) => Boolean(d.ready))
      .catch(() => false);
  }
  return probeCache;
}

/** Testler ve "anahtar yeni eklendi" durumu için. */
export function resetAiProbe(): void {
  probeCache = null;
}

/* ------------------------------------------------------------------ *
 * İstek
 * ------------------------------------------------------------------ */

export async function askAi(
  task: AiTask,
  text: string,
  options: { signal?: AbortSignal } = {},
): Promise<string> {
  let res: Response;

  try {
    res = await fetch('/api/ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task, text }),
      signal: options.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AiError('iptal', 'istek iptal edildi');
    }
    throw new AiError('ag', 'sunucuya ulaşılamadı');
  }

  if (res.status === 503) {
    // Anahtar yokken önbelleği de düzelt: arayüz bir daha sormasın.
    probeCache = Promise.resolve(false);
    throw new AiError('anahtar-yok', 'GEMINI_API_KEY tanımlı değil');
  }
  if (res.status === 429) throw new AiError('kota', 'hız sınırı');
  if (!res.ok) throw new AiError('sunucu', `sunucu ${res.status}`);

  const data = (await res.json()) as { text?: string };
  const out = (data.text ?? '').trim();
  if (!out) throw new AiError('sunucu', 'boş cevap');
  return out;
}

/**
 * Değerlendirme cevabını çözer.
 *
 * Model JSON döndürmesi için yönergeliyor ama bazen metni kod bloğuna
 * sarıyor ya da başına bir cümle ekliyor. Ayrıştırma BUNA DAYANIKLI
 * olmalı: çözemezsek öğrenciye ham JSON göstermektense notsuz ama
 * okunabilir bir geri bildirim vermek daha iyidir.
 */
export interface Degerlendirme {
  puan: number | null;
  not: string;
  dogruYanlar: string[];
  eksikYanlar: string[];
}

export function parseDegerlendirme(raw: string): Degerlendirme {
  const govde = raw.replace(/```json|```/g, '').trim();
  const basla = govde.indexOf('{');
  const bitir = govde.lastIndexOf('}');

  if (basla !== -1 && bitir > basla) {
    try {
      const o = JSON.parse(govde.slice(basla, bitir + 1)) as Record<string, unknown>;
      const puan = typeof o.puan === 'number' ? Math.round(o.puan) : null;
      return {
        puan: puan === null ? null : Math.min(100, Math.max(0, puan)),
        not: String(o.not ?? '').trim(),
        dogruYanlar: Array.isArray(o.dogru_yanlar) ? o.dogru_yanlar.map(String) : [],
        eksikYanlar: Array.isArray(o.eksik_yanlar) ? o.eksik_yanlar.map(String) : [],
      };
    } catch {
      /* düşer, aşağıdaki dürüst yedeğe gider */
    }
  }

  return { puan: null, not: govde.slice(0, 400), dogruYanlar: [], eksikYanlar: [] };
}
