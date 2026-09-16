/**
 * Uçtan uca testler için ortak yardımcılar.
 *
 * NEDEN VAR: Her testin başında aynı üç şeyi yapmak gerekiyor ve biri
 * atlanırsa test yanıltıcı biçimde kırılıyor. En sinsisi sürüm kutusu:
 * yeni sürümde ekranın ortasında açılıyor ve altındaki her tıklamayı
 * yutuyor — testi yazan "düğme çalışmıyor" sanıyor.
 */
import { expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export const APP_VERSION = (
  JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf-8')) as { version: string }
).version;

/**
 * Uygulamayı temiz ve kutusuz açar.
 *
 * Sürüm kutusu "görüldü" işaretlenerek kapatılıyor. Kutunun KENDİSİNİ
 * sınayan test bunu kullanmıyor, bilerek işaretsiz açıyor.
 */
export async function ac(page: Page, yol = '/'): Promise<void> {
  // localStorage yazabilmek için önce bir sayfa yüklenmeli.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate((v) => {
    localStorage.setItem('shoresh.seenVersion', v);
  }, APP_VERSION);

  if (yol !== '/') await page.goto(yol, { waitUntil: 'domcontentloaded' });
  else await page.reload({ waitUntil: 'domcontentloaded' });

  await beklenenIcerik(page);
}

/**
 * Sayfanın gerçekten VERİ bastığını bekler.
 *
 * `waitUntil: 'load'` yetmiyor: React kabuğu yüklenmiş ama içerik henüz
 * çizilmemiş olabiliyor ve test boş bir sayfayı "açıldı" sayıyor.
 * Burada ana bölgede görünür metin oluşması bekleniyor.
 */
export async function beklenenIcerik(page: Page): Promise<void> {
  await expect(page.locator('main')).not.toBeEmpty({ timeout: 15_000 });
  await page.waitForFunction(
    () => (document.querySelector('main')?.textContent ?? '').trim().length > 40,
    undefined,
    { timeout: 15_000 },
  );
}

/** Sayfada konsol hatası biriktirir — testin sonunda boş olması beklenir. */
export function konsolHatalari(page: Page): string[] {
  const hatalar: string[] = [];
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    /*
     * Ses ve ağ hataları AYIKLANIYOR: seslendirme dış bir servise
     * bağlı ve test ortamında çalışmayabilir. Onu ayrı bir test
     * doğruluyor; burada aradığımız şey uygulamanın KENDİ hatası.
     */
    if (/tts|audio|net::ERR|Failed to load resource/i.test(t)) return;
    hatalar.push(t.slice(0, 200));
  });
  page.on('pageerror', (e) => hatalar.push(String(e).slice(0, 200)));
  return hatalar;
}

/** İlerlemeyi sıfırlar — ödül testleri temiz başlasın. */
export async function ilerlemeyiSil(page: Page): Promise<void> {
  await page.evaluate(async () => {
    localStorage.clear();
    const dbs = await indexedDB.databases();
    await Promise.all(
      dbs.map(
        (d) =>
          new Promise<void>((res) => {
            if (!d.name) return res();
            const req = indexedDB.deleteDatabase(d.name);
            req.onsuccess = () => res();
            req.onerror = () => res();
            req.onblocked = () => res();
          }),
      ),
    );
  });
}
