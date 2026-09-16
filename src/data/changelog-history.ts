/**
 * Sürüm geçmişi — kapanmış sürümler.
 *
 * NEDEN AYRI DOSYA: `changelog.ts` yalnızca son birkaç sürümü tutsaydı
 * geçmiş kaybolurdu; hepsi tek dosyada dursaydı dosya her sürümde biraz
 * daha büyüyüp okunamaz hâle gelirdi. Yeni sürümler `changelog.ts`
 * içinde yazılır, zamanla buraya taşınır.
 *
 * ZAMAN DAMGALARI UYDURULMADI: Her `releasedAt` değeri o sürümün yayın
 * commit'inin gerçek zamanıdır (`git log --date=iso-strict`). Elle
 * yazılan bir saat, yayına çıkmayan bir değişiklikte de güncellenir ve
 * geçmiş kaydını yalan yapar — kaydın tek anlamı doğru olması.
 */
import type { Release } from './changelog';

export const OLDER_RELEASES: Release[] = [
  {
    version: '1.7.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T12:34:15+03:00',
    title: 'Görsel denetim — dört gerçek hata',
    summary:
      'Uygulama ilk kez ekran görüntüsüyle denetlendi; her sayfa masaüstü ve telefon genişliğinde, koyu ve açık temada çekildi. İlk koşu dört hata buldu.',
    changes: [
      {
        kind: 'duzeltme',
        text: 'Açık tema okunmuyordu: vurgu rengi beyaz üzerinde 1.4:1 kontrastla duruyordu.',
      },
      {
        kind: 'duzeltme',
        text: 'İki yönlü metin boşluk yutuyordu — bir önceki sürümün kendi getirdiği hata: "ilk harf הdüşer".',
      },
      {
        kind: 'duzeltme',
        text: 'Kelimeler sayfası 24.356 piksel uzunluğundaydı; "Daha fazla göster" ile 5.080 piksele indi.',
      },
      { kind: 'duzeltme', text: 'Logo kopuk görünüyordu; üç kol artık tek noktada birleşiyor.' },
      { kind: 'gelisme', text: 'Kenar çubuğu sıkılaştırıldı; on bir giriş kaydırmadan sığıyor.' },
    ],
    benefits: [
      {
        title: 'Açık temada da çalışılabiliyor',
        text: 'Gündüz ışığında koyu tema yorucudur ama açık temada bütün sayaçlar ve bağlantılar soluk kalıyordu; yani seçenek görünüşte vardı, gerçekte yoktu. Artık iki tema da kullanılabilir durumda.',
      },
    ],
  },
  {
    version: '1.6.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T12:10:40+03:00',
    title: 'İbranice ekran klavyesi',
    summary:
      'Kullanıcının klavyesi Türkçe; İbranice harf yazamıyordu. Yazarak cevaplanan oyunlar bu yüzden yarı yarıya oynanamaz durumdaydı.',
    changes: [
      {
        kind: 'yeni',
        text: 'İsrail standart düzeninde ekran klavyesi. Sofit harfler ayrı satırda değil, ait oldukları harfin yanında.',
      },
      { kind: 'yeni', text: 'Klavye kısayolları: 1–4 ile cevap, Enter ile ilerleme.' },
      { kind: 'gelisme', text: 'Tasarım turu — cam etkili kartlar, gerçek gölge, arka planda derinlik.' },
      {
        kind: 'gelisme',
        text: 'Tıklanabilir kartlar artık parlamıyor, yükseliyor; parlaklık hilesi İbranice metni soluklaştırıyordu.',
      },
    ],
    benefits: [
      {
        title: 'İbranice harfle yazabiliyorsun',
        text: 'Latin harflerle okunuş yazmak kabul ediliyordu ama bu bir ödündü. İbranice harfle yazmak ayrı bir beceridir ve asıl öğrenilmesi gereken odur. Düzen gerçek bir İsrail klavyesiyle aynı; buradaki alışkanlık oraya taşınıyor.',
      },
    ],
  },
  {
    version: '1.5.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T11:55:37+03:00',
    title: 'Öğrenme belleği — uygulama ne bildiğini hatırlıyor',
    summary:
      'Uygulama o güne kadar bir başvuru kitabıydı; sekmeyi kapatınca her şey sıfırlanıyordu. Aralıklı tekrar sistemi eklendi.',
    changes: [
      { kind: 'yeni', text: 'FSRS tabanlı tekrar motoru — her öğe için ayrı kararlılık ve zorluk.' },
      {
        kind: 'yeni',
        text: 'Cevap süresi ve ipucu sayısı hesaba katılıyor: 2 saniyede hatırlanan ile 9 saniyede sökülen aynı sayılmıyor.',
      },
      { kind: 'yeni', text: 'Kalıcı kayıt (IndexedDB) — sunucu yok, veri cihazda kalıyor.' },
      { kind: 'duzeltme', text: 'Karışık Türkçe/İbranice metinde yön sorunu düzeltildi.' },
    ],
    benefits: [
      {
        title: 'Tekrar zamanını uygulama hesaplıyor',
        text: 'Neyi ne zaman tekrar edeceğine kendin karar vermek zorunda değilsin. Zor gelen öğe sık, oturmuş öğe seyrek geliyor — böylece aynı sürede daha çok şey akılda kalıyor.',
      },
    ],
  },
  {
    version: '1.4.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T11:37:29+03:00',
    title: 'Çevrimdışı ses paketi',
    summary:
      'Uygulamanın seslendirdiği her şey sonlu bir kümedir: harf adları, harekeler, kelimeler, kalıplar, fiiller. Hepsi tek düğmeyle indirilebiliyor.',
    changes: [
      { kind: 'yeni', text: 'Ses paketi indirme — sonrasında uygulama internetsiz konuşuyor.' },
      {
        kind: 'duzeltme',
        text: 'Sürüm numarası yerelde güncellenmiyordu; sihirli değişken kaldırılıp gerçek bir modüle çevrildi.',
      },
    ],
    benefits: [
      {
        title: 'İnternetsiz de dinleyebiliyorsun',
        text: 'Otobüste, uçakta ya da bağlantının zayıf olduğu yerde ses çalışmıyordu. Paket bir kez indirildikten sonra her klip beklemeden başlıyor.',
      },
    ],
  },
  {
    version: '1.3.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T11:19:06+03:00',
    title: 'Sözlük katmanı — 353 kelime',
    summary:
      'O güne kadar 367 fiil vardı ama "ev", "su", "kırmızı" yoktu; öğrenci fiil çekebiliyor ama cümle kuramıyordu.',
    changes: [
      { kind: 'icerik', text: 'İsim, sıfat, zarf, edat ve sayılar — 24 konu başlığı altında 353 kelime.' },
      { kind: 'yeni', text: 'Cinsiyet zorunlu alan yapıldı; eksik veri sessizce geçemiyor.' },
      {
        kind: 'yeni',
        text: 'Eş yazımlılar ayrı gösteriliyor: מורה hem "öğretmen (erkek)" hem "öğretmen (kadın)".',
      },
      { kind: 'yeni', text: 'İki yeni oyun: Cinsiyet Ustası ve Kelime Avı.' },
    ],
    benefits: [
      {
        title: 'Cümle kurabiliyorsun',
        text: 'Fiil tek başına cümle etmez. İsim, sıfat ve edat olmadan öğrenilen çekimlerin kullanılacağı bir yer yoktu; uygulama çekim tablosu gösteriyor ama konuşturmuyordu.',
      },
    ],
  },
  {
    version: '1.2.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T11:04:45+03:00',
    title: 'Düzensiz fiiller ve okunuş düzeltmesi',
    summary:
      'İbranicenin en sık kullanılan fiilleri hiçbir kalıba uymadıkları için motor tarafından eleniyordu; öğrenci "gidiyorum", "verdim", "biliyorum" diyemiyordu.',
    changes: [
      {
        kind: 'icerik',
        text: '14 düzensiz fiil elle yazıldı: הלך, היה, בא, נתן, לקח, ידע, יכל, יצא, אמר, נסע, עלה, חיה, שוב, נגש.',
      },
      {
        kind: 'yeni',
        text: 'Her birinde NEDEN düzensiz olduğu da yazılı — "ezberle" demek öğretmek değildir.',
      },
      {
        kind: 'duzeltme',
        text: 'היה fiilinin modern İvritte şimdiki zamanı YOKTUR; tip artık kısmi tabloyu taşıyabiliyor.',
      },
      {
        kind: 'duzeltme',
        text: 'Kelime sonundaki ה sessizdir; motor onu okuyordu ve bütün ל״ה fiilleri yanlış seslendiriliyordu ("kanah" yerine doğrusu "kana").',
      },
    ],
    benefits: [
      {
        title: 'En sık fiiller artık elinde',
        text: 'Düzensiz fiiller seyrek değil, tam tersi — bir dilde en çok kullanılanlar zamanla düzensizleşir. Onlar olmadan günlük konuşma kurulamıyordu.',
      },
    ],
  },
  {
    version: '1.1.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T10:44:18+03:00',
    title: 'Sesin ilk kök nedeni',
    summary:
      'Çevrimiçi seslendirme katmanı hiç çalışmıyordu. Sebep bir satırlık bir ayardı ve tarayıcıyı gereksiz bir güvenlik denetimine zorluyordu.',
    changes: [
      { kind: 'duzeltme', text: 'crossOrigin ayarı kaldırıldı; ses artık sıradan bir medya olarak çalınıyor.' },
      {
        kind: 'duzeltme',
        text: 'Tek bir ağ hatası katmanı sonsuza kadar kapatıyordu; artık 60 saniye dinlenip yeniden deniyor.',
      },
      {
        kind: 'gelisme',
        text: 'Tarayıcının otomatik oynatma engeli artık hata değil, ayrı bir durum: "dokununca çalar".',
      },
      { kind: 'yeni', text: 'Ses sayfası — hangi katmanın çalıştığını gösteriyor.' },
      { kind: 'yeni', text: 'Üç yeni oyun ve elle yazılmış örnek cümleler.' },
    ],
    benefits: [
      {
        title: 'Telaffuzu duyabiliyorsun',
        text: 'İbranicede harekesiz yazım okunuşu tam vermiyor. Ses olmadan öğrenci kelimeyi yanlış öğreniyor ve sonradan düzeltmek çok daha zor oluyor.',
      },
    ],
  },
  {
    version: '1.0.2',
    date: '2026-09-16',
    releasedAt: '2026-09-16T01:21:01+03:00',
    title: 'Yayın herkese açıldı',
    summary: 'Uygulama giriş istemeden açılıyor; yayın yordamı belgelendi.',
    changes: [
      { kind: 'gelisme', text: 'Vercel erişimi herkese açıldı — bağlantıyı alan herkes kullanabiliyor.' },
    ],
    benefits: [
      {
        title: 'Bağlantıyı paylaşabiliyorsun',
        text: 'Uygulama giriş ekranı arkasındayken kimseye gösterilemiyordu; öğrenme aracının ilk şartı erişilebilir olmasıdır.',
      },
    ],
  },
  {
    version: '1.0.1',
    date: '2026-09-16',
    releasedAt: '2026-09-16T01:12:40+03:00',
    title: 'Derin bağlantı düzeltmesi',
    summary:
      'Doğrudan bir sayfaya girildiğinde ya da sayfa yenilendiğinde 404 alınıyordu.',
    changes: [
      {
        kind: 'duzeltme',
        text: 'Tek sayfa uygulaması yönlendirmesi eklendi; artık her adres doğrudan açılıyor.',
      },
    ],
    benefits: [
      {
        title: 'Yer imi koyabiliyorsun',
        text: 'Çalıştığın sayfayı yer imine ekleyip ertesi gün oradan devam etmek mümkün değildi; yenilemek bile uygulamayı kırıyordu.',
      },
    ],
  },
  {
    version: '1.0.0',
    date: '2026-09-16',
    releasedAt: '2026-09-16T01:10:19+03:00',
    title: 'İlk sürüm',
    summary:
      'Kök + binyan çekim motoru, seviye sekmeleri, altı oyun ve katmanlı seslendirme ile ilk yayın.',
    changes: [
      { kind: 'yeni', text: 'Çekim motoru: fiiller ezberlenmiyor, kökten ÜRETİLİYOR.' },
      { kind: 'yeni', text: 'A1–B2 seviye sekmeleri ve her seviyeye ait sayfa.' },
      { kind: 'yeni', text: 'Alef-Bet, harekeler, binyan haritası ve kalıplar sayfaları.' },
      { kind: 'yeni', text: 'Altı alıştırma oyunu.' },
      { kind: 'icerik', text: '353 fiil, 8.370 üretilen çekim biçimi.' },
    ],
    benefits: [
      {
        title: 'Ezber yerine kural',
        text: 'Motor bir birleşimi üretemezse uydurma çekim üretmiyor, o satırı reddediyor. Yani uygulamada gördüğün her biçim ya kuraldan geliyor ya elle doğrulanmış — arada bir şey yok.',
      },
    ],
  },
];
