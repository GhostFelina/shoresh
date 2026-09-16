/**
 * Seviye tespit sınavı — uçtan uca.
 *
 * NEDEN BİRİM TESTİ YETMİYOR: Sınav mantığı (`placement.ts`) ayrıca ve
 * ayrıntılı test ediliyor; orada ölçülen şey SAYILAR. Burada ölçülen
 * şey öğrencinin yaşadığı şey: on sekiz soru gerçekten tıklanabiliyor
 * mu, sınav sonunda karne çıkıyor mu, "sınıfına geç" dediğinde seviye
 * gerçekten uygulanıyor mu. İkisi ayrı sorular — mantık doğruyken
 * arayüz üçüncü soruda takılabilir ve birim testi bunu göremez.
 */
import { expect, test } from '@playwright/test';
import { ac, ilerlemeyiSil, konsolHatalari } from './yardim';

/**
 * Bir soruyu cevaplar.
 *
 * İki soru biçimi var: şıklı ve sözcük dizme. Hangisi geldiğini soru
 * ekranından anlıyoruz — sıra sınava göre değişiyor, testin sırayı
 * varsayması yanlış olur.
 */
async function soruyuCevapla(page: import('@playwright/test').Page): Promise<void> {
  const dizmeDugmesi = page.getByRole('button', { name: /sözcük kaldı|Cevabı ver/ });

  if (await dizmeDugmesi.isVisible().catch(() => false)) {
    // Havuzdaki sözcükleri sırayla yerleştir; doğruluğu önemli değil,
    // burada ölçülen şey akışın yürüyüp yürümediği.
    for (let i = 0; i < 8; i++) {
      const token = page.locator('div[dir="rtl"] > button').first();
      if (!(await token.isVisible().catch(() => false))) break;
      await token.click();
    }
    await page.getByRole('button', { name: 'Cevabı ver' }).click();
    return;
  }

  await page.locator('ul li button').first().click();
}

test('sınav baştan sona yürüyor ve karne çıkarıyor', async ({ page }) => {
  const hatalar = konsolHatalari(page);
  await ac(page, '/');
  await ilerlemeyiSil(page);
  await ac(page, '/ogretmen/seviye-tespit');

  // İlk soru ekranda mı?
  await expect(page.getByText(/soru 1 \/ 18/)).toBeVisible();

  for (let i = 0; i < 18; i++) {
    await soruyuCevapla(page);
    await page.waitForTimeout(260);
  }

  // Karne: seviye ve beceri haritası.
  await expect(page.getByText('Seviyen', { exact: true })).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText('Beceri haritası')).toBeVisible();
  await expect(page.getByRole('button', { name: /sınıfına geç/ })).toBeVisible();

  expect(hatalar, 'sınav sırasında konsol hatası').toEqual([]);
});

test('ölçüm kaydediliyor — sınava dönünce karne açılıyor, sınav baştan başlamıyor', async ({
  page,
}) => {
  await ac(page, '/');
  await ilerlemeyiSil(page);
  await ac(page, '/ogretmen/seviye-tespit');

  for (let i = 0; i < 18; i++) {
    await soruyuCevapla(page);
    await page.waitForTimeout(260);
  }
  await expect(page.getByRole('button', { name: /sınıfına geç/ })).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /sınıfına geç/ }).click();

  // Sınıfa dönüldü ve seviye kartı artık ölçümü gösteriyor.
  await expect(page).toHaveURL(/\/ogretmen$/);
  await expect(page.locator('main')).toContainText(/tarihinde ölçüldü/);

  /*
   * Sınav bağlantısına tekrar basınca SINAV DEĞİL KARNE açılmalı.
   * Doğrudan sınava sokulsaydı, sonucunu görmek isteyen biri mevcut
   * ölçümü kazara silerdi.
   */
  await page.goto('/ogretmen/seviye-tespit');
  await expect(page.getByText('Beceri haritası')).toBeVisible({ timeout: 10_000 });
});
