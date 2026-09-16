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

import { OLDER_RELEASES } from './changelog-history';

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
  /**
   * Yayın ANI — ISO 8601, saat ve saat dilimiyle.
   *
   * Değer uydurulmadı: her sürümün yayın commit'inin gerçek zamanı.
   * Elle yazılan bir saat, yayına çıkmayan bir değişiklikte de
   * güncellenir ve geçmiş kaydını yalan yapar — kaydın tek anlamı
   * doğru olması.
   */
  releasedAt: string;
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

const RECENT: Release[] = [
  {
    version: '1.17.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T21:13:00+03:00',
    title: 'Test motoru',
    summary:
      'Uygulama artık her sürümde gerçek bir tarayıcıda baştan sona sınanıyor: 39 uçtan uca test, masaüstü ve telefon olmak üzere iki ayrı ekran boyutunda.',
    changes: [
      { kind: 'yeni', text: 'Uçtan uca test paketi — gezinme, öğrenme akışı, arayüz, seslendirme ve telefon görünümü.' },
      { kind: 'yeni', text: 'Tek komut: kod denetimi, biçim denetimi, birim testleri ve tarayıcı testleri birlikte koşuyor.' },
      { kind: 'yeni', text: 'Testler yaşanmış hataların üstüne yazıldı: seri neden 0 kalıyordu, grafik çubukları neden çizilmiyordu, ses neden duyulmuyordu.' },
      { kind: 'gelisme', text: 'Telefon görünümü ayrı sınanıyor: çekmece açılıyor mu, arkadaki sayfa kayıyor mu, içerik ekrandan taşıyor mu.' },
      { kind: 'duzeltme', text: 'Seslendirme ucunun İbranice olmayan metni reddettiği ve boş isteğe çökmediği artık testle güvence altında.' },
    ],
    benefits: [
      {
        title: 'Bir şeyi düzeltirken başka bir şey bozulmuyor',
        text: 'Bu uygulamada en az bir kez oldu: iki yönlü metin düzeltmesi, kendi getirdiği bir hatayla kelimeleri birbirine yapıştırdı. Artık her değişiklikten sonra kırk civarında gerçek kullanıcı yolculuğu otomatik deneniyor — sayfalar açılıyor mu, oyun oynanıyor mu, ses geliyor mu.',
      },
      {
        title: 'Hatalar sana ulaşmadan bulunuyor',
        text: 'Şimdiye kadar hatalar ekran görüntüsüne bakılarak ya da sen bildirdiğin için bulunuyordu. Test paketi aynı kontrolleri her seferinde, unutmadan ve saniyeler içinde yapıyor.',
      },
    ],
  },
  {
    version: '1.16.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T20:57:00+03:00',
    title: 'Yedekleme, checkpoint ve devir belgesi',
    summary:
      'Her sürüm artık iki ayrı yerde yedekleniyor ve projeyi devralacak kişi için kodu baştan sona okumadan devam etmeyi sağlayan bir belge eklendi.',
    changes: [
      { kind: 'yeni', text: 'Checkpoint sistemi: her sürümde masaüstünde bağımsız bir arşiv ve GitHub tarafında bir etiket oluşuyor.' },
      { kind: 'yeni', text: 'Her yedeğin yanında künye dosyası — hangi commit, kaç test geçiyordu, nasıl geri dönülür.' },
      { kind: 'yeni', text: 'Devir belgesi (AI_HANDOFF.md): kararlar, gerekçeler ve yaşanmış on dört tuzak.' },
      { kind: 'yeni', text: 'Durum belgesi (PROJECT_STATE.md) projeden ölçülerek üretiliyor; elle yazılmıyor, dolayısıyla eskiyemiyor.' },
      { kind: 'yeni', text: 'Belgenin iddialarını doğrulayan testler: yazan her komut ve her dosya yolu gerçekten var mı.' },
    ],
    benefits: [
      {
        title: 'Bir şey bozulursa geri dönebiliyorsun',
        text: 'Git tek başına yeterli değil: depo bozulursa ya da yanlışlıkla geri alınamaz bir işlem yapılırsa elde bir şey kalmıyordu. Artık masaüstünde, depodan bağımsız, açılıp doğrudan çalıştırılabilen bir kopya duruyor ve yanındaki künye o kopyanın hangi commit olduğunu ve o an kaç testin geçtiğini söylüyor.',
      },
      {
        title: 'Proje devredilebilir hâle geldi',
        text: 'Yirmi bin satırlık bir projeyi devralan kişi neyin neden öyle yapıldığını bilmeden ilerleyemez; bilmeye çalışırsa da çok zaman harcar. Belge kararları ve yaşanmış hataları topluyor, ölçülebilir kısmı ise otomatik üretiliyor — yani belge kendiliğinden eskimiyor.',
      },
    ],
  },
  {
    version: '1.15.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T20:24:26+03:00',
    title: 'Sürüm geçmişi',
    summary:
      'Temanın yanındaki saat ikonu uygulamanın bütün geçmişini açıyor: on yedi sürüm, eskiden yeniye, gerçek tarih ve saatleriyle.',
    changes: [
      { kind: 'yeni', text: 'Üst bantta sürüm geçmişi düğmesi — bütün güncellemeler tek yerde.' },
      { kind: 'yeni', text: 'Zaman çizgisi: her sürümün yayın anı, bir önceki sürümden ne kadar sonra çıktığı ve değişiklik türlerinin sayısı.' },
      { kind: 'yeni', text: 'Sıra eskiden yeniye; tek düğmeyle ters çevrilebiliyor.' },
      { kind: 'icerik', text: 'İlk yayından bu yana çıkan on yedi sürümün tamamı kayda geçirildi — 78 değişiklik.' },
      { kind: 'duzeltme', text: 'Bir sürümün yayın günü yanlış yazılmıştı; kayıtlar artık yayın anıyla karşılaştırılıyor ve test gün ile anın tutmasını zorluyor.' },
    ],
    benefits: [
      {
        title: 'Uygulamanın nasıl geliştiğini görebiliyorsun',
        text: 'Duyuru kutusu bir kez açılıp kapanıyor ve orada anlatılanlar kayboluyordu. Artık ne zaman ne eklendiği, hangi hatanın ne zaman düzeldiği kalıcı bir kayıt. Bir şeyin ne zaman değiştiğini merak ettiğinde bakacak bir yer var.',
      },
      {
        title: 'Tarihler uydurma değil',
        text: 'Her zaman damgası o sürümün yayın anından alınıyor, elle yazılmıyor. Elle yazılan bir tarih yayına çıkmayan bir değişiklikte de güncellenir ve kaydı yalan yapar; burada yazan saat gerçekten o sürümün çıktığı saattir.',
      },
    ],
  },
  {
    version: '1.14.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T17:18:10+03:00',
    title: 'Öğretmen Modu iki katına çıktı',
    summary:
      'Ders sayısı 30’dan 71’e çıktı ve dersler altı öğrenme kümesine ayrıldı. Artık her ders iki ipuçlu, iki ipuçsuz soru soruyor ve yarıda bıraktığın yerden devam edebiliyorsun.',
    changes: [
      { kind: 'yeni', text: 'Gelecek zaman ve emir kipi dersleri — beş binyan için ayrı ayrı.' },
      { kind: 'yeni', text: '“Kalıbı tanı” dersleri: harekesiz metinde hangi binyan olduğunu ek harflerden ayırt etme.' },
      { kind: 'yeni', text: 'Benzeyen harfler: ב/כ, ד/ר, ה/ח/ת, ו/ז/ן, ם/ס, ע/צ, ג/נ — okuma hatalarının büyük kısmı buradan çıkıyor.' },
      { kind: 'yeni', text: 'Hareke aileleri: aynı sesi veren farklı işaretler.' },
      { kind: 'yeni', text: 'Aynı kök farklı kalıpta — כתב kökünün dört yüzü bir arada.' },
      { kind: 'yeni', text: 'Sayılarda ters uyum ve edat çekimi (לִי / לְךָ / לוֹ) dersleri.' },
      { kind: 'yeni', text: 'Cümle kurma dersleri: sözdizimi, אֶת işareti ve fiilin istediği edat.' },
      { kind: 'gelisme', text: 'Dersler altı kümeye ayrıldı: Okuma, Zamanlar, Kalıplar, Kökler, Söz varlığı, Yapı.' },
      { kind: 'gelisme', text: 'Tamamlanan dersler işaretleniyor; yarıda bırakılan ders listenin başında “devam et” olarak duruyor.' },
      { kind: 'gelisme', text: 'Her derste artık iki ipuçlu, iki ipuçsuz soru var — tek soru konuyu anlatır ama oturtmaz.' },
      { kind: 'duzeltme', text: 'Hareke dersinde iki şık aynı cevaba dönüşüyordu; o derste karşılaştırma artık harekeyi koruyor.' },
      { kind: 'duzeltme', text: 'Gelecek zamanda “sen (erkek)” ile “o (kadın)” aynı biçim olduğu için şıklar yineleniyordu.' },
    ],
    benefits: [
      {
        title: 'Okumayı gerçekten öğreniyorsun',
        text: 'Şimdiye kadarki dersler fiil çekmeyi öğretiyordu. Yeni dersler asıl engeli hedefliyor: benzeyen harfleri ayırmak ve harekesiz bir kelimenin hangi kalıpta olduğunu ek harflerden çıkarmak. Bunu yapabilen biri hiç görmediği bir fiilin anlamını bile tahmin edebilir.',
      },
      {
        title: 'Nerede kaldığını uygulama hatırlıyor',
        text: 'Ders yarıda kalırsa listeye dönünce en üstte “kaldığın yerden devam et” duruyor. Yetmiş dersin içinde hangisini bitirdiğini hatırlamak zorunda değilsin; tamamlananlar işaretli.',
      },
    ],
  },
  {
    version: '1.13.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T17:02:19+03:00',
    title: 'İlerleme ve ödül sistemi',
    summary:
      'Artık her cevabın bir karşılığı var: XP kazanıyorsun, rütbe atlıyorsun, günlük hedefin ve serin birikiyor. On iki rozetin ölçütü baştan görünüyor.',
    changes: [
      { kind: 'yeni', text: 'XP ve dokuz rütbe — Tohum (זֶרַע) ile başlayıp Orman (יַעַר) ile bitiyor. Her rütbe aynı zamanda öğreneceğin bir kelime.' },
      { kind: 'yeni', text: 'Günlük hedef: Hafif, Düzenli, Ciddi, Yoğun. İstediğin zaman değiştirebilirsin.' },
      { kind: 'yeni', text: 'Seri (streak) — arka arkaya çalıştığın her gün kazandığın XP’yi artırıyor, en fazla %50.' },
      { kind: 'yeni', text: 'On iki rozet. Ölçütleri ve ilerleme çubukları BAŞTAN görünüyor; gizli rozet yok.' },
      { kind: 'yeni', text: 'Üst bantta seri, günlük hedef halkası ve rütbe; kazanılan XP cevap verince yanıp sönüyor.' },
      { kind: 'gelisme', text: 'Yanlış cevap da XP kazandırıyor (doğrunun beşte biri). İpucu puanı düşürüyor ama sıfırlamıyor.' },
      { kind: 'duzeltme', text: 'Cevap kaydı ile ödül kaydı aynı satıra yazarken birbirini eziyordu; seri hep 0 kalıyordu.' },
      { kind: 'duzeltme', text: 'Son yedi gün grafiğinin çubukları hiç çizilmiyordu — yüzde yükseklik çözülemiyordu.' },
    ],
    benefits: [
      {
        title: 'Bugün neden çalışacağını biliyorsun',
        text: 'Dil öğrenmenin en zor yanı ilerlemenin görünmez olması; haftalarca çalışırsın ve hiçbir şey değişmemiş gibi gelir. Günlük hedef ve seri, o görünmez ilerlemeyi her gün somut bir sayıya çeviriyor.',
      },
      {
        title: 'Sayılar şişirilmiyor',
        text: 'Her tıklamaya bol puan veren bir sistem önce heyecan verir, sonra sayılar anlamını yitirir. Buradaki ölçüler bilerek dar: elli doğru cevap bile bir rütbe atlatmıyor, yani rütbe atladığında gerçekten bir şey olmuş demektir.',
      },
    ],
  },
  {
    version: '1.12.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T16:40:37+03:00',
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
    releasedAt: '2026-09-16T16:31:55+03:00',
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
    releasedAt: '2026-09-16T16:18:00+03:00',
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
    releasedAt: '2026-09-16T15:58:55+03:00',
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
    date: '2026-09-16',
    releasedAt: '2026-09-16T12:47:35+03:00',
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

/**
 * Bütün sürümler — yeniden eskiye.
 *
 * Son sürümler yukarıda yazılır, zamanla `changelog-history.ts` dosyasına
 * taşınır. Tek dosyada tutulsaydı her sürümde biraz daha büyüyüp
 * okunamaz hâle gelirdi.
 */
export const RELEASES: Release[] = [...RECENT, ...OLDER_RELEASES];

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
