/**
 * Telefon — kenar çubuğu çekmeceye dönüşüyor.
 *
 * NEDEN AYRI DOSYA VE AYRI PROJE: Masaüstünde kenar çubuğu sabit,
 * telefonda gizli bir çekmece. Yani telefonda gezinme BAŞKA bir kod
 * yolundan geçiyor ve masaüstü testleri o yolu hiç çalıştırmıyor.
 * Çekmece bir kez açılıp kapanmadığında ya da arkadaki sayfa kaydığında
 * uygulama telefonda kullanılamaz hâle gelir.
 */
import { expect, test } from '@playwright/test';
import { ac, beklenenIcerik } from './yardim';

test('menü düğmesi çekmeceyi açıyor ve gezinme çalışıyor', async ({ page }) => {
  await ac(page, '/');

  // Masaüstü kenar çubuğu telefonda görünmemeli.
  await expect(page.locator('aside')).toBeHidden();

  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.waitForTimeout(300);

  /*
   * `:visible` ŞART: masaüstü kenar çubuğu telefonda gizlense de DOM'da
   * duruyor ve aynı bağlantıları taşıyor. Sade bir `nav a` seçicisi
   * DOM sırasına göre GİZLİ olanı seçiyor ve test "bağlantı görünmüyor"
   * diye kırılıyor — oysa çekmecedeki bağlantı ekranda duruyor.
   */
  const baglanti = page.locator('nav:visible a').filter({ hasText: 'Kelimeler' }).first();
  await expect(baglanti).toBeVisible();
  await baglanti.click();

  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/kelimeler');

  // Gezindikten sonra çekmece kapanmalı, yoksa içeriği örter.
  await expect(page.getByRole('button', { name: 'Menüyü aç' })).toBeVisible();
});

test('çekmece açıkken arkadaki sayfa kaymıyor', async ({ page }) => {
  /*
   * Çekmece açıkken gövde kaydırması kapatılıyor. Kapatılmazsa kullanıcı
   * çekmeceyi kaydırmaya çalışırken arkadaki sayfa kayıyor ve geri
   * döndüğünde nerede olduğunu kaybediyor.
   */
  await ac(page, '/kelimeler');
  await page.getByRole('button', { name: 'Menüyü aç' }).click();
  await page.waitForTimeout(300);

  const overflow = await page.evaluate(() => document.body.style.overflow);
  expect(overflow, 'çekmece açıkken gövde kaydırması açık kalmış').toBe('hidden');

  // "Kapat" iki öğeyle eşleşiyor: çekmecenin arkasındaki örtü
  // ("Menüyü kapat") ve çarpı düğmesi. Tam eşleşme şart.
  await page.getByRole('button', { name: 'Kapat', exact: true }).click();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.body.style.overflow)).not.toBe('hidden');
});

test('sayfa yatay kaymıyor — içerik ekrana sığıyor', async ({ page }) => {
  /*
   * Telefonda yatay kaydırma, genişliği sabitlenmiş bir öğenin taştığını
   * gösterir. İbranice metin ve geniş tablolar bu riski taşıyor.
   */
  for (const yol of ['/', '/verb', '/kelimeler', '/ogretmen', '/ilerleme']) {
    await ac(page, yol);
    const tasma = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(tasma, `${yol} sayfası ${tasma}px yatay taşıyor`).toBeLessThanOrEqual(2);
  }
});

test('üst bant telefonda da sürüm ve ayar düğmelerini gösteriyor', async ({ page }) => {
  await ac(page, '/');
  await expect(page.getByRole('button', { name: 'Sürüm geçmişi' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Renk paleti' })).toBeVisible();
});
