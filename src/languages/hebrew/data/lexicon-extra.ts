/**
 * Sözlük — B1/B2 katmanı.
 *
 * A1/A2 günlük hayatı ADLANDIRMAYA yetiyordu. Bu katman fikir yürütmeye,
 * haber okumaya ve tartışmaya geçişi sağlayan soyut isimleri getiriyor:
 * karar, neden, olanak, sorumluluk. Bunlar somut kelimelerden farklı bir
 * iş görür — öğrenci bunlarsız cümle kurabilir ama görüş bildiremez.
 *
 * Biçim: harekeli | harekesiz | okunuş | türkçe (;) | tür | cins | konu | CEFR [| çoğul]
 */

/** Soyut kavramlar — fikir yürütmenin hammaddesi. */
export const LEX_ABSTRACT = `
דָּבָר|דבר|davar|şey|noun|m|soyut|A1|דברים
מַשֶּׁהוּ|משהו|maşehu|bir şey|noun|m|soyut|A1|
מִישֶׁהוּ|מישהו|mişehu|birisi|noun|m|soyut|A1|
מָקוֹם|מקום|makom|yer|noun|m|soyut|A1|מקומות
דֶּרֶךְ|דרך|dereh|yol; yöntem|noun|f|soyut|A2|דרכים
סִבָּה|סיבה|siba|sebep|noun|f|soyut|B1|סיבות
תּוֹצָאָה|תוצאה|totsaa|sonuç|noun|f|soyut|B1|תוצאות
הַחְלָטָה|החלטה|hahlata|karar|noun|f|soyut|B1|החלטות
בְּעָיָה|בעיה|baaya|sorun|noun|f|soyut|A2|בעיות
פִּתְרוֹן|פתרון|pitaron|çözüm|noun|m|soyut|B1|פתרונות
אֶפְשָׁרוּת|אפשרות|efşarut|olanak; seçenek|noun|f|soyut|B1|אפשרויות
מַטָּרָה|מטרה|matara|amaç; hedef|noun|f|soyut|B1|מטרות
תַּפְקִיד|תפקיד|tafkid|görev; rol|noun|m|soyut|B1|תפקידים
אַחְרָיוּת|אחריות|ahrayut|sorumluluk; garanti|noun|f|soyut|B1|
זְכוּת|זכות|zhut|hak|noun|f|soyut|B1|זכויות
חוֹבָה|חובה|hova|yükümlülük|noun|f|soyut|B1|חובות
כֹּחַ|כוח|koah|güç|noun|m|soyut|B1|כוחות
צֹרֶךְ|צורך|tsoreh|ihtiyaç|noun|m|soyut|B1|צרכים
רַעְיוֹן|רעיון|rayon|fikir|noun|m|soyut|B1|רעיונות
דֵּעָה|דעה|dea|görüş|noun|f|soyut|B1|דעות
אֱמֶת|אמת|emet|gerçek; doğruluk|noun|f|soyut|A2|
שֶׁקֶר|שקר|şeker|yalan|noun|m|soyut|A2|שקרים
מַצָּב|מצב|matsav|durum|noun|m|soyut|A2|מצבים
שִׁנּוּי|שינוי|şinuy|değişiklik|noun|m|soyut|B1|שינויים
נִסָּיוֹן|ניסיון|nisayon|deneyim; deneme|noun|m|soyut|B1|ניסיונות
הֶבְדֵּל|הבדל|hevdel|fark|noun|m|soyut|B1|הבדלים
דֻּגְמָה|דוגמה|dugma|örnek|noun|f|soyut|A2|דוגמאות
חֵלֶק|חלק|helek|parça; kısım|noun|m|soyut|A2|חלקים
סוֹף|סוף|sof|son|noun|m|soyut|A2|
הַתְחָלָה|התחלה|hathala|başlangıç|noun|f|soyut|A2|התחלות
`;

/** İş, eğitim, toplum. */
export const LEX_SOCIETY = `
מְדִינָה|מדינה|medina|ülke; devlet|noun|f|toplum|A2|מדינות
עָם|עם|am|halk|noun|m|toplum|B1|עמים
מֶמְשָׁלָה|ממשלה|memşala|hükümet|noun|f|toplum|B1|ממשלות
חֹק|חוק|hok|kanun|noun|m|toplum|B1|חוקים
בְּחִירוֹת|בחירות|behirot|seçim|noun|f|toplum|B1|
מִלְחָמָה|מלחמה|milhama|savaş|noun|f|toplum|B1|מלחמות
שָׁלוֹם|שלום|şalom|barış; selam|noun|m|toplum|A1|
דָּת|דת|dat|din|noun|f|toplum|B1|דתות
תַּרְבּוּת|תרבות|tarbut|kültür|noun|f|toplum|B1|תרבויות
הִיסְטוֹרְיָה|היסטוריה|historya|tarih|noun|f|toplum|B1|
חִנּוּךְ|חינוך|hinuh|eğitim|noun|m|toplum|B1|
אוּנִיבֶרְסִיטָה|אוניברסיטה|universita|üniversite|noun|f|okul|A2|אוניברסיטאות
מִקְצוֹעַ|מקצוע|miktsoa|meslek; branş|noun|m|iş|B1|מקצועות
מַשְׂכֹּרֶת|משכורת|maskoret|maaş|noun|f|iş|B1|משכורות
רֵאָיוֹן|ראיון|rayon|mülakat; röportaj|noun|m|iş|B1|ראיונות
פְּגִישָׁה|פגישה|pgişa|toplantı; buluşma|noun|f|iş|A2|פגישות
מְנַהֵל|מנהל|menahel|müdür|noun|m|iş|A2|מנהלים
עוֹבֵד|עובד|oved|çalışan|noun|m|iş|A2|עובדים
לָקוֹחַ|לקוח|lakoah|müşteri|noun|m|iş|B1|לקוחות
שֵׁרוּת|שירות|şerut|hizmet|noun|m|iş|B1|שירותים
תּוֹכְנִית|תוכנית|tohnit|plan; program|noun|f|iş|A2|תוכניות
חֶשְׁבּוֹן|חשבון|heşbon|hesap|noun|m|iş|A2|חשבונות
מַס|מס|mas|vergi|noun|m|iş|B1|מיסים
שׁוּק הָעֲבוֹדָה|שוק העבודה|şuk ha-avoda|iş piyasası|noun|m|iş|B2|
`;

/** Duygu ve kişilik. */
export const LEX_FEELING = `
אַהֲבָה|אהבה|ahava|aşk; sevgi|noun|f|duygu|A2|
פַּחַד|פחד|pahad|korku|noun|m|duygu|A2|פחדים
כַּעַס|כעס|kaas|öfke|noun|m|duygu|B1|
שִׂמְחָה|שמחה|simha|sevinç|noun|f|duygu|A2|שמחות
עֶצֶב|עצב|etsev|üzüntü|noun|m|duygu|B1|
תִּקְוָה|תקווה|tikva|umut|noun|f|duygu|B1|תקוות
דְּאָגָה|דאגה|deaga|endişe|noun|f|duygu|B1|דאגות
הַפְתָּעָה|הפתעה|hafta'a|sürpriz|noun|f|duygu|B1|הפתעות
בּוּשָׁה|בושה|buşa|utanç|noun|f|duygu|B1|
גַּאֲוָה|גאווה|gaava|gurur|noun|f|duygu|B1|
נֶחְמָד|נחמד|nehmad|hoş; iyi (kişi)|adjective|m|sıfat|A2|
חָכָם|חכם|haham|akıllı|adjective|m|sıfat|A2|
טִפֵּשׁ|טיפש|tipeş|aptal|adjective|m|sıfat|B1|
נָדִיב|נדיב|nadiv|cömert|adjective|m|sıfat|B1|
סַבְלָנִי|סבלני|savlani|sabırlı|adjective|m|sıfat|B1|
עַצְבָּנִי|עצבני|atsbani|sinirli|adjective|m|sıfat|B1|
בָּטוּחַ|בטוח|batuah|emin; güvenli|adjective|m|sıfat|B1|
מְסֻכָּן|מסוכן|mesukan|tehlikeli|adjective|m|sıfat|B1|
אֶפְשָׁרִי|אפשרי|efşari|mümkün|adjective|m|sıfat|B1|
נָכוֹן|נכון|nahon|doğru|adjective|m|sıfat|A1|
חָפְשִׁי|חופשי|hofşi|özgür; boş|adjective|m|sıfat|B1|
מְפֻרְסָם|מפורסם|mefursam|ünlü|adjective|m|sıfat|B1|
רָגִיל|רגיל|ragil|sıradan; alışık|adjective|m|sıfat|B1|
מְיֻחָד|מיוחד|meyuhad|özel|adjective|m|sıfat|B1|
`;

/** Sanat, spor, boş zaman. */
export const LEX_LEISURE = `
מוּזִיקָה|מוזיקה|muzika|müzik|noun|f|sanat|A1|
שִׁיר|שיר|şir|şarkı; şiir|noun|m|sanat|A1|שירים
סֶרֶט|סרט|seret|film|noun|m|sanat|A1|סרטים
תְּמוּנָה|תמונה|tmuna|resim; fotoğraf|noun|f|sanat|A2|תמונות
תֵּאַטְרוֹן|תיאטרון|teatron|tiyatro|noun|m|sanat|B1|תיאטראות
מוּזֵאוֹן|מוזיאון|muzeon|müze|noun|m|sanat|A2|מוזיאונים
אָמָּן|אמן|aman|sanatçı|noun|m|sanat|B1|אמנים
סִפּוּר|סיפור|sipur|hikâye|noun|m|sanat|A1|סיפורים
מִשְׂחָק|משחק|mishak|oyun; maç|noun|m|spor|A1|משחקים
כַּדּוּרֶגֶל|כדורגל|kaduregel|futbol|noun|m|spor|A2|
קְבוּצָה|קבוצה|kvutsa|takım; grup|noun|f|spor|A2|קבוצות
אַלּוּף|אלוף|aluf|şampiyon|noun|m|spor|B1|אלופים
חֻפְשָׁה|חופשה|hufşa|tatil|noun|f|boş zaman|A2|חופשות
טִיּוּל|טיול|tiyul|gezi|noun|m|boş zaman|A2|טיולים
מְסִבָּה|מסיבה|mesiba|parti|noun|f|boş zaman|A2|מסיבות
חֲתֻנָּה|חתונה|hatuna|düğün|noun|f|boş zaman|A2|חתונות
יוֹם הֻלֶּדֶת|יום הולדת|yom huledet|doğum günü|noun|m|boş zaman|A1|
מַתָּנָה|מתנה|matana|hediye|noun|f|boş zaman|A2|מתנות
`;

/** Edatlar ve bağlayıcılar — cümlenin iskeleti. */
export const LEX_FUNCTION = `
בְּ|ב|be-|-de, -da; ile|preposition|-|edat|A1|
לְ|ל|le-|-e, -a|preposition|-|edat|A1|
מִן|מן|min|-den, -dan|preposition|-|edat|A1|
עַל|על|al|üzerine; hakkında|preposition|-|edat|A1|
עִם|עם|im|ile|preposition|-|edat|A1|
בְּלִי|בלי|bli|-siz|preposition|-|edat|A2|
אֵצֶל|אצל|etsel|yanında (kişi)|preposition|-|edat|B1|
לִפְנֵי|לפני|lifney|önce|preposition|-|edat|A1|
אַחֲרֵי|אחרי|aharey|sonra|preposition|-|edat|A1|
בֵּין|בין|beyn|arasında|preposition|-|edat|A2|
מִתַּחַת|מתחת|mitahat|altında|preposition|-|edat|A2|
מֵעַל|מעל|meal|üstünde|preposition|-|edat|A2|
לְיַד|ליד|leyad|yanında|preposition|-|edat|A1|
בְּתוֹךְ|בתוך|betoh|içinde|preposition|-|edat|A2|
מוּל|מול|mul|karşısında|preposition|-|edat|B1|
נֶגֶד|נגד|neged|karşı|preposition|-|edat|B1|
בִּגְלַל|בגלל|biglal|yüzünden|preposition|-|edat|B1|
לְפִי|לפי|lefi|-e göre|preposition|-|edat|B1|
`;

export const EXTRA_TABLES = [
  LEX_ABSTRACT,
  LEX_SOCIETY,
  LEX_FEELING,
  LEX_LEISURE,
  LEX_FUNCTION,
];
