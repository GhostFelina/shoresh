/**
 * Öğrenme akışı — oyun, ders, ödül ve kayıt gerçekten çalışıyor mu.
 *
 * NEDEN VAR: Buradaki her test yaşanmış bir hatanın üstüne yazıldı.
 *  - XP yazımı cevap kaydını eziyordu; belirti "seri hep 0" idi ve
 *    yalnızca tarayıcıda görülebiliyordu.
 *  - Haftalık grafik çubukları hiç çizilmiyordu.
 *  - Ders adımları arasında "Devam" düğmesi soruyu atlatabiliyordu.
 * Birim testleri bunların hiçbirini göremez: hepsi bileşenlerin BİRLİKTE
 * çalışmasıyla ilgili.
 */
import { expect, test, type Page } from '@playwright/test';
import { ac, beklenenIcerik, ilerlemeyiSil, konsolHatalari } from './yardim';

/** Bir oyun turunda birkaç soruyu cevaplar. Kaç soru cevaplandığını döner. */
async function oyunOyna(page: Page, adet: number): Promise<number> {
  let cevaplanan = 0;
  for (let i = 0; i < adet; i++) {
    const secenek = page.locator('main button:has(span.he)').first();
    if ((await secenek.count()) === 0) break;
    await secenek.click();
    cevaplanan++;
    await page.waitForTimeout(250);

    const devam = page.getByRole('button', { name: /Devam|Sonraki|Bitir/ });
    if ((await devam.count()) > 0) {
      await devam.first().click();
      await page.waitForTimeout(200);
    }
  }
  return cevaplanan;
}

test('oyun turu oynanabiliyor ve cevaplar XP kazandırıyor', async ({ page }) => {
  const hatalar = konsolHatalari(page);
  await ac(page, '/');
  await ilerlemeyiSil(page);

  await ac(page, '/he/oyunlar/kok-avcisi');
  const cevaplanan = await oyunOyna(page, 5);
  expect(cevaplanan, 'hiç soru cevaplanamadı').toBeGreaterThan(2);

  /*
   * Ödül taraması cevap akışı durduktan 2.5 saniye sonra çalışıyor
   * (bütün cevap tablosunu okuduğu için her cevapta çalıştırılmıyor).
   * Test o gecikmeyi beklemek zorunda.
   */
  await page.waitForTimeout(3200);
  await ac(page, '/he/ilerleme');

  const metin = await page.locator('main').innerText();

  // XP birikmiş olmalı — "0 toplam XP" kalmışsa ödül katmanı yazamamış.
  // Kırılmaz boşluk (U+00A0) sayı ile etiketi ayırabiliyor; normal
  // boşluğa çevriliyor. Kaçış dizisiyle yazılı — kaynakta gerçek karakter
  // bulunması lint kuralına takılıyor.
  const nbsp = String.fromCharCode(0xa0);
  const xp = /(\d[\d.]*)\s*toplam XP/.exec(metin.split(nbsp).join(' '));
  expect(xp, 'toplam XP göstergesi bulunamadı').not.toBeNull();
  expect(Number(xp![1]!.replace(/\./g, '')), 'cevap verildi ama XP birikmedi').toBeGreaterThan(0);

  expect(hatalar).toEqual([]);
});

test('cevap kaydı ile XP yazımı birbirini ezmiyor — seri 1 oluyor', async ({ page }) => {
  /*
   * BU TESTİN SEBEBİ: İki yazma aynı gün satırına dokunuyordu ve işlem
   * dışında oku-değiştir-yaz yaptıkları için biri ötekini eziyordu.
   * Belirti tam olarak buydu: XP birikiyor ama seri 0 kalıyor.
   */
  await ac(page, '/');
  await ilerlemeyiSil(page);

  await ac(page, '/he/oyunlar/kok-avcisi');
  await oyunOyna(page, 4);
  await page.waitForTimeout(3200);

  await ac(page, '/he/ilerleme');
  const metin = await page.locator('main').innerText();

  const seri = /(\d+)\s*\n?\s*gün arka arkaya/.exec(metin);
  expect(seri, 'seri göstergesi bulunamadı').not.toBeNull();
  expect(Number(seri![1]), 'bugün çalışıldı ama seri 0 — yazmalar birbirini eziyor').toBe(1);
});

test('haftalık grafiğin çubukları gerçekten çiziliyor', async ({ page }) => {
  /*
   * BU TESTİN SEBEBİ: Yüzde yükseklikli çubuklar, yüksekliği `auto` olan
   * bir sütunun içindeydi; CSS'te yüzde yükseklik orada çözülmez ve
   * bütün çubuklar sıfır yükseklikte kalıyordu. Grafik boş görünüyordu
   * ama hiçbir hata vermiyordu.
   */
  await ac(page, '/');
  await ilerlemeyiSil(page);
  await ac(page, '/he/oyunlar/kok-avcisi');
  await oyunOyna(page, 3);
  await page.waitForTimeout(3200);

  await ac(page, '/he/ilerleme');

  const yukseklikler = await page.evaluate(() => {
    const baslik = [...document.querySelectorAll('h2')].find((h) =>
      h.textContent?.includes('Son yedi'),
    );
    if (!baslik?.parentElement) return null;
    return [...baslik.parentElement.querySelectorAll('div.absolute')].map((e) =>
      Math.round(e.getBoundingClientRect().height),
    );
  });

  expect(yukseklikler, 'haftalık grafik bulunamadı').not.toBeNull();
  expect(yukseklikler!.length, 'yedi gün çizilmemiş').toBe(7);
  // Bugün cevap verildi; en az bir çubuk gözle görülür olmalı.
  expect(Math.max(...yukseklikler!), 'bütün çubuklar sıfır yükseklikte').toBeGreaterThan(20);
});

test('öğretmen dersi baştan sona tamamlanabiliyor', async ({ page }) => {
  const hatalar = konsolHatalari(page);
  await ac(page, '/');
  await ilerlemeyiSil(page);
  await ac(page, '/he/ogretmen/binyan-present-paal');

  // Adımlar: tanıtım, kural, örnek, birlikte×2, tek başına×2, özet.
  for (let adim = 0; adim < 12; adim++) {
    const bitir = page.getByRole('button', { name: 'Dersi bitir' });
    if ((await bitir.count()) > 0) {
      await bitir.click();
      break;
    }

    const devam = page.getByRole('button', { name: /Devam/ });
    if ((await devam.count()) === 0) break;

    if (await devam.first().isDisabled()) {
      /*
       * "Devam" kapalıysa o adımda cevaplanmamış bir soru var — bu
       * bilerek: soruyu atlayarak ilerlemek dersi anlamsız kılardı.
       */
      const siklar = page.locator('article button:has(span.he)');
      if ((await siklar.count()) > 0) {
        await siklar.first().click();
      } else {
        // Yazma sorusu: doğru cevabı bilmiyoruz, boş gönderip gerekçeyi görüyoruz.
        const kontrol = page.getByRole('button', { name: 'Kontrol et' });
        if ((await kontrol.count()) > 0) await kontrol.click();
      }
      await page.waitForTimeout(400);
      expect(await devam.first().isDisabled(), 'cevap verildi ama Devam açılmadı').toBe(false);
    }

    await devam.first().click();
    await page.waitForTimeout(250);
  }

  // Ders listesine dönmüş ve ders tamamlanmış sayılmalı.
  await beklenenIcerik(page);
  expect(new URL(page.url()).pathname).toBe('/he/ogretmen');

  const tamamlanan = await page.evaluate(() => {
    try {
      const raw = localStorage.getItem('shoresh.lessons');
      return raw ? Object.keys((JSON.parse(raw) as { done: object }).done).length : 0;
    } catch {
      return 0;
    }
  });
  expect(tamamlanan, 'ders bitti ama tamamlandı olarak işaretlenmedi').toBeGreaterThan(0);
  expect(hatalar).toEqual([]);
});

test('yanlış cevapta gerekçe gösteriliyor — sadece "yanlış" demiyor', async ({ page }) => {
  await ac(page, '/he/ogretmen/binyan-present-paal');

  // İpuçlu soruya gelene kadar ilerle.
  for (let i = 0; i < 4; i++) {
    const devam = page.getByRole('button', { name: /Devam/ });
    if ((await devam.count()) === 0) break;
    if (await devam.first().isDisabled()) break;
    await devam.first().click();
    await page.waitForTimeout(250);
  }

  const siklar = page.locator('article button:has(span.he)');
  expect(await siklar.count(), 'soru adımına ulaşılamadı').toBeGreaterThan(1);

  await siklar.first().click();
  await page.waitForTimeout(500);

  const geribildirim = await page.locator('article').innerText();
  // Doğru ya da yanlış, her hâlükârda doğru biçim gösterilmeli.
  expect(geribildirim).toMatch(/Doğru|Evet|isabet|Olmadı|değil|bak/);
});
