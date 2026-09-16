/**
 * Sözlük — A1/A2 çekirdeği.
 *
 * SEÇİM ÖLÇÜSÜ: Bir ulpanın ilk aylarında gerçekten geçen, günlük hayatı
 * adlandırmaya yeten kelimeler. Sıklık listesinden değil, KULLANIM
 * senaryosundan seçildi: markete gitmek, ev tarif etmek, saat sormak,
 * ailesini anlatmak.
 *
 * Biçim: harekeli | harekesiz | okunuş | türkçe (;) | tür | cins | konu | CEFR [| çoğul]
 * Cinsiyeti olmayan türlerde (zarf, edat) cins alanı '-' olur.
 */

/** Aile ve insanlar. */
export const LEX_FAMILY = `
אַבָּא|אבא|aba|baba|noun|m|aile|A1|אבות
אִמָּא|אמא|ima|anne|noun|f|aile|A1|אמהות
בֵּן|בן|ben|oğul; erkek çocuk|noun|m|aile|A1|בנים
בַּת|בת|bat|kız evlat|noun|f|aile|A1|בנות
אָח|אח|ah|erkek kardeş|noun|m|aile|A1|אחים
אָחוֹת|אחות|ahot|kız kardeş; hemşire|noun|f|aile|A1|אחיות
סַבָּא|סבא|saba|dede|noun|m|aile|A1|סבים
סַבְתָא|סבתא|savta|nine|noun|f|aile|A1|סבתות
בַּעַל|בעל|baal|koca; sahip|noun|m|aile|A2|בעלים
אִשָּׁה|אישה|işa|kadın; eş|noun|f|aile|A1|נשים
אִישׁ|איש|iş|adam; kişi|noun|m|aile|A1|אנשים
יֶלֶד|ילד|yeled|çocuk (erkek)|noun|m|aile|A1|ילדים
יַלְדָּה|ילדה|yalda|çocuk (kız)|noun|f|aile|A1|ילדות
תִּינוֹק|תינוק|tinok|bebek|noun|m|aile|A2|תינוקות
מִשְׁפָּחָה|משפחה|mişpaha|aile|noun|f|aile|A1|משפחות
חָבֵר|חבר|haver|arkadaş; erkek arkadaş|noun|m|aile|A1|חברים
חֲבֵרָה|חברה|havera|arkadaş (kız); kız arkadaş|noun|f|aile|A1|חברות
שָׁכֵן|שכן|şahen|komşu|noun|m|aile|A2|שכנים
דּוֹד|דוד|dod|amca; dayı|noun|m|aile|A2|דודים
דּוֹדָה|דודה|doda|hala; teyze|noun|f|aile|A2|דודות
הוֹרֶה|הורה|hore|ebeveyn|noun|m|aile|A2|הורים
גֶּבֶר|גבר|gever|erkek|noun|m|aile|A2|גברים
בָּחוּר|בחור|bahur|delikanlı; genç adam|noun|m|aile|A2|בחורים
בַּחוּרָה|בחורה|bahura|genç kadın|noun|f|aile|A2|בחורות
`;

/** Ev ve eşya. */
export const LEX_HOME = `
בַּיִת|בית|bayit|ev|noun|m|ev|A1|בתים
דִּירָה|דירה|dira|daire|noun|f|ev|A1|דירות
חֶדֶר|חדר|heder|oda|noun|m|ev|A1|חדרים
מִטְבָּח|מטבח|mitbah|mutfak|noun|m|ev|A1|מטבחים
מִקְלַחַת|מקלחת|miklahat|duş|noun|f|ev|A2|מקלחות
שֵׁרוּתִים|שירותים|şerutim|tuvalet|noun|m|ev|A1|
דֶּלֶת|דלת|delet|kapı|noun|f|ev|A1|דלתות
חַלּוֹן|חלון|halon|pencere|noun|m|ev|A1|חלונות
שֻׁלְחָן|שולחן|şulhan|masa|noun|m|ev|A1|שולחנות
כִּסֵּא|כיסא|kise|sandalye|noun|m|ev|A1|כיסאות
מִטָּה|מיטה|mita|yatak|noun|f|ev|A1|מיטות
אָרוֹן|ארון|aron|dolap|noun|m|ev|A2|ארונות
מְנוֹרָה|מנורה|menora|lamba|noun|f|ev|A2|מנורות
מַפְתֵּחַ|מפתח|mafteah|anahtar|noun|m|ev|A1|מפתחות
מַרְאָה|מראה|mara|ayna|noun|f|ev|A2|מראות
שָׁטִיחַ|שטיח|şatiah|halı|noun|m|ev|A2|שטיחים
כּוֹס|כוס|kos|bardak|noun|f|ev|A1|כוסות
צַלַּחַת|צלחת|tsalahat|tabak|noun|f|ev|A1|צלחות
כַּף|כף|kaf|kaşık|noun|f|ev|A2|כפות
סַכִּין|סכין|sakin|bıçak|noun|f|ev|A2|סכינים
מַזְלֵג|מזלג|mazleg|çatal|noun|m|ev|A2|מזלגות
מְקָרֵר|מקרר|mekarer|buzdolabı|noun|m|ev|A2|מקררים
גִּנָּה|גינה|gina|bahçe|noun|f|ev|A2|גינות
מַדְרֵגוֹת|מדרגות|madregot|merdiven|noun|f|ev|A2|
`;

/** Yeme içme. */
export const LEX_FOOD = `
אֹכֶל|אוכל|ohel|yemek|noun|m|yemek|A1|
לֶחֶם|לחם|leham|ekmek|noun|m|yemek|A1|לחמים
מַיִם|מים|mayim|su|noun|m|yemek|A1|
חָלָב|חלב|halav|süt|noun|m|yemek|A1|
גְּבִינָה|גבינה|gvina|peynir|noun|f|yemek|A1|גבינות
בֵּיצָה|ביצה|beytsa|yumurta|noun|f|yemek|A1|ביצים
בָּשָׂר|בשר|basar|et|noun|m|yemek|A1|
עוֹף|עוף|of|tavuk; kuş|noun|m|yemek|A1|עופות
דָּג|דג|dag|balık|noun|m|yemek|A1|דגים
אֹרֶז|אורז|orez|pirinç|noun|m|yemek|A2|
יָרָק|ירק|yarak|sebze|noun|m|yemek|A1|ירקות
פְּרִי|פרי|pri|meyve|noun|m|yemek|A1|פירות
תַּפּוּחַ|תפוח|tapuah|elma|noun|m|yemek|A1|תפוחים
בָּנָנָה|בננה|banana|muz|noun|f|yemek|A1|בננות
עַגְבָנִיָּה|עגבנייה|agvaniya|domates|noun|f|yemek|A1|עגבניות
מְלָפְפוֹן|מלפפון|melafefon|salatalık|noun|m|yemek|A2|מלפפונים
בָּצָל|בצל|batsal|soğan|noun|m|yemek|A2|בצלים
תַּפּוּחַ אֲדָמָה|תפוח אדמה|tapuah adama|patates|noun|m|yemek|A2|
סֻכָּר|סוכר|sukar|şeker|noun|m|yemek|A1|
מֶלַח|מלח|melah|tuz|noun|m|yemek|A1|
שֶׁמֶן|שמן|şemen|yağ|noun|m|yemek|A2|שמנים
חֶמְאָה|חמאה|hema|tereyağı|noun|f|yemek|A2|
עוּגָה|עוגה|uga|pasta; kek|noun|f|yemek|A1|עוגות
קָפֶה|קפה|kafe|kahve|noun|m|yemek|A1|
תֵּה|תה|te|çay|noun|m|yemek|A1|
יַיִן|יין|yayin|şarap|noun|m|yemek|A2|יינות
מִיץ|מיץ|mits|meyve suyu|noun|m|yemek|A1|מיצים
אֲרוּחָה|ארוחה|aruha|öğün|noun|f|yemek|A1|ארוחות
מִסְעָדָה|מסעדה|misada|restoran|noun|f|yemek|A1|מסעדות
מֶלְצַר|מלצר|meltsar|garson|noun|m|yemek|A2|מלצרים
תַּפְרִיט|תפריט|tafrit|menü|noun|m|yemek|A2|תפריטים
`;

/** Şehir, ulaşım, alışveriş. */
export const LEX_CITY = `
עִיר|עיר|ir|şehir|noun|f|şehir|A1|ערים
רְחוֹב|רחוב|rehov|sokak; cadde|noun|m|şehir|A1|רחובות
כְּתֹבֶת|כתובת|ktovet|adres|noun|f|şehir|A2|כתובות
חֲנוּת|חנות|hanut|dükkân|noun|f|şehir|A1|חנויות
שׁוּק|שוק|şuk|çarşı; pazar|noun|m|şehir|A1|שווקים
בַּנְק|בנק|bank|banka|noun|m|şehir|A1|בנקים
דֹּאַר|דואר|doar|posta|noun|m|şehir|A2|
בֵּית חוֹלִים|בית חולים|beyt holim|hastane|noun|m|şehir|A1|
בֵּית סֵפֶר|בית ספר|beyt sefer|okul|noun|m|şehir|A1|
בֵּית קָפֶה|בית קפה|beyt kafe|kafe|noun|m|şehir|A1|
מָלוֹן|מלון|malon|otel|noun|m|şehir|A2|מלונות
תַּחֲנָה|תחנה|tahana|durak; istasyon|noun|f|şehir|A1|תחנות
אוֹטוֹבּוּס|אוטובוס|otobus|otobüs|noun|m|ulaşım|A1|אוטובוסים
רַכֶּבֶת|רכבת|rakevet|tren|noun|f|ulaşım|A1|רכבות
מוֹנִית|מונית|monit|taksi|noun|f|ulaşım|A1|מוניות
מְכוֹנִית|מכונית|mehonit|araba|noun|f|ulaşım|A1|מכוניות
אוֹפַנַּיִם|אופניים|ofanayim|bisiklet|noun|m|ulaşım|A2|
מָטוֹס|מטוס|matos|uçak|noun|m|ulaşım|A1|מטוסים
נְמַל תְּעוּפָה|נמל תעופה|nemal teufa|havalimanı|noun|m|ulaşım|A2|
כַּרְטִיס|כרטיס|kartis|bilet; kart|noun|m|ulaşım|A1|כרטיסים
כֶּסֶף|כסף|kesef|para; gümüş|noun|m|şehir|A1|
מְחִיר|מחיר|mehir|fiyat|noun|m|şehir|A2|מחירים
`;

/** Zaman. */
export const LEX_TIME = `
יוֹם|יום|yom|gün|noun|m|zaman|A1|ימים
לַיְלָה|לילה|layla|gece|noun|m|zaman|A1|לילות
בֹּקֶר|בוקר|boker|sabah|noun|m|zaman|A1|בקרים
עֶרֶב|ערב|erev|akşam|noun|m|zaman|A1|ערבים
צָהֳרַיִם|צהריים|tsohorayim|öğle|noun|m|zaman|A1|
שָׁבוּעַ|שבוע|şavua|hafta|noun|m|zaman|A1|שבועות
חֹדֶשׁ|חודש|hodeş|ay (takvim)|noun|m|zaman|A1|חודשים
שָׁנָה|שנה|şana|yıl|noun|f|zaman|A1|שנים
שָׁעָה|שעה|şaa|saat (süre)|noun|f|zaman|A1|שעות
דַּקָּה|דקה|daka|dakika|noun|f|zaman|A1|דקות
זְמַן|זמן|zman|zaman|noun|m|zaman|A1|זמנים
קַיִץ|קיץ|kayits|yaz|noun|m|zaman|A2|
חֹרֶף|חורף|horef|kış|noun|m|zaman|A2|
אָבִיב|אביב|aviv|ilkbahar|noun|m|zaman|A2|
סְתָו|סתיו|stav|sonbahar|noun|m|zaman|A2|
שַׁבָּת|שבת|şabat|cumartesi; şabat|noun|f|zaman|A1|שבתות
`;

/** Vücut ve sağlık. */
export const LEX_BODY = `
רֹאשׁ|ראש|roş|baş|noun|m|vücut|A1|ראשים
עַיִן|עין|ayin|göz|noun|f|vücut|A1|עיניים
אֹזֶן|אוזן|ozen|kulak|noun|f|vücut|A2|אוזניים
אַף|אף|af|burun|noun|m|vücut|A2|אפים
פֶּה|פה|pe|ağız|noun|m|vücut|A2|
יָד|יד|yad|el; kol|noun|f|vücut|A1|ידיים
רֶגֶל|רגל|regel|ayak; bacak|noun|f|vücut|A1|רגליים
לֵב|לב|lev|kalp|noun|m|vücut|A1|לבבות
שֵׁן|שן|şen|diş|noun|f|vücut|A2|שיניים
שֵׂעָר|שיער|sear|saç|noun|m|vücut|A2|
בֶּטֶן|בטן|beten|karın|noun|f|vücut|A2|בטנים
גַּב|גב|gav|sırt|noun|m|vücut|A2|גבים
רוֹפֵא|רופא|rofe|doktor|noun|m|vücut|A1|רופאים
כְּאֵב|כאב|keev|ağrı|noun|m|vücut|A2|כאבים
בְּרִיאוּת|בריאות|briut|sağlık|noun|f|vücut|A2|
תְּרוּפָה|תרופה|trufa|ilaç|noun|f|vücut|A2|תרופות
`;

/** Okul, iş, teknoloji. */
export const LEX_WORK = `
עֲבוֹדָה|עבודה|avoda|iş; çalışma|noun|f|iş|A1|עבודות
מוֹרֶה|מורה|more|öğretmen (erkek)|noun|m|okul|A1|מורים
מוֹרָה|מורה|mora|öğretmen (kadın)|noun|f|okul|A1|מורות
תַּלְמִיד|תלמיד|talmid|öğrenci|noun|m|okul|A1|תלמידים
סֵפֶר|ספר|sefer|kitap|noun|m|okul|A1|ספרים
מַחְבֶּרֶת|מחברת|mahberet|defter|noun|f|okul|A1|מחברות
עֵט|עט|et|kalem (tükenmez)|noun|m|okul|A1|עטים
עִפָּרוֹן|עיפרון|iparon|kurşun kalem|noun|m|okul|A2|עפרונות
שִׁעוּר|שיעור|şiur|ders|noun|m|okul|A1|שיעורים
מִבְחָן|מבחן|mivhan|sınav|noun|m|okul|A2|מבחנים
שְׁאֵלָה|שאלה|şeela|soru|noun|f|okul|A1|שאלות
תְּשׁוּבָה|תשובה|tşuva|cevap|noun|f|okul|A1|תשובות
מִלָּה|מילה|mila|kelime|noun|f|okul|A1|מילים
מִשְׁפָּט|משפט|mişpat|cümle; mahkeme|noun|m|okul|A2|משפטים
שָׂפָה|שפה|safa|dil (lisan)|noun|f|okul|A1|שפות
מַחְשֵׁב|מחשב|mahşev|bilgisayar|noun|m|teknoloji|A1|מחשבים
טֵלֵפוֹן|טלפון|telefon|telefon|noun|m|teknoloji|A1|טלפונים
מִסְפָּר|מספר|mispar|sayı; numara|noun|m|teknoloji|A1|מספרים
אִינְטֶרְנֶט|אינטרנט|internet|internet|noun|m|teknoloji|A1|
הוֹדָעָה|הודעה|hodaa|mesaj; duyuru|noun|f|teknoloji|A2|הודעות
מִשְׂרָד|משרד|misrad|ofis; bakanlık|noun|m|iş|A2|משרדים
חֶבְרָה|חברה|hevra|şirket; toplum|noun|f|iş|A2|חברות
`;

/** Giysi, renk, doğa, hayvan. */
export const LEX_WORLD = `
בֶּגֶד|בגד|beged|giysi|noun|m|giysi|A2|בגדים
חֻלְצָה|חולצה|hultsa|gömlek; tişört|noun|f|giysi|A1|חולצות
מִכְנָסַיִם|מכנסיים|mihnasayim|pantolon|noun|m|giysi|A1|
נַעַל|נעל|naal|ayakkabı|noun|f|giysi|A1|נעליים
שִׂמְלָה|שמלה|simla|elbise|noun|f|giysi|A2|שמלות
מְעִיל|מעיל|meil|palto; ceket|noun|m|giysi|A2|מעילים
כּוֹבַע|כובע|kova|şapka|noun|m|giysi|A2|כובעים
אָדֹם|אדום|adom|kırmızı|adjective|m|renk|A1|
כָּחֹל|כחול|kahol|mavi|adjective|m|renk|A1|
יָרֹק|ירוק|yarok|yeşil|adjective|m|renk|A1|
צָהֹב|צהוב|tsahov|sarı|adjective|m|renk|A1|
לָבָן|לבן|lavan|beyaz|adjective|m|renk|A1|
שָׁחֹר|שחור|şahor|siyah|adjective|m|renk|A1|
כָּתֹם|כתום|katom|turuncu|adjective|m|renk|A2|
סָגֹל|סגול|sagol|mor|adjective|m|renk|A2|
חוּם|חום|hum|kahverengi|adjective|m|renk|A2|
אָפֹר|אפור|afor|gri|adjective|m|renk|A2|
שֶׁמֶשׁ|שמש|şemeş|güneş|noun|f|doğa|A1|
יָרֵחַ|ירח|yareah|ay (gök)|noun|m|doğa|A2|ירחים
כּוֹכָב|כוכב|kohav|yıldız|noun|m|doğa|A2|כוכבים
שָׁמַיִם|שמיים|şamayim|gökyüzü|noun|m|doğa|A2|
יָם|ים|yam|deniz|noun|m|doğa|A1|ימים
הַר|הר|har|dağ|noun|m|doğa|A2|הרים
עֵץ|עץ|ets|ağaç|noun|m|doğa|A1|עצים
פֶּרַח|פרח|perah|çiçek|noun|m|doğa|A2|פרחים
גֶּשֶׁם|גשם|geşem|yağmur|noun|m|doğa|A1|גשמים
רוּחַ|רוח|ruah|rüzgâr; ruh|noun|f|doğa|A2|רוחות
אֲוִיר|אוויר|avir|hava|noun|m|doğa|A2|
כֶּלֶב|כלב|kelev|köpek|noun|m|hayvan|A1|כלבים
חָתוּל|חתול|hatul|kedi|noun|m|hayvan|A1|חתולים
צִפּוֹר|ציפור|tsipor|kuş|noun|f|hayvan|A2|ציפורים
סוּס|סוס|sus|at|noun|m|hayvan|A2|סוסים
`;

/** Sıfatlar ve zarflar — uyum alıştırmalarının hammaddesi. */
export const LEX_ADJ = `
גָּדוֹל|גדול|gadol|büyük|adjective|m|sıfat|A1|
קָטָן|קטן|katan|küçük|adjective|m|sıfat|A1|
טוֹב|טוב|tov|iyi|adjective|m|sıfat|A1|
רַע|רע|ra|kötü|adjective|m|sıfat|A1|
חָדָשׁ|חדש|hadaş|yeni|adjective|m|sıfat|A1|
יָשָׁן|ישן|yaşan|eski|adjective|m|sıfat|A1|
יָפֶה|יפה|yafe|güzel|adjective|m|sıfat|A1|
צָעִיר|צעיר|tsair|genç|adjective|m|sıfat|A2|
זָקֵן|זקן|zaken|yaşlı|adjective|m|sıfat|A2|
אָרֹךְ|ארוך|aroh|uzun|adjective|m|sıfat|A2|
קָצָר|קצר|katsar|kısa|adjective|m|sıfat|A2|
חַם|חם|ham|sıcak|adjective|m|sıfat|A1|
קַר|קר|kar|soğuk|adjective|m|sıfat|A1|
קַל|קל|kal|kolay; hafif|adjective|m|sıfat|A1|
קָשֶׁה|קשה|kaşe|zor; sert|adjective|m|sıfat|A1|
מָהִיר|מהיר|mahir|hızlı|adjective|m|sıfat|A2|
אִטִּי|איטי|iti|yavaş|adjective|m|sıfat|A2|
מָלֵא|מלא|male|dolu|adjective|m|sıfat|A2|
רֵיק|ריק|reyk|boş|adjective|m|sıfat|A2|
נָקִי|נקי|naki|temiz|adjective|m|sıfat|A2|
מְלֻכְלָךְ|מלוכלך|meluhlah|kirli|adjective|m|sıfat|A2|
עָשִׁיר|עשיר|aşir|zengin|adjective|m|sıfat|A2|
עָנִי|עני|ani|fakir|adjective|m|sıfat|A2|
שָׂמֵחַ|שמח|sameah|mutlu|adjective|m|sıfat|A1|
עָצוּב|עצוב|atsuv|üzgün|adjective|m|sıfat|A1|
עָיֵף|עייף|ayef|yorgun|adjective|m|sıfat|A1|
רָעֵב|רעב|raev|aç|adjective|m|sıfat|A1|
צָמֵא|צמא|tsame|susamış|adjective|m|sıfat|A2|
חָשׁוּב|חשוב|haşuv|önemli|adjective|m|sıfat|A2|
מְעַנְיֵן|מעניין|meanyen|ilginç|adjective|m|sıfat|A2|
מְאֹד|מאוד|meod|çok|adverb|-|zarf|A1|
הַרְבֵּה|הרבה|harbe|çok (miktar)|adverb|-|zarf|A1|
קְצָת|קצת|ktsat|biraz|adverb|-|zarf|A1|
מַהֵר|מהר|maher|hızlıca|adverb|-|zarf|A2|
לְאַט|לאט|leat|yavaşça|adverb|-|zarf|A2|
יַחַד|יחד|yahad|birlikte|adverb|-|zarf|A2|
לְבַד|לבד|levad|yalnız|adverb|-|zarf|A2|
אוּלַי|אולי|ulay|belki|adverb|-|zarf|A1|
תָּמִיד|תמיד|tamid|her zaman|adverb|-|zarf|A1|
`;

/** Sayılar — eril biçim. */
export const LEX_NUM = `
אֶחָד|אחד|ehad|bir|number|m|sayı|A1|
שְׁנַיִם|שניים|şnayim|iki|number|m|sayı|A1|
שְׁלֹשָׁה|שלושה|şloşa|üç|number|m|sayı|A1|
אַרְבָּעָה|ארבעה|arbaa|dört|number|m|sayı|A1|
חֲמִשָּׁה|חמישה|hamişa|beş|number|m|sayı|A1|
שִׁשָּׁה|שישה|şişa|altı|number|m|sayı|A1|
שִׁבְעָה|שבעה|şiva|yedi|number|m|sayı|A1|
שְׁמוֹנָה|שמונה|şmona|sekiz|number|m|sayı|A1|
תִּשְׁעָה|תשעה|tişa|dokuz|number|m|sayı|A1|
עֲשָׂרָה|עשרה|asara|on|number|m|sayı|A1|
עֶשְׂרִים|עשרים|esrim|yirmi|number|m|sayı|A2|
מֵאָה|מאה|mea|yüz|number|f|sayı|A2|
אֶלֶף|אלף|elef|bin|number|m|sayı|A2|
`;

export const CORE_TABLES = [
  LEX_FAMILY,
  LEX_HOME,
  LEX_FOOD,
  LEX_CITY,
  LEX_TIME,
  LEX_BODY,
  LEX_WORK,
  LEX_WORLD,
  LEX_ADJ,
  LEX_NUM,
];
