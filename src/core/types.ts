/**
 * Çekirdek tipler — hiçbir dile ait olmayanlar.
 *
 * NEDEN AYRI: Dosyalar dil modülüne taşındığında ödül motoru, tekrar
 * programı ve menü hâlâ `@he/types` dosyasından `CEFR` alıyordu. Yani
 * ÇEKİRDEK, bir DİL MODÜLÜNE bağımlı kalmıştı — Korece eklendiğinde
 * ödül motorunun İbranice modülünü içeri almaya devam etmesi gerekirdi
 * ve bağımlılık yönü tersine dönerdi.
 *
 * Buradaki kural basit: bir tip birden çok dilde aynı anlama geliyorsa
 * çekirdektedir. `CEFR` seviyeleri Avrupa ölçeğidir ve İbraniceye ait
 * değildir; `Binyan` ise yalnızca İbranicede vardır ve dil modülünde
 * kalır.
 */

/** Avrupa Dil Portfolyosu seviyeleri — dilden bağımsız ölçek. */
export type CEFR = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

/** Kolaydan zora sıralı. Karşılaştırma bu diziye göre yapılır. */
export const CEFR_ORDER: readonly CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

/** Verilen seviye ve altındakiler. Süzgeçlerin ortak yardımcısı. */
export function cefrUpTo(level: CEFR): CEFR[] {
  return CEFR_ORDER.slice(0, CEFR_ORDER.indexOf(level) + 1) as CEFR[];
}

/** a seviyesi b'den zor mu? */
export const cefrHarder = (a: CEFR, b: CEFR): boolean =>
  CEFR_ORDER.indexOf(a) > CEFR_ORDER.indexOf(b);

/**
 * Metnin yazım yönü.
 *
 * İbranice sağdan sola, Korece soldan sağa. Arayüz kabuğu bunu dil
 * modülünden okuyor; her sayfanın kendi kararı olsaydı bir sayfa
 * unutulduğunda metin ters akardı.
 */
export type ScriptDirection = 'rtl' | 'ltr';
