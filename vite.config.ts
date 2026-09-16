import { defineConfig, type Plugin } from 'vite';
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
 */
function versionModule(): Plugin {
  const pkgPath = fileURLToPath(new URL('./package.json', import.meta.url));
  const outPath = fileURLToPath(new URL('./src/generated/version.ts', import.meta.url));

  const write = () => {
    const version = (JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string }).version;
    const current = existsSync(outPath) ? readFileSync(outPath, 'utf-8') : '';
    const next = current.replace(/APP_VERSION = '[^']*'/, `APP_VERSION = '${version}'`);
    // Yalnızca gerçekten değiştiyse yaz — gereksiz yazma sonsuz yeniden
    // başlatma döngüsü kurar.
    if (next !== current && next.includes(version)) writeFileSync(outPath, next, 'utf-8');
  };

  return {
    name: 'shoresh-version-module',
    buildStart() {
      write();
    },
    configureServer(server) {
      write();
      server.watcher.add(pkgPath);
      server.watcher.on('change', (file) => {
        if (file !== pkgPath) return;
        write();
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
      server.middlewares.use('/api/tts', async (req, res) => {
        const mod = await server.ssrLoadModule('/api/tts.js');
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
