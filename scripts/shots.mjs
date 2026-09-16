/**
 * Ekran görüntüsü alıcı — tasarımı gözle denetlemek için.
 *
 * NEDEN VAR: Otomatik denetim (tests/unit/audit.test.tsx) ölçülebilir
 * şeyleri yakalıyor — erişilebilir ad, bağlantı hedefi, metin yönü. Ama
 * "bu sayfa kalabalık", "bu boşluk yanlış", "bu renk okunmuyor" gibi
 * yargılar ancak sayfaya BAKARAK verilebilir. Bu betik o bakışı mümkün
 * kılıyor: her sayfayı masaüstü ve telefon genişliğinde, iki temada
 * çekip `screenshots/` altına koyuyor.
 *
 * Kullanım:  node scripts/shots.mjs [taban-adres]
 * Varsayılan taban adres yerel geliştirme sunucusudur.
 */
import { chromium } from '@playwright/test';
import { mkdir, rm } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const BASE = process.argv[2] ?? 'http://localhost:5400';
const OUT = fileURLToPath(new URL('../screenshots', import.meta.url));

/** Çekilecek sayfalar — sol menüdeki her giriş artı oyun içi bir ekran. */
const PAGES = [
  ['ana-sayfa', '/'],
  ['seviye-a1', '/seviye/a1'],
  ['alefbet', '/alefbet'],
  ['okuma', '/okuma'],
  ['verb', '/verb'],
  ['binyanim', '/binyanim'],
  ['kaliplar', '/kaliplar'],
  ['kelimeler', '/kelimeler'],
  ['oyunlar', '/oyunlar'],
  ['oyun-ici', '/oyunlar/kok-avcisi'],
  ['ses', '/ses'],
  ['ilerleme', '/ilerleme'],
];

const VIEWPORTS = [
  { name: 'masaustu', width: 1440, height: 900 },
  { name: 'telefon', width: 390, height: 844 },
];

const THEMES = ['dark', 'light'];

async function main() {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });

  const browser = await chromium.launch();
  let count = 0;

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      // Telefon görünümünde her iki temayı çekmek gereksiz; oradaki soru
      // düzen, renk değil. Zaman ve dosya sayısı yarıya iniyor.
      if (vp.name === 'telefon' && theme === 'light') continue;

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
        locale: 'tr-TR',
      });
      const page = await context.newPage();

      for (const [name, path] of PAGES) {
        try {
          await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30_000 });

          // Tema seçimi localStorage'da tutuluyor; ayarlayıp yeniden yükle.
          await page.evaluate((t) => {
            document.documentElement.dataset.theme = t;
            try {
              localStorage.setItem('shoresh.theme', t);
            } catch {
              /* gizli sekmede yazılamaz, görünüm yine de doğru */
            }
          }, theme);

          // Yazı tipleri yüklenmeden çekilen görüntü yanıltıcı olur.
          await page.evaluate(() => document.fonts.ready);
          await page.waitForTimeout(350);

          const file = `${OUT}/${vp.name}-${theme}-${name}.png`;
          await page.screenshot({ path: file, fullPage: vp.name === 'masaustu' });
          count++;
          console.log('cekildi:', `${vp.name}-${theme}-${name}.png`);
        } catch (err) {
          console.log('HATA:', path, '->', (err instanceof Error ? err.message : err));
        }
      }

      await context.close();
    }
  }

  await browser.close();
  console.log(`\ntoplam ${count} görüntü -> screenshots/`);
}

await main();
