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
