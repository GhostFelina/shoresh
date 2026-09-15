/**
 * A1 — ilk kelimeler.
 *
 * SEÇİM ÖLÇÜSÜ: Bir ulpanın ilk iki ayında gerçekten geçen, günlük
 * konuşmanın omurgasını kuran fiiller. "Sıklık listesinde ilk 200'de"
 * olması yetmez; öğrencinin İLK GÜNDEN cümle kurabilmesi gerekir —
 * bu yüzden אוֹכֵל, רוֹצֶה, הוֹלֵךְ gibi fiiller edebî ama seyrek
 * köklerin önüne geçiyor.
 *
 * Biçim: kök | binyan | türkçe anlamlar (;) | CEFR | sıklık,ulpan,konuşma,yazı [| gizra]
 * Altıncı alan yalnızca kökten türetilemeyen sınıflamalar için.
 */

/** Pa'al — temel etken binyan. A1'in büyük çoğunluğu burada. */
export const A1_PAAL = `
כתב|paal|yazmak|A1|92,95,85,95
למד|paal|öğrenmek; ders çalışmak|A1|95,98,92,88
קרא|paal|okumak; seslenmek|A1|93,96,88,94
אכל|paal|yemek|A1|96,98,95,80
שתה|paal|içmek|A1|94,97,93,76
ישב|paal|oturmak|A1|90,95,90,82
עמד|paal|ayakta durmak; durmak|A1|82,86,80,80
קום|paal|kalkmak; ayağa kalkmak|A1|84,88,86,72
רצה|paal|istemek|A1|97,99,98,85
אהב|paal|sevmek|A1|91,94,93,82
ראה|paal|görmek|A1|96,97,95,90
שמע|paal|duymak; dinlemek|A1|94,96,93,86
עשׂה|paal|yapmak; etmek|A1|98,99,97,92
קנה|paal|satın almak|A1|89,94,90,74
בנה|paal|inşa etmek; kurmak|A1|74,78,70,80
ענה|paal|cevap vermek|A1|80,88,82,78
פנה|paal|dönmek; yönelmek|A1|70,74,70,74
גמר|paal|bitirmek|A1|83,84,86,70
סגר|paal|kapatmak|A1|86,90,88,76
פתח|paal|açmak|A1|88,92,88,80
שלח|paal|göndermek|A1|84,86,82,84
זכר|paal|hatırlamak|A1|87,88,90,80
שכח|paal|unutmak|A1|85,88,88,74
לבש|paal|giymek|A1|76,84,78,60
מכר|paal|satmak|A1|78,82,80,76
שמר|paal|korumak; saklamak|A1|80,80,78,84
חשב|paal|düşünmek; sanmak|A1|90,90,92,86
עבד|paal|çalışmak|A1|92,96,92,84
עזר|paal|yardım etmek|A1|85,90,88,78
חזר|paal|geri dönmek; tekrarlamak|A1|86,90,88,78
בדק|paal|kontrol etmek|A1|76,80,74,78
גדל|paal|büyümek|A1|72,74,70,74
שאל|paal|sormak|A1|91,95,92,82
בחר|paal|seçmek|A1|79,80,78,82
צחק|paal|gülmek|A1|68,74,72,54
רחץ|paal|yıkamak|A1|64,76,68,50
מצא|paal|bulmak|A1|89,90,88,88
קרה|paal|olmak; meydana gelmek|A1|82,80,84,82
בכה|paal|ağlamak|A1|66,70,68,56
שׂמח|paal|sevinmek; mutlu olmak|A1|70,78,74,62
גור|paal|oturmak (ikamet etmek)|A1|85,92,88,70
רוץ|paal|koşmak|A1|72,78,74,60
שׂים|paal|koymak|A1|83,86,86,72
שיר|paal|şarkı söylemek|A1|69,78,72,56
טוס|paal|uçmak (uçakla)|A1|64,72,68,54
נפל|paal|düşmek|A1|74,76,74,70
סבל|paal|acı çekmek; katlanmak|A1|58,58,58,64
רקד|paal|dans etmek|A1|60,70,66,48
שכב|paal|yatmak; uzanmak|A1|68,72,72,58
נשם|paal|nefes almak|A1|62,64,62,58|shlemim
לחץ|paal|basmak; sıkmak|A1|64,62,64,62
טעם|paal|tatmak|A1|58,64,60,50
`;

/** Pi'el — yoğunluk / ettirgenlik. */
export const A1_PIEL = `
דבר|piel|konuşmak|A1|98,99,99,90
בקש|piel|istemek; rica etmek|A1|88,92,88,86
ספר|piel|anlatmak|A1|86,90,90,80
למד|piel|öğretmek|A1|84,92,82,80
שלם|piel|ödemek|A1|85,90,88,78
בשל|piel|pişirmek|A1|76,84,80,58
קבל|piel|almak; kabul etmek|A1|90,92,90,88
חפשׂ|piel|aramak|A1|87,90,88,78
סדר|piel|düzenlemek; toplamak|A1|74,78,76,66
נסה|piel|denemek|A1|82,84,84,76
חכה|piel|beklemek|A1|86,90,88,72
נגן|piel|çalmak (enstrüman)|A1|64,72,66,52
צלם|piel|fotoğraf çekmek|A1|68,74,70,56
בטל|piel|iptal etmek|A1|70,74,72,68
`;

/** Hif'il — ettirgen. */
export const A1_HIFIL = `
זמן|hifil|davet etmek; sipariş vermek|A1|80,86,82,72
סבר|hifil|açıklamak|A1|78,84,80,74
קשב|hifil|dinlemek; kulak vermek|A1|82,90,84,70
פסק|hifil|durdurmak; ara vermek|A1|74,78,78,66
כנס|hifil|sokmak; içeri almak|A1|72,76,74,66
חזר|hifil|geri vermek; iade etmek|A1|70,76,74,64
תחל|hifil|başlamak|A1|88,92,88,84|shlemim
נגע|hifil|varmak; ulaşmak|A1|89,94,90,82|pe-nun
בין|hifil|anlamak|A1|93,96,94,86
כין|hifil|hazırlamak|A1|80,86,82,72
`;

/** Hitpa'el — dönüşlü. */
export const A1_HITPAEL = `
לבש|hitpael|giyinmek|A1|78,88,82,58
רחץ|hitpael|duş almak; yıkanmak|A1|70,82,76,50
שמש|hitpael|kullanmak; yararlanmak|A1|80,86,78,80
רגש|hitpael|heyecanlanmak|A1|66,70,72,56
`;

/** Nif'al — edilgen / dönüşlü. */
export const A1_NIFAL = `
כנס|nifal|girmek|A1|90,96,92,80
`;

export const A1_TABLES = [A1_PAAL, A1_PIEL, A1_HIFIL, A1_HITPAEL, A1_NIFAL];
