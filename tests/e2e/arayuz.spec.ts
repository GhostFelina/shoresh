/**
 * Arayüz kabuğu — tema, palet, sürüm kutusu, geçmiş paneli.
 *
 * NEDEN VAR: Bunların hepsi `localStorage` ve CSS değişkenleriyle
 * çalışıyor; birim testinde ancak saf fonksiyonları sınanabiliyor.
 * "Paleti değiştirdim ama renk değişmedi" ya da "kutu kapanmıyor" gibi
 * hatalar yalnızca burada görünür.
 */
import { expect, test } from '@playwright/test';
import { APP_VERSION, ac, konsolHatalari } from './yardim';

test('tema değişiyor ve seçim kalıcı', async ({ page }) => {
  await ac(page, '/');

  const temaOku = () => page.evaluate(() => document.documentElement.dataset.theme);
  const ilk = await temaOku();

  await page.getByRole('button', { name: /temaya geç/ }).click();
  await page.waitForTimeout(400);
  expect(await temaOku(), 'tema değişmedi').not.toBe(ilk);

  const yeni = await temaOku();
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(400);
  expect(await temaOku(), 'tema seçimi kalıcı değil').toBe(yeni);
});

test('palet değişince marka rengi gerçekten değişiyor', async ({ page }) => {
  const hatalar = konsolHatalari(page);
  await ac(page, '/');

  const rengiOku = () =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--accent-text').trim(),
    );

  const once = await rengiOku();
  expect(once, 'marka rengi tanımlı değil').not.toBe('');

  await page.getByRole('button', { name: 'Renk paleti' }).click();
  await page.waitForTimeout(300);

  // Listedeki ikinci paleti seç (ilki zaten etkin olan).
  const secenekler = page.locator('[role="menuitemradio"]');
  expect(await secenekler.count(), 'palet listesi boş').toBeGreaterThan(3);
  await secenekler.nth(1).click();
  await page.waitForTimeout(500);

  const sonra = await rengiOku();
  expect(sonra, 'palet seçildi ama renk değişmedi').not.toBe(once);

  // Kalıcılık
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  expect(await rengiOku(), 'palet seçimi kalıcı değil').toBe(sonra);

  expect(hatalar).toEqual([]);
});

test('bütün paletler okunabilir renk üretiyor', async ({ page }) => {
  /*
   * Kontrast oranları birim testinde ölçülüyor ama orada ölçülen ŞEY
   * veri. Burada gerçekten belgeye uygulanmış değerlere bakılıyor —
   * uygulama adımında bir şey kopmuşsa (yanlış değişken adı gibi) bunu
   * yalnızca bu test görür.
   */
  await ac(page, '/');
  await page.getByRole('button', { name: 'Renk paleti' }).click();
  const adet = await page.locator('[role="menuitemradio"]').count();
  await page.keyboard.press('Escape');

  for (let i = 0; i < adet; i++) {
    await page.getByRole('button', { name: 'Renk paleti' }).click();
    await page.waitForTimeout(200);
    await page.locator('[role="menuitemradio"]').nth(i).click();
    await page.waitForTimeout(300);

    const degerler = await page.evaluate(() => {
      const s = getComputedStyle(document.documentElement);
      return ['--accent-text', '--accent-text-alt', '--accent-fem', '--color-brand-400'].map((v) =>
        s.getPropertyValue(v).trim(),
      );
    });
    for (const d of degerler) {
      expect(d, `${i}. palette boş renk değişkeni`).not.toBe('');
    }
  }
});

test('sürüm kutusu açılıyor, sadece Kapat ile kapanıyor ve bir daha açılmıyor', async ({
  page,
}) => {
  // Bu test kutuyu BİLEREK işaretsiz açıyor, `ac()` yardımcısını kullanmıyor.
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => localStorage.removeItem('shoresh.seenVersion'));
  await page.reload({ waitUntil: 'domcontentloaded' });

  const kutu = page.getByRole('dialog');
  await expect(kutu, 'yeni sürümde kutu açılmadı').toBeVisible({ timeout: 10_000 });

  // Arka plana tıklamak KAPATMAMALI — yanlışlıkla kapanmasın diye.
  await page.mouse.click(5, 5);
  await page.waitForTimeout(400);
  await expect(kutu, 'arka plana tıklayınca kapandı').toBeVisible();

  await kutu.getByText('Kapat', { exact: true }).click();
  await expect(kutu).toBeHidden();

  const gorulen = await page.evaluate(() => localStorage.getItem('shoresh.seenVersion'));
  expect(gorulen, 'kapatıldı ama sürüm kaydedilmedi').toBe(APP_VERSION);

  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(800);
  expect(await page.getByRole('dialog').count(), 'kapatıldığı hâlde yeniden açıldı').toBe(0);
});

test('sürüm geçmişi paneli bütün sürümleri eskiden yeniye gösteriyor', async ({ page }) => {
  await ac(page, '/');

  await page.getByRole('button', { name: 'Sürüm geçmişi' }).click();
  const panel = page.getByRole('dialog');
  await expect(panel).toBeVisible();

  const metin = await panel.innerText();
  expect(metin, 'sürüm sayısı yazmıyor').toMatch(/\d+ sürüm/);

  // İlk girdi en eski sürüm olmalı.
  const surumler = await panel.locator('ol li').allInnerTexts();
  expect(surumler.length, 'geçmişte girdi yok').toBeGreaterThan(5);
  expect(surumler[0], 'en eski sürüm başta değil').toContain('v1.0.0');

  // Ters çevir
  await panel.getByRole('button', { name: /eskiden yeniye/ }).click();
  await page.waitForTimeout(300);
  const ters = await panel.locator('ol li').allInnerTexts();
  expect(ters[0], 'sıralama ters çevrilemedi').toContain(`v${APP_VERSION}`);

  await panel.getByRole('button', { name: 'Kapat' }).click();
  await expect(panel).toBeHidden();
});

test('altbilgide sürüm ve son güncelleme damgası var', async ({ page }) => {
  await ac(page, '/');
  const altbilgi = page.locator('footer');
  await expect(altbilgi).toContainText(`v${APP_VERSION}`);
  await expect(altbilgi).toContainText(/Son güncelleme:/);
});

test('ekran klavyesi açılıp İbranice harf yazabiliyor', async ({ page }) => {
  await ac(page, '/oyunlar/zaman-makinesi');

  const anahtar = page.getByRole('button', { name: /İbranice klavye/ });
  if ((await anahtar.count()) === 0) {
    test.skip(true, 'bu turda yazma sorusu çıkmadı');
    return;
  }
  await anahtar.click();
  await page.waitForTimeout(300);

  const harf = page.locator('button', { hasText: /^[א-ת]$/ }).first();
  expect(await harf.count(), 'klavyede harf yok').toBeGreaterThan(0);
  await harf.click();

  /*
   * Girdi seçicisi türe göre değil KONUMA göre: oyun sayfasındaki girdi
   * `dir="auto"` (yazılan metne göre yön alsın diye), öğretmen modundaki
   * `dir="rtl"`. İlk yazımda `dir="rtl"` arandı ve test uygulamayı değil
   * kendi varsayımını yanlışladı.
   */
  const girdi = page.locator('main input[type="text"], main input:not([type])').first();
  await expect(girdi, 'klavyeye basıldı ama girdiye harf düşmedi').not.toHaveValue('');
});
