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
    version: '1.22.0',
    date: '2026-09-17',
    releasedAt: '2026-09-17T10:36:43+03:00',
    title: 'Karşılama ekranı ve yeni tasarım dili',
    summary:
      'Uygulama artık bir dille değil, bir seçimle açılıyor: karşılama ekranı dört dili ve motorun ne yaptığını gösteriyor. Görsel dil de baştan kuruldu — düğmeler, ikonlar ve başlık panelleri tek bir sistemden geliyor.',
    changes: [
      {
        kind: 'yeni',
        text: 'Kök adres artık karşılama ekranı. Önceden son kullanılan dile yönlendiriyordu; tek dil varken doğruydu ama dört dil görünür olunca uygulama "İbranice uygulaması" sanılıyordu.',
      },
      {
        kind: 'yeni',
        text: 'Karşılama ekranı dört dili gösteriyor: İbranice hazır, Korece, Arapça ve Mandarin yolda. Her kart o dilin motorunun ne işe yarayacağını yazıyor — "aynı uygulama başka kelimelerle" değil.',
      },
      {
        kind: 'yeni',
        text: 'Yol haritasındaki diller ayrı bir kayıt defterinde (`core/roadmap.ts`), sayfanın içinde değil. Bir dil kurulduğunda tek yapılacak şey onu listeden silmek; birim testi iki listede birden duran dili yakalıyor. Kurulmamış dillere bağlantı verilmiyor — tıklanıp boş adrese düşülmesin diye.',
      },
      {
        kind: 'yeni',
        text: 'Markaya, logoya veya üstteki isme tıklayınca karşılama ekranına dönülüyor. Dil değiştirmenin yolu bu; kenar çubuğundaki seçici yalnızca kurulu diller arasında geziyor.',
      },
      {
        kind: 'gelisme',
        text: 'Tasarım dili v2: düğme görünümü otuz ayrı dosyada satır içi yazılıydı ve hiçbiri ötekine benzemiyordu — artık tek yerden geliyor (.btn). Çıplak duran 16px ikonlar kaba oturdu (.icon-chip), başlık panelleri, kart ışığı ve ortak ritim eklendi.',
      },
      {
        kind: 'gelisme',
        text: 'İbranice ana sayfası geniş düzene geçti ve sekiz eşit sayaç yerine üç büyük sayaç + bir şerit gösteriyor; hepsi aynı ağırlıktayken hiçbiri okunmuyordu. Sayaçlar dil modülünden geliyor, sayfa Korece’de de aynı düzenle çalışacak.',
      },
      {
        kind: 'gelisme',
        text: 'Klavyeyle gezinenler için odak halkası eklendi — tarayıcının kendi anahattı koyu zeminde görünmüyordu. Hareketi azaltılmış cihazlarda süs animasyonları duruyor, geri bildirim animasyonları kalıyor.',
      },
      {
        kind: 'duzeltme',
        text: 'Kontrast ölçüm aracı geçişli zeminleri okuyamadığı için birincil düğmeyi "1.07:1" diye yanlış bildiriyordu. Artık bu öğeleri atlıyor ve kaç tane atladığını yazıyor — sessizce geçseydi gerçek bir sorunu da saklayabilirdi.',
      },
      {
        kind: 'duzeltme',
        text: 'Türkçe harf tuzağı: bir test "YAKINDA" ile "yakında"yı eşleştiremiyordu, çünkü JavaScript’in harf küçültmesi Türkçe değil — I harfi "ı" yerine "i"ye iniyor. Karşılaştırma artık Türkçe yerele göre yapılıyor.',
      },
      {
        kind: 'gelisme',
        text: 'Test sayısı 516 birim + 65 uçtan uca. Yeni testler karşılama ekranını, dil seçimini ve markadan geri dönüşü gerçek tarayıcıda doğruluyor.',
      },
    ],
    benefits: [
      {
        title: 'Uygulamanın ne olduğu ilk ekranda belli',
        text: 'Açılışta doğrudan İbranice çalışma alanına düşmüyorsun. Önce ne öğrenmek istediğini seçiyorsun, uygulamanın çok dilli olduğunu da orada görüyorsun.',
      },
      {
        title: 'Dil değiştirmek tek tık',
        text: 'Sol üstteki markaya tıkladığın an seçim ekranı açılıyor. Ayar sayfasında dil aramana gerek yok.',
      },
      {
        title: 'Ekran artık göze daha kolay geliyor',
        text: 'Düğmeler birbirine benziyor, ikonlar ortada kaybolmuyor, ana sayfa dar bir sütuna sıkışmıyor. Önemli sayılar büyük, gerisi geride duruyor.',
      },
      {
        title: 'Verilmeyen söz yok',
        text: 'Yoldaki dillerin yanında tarih yazmıyor. Tarih yazsaydık geçtiğinde sayfa sana yalan söylemeye başlardı.',
      },
    ],
  },
  {
    version: '1.21.0',
    date: '2026-09-17',
    releasedAt: '2026-09-17T02:13:19+03:00',
    title: 'Öğretmen modu gerçek bir sınıfa dönüştü',
    summary:
      'Öğretmen modu artık ders kataloğu değil: seni karşılıyor, seviyeni ölçüyor, bugün ne çalışacağını gerekçesiyle söylüyor ve ödev veriyor.',
    changes: [
      {
        kind: 'yeni',
        text: 'Seviye tespit sınavı: 18 soruluk uyarlamalı ölçüm. Her cevaptan sonra tahmin güncelleniyor ve sonraki sorunun zorluğu ona göre kuruluyor. Sonunda seviye, beceri haritası ve nereden başlanacağı yazılı bir karne çıkıyor.',
      },
      {
        kind: 'yeni',
        text: 'Sınıf ekranı: karşılama, bugünün programı (en fazla dört madde, her birinin NEDEN o olduğu yazılı), seviye kartı ve ardından katalog.',
      },
      {
        kind: 'yeni',
        text: 'Ödev, not ve karne. Her ödev maddesi ÖLÇÜLEBİLİR — "yaptım" düğmesi yok; ders tamamlandı mı, oyunda kaç doğru verildi, kaç öğe tekrar edildi verisine bakılıyor. Not teslim anında donuyor.',
      },
      {
        kind: 'yeni',
        text: 'Yapay zekâ öğretmen köşesi. Model İbranice UYDURAMIYOR: her soruya senin seviyendeki gerçek fiil, kelime ve kalıplar katalogdan süzülüp "bu listenin dışına çıkma" yönergesiyle veriliyor. Anahtar bağlanana kadar panel dürüstçe "bağlı değil" diyor.',
      },
      {
        kind: 'duzeltme',
        text: 'Tema geçişindeki donma çözüldü — ÖLÇÜLDÜ. Geçiş sayfadaki her öğeye kuruluyordu; VERB sayfasında yarım saniyelik (646 ms) kilit oluyordu. Şimdi 0 ms, boyama 349 ms yerine 76 ms.',
      },
      {
        kind: 'duzeltme',
        text: 'Yüzlerce kartın her biri tarayıcıdan ayrı bir çizim katmanı istiyordu; kazancı olmayan bu istek kaldırıldı.',
      },
      {
        kind: 'gelisme',
        text: 'Yeni ekranlar dil önekli adres yapısına bağlandı; sınıf ekranından derse, ödevden oyuna geçişler doğru yere gidiyor.',
      },
      {
        kind: 'gelisme',
        text: 'Test sayısı 506 birim + 62 uçtan uca. Genişlik testi animasyonun ortasını ölçüyordu — artık yerleşmeyi bekliyor.',
      },
    ],
    benefits: [
      {
        title: '"Bugün ne çalışsam" sorusu bitti',
        text: 'Öğretmen modunu açtığında karşına program çıkıyor: en fazla dört madde ve her birinin neden seçildiği. Yetmiş dersin arasından seçim yapmak zorunda değilsin.',
      },
      {
        title: 'Nereden başlayacağını tahmin etmiyorsun',
        text: 'Seviye tespit sınavı seviyeni ölçüyor ve ders listesi ölçülen seviyeye göre açılıyor. Sınav sırasında doğru-yanlış gösterilmiyor; bu bir ölçüm, ders değil.',
      },
      {
        title: 'Ödevin gerçek karşılığı var',
        text: 'Ödevi "yaptım" diyerek kapatamıyorsun — sistem gerçekten çalışıp çalışmadığına bakıyor. Not da bu yüzden anlamlı.',
      },
      {
        title: 'Tema değiştirmek artık takılmıyor',
        text: 'Renk paletini değiştirdiğinde yarım saniyelik donma vardı; ölçülüp kaldırıldı. Geçiş hem daha hızlı hem daha yumuşak.',
      },
    ],
  },
  {
    version: '1.20.0',
    date: '2026-09-17',
    releasedAt: '2026-09-17T01:51:26+03:00',
    title: 'Tek dilli uygulama, çok dilli platforma dönüştü',
    summary:
      'İbranice artık uygulamanın KENDİSİ değil, uygulamaya takılı ilk dil. Korece eklendiğinde kabukta tek satır değişmeyecek. Ürün de bu yüzden yeni adını aldı.',
    changes: [
      {
        kind: 'yeni',
        text: 'Dil modülü sözleşmesi kuruldu: menü, sayfalar, sayaçlar, seslendirme ve tekrar öğelerinin okunuşu artık dilin kendi modülünden geliyor; kabuk İbranice hakkında hiçbir şey bilmiyor.',
      },
      {
        kind: 'yeni',
        text: 'Adresler dil önekli oldu: /he/verb, /he/oyunlar. Paylaşılan bağlantı hangi dilde olduğunu kendi söylüyor.',
      },
      {
        kind: 'yeni',
        text: 'Kenar çubuğunda öğrenilen dil seçici — marka adının hemen altında, "Hebrew · İbranice".',
      },
      {
        kind: 'gelisme',
        text: 'Ürün adı, logosu ve mottosu yenilendi: Cortexia Language 2 — "Her dil, kökünden." Ad tek kaynaktan besleniyor; sekme başlığı ve uygulama künyesi dâhil.',
      },
      {
        kind: 'duzeltme',
        text: 'Telefona kurulan uygulamanın simgesi boş çıkıyordu: künyenin istediği iki simge dosyası hiç üretilmemişti. Artık işaretten otomatik üretiliyor.',
      },
      {
        kind: 'duzeltme',
        text: 'Yeni adres yapısında sayfa bomboş açılıyordu — dil bulunamayınca yönlendirme kendi üstüne kapanıyordu. Konsolda tek hata vermeden oluyordu; 47 uçtan uca test bunu yakaladı.',
      },
      {
        kind: 'duzeltme',
        text: 'Eski bağlantılar kırılmıyor: önekli olmayan /verb, /oyunlar gibi adresler aynı sayfanın yeni adresine gidiyor.',
      },
      {
        kind: 'gelisme',
        text: 'İlerleme kayıtları dil önekiyle etiketlendi; ikinci dil geldiğinde iki dilin serisi ve tekrar takvimi birbirine karışmayacak. Mevcut kayıtlar tek seferde taşındı.',
      },
      {
        kind: 'gelisme',
        text: 'Test sayısı 425 birim + 60 uçtan uca; yeni testler menü-adres tutarlılığını, bırakılmış adresleri ve marka kaynağını denetliyor.',
      },
    ],
    benefits: [
      {
        title: 'İlerlemen güvende',
        text: 'Ad değişti ama kayıtların değişmedi. Serin, toplam XP ve tekrar takvimin olduğu gibi duruyor — depolama anahtarları bilerek eski hâlinde bırakıldı.',
      },
      {
        title: 'Bağlantı paylaşabilirsin',
        text: 'Bir fiile ya da derse bakarken adresi kopyalayıp gönderebilirsin; karşı taraf aynı yerde açılıyor. Eski yer imlerin de çalışmaya devam ediyor.',
      },
      {
        title: 'Sıradaki dil seni bekletmeyecek',
        text: 'Yeni bir dil eklemek artık uygulamayı yeniden yazmak değil, bir klasör eklemek. Öğrendiğin şey değişmiyor, yanına bir tane daha geliyor.',
      },
    ],
  },
  {
    version: '1.19.1',
    date: '2026-09-16',
    releasedAt: '2026-09-16T22:01:12+03:00',
    title: 'Geri bildirim artık gerçekten ulaşıyor',
    summary:
      'Bir önceki sürümde form hazırdı ama arkasındaki veritabanı kurulu değildi. Kurulum tamamlandı; gönderdiğin bildirim artık saklanıyor.',
    changes: [
      { kind: 'duzeltme', text: 'Bildirim veritabanı kuruldu ve bağlandı; form çalışır durumda.' },
      { kind: 'gelisme', text: 'Güvenlik uçtan uca sınandı: tarayıcıya ait anahtarla ne okunabiliyor ne yazılabiliyor, yalnızca sunucu erişiyor.' },
    ],
    benefits: [
      {
        title: 'Yazdığın gerçekten kaydediliyor',
        text: 'Bir önceki sürümde form seni dürüstçe uyarıyordu ama gönderim yapılamıyordu. Artık bildirimin sayfası, sürümü ve saatiyle birlikte saklanıyor ve gelen kutusundan okunabiliyor.',
      },
    ],
  },
  {
    version: '1.19.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T21:47:36+03:00',
    title: 'Geri bildirim formu',
    summary:
      'Sağ üstte, temanın yanında bir düğme: bir hata gördüğünde ya da bir şey istediğinde o sayfadan ayrılmadan bildirebiliyorsun.',
    changes: [
      { kind: 'yeni', text: 'Geri bildirim kutusu — hata, istek, öneri ve soru olarak dört tür.' },
      { kind: 'yeni', text: 'Bulunduğun sayfa ve uygulama sürümü otomatik ekleniyor; bildirim araştırılabilir oluyor.' },
      { kind: 'yeni', text: 'Yazdığın metin taslak olarak saklanıyor — kutu yanlışlıkla kapanırsa kaybolmuyor.' },
      { kind: 'yeni', text: 'Parolayla açılan gelen kutusu sayfası; okundu işareti ve okunmamış süzgeci.' },
      { kind: 'gelisme', text: 'Kurulum eksikse form bunu ÖNCEDEN söylüyor, sen yazdıktan sonra değil.' },
      { kind: 'gelisme', text: 'İletişim bilgisi zorunlu değil — zorunlu olsaydı adını vermek istemeyen biri hiç bildirmezdi.' },
    ],
    benefits: [
      {
        title: 'Gördüğün yerden bildirebiliyorsun',
        text: 'Hata her yerde çıkabilir. Form ayrı bir sayfada olsaydı hatayı gördüğün yerden ayrılıp onu aramak zorunda kalır, çoğu zaman da vazgeçerdin. Üst banttaki düğme o mesafeyi sıfırlıyor.',
      },
      {
        title: 'Bildirimin gerçekten ulaşıyor',
        text: 'Sessizce başarısız olan bir bildirim formu, form olmamasından daha kötüdür: derdini anlattığını sanırsın ve kimse duymaz. Bu yüzden gönderim başarısız olursa sebebi yazıyor ve testler her iki durumda da dürüst davranıldığını denetliyor.',
      },
    ],
  },
  {
    version: '1.18.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T21:28:24+03:00',
    title: 'VERB çalışma alanı',
    summary:
      'Fiil sayfası artık ekranın tamamını kullanıyor ve bütün zamanları aynı anda gösteriyor. Ayrıca iki gerçek çekim hatası bulundu ve düzeltildi.',
    changes: [
      { kind: 'gelisme', text: 'Sayfa 1024 pikselle sınırlıydı; artık geniş ekranda 1.664 piksele kadar açılıyor. Okuma sayfaları dar kalmaya devam ediyor.' },
      { kind: 'gelisme', text: 'Bütün zamanlar yan yana: şimdiki, geçmiş, gelecek, mastar ve emir aynı ekranda. Sekmeler arasında gidip gelmek gerekmiyor.' },
      { kind: 'yeni', text: 'Binyan ve seviye süzgeçleri, kaç fiilin kaldığını gösteren sayaç.' },
      { kind: 'yeni', text: 'Ok tuşlarıyla listede gezinme ve seçilen fiilin adrese yazılması — bağlantı paylaşılabiliyor.' },
      { kind: 'yeni', text: 'Geniş ekranda sağ bölme: kök ailesi, düzensizlik notu ve örnek cümleler.' },
      { kind: 'duzeltme', text: 'ט ile başlayan hitpa’el kökleri iki kez yazılıyordu: הִטְטַּפֵּל yerine doğrusu הִטַּפֵּל.' },
      { kind: 'duzeltme', text: 'צ ile başlayan hitpa’el köklerinde ט fazladan dageş alıyordu: הִצְטַּלֵּם yerine doğrusu הִצְטַלֵּם.' },
    ],
    benefits: [
      {
        title: 'Zamanlar arasındaki ilişkiyi görüyorsun',
        text: 'Bir fiili bilmek onun bir zamanını bilmek değil. Geçmişte kişinin sondaki ekten, gelecekte baştaki harften anlaşıldığını ancak ikisi yan yanayken fark edersin. Sekme arkasına saklanan bilgi karşılaştırılamaz.',
      },
      {
        title: 'İki fiil artık doğru yazılıyor',
        text: 'İbranicede ilk kök harfi ד ya da ט ise hitpa’el kalıbındaki ת yer değiştirmez, kaynaşır — ortada ayrı bir harf kalmaz. Motor bunu yer değiştirme sanıyor ve harfi iki kez yazıyordu. Hata yeni sayfanın uçtan uca testinde, ekrana dökülen metinde görüldü.',
      },
    ],
  },
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
