import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

/**
 * Sürümü package.json'dan okuyup `src/generated/version.ts` dosyasına yazar
 * ve package.json değişince dev sunucusunu yeniler.
 *
 * NEDEN DOSYA ÜRETİYORUZ: Sürüm önce `define` ile derleme anında metin
 * değişimiyle gömülüyordu. Dev sunucusunda bu değişim uygulanmadı ve
 * tarayıcıya tanımsız bir değişken gitti. Gerçek bir modül yazmak dev,
 * derleme ve test yollarının üçünde de aynı biçimde çalışır.
 *
 * DERLEME ZAMANI DA BURADA: "Son güncelleme" bilgisinin tek dürüst
 * kaynağı derlemenin kendisidir. Elle yazılan bir tarih yayına çıkmayan
 * bir değişiklikte de güncellenir ve kullanıcıya yalan söyler.
 */
function versionModule(): Plugin {
  const pkgPath = fileURLToPath(new URL('./package.json', import.meta.url));
  const outPath = fileURLToPath(new URL('./src/generated/version.ts', import.meta.url));

  const HEADER = `/**
 * OTOMATİK ÜRETİLİR — elle düzenleme.
 *
 * \`vite.config.ts\` içindeki sürüm eklentisi bu dosyayı her sunucu
 * başlangıcında ve her derlemede yeniden yazar.
 *
 * NEDEN \`define\` KULLANILMIYOR: Sürüm önce \`define\` ile derleme anında
 * metin değişimiyle gömülüyordu. İki ayrı sorun çıkardı:
 *  1. Vite dev sunucusunda değişim uygulanmadı; tarayıcıya TANIMSIZ bir
 *     değişken gitti ve onu okuyan başlık çöktü.
 *  2. package.json değişse bile çalışan sunucu eski değeri sürdürüyordu.
 * Gerçek bir modül olarak yazılınca dev, derleme ve testte aynı yoldan
 * okunur — sihir yok, kırılacak bir şey yok.
 */
`;

  const write = (stampTime: boolean) => {
    const version = (JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string }).version;
    const current = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : '';

    /*
     * Zaman damgası YALNIZCA derlemede tazeleniyor.
     *
     * Dev sunucusunda da yazılsaydı dosya her başlatmada değişir, git
     * sürekli kirli görünür ve "son güncelleme" yayına çıkmamış bir anı
     * gösterirdi. Dev tarafında eski damga duruyor; orada zaten önemli
     * olan sürüm numarası.
     */
    const stamp = stampTime
      ? new Date().toISOString()
      : (/BUILD_TIME = '([^']*)'/.exec(current)?.[1] ?? new Date().toISOString());

    const next =
      HEADER +
      `export const APP_VERSION = '${version}';
` +
      `
/** Derlemenin yapıldığı an — ISO 8601, UTC. */
` +
      `export const BUILD_TIME = '${stamp}';
`;

    // Yalnızca gerçekten değiştiyse yaz — gereksiz yazma sonsuz yeniden
    // başlatma döngüsü kurar.
    if (next !== current) writeFileSync(outPath, next, 'utf-8');
  };

  return {
    name: 'shoresh-version-module',
    buildStart() {
      write(true);
    },
    configureServer(server) {
      write(false);
      server.watcher.add(pkgPath);
      server.watcher.on('change', (file) => {
        if (file !== pkgPath) return;
        write(false);
        server.config.logger.info('package.json degisti - surum modulu yenilendi');
      });
    },
  };
}

/**
 * Seslendirme vekilini geliştirme sunucusunda da çalıştırır.
 *
 * `api/tts.js` yayında Vercel işlevi olarak koşuyor. Geliştirme sunucusunda
 * böyle bir çalışma ortamı yok; bu eklenti aynı işlevi Vite'ın ara katmanına
 * bağlıyor. Olmasaydı ses yalnızca yayında çalışır, yerelde sessiz kalırdı —
 * ve fark tam da hata ararken ortaya çıkardı.
 */
function ttsDevEndpoint(): Plugin {
  return {
    name: 'shoresh-tts-dev',
    configureServer(server) {
      /*
       * `.env.local` degerlerini `process.env`e tasi.
       *
       * Vite bu dosyayi yalnizca `import.meta.env` icin ve yalnizca
       * `VITE_` onekli degiskenler icin okur. Sunucu tarafindaki uc
       * noktalar (`api/*.js`) ise `process.env` bekliyor — tasinmazsa
       * form yalnizca yayinda denenebilir, yerelde hep "kurulum eksik"
       * derdi.
       *
       * Gizli anahtarlar burada ISTEMCIYE GITMIYOR: yalnizca gelistirme
       * sunucusunun kendi surecine yaziliyor.
       */
      const env = loadEnv(server.config.mode, process.cwd(), '');
      for (const [k, v] of Object.entries(env)) {
        if (!(k in process.env)) process.env[k] = v;
      }

      server.middlewares.use('/api/tts', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/tts.js');
        await (mod.default as (q: unknown, r: unknown) => Promise<void>)(req, res);
      });
      // Geri bildirim ucu da yayındaki gibi davransın; olmasaydı form
      // yalnızca canlıda denenebilirdi.
      server.middlewares.use('/api/feedback', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/feedback.js');
        await (mod.default as (q: unknown, r: unknown) => Promise<void>)(req, res);
      });
      /*
       * Yapay zekâ ucu da yerelde çalışsın. Olmasaydı öğretmenin konuşan
       * tarafı yalnızca yayında denenebilir, yereldeki her deneme
       * "kurulum eksik" derdi — ve gerçekten eksik mi, yoksa uç mu yok,
       * ayırt edilemezdi.
       */
      server.middlewares.use('/api/ai', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/ai.js');
        await (mod.default as (q: unknown, r: unknown) => Promise<void>)(req, res);
      });
    },
  };
}

export default defineConfig({
  plugins: [
    versionModule(),
    ttsDevEndpoint(),
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Shoresh',
        short_name: 'Shoresh · שורש',
        description: 'Modern İbranice — Alef-Bet, okuma, binyan çekim motoru, SRS, çevrimdışı.',
        theme_color: '#05070d',
        background_color: '#05070d',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,woff2}'],
        cleanupOutdatedCaches: true,
        /**
         * Seslendirme klipleri için kalıcı önbellek.
         *
         * NEDEN SERVICE WORKER ÜZERİNDEN: Seslendirme uç noktası CORS
         * başlığı göndermiyor, bu yüzden sayfa onu `fetch` ile okuyup
         * saklayamaz — gelen yanıt "opak"tır, içeriği JavaScript'e kapalıdır.
         * Ama service worker opak yanıtı önbelleğe KOYABİLİR ve sonra
         * `<audio>` isteğine yanıt olarak verebilir; tarayıcının medya
         * hattı onu sorunsuz çalar.
         *
         * Sonuç: bir kez indirilen klip çevrimdışı da çalışır. "Ses paketini
         * indir" düğmesi bunu topluca yapar.
         */
        runtimeCaching: [
          {
            urlPattern: /\/api\/tts\?/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'shoresh-ses',
              expiration: {
                maxEntries: 3000,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                // Opak yanıtın durum kodu 0'dır; listeye alınmazsa
                // hiçbir klip önbelleğe girmez.
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          db: ['dexie', 'dexie-react-hooks'],
          srs: ['ts-fsrs'],
        },
      },
    },
  },
});
