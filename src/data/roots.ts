/**
 * Kök tabloları — seviyelere göre ayrılmış ham veri.
 *
 * NEDEN SEVİYEYE GÖRE AYRI DOSYA: Uygulamanın sol menüsü A1/A2/B1/B2
 * sekmelerinden oluşuyor ve her sekme kendi havuzundan besleniyor. Veri
 * tek dosyada dursaydı bir seviyeye fiil eklemek 2000 satırlık dosyanın
 * ortasında iş yapmak olurdu; ayrı dosyalarda hangi seviyenin ne kadar
 * dolu olduğu dosya boyutundan bile görülüyor.
 *
 * SATIR BİÇİMİ
 *   kök | binyan | türkçe anlamlar (;) | CEFR | sıklık,ulpan,konuşma,yazı [| gizra]
 *
 * Gizra normalde YAZILMAZ — kökün harflerinden türetilir. Altıncı alan
 * yalnızca harflerden bilinemeyen durumlar için: נ ile başlayan her kök
 * gelecek zamanda נ'yi düşürmez (לִנְפֹּל → יִפֹּל ama לִנְשֹׁם → יִנְשֹׁם),
 * bu ayrım kurala değil kelimeye bağlıdır.
 */
import { A1_TABLES } from './roots-a1';
import { A2_TABLES } from './roots-a2';
import { B1_TABLES } from './roots-b1';
import { B2_TABLES } from './roots-b2';
import { EXTRA_TABLES } from './roots-extra';

export const ALL_ROOT_TABLES = [
  ...A1_TABLES,
  ...A2_TABLES,
  ...B1_TABLES,
  ...B2_TABLES,
  ...EXTRA_TABLES,
];

export { A1_TABLES, A2_TABLES, B1_TABLES, B2_TABLES, EXTRA_TABLES };
