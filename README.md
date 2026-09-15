# Shoresh — שֹׁרֶשׁ

Sıfırdan Modern İbranice (İvrit) öğrenme motoru. Türkçe arayüz, A1 → B1.

> **Shoresh** (שורש) İbranicede "kök" demektir. İbranicede her fiil üç harfli bir
> kökten doğar ve yedi kalıptan (binyan) birine oturur. Bu uygulamanın temel iddiası
> şu: fiil tek tek ezberlenmez, **kalıp** öğrenilir, çekimi motor üretir.

## Ne var

| Alan | Durum |
|---|---|
| Alef-Bet — 22 harf + 5 sofit | ✅ Tam veri, karıştırılan harf eşleştirmeleri, gematria, telaffuz notları |
| Harekeler (ניקוד) — 9 ünlü | ✅ Ses grubuna göre, harekeli → harekesiz geçiş alıştırması |
| Binyan çekim motoru | ✅ 7 binyan, shlemim kökler için tam tablo (42 birim testi) |
| Fiil kataloğu | 🚧 66 kök+binyan çifti; hedef 2000+ |
| Zayıf kökler (gzarot) | ⛔ Henüz yok — açık tablo gerekiyor |
| SRS / günlük doz | ⛔ Henüz yok |

## Çekim motoru

Projenin çekirdeği `src/engine/`:

- **`niqqud.ts`** — üç yazım biçimi arasındaki dönüşüm:
  `vocalized` (harekeli, yeni başlayan bunu okur), `plain` (harekesiz *ktiv male*,
  İsrail'de fiilen yazılan biçim), `translit` (Türkçe ses değerleriyle okunuş).
- **`binyan.ts`** — 7 binyanın çekim şablonları. Kök harfleri kalıba oturur,
  begadkefat dageşi, sofit dönüşümü ve hitpa'el metatezi (הִתְסַדֵּר değil
  **הִסְתַּדֵּר**) kural olarak uygulanır.

Motor yalnızca **shlemim** (tam kök) için doğrudur. Zayıf kökler kalıbı kırar;
katalog onları reddeder ve `CATALOG_ISSUES` içinde raporlar — sessizce yanlış
çekim üretmez.

### Neden kuralla üretiliyor

2000 fiil × ~40 biçim = 80.000 çekim. Elle yazılırsa hem denetlenemez hem de
her düzeltme 40 satıra dokunur. Kural yazılır, birim testle kilitlenir,
veri yalnızca kök + binyan + anlam olarak tutulur.

## Komutlar

```bash
npm run dev        # http://localhost:5400
npm run verify     # typecheck + lint + birim testleri
npm run test       # yalnız birim testleri
npm run build      # üretim derlemesi
```

## Mimari

```
src/types/hebrew.ts    Domain modeli — kök, binyan, gizra, çekim
src/engine/niqqud.ts   Hareke katmanı (saf)
src/engine/binyan.ts   Çekim şablonları (saf)
src/data/alefbet.ts    Alfabe + harekeler
src/data/roots.ts      Kök tablosu (boru ayraçlı ham veri)
src/data/catalog.ts    Doğrulayıcı → kanonik HebrewVerb[]
src/pages/             Sayfalar
src/lib/speech.ts      he-IL seslendirme (Web Speech API)
```

`engine/` hiçbir zaman `lib/` veya `pages/` içe aktarmaz — saf kalır, böylece
her kural birim testle kilitlenebilir.

## Veri kaynağı

Kök listesi, anlamlar ve öğretim notları bu proje için yazıldı. Çekimler
kural motoruyla üretiliyor; beklenen biçimler standart ulpan dilbilgisi
tablolarına karşı test ediliyor (`tests/unit/binyan.test.ts`).

Taranan açık veri setleri (`roni5604/hebrew-words-db`, `eyaler/hebrew_wordlists`)
kök/binyan/hareke/anlam açıklaması taşımadığı için kullanılmadı.
