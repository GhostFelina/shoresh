/**
 * Sözlük — genişletme katmanı.
 *
 * NEDEN AYRI DOSYA: `lexicon-core` ulpanın ilk aylarını, `lexicon-extra`
 * soyut B1 söz varlığını kapsıyor. Bu dosya ikisinin arasındaki boşluğu
 * dolduruyor: çekirdek konuların DERİNİ (mutfakta yalnızca "yemek" değil
 * "tarif, baharat, porsiyon"), ve çekirdekte hiç olmayan alanlar
 * (sağlık, hukuk, teknoloji, coğrafya).
 *
 * SEÇİM ÖLÇÜSÜ: Her satır bir soruya cevap veriyor — "öğrenci bu kelimeyi
 * bilmezse hangi cümleyi kuramaz?" Kuramayacağı bir cümle yoksa satır
 * girmedi. Bu yüzden burada edebî ya da tören İbranicesi yok; hepsi
 * konuşulan modern İbranice.
 *
 * Biçim: harekeli | harekesiz | okunuş | türkçe (;) | tür | cins | konu | CEFR [| çoğul]
 */

/** Yemek — mutfağın derinliği: malzeme, tat, hazırlık. */
export const LEX_FOOD_DEEP = `
גֶּזֶר|גזר|gezer|havuç|noun|m|yemek|A2|גזרים
חַסָּה|חסה|hasa|marul|noun|f|yemek|B1|חסות
פִּלְפֵּל|פלפל|pilpel|biber|noun|m|yemek|A2|פלפלים
שׁוּם|שום|şum|sarımsak|noun|m|yemek|B1|
זַיִת|זית|zayit|zeytin|noun|m|yemek|A2|זיתים
לִימוֹן|לימון|limon|limon|noun|m|yemek|A2|לימונים
תַּפּוּז|תפוז|tapuz|portakal|noun|m|yemek|A1|תפוזים
עֵנָב|ענב|enav|üzüm|noun|m|yemek|A2|ענבים
אֲבַטִּיחַ|אבטיח|avatiah|karpuz|noun|m|yemek|A2|אבטיחים
תּוּת|תות|tut|çilek|noun|m|yemek|A2|תותים
אֱגוֹז|אגוז|egoz|ceviz; sert kabuklu yemiş|noun|m|yemek|B1|אגוזים
דְּבַשׁ|דבש|dvaş|bal|noun|m|yemek|A2|
רִבָּה|ריבה|riba|reçel|noun|f|yemek|B1|ריבות
גְּלִידָה|גלידה|glida|dondurma|noun|f|yemek|A1|גלידות
שׁוֹקוֹלָד|שוקולד|şokolad|çikolata|noun|m|yemek|A1|
עוּגִיָּה|עוגייה|ugiya|kurabiye|noun|f|yemek|A2|עוגיות
מָרָק|מרק|marak|çorba|noun|m|yemek|A2|מרקים
סָלָט|סלט|salat|salata|noun|m|yemek|A1|סלטים
פִּיתָה|פיתה|pita|pide ekmeği|noun|f|yemek|A1|פיתות
חוּמּוּס|חומוס|humus|humus|noun|m|yemek|A1|
יוֹגוּרְט|יוגורט|yogurt|yoğurt|noun|m|yemek|A2|
קֶמַח|קמח|kemah|un|noun|m|yemek|B1|
פַּסְטָה|פסטה|pasta|makarna|noun|f|yemek|A2|
מָנָה|מנה|mana|porsiyon; öğün yemeği|noun|f|yemek|A2|מנות
טַעַם|טעם|taam|tat; lezzet|noun|m|yemek|A2|טעמים
רֵיחַ|ריח|reah|koku|noun|m|yemek|A2|ריחות
תַּבְלִין|תבלין|tavlin|baharat|noun|m|yemek|B1|תבלינים
בִּשּׁוּל|בישול|bişul|pişirme; yemek yapma|noun|m|yemek|B1|
מַתְכּוֹן|מתכון|matkon|tarif|noun|m|yemek|B1|מתכונים
טִיפ|טיפ|tip|bahşiş|noun|m|yemek|A2|
צִמְחוֹנִי|צמחוני|tsimhoni|vejetaryen|adjective|m|yemek|B1|צמחונים
טָרִי|טרי|tari|taze|adjective|m|yemek|A2|טריים
מָתוֹק|מתוק|matok|tatlı|adjective|m|yemek|A1|מתוקים
מָלוּחַ|מלוח|maluah|tuzlu|adjective|m|yemek|A2|מלוחים
חָרִיף|חריף|harif|acı (biberli); keskin|adjective|m|yemek|A2|חריפים
חָמוּץ|חמוץ|hamuts|ekşi|adjective|m|yemek|A2|חמוצים
כָּשֵׁר|כשר|kaşer|koşer; uygun|adjective|m|yemek|A2|כשרים
מְבֻשָּׁל|מבושל|mevuşal|pişmiş|adjective|m|yemek|B1|מבושלים
`;

/** Ev — çekirdekte olmayan eşya, iş ve mekân adları. */
export const LEX_HOME_DEEP = `
סָלוֹן|סלון|salon|oturma odası|noun|m|ev|A2|סלונים
מִרְפֶּסֶת|מרפסת|mirpeset|balkon|noun|f|ev|A2|מרפסות
רִצְפָּה|רצפה|ritspa|zemin; yer|noun|f|ev|A2|רצפות
תִּקְרָה|תקרה|tikra|tavan|noun|f|ev|B1|תקרות
קִיר|קיר|kir|duvar|noun|m|ev|A2|קירות
גַּג|גג|gag|çatı|noun|m|ev|A2|גגות
סַפָּה|ספה|sapa|kanepe|noun|f|ev|A2|ספות
כָּרִית|כרית|karit|yastık|noun|f|ev|A2|כריות
שְׂמִיכָה|שמיכה|smiha|battaniye; yorgan|noun|f|ev|A2|שמיכות
מַגֶּבֶת|מגבת|magevet|havlu|noun|f|ev|A2|מגבות
סַבּוֹן|סבון|sabon|sabun|noun|m|ev|A2|סבונים
מְכוֹנַת כְּבִיסָה|מכונת כביסה|mehonat kvisa|çamaşır makinesi|noun|f|ev|B1|
כְּבִיסָה|כביסה|kvisa|çamaşır|noun|f|ev|B1|
נִקָּיוֹן|ניקיון|nikayon|temizlik|noun|m|ev|B1|
תַּנּוּר|תנור|tanur|fırın|noun|m|ev|A2|תנורים
מִקְרוֹגַל|מיקרוגל|mikrogal|mikrodalga|noun|m|ev|B1|מיקרוגלים
סִיר|סיר|sir|tencere|noun|m|ev|A2|סירים
מַחֲבַת|מחבת|mahavat|tava|noun|f|ev|B1|מחבתות
מַגָּשׁ|מגש|magaş|tepsi|noun|m|ev|B1|מגשים
בַּקְבּוּק|בקבוק|bakbuk|şişe|noun|m|ev|A1|בקבוקים
פַּח|פח|pah|çöp kovası; teneke|noun|m|ev|A2|פחים
זֶבֶל|זבל|zevel|çöp|noun|m|ev|B1|
מַדָּף|מדף|madaf|raf|noun|m|ev|B1|מדפים
שָׁעוֹן|שעון|şaon|saat (alet)|noun|m|ev|A1|שעונים
וִילוֹן|וילון|vilon|perde|noun|m|ev|B1|וילונות
מְזַגָּן|מזגן|mezagan|klima|noun|m|ev|A2|מזגנים
חַשְׁמַל|חשמל|haşmal|elektrik|noun|m|ev|A2|
נוּרָה|נורה|nura|ampul|noun|f|ev|B1|נורות
מַעֲלִית|מעלית|maalit|asansör|noun|f|ev|A2|מעליות
שְׂכַר דִּירָה|שכר דירה|sar dira|kira|noun|m|ev|B1|
רָהִיט|רהיט|rahit|mobilya parçası|noun|m|ev|B1|רהיטים
תִּיק|תיק|tik|çanta; dosya|noun|m|ev|A1|תיקים
מִסְפָּרַיִם|מספריים|misparayim|makas|noun|m|ev|B1|
מַסְמֵר|מסמר|masmer|çivi|noun|m|ev|B2|מסמרים
`;

/** Sağlık — vücut, hastalık, hastane. */
export const LEX_HEALTH = `
בְּרִיאוּת נֶפֶשׁ|בריאות נפש|briut nefeş|ruh sağlığı|noun|f|sağlık|B2|
חוֹלֶה|חולה|hole|hasta|noun|m|sağlık|A1|חולים
חֹלִי|חולי|holi|hastalık|noun|m|sağlık|B1|
מַחֲלָה|מחלה|mahala|hastalık|noun|f|sağlık|A2|מחלות
חֹם|חום|hom|ateş; sıcaklık|noun|m|sağlık|A2|
שַׁפַּעַת|שפעת|şapaat|grip|noun|f|sağlık|A2|
הִצְטַנְּנוּת|הצטננות|hitstanenut|soğuk algınlığı|noun|f|sağlık|B1|
שִׁעוּל|שיעול|şiul|öksürük|noun|m|sağlık|B1|
פֶּצַע|פצע|petsa|yara|noun|m|sağlık|B1|פצעים
דָּם|דם|dam|kan|noun|m|sağlık|A2|
עֶצֶם|עצם|etsem|kemik|noun|f|sağlık|B1|עצמות
עוֹר|עור|or|deri; cilt|noun|m|sağlık|B1|עורות
שְׁרִיר|שריר|şrir|kas|noun|m|sağlık|B1|שרירים
רֵאָה|ריאה|ria|akciğer|noun|f|sağlık|B2|ריאות
מֹחַ|מוח|moah|beyin|noun|m|sağlık|B1|מוחות
אֲחוֹת רְפוּאִית|אחות רפואית|ahot refuit|hemşire|noun|f|sağlık|B1|
רוֹפֵא שִׁנַּיִם|רופא שיניים|rofe şinayim|diş hekimi|noun|m|sağlık|A2|
מִרְפָּאָה|מרפאה|mirpaa|poliklinik|noun|f|sağlık|B1|מרפאות
חֲדַר מִיּוּן|חדר מיון|hadar miyun|acil servis|noun|m|sağlık|B1|
אַמְבּוּלַנְס|אמבולנס|ambulans|ambulans|noun|m|sağlık|A2|
טִפּוּל|טיפול|tipul|tedavi; bakım|noun|m|sağlık|B1|טיפולים
נִתּוּחַ|ניתוח|nituah|ameliyat; analiz|noun|m|sağlık|B1|ניתוחים
זְרִיקָה|זריקה|zrika|iğne; enjeksiyon|noun|f|sağlık|B1|זריקות
כַּדּוּר|כדור|kadur|hap; top|noun|m|sağlık|A2|כדורים
בְּדִיקָה|בדיקה|bdika|muayene; test|noun|f|sağlık|B1|בדיקות
תּוֹר|תור|tor|sıra; randevu|noun|m|sağlık|A2|תורים
בִּטּוּחַ|ביטוח|bituah|sigorta|noun|m|sağlık|B1|ביטוחים
כּוֹאֵב|כואב|koev|ağrıyan|adjective|m|sağlık|A2|כואבים
בָּרִיא|בריא|bari|sağlıklı|adjective|m|sağlık|A2|בריאים
חַלָּשׁ|חלש|halaş|zayıf; güçsüz|adjective|m|sağlık|A2|חלשים
חָזָק|חזק|hazak|güçlü|adjective|m|sağlık|A1|חזקים
`;

/** Şehir ve hizmetler — adres sormaktan resmî daireye kadar. */
export const LEX_CITY_DEEP = `
כִּכָּר|כיכר|kikar|meydan|noun|f|şehir|A2|כיכרות
שְׂדֵרָה|שדרה|sdera|bulvar|noun|f|şehir|B1|שדרות
סִמְטָה|סמטה|simta|ara sokak|noun|f|şehir|B2|סמטות
צֹמֶת|צומת|tsomet|kavşak|noun|m|şehir|B1|צמתים
רַמְזוֹר|רמזור|ramzor|trafik ışığı|noun|m|şehir|A2|רמזורים
מִדְרָכָה|מדרכה|midraha|kaldırım|noun|f|şehir|A2|מדרכות
כְּבִישׁ|כביש|kviş|yol; şose|noun|m|şehir|A1|כבישים
גֶּשֶׁר|גשר|geşer|köprü|noun|m|şehir|A2|גשרים
פַּארְק|פארק|park|park|noun|m|şehir|A1|פארקים
מִגְרָשׁ|מגרש|migraş|arsa; saha|noun|m|şehir|B1|מגרשים
בִּנְיָן|בניין|binyan|bina|noun|m|şehir|A1|בניינים
קוֹמָה|קומה|koma|kat|noun|f|şehir|A2|קומות
מַרְכָּז|מרכז|merkaz|merkez|noun|m|şehir|A2|מרכזים
פַּרְבָּר|פרבר|parvar|banliyö|noun|m|şehir|B2|פרברים
שְׁכוּנָה|שכונה|şhuna|mahalle|noun|f|şehir|A2|שכונות
כְּפָר|כפר|kfar|köy|noun|m|şehir|A2|כפרים
עִירִיָּה|עירייה|iriya|belediye|noun|f|şehir|B1|עיריות
מִשְׁטָרָה|משטרה|miştara|polis|noun|f|şehir|A2|
שׁוֹטֵר|שוטר|şoter|polis memuru|noun|m|şehir|A2|שוטרים
מְכַבֵּי אֵשׁ|מכבי אש|mehabe eş|itfaiye|noun|m|şehir|B1|
סוּפֶּרְמַרְקֶט|סופרמרקט|supermarket|süpermarket|noun|m|şehir|A1|
מִזְנוֹן|מזנון|miznon|büfe; küçük lokanta|noun|m|şehir|B1|מזנונים
בֵּית כְּנֶסֶת|בית כנסת|bet kneset|sinagog|noun|m|şehir|A2|
סִפְרִיָּה|ספרייה|sifriya|kütüphane|noun|f|şehir|A2|ספריות
קוֹלְנוֹעַ|קולנוע|kolnoa|sinema|noun|m|şehir|A1|
בְּרֵכָה|בריכה|breha|havuz|noun|f|şehir|A2|בריכות
מִגְדָּל|מגדל|migdal|kule|noun|m|şehir|B1|מגדלים
חֲנָיָה|חנייה|hanaya|otopark|noun|f|şehir|A2|חניות
תַּחֲנַת דֶּלֶק|תחנת דלק|tahanat delek|benzin istasyonu|noun|f|şehir|B1|
`;

/** Ulaşım ve yolculuk. */
export const LEX_TRAVEL = `
נְסִיעָה|נסיעה|nesia|yolculuk (araçla)|noun|f|ulaşım|A2|נסיעות
טִיסָה|טיסה|tisa|uçuş|noun|f|ulaşım|A2|טיסות
דַּרְכּוֹן|דרכון|darkon|pasaport|noun|m|ulaşım|A2|דרכונים
אַשְׁרָה|אשרה|aşra|vize|noun|f|ulaşım|B1|אשרות
מִזְוָדָה|מזוודה|mizvada|bavul|noun|f|ulaşım|A2|מזוודות
תַּרְמִיל|תרמיל|tarmil|sırt çantası|noun|m|ulaşım|B1|תרמילים
מַפָּה|מפה|mapa|harita|noun|f|ulaşım|A2|מפות
נַהָג|נהג|nahag|şoför|noun|m|ulaşım|A2|נהגים
נוֹסֵעַ|נוסע|nosea|yolcu|noun|m|ulaşım|A2|נוסעים
כַּרְטִיסִיָּה|כרטיסייה|kartisiya|abonman kartı|noun|f|ulaşım|B2|כרטיסיות
מוֹשָׁב|מושב|moşav|koltuk; oturma yeri|noun|m|ulaşım|B1|מושבים
גְּבוּל|גבול|gvul|sınır|noun|m|ulaşım|B1|גבולות
מֶכֶס|מכס|mehes|gümrük|noun|m|ulaşım|B2|
טַיָּס|טייס|tayas|pilot|noun|m|ulaşım|B1|טייסים
אֳנִיָּה|אונייה|oniya|gemi|noun|f|ulaşım|B1|אוניות
נָמֵל|נמל|namel|liman|noun|m|ulaşım|B1|נמלים
אוֹפַנּוֹעַ|אופנוע|ofanoa|motosiklet|noun|m|ulaşım|A2|אופנועים
מַשָּׂאִית|משאית|masait|kamyon|noun|f|ulaşım|B1|משאיות
תְּאוּנָה|תאונה|teuna|kaza|noun|f|ulaşım|B1|תאונות
פְּקָק|פקק|pkak|trafik sıkışıklığı; tıpa|noun|m|ulaşım|A2|פקקים
מְהִירוּת|מהירות|mehirut|hız|noun|f|ulaşım|B1|מהירויות
כִּוּוּן|כיוון|kivun|yön|noun|m|ulaşım|A2|כיוונים
מֶרְחָק|מרחק|merhak|mesafe|noun|m|ulaşım|B1|מרחקים
עִכּוּב|עיכוב|ikuv|gecikme|noun|m|ulaşım|B1|עיכובים
יְצִיאָה|יציאה|yetsia|çıkış|noun|f|ulaşım|A2|יציאות
כְּנִיסָה|כניסה|knisa|giriş|noun|f|ulaşım|A2|כניסות
מַדְרִיךְ|מדריך|madrih|rehber; kılavuz|noun|m|ulaşım|B1|מדריכים
תַּיָּר|תייר|tayar|turist|noun|m|ulaşım|A2|תיירים
הַזְמָנָה|הזמנה|hazmana|rezervasyon; davet|noun|f|ulaşım|A2|הזמנות
`;

/** Okul ve öğrenme. */
export const LEX_SCHOOL_DEEP = `
כִּתָּה|כיתה|kita|sınıf|noun|f|okul|A1|כיתות
לוּחַ|לוח|luah|tahta; takvim|noun|m|okul|A2|לוחות
תַּרְגִּיל|תרגיל|targil|alıştırma|noun|m|okul|A2|תרגילים
שִׁעוּרֵי בַּיִת|שיעורי בית|şiurey bayit|ev ödevi|noun|m|okul|A2|
צִיּוּן|ציון|tsiyun|not; işaret|noun|m|okul|A2|ציונים
תְּעוּדָה|תעודה|teuda|belge; karne|noun|f|okul|B1|תעודות
תֹּאַר|תואר|toar|derece; unvan|noun|m|okul|B1|תארים
סְטוּדֶנְט|סטודנט|student|üniversite öğrencisi|noun|m|okul|A2|סטודנטים
מַרְצֶה|מרצה|martse|öğretim üyesi|noun|m|okul|B1|מרצים
הַרְצָאָה|הרצאה|hartsaa|konferans; ders|noun|f|okul|B1|הרצאות
מַחְלָקָה|מחלקה|mahlaka|bölüm|noun|f|okul|B1|מחלקות
מֶחְקָר|מחקר|mehkar|araştırma|noun|m|okul|B1|מחקרים
מַאֲמָר|מאמר|maamar|makale|noun|m|okul|B1|מאמרים
תַּרְגּוּם|תרגום|tirgum|çeviri|noun|m|okul|B1|תרגומים
דִּקְדּוּק|דקדוק|dikduk|dilbilgisi|noun|m|okul|B1|
אוֹצַר מִלִּים|אוצר מילים|otsar milim|kelime hazinesi|noun|m|okul|B1|
כְּתִיב|כתיב|ktiv|yazım; imla|noun|m|okul|B1|
הֲגִיָּה|הגייה|hagiya|telaffuz|noun|f|okul|B1|
טָעוּת|טעות|taut|hata|noun|f|okul|A2|טעויות
תִּרְגּוּל|תרגול|tirgul|pratik yapma|noun|m|okul|B1|
הַסְבֵּר|הסבר|hesber|açıklama|noun|m|okul|A2|הסברים
חוֹבֶרֶת|חוברת|hoveret|kitapçık; fasikül|noun|f|okul|B1|חוברות
צֶבַע|צבע|tseva|renk; boya|noun|m|renk|A1|צבעים
מִלּוֹן|מילון|milon|sözlük|noun|m|okul|A2|מילונים
`;

/** Teknoloji ve iletişim. */
export const LEX_TECH_DEEP = `
מָסָךְ|מסך|masah|ekran|noun|m|teknoloji|A2|מסכים
מִקְלֶדֶת|מקלדת|mikledet|klavye|noun|f|teknoloji|A2|מקלדות
עַכְבָּר|עכבר|ahbar|fare|noun|m|teknoloji|A2|עכברים
קֹבֶץ|קובץ|kovets|dosya|noun|m|teknoloji|B1|קבצים
תִּיקִיָּה|תיקייה|tikiya|klasör|noun|f|teknoloji|B1|תיקיות
תָּכְנָה|תוכנה|tohna|yazılım|noun|f|teknoloji|B1|תוכנות
אַפְּלִיקַצְיָה|אפליקציה|aplikatsya|uygulama|noun|f|teknoloji|A2|אפליקציות
אֲתָר|אתר|atar|site; mekân|noun|m|teknoloji|A2|אתרים
סִיסְמָה|סיסמה|sisma|şifre; parola|noun|f|teknoloji|A2|סיסמאות
מִשְׁתַּמֵּשׁ|משתמש|miştameş|kullanıcı|noun|m|teknoloji|B1|משתמשים
רֶשֶׁת|רשת|reşet|ağ; şebeke|noun|f|teknoloji|A2|רשתות
מֵידָע|מידע|meyda|bilgi; veri|noun|m|teknoloji|B1|
נְתוּנִים|נתונים|netunim|veriler|noun|m|teknoloji|B1|
מַצְלֵמָה|מצלמה|matslema|kamera; fotoğraf makinesi|noun|f|teknoloji|A2|מצלמות
סוֹלְלָה|סוללה|solela|pil; batarya|noun|f|teknoloji|A2|סוללות
מַטְעֵן|מטען|maten|şarj aleti|noun|m|teknoloji|A2|מטענים
שִׂיחָה|שיחה|siha|konuşma; arama|noun|f|teknoloji|A2|שיחות
דֹּאַר אֶלֶקְטְרוֹנִי|דואר אלקטרוני|doar elektroni|e-posta|noun|m|teknoloji|A2|
קִשּׁוּר|קישור|kişur|bağlantı; link|noun|m|teknoloji|B1|קישורים
עִדְכּוּן|עדכון|idkun|güncelleme|noun|m|teknoloji|B1|עדכונים
תַּקָלָה|תקלה|takala|arıza|noun|f|teknoloji|B1|תקלות
שֵׁרוּת לָקוֹחוֹת|שירות לקוחות|şerut lakohot|müşteri hizmetleri|noun|m|teknoloji|B1|
טֵלֵוִיזְיָה|טלוויזיה|televizya|televizyon|noun|f|teknoloji|A1|טלוויזיות
רַדְיוֹ|רדיו|radyo|radyo|noun|m|teknoloji|A1|
עִתּוֹן|עיתון|iton|gazete|noun|m|teknoloji|A2|עיתונים
חֲדָשׁוֹת|חדשות|hadaşot|haberler|noun|f|teknoloji|A2|
פִּרְסוּם|פרסום|pirsum|reklam; yayımlama|noun|m|teknoloji|B1|פרסומים
דִּיגִיטָלִי|דיגיטלי|digitali|dijital|adjective|m|teknoloji|B1|דיגיטליים
מְקֻוָּן|מקוון|mekuvan|çevrimiçi|adjective|m|teknoloji|B2|מקוונים
`;

/** Doğa, hava, coğrafya. */
export const LEX_NATURE_DEEP = `
מֶזֶג אֲוִיר|מזג אוויר|mezeg avir|hava durumu|noun|m|doğa|A2|
עָנָן|ענן|anan|bulut|noun|m|doğa|A2|עננים
שֶׁלֶג|שלג|şeleg|kar|noun|m|doğa|A2|שלגים
סוּפָה|סופה|sufa|fırtına|noun|f|doğa|B1|סופות
בָּרָק|ברק|barak|şimşek|noun|m|doğa|B1|ברקים
רַעַם|רעם|raam|gök gürültüsü|noun|m|doğa|B1|רעמים
טַל|טל|tal|çiy|noun|m|doğa|B2|
עֲרָפֶל|ערפל|arafel|sis|noun|m|doğa|B1|
שָׁרָב|שרב|şarav|sıcak hava dalgası|noun|m|doğa|B2|
מִדְבָּר|מדבר|midbar|çöl|noun|m|doğa|A2|מדבריות
עֵמֶק|עמק|emek|vadi|noun|m|doğa|B1|עמקים
גִּבְעָה|גבעה|giva|tepe|noun|f|doğa|B1|גבעות
נָהָר|נהר|nahar|nehir|noun|m|doğa|A2|נהרות
אֲגַם|אגם|agam|göl|noun|m|doğa|A2|אגמים
חוֹף|חוף|hof|sahil; kıyı|noun|m|doğa|A2|חופים
גַּל|גל|gal|dalga|noun|m|doğa|B1|גלים
חוֹל|חול|hol|kum|noun|m|doğa|A2|
אֶבֶן|אבן|even|taş|noun|f|doğa|A2|אבנים
אֲדָמָה|אדמה|adama|toprak|noun|f|doğa|A2|אדמות
יַעַר|יער|yaar|orman|noun|m|doğa|A2|יערות
שָׂדֶה|שדה|sade|tarla|noun|m|doğa|A2|שדות
עָלֶה|עלה|ale|yaprak|noun|m|doğa|A2|עלים
שֹׁרֶשׁ|שורש|şoreş|kök|noun|m|doğa|A2|שורשים
זֶרַע|זרע|zera|tohum|noun|m|doğa|B1|זרעים
דֶּשֶׁא|דשא|deşe|çim|noun|m|doğa|A2|
עֵשֶׂב|עשב|esev|ot|noun|m|doğa|B1|עשבים
אֵשׁ|אש|eş|ateş|noun|f|doğa|A2|
קֶרַח|קרח|kerah|buz|noun|m|doğa|A2|
טֶבַע|טבע|teva|doğa|noun|m|doğa|A2|
סְבִיבָה|סביבה|sviva|çevre|noun|f|doğa|B1|סביבות
זִהוּם|זיהום|zihum|kirlilik|noun|m|doğa|B2|
אַקְלִים|אקלים|aklim|iklim|noun|m|doğa|B2|
`;

/** Hayvanlar. */
export const LEX_ANIMALS = `
בַּעַל חַיִּים|בעל חיים|baal hayim|hayvan|noun|m|hayvan|A2|בעלי חיים
פָּרָה|פרה|para|inek|noun|f|hayvan|A2|פרות
כֶּבֶשׂ|כבש|keves|koyun|noun|m|hayvan|A2|כבשים
עֵז|עז|ez|keçi|noun|f|hayvan|A2|עיזים
חֲמוֹר|חמור|hamor|eşek|noun|m|hayvan|A2|חמורים
גָּמָל|גמל|gamal|deve|noun|m|hayvan|A2|גמלים
חֲזִיר|חזיר|hazir|domuz|noun|m|hayvan|B1|חזירים
אַרְיֵה|אריה|arye|aslan|noun|m|hayvan|A2|אריות
דֹּב|דוב|dov|ayı|noun|m|hayvan|A2|דובים
זְאֵב|זאב|zeev|kurt|noun|m|hayvan|B1|זאבים
שׁוּעָל|שועל|şual|tilki|noun|m|hayvan|B1|שועלים
פִּיל|פיל|pil|fil|noun|m|hayvan|A2|פילים
קוֹף|קוף|kof|maymun|noun|m|hayvan|A2|קופים
נְמָלָה|נמלה|nemala|karınca|noun|f|hayvan|B1|נמלים
דְּבוֹרָה|דבורה|dvora|arı|noun|f|hayvan|B1|דבורים
זְבוּב|זבוב|zvuv|sinek|noun|m|hayvan|B1|זבובים
יַתּוּשׁ|יתוש|yatuş|sivrisinek|noun|m|hayvan|B1|יתושים
פַּרְפַּר|פרפר|parpar|kelebek|noun|m|hayvan|B1|פרפרים
נָחָשׁ|נחש|nahaş|yılan|noun|m|hayvan|B1|נחשים
תַּרְנְגֹלֶת|תרנגולת|tarnegolet|tavuk|noun|f|hayvan|A2|תרנגולות
בַּרְוָז|ברווז|barvaz|ördek|noun|m|hayvan|B1|ברווזים
יוֹנָה|יונה|yona|güvercin|noun|f|hayvan|B1|יונים
נֶשֶׁר|נשר|neşer|kartal|noun|m|hayvan|B2|נשרים
עַכָּבִישׁ|עכביש|akaviş|örümcek|noun|m|hayvan|B1|עכבישים
זָנָב|זנב|zanav|kuyruk|noun|m|hayvan|B1|זנבות
כָּנָף|כנף|kanaf|kanat|noun|f|hayvan|B1|כנפיים
`;

/** Giysi ve görünüş. */
export const LEX_CLOTHES_DEEP = `
חֲצָאִית|חצאית|hatsait|etek|noun|f|giysi|A2|חצאיות
חֲלִיפָה|חליפה|halifa|takım elbise|noun|f|giysi|B1|חליפות
עֲנִיבָה|עניבה|aniva|kravat|noun|f|giysi|B1|עניבות
גַּרְבַּיִם|גרביים|garbayim|çorap|noun|m|giysi|A2|
כְּפָפָה|כפפה|kfafa|eldiven|noun|f|giysi|B1|כפפות
צָעִיף|צעיף|tsaif|atkı; eşarp|noun|m|giysi|B1|צעיפים
חֲגוֹרָה|חגורה|hagora|kemer|noun|f|giysi|B1|חגורות
סַנְדָּל|סנדל|sandal|sandalet|noun|m|giysi|A2|סנדלים
מַגָּף|מגף|magaf|çizme|noun|m|giysi|B1|מגפיים
סְוֶדֶר|סוודר|sveder|kazak|noun|m|giysi|A2|סוודרים
תַּכְשִׁיט|תכשיט|tahşit|takı|noun|m|giysi|B1|תכשיטים
טַבַּעַת|טבעת|tabaat|yüzük|noun|f|giysi|B1|טבעות
שַׁרְשֶׁרֶת|שרשרת|şarşeret|zincir; kolye|noun|f|giysi|B1|שרשראות
מִשְׁקָפַיִם|משקפיים|mişkafayim|gözlük|noun|m|giysi|A2|
מִדָּה|מידה|mida|beden; ölçü|noun|f|giysi|A2|מידות
בַּד|בד|bad|kumaş|noun|m|giysi|B1|בדים
כִּיס|כיס|kis|cep|noun|m|giysi|A2|כיסים
כַּפְתּוֹר|כפתור|kaftor|düğme|noun|m|giysi|B1|כפתורים
אֹפְנָה|אופנה|ofna|moda|noun|f|giysi|B1|
מַדִּים|מדים|madim|üniforma|noun|m|giysi|B2|
`;

/** İş, ekonomi, hukuk — B1 ve B2 seviyesinin omurgası. */
export const LEX_BUSINESS = `
עֵסֶק|עסק|esek|işletme; iş|noun|m|iş|B1|עסקים
חוֹזֶה|חוזה|hoze|sözleşme|noun|m|iş|B1|חוזים
מִשְׂרָה|משרה|misra|kadro; pozisyon|noun|f|iş|B1|משרות
קוֹרוֹת חַיִּים|קורות חיים|korot hayim|özgeçmiş|noun|m|iş|B1|
מַעֲסִיק|מעסיק|maasik|işveren|noun|m|iş|B1|מעסיקים
שֻׁתָּף|שותף|şutaf|ortak|noun|m|iş|B1|שותפים
עוֹרֵךְ דִּין|עורך דין|oreh din|avukat|noun|m|iş|B1|עורכי דין
שׁוֹפֵט|שופט|şofet|hâkim|noun|m|iş|B1|שופטים
תְּבִיעָה|תביעה|tvia|dava; talep|noun|f|iş|B1|תביעות
עֵד|עד|ed|tanık|noun|m|iş|B2|עדים
רְאָיָה|ראיה|reaya|kanıt|noun|f|iş|B2|ראיות
עֹנֶשׁ|עונש|oneş|ceza|noun|m|iş|B1|עונשים
קְנָס|קנס|knas|para cezası|noun|m|iş|B1|קנסות
תְּלוּנָה|תלונה|tluna|şikâyet|noun|f|iş|B1|תלונות
הֶסְכֵּם|הסכם|heskem|anlaşma|noun|m|iş|B1|הסכמים
מַשָּׂא וּמַתָּן|משא ומתן|masa umatan|müzakere|noun|m|iş|B2|
רֶוַח|רווח|revah|kâr; aralık|noun|m|iş|B1|רווחים
הֶפְסֵד|הפסד|hefsed|zarar; kayıp|noun|m|iş|B1|הפסדים
הַכְנָסָה|הכנסה|hahnasa|gelir|noun|f|iş|B1|הכנסות
הוֹצָאָה|הוצאה|hotsaa|gider; yayınevi|noun|f|iş|B1|הוצאות
תַּקְצִיב|תקציב|taktsiv|bütçe|noun|m|iş|B1|תקציבים
הַלְוָאָה|הלוואה|halvaa|kredi; ödünç|noun|f|iş|B1|הלוואות
רִבִּית|ריבית|ribit|faiz|noun|f|iş|B2|
מְנָיָה|מניה|menaya|hisse senedi|noun|f|iş|B2|מניות
הַשְׁקָעָה|השקעה|haşkaa|yatırım|noun|f|iş|B1|השקעות
מַשְׁכַּנְתָּה|משכנתה|maşkanta|ipotek; konut kredisi|noun|f|iş|B2|משכנתאות
כַּלְכָּלָה|כלכלה|kalkala|ekonomi|noun|f|iş|B1|
תַּעֲשִׂיָּה|תעשייה|taasiya|sanayi|noun|f|iş|B1|תעשיות
חַקְלָאוּת|חקלאות|haklaut|tarım|noun|f|iş|B1|
מִסְחָר|מסחר|mishar|ticaret|noun|m|iş|B1|
יְצוּא|יצוא|yetsu|ihracat|noun|m|iş|B2|
יְבוּא|יבוא|yevu|ithalat|noun|m|iş|B2|
אַבְטָלָה|אבטלה|avtala|işsizlik|noun|f|iş|B2|
פֶּנְסְיָה|פנסיה|pensya|emeklilik|noun|f|iş|B2|
קִדּוּם|קידום|kidum|terfi; tanıtım|noun|m|iş|B1|קידומים
פִּטּוּרִים|פיטורים|piturim|işten çıkarma|noun|m|iş|B2|
מִשְׁמֶרֶת|משמרת|mişmeret|vardiya|noun|f|iş|B1|משמרות
`;

/** Sıfat — çekirdeğin ötesi. */
export const LEX_ADJ_DEEP = `
רָחָב|רחב|rahav|geniş|adjective|m|sıfat|A2|רחבים
צַר|צר|tsar|dar|adjective|m|sıfat|A2|צרים
עָמֹק|עמוק|amok|derin|adjective|m|sıfat|A2|עמוקים
רָדוּד|רדוד|radud|sığ|adjective|m|sıfat|B2|רדודים
גָּבוֹהַּ|גבוה|gavoah|yüksek; uzun boylu|adjective|m|sıfat|A1|גבוהים
נָמוּךְ|נמוך|namuh|alçak; kısa boylu|adjective|m|sıfat|A1|נמוכים
כָּבֵד|כבד|kaved|ağır|adjective|m|sıfat|A2|כבדים
רַךְ|רך|rah|yumuşak|adjective|m|sıfat|A2|רכים
קָשִׁיחַ|קשיח|kaşiah|sert; katı|adjective|m|sıfat|B2|קשיחים
חָלָק|חלק|halak|pürüzsüz; kaygan|adjective|m|sıfat|B1|חלקים
עָגֹל|עגול|agol|yuvarlak|adjective|m|sıfat|A2|עגולים
יָשָׁר|ישר|yaşar|düz; dürüst|adjective|m|sıfat|A2|ישרים
עָקֹם|עקום|akom|eğri|adjective|m|sıfat|B1|עקומים
שָׁקֵט|שקט|şaket|sessiz; sakin|adjective|m|sıfat|A1|שקטים
רוֹעֵשׁ|רועש|roeş|gürültülü|adjective|m|sıfat|B1|רועשים
בָּהִיר|בהיר|bahir|açık (renk); aydınlık|adjective|m|sıfat|A2|בהירים
כֵּהֶה|כהה|kehe|koyu (renk)|adjective|m|sıfat|A2|כהים
מוּזָר|מוזר|muzar|garip|adjective|m|sıfat|A2|מוזרים
פָּשׁוּט|פשוט|paşut|basit|adjective|m|sıfat|A1|פשוטים
מְסֻבָּךְ|מסובך|mesubah|karmaşık|adjective|m|sıfat|B1|מסובכים
בָּרוּר|ברור|barur|açık; anlaşılır|adjective|m|sıfat|A2|ברורים
מְטֻשְׁטָשׁ|מטושטש|metuştaş|bulanık|adjective|m|sıfat|B2|מטושטשים
מַתְאִים|מתאים|matim|uygun|adjective|m|sıfat|A2|מתאימים
מְיֻתָּר|מיותר|meyutar|gereksiz|adjective|m|sıfat|B1|מיותרים
דָּחוּף|דחוף|dahuf|acil|adjective|m|sıfat|B1|דחופים
זָמִין|זמין|zamin|müsait; erişilebilir|adjective|m|sıfat|B1|זמינים
תָּפוּס|תפוס|tafus|meşgul; dolu|adjective|m|sıfat|A2|תפוסים
פָּנוּי|פנוי|panuy|boş; müsait|adjective|m|sıfat|A2|פנויים
מוּכָן|מוכן|muhan|hazır|adjective|m|sıfat|A1|מוכנים
מוּתָשׁ|מותש|mutaş|bitkin|adjective|m|sıfat|B2|מותשים
גֵּאֶה|גאה|gee|gururlu|adjective|m|sıfat|B1|גאים
אַכְזָרִי|אכזרי|ahzari|zalim|adjective|m|sıfat|B2|אכזריים
הוֹגֵן|הוגן|hogen|adil|adjective|m|sıfat|B1|הוגנים
אָדִיב|אדיב|adiv|nazik|adjective|m|sıfat|B1|אדיבים
עַצְמָאִי|עצמאי|atsmai|bağımsız|adjective|m|sıfat|B1|עצמאיים
אַחְרַאי|אחראי|ahrai|sorumlu|adjective|m|sıfat|B1|אחראים
מְנֻסֶּה|מנוסה|menuse|deneyimli|adjective|m|sıfat|B1|מנוסים
מַצְלִיחַ|מצליח|matsliah|başarılı|adjective|m|sıfat|B1|מצליחים
נָדִיר|נדיר|nadir|nadir|adjective|m|sıfat|B1|נדירים
שָׁכִיחַ|שכיח|şahiah|yaygın|adjective|m|sıfat|B2|שכיחים
זוֹל|זול|zol|ucuz|adjective|m|sıfat|A1|זולים
יָקָר|יקר|yakar|pahalı; değerli|adjective|m|sıfat|A1|יקרים
`;

/** Zarf ve bağlaç — cümleyi birbirine bağlayan küçük kelimeler. */
export const LEX_ADV_DEEP = `
כְּבָר|כבר|kvar|artık; çoktan|adverb|-|zarf|A1|
עֲדַיִן|עדיין|adayin|hâlâ|adverb|-|zarf|A2|
עוֹד|עוד|od|daha; hâlâ|adverb|-|zarf|A1|
שׁוּב|שוב|şuv|yine|adverb|-|zarf|A1|
פִּתְאוֹם|פתאום|pitom|aniden|adverb|-|zarf|A2|
מִיָּד|מייד|miyad|hemen|adverb|-|zarf|A2|
בְּעִקָּר|בעיקר|beikar|özellikle; başlıca|adverb|-|zarf|B1|
בִּכְלָל|בכלל|bihlal|hiç; genel olarak|adverb|-|zarf|A2|
בְּדִיּוּק|בדיוק|bediyuk|tam olarak|adverb|-|zarf|A2|
כִּמְעַט|כמעט|kimat|neredeyse|adverb|-|zarf|A2|
לְפָחוֹת|לפחות|lefahot|en azından|adverb|-|zarf|B1|
לְכָל הַיּוֹתֵר|לכל היותר|lehol hayoter|en fazla|adverb|-|zarf|B2|
בְּדֶרֶךְ כְּלָל|בדרך כלל|bedereh klal|genellikle|adverb|-|zarf|A2|
לִפְעָמִים|לפעמים|lifamim|bazen|adverb|-|zarf|A1|
לְעוֹלָם לֹא|לעולם לא|leolam lo|asla|adverb|-|zarf|B1|
בְּקֹשִׁי|בקושי|bekoşi|zar zor|adverb|-|zarf|B1|
בְּעַצְמִי|בעצמי|beatsmi|kendi başıma|adverb|-|zarf|B1|
דַּוְקָא|דווקא|davka|bilhassa; aksine|adverb|-|zarf|B1|
אַף עַל פִּי כֵן|אף על פי כן|af al pi hen|buna rağmen|adverb|-|zarf|B2|
לָכֵן|לכן|lahen|bu yüzden|adverb|-|zarf|A2|
אֲבָל|אבל|aval|ama|adverb|-|zarf|A1|
אוֹ|או|o|veya|adverb|-|zarf|A1|
גַּם|גם|gam|de; da|adverb|-|zarf|A1|
רַק|רק|rak|sadece|adverb|-|zarf|A1|
אִם|אם|im|eğer|adverb|-|zarf|A1|
כִּי|כי|ki|çünkü|adverb|-|zarf|A1|
כַּאֲשֶׁר|כאשר|kaaşer|-diğinde|adverb|-|zarf|A2|
לַמְרוֹת|למרות|lamrot|-e rağmen|adverb|-|zarf|B1|
כְּדֵי|כדי|kdey|-mek için|adverb|-|zarf|A2|
אֲפִלּוּ|אפילו|afilu|bile|adverb|-|zarf|B1|
בִּמְקוֹם|במקום|bimkom|yerine|adverb|-|zarf|B1|
מִלְּבַד|מלבד|milvad|dışında; hariç|adverb|-|zarf|B2|
`;

/** Zaman — takvim, sıklık, dönem. */
export const LEX_TIME_DEEP = `
רֶגַע|רגע|rega|an|noun|m|zaman|A1|רגעים
שְׁנִיָּה|שנייה|şniya|saniye|noun|f|zaman|A2|שניות
חֵצִי|חצי|hetsi|yarım|noun|m|zaman|A1|חצאים
רֶבַע|רבע|reva|çeyrek|noun|m|zaman|A2|רבעים
תַּאֲרִיךְ|תאריך|tarih|tarih (gün)|noun|m|zaman|A2|תאריכים
לוּחַ שָׁנָה|לוח שנה|luah şana|takvim|noun|m|zaman|B1|
עָבָר|עבר|avar|geçmiş|noun|m|zaman|B1|
הוֹוֶה|הווה|hove|şimdiki zaman|noun|m|zaman|B1|
עָתִיד|עתיד|atid|gelecek|noun|m|zaman|B1|
תְּקוּפָה|תקופה|tkufa|dönem|noun|f|zaman|B1|תקופות
דּוֹר|דור|dor|kuşak|noun|m|zaman|B1|דורות
עִדָּן|עידן|idan|çağ|noun|m|zaman|B2|עידנים
אֶתְמוֹל|אתמול|etmol|dün|adverb|-|zaman|A1|
הַיּוֹם|היום|hayom|bugün|adverb|-|zaman|A1|
מָחָר|מחר|mahar|yarın|adverb|-|zaman|A1|
שִׁלְשׁוֹם|שלשום|şilşom|evvelsi gün|adverb|-|zaman|B1|
מָחֳרָתַיִם|מחרתיים|mahorotayim|öbür gün|adverb|-|zaman|B1|
עַכְשָׁו|עכשיו|ahşav|şimdi|adverb|-|zaman|A1|
אָז|אז|az|o zaman; sonra|adverb|-|zaman|A1|
מֻקְדָּם|מוקדם|mukdam|erken|adverb|-|zaman|A2|
מְאֻחָר|מאוחר|meuhar|geç|adverb|-|zaman|A2|
יוֹם רִאשׁוֹן|יום ראשון|yom rişon|pazar|noun|m|zaman|A1|
יוֹם שֵׁנִי|יום שני|yom şeni|pazartesi|noun|m|zaman|A1|
יוֹם שְׁלִישִׁי|יום שלישי|yom şlişi|salı|noun|m|zaman|A1|
יוֹם רְבִיעִי|יום רביעי|yom revii|çarşamba|noun|m|zaman|A1|
יוֹם חֲמִישִׁי|יום חמישי|yom hamişi|perşembe|noun|m|zaman|A1|
יוֹם שִׁשִּׁי|יום שישי|yom şişi|cuma|noun|m|zaman|A1|
סוֹף שָׁבוּעַ|סוף שבוע|sof şavua|hafta sonu|noun|m|zaman|A2|
חַג|חג|hag|bayram|noun|m|zaman|A1|חגים
`;


/** Toplum, duygu, kişilik — insanı anlatan söz varlığı. */
export const LEX_PEOPLE_DEEP = `
אֻכְלוּסִיָּה|אוכלוסייה|uhlusiya|nüfus|noun|f|toplum|B2|אוכלוסיות
אֶזְרָח|אזרח|ezrah|vatandaş|noun|m|toplum|B1|אזרחים
עוֹלֶה|עולה|ole|göçmen (İsraile gelen)|noun|m|toplum|B1|עולים
פָּלִיט|פליט|palit|mülteci|noun|m|toplum|B2|פליטים
מִעוּט|מיעוט|miut|azınlık|noun|m|toplum|B2|מיעוטים
רֹב|רוב|rov|çoğunluk|noun|m|toplum|B1|
קְהִלָּה|קהילה|kehila|topluluk; cemaat|noun|f|toplum|B1|קהילות
אִרְגּוּן|ארגון|irgun|örgüt; kuruluş|noun|m|toplum|B1|ארגונים
מוֹסָד|מוסד|mosad|kurum|noun|m|toplum|B1|מוסדות
מַנְהִיג|מנהיג|manhig|lider|noun|m|toplum|B1|מנהיגים
מִפְלָגָה|מפלגה|miflaga|siyasi parti|noun|f|toplum|B1|מפלגות
כְּנֶסֶת|כנסת|kneset|İsrail meclisi|noun|f|toplum|B1|
שַׂר|שר|sar|bakan|noun|m|toplum|B1|שרים
רֹאשׁ מֶמְשָׁלָה|ראש ממשלה|roş memşala|başbakan|noun|m|toplum|B1|
נָשִׂיא|נשיא|nasi|cumhurbaşkanı|noun|m|toplum|B1|נשיאים
מְדִינִיּוּת|מדיניות|medinyut|politika (izlenen yol)|noun|f|toplum|B2|
שִׁוְיוֹן|שוויון|şivyon|eşitlik|noun|m|toplum|B2|
צֶדֶק|צדק|tsedek|adalet|noun|m|toplum|B1|
חֵרוּת|חירות|herut|özgürlük|noun|f|toplum|B1|חירויות
אַלִּימוּת|אלימות|alimut|şiddet|noun|f|toplum|B2|
פֶּשַׁע|פשע|peşa|suç|noun|m|toplum|B1|פשעים
עֹנִי|עוני|oni|yoksulluk|noun|m|toplum|B2|
צָבָא|צבא|tsava|ordu|noun|m|toplum|A2|צבאות
חַיָּל|חייל|hayal|asker|noun|m|toplum|A2|חיילים
מִתְנַדֵּב|מתנדב|mitnadev|gönüllü|noun|m|toplum|B1|מתנדבים
אַחֲרָיוּת חֶבְרָתִית|אחריות חברתית|ahrayut hevratit|toplumsal sorumluluk|noun|f|toplum|B2|
אֵמוּן|אמון|emun|güven|noun|m|duygu|B1|
כָּבוֹד|כבוד|kavod|saygı; onur|noun|m|duygu|B1|
בְּדִידוּת|בדידות|bdidut|yalnızlık|noun|f|duygu|B2|
קִנְאָה|קנאה|kina|kıskançlık|noun|f|duygu|B2|
גַּעְגּוּעַ|געגוע|gaagua|özlem|noun|m|duygu|B1|געגועים
אַכְזָבָה|אכזבה|ahzava|hayal kırıklığı|noun|f|duygu|B1|אכזבות
הַקְלָה|הקלה|hakala|rahatlama|noun|f|duygu|B2|
לַחַץ|לחץ|lahats|stres; baskı|noun|m|duygu|B1|לחצים
סַבְלָנוּת|סבלנות|savlanut|sabır|noun|f|duygu|B1|
רַחֲמִים|רחמים|rahamim|merhamet|noun|m|duygu|B2|
`;

/** Kültür, sanat, medya. */
export const LEX_CULTURE_DEEP = `
אָמָּנוּת|אמנות|omanut|sanat|noun|f|sanat|B1|
צַיָּר|צייר|tsayar|ressam|noun|m|sanat|B1|ציירים
פַּסָּל|פסל|pasal|heykeltıraş|noun|m|sanat|B2|פסלים
שִׁיר עָם|שירה|şira|şiir sanatı|noun|f|sanat|B1|
מְשׁוֹרֵר|משורר|meşorer|şair|noun|m|sanat|B1|משוררים
סוֹפֵר|סופר|sofer|yazar|noun|m|sanat|A2|סופרים
רוֹמָן|רומן|roman|roman|noun|m|sanat|B1|רומנים
הַצָּגָה|הצגה|hatsaga|tiyatro oyunu; gösteri|noun|f|sanat|A2|הצגות
שַׂחְקָן|שחקן|sahkan|oyuncu|noun|m|sanat|A2|שחקנים
בַּמַּאי|במאי|bamai|yönetmen|noun|m|sanat|B1|במאים
לַהֲקָה|להקה|lahaka|grup; topluluk|noun|f|sanat|B1|להקות
זַמָּר|זמר|zamar|şarkıcı|noun|m|sanat|A2|זמרים
כְּלִי נְגִינָה|כלי נגינה|kli negina|müzik aleti|noun|m|sanat|B1|
גִּיטָרָה|גיטרה|gitara|gitar|noun|f|sanat|A2|גיטרות
פְּסַנְתֵּר|פסנתר|psanter|piyano|noun|m|sanat|A2|פסנתרים
כִּנּוֹר|כינור|kinor|keman|noun|m|sanat|B1|כינורות
תֻּף|תוף|tof|davul|noun|m|sanat|B1|תופים
קֶצֶב|קצב|ketsev|ritim|noun|m|sanat|B1|
תַּעֲרוּכָה|תערוכה|taaruha|sergi|noun|f|sanat|B1|תערוכות
פֶּסֶל|פסל|pesel|heykel|noun|m|sanat|B2|פסלים
צִלּוּם|צילום|tsilum|fotoğraf; çekim|noun|m|sanat|A2|צילומים
מָסֹרֶת|מסורת|masoret|gelenek|noun|f|sanat|B1|מסורות
מִנְהָג|מנהג|minhag|âdet; gelenek|noun|m|sanat|B2|מנהגים
אֳמָנוּת עַמָּמִית|פולקלור|folklor|folklor|noun|m|sanat|B2|
`;

/** Spor ve boş zaman. */
export const LEX_SPORT_DEEP = `
סְפוֹרְט|ספורט|sport|spor|noun|m|spor|A1|
כַּדּוּרְסַל|כדורסל|kadursal|basketbol|noun|m|spor|A2|
כַּדּוּרְעָף|כדורעף|kaduraf|voleybol|noun|m|spor|B1|
שְׂחִיָּה|שחייה|shiya|yüzme|noun|f|spor|A2|
רִיצָה|ריצה|ritsa|koşu|noun|f|spor|A2|
טֶנִיס|טניס|tenis|tenis|noun|m|spor|A2|
אִמּוּן|אימון|imun|antrenman|noun|m|spor|B1|אימונים
מְאַמֵּן|מאמן|meamen|antrenör|noun|m|spor|B1|מאמנים
תַּחֲרוּת|תחרות|taharut|yarışma|noun|f|spor|B1|תחרויות
נִצָּחוֹן|ניצחון|nitsahon|zafer|noun|m|spor|B1|ניצחונות
תֵּיקוּ|תיקו|teyku|beraberlik|noun|m|spor|B2|
שַׁעַר|שער|şaar|gol; kapı|noun|m|spor|A2|שערים
מִגְרַשׁ מִשְׂחָקִים|אצטדיון|itstadyon|stadyum|noun|m|spor|B1|אצטדיונים
חֶדֶר כּוֹשֶׁר|חדר כושר|heder koşer|spor salonu|noun|m|spor|A2|
יוֹגָה|יוגה|yoga|yoga|noun|f|spor|A2|
טִיּוּל רַגְלִי|הליכה|haliha|yürüyüş|noun|f|spor|A2|
תַּחְבִּיב|תחביב|tahbiv|hobi|noun|m|boş zaman|A2|תחביבים
קְרִיאָה|קריאה|kria|okuma; çağrı|noun|f|boş zaman|A2|קריאות
בִּלּוּי|בילוי|bilui|eğlence; vakit geçirme|noun|m|boş zaman|B1|בילויים
פְּנַאי|פנאי|pnai|boş vakit|noun|m|boş zaman|B1|
כַּרְטִיס כְּנִיסָה|כרטיס כניסה|kartis knisa|giriş bileti|noun|m|boş zaman|A2|
קֶמְפִּינְג|קמפינג|kemping|kamp|noun|m|boş zaman|B1|
`;

/** Vücut — çekirdekte olmayan bölümler ve hareketler. */
export const LEX_BODY_DEEP = `
פָּנִים|פנים|panim|yüz|noun|m|vücut|A1|
מֵצַח|מצח|metsah|alın|noun|m|vücut|B1|מצחות
לֶחִי|לחי|lehi|yanak|noun|f|vücut|B1|לחיים
סַנְטֵר|סנטר|santer|çene|noun|m|vücut|B1|סנטרים
צַוָּאר|צוואר|tsavar|boyun|noun|m|vücut|A2|צווארים
כָּתֵף|כתף|katef|omuz|noun|f|vücut|A2|כתפיים
זְרוֹעַ|זרוע|zroa|kol|noun|f|vücut|A2|זרועות
מַרְפֵּק|מרפק|marpek|dirsek|noun|m|vücut|B1|מרפקים
אֶצְבַּע|אצבע|etsba|parmak|noun|f|vücut|A2|אצבעות
צִפֹּרֶן|ציפורן|tsiporen|tırnak|noun|f|vücut|B1|ציפורניים
בֶּרֶךְ|ברך|bereh|diz|noun|f|vücut|A2|ברכיים
קַרְסֹל|קרסול|karsol|ayak bileği|noun|m|vücut|B2|קרסוליים
עָקֵב|עקב|akev|topuk|noun|m|vücut|B2|עקבים
גָּרוֹן|גרון|garon|boğaz|noun|m|vücut|A2|גרונות
לָשׁוֹן|לשון|laşon|dil (organ); lisan|noun|f|vücut|A2|לשונות
שָׂפָה תַּחְתּוֹנָה|שפתיים|sfatayim|dudaklar|noun|f|vücut|A2|
גּוּף|גוף|guf|vücut; gövde|noun|m|vücut|A2|גופים
נְשִׁימָה|נשימה|neşima|nefes|noun|f|vücut|B1|נשימות
דְּמָעוֹת|דמעות|dmaot|gözyaşları|noun|f|vücut|B1|
חִיּוּךְ|חיוך|hiyuh|gülümseme|noun|m|vücut|A2|חיוכים
קוֹל|קול|kol|ses|noun|m|vücut|A1|קולות
`;

export const WIDE_TABLES = [
  LEX_PEOPLE_DEEP,
  LEX_CULTURE_DEEP,
  LEX_SPORT_DEEP,
  LEX_BODY_DEEP,
  LEX_FOOD_DEEP,
  LEX_HOME_DEEP,
  LEX_HEALTH,
  LEX_CITY_DEEP,
  LEX_TRAVEL,
  LEX_SCHOOL_DEEP,
  LEX_TECH_DEEP,
  LEX_NATURE_DEEP,
  LEX_ANIMALS,
  LEX_CLOTHES_DEEP,
  LEX_BUSINESS,
  LEX_ADJ_DEEP,
  LEX_ADV_DEEP,
  LEX_TIME_DEEP,
];
