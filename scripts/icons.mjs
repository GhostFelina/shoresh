/**
 * PWA simgelerini işaretten üretir.
 *
 * NEDEN VAR: PWA künyesi `icon-192.png` ve `icon-512.png` istiyordu ama
 * ikisi de `public/` içinde YOKTU. Künye eksik dosyayı sessizce geçiyor;
 * uygulama telefona kurulduğunda simge yerine boş bir kare çıkıyordu ve
 * bu ne derlemede ne testte görünüyordu.
 *
 * NEDEN ELLE ÇİZİLMİYOR: İşaret değiştiğinde PNG'leri elle yeniden
 * üretmek gerekirdi ve bir gün unutulurdu — sekme simgesi yeni,
 * ana ekran simgesi eski kalırdı. Burada ikisi de TEK kaynaktan
 * (`public/favicon.svg`) çıkıyor.
 *
 * NEDEN TARAYICI: Yeni bir görüntü kütüphanesi (sharp, resvg) kurmamak
 * için Playwright'ın zaten indirilmiş Chromium'u kullanılıyor. SVG'yi
 * gerçek bir tarayıcı çiziyor, yani sonuç kullanıcının göreceğiyle aynı.
 *
 * Kullanım: npm run icons
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from '@playwright/test';

const kok = process.cwd();
const kaynak = resolve(kok, 'public/favicon.svg');
const boyutlar = [192, 512];

const svg = readFileSync(kaynak, 'utf-8');

const tarayici = await chromium.launch();
try {
  for (const boyut of boyutlar) {
    const sayfa = await tarayici.newPage({
      viewport: { width: boyut, height: boyut },
      deviceScaleFactor: 1,
    });

    /*
     * Zemin saydam BIRAKILMIYOR: işaretin kendi yuvarlak köşeli koyu
     * karesi var ve saydam zeminde Android o kareyi yeniden kırpıyor.
     */
    await sayfa.setContent(
      `<!doctype html><html><body style="margin:0;width:${boyut}px;height:${boyut}px">${svg.replace(
        '<svg ',
        `<svg width="${boyut}" height="${boyut}" `,
      )}</body></html>`,
    );

    const png = await sayfa.screenshot({ omitBackground: true });
    const hedef = resolve(kok, `public/icon-${boyut}.png`);
    writeFileSync(hedef, png);
    console.log(`yazıldı: public/icon-${boyut}.png (${png.length} bayt)`);
    await sayfa.close();
  }
} finally {
  await tarayici.close();
}
