/**
 * Kök tablosu — ham veri.
 *
 * BİÇİM: kök | binyan | gizra | türkçe anlamlar (; ile) | CEFR | sıklık,ulpan,konuşma,yazı
 *
 * NEDEN BORU AYRAÇLI METİN: 2000+ satır JSON olarak yazılırsa hem dosya
 * dört katına çıkar hem de satır satır gözle denetlenemez hâle gelir.
 * Bu tablo bir insanın okuyup düzeltebileceği biçimde duruyor;
 * `catalog.ts` onu doğrulayıp kanonik nesneye çeviriyor. Geçersiz satır
 * sessizce atılmaz, `CATALOG_ISSUES` içinde raporlanır ve testi düşürür.
 *
 * KAPSAM NOTU: Bu dosyadaki kökler SHLEMIM'dir — çekim motoru bunları
 * kuralla türetir. Zayıf kökler (ל״ה, ע״ו, פ״נ, gırtlaksılar) kalıbı
 * kırdığı için `irregular.ts` içinde açık tabloyla tutulur.
 */

/** Pa'al — temel etken binyan. Günlük konuşmanın omurgası. */
export const PAAL_TABLE = `
כתב|paal|shlemim|yazmak|A1|92,95,85,95
למד|paal|shlemim|öğrenmek; çalışmak (ders)|A1|95,98,92,88
שמר|paal|shlemim|korumak; saklamak|A1|82,80,78,85
סגר|paal|shlemim|kapatmak|A1|88,90,90,78
גמר|paal|shlemim|bitirmek|A1|85,82,88,70
זכר|paal|shlemim|hatırlamak|A1|87,85,90,80
לבש|paal|shlemim|giymek|A1|78,85,80,62
משך|paal|shlemim|çekmek|A2|70,62,68,68
רקד|paal|shlemim|dans etmek|A2|62,70,68,50
פגש|paal|shlemim|karşılaşmak; buluşmak|A2|74,72,78,66
בדק|paal|shlemim|kontrol etmek; muayene etmek|A2|76,78,74,76
גדל|paal|shlemim|büyümek|A2|72,68,70,72
שכב|paal|shlemim|yatmak; uzanmak|A2|70,72,74,58
קפץ|paal|shlemim|zıplamak; atlamak|A2|58,60,62,48
רשם|paal|shlemim|kaydetmek; yazmak (not)|A2|68,70,62,74
תפס|paal|shlemim|yakalamak; tutmak|A2|66,58,70,60
מכר|paal|shlemim|satmak|A1|80,82,82,76
גנב|paal|shlemim|çalmak|B1|55,48,58,52
ספר|paal|shlemim|saymak|A2|64,66,60,62
סרק|paal|shlemim|taramak|B1|42,38,44,40
חבש|paal|shlemim|sarmak (yara); takmak (şapka)|B1|38,34,36,40
רגם|paal|shlemim|taşlamak|B1|22,18,20,32
כבש|paal|shlemim|fethetmek; zapt etmek|B1|48,40,42,60
מלך|paal|shlemim|hükmetmek; kral olmak|B1|40,32,30,58
קשר|paal|shlemim|bağlamak; düğümlemek|B1|58,54,56,60
`;

/** Pi'el — yoğunluk / ettirgenlik. Orta harf dageşli. */
export const PIEL_TABLE = `
דבר|piel|shlemim|konuşmak|A1|98,99,99,90
בקש|piel|shlemim|istemek; rica etmek|A1|88,90,88,86
ספר|piel|shlemim|anlatmak|A1|86,88,90,80
למד|piel|shlemim|öğretmek|A1|84,90,82,80
שלם|piel|shlemim|ödemek|A1|85,88,88,78
בשל|piel|shlemim|pişirmek|A1|76,82,80,58
סדר|piel|shlemim|düzenlemek; toplamak|A2|74,76,76,66
טפל|piel|shlemim|ilgilenmek; bakmak|B1|66,62,68,64
קבל|piel|shlemim|almak; kabul etmek|A1|90,92,90,88
נגן|piel|shlemim|çalmak (enstrüman)|A2|64,70,66,52
צלם|piel|shlemim|fotoğraf çekmek|A2|68,72,70,56
בלבל|piel|shlemim|karıştırmak; kafasını karıştırmak|B1|52,48,56,44
גדל|piel|shlemim|yetiştirmek; büyütmek|B1|58,54,56,60
בטל|piel|shlemim|iptal etmek|A2|70,72,72,68
שנה|piel|shlemim|değiştirmek|B1|62,58,60,70
`;

/** Hif'il — ettirgen: "yaptırmak". */
export const HIFIL_TABLE = `
כנס|hifil|shlemim|sokmak; içeri almak|A2|72,74,74,66
דפס|hifil|shlemim|basmak; yazdırmak|A2|62,66,58,64
זמן|hifil|shlemim|davet etmek; sipariş vermek|A1|80,84,82,72
סבר|hifil|shlemim|açıklamak|A2|78,82,80,74
פסק|hifil|shlemim|durdurmak; ara vermek|A2|74,76,78,66
שלם|hifil|shlemim|tamamlamak|B1|64,62,60,68
לבש|hifil|shlemim|giydirmek|B1|48,52,50,40
רגש|hifil|shlemim|hissettirmek; duygulandırmak|B1|46,42,48,44
קשב|hifil|shlemim|dinlemek; kulak vermek|A1|82,88,84,70
צלח|hifil|shlemim|başarmak|B1|60,56,58,66
`;

/** Hitpa'el — dönüşlü / karşılıklı. */
export const HITPAEL_TABLE = `
לבש|hitpael|shlemim|giyinmek|A1|78,86,82,58
שמש|hitpael|shlemim|kullanmak; yararlanmak|A2|80,84,78,80
סדר|hitpael|shlemim|idare etmek; yoluna koymak|A2|72,74,80,58
רגש|hitpael|shlemim|heyecanlanmak|A2|66,68,72,56
כתב|hitpael|shlemim|yazışmak|B1|48,46,44,56
זקן|hitpael|shlemim|yaşlanmak|B1|44,40,42,46
קדם|hitpael|shlemim|ilerlemek; gelişmek|B1|62,58,60,70
גלח|hitpael|shlemim|tıraş olmak|A2|54,62,58,38
פשט|hitpael|shlemim|soyunmak|A2|52,60,56,36
רחק|hitpael|shlemim|uzaklaşmak|B1|50,46,48,58
`;

/** Nif'al — edilgen / dönüşlü. */
export const NIFAL_TABLE = `
כנס|nifal|shlemim|girmek|A1|90,94,92,80
כתב|nifal|shlemim|yazılmak|A2|64,60,56,72
סגר|nifal|shlemim|kapanmak|A2|68,70,70,64
שמר|nifal|shlemim|korunmak; saklanmak|B1|54,50,52,60
פגש|nifal|shlemim|buluşmak (karşılıklı)|A2|66,68,70,58
בדק|nifal|shlemim|kontrol edilmek|B1|48,46,44,58
`;

/** Bütün ham tablolar — katalog bunları sırayla işler. */
export const ALL_TABLES = [
  PAAL_TABLE,
  PIEL_TABLE,
  HIFIL_TABLE,
  HITPAEL_TABLE,
  NIFAL_TABLE,
];
