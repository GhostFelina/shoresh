/**
 * Gizra tespiti — kökün hangi zayıflık sınıfına düştüğünü harflerinden bulur.
 *
 * NEDEN OTOMATİK: Gizra, kökün harflerinin doğrudan sonucudur; bağımsız bir
 * bilgi değildir. 500 satırlık bir veri tablosunda elle yazılırsa kaçınılmaz
 * olarak yanlış sınıflanan satırlar olur ve o fiiller SESSİZCE yanlış çekilir.
 * Kuralı bir kez yazıp testle kilitlemek, 500 kez elle karar vermekten hem
 * daha güvenli hem de düzeltilebilir.
 *
 * Veri tarafı yine de `gizra` alanıyla üzerine yazabilir — gerçekten
 * istisnai kökler için kaçış kapısı açık kalıyor.
 */
import type { Binyan, Gizra } from '@/types/hebrew';

const GUTTURAL = 'אהחע';

/**
 * Pi'el ailesi (pi'el / pu'al / hitpa'el) ortak harften tanınır: ORTA kök
 * harfi dageş hazak alır. Gırtlaksılar ve ר dageş alamadığı için bu üç
 * binyanda orta harf gırtlaksıysa kalıp bozulur — בֵּרֵךְ, גֵּרֵשׁ, שֵׁרֵת.
 * Aynı kök pa'al'de sorunsuz çekilir; yani gizra binyandan bağımsız değildir.
 */
const PIEL_FAMILY = new Set<Binyan>(['piel', 'pual', 'hitpael']);

/**
 * Kökün gizrasını belirler.
 *
 * Sıra önemlidir: bir kök birden çok zayıflık taşıyabilir (נ־ס־ע hem פ״נ
 * hem ל״גרונית'tir). Böyle durumlarda SON harfin zayıflığı kalıbı daha
 * derinden bozduğu için önce o sınanır. İki zayıflığı birden taşıyan
 * kökler motorun kapsamı dışında kalır ve katalog tarafından reddedilir.
 */
export function detectGizra(root: string[], binyan: Binyan): Gizra {
  // שׂ / שׁ gibi noktalı harfleri temel biçimine indirger — zayıflık
  // sınıfı noktadan değil, harfin kendisinden belirlenir.
  const [a, b, c] = root.map((ch) => ch.charAt(0)) as [string, string, string];

  // 1) Son harf — kalıbı en çok bozan konum
  if (c === 'ה') return 'lamed-hey';
  if (c === 'א') return 'lamed-alef';
  if (c === 'ח' || c === 'ע') return 'lamed-guttural';

  // 2) Orta harf ünlüye dönüşüyor mu (içi boş kök)
  if (b === 'ו' || b === 'י') return 'ayin-vav';

  // 3) Pi'el ailesinde orta harf dageş alabiliyor mu
  if (PIEL_FAMILY.has(binyan)) {
    /*
     * ר ve א ile ח/ע AYNI sonucu vermez, bu yüzden ayrı sinıflar:
     *   ח/ע — dageş yazılmaz ama önceki ünlü de UZAMAZ: שִׂחֵק, הִתְרַחֵץ
     *   ר/א — dageş düşer ve önceki ünlü UZAR: בֵּרֵך (hirik→tzere),
     *          לְבָרֵך (patah→kamatz)
     * Tek sinıfta toplansalardı biri için doğru olan şablon öbürünü bozardı.
     */
    if (b === 'ר' || b === 'א') return 'ayin-resh';
    if (GUTTURAL.includes(b)) return 'ayin-guttural';
  }

  // 4) İlk harf
  if (a === 'נ') return 'pe-nun';
  if (a === 'י') return 'pe-yod';
  if (a === 'א') return 'pe-alef';
  if (GUTTURAL.includes(a)) return 'pe-guttural';

  // 5) Pa'al/nif'al/hif'il'de orta gırtlaksı
  if (GUTTURAL.includes(b)) return 'ayin-guttural';

  // 6) İkiz kök
  if (b === c) return 'kfulim';

  return 'shlemim';
}

/**
 * Kökün TAŞIDIĞI bütün zayıflıklar — yalnızca baskın olanı değil.
 * Katalog bunu "iki zayıflığı birden taşıyan kök" uyarısı için kullanır.
 */
export function gizraFlags(root: string[]): Gizra[] {
  const [a, b, c] = root.map((ch) => ch.charAt(0)) as [string, string, string];
  const flags: Gizra[] = [];
  if (c === 'ה') flags.push('lamed-hey');
  if (c === 'א') flags.push('lamed-alef');
  if (c === 'ח' || c === 'ע') flags.push('lamed-guttural');
  if (b === 'ו' || b === 'י') flags.push('ayin-vav');
  if (a === 'נ') flags.push('pe-nun');
  if (a === 'י') flags.push('pe-yod');
  if (a === 'א') flags.push('pe-alef');
  else if (GUTTURAL.includes(a)) flags.push('pe-guttural');
  if (GUTTURAL.includes(b)) flags.push('ayin-guttural');
  if (b === c) flags.push('kfulim');
  return flags;
}
