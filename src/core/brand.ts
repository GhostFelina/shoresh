/**
 * Ürün kimliği — TEK kaynak.
 *
 * NEDEN AYRI DOSYA: Ad, kabuğun üç ayrı yerinde, alt bilgide, `index.html`
 * içinde ve PWA künyesinde elle yazılıydı. Ad değiştiğinde altısını da
 * bulmak gerekti ve ikisi ilk seferde atlandı. Artık arayüzdeki her yer
 * buradan besleniyor.
 *
 * NEDEN ARTIK "Shoresh" DEĞİL: "Shoresh" (שורש = kök) İBRANİCEYE ait bir
 * ad. Uygulama çok dilli hâle geldi; ikinci dil eklendiğinde ürünün adı
 * öğretilen dillerden yalnızca birine göndermede bulunuyor olurdu.
 * Ürün adı platformun, İbranice kimliği (שֹׁרֶשׁ · "Kökten İbranice")
 * ise dil modülünün içinde duruyor — orası doğru yeri.
 *
 * DEPOLAMA ANAHTARLARI DEĞİŞMEDİ: `localStorage` ve IndexedDB hâlâ
 * `shoresh.*` önekini kullanıyor. Ad değiştiği için onları da
 * değiştirmek, uygulamayı kullanan herkesin ilerlemesini, serisini ve
 * tekrar takvimini silmek olurdu — anahtar bir kimlik değil, bir adres.
 */

export const BRAND = {
  /** Tam ad — künye, alt bilgi, belge başlığı. */
  name: 'Cortexia Language 2',

  /** Dar yerler için kısa ad: üst bant, PWA simgesi altı. */
  short: 'Cortexia L2',

  /**
   * Motto — adın hemen altında duran tek satır.
   *
   * "Kök" fikri İbraniceden geliyor ama tek bir dile bağlı değil: her
   * dilin kendi üretici çekirdeği var ve uygulama o çekirdeği öğretiyor.
   * Korece eklendiğinde bu satır hâlâ doğru kalıyor.
   */
  motto: 'Her dil, kökünden.',

  /**
   * Vaat — alt bilgide ve künyede kullanılan uzun satır.
   * Uygulamanın ezber uygulamalarından farkını söylüyor.
   */
  promise: 'Çekimler kural motoruyla üretilir, ezberle değil.',

  /** Arama motorları ve paylaşım kartları için açıklama. */
  description:
    'Cortexia Language 2 — kural motoruyla dil öğrenme. Alfabe, sesletim, ' +
    'çekim tabloları ve aralıklı tekrar; çekimler ezberlenmez, üretilir.',
} as const;

/** Sürümle birlikte tek satır: "Cortexia Language 2 v1.20.0". */
export const brandWithVersion = (version: string): string => `${BRAND.name} v${version}`;
