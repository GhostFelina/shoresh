/**
 * Uçtan uca test yapılandırması.
 *
 * NEDEN BİRİM TESTİ YETMİYOR: 410 birim testi motorun doğru çekim
 * ürettiğini, renklerin okunabilir olduğunu, ödül kurallarının şişmediğini
 * doğruluyor. Hiçbiri "kullanıcı düğmeye basınca ne oluyor" sorusunu
 * cevaplamıyor. Bu projede gerçekten yaşanan hataların çoğu tam orada
 * çıktı: menü rotaya bağlı değildi, ses 404 dönüyordu, grafik çubukları
 * çizilmiyordu, XP yazımı cevap kaydını eziyordu. Hepsi tarayıcıda
 * ölçülerek bulundu — o ölçümler artık testte.
 *
 * NEDEN TEK TARAYICI: Uygulama tek bir kişi için yapılıyor ve o kişi
 * Chrome kullanıyor. Üç tarayıcıda koşturmak test süresini üçe katlar,
 * karşılığında bu proje için bir şey kazandırmaz. Gerekirse `projects`
 * dizisine eklenir.
 *
 * NEDEN `webServer`: Testi çalıştıran kişinin ayrıca sunucu başlatmayı
 * hatırlaması gerekmesin. Zaten çalışan bir sunucu varsa yeniden
 * başlatılmıyor (`reuseExistingServer`).
 */
import { defineConfig, devices } from '@playwright/test';

/**
 * Port dışarıdan verilebilir: `SHORESH_PORT=5401 npm run test:e2e`.
 *
 * NEDEN GEREKLİ: `reuseExistingServer` açık ve port sabit 5400'dü. Aynı
 * depo üzerinde ikinci bir çalışma kopyası (git worktree) varken E2E
 * koşturmak, o kopyanın kodunu değil 5400'de ZATEN ÇALIŞAN sunucunun
 * kodunu test ediyordu — testler yeşil yanıyor ama başka bir uygulamayı
 * ölçüyordu. Sessiz ve tehlikeli bir yanlış; port ayrılabilir olmalı.
 */
const PORT = Number(process.env.SHORESH_PORT ?? 5400);
const BASE = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  /* Bir testin takılıp bütün koşuyu bekletmesini engeller. */
  timeout: 30_000,
  expect: { timeout: 7_000 },

  /*
   * `fullyParallel` kapalı: testlerin bir kısmı IndexedDB ve
   * localStorage'a yazıyor. Playwright her test için ayrı bağlam
   * (context) açtığı için aslında çakışmazlar, ama paralel koşuda dev
   * sunucusu ilk isteklerde modülleri derlerken yavaşlıyor ve zaman
   * aşımı riskini artırıyor. Dosya düzeyinde paralellik yeterli.
   */
  fullyParallel: false,
  workers: 2,

  /*
   * Tek deneme: yeniden denemek kırık testi gizler. Kararsız bir test
   * ya düzeltilir ya silinir; "bazen geçiyor" kabul edilmez.
   */
  retries: 0,

  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: BASE,
    /* Hata ayıklamayı kolaylaştırır, geçen testte yer kaplamaz. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
  },

  projects: [
    {
      name: 'masaustu',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
      /*
       * Mobil testleri burada KOŞMAMALI: kenar çubuğu masaüstünde sabit,
       * çekmece hiç açılmıyor. İlk yapılandırmada yalnızca telefon
       * projesine `testMatch` konmuştu ve masaüstü projesi mobil
       * dosyasını da alıp dört testi boşuna kırdı.
       */
      testIgnore: /mobil\.spec\.ts/,
    },
    {
      /*
       * Telefon ayrı bir proje: bu uygulamanın kenar çubuğu telefonda
       * çekmeceye dönüşüyor ve o geçiş bir kez kırıldı. Yalnızca gezinme
       * testleri burada koşuyor (bkz. tests/e2e/mobil.spec.ts).
       */
      name: 'telefon',
      use: { ...devices['Pixel 7'] },
      testMatch: /mobil\.spec\.ts/,
    },
  ],

  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE,
    reuseExistingServer: true,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
