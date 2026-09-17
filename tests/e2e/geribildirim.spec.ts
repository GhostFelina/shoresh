/**
 * Geri bildirim formu.
 *
 * NEDEN VAR: Bu formun tek işi ULAŞMAK. Sessizce başarısız olan bir
 * bildirim formu, form olmamasından daha kötüdür — kullanıcı derdini
 * anlattığını sanır ve kimse duymaz. Testler bu yüzden yalnızca kutunun
 * açıldığını değil, sunucunun gerçekten ne dediğini de sınıyor.
 *
 * KURULUMDAN BAĞIMSIZ: Testler "gönderim başarılı olmalı" demiyor —
 * ortam değişkenleri kurulu olmayabilir. Bunun yerine sistemin her iki
 * durumda da DÜRÜST davrandığını doğruluyorlar: kuruluysa gönderiyor,
 * değilse önceden söylüyor.
 */
import { expect, test } from '@playwright/test';
import { ac } from './yardim';

async function kurulumDurumu(page: import('@playwright/test').Page): Promise<boolean> {
  return page.evaluate(async () => {
    const r = await fetch('/api/feedback?probe=1');
    const d = (await r.json()) as { ready?: boolean };
    return Boolean(d.ready);
  });
}

test('yoklama ucu kimlik istemeden durum söylüyor', async ({ page }) => {
  await ac(page, '/he');
  const sonuc = await page.evaluate(async () => {
    const r = await fetch('/api/feedback?probe=1');
    return { durum: r.status, govde: (await r.json()) as Record<string, unknown> };
  });
  expect(sonuc.durum).toBe(200);
  expect(typeof sonuc.govde.ready).toBe('boolean');
});

test('geri bildirim düğmesi üst bantta ve kutuyu açıyor', async ({ page }) => {
  await ac(page, '/he');
  await page.getByRole('button', { name: 'Geri bildirim gönder' }).click();

  const kutu = page.getByRole('dialog');
  await expect(kutu).toBeVisible();
  await expect(kutu).toContainText('Geri bildirim');

  // Dört tür de seçilebilmeli.
  for (const t of ['Hata', 'İstek', 'Öneri', 'Soru']) {
    await expect(kutu.getByRole('button', { name: t, exact: true })).toBeVisible();
  }
});

test('boş mesajla gönderilemiyor', async ({ page }) => {
  await ac(page, '/he');
  await page.getByRole('button', { name: 'Geri bildirim gönder' }).click();

  const gonder = page.getByRole('button', { name: /Gönder/ });
  await expect(gonder, 'boş formda gönder düğmesi açık').toBeDisabled();
});

test('kurulum eksikse ÖNCEDEN söylüyor, yazdırdıktan sonra değil', async ({ page }) => {
  await ac(page, '/he');
  const hazir = await kurulumDurumu(page);

  await page.getByRole('button', { name: 'Geri bildirim gönder' }).click();
  const kutu = page.getByRole('dialog');
  await kutu.locator('textarea').fill('deneme bildirimi');

  if (hazir) {
    await expect(kutu.getByRole('button', { name: /Gönder/ })).toBeEnabled();
  } else {
    await expect(kutu, 'kurulum eksik uyarısı görünmüyor').toContainText(
      /sunucusu henüz kurulmadı/i,
    );
    await expect(
      kutu.getByRole('button', { name: /Gönder/ }),
      'kurulum eksikken gönder düğmesi açık',
    ).toBeDisabled();
  }
});

test('yazılan metin taslak olarak saklanıyor', async ({ page }) => {
  // Kaybolan bir yazıyı kimse ikinci kez yazmaz.
  await ac(page, '/he');
  await page.getByRole('button', { name: 'Geri bildirim gönder' }).click();
  await page.getByRole('dialog').locator('textarea').fill('yarım kalan bildirim');
  await page.waitForTimeout(300);

  await page.getByRole('dialog').getByRole('button', { name: 'Kapat' }).click();
  await page.getByRole('button', { name: 'Geri bildirim gönder' }).click();

  await expect(page.getByRole('dialog').locator('textarea')).toHaveValue('yarım kalan bildirim');
});

test('sunucu geçersiz türü ve kısa mesajı reddediyor', async ({ page }) => {
  /*
   * Doğrulama İSTEMCİDE değil sunucuda da olmalı: istemciyi atlayan biri
   * için istemci doğrulaması hiç yoktur.
   */
  await ac(page, '/he');
  const sonuc = await page.evaluate(async () => {
    const gonder = (body: unknown) =>
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }).then((r) => r.status);

    return {
      gecersizTur: await gonder({ kind: 'saldiri', message: 'yeterince uzun bir mesaj' }),
      kisaMesaj: await gonder({ kind: 'hata', message: 'a' }),
    };
  });

  /*
   * Kurulum eksikse 503 dönüyor ve doğrulamaya hiç gelinmiyor; o da
   * kabul edilebilir bir sonuç. Kabul EDİLEMEZ olan 2xx.
   */
  expect(sonuc.gecersizTur, 'geçersiz tür kabul edildi').toBeGreaterThanOrEqual(400);
  expect(sonuc.kisaMesaj, 'çok kısa mesaj kabul edildi').toBeGreaterThanOrEqual(400);
});

test('gelen kutusu parolasız açılmıyor', async ({ page }) => {
  await ac(page, '/gelen-kutusu');
  await expect(page.locator('main')).toContainText(/parolayla açılıyor/i);

  const durum = await page.evaluate(async () => {
    const bos = await fetch('/api/feedback');
    const yanlis = await fetch('/api/feedback?key=kesinlikle-yanlis-parola');
    return { bos: bos.status, yanlis: yanlis.status };
  });

  expect(durum.bos, 'parolasız istek kabul edildi').toBeGreaterThanOrEqual(400);
  expect(durum.yanlis, 'yanlış parola kabul edildi').toBeGreaterThanOrEqual(400);
});

test('gelen kutusu menüde görünmüyor — öğrenciye ait bir sayfa değil', async ({ page }) => {
  await ac(page, '/he');
  const adresler = await page.locator('aside nav a').evaluateAll((els) =>
    els.map((e) => e.getAttribute('href')),
  );
  expect(adresler, 'gelen kutusu menüye sızmış').not.toContain('/gelen-kutusu');
});
