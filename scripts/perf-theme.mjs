/**
 * Tema geçişi maliyet ölçeri.
 *
 * NEDEN VAR: "Tema geçişi kasıyor" bir histir; hisle kod düzeltilmez.
 * Bu betik geçişin GERÇEKTEN ne kadar sürdüğünü tarayıcının kendi
 * ölçüleriyle söylüyor: stil yeniden hesaplama süresi, uzun görev
 * (long task) sayısı ve tıklamadan ilk boyamaya kadar geçen süre.
 *
 * Aynı ölçüm düzeltmeden önce ve sonra koşturulur; "daha iyi oldu"
 * cümlesi ancak iki sayı arasında fark varsa kurulabilir.
 *
 * Kullanım:  node scripts/perf-theme.mjs [taban-adres]
 */
import { chromium } from '@playwright/test';
import { readFile } from 'node:fs/promises';

const BASE = process.argv[2] ?? 'http://localhost:5400';

const APP_VERSION = JSON.parse(
  await readFile(new URL('../package.json', import.meta.url), 'utf8'),
).version;

/** Ağır sayfalar seçildi: kasma boş sayfada değil, kalabalık sayfada olur. */
const PAGES = [
  ['ogretmen', '/ogretmen'],
  ['verb', '/verb'],
  ['kelimeler', '/kelimeler'],
];

async function measure(page, path) {
  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(400);

  const domNodes = await page.evaluate(() => document.querySelectorAll('*').length);

  // Uzun görevleri (50ms+) topla — ana iş parçacığının kilitlendiği anlar.
  await page.evaluate(() => {
    window.__longTasks = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) window.__longTasks.push(entry.duration);
    }).observe({ entryTypes: ['longtask'] });
  });

  const button = page.locator('button[aria-label*="temaya geç"]').first();

  const result = await page.evaluate(async () => {
    const root = document.documentElement;
    const before = root.dataset.theme;
    const t0 = performance.now();

    document.querySelector('button[aria-label*="temaya geç"]')?.click();

    // İki kare bekle: ilk kare stil hesabını, ikincisi boyamayı kapsar.
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const paintMs = performance.now() - t0;

    // Geçiş sınıfı 320ms sonra kalkıyor; o süre boyunca her öğe animasyonlu.
    await new Promise((r) => setTimeout(r, 500));

    return { paintMs, before, after: root.dataset.theme };
  });

  const longTasks = await page.evaluate(() => window.__longTasks ?? []);
  await button.waitFor({ state: 'visible' }).catch(() => {});

  return {
    domNodes,
    paintMs: Math.round(result.paintMs),
    switched: result.before !== result.after,
    longTasks: longTasks.map((d) => Math.round(d)),
    blockedMs: Math.round(longTasks.reduce((s, d) => s + d, 0)),
  };
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  locale: 'tr-TR',
});
await context.addInitScript((v) => {
  try {
    localStorage.setItem('shoresh.seenVersion', v);
    localStorage.setItem('shoresh.theme', 'dark');
  } catch {
    /* yok sayılır */
  }
}, APP_VERSION);

const page = await context.newPage();

console.log('sayfa           düğüm   boyama   engellenen   uzun görevler');
console.log('─'.repeat(64));
for (const [name, path] of PAGES) {
  const r = await measure(page, path);
  console.log(
    `${name.padEnd(15)} ${String(r.domNodes).padStart(5)}   ${String(r.paintMs).padStart(5)}ms  ` +
      `${String(r.blockedMs).padStart(7)}ms   ${r.longTasks.join(', ') || '—'}` +
      (r.switched ? '' : '   [TEMA DEĞİŞMEDİ]'),
  );
}

await browser.close();
