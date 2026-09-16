/**
 * Ses paketi — uygulamanın seslendirdiği her şeyi bir kez indirip
 * çevrimdışı kullanılabilir hâle getirir.
 *
 * NEDEN BÖYLE, "hazır ses dosyaları gömmek" yerine:
 * Sinir ağı tabanlı açık kaynak bir İbranice ses (Piper he_IL) var ama
 * modeli 63 MB, üstüne tarayıcıda çalıştıran kütüphane 155 MB dosya
 * istiyor. Bir dil öğrenme uygulaması için orantısız. Hafif olan
 * kütüphanenin ise İbranice sesi yok.
 *
 * Bunun yerine uygulamanın seslendirdiği metinler SONLU bir küme:
 * 27 harf, 9 hareke, ~350 kelime, ~150 kalıp, ~370 fiil ve örnek
 * cümleler — toplamda birkaç bin değil, ~1.500 klip. Hepsi bir kez
 * çekilip tarayıcının kalıcı önbelleğine konursa uygulama çevrimdışı
 * konuşur ve her klip anında başlar.
 *
 * NASIL ÇALIŞIR — opak yanıt meselesi:
 * Seslendirme uç noktası CORS başlığı göndermiyor. Bu yüzden sayfa onu
 * `fetch` ile okuyup kendisi saklayamaz; gelen yanıt "opak"tır, gövdesi
 * JavaScript'e kapalıdır. Ama SERVICE WORKER opak yanıtı önbelleğe
 * koyabilir ve sonra `<audio>` isteğine yanıt olarak verebilir —
 * tarayıcının medya hattı onu sorunsuz çalar.
 *
 * Yani indirme şöyle işler: sayfa `fetch(url, { mode: 'no-cors' })` der,
 * service worker araya girip yanıtı önbelleğe yazar, gövdeyi kimse
 * okumaz. Sonradan aynı adres `<audio src>` ile istendiğinde service
 * worker önbellekten verir.
 *
 * SINIR: Service worker yalnızca ÜRETİM derlemesinde çalışır. Geliştirme
 * sunucusunda paket indirme kapalıdır ve arayüz bunu söyler — sessizce
 * çalışmıyormuş gibi durmaz.
 */
import { LETTERS, NIQQUDIM } from '@/data/alefbet';
import { VERBS } from '@/data/catalog';
import { WORDS } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import { WRITTEN_SENTENCES } from '@/data/sentences';

/** Service worker'ın önbelleğe aldığı isim — vite.config.ts ile aynı olmalı. */
const CACHE_NAME = 'shoresh-ses';

/** Seslendirme adresi — `speech.ts` ile birebir aynı biçimde kurulmalı. */
function ttsUrl(text: string, slow: boolean): string {
  const q = encodeURIComponent(text.slice(0, 180));
  return (
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&client=tw-ob&tl=iw&ttsspeed=${slow ? '0.4' : '1'}&q=${q}`
  );
}

export interface PackSection {
  id: string;
  label: string;
  texts: string[];
}

/**
 * Uygulamanın seslendirebileceği bütün metinler, bölümlere ayrılmış.
 *
 * Fiillerde TAM tablo alınmıyor: 367 fiil × ~24 biçim ≈ 8.800 klip eder
 * ve paket 70 MB'a çıkar. Bunun yerine öğrencinin gerçekten dinlediği
 * biçimler alınıyor — sözlük biçimi, mastar ve şimdiki zamanın dört hâli.
 * Kalanı yine çevrimiçi çalınabilir.
 */
export function packSections(): PackSection[] {
  const letters = LETTERS.map((l) => l.nameHe);
  const niqqud = NIQQUDIM.map((n) => n.nameHe);

  const verbForms: string[] = [];
  for (const v of VERBS) {
    verbForms.push(v.lemma.plain);
    verbForms.push(v.table.infinitive.plain);
    for (const slot of ['ms', 'fs', 'mp', 'fp'] as const) {
      const c = v.table.present[slot];
      if (c) verbForms.push(c.plain);
    }
  }

  const sentences = Object.values(WRITTEN_SENTENCES)
    .flat()
    .map((s) => s.plain);

  return [
    { id: 'letters', label: 'Harf adları', texts: letters },
    { id: 'niqqud', label: 'Hareke adları', texts: niqqud },
    { id: 'words', label: 'Kelimeler', texts: WORDS.map((w) => w.plain) },
    { id: 'phrases', label: 'Kalıplar', texts: PHRASES.map((p) => p.plain) },
    { id: 'verbs', label: 'Fiiller (sözlük, mastar, şimdiki)', texts: verbForms },
    { id: 'sentences', label: 'Örnek cümleler', texts: sentences },
  ];
}

/** Paketteki tekil adresler. Aynı metin iki kez indirilmez. */
export function packUrls(sections = packSections()): string[] {
  const texts = new Set<string>();
  for (const s of sections) {
    for (const t of s.texts) {
      const clean = t.trim();
      if (clean) texts.add(clean);
    }
  }
  // Yavaş okuma ayrı bir adrestir; uygulama öğretirken yavaşı kullanıyor.
  return [...texts].map((t) => ttsUrl(t, true));
}

export interface PackStatus {
  /** Service worker etkin mi? Değilse paket indirilemez. */
  available: boolean;
  cached: number;
  total: number;
  reason?: string;
}

const hasCaches = (): boolean => typeof caches !== 'undefined';

const swReady = (): boolean =>
  typeof navigator !== 'undefined' &&
  'serviceWorker' in navigator &&
  navigator.serviceWorker.controller !== null;

/** Paketin ne kadarı zaten indirilmiş? */
export async function packStatus(): Promise<PackStatus> {
  const total = packUrls().length;

  if (!hasCaches()) {
    return { available: false, cached: 0, total, reason: 'Tarayıcı önbellek API’sini desteklemiyor.' };
  }
  if (!swReady()) {
    return {
      available: false,
      cached: 0,
      total,
      reason:
        'Ses paketi yalnızca yayındaki sürümde indirilebilir. Geliştirme sunucusunda service worker çalışmaz.',
    };
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    return { available: true, cached: keys.length, total };
  } catch (err) {
    return { available: false, cached: 0, total, reason: (err as Error).message };
  }
}

export interface DownloadProgress {
  done: number;
  total: number;
  failed: number;
}

/**
 * Paketi indirir.
 *
 * Eşzamanlılık bilerek düşük: seslendirme uç noktası hızlı ardışık
 * isteklerde geçici olarak reddediyor. Altı paralel istek, tamamlanma
 * süresini kabul edilebilir tutarken reddedilme oranını düşük bırakıyor.
 */
export async function downloadPack(
  onProgress?: (p: DownloadProgress) => void,
  signal?: AbortSignal,
): Promise<DownloadProgress> {
  const urls = packUrls();
  const total = urls.length;
  let done = 0;
  let failed = 0;

  const CONCURRENCY = 6;
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < urls.length) {
      if (signal?.aborted) return;
      const url = urls[cursor++]!;
      try {
        /*
         * `no-cors` zorunlu: uç nokta CORS başlığı göndermiyor. Yanıt opak
         * gelir ve okunamaz — ama service worker onu önbelleğe yazar,
         * bizim de istediğimiz tam olarak bu.
         */
        await fetch(url, { mode: 'no-cors', signal });
      } catch {
        failed++;
      }
      done++;
      onProgress?.({ done, total, failed });
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
  return { done, total, failed };
}

/** İndirilmiş paketi siler. */
export async function clearPack(): Promise<void> {
  if (!hasCaches()) return;
  await caches.delete(CACHE_NAME);
}

/**
 * Paketin kabaca kaç megabayt yer kaplayacağı.
 * Ölçüm: tek bir kelime klibi ~8 KB, kısa cümle ~14 KB geliyor.
 */
export function estimatedMegabytes(urlCount = packUrls().length): number {
  const AVERAGE_CLIP_BYTES = 9_500;
  return Math.round((urlCount * AVERAGE_CLIP_BYTES) / 1024 / 1024);
}
