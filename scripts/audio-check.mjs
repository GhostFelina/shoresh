/**
 * Ses tanılaması — gerçek tarayıcıda, gerçek ölçüm.
 *
 * NEDEN VAR: Ses katmanı üç kez "düzeltildi" ama kullanıcı hâlâ bir şey
 * duymuyor. Tahminle ilerlemek burada bitiyor; bu betik her katmanı
 * tarayıcı içinde tek tek deneyip NE OLDUĞUNU yazdırıyor.
 *
 * Ölçülenler:
 *  1. Cihazda İbranice konuşma sesi var mı
 *  2. Seslendirme uç noktası tarayıcıdan ERİŞİLEBİLİR mi (sunucudan
 *     erişilebilir olması yetmez — Google, Referer/Origin'e bakabilir)
 *  3. <audio> öğesi o adresi gerçekten ÇALABİLİYOR mu
 *  4. Ne kadar ses verisi geldi (süre + hazır olma durumu)
 */
import { chromium } from '@playwright/test';

const BASE = process.argv[2] ?? 'http://localhost:5400';
// Kendi vekilimiz. Doğrudan dış servis 404 veriyordu; ölçüm bunu gösterdi.
const TTS = `${BASE}/api/tts?q=%D7%A9%D7%9C%D7%95%D7%9D&slow=1`;

const browser = await chromium.launch();
const page = await browser.newPage();

// Ağ isteklerini izle: hangi adres hangi kodla döndü.
const network = [];
page.on('response', (r) => {
  const url = r.url();
  if (url.includes('translate_tts') || url.includes('/api/tts')) {
    network.push({ url: url.slice(0, 90), status: r.status(), type: r.headers()['content-type'] });
  }
});
page.on('console', (m) => {
  if (m.type() === 'error') console.log('  KONSOL HATASI:', m.text().slice(0, 140));
});

await page.goto(BASE, { waitUntil: 'networkidle' });

console.log('=== 1. CİHAZDA İBRANİCE SES ===');
const voices = await page.evaluate(async () => {
  // Sesler eşzamansız gelir; kısa bir süre bekle.
  await new Promise((r) => setTimeout(r, 600));
  const all = speechSynthesis.getVoices();
  return {
    total: all.length,
    hebrew: all.filter((v) => /^(he|iw)/i.test(v.lang)).map((v) => `${v.name} (${v.lang})`),
    sample: all.slice(0, 5).map((v) => `${v.name} (${v.lang})`),
  };
});
console.log('  toplam ses:', voices.total);
console.log('  İbranice  :', voices.hebrew.length ? voices.hebrew.join(', ') : 'YOK');
console.log('  örnek     :', voices.sample.join(' | ') || '(hiç ses yok)');

console.log('\n=== 2. UÇ NOKTA TARAYICIDAN ERİŞİLEBİLİR Mİ ===');
const reach = await page.evaluate(async (url) => {
  try {
    const res = await fetch(url, { mode: 'no-cors' });
    // no-cors yanıtı opaktır: type 'opaque', status 0. Bu BAŞARIYI da
    // başarısızlığı da aynı gösterir — bu yüzden tek başına yeterli değil.
    return { ok: true, type: res.type, status: res.status };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 120) };
  }
}, TTS);
console.log(' ', JSON.stringify(reach));

console.log('\n=== 3. <audio> GERÇEKTEN ÇALABİLİYOR MU ===');
const play = await page.evaluate(async (url) => {
  return await new Promise((resolve) => {
    const a = new Audio();
    a.preload = 'auto';
    const done = (r) => resolve(r);

    a.addEventListener('loadedmetadata', () =>
      done({ result: 'META YÜKLENDİ', duration: a.duration, readyState: a.readyState }),
    );
    a.addEventListener('canplaythrough', () =>
      done({ result: 'ÇALMAYA HAZIR', duration: a.duration, readyState: a.readyState }),
    );
    a.addEventListener('error', () => {
      const err = a.error;
      done({
        result: 'HATA',
        code: err?.code ?? null,
        message: err?.message ?? '',
        // 4 = MEDIA_ELEMENT_ERROR: kaynak desteklenmiyor / alınamadı
      });
    });
    setTimeout(() => done({ result: 'ZAMAN AŞIMI', readyState: a.readyState }), 8000);

    a.src = url;
    a.load();
  });
}, TTS);
console.log(' ', JSON.stringify(play));

console.log('\n=== 4. AĞ TRAFİĞİ ===');
if (network.length === 0) console.log('  (ses isteği görülmedi)');
for (const n of network) console.log(' ', n.status, n.type ?? '?', n.url);

await browser.close();
