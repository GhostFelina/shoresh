/**
 * Kalıplar — İbranicede olduğu gibi ezberlenen hazır ifadeler.
 *
 * NEDEN AYRI BİR KATMAN: Bunlar kelime değil, PARÇA. "מַה נִּשְׁמָע" kelime
 * kelime "ne duyuluyor" demektir ama anlamı "naber"dir. Çekim motorundan
 * geçmezler, sözlükten de çıkarılamazlar — olduğu gibi öğrenilirler.
 *
 * Her kalıpta `literal` alanı var: birebir çeviri. Yeni başlayan
 * "neden böyle diyorlar" sorusunun cevabını görmeden kalıbı ezberlerse
 * benzer bir kalıpla karıştırır. Birebir çeviri o karışıklığı kesiyor.
 */
import type { CEFR } from '@/types/hebrew';
import { PHRASES_EXTRA } from './phrases-extra';

export type PhraseTopic =
  | 'selamlaşma'
  | 'nezaket'
  | 'tanışma'
  | 'soru'
  | 'zaman'
  | 'yer'
  | 'alışveriş'
  | 'yemek'
  | 'duygu'
  | 'günlük'
  | 'kutlama'
  | 'sınıf'
  | 'yapı';

export interface Phrase {
  id: string;
  /** Harekeli yazım. */
  he: string;
  /** Harekesiz — seslendirmeye bu gider. */
  plain: string;
  translit: string;
  tr: string;
  /** Birebir çeviri — kalıbın nereden geldiğini gösterir. */
  literal?: string;
  topic: PhraseTopic;
  cefr: CEFR;
  /** Kullanım notu: kime, ne zaman söylenir. */
  note?: string;
}

const PHRASES_BASE: Phrase[] = [
  /* --- Selamlaşma --- */
  { id: 'shalom', he: 'שָׁלוֹם', plain: 'שלום', translit: 'şalom', tr: 'merhaba; hoşça kal', literal: 'barış', topic: 'selamlaşma', cefr: 'A1', note: 'Hem karşılaşınca hem ayrılırken kullanılır.' },
  { id: 'boker-tov', he: 'בֹּקֶר טוֹב', plain: 'בוקר טוב', translit: 'boker tov', tr: 'günaydın', literal: 'sabah iyi', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'boker-or', he: 'בֹּקֶר אוֹר', plain: 'בוקר אור', translit: 'boker or', tr: 'günaydın (karşılık)', literal: 'sabah ışık', topic: 'selamlaşma', cefr: 'A1', note: '"Boker tov" diyene verilen klasik karşılık.' },
  { id: 'erev-tov', he: 'עֶרֶב טוֹב', plain: 'ערב טוב', translit: 'erev tov', tr: 'iyi akşamlar', literal: 'akşam iyi', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'layla-tov', he: 'לַיְלָה טוֹב', plain: 'לילה טוב', translit: 'layla tov', tr: 'iyi geceler', literal: 'gece iyi', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'ma-nishma', he: 'מַה נִּשְׁמָע', plain: 'מה נשמע', translit: 'ma nişma', tr: 'naber? nasıl gidiyor?', literal: 'ne duyuluyor', topic: 'selamlaşma', cefr: 'A1', note: 'Günlük konuşmanın en sık sorusu.' },
  { id: 'ma-shlomcha', he: 'מַה שְׁלוֹמְךָ', plain: 'מה שלומך', translit: 'ma şlomha', tr: 'nasılsın? (erkeğe)', literal: 'barışın ne', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'ma-shlomech', he: 'מַה שְׁלוֹמֵךְ', plain: 'מה שלומך', translit: 'ma şlomeh', tr: 'nasılsın? (kadına)', literal: 'barışın ne', topic: 'selamlaşma', cefr: 'A1', note: 'Yazılışı erkek hâliyle aynı, okunuşu farklı.' },
  { id: 'hakol-beseder', he: 'הַכֹּל בְּסֵדֶר', plain: 'הכול בסדר', translit: 'hakol beseder', tr: 'her şey yolunda', literal: 'her şey düzende', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'lehitraot', he: 'לְהִתְרָאוֹת', plain: 'להתראות', translit: 'lehitraot', tr: 'görüşürüz', literal: 'görüşmeye', topic: 'selamlaşma', cefr: 'A1' },
  { id: 'bye', he: 'בַּיי', plain: 'ביי', translit: 'bay', tr: 'hoşça kal', topic: 'selamlaşma', cefr: 'A1', note: 'İngilizceden geçti, çok yaygın.' },
  { id: 'titraeh', he: 'נִתְרָאֶה', plain: 'נתראה', translit: 'nitrae', tr: 'görüşeceğiz', literal: 'göreceğiz birbirimizi', topic: 'selamlaşma', cefr: 'A2' },

  /* --- Nezaket --- */
  { id: 'toda', he: 'תּוֹדָה', plain: 'תודה', translit: 'toda', tr: 'teşekkürler', topic: 'nezaket', cefr: 'A1' },
  { id: 'toda-raba', he: 'תּוֹדָה רַבָּה', plain: 'תודה רבה', translit: 'toda raba', tr: 'çok teşekkürler', literal: 'teşekkür çok', topic: 'nezaket', cefr: 'A1' },
  { id: 'bevakasha', he: 'בְּבַקָּשָׁה', plain: 'בבקשה', translit: 'bevakaşa', tr: 'lütfen; buyur; rica ederim', literal: 'istekle', topic: 'nezaket', cefr: 'A1', note: 'Üç ayrı işi birden görür: rica, ikram ve teşekküre karşılık.' },
  { id: 'slicha', he: 'סְלִיחָה', plain: 'סליחה', translit: 'sliha', tr: 'affedersiniz; pardon', literal: 'af', topic: 'nezaket', cefr: 'A1' },
  { id: 'ani-mitstaer', he: 'אֲנִי מִצְטַעֵר', plain: 'אני מצטער', translit: 'ani mitstaer', tr: 'üzgünüm (erkek)', topic: 'nezaket', cefr: 'A2' },
  { id: 'ani-mitstaeret', he: 'אֲנִי מִצְטַעֶרֶת', plain: 'אני מצטערת', translit: 'ani mitstaeret', tr: 'üzgünüm (kadın)', topic: 'nezaket', cefr: 'A2' },
  { id: 'ein-baaya', he: 'אֵין בְּעָיָה', plain: 'אין בעיה', translit: 'eyn baaya', tr: 'sorun değil', literal: 'yok sorun', topic: 'nezaket', cefr: 'A1' },
  { id: 'al-lo-davar', he: 'עַל לֹא דָּבָר', plain: 'על לא דבר', translit: 'al lo davar', tr: 'bir şey değil', literal: 'hiçbir şey üzerine', topic: 'nezaket', cefr: 'A2' },
  { id: 'beteavon', he: 'בְּתֵאָבוֹן', plain: 'בתיאבון', translit: 'beteavon', tr: 'afiyet olsun', literal: 'iştahla', topic: 'nezaket', cefr: 'A1' },
  { id: 'labriut', he: 'לַבְּרִיאוּת', plain: 'לבריאות', translit: 'labriut', tr: 'çok yaşa', literal: 'sağlığa', topic: 'nezaket', cefr: 'A2' },

  /* --- Tanışma --- */
  { id: 'naim-meod', he: 'נָעִים מְאֹד', plain: 'נעים מאוד', translit: 'naim meod', tr: 'memnun oldum', literal: 'çok hoş', topic: 'tanışma', cefr: 'A1' },
  { id: 'eich-korim-lecha', he: 'אֵיךְ קוֹרְאִים לְךָ', plain: 'איך קוראים לך', translit: 'eyh korim leha', tr: 'adın ne? (erkeğe)', literal: 'sana nasıl sesleniyorlar', topic: 'tanışma', cefr: 'A1' },
  { id: 'shmi', he: 'שְׁמִי', plain: 'שמי', translit: 'şmi', tr: 'benim adım', literal: 'adım', topic: 'tanışma', cefr: 'A1' },
  { id: 'meayin-ata', he: 'מֵאַיִן אַתָּה', plain: 'מאין אתה', translit: 'meayin ata', tr: 'nerelisin? (erkeğe)', literal: 'nereden sen', topic: 'tanışma', cefr: 'A1' },
  { id: 'ani-mituria', he: 'אֲנִי מִטּוּרְקִיָּה', plain: 'אני מטורקיה', translit: 'ani mituRkiya', tr: 'Türkiyeliyim', literal: 'ben Türkiye’den', topic: 'tanışma', cefr: 'A1' },
  { id: 'ben-kama-ata', he: 'בֶּן כַּמָּה אַתָּה', plain: 'בן כמה אתה', translit: 'ben kama ata', tr: 'kaç yaşındasın? (erkeğe)', literal: 'kaçın oğlu sen', topic: 'tanışma', cefr: 'A2' },
  { id: 'ani-lo-mevin', he: 'אֲנִי לֹא מֵבִין', plain: 'אני לא מבין', translit: 'ani lo mevin', tr: 'anlamıyorum (erkek)', topic: 'tanışma', cefr: 'A1' },
  { id: 'ani-lo-mevina', he: 'אֲנִי לֹא מְבִינָה', plain: 'אני לא מבינה', translit: 'ani lo mevina', tr: 'anlamıyorum (kadın)', topic: 'tanışma', cefr: 'A1' },
  { id: 'at-medaberet-anglit', he: 'אַתְּ מְדַבֶּרֶת אַנְגְּלִית', plain: 'את מדברת אנגלית', translit: 'at medaberet anglit', tr: 'İngilizce konuşuyor musun? (kadına)', topic: 'tanışma', cefr: 'A1' },

  /* --- Soru --- */
  { id: 'ma', he: 'מָה', plain: 'מה', translit: 'ma', tr: 'ne', topic: 'soru', cefr: 'A1' },
  { id: 'mi', he: 'מִי', plain: 'מי', translit: 'mi', tr: 'kim', topic: 'soru', cefr: 'A1' },
  { id: 'eifo', he: 'אֵיפֹה', plain: 'איפה', translit: 'eyfo', tr: 'nerede', topic: 'soru', cefr: 'A1' },
  { id: 'matay', he: 'מָתַי', plain: 'מתי', translit: 'matay', tr: 'ne zaman', topic: 'soru', cefr: 'A1' },
  { id: 'lama', he: 'לָמָּה', plain: 'למה', translit: 'lama', tr: 'neden', topic: 'soru', cefr: 'A1' },
  { id: 'eich', he: 'אֵיךְ', plain: 'איך', translit: 'eyh', tr: 'nasıl', topic: 'soru', cefr: 'A1' },
  { id: 'kama', he: 'כַּמָּה', plain: 'כמה', translit: 'kama', tr: 'kaç; ne kadar', topic: 'soru', cefr: 'A1' },
  { id: 'eize', he: 'אֵיזֶה', plain: 'איזה', translit: 'eyze', tr: 'hangi', topic: 'soru', cefr: 'A1' },
  { id: 'kama-ze-ole', he: 'כַּמָּה זֶה עוֹלֶה', plain: 'כמה זה עולה', translit: 'kama ze ole', tr: 'bu kaç para?', literal: 'ne kadar bu çıkıyor', topic: 'alışveriş', cefr: 'A1' },
  { id: 'ma-zot-omeret', he: 'מַה זֹּאת אוֹמֶרֶת', plain: 'מה זאת אומרת', translit: 'ma zot omeret', tr: 'ne demek? yani?', literal: 'bu ne diyor', topic: 'soru', cefr: 'A2' },
  { id: 'ma-hashaa', he: 'מַה הַשָּׁעָה', plain: 'מה השעה', translit: 'ma haşaa', tr: 'saat kaç?', literal: 'ne saat', topic: 'zaman', cefr: 'A1' },

  /* --- Zaman --- */
  { id: 'hayom', he: 'הַיּוֹם', plain: 'היום', translit: 'hayom', tr: 'bugün', literal: 'gün', topic: 'zaman', cefr: 'A1' },
  { id: 'machar', he: 'מָחָר', plain: 'מחר', translit: 'mahar', tr: 'yarın', topic: 'zaman', cefr: 'A1' },
  { id: 'etmol', he: 'אֶתְמוֹל', plain: 'אתמול', translit: 'etmol', tr: 'dün', topic: 'zaman', cefr: 'A1' },
  { id: 'achshav', he: 'עַכְשָׁו', plain: 'עכשיו', translit: 'ahşav', tr: 'şimdi', topic: 'zaman', cefr: 'A1' },
  { id: 'tamid', he: 'תָּמִיד', plain: 'תמיד', translit: 'tamid', tr: 'her zaman', topic: 'zaman', cefr: 'A1' },
  { id: 'peamim', he: 'לִפְעָמִים', plain: 'לפעמים', translit: 'lifamim', tr: 'bazen', topic: 'zaman', cefr: 'A1' },
  { id: 'af-paam', he: 'אַף פַּעַם', plain: 'אף פעם', translit: 'af paam', tr: 'asla; hiçbir zaman', literal: 'hiçbir kez', topic: 'zaman', cefr: 'A2' },
  { id: 'od-meat', he: 'עוֹד מְעַט', plain: 'עוד מעט', translit: 'od meat', tr: 'birazdan', literal: 'daha az', topic: 'zaman', cefr: 'A2' },
  { id: 'kvar', he: 'כְּבָר', plain: 'כבר', translit: 'kvar', tr: 'çoktan; artık', topic: 'zaman', cefr: 'A2' },
  { id: 'adayin', he: 'עֲדַיִן', plain: 'עדיין', translit: 'adayin', tr: 'hâlâ; henüz', topic: 'zaman', cefr: 'A2' },
  { id: 'shavua-tov', he: 'שָׁבוּעַ טוֹב', plain: 'שבוע טוב', translit: 'şavua tov', tr: 'iyi haftalar', literal: 'hafta iyi', topic: 'kutlama', cefr: 'A1', note: 'Cumartesi akşamı, şabat bitince söylenir.' },
  { id: 'shabbat-shalom', he: 'שַׁבָּת שָׁלוֹם', plain: 'שבת שלום', translit: 'şabat şalom', tr: 'iyi şabatlar', literal: 'şabat barış', topic: 'kutlama', cefr: 'A1', note: 'Cuma günü ve şabat boyunca.' },

  /* --- Yer --- */
  { id: 'po', he: 'פֹּה', plain: 'פה', translit: 'po', tr: 'burada', topic: 'yer', cefr: 'A1' },
  { id: 'sham', he: 'שָׁם', plain: 'שם', translit: 'şam', tr: 'orada', topic: 'yer', cefr: 'A1' },
  { id: 'eifo-hasherutim', he: 'אֵיפֹה הַשֵּׁרוּתִים', plain: 'איפה השירותים', translit: 'eyfo haşerutim', tr: 'tuvalet nerede?', topic: 'yer', cefr: 'A1' },
  { id: 'yamina', he: 'יָמִינָה', plain: 'ימינה', translit: 'yamina', tr: 'sağa', topic: 'yer', cefr: 'A2' },
  { id: 'smola', he: 'שְׂמֹאלָה', plain: 'שמאלה', translit: 'smola', tr: 'sola', topic: 'yer', cefr: 'A2' },
  { id: 'yashar', he: 'יָשָׁר', plain: 'ישר', translit: 'yaşar', tr: 'düz; dosdoğru', topic: 'yer', cefr: 'A2' },
  { id: 'karov', he: 'קָרוֹב', plain: 'קרוב', translit: 'karov', tr: 'yakın', topic: 'yer', cefr: 'A1' },
  { id: 'rachok', he: 'רָחוֹק', plain: 'רחוק', translit: 'rahok', tr: 'uzak', topic: 'yer', cefr: 'A1' },

  /* --- Alışveriş --- */
  { id: 'ani-rotse-et-ze', he: 'אֲנִי רוֹצֶה אֶת זֶה', plain: 'אני רוצה את זה', translit: 'ani rotse et ze', tr: 'bunu istiyorum (erkek)', topic: 'alışveriş', cefr: 'A1', note: 'אֶת belirli nesneyi işaretler; Türkçede karşılığı yoktur.' },
  { id: 'yesh-lachem', he: 'יֵשׁ לָכֶם', plain: 'יש לכם', translit: 'yeş lahem', tr: 'sizde var mı?', literal: 'var size', topic: 'alışveriş', cefr: 'A2' },
  { id: 'yakar-midai', he: 'יָקָר מִדַּי', plain: 'יקר מדי', translit: 'yakar miday', tr: 'çok pahalı', literal: 'pahalı fazlasıyla', topic: 'alışveriş', cefr: 'A2' },
  { id: 'zol', he: 'זוֹל', plain: 'זול', translit: 'zol', tr: 'ucuz', topic: 'alışveriş', cefr: 'A1' },
  { id: 'hanacha', he: 'הֲנָחָה', plain: 'הנחה', translit: 'hanaha', tr: 'indirim', topic: 'alışveriş', cefr: 'A2' },
  { id: 'cheshbon', he: 'חֶשְׁבּוֹן', plain: 'חשבון', translit: 'heşbon', tr: 'hesap', topic: 'alışveriş', cefr: 'A2' },

  /* --- Yemek --- */
  { id: 'mayim', he: 'מַיִם', plain: 'מים', translit: 'mayim', tr: 'su', topic: 'yemek', cefr: 'A1', note: 'İbranicede "su" hep çoğuldur; tekili yoktur.' },
  { id: 'lechem', he: 'לֶחֶם', plain: 'לחם', translit: 'leham', tr: 'ekmek', topic: 'yemek', cefr: 'A1' },
  { id: 'kafe', he: 'קָפֶה', plain: 'קפה', translit: 'kafe', tr: 'kahve', topic: 'yemek', cefr: 'A1' },
  { id: 'te', he: 'תֵּה', plain: 'תה', translit: 'te', tr: 'çay', topic: 'yemek', cefr: 'A1' },
  { id: 'ani-raev', he: 'אֲנִי רָעֵב', plain: 'אני רעב', translit: 'ani raev', tr: 'açım (erkek)', topic: 'yemek', cefr: 'A1' },
  { id: 'ani-tsameh', he: 'אֲנִי צָמֵא', plain: 'אני צמא', translit: 'ani tsame', tr: 'susadım (erkek)', topic: 'yemek', cefr: 'A1' },
  { id: 'taim', he: 'טָעִים', plain: 'טעים', translit: 'taim', tr: 'lezzetli', topic: 'yemek', cefr: 'A1' },
  { id: 'hashbon-bevakasha', he: 'חֶשְׁבּוֹן בְּבַקָּשָׁה', plain: 'חשבון בבקשה', translit: 'heşbon bevakaşa', tr: 'hesap lütfen', topic: 'yemek', cefr: 'A1' },

  /* --- Duygu --- */
  { id: 'ani-oheiv', he: 'אֲנִי אוֹהֵב', plain: 'אני אוהב', translit: 'ani ohev', tr: 'seviyorum (erkek)', topic: 'duygu', cefr: 'A1' },
  { id: 'ani-oheveet', he: 'אֲנִי אוֹהֶבֶת', plain: 'אני אוהבת', translit: 'ani ohevet', tr: 'seviyorum (kadın)', topic: 'duygu', cefr: 'A1' },
  { id: 'kef', he: 'כֵּיף', plain: 'כיף', translit: 'keyf', tr: 'keyif; eğlence', topic: 'duygu', cefr: 'A1', note: 'Arapçadan geçti; Türkçedeki "keyif" ile aynı kök.' },
  { id: 'ein-li-koach', he: 'אֵין לִי כֹּחַ', plain: 'אין לי כוח', translit: 'eyn li koah', tr: 'hiç enerjim yok; canım istemiyor', literal: 'yok bana güç', topic: 'duygu', cefr: 'A2' },
  { id: 'chaval', he: 'חֲבָל', plain: 'חבל', translit: 'haval', tr: 'yazık', topic: 'duygu', cefr: 'A2' },
  { id: 'meanyen', he: 'מְעַנְיֵן', plain: 'מעניין', translit: 'meanyen', tr: 'ilginç', topic: 'duygu', cefr: 'A2' },
  { id: 'mesamem', he: 'מְשַׁעֲמֵם', plain: 'משעמם', translit: 'meşaamem', tr: 'sıkıcı', topic: 'duygu', cefr: 'A2' },
  { id: 'nifla', he: 'נִפְלָא', plain: 'נפלא', translit: 'nifla', tr: 'harika', topic: 'duygu', cefr: 'A2' },

  /* --- Günlük --- */
  { id: 'yalla', he: 'יַאללָה', plain: 'יאללה', translit: 'yalla', tr: 'hadi', topic: 'günlük', cefr: 'A1', note: 'Arapçadan; İsrail sokak dilinin en sık kelimesi.' },
  { id: 'sababa', he: 'סַבַּבָּה', plain: 'סבבה', translit: 'sababa', tr: 'tamam; süper', topic: 'günlük', cefr: 'A2', note: 'Argo, arkadaşlar arası.' },
  { id: 'beseder', he: 'בְּסֵדֶר', plain: 'בסדר', translit: 'beseder', tr: 'tamam; peki', literal: 'düzende', topic: 'günlük', cefr: 'A1' },
  { id: 'nachon', he: 'נָכוֹן', plain: 'נכון', translit: 'nahon', tr: 'doğru', topic: 'günlük', cefr: 'A1' },
  { id: 'lo-nachon', he: 'לֹא נָכוֹן', plain: 'לא נכון', translit: 'lo nahon', tr: 'yanlış', topic: 'günlük', cefr: 'A1' },
  { id: 'ken', he: 'כֵּן', plain: 'כן', translit: 'ken', tr: 'evet', topic: 'günlük', cefr: 'A1' },
  { id: 'lo', he: 'לֹא', plain: 'לא', translit: 'lo', tr: 'hayır; değil', topic: 'günlük', cefr: 'A1' },
  { id: 'ulay', he: 'אוּלַי', plain: 'אולי', translit: 'ulay', tr: 'belki', topic: 'günlük', cefr: 'A1' },
  { id: 'betach', he: 'בֶּטַח', plain: 'בטח', translit: 'betah', tr: 'tabii ki', topic: 'günlük', cefr: 'A2' },
  { id: 'rega', he: 'רֶגַע', plain: 'רגע', translit: 'rega', tr: 'bir saniye', literal: 'an', topic: 'günlük', cefr: 'A1' },
  { id: 'davka', he: 'דַּוְקָא', plain: 'דווקא', translit: 'davka', tr: 'ille de; tam tersine', topic: 'günlük', cefr: 'B1', note: 'Türkçeye tek kelimeyle çevrilemez; bağlama göre "bilhassa" ya da "aksine".' },
  { id: 'stam', he: 'סְתָם', plain: 'סתם', translit: 'stam', tr: 'öylesine; şaka', topic: 'günlük', cefr: 'B1' },
  { id: 'kacha-kacha', he: 'כָּכָה כָּכָה', plain: 'ככה ככה', translit: 'kaha kaha', tr: 'şöyle böyle', topic: 'günlük', cefr: 'A2' },
  { id: 'bekitsur', he: 'בְּקִצּוּר', plain: 'בקיצור', translit: 'bekitsur', tr: 'kısacası', literal: 'kısaltmayla', topic: 'günlük', cefr: 'B1' },
  { id: 'bediyuk', he: 'בְּדִיּוּק', plain: 'בדיוק', translit: 'bediyuk', tr: 'tam olarak; aynen', topic: 'günlük', cefr: 'A2' },

  /* --- Kutlama --- */
  { id: 'mazal-tov', he: 'מַזָּל טוֹב', plain: 'מזל טוב', translit: 'mazal tov', tr: 'tebrikler', literal: 'talih iyi', topic: 'kutlama', cefr: 'A1' },
  { id: 'behatslacha', he: 'בְּהַצְלָחָה', plain: 'בהצלחה', translit: 'behatslaha', tr: 'başarılar; bol şans', literal: 'başarıyla', topic: 'kutlama', cefr: 'A1' },
  { id: 'chag-sameach', he: 'חַג שָׂמֵחַ', plain: 'חג שמח', translit: 'hag sameah', tr: 'bayramın kutlu olsun', literal: 'bayram neşeli', topic: 'kutlama', cefr: 'A1' },
  { id: 'yom-huledet', he: 'יוֹם הֻלֶּדֶת שָׂמֵחַ', plain: 'יום הולדת שמח', translit: 'yom huledet sameah', tr: 'doğum günün kutlu olsun', literal: 'doğum günü neşeli', topic: 'kutlama', cefr: 'A2' },
  { id: 'kol-hakavod', he: 'כָּל הַכָּבוֹד', plain: 'כל הכבוד', translit: 'kol hakavod', tr: 'aferin; helal olsun', literal: 'bütün saygı', topic: 'kutlama', cefr: 'A1' },

  /* --- Sınıf / öğrenme --- */
  { id: 'lo-hevanti', he: 'לֹא הֵבַנְתִּי', plain: 'לא הבנתי', translit: 'lo hevanti', tr: 'anlamadım', topic: 'sınıf', cefr: 'A1' },
  { id: 'od-paam', he: 'עוֹד פַּעַם', plain: 'עוד פעם', translit: 'od paam', tr: 'bir daha', literal: 'daha kez', topic: 'sınıf', cefr: 'A1' },
  { id: 'leat-bevakasha', he: 'לְאַט בְּבַקָּשָׁה', plain: 'לאט בבקשה', translit: 'leat bevakaşa', tr: 'yavaş lütfen', topic: 'sınıf', cefr: 'A1' },
  { id: 'eich-omrim', he: 'אֵיךְ אוֹמְרִים', plain: 'איך אומרים', translit: 'eyh omrim', tr: 'nasıl denir?', literal: 'nasıl diyorlar', topic: 'sınıf', cefr: 'A1' },
  { id: 'ma-zeh', he: 'מַה זֶּה', plain: 'מה זה', translit: 'ma ze', tr: 'bu ne?', topic: 'sınıf', cefr: 'A1' },
  { id: 'ani-lomed-ivrit', he: 'אֲנִי לוֹמֵד עִבְרִית', plain: 'אני לומד עברית', translit: 'ani lomed ivrit', tr: 'İbranice öğreniyorum (erkek)', topic: 'sınıf', cefr: 'A1' },
  { id: 'ani-lomedet-ivrit', he: 'אֲנִי לוֹמֶדֶת עִבְרִית', plain: 'אני לומדת עברית', translit: 'ani lomedet ivrit', tr: 'İbranice öğreniyorum (kadın)', topic: 'sınıf', cefr: 'A1' },
  { id: 'tuchal-lachzor', he: 'תּוּכַל לַחְזֹר', plain: 'תוכל לחזור', translit: 'tuhal lahzor', tr: 'tekrar edebilir misin? (erkeğe)', topic: 'sınıf', cefr: 'A2' },

  /* --- Fiil kalıpları ---
     Bunlar kelime değil YAPI: içine istediğin fiili koyarsın ve cümle
     kurulur. Bir öğrencinin konuşmaya geçişini en çok hızlandıran şey
     bu kalıpları otomatikleştirmektir — 20 kalıp, yüzlerce cümle. */
  { id: 'yesh-li', he: 'יֵשׁ לִי', plain: 'יש לי', translit: 'yeş li', tr: 'bende var; …m var', literal: 'var bana', topic: 'yapı', cefr: 'A1', note: 'İbranicede "sahip olmak" fiili YOKTUR. Sahiplik יֵשׁ + לְ ile kurulur: יֵשׁ לִי כֶּלֶב "köpeğim var".' },
  { id: 'ein-li', he: 'אֵין לִי', plain: 'אין לי', translit: 'eyn li', tr: 'bende yok; …m yok', literal: 'yok bana', topic: 'yapı', cefr: 'A1', note: 'יֵשׁ\'in olumsuzu לֹא ile değil, ayrı bir kelimeyle kurulur: אֵין.' },
  { id: 'ani-tsarich', he: 'אֲנִי צָרִיךְ לְ־', plain: 'אני צריך ל', translit: 'ani tsarih le-', tr: '…mem gerek (erkek)', topic: 'yapı', cefr: 'A1', note: 'Ardından MASTAR gelir: אֲנִי צָרִיךְ לָלֶכֶת "gitmem gerek".' },
  { id: 'ani-tsricha', he: 'אֲנִי צְרִיכָה לְ־', plain: 'אני צריכה ל', translit: 'ani tsriha le-', tr: '…mem gerek (kadın)', topic: 'yapı', cefr: 'A1', note: 'צָרִיךְ bir sıfattır, fiil değil — bu yüzden cinsiyete göre değişir.' },
  { id: 'ani-yachol', he: 'אֲנִי יָכוֹל לְ־', plain: 'אני יכול ל', translit: 'ani yahol le-', tr: '…bilirim (erkek)', topic: 'yapı', cefr: 'A1', note: 'Yetenek ve izin: אֲנִי יָכוֹל לַעֲזֹר "yardım edebilirim".' },
  { id: 'ani-yechola', he: 'אֲנִי יְכוֹלָה לְ־', plain: 'אני יכולה ל', translit: 'ani yehola le-', tr: '…bilirim (kadın)', topic: 'yapı', cefr: 'A1' },
  { id: 'efshar', he: 'אֶפְשָׁר לְ־', plain: 'אפשר ל', translit: 'efşar le-', tr: '…mek mümkün mü?', literal: 'mümkün', topic: 'yapı', cefr: 'A1', note: 'Kişi çekmez, herkes için aynıdır. Kibarca istemenin en kolay yolu: אֶפְשָׁר לְקַבֵּל חֶשְׁבּוֹן "hesabı alabilir miyim".' },
  { id: 'i-efshar', he: 'אִי אֶפְשָׁר', plain: 'אי אפשר', translit: 'i efşar', tr: 'mümkün değil', topic: 'yapı', cefr: 'A2' },
  { id: 'assur', he: 'אָסוּר לְ־', plain: 'אסור ל', translit: 'asur le-', tr: 'yasak; …mamalı', topic: 'yapı', cefr: 'A2' },
  { id: 'mutar', he: 'מֻתָּר לְ־', plain: 'מותר ל', translit: 'mutar le-', tr: 'serbest; …bilir', topic: 'yapı', cefr: 'A2' },
  { id: 'kedai', he: 'כְּדַאי לְ־', plain: 'כדאי ל', translit: 'kedai le-', tr: '…mekte fayda var', topic: 'yapı', cefr: 'B1', note: 'Tavsiye kalıbı: כְּדַאי לְךָ לָלֶכֶת "gitsen iyi olur".' },
  { id: 'ani-ohev-le', he: 'אֲנִי אוֹהֵב לְ־', plain: 'אני אוהב ל', translit: 'ani ohev le-', tr: '…meyi severim', topic: 'yapı', cefr: 'A1', note: 'Fiil + mastar: אֲנִי אוֹהֵב לִקְרֹא "okumayı severim".' },
  { id: 'mitchil-le', he: 'מַתְחִיל לְ־', plain: 'מתחיל ל', translit: 'mathil le-', tr: '…meye başlıyor', topic: 'yapı', cefr: 'A2' },
  { id: 'mamshich-le', he: 'מַמְשִׁיךְ לְ־', plain: 'ממשיך ל', translit: 'mamşih le-', tr: '…meye devam ediyor', topic: 'yapı', cefr: 'B1' },
  { id: 'gomer-le', he: 'מְסַיֵּם לְ־', plain: 'מסיים ל', translit: 'mesayem le-', tr: '…meyi bitiriyor', topic: 'yapı', cefr: 'B1' },
  { id: 'kedei-le', he: 'כְּדֵי לְ־', plain: 'כדי ל', translit: 'kedey le-', tr: '…mek için', topic: 'yapı', cefr: 'A2', note: 'Amaç bildirir: בָּאתִי כְּדֵי לִלְמֹד "öğrenmek için geldim".' },
  { id: 'bimkom', he: 'בִּמְקוֹם לְ־', plain: 'במקום ל', translit: 'bimkom le-', tr: '…mek yerine', literal: 'yerinde', topic: 'yapı', cefr: 'B1' },
  { id: 'bli-le', he: 'בְּלִי לְ־', plain: 'בלי ל', translit: 'bli le-', tr: '…meden', topic: 'yapı', cefr: 'B1' },
  { id: 'achrei-she', he: 'אַחֲרֵי שֶׁ־', plain: 'אחרי ש', translit: 'aharey şe-', tr: '…dikten sonra', topic: 'yapı', cefr: 'B1' },
  { id: 'lifnei-she', he: 'לִפְנֵי שֶׁ־', plain: 'לפני ש', translit: 'lifney şe-', tr: '…meden önce', topic: 'yapı', cefr: 'B1' },
  { id: 'im', he: 'אִם', plain: 'אם', translit: 'im', tr: 'eğer', topic: 'yapı', cefr: 'A2' },
  { id: 'ki', he: 'כִּי', plain: 'כי', translit: 'ki', tr: 'çünkü', topic: 'yapı', cefr: 'A1' },
  { id: 'aval', he: 'אֲבָל', plain: 'אבל', translit: 'aval', tr: 'ama', topic: 'yapı', cefr: 'A1' },
  { id: 'lachen', he: 'לָכֵן', plain: 'לכן', translit: 'lahen', tr: 'bu yüzden', topic: 'yapı', cefr: 'A2' },
  { id: 'gam', he: 'גַּם', plain: 'גם', translit: 'gam', tr: 'de, da; ayrıca', topic: 'yapı', cefr: 'A1' },
  { id: 'rak', he: 'רַק', plain: 'רק', translit: 'rak', tr: 'sadece', topic: 'yapı', cefr: 'A1' },
  { id: 'od-lo', he: 'עוֹד לֹא', plain: 'עוד לא', translit: 'od lo', tr: 'henüz değil', topic: 'yapı', cefr: 'A2' },
  { id: 'yoter-mi', he: 'יוֹתֵר מִ־', plain: 'יותר מ', translit: 'yoter mi-', tr: '…den daha çok', topic: 'yapı', cefr: 'A2', note: 'Karşılaştırma: גָּדוֹל יוֹתֵר מִמֶּנִּי "benden daha büyük".' },
  { id: 'hachi', he: 'הֲכִי', plain: 'הכי', translit: 'hahi', tr: 'en …', topic: 'yapı', cefr: 'A2', note: 'Üstünlük: הֲכִי טוֹב "en iyi".' },
  { id: 'tsarich-lomar', he: 'צָרִיךְ לוֹמַר', plain: 'צריך לומר', translit: 'tsarih lomar', tr: 'söylemek gerekir', topic: 'yapı', cefr: 'B1' },

  /* --- Ek günlük ifadeler --- */
  { id: 'ma-ata-ose', he: 'מָה אַתָּה עוֹשֶׂה', plain: 'מה אתה עושה', translit: 'ma ata ose', tr: 'ne yapıyorsun? (erkeğe)', topic: 'günlük', cefr: 'A1' },
  { id: 'ein-davar', he: 'אֵין דָּבָר', plain: 'אין דבר', translit: 'eyn davar', tr: 'önemli değil', literal: 'yok bir şey', topic: 'nezaket', cefr: 'A2' },
  { id: 'kama-zman', he: 'כַּמָּה זְמַן', plain: 'כמה זמן', translit: 'kama zman', tr: 'ne kadar süre?', topic: 'soru', cefr: 'A2' },
  { id: 'eize-yom', he: 'אֵיזֶה יוֹם הַיּוֹם', plain: 'איזה יום היום', translit: 'eyze yom hayom', tr: 'bugün günlerden ne?', topic: 'zaman', cefr: 'A2' },
  { id: 'lo-yodea', he: 'אֲנִי לֹא יוֹדֵעַ', plain: 'אני לא יודע', translit: 'ani lo yodea', tr: 'bilmiyorum (erkek)', topic: 'günlük', cefr: 'A1' },
  { id: 'lo-yodaat', he: 'אֲנִי לֹא יוֹדַעַת', plain: 'אני לא יודעת', translit: 'ani lo yodaat', tr: 'bilmiyorum (kadın)', topic: 'günlük', cefr: 'A1' },
  { id: 'tov-meod', he: 'טוֹב מְאֹד', plain: 'טוב מאוד', translit: 'tov meod', tr: 'çok iyi', topic: 'günlük', cefr: 'A1' },
  { id: 'lo-tov', he: 'לֹא טוֹב', plain: 'לא טוב', translit: 'lo tov', tr: 'iyi değil', topic: 'günlük', cefr: 'A1' },
  { id: 'ze-hashuv', he: 'זֶה חָשׁוּב', plain: 'זה חשוב', translit: 'ze haşuv', tr: 'bu önemli', topic: 'günlük', cefr: 'A2' },
  { id: 'ze-lo-meshane', he: 'זֶה לֹא מְשַׁנֶּה', plain: 'זה לא משנה', translit: 'ze lo meşane', tr: 'fark etmez', literal: 'bu değiştirmiyor', topic: 'günlük', cefr: 'B1' },
  { id: 'tihye-bari', he: 'תִּהְיֶה בָּרִיא', plain: 'תהיה בריא', translit: 'tihye bari', tr: 'sağ ol; sağlıcakla', literal: 'sağlıklı ol', topic: 'nezaket', cefr: 'A2' },
  { id: 'nu', he: 'נוּ', plain: 'נו', translit: 'nu', tr: 'e hadi; eee?', topic: 'günlük', cefr: 'A2', note: 'Sabırsızlık ya da "devam et" anlamı taşır. Tonlamayla değişir.' },
  { id: 'achla', he: 'אַחְלָה', plain: 'אחלה', translit: 'ahla', tr: 'süper; harika', topic: 'günlük', cefr: 'A2', note: 'Arapçadan; gençler arasında çok yaygın.' },
  { id: 'chaval-al-hazman', he: 'חֲבָל עַל הַזְּמַן', plain: 'חבל על הזמן', translit: 'haval al hazman', tr: 'inanılmaz (iyi ya da kötü)', literal: 'zamana yazık', topic: 'günlük', cefr: 'B1', note: 'Bağlama göre hem "muhteşem" hem "berbat" demek olabilir.' },
  { id: 'be-emet', he: 'בֶּאֱמֶת', plain: 'באמת', translit: 'beemet', tr: 'gerçekten mi?', literal: 'hakikatte', topic: 'günlük', cefr: 'A2' },
  { id: 'ma-pitom', he: 'מָה פִּתְאֹם', plain: 'מה פתאום', translit: 'ma pitom', tr: 'ne münasebet! yok canım!', literal: 'ne aniden', topic: 'günlük', cefr: 'B1' },
  { id: 'al-tidag', he: 'אַל תִּדְאַג', plain: 'אל תדאג', translit: 'al tidag', tr: 'merak etme (erkeğe)', topic: 'günlük', cefr: 'A2', note: 'Olumsuz emir לֹא ile değil, אַל + gelecek zaman ile kurulur.' },
  { id: 'kach-li', he: 'קַח לִי רֶגַע', plain: 'קח לי רגע', translit: 'kah li rega', tr: 'bir saniye ver', topic: 'günlük', cefr: 'B1' },
  { id: 'bo-nelech', he: 'בּוֹא נֵלֵךְ', plain: 'בוא נלך', translit: 'bo nelah', tr: 'hadi gidelim', literal: 'gel gidelim', topic: 'günlük', cefr: 'A2', note: 'בּוֹא + 1. çoğul gelecek = "hadi …elim".' },
];

/*
 * Kalip listesi iki dosyadan gelir: burasi ulpanin ilk haftasi, ikinci
 * dosya ise bir isi halletmek icin gerekenler. Birlesim tek yerde olsun
 * diye burada yapiliyor; disari yalnizca PHRASES cikiyor.
 */
export const PHRASES: Phrase[] = [...PHRASES_BASE, ...PHRASES_EXTRA];

export const PHRASE_TOPICS: PhraseTopic[] = [
  'selamlaşma',
  'nezaket',
  'tanışma',
  'soru',
  'zaman',
  'yer',
  'alışveriş',
  'yemek',
  'duygu',
  'günlük',
  'kutlama',
  'sınıf',
  'yapı',
];

export const TOPIC_LABEL: Record<PhraseTopic, string> = {
  selamlaşma: 'Selamlaşma',
  nezaket: 'Nezaket',
  tanışma: 'Tanışma',
  soru: 'Soru sözcükleri',
  zaman: 'Zaman',
  yer: 'Yön ve yer',
  alışveriş: 'Alışveriş',
  yemek: 'Yeme içme',
  duygu: 'Duygu ve tepki',
  günlük: 'Günlük konuşma',
  kutlama: 'Kutlama',
  sınıf: 'Derste',
  yapı: 'Fiil kalıpları',
};

export function phrasesByLevel(level: CEFR): Phrase[] {
  return PHRASES.filter((p) => p.cefr === level);
}

export function phrasesByTopic(topic: PhraseTopic): Phrase[] {
  return PHRASES.filter((p) => p.topic === topic);
}
