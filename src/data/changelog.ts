/**
 * Sürüm notları.
 *
 * NEDEN VERİ OLARAK DURUYOR: Arayüz bunu ekranın ortasında bir kutuda
 * gösteriyor ve "kullanıcı bu sürümü gördü mü" kararını sürüm numarasına
 * bakarak veriyor. Notlar bir markdown dosyasında dursaydı uygulama
 * onları ayrıştırmak zorunda kalır, ayrıştırma hatası da kutunun boş
 * açılması demek olurdu.
 *
 * HER SÜRÜMDE İKİ BÖLÜM VAR:
 *   changes  — NE yapıldı. Teknik, madde madde, dürüst.
 *   benefits — bu SANA ne kazandırıyor. Değişikliğin karşılığı öğrencinin
 *              gününde nedir?
 * İkincisi olmadan sürüm notu bir iş listesidir; öğrenci "peki bana ne"
 * diye sorar ve haklıdır.
 *
 * SIRA: En yeni en üstte. `RELEASES[0]` o anki sürüm sayılır.
 */

export type ChangeKind = 'yeni' | 'gelisme' | 'duzeltme' | 'icerik';

export interface Change {
  kind: ChangeKind;
  text: string;
}

export interface Benefit {
  title: string;
  text: string;
}

export interface Release {
  version: string;
  /** Yayın tarihi — ISO 8601 (yalnızca gün). */
  date: string;
  title: string;
  summary: string;
  changes: Change[];
  benefits: Benefit[];
}

export const CHANGE_LABEL: Record<ChangeKind, string> = {
  yeni: 'Yeni',
  gelisme: 'Geliştirme',
  duzeltme: 'Düzeltme',
  icerik: 'İçerik',
};

/** Rozet renkleri — paletten gelir, sabit kod değil. */
export const CHANGE_TINT: Record<ChangeKind, string> = {
  yeni: 'var(--color-brand-400)',
  gelisme: 'var(--color-accent-400)',
  duzeltme: 'var(--accent-fem)',
  icerik: 'var(--accent-text-alt)',
};

export const RELEASES: Release[] = [
  {
    version: '1.12.0',
    date: '2026-09-16',
    title: 'Sürüm notları ve zaman damgası',
    summary:
      'Artık her güncellemede ne değiştiğini bu kutuda göreceksin — ve uygulamanın en son ne zaman güncellendiğini her sayfanın altından okuyabilirsin.',
    changes: [
      { kind: 'yeni', text: 'Yeni sürüm çıktığında ekranın ortasında bu kutu açılıyor; sen kapatana kadar açık kalıyor.' },
      { kind: 'yeni', text: 'Sürüm notlarına istediğin zaman sayfa altındaki bağlantıdan dönebilirsin — kutuyu kapatmak notları kaybetmiyor.' },
      { kind: 'yeni', text: 'Son güncelleme tarih ve saati derleme anında damgalanıyor; elle yazılmıyor, dolayısıyla yanlış olamıyor.' },
      { kind: 'gelisme', text: 'Damga hem mutlak tarihi hem "3 saat önce" gibi göreli süreyi gösteriyor.' },
    ],
    benefits: [
      {
        title: 'Ne değiştiğini kaçırmıyorsun',
        text: 'Uygulama büyüdükçe yeni bölümler sessizce ekleniyordu. Artık bir sonraki açılışta ne geldiğini görüyorsun; yeni bir oyun ya da ders eklendiyse aramak zorunda kalmıyorsun.',
      },
      {
        title: 'Elindeki sürümün güncel olduğunu biliyorsun',
        text: 'Telefonda uygulama çevrimdışı da çalıştığı için bazen eski bir kopya açık kalabiliyor. Sayfa altındaki damga hangi kopyada olduğunu kesin söylüyor.',
      },
    ],
  },
  {
    version: '1.11.0',
    date: '2026-09-16',
    title: 'Beş renk paleti',
    summary:
      'Uygulama tek renk üzerine kuruluydu ve uzun kullanımda yoruyordu. Artık beş palet var ve hepsi okunabilirlik testinden geçiyor.',
    changes: [
      { kind: 'yeni', text: 'Şoreş, Negev, Zeytin, Akdeniz ve Nar paletleri — sağ üstteki palet düğmesinden.' },
      { kind: 'yeni', text: 'Tema (koyu/açık) ve palet artık iki ayrı seçim; istediğin birleşimi kurabiliyorsun.' },
      { kind: 'gelisme', text: 'Seviye sekmeleri (A1–B2) kendi renklerini aldı; menü tek blok gibi durmuyor.' },
      { kind: 'gelisme', text: 'Kaydırma çubuğu arayüze uyduruldu — artık açık gri bir şerit değil.' },
      { kind: 'duzeltme', text: 'Açık temada beş paletin de dolgu rengi zeminden yeterince ayrışmıyordu; hepsi koyulaştırıldı.' },
      { kind: 'duzeltme', text: 'Negev ve Akdeniz paletlerinde iki vurgu rengi birbirine karışıyordu.' },
    ],
    benefits: [
      {
        title: 'Gözün yorulmuyor',
        text: 'Her gün aynı ekrana bakmak çalışma isteğini düşürüyor. Paleti değiştirmek uygulamayı yeniden ilgi çekici kılmanın en ucuz yolu — içerik aynı kalırken ortam değişiyor.',
      },
      {
        title: 'Renkler artık ölçülüyor',
        text: 'Her ton, üzerinde görüneceği zemine karşı WCAG eşiğinden geçiyor. Yani hiçbir palette "güzel ama okunmayan" bir rakam ya da bağlantı kalmıyor.',
      },
    ],
  },
  {
    version: '1.10.0',
    date: '2026-09-16',
    title: 'Öğretmen Modu',
    summary:
      'Oyunlar seni sınıyordu; bu bölüm öğretiyor. Otuz ders, hepsi kuralı anlatıp örnek göstererek ilerliyor.',
    changes: [
      { kind: 'yeni', text: 'Öğretmen Modu: kural → işlenmiş örnek → ipuçlu soru → ipuçsuz soru → özet.' },
      { kind: 'yeni', text: 'Yanlış cevapta puan düşmüyor; neden yanlış olduğu açıklanıyor.' },
      { kind: 'yeni', text: 'Öğretmenin Türkçe sesi cihazdaki Türkçe konuşma sesini kullanıyor — ağ gerekmiyor.' },
      { kind: 'duzeltme', text: 'Okunuşta hirik male kuralı eksikti: "holhiym" yazıyordu, "holhim" olmalıydı. Üretilen 9.786 biçimin 2.522\'sini etkiliyordu.' },
    ],
    benefits: [
      {
        title: 'Konuyu ilk kez burada öğreniyorsun',
        text: 'Oyunlar bildiğini pekiştirir ama bilmediğini öğretmez. Öğretmen Modu bir konuyu sıfırdan alıp sonunda kendi başına deneyecek hâle getiriyor.',
      },
      {
        title: 'Yanlışların işe yarıyor',
        text: 'Sadece "yanlış" demek öğretmez; öğrenci bir dahaki sefere aynı yere düşer. Burada her yanlış cevap gerekçesiyle geliyor.',
      },
    ],
  },
  {
    version: '1.9.0',
    date: '2026-09-16',
    title: '1.572 öğe ve sekiz yeni çekim şablonu',
    summary:
      'Sözlük iki katına çıktı, fiil havuzu genişledi ve motorun çekemediği sekiz kalıp eklendi.',
    changes: [
      { kind: 'icerik', text: 'Sözlük 353 → 888 kelime: sağlık, hukuk, ekonomi, teknoloji, coğrafya, hayvan, giysi.' },
      { kind: 'icerik', text: 'Fiil 367 → 445 kök+binyan; üretilen çekim 8.696 → 10.568.' },
      { kind: 'icerik', text: 'Kalıplar 161 → 239: doktor, kira, otobüs, telefon, resmî işler.' },
      { kind: 'yeni', text: 'Motor artık נִשְׁמַע, נֶעֱצַר, נִמְצָא, הֶאֱמִין, הִמְצִיא, הִתְקַלֵּחַ, בֵּרֵךְ ve הִצְטָרֵף gibi kalıpları da çekiyor.' },
      { kind: 'duzeltme', text: 'Sondaki ך sessiz şva almıyordu: חָתַך → חָתַךְ.' },
      { kind: 'duzeltme', text: 'ה ile başlayan kökler yanlış hareke alıyordu: לַהְפּוֹך → לַהֲפֹךְ.' },
    ],
    benefits: [
      {
        title: 'Günlük hayatı artık anlatabiliyorsun',
        text: 'Eksik olan kelimeler süs değildi: doktora gitmek, kira konuşmak, otobüste yol sormak için gerekenlerdi. Bunlar olmadan dilbilgisi doğru ama kullanılamaz kalıyordu.',
      },
      {
        title: 'Çekimler artık uydurulmuyor',
        text: 'Motor bir kalıbı bilmediğinde o fiili hiç göstermiyor — yanlış bir biçim öğretmektense göstermemeyi seçiyor. Sekiz yeni şablonla o boşluklar gerçekten kapandı.',
      },
    ],
  },
  {
    version: '1.8.0',
    date: '2026-09-15',
    title: 'Ses gerçekten çalışıyor',
    summary:
      'Seslendirme üç kez "düzeltilmiş" ama hiç ses çıkmamıştı. Sebebi tahminle değil ölçümle bulundu.',
    changes: [
      { kind: 'duzeltme', text: 'Seslendirme servisi tarayıcıdan gelen isteklere 404 dönüyordu; istek artık sunucu üzerinden yapılıyor.' },
      { kind: 'duzeltme', text: '<audio> öğesi 404 gövdesini ses sanıp "Format error" veriyordu — artık geçerli MP3 alıyor.' },
      { kind: 'yeni', text: 'Ses tanılaması: çalışmadığında hangi katmanın düştüğünü ekranda gösteriyor.' },
    ],
    benefits: [
      {
        title: 'Duyarak öğreniyorsun',
        text: 'İbranicede harekesiz yazım okunuşu tam vermiyor; kelimeyi duymadan doğru telaffuz kurulamıyor. Ses çalışmadığı sürece uygulamanın yarısı eksikti.',
      },
    ],
  },
];

export const LATEST = RELEASES[0]!;

export const RELEASE_BY_VERSION = new Map(RELEASES.map((r) => [r.version, r]));

/**
 * Kullanıcının en son gördüğü sürümden BU YANA çıkanlar.
 *
 * Neden tek sürüm değil: Uygulamayı bir hafta açmayan biri üç sürüm
 * atlamış olabilir. Yalnızca sonuncuyu göstermek aradakileri sessizce
 * yutardı.
 */
export function releasesSince(seen: string | null): Release[] {
  if (!seen) return [LATEST];
  const index = RELEASES.findIndex((r) => r.version === seen);
  // Bilinmeyen sürüm (ileri sürümden geri dönüş, elle silinmiş kayıt):
  // yalnızca sonuncuyu göster, bütün geçmişi tekrar açma.
  if (index === -1) return [LATEST];
  return RELEASES.slice(0, index);
}
