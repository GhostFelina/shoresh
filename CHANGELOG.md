## 1.6.0

**İbranice ekran klavyesi.** Rakip uygulamaları incelerken bizde olmayan
en somut eksik buydu ve aslında bir engeldi: kullanıcının klavyesi Türkçe,
İbranice harf yazamıyor. "Zaman Makinesi" gibi yazarak cevaplanan oyunlar
bu yüzden yarı yarıya oynanamaz durumdaydı. Latin harfle okunuş yazmak
kabul ediliyordu ama bu bir ödün — İbranice harfle yazabilmek ayrı bir
beceridir ve asıl öğretilmesi gereken odur.

Klavye İsrail standart düzeninde. Alfabetik dizmek daha kolay görünürdü
ama öğrenci gerçek bir klavyede bu düzenle karşılaşacak; buradaki
alışkanlık oraya taşınsın diye aynısı kullanıldı. Sofit harfler ayrı
satırda değil, ait oldukları harfin yanında — ayrı satıra alınsaydı
öğrenci onları ayrı harfler sanırdı.

**Tasarım turu.** Üç kez istenmiş ve yapılmamıştı:
- Arka planda iki yumuşak renk lekesi — süs değil DERİNLİK; düz zeminde
  kartların kenarı kayboluyordu.
- Kartlar cam etkili (backdrop-blur) ve gerçek gölge taşıyor.
- Tıklanabilir kartlar artık `brightness` ile parlamıyor, YÜKSELİYOR.
  Parlaklık hilesi alt öğelerin rengini de bozuyor ve İbranice metni
  soluklaştırıyordu; yeni yöntem yalnızca `transform` ve gölge kullanıyor,
  düzen hesabı gerektirmediği için uzun listelerde takılma yapmıyor.
- Sayfa başlıklarında geçişli vurgu, sayaçlarda sabit genişlikli rakam.
- Hareket azaltma tercihinde yükselme de kapanıyor — vestibüler duyarlılığı
  olan biri için rahatsız edici olan sürenin uzunluğu değil, yer değiştirme.

**Klavye kısayolları.** Aralıklı tekrarın işe yaraması için tur sayısının
yüksek olması gerekir; her soruda fareyi seçeneğe götürmek turu iki katına
çıkarıyor ve insanlar bırakıyor. Artık 1–4 ile cevap, Enter ile ilerleme.
Yazarak cevaplanan sorularda rakam kısayolları devre dışı — orada 1-4
gerçek bir girdi olabilir.

280 birim testi.

## 1.5.0

**Öğrenme belleği eklendi — uygulama artık ne bildiğini hatırlıyor.**
Analiz tek bir şeyi çok net gösterdi: `dexie`, `ts-fsrs` ve `zustand` kurulu
ama HİÇBİR dosyada kullanılmıyordu. Yani uygulama bir başvuru kitabıydı,
öğrenme sistemi değil — sekmeyi kapatınca her şey sıfırlanıyordu.

- **SRS motoru (`engine/srs.ts`)**: FSRS üzerine kurulu. Sabit aralık
  merdiveni yerine her öğe için ayrı kararlılık ve zorluk tutuluyor.
  Üstüne cevap süresi ve ipucu sayısı ekleniyor: 2 saniyede hatırlanan
  kelime ile 9 saniyede sökülen kelime aynı derecede bilinmiş sayılmıyor.
- **Kalıcı kayıt (`lib/db.ts`)**: IndexedDB. Sunucu yok — uygulamanın
  tamamı çevrimdışı çalıştığı için ilerlemeyi sunucuya bağlamak o özelliği
  kırardı. Veritabanı açılamazsa (gizli sekme) kayıt sessizce atlanıyor,
  uygulama çalışmaya devam ediyor.
- **11 oyunun hepsi cevapları kaydediyor**, süre ölçümüyle birlikte.
- **İlerleme sayfası**: hâkimiyet, doğruluk, günlük seri, son yedi gün
  grafiği, zorlandığın öğeler ve sıfırlama.
- **Ana sayfada "Bugünün dersi"**: kaç tekrar bekliyor, kaç zayıf, seri.

**Arayüz denetimi ve iki yönlü metin düzeltmesi.** Otomatik bir denetim
yazıldı (61 kontrol): her sayfa içerik basıyor mu, tek h1 var mı, düğmelerin
erişilebilir adı var mı, bağlantılar var olan sayfalara gidiyor mu, İbranice
metinlerin yönü işaretli mi.

Denetim gerçek bir görsel hata buldu: Türkçe cümle içinde geçen İbranice
parçalar izole edilmemişti. Bu, parçanın sınırındaki noktalamanın ters tarafa
kaymasına yol açıyordu. `MixedText` bileşeni İbranice dizileri otomatik
`<bdi>` içine alıyor; artık Türkçe soldan sağa akıyor, İbranice öbek kendi
içinde sağdan sola çiziliyor ve noktalama yerinde kalıyor.

275 birim testi (önceki 180).

## 1.4.0

**Sürüm yerelde neden güncellenmiyordu — bulundu ve kökten çözüldü.**
Sürüm `define` ile derleme anında metin değişimiyle gömülüyordu. Vite dev
sunucusunda bu değişim UYGULANMIYORDU: tarayıcıya tanımsız bir değişken
gidiyordu. Üstelik `package.json` değişse bile çalışan sunucu eski değeri
sürdürüyordu, çünkü Vite yalnızca `vite.config.ts`yi izler.

Sihirli değişken tamamen kaldırıldı. Sürüm artık `src/generated/version.ts`
adlı GERÇEK bir modüle yazılıyor; dosyayı bir Vite eklentisi package.json
değiştikçe yeniden üretiyor. Dev, derleme ve test aynı yoldan okuyor. Bir
test de üretilen dosyanın package.json ile aynı olduğunu doğruluyor, sessiz
kayma imkânsız.

**Ses paketi — çevrimdışı dinleme.** Uygulamanın seslendirdiği her şey sonlu
bir kümedir: harf adları, harekeler, 353 kelime, 150 kalıp, fiillerin sözlük
ve şimdiki biçimleri, örnek cümleler. `/ses` sayfasındaki tek düğmeyle hepsi
indirilip tarayıcının kalıcı önbelleğine konuyor. Sonrasında uygulama
internetsiz konuşuyor ve her klip beklemeden başlıyor.

Teknik engel ve çözümü: seslendirme uç noktası CORS başlığı göndermiyor,
bu yüzden sayfa yanıtı okuyup kendisi saklayamıyor. Ama service worker opak
yanıtı önbelleğe koyabiliyor ve sonra `<audio>` isteğine verebiliyor. İndirme
`fetch(url, { mode: "no-cors" })` ile yapılıyor; gövdeyi kimse okumuyor,
service worker araya girip yazıyor.

Bu arada gömülü sinir ağı sesi de araştırıldı ve GEREKÇESİYLE elendi:
Piper’ın İbranice sesi (he_IL-saspeech) var ama modeli 63 MB ve tarayıcıda
çalıştıran kütüphane 155 MB dosya istiyor; hafif olan kütüphanenin ise
İbranice sesi yok. Bir dil uygulaması için orantısız.

## 1.3.0

**Sözlük katmanı eklendi — 353 kelime.** Şimdiye kadar 367 fiil vardı ama
"ev", "su", "kırmızı" yoktu; öğrenci fiil çekebiliyor ama cümle kuramıyordu.
İsim, sıfat, zarf, edat ve sayılar 24 konu başlığı altında eklendi.

**Cinsiyet zorunlu alan yapıldı.** İbranicede cinsiyetsiz isim yoktur ve
sıfat, sayı, fiil hepsi isme uyar: `בַּיִת גָּדוֹל` ama `דִּירָה גְּדוֹלָה`.
Veri modelinde isteğe bağlı olsaydı eksik veri sessizce geçer, öğrenci
yanlış uyum kurardı. Test bunu sert biçimde denetliyor.

**Eş yazımlılar ayrı gösteriliyor.** `מורה` hem "öğretmen (erkek)" hem
"öğretmen (kadın)"; `חברה` hem "arkadaş" hem "şirket". Harekesiz yazımları
aynı, anlamları farklı. Kimlik harekeli yazımdan kuruluyor — harekesizden
kurulsaydı bu çiftlerden biri sessizce elenirdi. Sözlük sayfasında ayrı bir
bölümde toplanıyorlar, çünkü harekesiz metin okumanın en zor yanı bu.

**İki yeni oyun (toplam 11):**
- **Cinsiyet Ustası** — Türkçede dilbilgisel cinsiyet yok, bu İbranicenin
  bir Türk için en yabancı yanı. Havuz bilerek tuzaklı: `-ה` ile biten
  kelimelerin çoğu dişildir ama `לַיְלָה` "gece" erildir.
- **Kelime Avı** — fiil dışı söz varlığı, iki yönlü. Çeldiriciler hep aynı
  türden gelir: isme isim, sıfata sıfat.

367 fiil · 353 kelime · 150 kalıp · 8.696 çekim · 180 birim testi.

## 1.2.0

**Düzensiz fiiller eklendi — en büyük içerik boşluğu kapandı.** İbranicenin
EN SIK kullanılan fiilleri (הָלַךְ, הָיָה, בָּא, נָתַן, לָקַח, יָדַע, יָכוֹל, יָצָא,
אָמַר, נָסַע, עָלָה, חַי, שָׁב, נִגַּשׁ) hiçbir kalıba uymadıkları için motor
tarafından elenip katalog dışında kalıyordu. Yani öğrenci "gidiyorum",
"verdim", "biliyorum" diyemiyordu. 14 fiil elle yazıldı; her birinde NEDEN
düzensiz olduğu da yazılı — "ezberle" demek öğretmek değildir, kalıbın tam
olarak nerede kırıldığını göstermek öğretir.

**Tip düzeltmesi:** `הָיָה` fiilinin modern İvritte şimdiki zamanı YOKTUR
("ben öğrenciyim" derken fiil kullanılmaz). Çekim tablosu tipi bunu
taşıyamıyordu; taşıyamayınca o boşluğu uydurma bir biçimle doldurmak
gerekirdi. Şimdiki zaman artık kısmi olabiliyor ve bu, fiilin öğretilecek
en önemli özelliği olarak gösteriliyor.

**Okunuş hatası düzeltildi:** Kelime sonundaki ה sessizdir. Motor onu
seslendiriyordu, bu yüzden BÜTÜN ל״ה fiilleri yanlış okunuyordu —
"kanah/oseh/rotseh" yerine doğrusu "kana/ose/rotse". Bu, İbranicenin en
kalabalık fiil sınıfı; hata her birini etkiliyordu.

Ayrıca: düzensiz fiiller için 24 örnek cümle, ana sayfa sayaçları,
ses durumunun ana sayfada dürüstçe gösterilmesi.

367 fiil · 295 kök · 8.696 çekim biçimi · 163 birim testi.

## 1.1.0

**Ses — kök neden bulundu ve giderildi.** Çevrimiçi seslendirme katmanı hiç
çalışmıyordu: kodda `audio.crossOrigin = "anonymous"` ayarlıydı, bu tarayıcıyı
CORS denetimine zorluyor, seslendirme uç noktası `Access-Control-Allow-Origin`
göndermediği için denetim düşüyor ve ses HİÇ yüklenmiyordu. Ayar kaldırıldı;
kaynak artık sıradan bir medya olarak çalınıyor (uç nokta buna
`Cross-Origin-Resource-Policy: cross-origin` ile izin veriyor).

Yanında üç düzeltme daha:
- Kalıcı kilit kaldırıldı. Tek bir ağ hatası katmanı sonsuza kadar kapatıyordu;
  artık üç hatadan sonra 60 saniye dinlenip yeniden deniyor.
- Tarayıcının otomatik oynatma engeli artık HATA sayılmıyor. Ayrı bir durum
  olarak gösteriliyor: "dokununca çalar".
- İndirilen ses bellekte önbelleğe alınıyor; aynı kelime ikinci kez anında çalıyor.

**Yeni: Ses sayfası** (`/ses`) — hangi katmanın çalıştığını gösterir, dört örnekle
sınama yaptırır, her adımı tek tek denetleyen bir tanılama çalıştırır ve işletim
sistemine göre İbranice ses paketi kurulum adımlarını verir.

**Üç yeni oyun** (toplam 9):
- **Cümle Kurucu** — sözcükleri doğru sıraya dizme. Yeni etkileşim türü;
  sürükle-bırak yerine dokunarak, dokunmatikte ve klavyeyle çalışır.
- **Kelime Eşleme** — İbranice↔Türkçe iki yönlü.
- **Binyan Dönüştürücü** — aynı kök, başka kalıp.

**Örnek cümleler** — en sık 40 fiil için elle yazılmış, nesneli ve bağlamlı
cümleler eklendi; her birinde öğrettiği dilbilgisi notu var (אֶת, שֶׁלִּי, edat
seçimi). Üretilen cümleler ikinci katman olarak duruyor.

**Fiil kalıpları** — `יֵשׁ לִי`, `צָרִיךְ לְ־`, `אֶפְשָׁר לְ־`, `כְּדֵי לְ־` gibi 30 yapı
eklendi. Bunlar kelime değil kalıp: içine fiil koyunca cümle kuruluyor.

154 birim testi. Oyun üreteçleri için sözleşme testleri eklendi (doğru cevap
seçenekler arasında mı, seçenekler tekil mi, sıralama gerçekten permütasyon mu).

## 1.0.2

- **Erişim:** Vercel Deployment Protection (SSO) kapatıldı. Önceden
  `shoresh-ivrit.vercel.app` Vercel giriş duvarına çarpıyordu; artık
  uygulamanın bütün adresleri herkese açık.
- Takma adın her deploy’da eskidiği, yayına alma yordamıyla birlikte
  README’ye yazıldı.

## 1.0.1

- **Düzeltme:** Canlı ortamda derin bağlantılar (`/verb`, `/seviye/a1`, `/kaliplar`,
  `/oyunlar`) 404 veriyordu. Tek sayfa uygulamasında bütün rotaların `index.html`e
  düşmesi gerekir; `vercel.json` içinde yönlendirme kuralı eksikti. Sunucu `/verb`
  diye bir dosya arıyordu. Gerçek dosyalar (`assets/`, `sw.js`, ikonlar) kuralın
  dışında bırakıldı.

# Sürüm geçmişi

**Sürüm kuralı** (anlamsal sürümleme): her push + deploy'da numara
değişikliğin ağırlığına göre yükselir.

| Bölüm | Ne zaman artar | Örnek |
|---|---|---|
| **MAJOR** (1.x.x) | Uygulamanın çalışma biçimi değişir, eski veri/adres kırılır | Veri modeli değişimi, rota şeması değişimi |
| **MINOR** (x.1.x) | Yeni yetenek eklenir, eskisi bozulmaz | Yeni oyun, yeni seviye, yeni binyan şablonu |
| **PATCH** (x.x.1) | Düzeltme, içerik ekleme, metin/tasarım rötuşu | Çekim hatası düzeltme, yeni fiil satırları |

Sürüm tek yerden gelir: `package.json`. Arayüzdeki rozet derleme
sırasında oradan gömülür (`vite.config.ts` → `__APP_VERSION__`), böylece
iki yerde ayrı yazılıp birbirinden ayrışamaz.

---

## 1.0.0

İlk tam sürüm — fiil motoru, seviye sayfaları, kalıplar ve oyunlar çalışır durumda.

**Çekim motoru**
- 7 binyan için tam çekim şablonları (shlemim)
- Zayıf kök (gzarot) aileleri: ל״ה, ע״ו/ע״י, פ״נ, פ״י, פ״א, ל״א,
  ל״גרונית, פ״גרונית, ע״גרונית
- Hif'il zayıfları: ע״ו, פ״נ, פ״גרונית, ל״גרונית
- Dört harfli kökler (מרובעים) için ayrı motor: תכנן, ארגן, שכנע
- Hitpa'el metatezi (הִסְתַּדֵּר, הִשְׁתַּנָּה) üç harfli ve ל״ה ailelerinde
- Harekeli / harekesiz (ktiv male) / Latin okunuş — üç yazım birden
- Sin harfi (שׂ) desteği

**Veri**
- 352 kök+binyan çifti, 284 ayrı kök, 8.346 üretilen çekim biçimi
- A1 / A2 / B1 / B2 seviyelerine ayrılmış
- 100+ kalıp ifade, birebir çevirileri ve kullanım notlarıyla
- Alfabe: 22 harf + 5 sofit, karıştırılan harf eşleştirmeleri, gematria
- 9 hareke, harekeliden harekesize geçiş alıştırması
- Gizra artık elle yazılmıyor, kökün harflerinden türetiliyor

**Arayüz**
- Sol kenar çubuğu: seviye sekmeleri (A1/A2/B1/B2) + temeller + fiil motoru
- VERB Hebrew sayfası: arama, tam çekim tablosu, kardeş binyanlar,
  çekim tablosundan üretilen örnek cümleler
- Seviye sayfaları: o seviyenin dilbilgisi hedefi, fiilleri ve kalıpları
- Altı oyun: Harf Avı, Hareke Ustası, Kök Avcısı, Binyan Eşleme,
  Zaman Makinesi, Kulak Testi
- Koyu/açık tema, telefon çekmecesi, PWA

**Seslendirme**
- Katmanlı çözüm: cihazdaki İbranice ses → çevrimiçi seslendirme → dürüst hata
- Hiçbiri yoksa sessiz kalmaz, kullanıcıya nedenini ve çözümünü söyler

**Test**
- 112 birim testi
- Çekimler standart ulpan tablolarına karşı doğrulanıyor
- Katalog testi reddedilen veri satırı olursa düşer
- Sayfa duman testleri: menüdeki her adresin gerçekten sayfa açtığı doğrulanıyor
