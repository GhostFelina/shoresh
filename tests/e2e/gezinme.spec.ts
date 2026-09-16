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
  ['Ana sayfa', '/he', /Kökten İbranice/],
  ['A1', '/he/seviye/a1', /A1/],
  ['A2', '/he/seviye/a2', /A2/],
  ['B1', '/he/seviye/b1', /B1/],
  ['B2', '/he/seviye/b2', /B2/],
  ['Alef-Bet', '/he/alefbet', /alef/i],
  ['Harekeler', '/he/okuma', /hareke/i],
  ['VERB Hebrew', '/he/verb', /binyan/i],
  ['Binyanlar', '/he/binyanim', /Pa.al/],
  ['Kalıplar', '/he/kaliplar', /kalıp/i],
  ['Kelimeler', '/he/kelimeler', /kelime/i],
  ['Öğretmen Modu', '/he/ogretmen', /Öğretmen/],
  ['Oyunlar', '/he/oyunlar', /oyun/i],
  ['Ses', '/he/ses', /ses/i],
  ['İlerleme', '/he/ilerleme', /İlerleme/],
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

test('bilinmeyen adres dilin ana sayfasına yönlendiriyor, beyaz ekran değil', async ({ page }) => {
  await ac(page, '/');
  await page.goto('/boyle-bir-sayfa-yok', { waitUntil: 'domcontentloaded' });
  await beklenenIcerik(page);
  // İki sıçrama: /boyle-bir-sayfa-yok → /he/boyle-bir-sayfa-yok → /he
  expect(new URL(page.url()).pathname).toBe('/he');
});

test('kök adres öğrenilen dile gidiyor', async ({ page }) => {
  /*
   * BU TESTİN SEBEBİ: Adresler dil önekli hâle getirildi. Kök adres
   * boşta kalsaydı uygulama açılışta beyaz ekran verirdi — ve bu
   * yalnızca gerçek tarayıcıda görülürdü.
   */
  await ac(page, '/');
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/he');
});

test('dil önekli ama var olmayan sayfa o dilin ana sayfasına düşüyor', async ({ page }) => {
  await ac(page, '/');
  await page.goto('/he/boyle-bir-sayfa-yok', { waitUntil: 'domcontentloaded' });
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/he');
});

test('eski önseksiz adresler aynı sayfanın dil önekli hâline gidiyor', async ({ page }) => {
  /*
   * Uygulama bir süre '/verb', '/oyunlar' gibi adreslerle yayındaydı.
   * O bağlantılar yer imlerinde duruyor olabilir; ana sayfaya atmak
   * yerine aynı sayfayı açmalı.
   */
  const eskiler: Array<[string, string]> = [
    ['/verb', '/he/verb'],
    ['/oyunlar', '/he/oyunlar'],
    ['/ilerleme', '/he/ilerleme'],
    ['/seviye/a1', '/he/seviye/a1'],
  ];

  await ac(page, '/');
  for (const [eski, yeni] of eskiler) {
    await page.goto(eski, { waitUntil: 'domcontentloaded' });
    await beklenenIcerik(page);
    expect(new URL(page.url()).pathname, `${eski} yanlış yere gitti`).toBe(yeni);
  }
});

test('gelen kutusu dil dışında kalıyor — önek almıyor', async ({ page }) => {
  // Gelen kutusu öğrenilen dile ait değil; /he/gelen-kutusu olmamalı.
  await ac(page, '/gelen-kutusu');
  expect(new URL(page.url()).pathname).toBe('/gelen-kutusu');
});

test('öğrenilen dil kenar çubuğunda yazıyor ve seçici çalışıyor', async ({ page }) => {
  /*
   * Kullanıcının istediği: "mantıklı bir konumda Hebrew yazsın, daha
   * sonra Korean gelecek". Seçicinin kendisi o yerde duruyor mu ve
   * hangi dilde olduğumuzu söylüyor mu — bunu ancak açılmış sayfada
   * görebiliriz.
   */
  await ac(page, '/he');
  const secici = page.locator('aside').getByLabel('Öğrenilen dil');
  await expect(secici).toBeVisible();
  await expect(secici).toContainText('Hebrew');
  await expect(secici).toContainText('İbranice');
});

test('eski /fiiller adresi VERB sayfasına yönlendiriyor', async ({ page }) => {
  // Eski yer imleri kırılmasın diye konulmuş bir yönlendirme.
  await ac(page, '/');
  await page.goto('/fiiller', { waitUntil: 'domcontentloaded' });
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/he/verb');
});
