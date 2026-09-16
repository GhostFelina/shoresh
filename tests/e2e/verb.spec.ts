/**
 * VERB çalışma alanı.
 *
 * NEDEN VAR: Bu sayfanın sorunu bir hata değil TASARIMDI — kabuğun
 * 1024px sınırı içinde üçe bölününce tabloya ~700px kalıyordu ve
 * kullanıcı "çok dar ve basık" diye bildirdi. Böyle bir gerileme sessizce
 * geri gelebilir: kabukta tek bir sınıf değişikliği yeter. Aşağıdaki
 * testler genişliği ve bölme sayısını ÖLÇÜYOR, gözle bakmıyor.
 */
import { expect, test } from '@playwright/test';
import { ac } from './yardim';

test('geniş ekranda çalışma alanı 1024pxin ötesine açılıyor', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await ac(page, '/verb');

  const genislik = await page.evaluate(
    () => Math.round(document.querySelector('main')?.getBoundingClientRect().width ?? 0),
  );
  expect(genislik, `ana bölge ${genislik}px — hâlâ dar`).toBeGreaterThan(1300);
});

test('okuma sayfaları dar kalıyor — geniş düzen oraya sızmıyor', async ({ page }) => {
  /*
   * Genişlik sayfanın kendi kararı ve sayfadan çıkarken sıfırlanıyor.
   * Sıfırlanmazsa okuma sayfaları da genişler ve satır uzunluğu göz için
   * yorucu olur. Bu test tam olarak o sızıntıyı kolluyor.
   */
  await page.setViewportSize({ width: 1920, height: 1080 });
  await ac(page, '/verb');
  await page.goto('/kelimeler', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  const genislik = await page.evaluate(
    () => Math.round(document.querySelector('main')?.getBoundingClientRect().width ?? 0),
  );
  expect(genislik, 'geniş düzen okuma sayfasına sızmış').toBeLessThan(1200);
});

test('geniş ekranda bütün zamanlar aynı anda görünüyor', async ({ page }) => {
  /*
   * Eski sayfa aynı anda TEK zaman gösteriyordu; fiili tanımak için
   * sekmeler arasında gidip gelmek gerekiyordu. Zamanlar arasındaki
   * ilişki ancak yan yanayken görülür.
   */
  await page.setViewportSize({ width: 1920, height: 1080 });
  await ac(page, '/verb');

  const basliklar = await page.locator('main h3').allInnerTexts();
  for (const beklenen of ['ŞİMDİKİ', 'GEÇMİŞ', 'GELECEK', 'MASTAR', 'EMİR']) {
    expect(
      basliklar.some((b) => b.toLocaleUpperCase('tr').includes(beklenen)),
      `${beklenen} zaman kartı görünmüyor`,
    ).toBe(true);
  }
});

test('dar ekranda zaman seçici geri geliyor', async ({ page }) => {
  // Telefonda dört tabloyu yan yana koymak okunamaz olurdu.
  await page.setViewportSize({ width: 420, height: 900 });
  await ac(page, '/verb');

  const secici = page.getByRole('button', { name: 'Geçmiş zaman', exact: true });
  await expect(secici, 'dar ekranda zaman seçici yok').toBeVisible();

  await secici.click();
  await page.waitForTimeout(300);

  /*
   * GÖRÜNÜRLÜK ölçülüyor, metin değil. Geniş düzen `hidden lg:grid`
   * ile gizleniyor ama DOM'da DURUYOR; `toContainText` gizli düğümleri de
   * okuduğu için ilk yazımda test her zaman geçiyordu — yani hiçbir şey
   * korumuyordu.
   */
  const gorunenBasliklar = await page.locator('main h3:visible').allInnerTexts();
  const zamanBasliklari = gorunenBasliklar.filter((b) =>
    /ZAMAN|MASTAR|EMİR/i.test(b.toLocaleUpperCase('tr')),
  );
  expect(zamanBasliklari.length, 'dar ekranda birden çok zaman kartı görünüyor').toBe(1);
  expect(zamanBasliklari[0]!.toLocaleUpperCase('tr')).toContain('GEÇMİŞ');
});

test('arama fiil listesini daraltıyor', async ({ page }) => {
  await ac(page, '/verb');

  const sayac = page.locator('main span.numeric').first();
  const once = await sayac.innerText();

  await page.getByPlaceholder(/ara/).fill('yaz');
  await page.waitForTimeout(400);

  const sonra = await sayac.innerText();
  expect(sonra, 'arama listeyi daraltmadı').not.toBe(once);
  expect(Number(sonra.split('/')[0]!.trim()), 'arama sonucu boş').toBeGreaterThan(0);
});

test('binyan süzgeci çalışıyor ve temizlenebiliyor', async ({ page }) => {
  await ac(page, '/verb');

  await page.getByRole('button', { name: /Süzgeç/ }).click();
  await page.waitForTimeout(300);

  const hitpael = page.locator('main button').filter({ hasText: /^Hitpa.el\s/ }).first();
  await hitpael.click();
  await page.waitForTimeout(400);

  /*
   * Liste ROLÜYLE bulunuyor. İlk yazımda sınıf adına dayalı bir seçici
   * kullanılmıştı ve sağdaki bağlam bölmesini de içine alıp örnek
   * cümleleri "fiil etiketi" sandı.
   */
  const liste = page.getByRole('list', { name: 'Fiil listesi' });
  const etiketler = await liste.locator('li button span:last-child').allInnerTexts();
  const baskaBinyan = etiketler.filter((e) => e.trim() && !/Hitpa/.test(e));
  expect(baskaBinyan.length, `süzgeç dışı fiiller kaldı: ${baskaBinyan.slice(0, 3).join(', ')}`).toBe(
    0,
  );

  await page.getByRole('button', { name: 'temizle' }).click();
  await page.waitForTimeout(400);
  const sayac = await page.locator('main span.numeric').first().innerText();
  expect(sayac, 'süzgeç temizlenmedi').toMatch(/^\s*445/);
});

test('fiil seçimi adrese yazılıyor — bağlantı paylaşılabiliyor', async ({ page }) => {
  await ac(page, '/verb');

  const ikinci = page.locator('aside ul li button').nth(2);
  const metin = await ikinci.innerText();
  await ikinci.click();
  await page.waitForTimeout(400);

  expect(page.url(), 'seçim adrese yazılmadı').toContain('v=');

  // Aynı adres yeniden açılınca aynı fiil seçili gelmeli.
  const adres = page.url();
  await page.goto(adres, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  const kunye = await page.locator('main section').first().innerText();
  const ilkKelime = metin.split('\n')[0]!.trim();
  expect(kunye).toContain(ilkKelime);
});

test('ok tuşlarıyla listede gezinilebiliyor', async ({ page }) => {
  await ac(page, '/verb');

  const liste = page.getByRole('list', { name: 'Fiil listesi' });
  await liste.focus();

  const oncekiAdres = page.url();
  await page.keyboard.press('ArrowDown');
  await page.waitForTimeout(400);
  expect(page.url(), 'ok tuşu seçimi değiştirmedi').not.toBe(oncekiAdres);
});
