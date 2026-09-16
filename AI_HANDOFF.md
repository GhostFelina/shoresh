# Devir belgesi — bu projeyi devralan yapay zekâ için

> **Bunu ilk oku.** Sonra `PROJECT_STATE.md` (ölçülen sayılar, otomatik üretilir).
> İkisi ~600 satır; projenin tamamı 20.000 satır. Amacı tam olarak bu: kodu
> baştan sona okumadan devam edebilmek.

---

## 0. Otuz saniyede

**Shoresh** — sıfırdan Modern İbranice öğreten uygulama. Arayüz Türkçe, hedef
A1→B2. Kullanıcı **başkası için** yaptırıyor.

```
Konum   C:\Users\User\Desktop\Shoresh
Depo    github.com/GhostFelina/shoresh   (private)
Canlı   https://shoresh-ivrit.vercel.app
Dev     npm run dev            → http://localhost:5400
Doğrula npm run verify         → typecheck + lint + birim + E2E
E2E     npm run test:e2e       → yalnızca tarayıcı testleri
Durum   npm run state          → PROJECT_STATE.md yeniler
Yedek   npm run checkpoint     → zip + git etiketi
```

**Devam etmek için:** `PROJECT_STATE.md` oku → §7'deki "Sıradaki işler"e bak →
§5'teki sürüm yordamını uygula. Kodu taramaya gerek yok; §4 nerede ne olduğunu
söylüyor.

---

## 1. Değiştirilemez kurallar

Bunlar kullanıcının açık talimatı ya da yaşanmış bir hatanın dersi. İhlal
edilirse iş geri alınır.

| Kural | Neden |
|---|---|
| **"Cortexia" adı kullanılmaz** | Proje başkası için yapılıyor; marka bağımsız: Shoresh |
| **Chrome DevTools MCP yasak** | Kullanıcının açık talimatı. Playwright serbest ve kullanılıyor |
| **GitHub private, Vercel herkese açık** | Kullanıcının açık talimatı |
| **Her sürümde changelog girdisi zorunlu** | Test `LATEST.version === APP_VERSION` bekliyor; yazılmazsa kırılır |
| **Deploy sonrası alias ŞART** | Vercel her deploy'a yeni URL verir; `shoresh-ivrit.vercel.app` elle bağlanır |
| **Motor uydurma çekim üretmez** | Üretemediği birleşimi reddeder (`CATALOG_ISSUES`) ve test düşer |

---

## 2. Mimarinin tek cümlesi

> **Fiiller veri değil, üretilen sonuçtur.**

Veri yalnızca `kök | binyan | anlam | seviye | skorlar` tutar. `src/engine/`
kökün harflerinden gizra'yı (zayıflık sınıfı) çıkarır, binyan+gizra'ya uygun
şablonu seçer ve 24 biçimi üretir. 445 fiil × ~24 = **10.568 çekim**, hiçbiri
elle yazılmadı.

Motor bir birleşimi üretemiyorsa **satırı reddeder**. Tam kök şablonuna düşüp
"bir şeyler üretmek" en kötü seçenek olurdu: öğrenciye var olmayan bir fiil
biçimi öğretmek, o fiili hiç göstermemekten beterdir.

Aynı ilke her yerde tekrar ediyor:

- **Renkler** veri (`lib/palette.ts`), CSS sabiti değil → birim test her tonu
  WCAG eşiğinden geçirebiliyor
- **Sürüm notları** veri (`data/changelog.ts`) → test "kazanım bölümü boş
  bırakılamaz" diye zorluyor
- **Ödül kuralları** saf fonksiyon (`engine/reward.ts`) → "şişirme yok" testle
  zorlanıyor
- **Dersler** katalogdan üretiliyor → motor bir şablonu düzeltince açıklama da
  düzeliyor, eskimiyor

---

## 3. Yaşanmış tuzaklar — tekrar düşme

Her biri gerçekten oldu ve ölçümle bulundu. Yenisini eklersen buraya yaz.

### Kod

1. **İki yazma aynı satırda yarışır.** `recordAnswer` (tekrar programı) ve
   `awardAnswer` (XP) AYNI gün satırına dokunuyor. İkisi de işlem (transaction)
   dışında oku-değiştir-yaz yaparsa biri ötekini ezer. Belirti: XP birikiyor ama
   seri hep 0. → Gün satırına dokunan her şey `db.transaction('rw', db.days, …)`
   içinde olmalı.

2. **Yüzde yükseklik `auto` kapsayıcıda çözülmez.** Grafik çubukları görünmez
   olur. → Yükseklik flex ile kesinleşmiş bir raya `absolute` konumla yerleştir.

3. **`new Date('YYYY-MM-DD')` UTC gece yarısı sayar.** UTC'nin gerisindeki
   dilimlerde gün etiketi kayar. → Parçalayıp `new Date(y, m-1, d)` kur.

4. **Kontrast oranı renk FARKINI ölçmez.** Yalnızca parlaklığa bakar; amber ile
   turkuazı "aynı" sayar. → İki vurgunun ayrışması için algısal uzaklık
   (`colorDistance`, redmean) kullan.

5. **Sürümü `define` ile gömme.** Dev sunucusunda uygulanmıyor, tarayıcıya
   tanımsız değişken gidiyor. → `src/generated/version.ts` üretiliyor.

### İbranice

6. **Hirik male:** işaretsiz `י`, önceki harf hirik taşıyorsa SESSİZDİR.
   `הוֹלְכִים` = "holhim", "holhiym" değil. Kural `ו` için vardı, `י` için
   unutulmuştu ve 10.568 biçimin 2.522'sini bozuyordu.

7. **Sondaki `ך` her zaman sessiz şva taşır:** `חָתַךְ`. Yalnızca HAREKELİ
   yazıma eklenir — harekesize sızarsa "harekesizde hareke kalmaz" testi kırılır.

8. **`ה` gırtlaksı olarak `ח` gibi değil `א/ע` gibi davranır:** hatef alır.
   `לַהֲפֹךְ`, `לַהְפּוֹך` değil.

9. **Kelime sonundaki `ה` okunmaz:** `קָנָה` = "kana". Bütün ל״ה fiillerini
   etkiler — en kalabalık sınıf.

10. **Gelecek zamanda "sen (eril)" ile "o (dişil)" AYNI biçim** (`תכתוב`).
    Çeldirici üretirken yinelenen şık çıkarır. Bu bir kusur değil, öğretilecek
    bir gerçek.

11. **Hareke dersinde cevap karşılaştırması harekeyi SİLMEMELİ.** Normalde
    siliniyor (öğrenci ekran klavyesinde hareke yazmasın diye) ama orada konu
    tam olarak hareke: `אָ` ile `אַ` silinince ikisi de `א` olur.

### Araç

12. **Bash aracına heredoc ile TS yazma.** Metindeki tek tırnak (`pi'el`,
    `B1/B2'nin`) alıntıyı bozuyor ve komut çalışmıyor. → Kod dosyaları için
    `Write` aracı; prozada `’` (U+2019) kullan.

13. **Playwright her açılışta TEMİZ profil kullanır.** Bir betikte oyun oynayıp
    başka betikte ilerlemeye bakarsan boş görürsün. Aynı betikte yap.

14. **Gizli masaüstü menüsü telefon testini yanıltır.** Kenar çubuğu
    telefonda gizlense de DOM'da duruyor ve aynı bağlantıları taşıyor.
    `nav a` seçicisi DOM sırasına göre GİZLİ olanı seçer. → `nav:visible a`.

15. **Playwright projeleri birbirinin dosyasını alır.** Telefon projesine
    `testMatch` koymak yetmiyor; masaüstü projesine de `testIgnore`
    gerekiyor, yoksa mobil testleri masaüstünde de koşar ve kırılır.

16. **Sürüm kutusu testleri engeller.** Otomasyon betiğinin başında
    `localStorage.setItem('shoresh.seenVersion', '<güncel sürüm>')` yaz; bilinmeyen
    bir sürüm yazarsan kutu yine açılır ve tıklamaları yutar.

---

## 4. Nerede ne var

```
api/tts.js                 Seslendirme vekili (§6)
playwright.config.ts       E2E yapılandırması (webServer kendini başlatır)
scripts/
  checkpoint.mjs           Yedek: zip + git etiketi
  state.mjs                PROJECT_STATE.md üretir
  shots.mjs                Playwright ekran görüntüleri (14 sayfa × 2 boyut × 2 tema)
  audio-check.mjs          Ses tanılaması — tarayıcı içinde ölçer
src/
  engine/                  DİLBİLGİSİ — saf, arayüzden bağımsız
    binyan.ts              7 binyan tam kök şablonu + conjugate()
    gzarot.ts              Zayıf kök şablonları (1. parti)
    gzarot-more.ts         Zayıf kök şablonları (2. parti)
    morphology.ts          Ortak yardımcılar (dot/strong/light, ekler, metatez)
    niqqud.ts              Üç yazım: harekeli / harekesiz / okunuş
    detect-gizra.ts        Kökün harflerinden zayıflık sınıfı
    srs.ts                 FSRS sarmalayıcı
    reward.ts              XP, rütbe, rozet — SAF, test edilebilir
  data/                    İÇERİK — hepsi doğrulamadan geçer
    roots-a1..b2.ts,       Kök tabloları (boru ile ayrılmış satırlar)
    roots-extra.ts
    catalog.ts             Satırları doğrular → HebrewVerb[]; hata = CATALOG_ISSUES
    irregular.ts           14 düzensiz fiil, elle yazılmış
    lexicon-*.ts           888 kelime
    phrases*.ts            239 kalıp
    sentences.ts           74 elle yazılmış örnek cümle
    alefbet.ts             27 harf + 9 hareke
    changelog*.ts          Sürüm notları (kutu + geçmiş paneli bunu okur)
  features/
    games/engine.ts        11 oyunun soru üreticileri
    teacher/lesson.ts      Ders altyapısı + 1. parti dersler + kayıt
    teacher/lessons-extra.ts  2. parti dersler (harf, hareke, gelecek, emir…)
    rewards/RewardPanels.tsx  İlerleme sayfasının ödül bölümleri
  lib/                     TARAYICI KATMANI
    speech.ts              İbranice seslendirme (cihaz → /api/tts → dürüst hata)
    coach.ts               TÜRKÇE öğretmen sesi (cihaz sesi, ağ gerekmez)
    db.ts                  Dexie şeması (sürüm 2)
    progress.ts            SRS ↔ veritabanı
    rewards.ts             Ödül ↔ veritabanı
    palette.ts             5 palet, kontrast ölçümü
    version.ts             APP_VERSION + BUILD_TIME
  app/
    Shell.tsx              Kabuk: kenar çubuğu, üst bant, altbilgi
    nav.ts                 Menü tanımı (test rotalarla eşleşmesini zorluyor)
    Appearance.tsx         Tema + palet
    Rewards.tsx            XP bağlamı, üst bant göstergesi, kutlama
    WhatsNew.tsx           Sürüm duyuru kutusu
    VersionHistory.tsx     Sürüm geçmişi paneli
  pages/                   12 sayfa
tests/unit/                16 dosya, 398 test
```

---

## 5. Sürüm yordamı — sırayla, atlamadan

```bash
# 1. Doğrula
npm run verify                      # typecheck + lint + birim + E2E

# 2. Sürümü yükselt (işin ağırlığına göre)
npm version 1.X.0 --no-git-tag-version

# 3. Changelog girdisi YAZ  → src/data/changelog.ts, RECENT dizisinin başına
#    version, date, releasedAt (ŞİMDİKİ an, ISO+dilim), title, summary,
#    changes[], benefits[]  ← benefits boş bırakılamaz, test kırılır

# 4. Derle (BUILD_TIME burada damgalanır)
npm run build

# 5. Testler yine geçsin (changelog testi sürüm eşleşmesini denetler)
npm run test

# 6. Commit + push
git add -A && git commit -F <mesaj-dosyası>
git push origin main

# 7. Deploy  → çıktıdaki "Production" URL'sini al
npx vercel deploy --prod --yes

# 8. ALIAS — atlanırsa canlı adres eski sürümde kalır
npx vercel alias set <yeni-url> shoresh-ivrit.vercel.app

# 9. Yedek + etiket
npm run checkpoint

# 10. Durum belgesi
npm run state
```

**Sürüm numarası:** yeni özellik → minor (`1.X.0`), yalnızca düzeltme → patch
(`1.15.X`), kırıcı değişiklik → major.

**Commit mesajı üslubu:** ne yapıldığı değil NEDEN yapıldığı. Bir hata
düzeltildiyse belirtisi, kök nedeni ve nasıl ölçüldüğü yazılır. Geçmiş
commit'lere bak, üslup oradan görünür.

---

## 6. Ses — üç kez "düzeltildi", dördüncüde ölçülerek çözüldü

Bu bölüm ayrı duruyor çünkü en çok zaman kaybettiren konu buydu ve tekrar
düşülmesi kolay.

**Ölçülen gerçek:** Seslendirme uç noktası SUNUCUDAN çağrıldığında 200 ve
geçerli MP3 dönüyor, TARAYICIDAN çağrıldığında 404 veriyor — Referer/Origin
taşıyan isteği reddediyor. `<audio>` 404 gövdesini ses sanıp "Format error"
veriyordu.

**Çözüm:** `api/tts.js` sunucu vekili. Ayrıca `vercel.json` içindeki tek sayfa
yönlendirmesi `/api/` yolunu **dışlamalı** — dışlamazsa aynı hata üretimde
geri gelir.

**İkinci ölçüm sonucu:** Cihazlarda İbranice sesi YOK ama **Türkçe sesi VAR**
(Windows Tolga, Android Google, iOS Yelda). Öğretmen modunun Türkçe anlatımı
bu yüzden ağsız ve bedava (`lib/coach.ts`).

**Tanılama:** `npm run audio:check` — tarayıcı içinde katman katman ölçer.
Ses konusunda tahmin yürütme, bunu çalıştır.

---

## 7. Sıradaki işler

Kullanıcının verdiği, sırası belirlenmiş liste. Biteni buradan sil.

1. ~~Yedek/checkpoint + devir belgesi~~ — **v1.16.0'da yapıldı**
   ~~Geri bildirim formu~~ — **v1.19.0/v1.19.1'de yapıldı, canlıda doğrulandı**
2. ~~Test motoru~~ — **v1.17.0'da yapıldı.** 39 E2E testi, iki proje
   (masaüstü + telefon). `npm run verify` artık dördünü birden koşuyor.
3. ~~VERB sayfası çalışma alanı~~ — **v1.18.0'da yapıldı.** Genişlik artık
   sayfanın kendi kararı (`usePageWidth`).
4. **Çok dilli mimari.** İbranice bitince Korece gelecek. İki DİK eksen var ve
   karıştırılmamalı: *arayüz dili* (TR/EN) ve *öğrenilen dil* (he/ko).
   Hedeflenen yapı: `src/languages/hebrew/{engine,data,games,teacher,pages}` +
   `LanguageModule` sözleşmesi + `/he/...` yolları. Dile bağımsız olanlar
   (`srs`, `db`, `reward`, `palette`, kabuk) `core/` altında kalır.
   **Dikkat:** SRS anahtarları dil öneki almalı (`he:verb:…`), yoksa Korece
   ilerlemesi İbranice ile çakışır. Mevcut anahtarların hepsi İbranice, göç
   gerekecek.
5. **Arayüz dili TR/EN.** Ölçüldü: ~400 arayüz metni + ~300 ders şablonu
   cümlesi. Ders metinleri şablondan üretildiği için şablonu çevirmek 2.753
   birimi otomatik kapatıyor.
6. **İçerik çevirisi (EN).** ~2.150 veri satırı: 641 fiil anlamı, 1.033 kelime
   anlamı, 478 kalıp. Bu arayüz çevirisi değil içerik yerelleştirmesi; ayrı
   sürüm olmalı.

### Supabase — kurulu ve çalışıyor

| | |
|---|---|
| Proje | **Shoresh** — `cfcoosvtwutnsvagckdo`, eu-central-1, ÜCRETSİZ plan |
| Org | Ghost Samurai (`qkilnwrfkntefcmqdlie`) |
| Tablo | `public.feedback` — RLS AÇIK, politika YOK |
| Göç | `supabase/migrations/20260916210000_feedback.sql` |
| Gizli anahtar | Vercel `SUPABASE_SECRET_KEY` + yerel `.env.local` (ikisi de depoda değil) |
| Gelen kutusu | `/gelen-kutusu`, parola Vercel `FEEDBACK_ADMIN_KEY` |

**Neden bu proje:** Kullanıcının verdiği proje referansı
(`nsevrzbipqxdvwequrui`) BAŞKA bir Supabase hesabına ait — `supabase login`
kullanıcının tarayıcı oturumuyla yetkilendirdi ve Management API o projeye
`403 "Your account does not have the necessary privileges"` döndü. Erişilebilen
hesapta yeni proje açıldı.

**Neden mevcut aktif proje kullanılmadı:** Göç çalıştırmak veritabanı parolası
istiyor ve "Cortexia Language" projesinin parolası elde yok. Yeni projede parola
oluşturma anında belirlendiği için kurulum tamamen otomatik yapılabildi.

**Güvenlik modeli — ölçüldü:**
```
anon okuma     → []     (RLS sızdırmıyor)
anon yazma     → 401    new row violates row-level security policy
gizli anahtar  → çalışıyor, yalnızca sunucuda
parolasız kutu → 401
```
Politika VERİLMEDİ; bu bilinçli. Politika verilseydi adresi bilen herkes
yazabilir, okuma izni de verilseydi bütün bildirimler herkese açık olurdu.

---

## 8. Nasıl çalışılıyor

Kullanıcının bu projede beklediği üslup — commit geçmişi bunu gösteriyor:

- **Tahmin etme, ölç.** "Ses çalışmıyor" üç kez tahminle düzeltilmeye çalışıldı
  ve üçü de boşa gitti. Dördüncüde tarayıcı içinde ölçüldü ve on dakikada
  çözüldü. Bir şeyin neden bozuk olduğunu bilmiyorsan ölçen bir betik yaz.
- **Testi kuralın kendisi için yaz.** İyi test "çalışıyor mu" diye sormaz,
  "kural çiğnenmiş mi" diye sorar. Örnekler: renk kontrastı, ödül şişmesi,
  changelog kazanım bölümü, menü–rota eşleşmesi.
- **Test seni yanlış yakalarsa testi düzelt, kodu değil.** Kontrast oranıyla
  renk farkını ölçmek yanlıştı; ölçüt değişti, palet değil.
- **Yorum NE değil NEDEN anlatır.** Özellikle "neden bu yol seçilmedi".
- **Eksik içerik uydurma.** Motor çekemiyorsa satır reddedilir; kelime anlamı
  bilinmiyorsa satır yazılmaz.
- **Bitmiş iş = commit + push + deploy + alias + yedek.** Yarısı sayılmaz.

---

## 9. Codex CLI ile devralma

Kullanıcı "projeye Claude'ın kaldığı yerden devam et" dediğinde:

```bash
cd C:\Users\User\Desktop\Shoresh
cat AI_HANDOFF.md          # bu dosya — kararlar ve gerekçeler
cat PROJECT_STATE.md       # ölçülen durum
npm run verify             # her şey yerinde mi
git log -10 --oneline      # en son ne yapıldı
```

Bu dört adım yeterli. Kod taramaya gerek yok; §4 nerede ne olduğunu, §3 nereye
düşülmemesi gerektiğini, §7 sırada ne olduğunu söylüyor.

**Devralan da bu belgeyi güncel tutmalı:** yeni bir tuzağa düşüldüyse §3'e
yazılır, bir iş bittiyse §7'den silinir, mimari karar değiştiyse §2 düzeltilir.
Eski bir devir belgesi, belge olmamasından daha tehlikelidir.
