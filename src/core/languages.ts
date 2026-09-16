/**
 * Dil kaydı — hangi diller var.
 *
 * NEDEN AYRI DOSYA: Kayıt işlemi bir YAN ETKİ. `core/language.ts`
 * içinde yapılsaydı o dosyayı yalnızca tip almak için içeri alan her
 * yer (ve her test) bütün İbranice veri kataloğunu da yüklerdi. Kayıt
 * burada duruyor ve yalnızca uygulama açılışında bir kez çalışıyor.
 *
 * YENİ DİL EKLEMEK: modülü yaz, buraya iki satır ekle. Kabukta hiçbir
 * şey değişmiyor.
 *
 *   import { korean } from '@/languages/korean';
 *   registerLanguage(korean);
 *
 * SIRA MENÜDEKİ SIRAYI BELİRLİYOR; ilk kayıtlı dil varsayılan.
 */
import { registerLanguage } from './language';
import { hebrew } from '@/languages/hebrew';

let done = false;

/**
 * Dilleri kaydeder. Birden çok kez çağrılabilir — ikinci çağrı hiçbir
 * şey yapmaz.
 *
 * Koruma gerekli: React geliştirme kipinde bileşenleri iki kez
 * çalıştırıyor ve kayıt iki kez yapılsaydı "kimlik zaten kayıtlı"
 * hatası yalnızca geliştirmede ortaya çıkardı.
 */
export function setupLanguages(): void {
  if (done) return;
  done = true;
  registerLanguage(hebrew);
}
