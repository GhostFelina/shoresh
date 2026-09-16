/**
 * Uygulama sürümü — tek okuma noktası.
 *
 * Değer `src/generated/version.ts` dosyasından gelir; o dosyayı
 * `vite.config.ts` içindeki sürüm eklentisi package.json'dan üretir.
 * Arayüz doğrudan üretilen dosyaya değil buraya bakar, böylece üretim
 * biçimi ileride değişirse tek yer düzeltilir.
 */
export { APP_VERSION, BUILD_TIME } from '@/generated/version';

/**
 * Derleme anını Türkçe okunur biçime çevirir.
 *
 * Saat dilimi BELİRTİLMİYOR ve tarayıcının yerel dilimine çevriliyor:
 * damganın amacı "ne zaman güncellendi" sorusuna cevap vermek, kullanıcıyı
 * UTC hesabına sokmak değil.
 */
export function formatBuildTime(iso: string, now: Date = new Date()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'bilinmiyor';

  const tarih = new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);

  const dakika = Math.round((now.getTime() - d.getTime()) / 60000);
  if (dakika < 2) return `${tarih} (az önce)`;
  if (dakika < 60) return `${tarih} (${dakika} dakika önce)`;
  const saat = Math.round(dakika / 60);
  if (saat < 24) return `${tarih} (${saat} saat önce)`;
  const gun = Math.round(saat / 24);
  return `${tarih} (${gun} gün önce)`;
}
