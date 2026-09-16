/**
 * Seslendirme — üç kez "düzeltildi", dördüncüde ölçülerek çözüldü.
 *
 * NEDEN BU TESTLER VAR: Sorun tam olarak buydu — seslendirme uç noktası
 * SUNUCUDAN çağrıldığında 200 ve geçerli MP3 dönüyor, TARAYICIDAN
 * çağrıldığında 404 veriyordu. `curl` ile bakan herkes "çalışıyor"
 * diyordu; kullanıcı hiçbir şey duymuyordu. Farkı yalnızca tarayıcı
 * içinden ölçmek gösterebilir.
 *
 * İkinci tuzak: `no-cors` isteğinin yanıtı opaktır ve 404 bile "başarılı"
 * görünür. Bu yüzden testler durum kodunu OKUYABİLEN istekler yapıyor.
 */
import { expect, test } from '@playwright/test';
import { ac } from './yardim';

/** שלום — seslendirme ucunun kabul ettiği en kısa geçerli metin. */
const SELAM = '%D7%A9%D7%9C%D7%95%D7%9D';

test('seslendirme ucu tarayıcıdan erişilebilir ve MP3 döndürüyor', async ({ page }) => {
  await ac(page, '/');

  const sonuc = await page.evaluate(async (q) => {
    const res = await fetch(`/api/tts?q=${q}&slow=1`);
    const buf = await res.arrayBuffer();
    const ilk = new Uint8Array(buf.slice(0, 2));
    return {
      durum: res.status,
      tur: res.headers.get('content-type'),
      bayt: buf.byteLength,
      // MP3 ya ID3 etiketiyle ya da çerçeve eşitlemesiyle (0xFF 0xFB/0xF3) başlar.
      imza: [...ilk].map((b) => b.toString(16).padStart(2, '0')).join(''),
    };
  }, SELAM);

  expect(sonuc.durum, `uç nokta ${sonuc.durum} döndü — vekil çalışmıyor`).toBe(200);
  expect(sonuc.tur).toContain('audio');
  expect(sonuc.bayt, 'gövde boş geldi').toBeGreaterThan(1000);
  expect(sonuc.imza, `ses imzası tanınmadı: ${sonuc.imza}`).toMatch(/^(fff3|fffb|4944|fff2)/);
});

test('<audio> öğesi bu adresi gerçekten çalabiliyor', async ({ page }) => {
  /*
   * Bu ayrı bir test: uç nokta 200 dönse bile `<audio>` gövdeyi
   * çözemeyebilir. Eski hatada tam olarak bu oluyordu — 404 gövdesi ses
   * sanılıyor ve "MEDIA_ELEMENT_ERROR: Format error" veriliyordu.
   */
  await ac(page, '/');

  const sonuc = await page.evaluate(
    (q) =>
      new Promise<{ durum: string; sure?: number; kod?: number }>((resolve) => {
        const a = new Audio();
        a.preload = 'auto';
        a.addEventListener('loadedmetadata', () =>
          resolve({ durum: 'yuklendi', sure: a.duration }),
        );
        a.addEventListener('error', () => resolve({ durum: 'hata', kod: a.error?.code }));
        setTimeout(() => resolve({ durum: 'zaman-asimi' }), 12_000);
        a.src = `/api/tts?q=${q}&slow=1`;
        a.load();
      }),
    SELAM,
  );

  expect(sonuc.durum, `ses çalınamadı (kod ${sonuc.kod ?? '-'})`).toBe('yuklendi');
  expect(sonuc.sure ?? 0, 'ses süresi sıfır').toBeGreaterThan(0.2);
});

test('uç nokta İbranice olmayan metni reddediyor', async ({ page }) => {
  /*
   * Bu uç nokta açık bırakılsaydı herhangi bir metni seslendiren bir
   * kapı olurdu. Girdi kısıtı bir güvenlik önlemi; kaldırılırsa bu test
   * kırılır.
   */
  await ac(page, '/');
  const durum = await page.evaluate(async () => {
    const res = await fetch('/api/tts?q=' + encodeURIComponent('merhaba dunya'));
    return res.status;
  });
  expect(durum, 'İbranice olmayan metin kabul edildi').toBe(400);
});

test('boş istek 400 dönüyor, çökmüyor', async ({ page }) => {
  await ac(page, '/');
  const durum = await page.evaluate(async () => (await fetch('/api/tts')).status);
  expect(durum).toBe(400);
});

test('ses sayfasındaki seslendirme düğmesi istek başlatıyor', async ({ page }) => {
  await ac(page, '/he/ses');

  const istekler: number[] = [];
  page.on('response', (r) => {
    if (r.url().includes('/api/tts')) istekler.push(r.status());
  });

  const dugme = page.locator('main button').filter({ hasText: /^$/ }).first();
  const sesDugmesi = (await dugme.count()) > 0 ? dugme : page.locator('main button').first();
  await sesDugmesi.click();
  await page.waitForTimeout(2500);

  /*
   * Cihazda İbranice sesi varsa istek HİÇ gitmez (cihaz sesi öncelikli)
   * ve bu bir hata değil. Bu yüzden test "istek gitmiş olmalı" demiyor;
   * "istek gittiyse başarılı olmalı" diyor.
   */
  for (const s of istekler) {
    expect(s, 'seslendirme isteği başarısız döndü').toBeLessThan(400);
  }
});
