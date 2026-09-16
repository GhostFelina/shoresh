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
import { mkdir, readFile, rm } from 'node:fs/promises';
import { fileURLToPath, URL } from 'node:url';

const BASE = process.argv[2] ?? 'http://localhost:5400';
const OUT = fileURLToPath(new URL('../screenshots', import.meta.url));

/*
 * Uygulamanın sürümü — duyuru kutusunu susturmak için gerekiyor.
 * BİLİNMEYEN bir sürüm yazmak işe yaramaz: `releasesSince` tanımadığı
 * sürümü "ileri sürümden dönüş" sayıp kutuyu YİNE açıyor. Doğru damga
 * tam olarak güncel sürüm; onu da tek doğru kaynağından okuyoruz.
 */
const APP_VERSION = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
).version;

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
  ['ogretmen', '/ogretmen'],
  ['seviye-tespit', '/ogretmen/seviye-tespit'],
  ['ders-ici', '/ogretmen/binyan-present-paal'],
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

      /*
       * Sürüm duyuru kutusu her yeni sürümde açılıyor ve ekranın
       * ortasını kaplıyor — çekilen her görüntü karartılmış bir sayfa
       * üstünde o kutuyu gösteriyordu, yani tasarımı denetlemek için
       * alınan görüntüler tasarımı GÖSTERMİYORDU (AI_HANDOFF §3, tuzak 16).
       * Sayfa açılmadan önce "görüldü" damgası basılıyor.
       */
      /*
       * Tema da BURADA, sayfa açılmadan önce yazılıyor.
       *
       * NEDEN SONRADAN DEĞİL: Palet tonları çalışma anında
       * `documentElement.style` üzerine satır içi yazılıyor ve satır içi
       * stil, CSS'teki `:root[data-theme='light']` kuralını yener.
       * Sayfa koyu temada açılıp sonradan `dataset.theme` değiştirilince
       * ortaya ÇIKAN ŞEY açık tema değil, beyaz zemine koyu tema
       * renklerinin yapıştığı bir melez oluyordu — ve alınan görüntüye
       * bakıp "açık tema bozuk" diye hüküm vermek işten bile değildi.
       * Ölçüm aracının kendisi yanıltıyorsa, ölçüm yoktur.
       */
      await context.addInitScript(
        ({ v, t }) => {
          try {
            localStorage.setItem('shoresh.seenVersion', v);
            localStorage.setItem('shoresh.theme', t);
          } catch {
            /* gizli sekmede yazılamaz; kutu açılır, görüntü yine alınır */
          }
        },
        { v: APP_VERSION, t: theme },
      );

      for (const [name, path] of PAGES) {
        try {
          await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30_000 });

          // Tema açılışta uygulandı; burada yalnızca doğrulanıyor.
          const applied = await page.evaluate(() => document.documentElement.dataset.theme);
          if (applied !== theme) console.log('UYARI: tema uygulanmadı ->', path, applied);

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
