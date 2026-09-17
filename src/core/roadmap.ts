/**
 * Yol haritasındaki diller — henüz kurulmamış olanlar.
 *
 * NEDEN AYRI BİR LİSTE: Karşılama sayfası dört dil gösteriyor ama
 * yalnızca biri çalışıyor. "Yakında" kartlarını sayfanın içine elle
 * yazmak iki sorun doğururdu: Korece kurulduğunda kart hem "yakında"
 * hem "hazır" olarak iki kez görünürdü ve bunu kimse fark etmezdi;
 * ikincisi, sayfanın kendisi hangi dillerin var olduğuna karar
 * vermiş olurdu — oysa bu bilgi kayıt defterinin işi.
 *
 * Burada bir dil KURULDUĞUNDA yapılacak tek şey onu bu listeden
 * silmek. Birim testi ikisinde birden bulunan kimliği yakalıyor.
 *
 * NEDEN "YAKINDA" DİYE BİR TARİH YOK: Verilmeyecek bir söz vermemek
 * için. Tarih yazılsaydı geçtiğinde sayfa yalan söylemeye başlardı.
 */

export interface PlannedLanguage {
  /** Kurulduğunda alacağı kimlik — adres öneki de bu olacak. */
  id: string;
  /** Dilin kendi yazısıyla adı. */
  nativeName: string;
  /** İngilizce adı — uluslararası tanınırlık için. */
  englishName: string;
  /** Türkçe adı. */
  name: string;
  /** Neden öğrenilir, tek cümle. */
  blurb: string;
  /**
   * Bu dilin öğretiminde uygulamanın motorunun ne işe yarayacağı.
   * Her dilin kendi üretici çekirdeği var; "aynı uygulama başka
   * kelimelerle" demek yanlış olurdu.
   */
  engine: string;
}

export const PLANNED_LANGUAGES: PlannedLanguage[] = [
  {
    id: 'ko',
    nativeName: '한국어',
    englishName: 'Korean',
    name: 'Korece',
    blurb: 'Hangul bir gecede öğrenilir; asıl iş saygı düzeyleri ve fiil çekiminde.',
    engine: 'Fiil gövdesi + kip eki + nezaket düzeyi — üç katman, kurallı üretim.',
  },
  {
    id: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    name: 'Arapça',
    blurb: 'İbranicenin kardeşi: o da üç harfli kökler ve kalıplar üzerine kurulu.',
    engine: 'Kök + vezin (وزن) — İbranicedeki binyan sisteminin karşılığı.',
  },
  {
    id: 'zh',
    nativeName: '中文',
    englishName: 'Mandarin',
    name: 'Mandarin Çincesi',
    blurb: 'Çekim yok, ton var. Zorluk dilbilgisinde değil, sesletim ve yazıda.',
    engine: 'Karakter bileşenleri (部首) + ton örüntüleri — ezber yerine yapı.',
  },
];
