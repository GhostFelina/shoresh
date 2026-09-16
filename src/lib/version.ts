/**
 * Uygulama sürümü — tek okuma noktası.
 *
 * Değer `src/generated/version.ts` dosyasından gelir; o dosyayı
 * `vite.config.ts` içindeki sürüm eklentisi package.json'dan üretir.
 * Arayüz doğrudan üretilen dosyaya değil buraya bakar, böylece üretim
 * biçimi ileride değişirse tek yer düzeltilir.
 */
export { APP_VERSION } from '@/generated/version';
