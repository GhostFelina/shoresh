/**
 * Gezinme — her menü girişi gerçekten bir sayfa açıyor mu.
 *
 * NEDEN VAR: Bu tam olarak bir kez yaşandı. Menüye dört seviye sekmesi
 * ve VERB Hebrew eklendi ama rota tablosuna eklenmedi; sekmeye basınca
 * sayfa sessizce ana sayfaya düşüyordu. Kullanıcı "sol sekmelere
 * tıklayınca açılan sayfalar tam çalışmıyor" diye bildirdi.
 *
 * Birim testi menü ile rota listesinin eşleştiğini doğruluyor. Bu test
 * bir adım öteye gidiyor: sayfa gerçekten AÇILIYOR ve İÇERİK basıyor mu.
 * Rota tanımlı olup bileşen çökse birim testi bunu göremezdi.
 */
import { expect, test } from '@playwright/test';
import { ac, beklenenIcerik, konsolHatalari } from './yardim';

/** Menüdeki her adres ve o sayfada MUTLAKA görünmesi gereken bir metin. */
const SAYFALAR: Array<[string, string, RegExp]> = [
  ['Ana sayfa', '/', /Kökten İbranice/],
  ['A1', '/seviye/a1', /A1/],
  ['A2', '/seviye/a2', /A2/],
  ['B1', '/seviye/b1', /B1/],
  ['B2', '/seviye/b2', /B2/],
  ['Alef-Bet', '/alefbet', /alef/i],
  ['Harekeler', '/okuma', /hareke/i],
  ['VERB Hebrew', '/verb', /binyan/i],
  ['Binyanlar', '/binyanim', /Pa.al/],
  ['Kalıplar', '/kaliplar', /kalıp/i],
  ['Kelimeler', '/kelimeler', /kelime/i],
  ['Öğretmen Modu', '/ogretmen', /Öğretmen/],
  ['Oyunlar', '/oyunlar', /oyun/i],
  ['Ses', '/ses', /ses/i],
  ['İlerleme', '/ilerleme', /İlerleme/],
];

for (const [ad, yol, beklenen] of SAYFALAR) {
  test(`${ad} sayfası açılıyor ve içerik basıyor`, async ({ page }) => {
    const hatalar = konsolHatalari(page);
    await ac(page, yol);

    // Ana sayfaya sessizce düşmediğini doğrula.
    expect(new URL(page.url()).pathname, `${yol} başka bir adrese düştü`).toBe(yol);
    await expect(page.locator('main')).toContainText(beklenen);
    expect(hatalar, `${ad} sayfasında konsol hatası`).toEqual([]);
  });
}

test('sol menüdeki her bağlantı tıklanabiliyor ve sayfayı değiştiriyor', async ({ page }) => {
  await ac(page, '/');

  const baglantilar = page.locator('aside nav a');
  const sayi = await baglantilar.count();
  expect(sayi, 'menüde bağlantı yok').toBeGreaterThan(10);

  for (let i = 0; i < sayi; i++) {
    const link = baglantilar.nth(i);
    const hedef = await link.getAttribute('href');
    if (!hedef) continue;

    await link.click();
    await beklenenIcerik(page);
    expect(new URL(page.url()).pathname, `${hedef} bağlantısı yanlış yere gitti`).toBe(hedef);
  }
});

test('bilinmeyen adres ana sayfaya yönlendiriyor, beyaz ekran değil', async ({ page }) => {
  await ac(page, '/');
  await page.goto('/boyle-bir-sayfa-yok', { waitUntil: 'domcontentloaded' });
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/');
});

test('eski /fiiller adresi VERB sayfasına yönlendiriyor', async ({ page }) => {
  // Eski yer imleri kırılmasın diye konulmuş bir yönlendirme.
  await ac(page, '/');
  await page.goto('/fiiller', { waitUntil: 'domcontentloaded' });
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/verb');
});
