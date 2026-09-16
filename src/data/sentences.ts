/**
 * Elle yazılmış örnek cümleler.
 *
 * NEDEN ÜRETİLENLERE EK OLARAK: `engine/sentence.ts` her fiil için
 * dilbilgisel olarak kusursuz bir cümle üretebiliyor (אֲנִי כּוֹתֵב), ama
 * üretilen cümlede NESNE ve BAĞLAM yok. "Ben yazıyorum" doğrudur;
 * "Anneme mektup yazıyorum" öğretir. Nesne, fiilin aldığı edat ve
 * nesnenin cinsiyeti uydurulamaz — bilinmesi gerekir.
 *
 * Bu yüzden iki katman: en sık kullanılan fiiller için elle yazılmış
 * cümleler burada; kalan yüzlerce fiil için motor devreye giriyor.
 * Arayüz varsa ÖNCE buradakini gösterir.
 *
 * Anahtar `<kök><binyan>` biçimindedir — katalogdaki `id` ile aynı.
 */
import type { HebrewForm } from '@/types/hebrew';

export interface WrittenSentence {
  he: string;
  plain: string;
  translit: string;
  tr: string;
  form: HebrewForm;
  /** Cümlenin öğrettiği ek nokta — edat, kalıp, sözdizimi. */
  note?: string;
}

export const WRITTEN_SENTENCES: Record<string, WrittenSentence[]> = {
  'כתב:paal': [
    {
      he: 'אֲנִי כּוֹתֵב מִכְתָּב לְאִמָּא שֶׁלִּי',
      plain: 'אני כותב מכתב לאמא שלי',
      translit: 'ani kotev mihtav le-ima şeli',
      tr: 'Anneme bir mektup yazıyorum.',
      form: 'present',
      note: 'שֶׁלִּי = "benim". İbranicede iyelik ayrı kelimeyle kurulur.',
    },
    {
      he: 'הִיא כָּתְבָה אֶת הַשֵּׁם שֶׁלָּהּ',
      plain: 'היא כתבה את השם שלה',
      translit: 'hi katva et ha-şem şela',
      tr: 'Adını yazdı.',
      form: 'past',
      note: 'אֶת belirli nesneyi işaretler; Türkçede karşılığı yoktur.',
    },
    {
      he: 'מָחָר אֶכְתּוֹב לְךָ',
      plain: 'מחר אכתוב לך',
      translit: 'mahar ehtov leha',
      tr: 'Yarın sana yazacağım.',
      form: 'future',
    },
  ],

  'למד:paal': [
    {
      he: 'אֲנִי לוֹמֵד עִבְרִית בְּאוּלְפָּן',
      plain: 'אני לומד עברית באולפן',
      translit: 'ani lomed ivrit be-ulpan',
      tr: 'Ulpanda İbranice öğreniyorum.',
      form: 'present',
      note: 'בְּ־ öneki "-de/-da" demektir, ayrı yazılmaz.',
    },
    {
      he: 'לָמַדְנוּ הַרְבֵּה הַיּוֹם',
      plain: 'למדנו הרבה היום',
      translit: 'lamadnu harbe hayom',
      tr: 'Bugün çok şey öğrendik.',
      form: 'past',
    },
  ],

  'למד:piel': [
    {
      he: 'הוּא מְלַמֵּד מָתֵמָטִיקָה בְּבֵית סֵפֶר',
      plain: 'הוא מלמד מתמטיקה בבית ספר',
      translit: 'hu melamed matematika be-veyt sefer',
      tr: 'Okulda matematik öğretiyor.',
      form: 'present',
      note: 'Aynı kök ל־מ־ד: pa’al "öğrenmek", pi’el "öğretmek".',
    },
  ],

  'אכל:paal': [
    {
      he: 'אֲנַחְנוּ אוֹכְלִים אֲרוּחַת בֹּקֶר',
      plain: 'אנחנו אוכלים ארוחת בוקר',
      translit: 'anahnu ohlim aruhat boker',
      tr: 'Kahvaltı yapıyoruz.',
      form: 'present',
      note: 'אֲרוּחַת בֹּקֶר = "sabah öğünü" — iki isim bitişerek tek kavram olur.',
    },
    {
      he: 'אָכַלְתִּי פַּלָאפֶל בָּרְחוֹב',
      plain: 'אכלתי פלאפל ברחוב',
      translit: 'ahalti falafel ba-rehov',
      tr: 'Sokakta falafel yedim.',
      form: 'past',
    },
  ],

  'שתה:paal': [
    {
      he: 'אֲנִי שׁוֹתֶה קָפֶה כָּל בֹּקֶר',
      plain: 'אני שותה קפה כל בוקר',
      translit: 'ani şote kafe kol boker',
      tr: 'Her sabah kahve içiyorum.',
      form: 'present',
    },
    {
      he: 'תִּשְׁתֶּה מַיִם, חַם בַּחוּץ',
      plain: 'תשתה מים, חם בחוץ',
      translit: 'tişte mayim, ham ba-huts',
      tr: 'Su iç, dışarısı sıcak.',
      form: 'future',
      note: 'Modern İvritte gelecek zaman kibar emir yerine geçer.',
    },
  ],

  'דבר:piel': [
    {
      he: 'אַתְּ מְדַבֶּרֶת עִבְרִית יָפֶה',
      plain: 'את מדברת עברית יפה',
      translit: 'at medaberet ivrit yafe',
      tr: 'Güzel İbranice konuşuyorsun.',
      form: 'present',
    },
    {
      he: 'דִּבַּרְתִּי אִתּוֹ אֶתְמוֹל',
      plain: 'דיברתי איתו אתמול',
      translit: 'dibarti ito etmol',
      tr: 'Dün onunla konuştum.',
      form: 'past',
      note: 'לְדַבֵּר עִם = "ile konuşmak". Edat fiile bağlıdır, ezberlenir.',
    },
  ],

  'רצה:paal': [
    {
      he: 'אֲנִי רוֹצֶה כּוֹס תֵּה, בְּבַקָּשָׁה',
      plain: 'אני רוצה כוס תה, בבקשה',
      translit: 'ani rotse kos te, bevakaşa',
      tr: 'Bir bardak çay istiyorum, lütfen.',
      form: 'present',
    },
    {
      he: 'מָה אַתָּה רוֹצֶה לֶאֱכוֹל',
      plain: 'מה אתה רוצה לאכול',
      translit: 'ma ata rotse leehol',
      tr: 'Ne yemek istiyorsun?',
      form: 'present',
      note: 'רוֹצֶה + mastar = "…mek istemek".',
    },
  ],

  'ראה:paal': [
    {
      he: 'רָאִיתִי אוֹתָךְ אֶתְמוֹל בַּשּׁוּק',
      plain: 'ראיתי אותך אתמול בשוק',
      translit: 'raiti otah etmol ba-şuk',
      tr: 'Dün seni çarşıda gördüm.',
      form: 'past',
      note: 'אוֹתָךְ = "seni" (kadına). Nesne zamirleri אֶת üzerine kurulur.',
    },
    {
      he: 'אַתָּה רוֹאֶה אֶת הַיָּם מִכָּאן',
      plain: 'אתה רואה את הים מכאן',
      translit: 'ata roe et ha-yam mikan',
      tr: 'Buradan denizi görüyorsun.',
      form: 'present',
    },
  ],

  'שמע:paal': [
    {
      he: 'אֲנִי לֹא שׁוֹמֵעַ אוֹתְךָ',
      plain: 'אני לא שומע אותך',
      translit: 'ani lo şomea otha',
      tr: 'Seni duymuyorum.',
      form: 'present',
      note: 'Olumsuzluk fiilden ÖNCE gelen לֹא ile kurulur.',
    },
    {
      he: 'שָׁמַעְתִּי שֶׁאַתָּה נוֹסֵעַ לְיִשְׂרָאֵל',
      plain: 'שמעתי שאתה נוסע לישראל',
      translit: 'şamati şe-ata nosea le-yisrael',
      tr: "İsrail'e gittiğini duydum.",
      form: 'past',
      note: 'שֶׁ־ = "ki/…diğini". Yan cümleyi bağlar, bitişik yazılır.',
    },
  ],

  'עשׂה:paal': [
    {
      he: 'מָה אַתָּה עוֹשֶׂה עַכְשָׁו',
      plain: 'מה אתה עושה עכשיו',
      translit: 'ma ata ose ahşav',
      tr: 'Şimdi ne yapıyorsun?',
      form: 'present',
    },
    {
      he: 'עָשִׂינוּ טָעוּת',
      plain: 'עשינו טעות',
      translit: 'asinu taut',
      tr: 'Bir hata yaptık.',
      form: 'past',
    },
  ],

  'קנה:paal': [
    {
      he: 'קָנִיתִי לֶחֶם וְחָלָב',
      plain: 'קניתי לחם וחלב',
      translit: 'kaniti leham ve-halav',
      tr: 'Ekmek ve süt aldım.',
      form: 'past',
      note: 'וְ־ = "ve", bitişik yazılır.',
    },
  ],

  'ישב:paal': [
    {
      he: 'הֵם יוֹשְׁבִים בְּבֵית קָפֶה',
      plain: 'הם יושבים בבית קפה',
      translit: 'hem yoşvim be-veyt kafe',
      tr: 'Bir kafede oturuyorlar.',
      form: 'present',
    },
    {
      he: 'שֵׁב בְּבַקָּשָׁה',
      plain: 'שב בבקשה',
      translit: 'şev bevakaşa',
      tr: 'Lütfen otur.',
      form: 'imperative',
    },
  ],

  'עבד:paal': [
    {
      he: 'אֲנִי עוֹבֵד בְּחֶבְרַת הַיי־טֶק',
      plain: 'אני עובד בחברת הייטק',
      translit: 'ani oved be-hevrat hay-tek',
      tr: 'Bir teknoloji şirketinde çalışıyorum.',
      form: 'present',
    },
    {
      he: 'עָבַדְתִּי כָּל הַלַּיְלָה',
      plain: 'עבדתי כל הלילה',
      translit: 'avadti kol ha-layla',
      tr: 'Bütün gece çalıştım.',
      form: 'past',
    },
  ],

  'גור:paal': [
    {
      he: 'אֲנִי גָּר בְּאִיסְטַנְבּוּל',
      plain: 'אני גר באיסטנבול',
      translit: 'ani gar be-istanbul',
      tr: "İstanbul'da oturuyorum.",
      form: 'present',
      note: 'ע״ו kökü: geçmiş 3. tekil eril ile şimdiki aynı yazılır — גָּר.',
    },
  ],

  'קום:paal': [
    {
      he: 'אֲנִי קָם בְּשֶׁבַע בַּבֹּקֶר',
      plain: 'אני קם בשבע בבוקר',
      translit: 'ani kam be-şeva ba-boker',
      tr: 'Sabah yedide kalkıyorum.',
      form: 'present',
    },
  ],

  'בקש:piel': [
    {
      he: 'בִּקַּשְׁתִּי מִמֶּנּוּ עֶזְרָה',
      plain: 'ביקשתי ממנו עזרה',
      translit: 'bikaşti mimenu ezra',
      tr: 'Ondan yardım istedim.',
      form: 'past',
      note: 'לְבַקֵּשׁ מִ־ = "…den istemek". Edat מִן, zamirle kaynaşır.',
    },
  ],

  'קבל:piel': [
    {
      he: 'קִבַּלְתִּי אֶת הַהוֹדָעָה שֶׁלְּךָ',
      plain: 'קיבלתי את ההודעה שלך',
      translit: 'kibalti et ha-hodaa şelha',
      tr: 'Mesajını aldım.',
      form: 'past',
    },
  ],

  'חכה:piel': [
    {
      he: 'אֲנִי מְחַכֶּה לָךְ בַּתַּחֲנָה',
      plain: 'אני מחכה לך בתחנה',
      translit: 'ani mehake lah ba-tahana',
      tr: 'Durakta seni bekliyorum.',
      form: 'present',
      note: 'לְחַכּוֹת לְ־ = "-i beklemek". Türkçede -i, İbranicede לְ־ ister.',
    },
  ],

  'נכר:hifil': [
    {
      he: 'נָעִים לְהַכִּיר אוֹתְךָ',
      plain: 'נעים להכיר אותך',
      translit: 'naim lehakir otha',
      tr: 'Seninle tanışmak güzel.',
      form: 'infinitive',
      note: 'Tanışma kalıbının tam hâli; kısaca נָעִים מְאֹד da denir.',
    },
  ],

  'בין:hifil': [
    {
      he: 'לֹא הֵבַנְתִּי, אֶפְשָׁר עוֹד פַּעַם',
      plain: 'לא הבנתי, אפשר עוד פעם',
      translit: 'lo hevanti, efşar od paam',
      tr: 'Anlamadım, bir daha mümkün mü?',
      form: 'past',
      note: 'Derste en çok işe yarayan cümle.',
    },
  ],

  'חלט:hifil': [
    {
      he: 'הֶחְלַטְנוּ לִנְסֹעַ לְתֵל אָבִיב',
      plain: 'החלטנו לנסוע לתל אביב',
      translit: 'hehlatnu linsoa le-tel aviv',
      tr: "Tel Aviv'e gitmeye karar verdik.",
      form: 'past',
      note: 'לְהַחְלִיט + mastar = "…meye karar vermek".',
    },
  ],

  'לבש:hitpael': [
    {
      he: 'הִיא מִתְלַבֶּשֶׁת מַהֵר',
      plain: 'היא מתלבשת מהר',
      translit: 'hi mitlabeşet maher',
      tr: 'Hızlı giyiniyor.',
      form: 'present',
      note: 'Hitpa’el dönüşlüdür: לוֹבֵשׁ "giyer", מִתְלַבֵּשׁ "giyinir".',
    },
  ],

  'כנס:nifal': [
    {
      he: 'נִכְנַסְנוּ לַחֲנוּת',
      plain: 'נכנסנו לחנות',
      translit: 'nihnasnu la-hanut',
      tr: 'Dükkâna girdik.',
      form: 'past',
      note: 'לְהִכָּנֵס לְ־ = "-e girmek".',
    },
  ],

  'שׂחק:piel': [
    {
      he: 'הַיְלָדִים מְשַׂחֲקִים בַּגִּנָּה',
      plain: 'הילדים משחקים בגינה',
      translit: 'ha-yeladim mesahakim ba-gina',
      tr: 'Çocuklar bahçede oynuyor.',
      form: 'present',
    },
  ],

  'צפה:piel': [
    {
      he: 'צָפִינוּ בְּסֶרֶט אֶמֶשׁ',
      plain: 'צפינו בסרט אמש',
      translit: 'tsafinu be-seret emeş',
      tr: 'Dün gece bir film izledik.',
      form: 'past',
      note: 'לִצְפּוֹת בְּ־ = "-i izlemek". Edat בְּ, לְ değil.',
    },
  ],

  'שלם:piel': [
    {
      he: 'שִׁלַּמְתִּי בְּכַרְטִיס אַשְׁרַאי',
      plain: 'שילמתי בכרטיס אשראי',
      translit: 'şilamti be-kartis aşray',
      tr: 'Kredi kartıyla ödedim.',
      form: 'past',
    },
  ],

  'עבר:paal': [
    {
      he: 'עָבַרְנוּ לְדִירָה חֲדָשָׁה',
      plain: 'עברנו לדירה חדשה',
      translit: 'avarnu le-dira hadaşa',
      tr: 'Yeni bir daireye taşındık.',
      form: 'past',
      note: 'לַעֲבוֹר hem "geçmek" hem "taşınmak" demektir.',
    },
  ],

  'שאר:nifal': [
    {
      he: 'נִשְׁאַרְתִּי בַּבַּיִת כָּל הַיּוֹם',
      plain: 'נשארתי בבית כל היום',
      translit: 'nişarti ba-bayit kol hayom',
      tr: 'Bütün gün evde kaldım.',
      form: 'past',
    },
  ],

  'סבר:hifil': [
    {
      he: 'הַמּוֹרָה הִסְבִּירָה אֶת הַכְּלָל',
      plain: 'המורה הסבירה את הכלל',
      translit: 'ha-mora hisbira et ha-klal',
      tr: 'Öğretmen kuralı açıkladı.',
      form: 'past',
    },
  ],

  'נגע:hifil': [
    {
      he: 'הָרַכֶּבֶת מַגִּיעָה בְּעוֹד עֶשֶׂר דַּקּוֹת',
      plain: 'הרכבת מגיעה בעוד עשר דקות',
      translit: 'ha-rakevet magia be-od eser dakot',
      tr: 'Tren on dakika sonra geliyor.',
      form: 'present',
    },
  ],

  'זמן:hifil': [
    {
      he: 'הִזְמַנְתִּי שֻׁלְחָן לִשְׁנַיִם',
      plain: 'הזמנתי שולחן לשניים',
      translit: 'hizmanti şulhan li-şnayim',
      tr: 'İki kişilik masa ayırttım.',
      form: 'past',
      note: 'לְהַזְמִין hem "davet etmek" hem "sipariş/rezervasyon yapmak".',
    },
  ],

  'שמש:hitpael': [
    {
      he: 'אֲנִי מִשְׁתַּמֵּשׁ בָּאַפְלִיקַצְיָה כָּל יוֹם',
      plain: 'אני משתמש באפליקציה כל יום',
      translit: 'ani miştameş ba-aplikatsya kol yom',
      tr: 'Uygulamayı her gün kullanıyorum.',
      form: 'present',
      note: 'לְהִשְׁתַּמֵּשׁ בְּ־ = "-i kullanmak". Metatez: הִתְשַׁמֵּשׁ değil.',
    },
  ],

  'חתן:hitpael': [
    {
      he: 'הֵם הִתְחַתְּנוּ בַּקַּיִץ',
      plain: 'הם התחתנו בקיץ',
      translit: 'hem hithatnu ba-kayits',
      tr: 'Yazın evlendiler.',
      form: 'past',
    },
  ],

  'סדר:hitpael': [
    {
      he: 'הַכֹּל יִסְתַּדֵּר',
      plain: 'הכול יסתדר',
      translit: 'hakol yistader',
      tr: 'Her şey yoluna girecek.',
      form: 'future',
      note: 'Günlük dilde en sık duyulan teselli cümlesi.',
    },
  ],

  'פתח:paal': [
    {
      he: 'הַחֲנוּת פּוֹתַחַת בְּתֵשַׁע',
      plain: 'החנות פותחת בתשע',
      translit: 'ha-hanut potahat be-teşa',
      tr: 'Dükkân dokuzda açılıyor.',
      form: 'present',
      note: 'ל״גרונית: dişil tekilde iki patah — פּוֹתַחַת.',
    },
  ],

  'סגר:paal': [
    {
      he: 'סְגֹר אֶת הַדֶּלֶת בְּבַקָּשָׁה',
      plain: 'סגור את הדלת בבקשה',
      translit: 'sgor et ha-delet bevakaşa',
      tr: 'Lütfen kapıyı kapat.',
      form: 'imperative',
    },
  ],

  'זכר:paal': [
    {
      he: 'אֲנִי לֹא זוֹכֵר אֶת הַשֵּׁם שֶׁלּוֹ',
      plain: 'אני לא זוכר את השם שלו',
      translit: 'ani lo zoher et ha-şem şelo',
      tr: 'Onun adını hatırlamıyorum.',
      form: 'present',
    },
  ],

  'שכח:paal': [
    {
      he: 'שָׁכַחְתִּי אֶת הַמַּפְתֵּחַ בַּבַּיִת',
      plain: 'שכחתי את המפתח בבית',
      translit: 'şahahti et ha-mafteah ba-bayit',
      tr: 'Anahtarı evde unuttum.',
      form: 'past',
    },
  ],

  'אהב:paal': [
    {
      he: 'אֲנִי אוֹהֵב אֶת הָעִיר הַזֹּאת',
      plain: 'אני אוהב את העיר הזאת',
      translit: 'ani ohev et ha-ir hazot',
      tr: 'Bu şehri seviyorum.',
      form: 'present',
      note: 'הַזֹּאת = "bu" (dişil). Sıfat gibi isimden SONRA gelir.',
    },
  ],

  'שאל:paal': [
    {
      he: 'אֶפְשָׁר לִשְׁאֹל שְׁאֵלָה',
      plain: 'אפשר לשאול שאלה',
      translit: 'efşar lişol şeela',
      tr: 'Bir soru sorabilir miyim?',
      form: 'infinitive',
      note: 'אֶפְשָׁר + mastar = "…mek mümkün mü / olur mu".',
    },
  ],

  'מצא:paal': [
    {
      he: 'לֹא מָצָאתִי אֶת הַטֵּלֵפוֹן שֶׁלִּי',
      plain: 'לא מצאתי את הטלפון שלי',
      translit: 'lo matsati et ha-telefon şeli',
      tr: 'Telefonumu bulamadım.',
      form: 'past',
    },
  ],

  'קרא:paal': [
    {
      he: 'אֲנִי קוֹרֵא עִתּוֹן כָּל בֹּקֶר',
      plain: 'אני קורא עיתון כל בוקר',
      translit: 'ani kore iton kol boker',
      tr: 'Her sabah gazete okuyorum.',
      form: 'present',
      note: 'לִקְרֹא hem "okumak" hem "seslenmek/çağırmak".',
    },
  ],
};

/** Bu fiil için elle yazılmış cümle var mı? */
export function writtenFor(verbId: string): WrittenSentence[] {
  return WRITTEN_SENTENCES[verbId] ?? [];
}

/** Elle yazılmış cümlesi olan fiil sayısı — ana sayfadaki sayaç. */
export const WRITTEN_VERB_COUNT = Object.values(WRITTEN_SENTENCES).filter(
  (v) => v.length > 0,
).length;

export const WRITTEN_SENTENCE_COUNT = Object.values(WRITTEN_SENTENCES).reduce(
  (n, v) => n + v.length,
  0,
);
