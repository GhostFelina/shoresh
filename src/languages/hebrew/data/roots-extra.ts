/**
 * Ek kökler — seviye dosyalarının bıraktığı boşluklar.
 *
 * NEDEN AYRI DOSYA: A1–B2 dosyaları seviyeye göre kurulmuştu ve her biri
 * kendi içinde dengeliydi. Bu dosya o dengeyi bozmadan İKİ eksiği
 * kapatıyor:
 *  1. Günlük konuşmada çok geçtiği hâlde listelerde olmayan fiiller
 *     (לְהִסְתַּכֵּל "bakmak", לְהִצְטָרֵף "katılmak", לְהִתְקַלֵּחַ "duş almak").
 *  2. Aynı kökün BAŞKA binyanı — İbranicede asıl öğrenme sıçraması
 *     budur: כתב "yazmak" biliniyorsa הִתְכַּתֵּב "yazışmak" bedava gelmez,
 *     ama kök tanıdık olduğu için çok daha ucuza gelir.
 *
 * Biçim: kök | binyan | türkçe anlamlar (;) | CEFR | sıklık,ulpan,konuşma,yazı [| gizra]
 */

/** Pa'al — temel etken. */
export const EX_PAAL = `
אסף|paal|toplamak; bir araya getirmek|A2|72,78,74,72
דחה|paal|reddetmek; ertelemek|B1|64,60,60,70
הפך|paal|çevirmek; dönüşmek|B1|70,68,68,74
זרח|paal|doğmak (güneş); parlamak|B2|48,44,42,62
חלה|paal|hastalanmak|B1|66,72,70,60
טעה|paal|yanılmak; hata yapmak|B1|70,76,74,66
מחק|paal|silmek|B1|64,66,64,64
צרח|paal|çığlık atmak|B2|46,42,46,50
קטף|paal|koparmak (meyve); toplamak|B1|52,58,54,50
שקט|paal|sakinleşmek; susmak|B2|50,48,48,56
תקע|paal|takmak; saplamak|B2|52,46,50,52
בלם|paal|frenlemek; durdurmak|B2|48,42,44,54
דרך|paal|basmak; adım atmak|B2|54,50,52,56
זעק|paal|feryat etmek|B2|42,36,40,54
חבש|paal|sarmak (yara); şapka takmak|B2|44,42,42,48
טחן|paal|öğütmek|B2|40,38,38,44
כבה|paal|sönmek|B1|62,66,64,58
לחש|paal|fısıldamak|B1|56,54,58,56
פרס|paal|dilimlemek; yaymak|B2|50,48,48,54
צבט|paal|çimdiklemek|B2|36,34,38,36
שטח|paal|yaymak; sermek|B2|44,40,40,52
בחן|paal|sınamak; incelemek|B1|58,60,54,68
גלש|paal|kaymak; sörf yapmak|B1|54,52,54,52
דלק|paal|yanmak; kovalamak|B2|48,44,44,54
ספג|paal|emmek; yutmak (darbe)|B2|46,42,44,52
קפא|paal|donmak|B2|48,46,46,52
הרס|paal|yıkmak; mahvetmek|B1|60,56,56,66
טפס|paal|tırmanmak|B1|56,58,58,52
יעץ|paal|öğüt vermek|B2|52,50,48,60
`;

/** Pi'el — yoğunlaştıran, çoğu zaman geçişli yapan binyan. */
export const EX_PIEL = `
אבד|piel|kaybetmek|B1|68,70,70,66
בדר|piel|eğlendirmek|B2|44,42,44,44
גדר|piel|tanımlamak; çitle çevirmek|B2|50,46,44,60
זרז|piel|hızlandırmak; acele ettirmek|B2|46,42,44,50
סמן|piel|işaretlemek|B1|58,60,56,60
פקד|piel|denetlemek; komuta etmek|B2|48,44,44,56
רגל|piel|casusluk etmek|B2|36,30,32,44
מהר|piel|acele etmek|A2|76,82,84,64
צלצל|piel|çalmak (zil); telefon etmek|A2|74,80,82,62
קלקל|piel|bozmak|B1|62,66,66,56
שחרר|piel|serbest bırakmak|B1|64,60,60,68
תרגם|piel|çevirmek|B1|66,70,64,70
בלבל|piel|karıştırmak; kafa karıştırmak|B1|60,64,66,54
גלגל|piel|yuvarlamak|B2|46,42,44,48
טלפן|piel|telefon etmek|A2|70,78,80,58
פרסם|piel|yayımlamak; duyurmak|B1|62,58,56,72
רענן|piel|tazelemek; yenilemek|B2|48,44,44,56
שכפל|piel|çoğaltmak; kopyalamak|B2|42,38,38,52
תפקד|piel|işlev görmek|B2|46,40,40,58
`;

/** Hif'il — ettirgen. */
export const EX_HIFIL = `
אמן|hifil|inanmak|B1|72,70,70,74
רשם|hifil|etkilemek; iz bırakmak|B1|60,56,56,64
גשם|hifil|gerçekleştirmek|B2|52,46,44,64
דלק|hifil|yakmak; tutuşturmak|B1|58,60,60,54
טען|hifil|yüklemek; şarj etmek|B1|60,58,58,60
לבן|hifil|açıklığa kavuşturmak|B2|44,38,38,58
מצא|hifil|icat etmek; bulmak|B1|56,52,50,64
פסד|hifil|kaybetmek; zarar etmek|B1|58,56,56,58
רגז|hifil|kızdırmak; sinirlendirmek|B1|56,54,58,50
בדל|hifil|ayırt etmek; ayırmak|B1|58,54,52,66
`;

/** Hitpa'el — dönüşlü ve karşılıklı. Konuşulan İbranicenin bel kemiği. */
export const EX_HITPAEL = `
סכל|hitpael|bakmak; seyretmek|A2|88,94,92,74
צרף|hitpael|katılmak; eklenmek|B1|72,74,72,74
קרב|hitpael|yaklaşmak|B1|64,60,60,68
קלח|hitpael|duş almak|A2|74,84,82,56
נגב|hitpael|kurulanmak|B1|52,60,58,44
עצב|hitpael|üzülmek|B1|58,60,62,56
צלם|hitpael|fotoğraf çektirmek|B2|48,46,48,46
שזף|hitpael|güneşlenmek|B2|40,38,40,38
טפל|hitpael|ilgilenmek; uğraşmak|B1|66,64,64,68
לבט|hitpael|tereddüt etmek|B2|46,40,40,56
חשב|hitpael|hesaplaşmak; göz önüne almak|B2|48,42,42,58
`;

/** Nif'al — edilgen ve dönüşlü. */
export const EX_NIFAL = `
מצא|nifal|bulunmak; -de olmak|A2|86,90,88,82
פתח|nifal|açılmak|B1|64,66,64,64
עצר|nifal|tutuklanmak; durdurulmak|B2|54,48,48,62
שמע|nifal|duyulmak; kulağa gelmek|B1|70,72,74,66
חתם|nifal|imzalanmak|B2|46,42,40,58
דרש|nifal|gerekmek; istenmek|B1|66,62,60,74
זרק|nifal|atılmak|B2|44,40,40,50
הרג|nifal|öldürülmek|B2|46,40,38,58
בהל|nifal|paniklemek; korkmak|B2|48,44,46,50
`;

export const EXTRA_TABLES = [EX_PAAL, EX_PIEL, EX_HIFIL, EX_HITPAEL, EX_NIFAL];
