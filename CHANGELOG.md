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
