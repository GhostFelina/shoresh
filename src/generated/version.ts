/**
 * OTOMATİK ÜRETİLİR — elle düzenleme.
 *
 * `vite.config.ts` içindeki sürüm eklentisi bu dosyayı her sunucu
 * başlangıcında ve her derlemede yeniden yazar.
 *
 * NEDEN `define` KULLANILMIYOR: Sürüm önce `define` ile derleme anında
 * metin değişimiyle gömülüyordu. İki ayrı sorun çıkardı:
 *  1. Vite dev sunucusunda değişim uygulanmadı; tarayıcıya TANIMSIZ bir
 *     değişken gitti ve onu okuyan başlık çöktü.
 *  2. package.json değişse bile çalışan sunucu eski değeri sürdürüyordu.
 * Gerçek bir modül olarak yazılınca dev, derleme ve testte aynı yoldan
 * okunur — sihir yok, kırılacak bir şey yok.
 */
export const APP_VERSION = '1.15.0';

/** Derlemenin yapıldığı an — ISO 8601, UTC. */
export const BUILD_TIME = '2026-09-16T17:24:28.945Z';
