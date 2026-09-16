/**
 * Kalıplar — ikinci parti.
 *
 * NEDEN AYRI DOSYA: İlk liste "ulpanın ilk haftası" kalıplarıydı —
 * selamlaşma, nezaket, en temel sorular. Bu dosya öğrencinin ilk
 * haftadan sonra ihtiyaç duyduğu yeri dolduruyor: bir işi HALLETMEK
 * için söylenenler. Doktora gitmek, kira konuşmak, otobüste sormak,
 * telefonda konuşmak, birinden yardım istemek.
 *
 * Seçim ölçüsü ilk listeyle aynı: kelime kelime çevrilince anlamı
 * çıkmayan, olduğu gibi öğrenilen parçalar. `literal` alanı o yüzden
 * var — "neden böyle diyorlar" sorusunu cevapsız bırakmak, kalıbı
 * benzeriyle karıştırmanın en kısa yolu.
 */
import type { Phrase } from './phrases';

export const PHRASES_EXTRA: Phrase[] = [
  /* --- Telefon ve iletişim --- */
  { id: 'halo', he: 'הָלוֹ', plain: 'הלו', translit: 'halo', tr: 'alo', topic: 'günlük', cefr: 'A1', note: 'Yalnızca telefonda. Yüz yüze שָׁלוֹם denir.' },
  { id: 'mi-medaber', he: 'מִי מְדַבֵּר', plain: 'מי מדבר', translit: 'mi medaber', tr: 'kim arıyor?', literal: 'kim konuşuyor', topic: 'günlük', cefr: 'A2' },
  { id: 'rega-bevakasha', he: 'רֶגַע בְּבַקָּשָׁה', plain: 'רגע בבקשה', translit: 'rega bevakaşa', tr: 'bir saniye lütfen', literal: 'an lütfen', topic: 'nezaket', cefr: 'A1' },
  { id: 'ani-achzor-elecha', he: 'אֲנִי אַחֲזֹר אֵלֶיךָ', plain: 'אני אחזור אליך', translit: 'ani ahzor eleha', tr: 'sana döneceğim (erkeğe)', literal: 'ben döneceğim sana', topic: 'günlük', cefr: 'B1' },
  { id: 'tishlach-li-hodaa', he: 'תִּשְׁלַח לִי הוֹדָעָה', plain: 'תשלח לי הודעה', translit: 'tişlah li hodaa', tr: 'bana mesaj at (erkeğe)', topic: 'günlük', cefr: 'A2' },
  { id: 'ein-li-kelet', he: 'אֵין לִי קְלִיטָה', plain: 'אין לי קליטה', translit: 'eyn li klita', tr: 'çekmiyor (telefon)', literal: 'yok bende çekim', topic: 'günlük', cefr: 'B1' },
  { id: 'ani-lo-shomea', he: 'אֲנִי לֹא שׁוֹמֵעַ אוֹתְךָ', plain: 'אני לא שומע אותך', translit: 'ani lo şomea otha', tr: 'seni duyamıyorum (erkek konuşuyor)', topic: 'günlük', cefr: 'A2' },

  /* --- Yol sormak, ulaşım --- */
  { id: 'eich-magiim', he: 'אֵיךְ מַגִּיעִים לְ', plain: 'איך מגיעים ל', translit: 'eyh magiim le', tr: '...e nasıl gidilir?', literal: 'nasıl varılır -e', topic: 'yer', cefr: 'A2', note: 'Özne yok — İbranicede "genel özne" çoğul eril ile kurulur.' },
  { id: 'ze-rachok-mikan', he: 'זֶה רָחוֹק מִכָּאן', plain: 'זה רחוק מכאן', translit: 'ze rahok mikan', tr: 'buradan uzak mı?', literal: 'bu uzak buradan', topic: 'yer', cefr: 'A2' },
  { id: 'kama-zman-lokeach', he: 'כַּמָּה זְמַן זֶה לוֹקֵחַ', plain: 'כמה זמן זה לוקח', translit: 'kama zman ze lokeah', tr: 'ne kadar sürer?', literal: 'ne kadar zaman bu alıyor', topic: 'zaman', cefr: 'A2' },
  { id: 'eize-kav', he: 'אֵיזֶה קַו נוֹסֵעַ לְ', plain: 'איזה קו נוסע ל', translit: 'eyze kav nosea le', tr: 'hangi hat ...e gider?', literal: 'hangi hat gidiyor -e', topic: 'yer', cefr: 'B1' },
  { id: 'atsor-bevakasha', he: 'עֲצֹר בְּבַקָּשָׁה', plain: 'עצור בבקשה', translit: 'atsor bevakaşa', tr: 'durur musunuz lütfen', literal: 'dur lütfen', topic: 'yer', cefr: 'A2' },
  { id: 'ani-yored-kan', he: 'אֲנִי יוֹרֵד כָּאן', plain: 'אני יורד כאן', translit: 'ani yored kan', tr: 'burada iniyorum (erkek)', topic: 'yer', cefr: 'A2' },
  { id: 'ta-im-hakartis', he: 'צָרִיךְ לְהַעֲבִיר כַּרְטִיס', plain: 'צריך להעביר כרטיס', translit: 'tsarih lehaavir kartis', tr: 'kart okutmak gerekiyor', literal: 'gerek geçirmeye kart', topic: 'yer', cefr: 'B1' },
  { id: 'ani-halachti-laibud', he: 'הָלַכְתִּי לְאִבּוּד', plain: 'הלכתי לאיבוד', translit: 'halahti leibud', tr: 'kayboldum', literal: 'gittim kaybolmaya', topic: 'yer', cefr: 'B1' },

  /* --- Alışveriş, para --- */
  { id: 'efshar-lirot', he: 'אֶפְשָׁר לִרְאוֹת', plain: 'אפשר לראות', translit: 'efşar lirot', tr: 'görebilir miyim?', literal: 'mümkün görmeye', topic: 'alışveriş', cefr: 'A2' },
  { id: 'yesh-be-mida-acheret', he: 'יֵשׁ בְּמִדָּה אַחֶרֶת', plain: 'יש במידה אחרת', translit: 'yeş bemida aheret', tr: 'başka beden var mı?', literal: 'var ölçüde başka', topic: 'alışveriş', cefr: 'B1' },
  { id: 'ani-rak-mistakel', he: 'אֲנִי רַק מִסְתַּכֵּל', plain: 'אני רק מסתכל', translit: 'ani rak mistakel', tr: 'sadece bakıyorum (erkek)', topic: 'alışveriş', cefr: 'A2' },
  { id: 'efshar-lehachlif', he: 'אֶפְשָׁר לְהַחֲלִיף', plain: 'אפשר להחליף', translit: 'efşar lehahalif', tr: 'değiştirebilir miyim?', literal: 'mümkün değiştirmeye', topic: 'alışveriş', cefr: 'B1' },
  { id: 'be-mezuman', he: 'בִּמְזֻמָּן אוֹ בְּאַשְׁרַאי', plain: 'במזומן או באשראי', translit: 'bimzuman o beaşrai', tr: 'nakit mi kredi kartı mı?', literal: 'nakitle ya da kredide', topic: 'alışveriş', cefr: 'B1' },
  { id: 'yesh-mivtsa', he: 'יֵשׁ מִבְצָע', plain: 'יש מבצע', translit: 'yeş mivtsa', tr: 'kampanya var mı?', literal: 'var kampanya', topic: 'alışveriş', cefr: 'B1' },
  { id: 'ze-lo-oved', he: 'זֶה לֹא עוֹבֵד', plain: 'זה לא עובד', translit: 'ze lo oved', tr: 'bu çalışmıyor', literal: 'bu değil çalışıyor', topic: 'günlük', cefr: 'A2' },

  /* --- Restoran --- */
  { id: 'shulchan-lishnayim', he: 'שֻׁלְחָן לִשְׁנַיִם', plain: 'שולחן לשניים', translit: 'şulhan lişnayim', tr: 'iki kişilik masa', literal: 'masa iki için', topic: 'yemek', cefr: 'A2' },
  { id: 'ma-atem-mamlitsim', he: 'מָה אַתֶּם מַמְלִיצִים', plain: 'מה אתם ממליצים', translit: 'ma atem mamlitsim', tr: 'ne tavsiye edersiniz?', topic: 'yemek', cefr: 'B1' },
  { id: 'ze-im-basar', he: 'זֶה עִם בָּשָׂר', plain: 'זה עם בשר', translit: 'ze im basar', tr: 'bunun içinde et var mı?', literal: 'bu etle', topic: 'yemek', cefr: 'A2' },
  { id: 'ani-tsimchoni', he: 'אֲנִי צִמְחוֹנִי', plain: 'אני צמחוני', translit: 'ani tsimhoni', tr: 'ben vejetaryenim (erkek)', topic: 'yemek', cefr: 'B1' },
  { id: 'od-mayim-bevakasha', he: 'עוֹד מַיִם בְּבַקָּשָׁה', plain: 'עוד מים בבקשה', translit: 'od mayim bevakaşa', tr: 'biraz daha su lütfen', literal: 'daha su lütfen', topic: 'yemek', cefr: 'A1' },
  { id: 'haya-taim-meod', he: 'הָיָה טָעִים מְאוֹד', plain: 'היה טעים מאוד', translit: 'haya taim meod', tr: 'çok lezzetliydi', topic: 'yemek', cefr: 'A2' },
  { id: 'efshar-lekabel-hashbon', he: 'אֶפְשָׁר לְקַבֵּל חֶשְׁבּוֹן', plain: 'אפשר לקבל חשבון', translit: 'efşar lekabel heşbon', tr: 'hesabı alabilir miyiz?', literal: 'mümkün almaya hesap', topic: 'yemek', cefr: 'A2' },

  /* --- Sağlık --- */
  { id: 'ani-lo-margish-tov', he: 'אֲנִי לֹא מַרְגִּישׁ טוֹב', plain: 'אני לא מרגיש טוב', translit: 'ani lo margiş tov', tr: 'iyi hissetmiyorum (erkek)', topic: 'günlük', cefr: 'A2' },
  { id: 'koev-li', he: 'כּוֹאֵב לִי', plain: 'כואב לי', translit: 'koev li', tr: 'ağrıyor; canım acıyor', literal: 'ağrıyor bana', topic: 'günlük', cefr: 'A2', note: 'Ağrıyan yer sonra söylenir: כּוֹאֵב לִי הָרֹאשׁ.' },
  { id: 'yesh-li-chom', he: 'יֵשׁ לִי חֹם', plain: 'יש לי חום', translit: 'yeş li hom', tr: 'ateşim var', literal: 'var bende ateş', topic: 'günlük', cefr: 'A2' },
  { id: 'ani-tsarich-rofe', he: 'אֲנִי צָרִיךְ רוֹפֵא', plain: 'אני צריך רופא', translit: 'ani tsarih rofe', tr: 'doktora ihtiyacım var (erkek)', topic: 'günlük', cefr: 'A2' },
  { id: 'kavati-tor', he: 'קָבַעְתִּי תּוֹר', plain: 'קבעתי תור', translit: 'kavati tor', tr: 'randevu aldım', literal: 'belirledim sıra', topic: 'günlük', cefr: 'B1' },
  { id: 'refua-shlema', he: 'רְפוּאָה שְׁלֵמָה', plain: 'רפואה שלמה', translit: 'refua şlema', tr: 'geçmiş olsun', literal: 'tam şifa', topic: 'nezaket', cefr: 'B1' },

  /* --- Ev, kira, komşuluk --- */
  { id: 'ani-mechapes-dira', he: 'אֲנִי מְחַפֵּשׂ דִּירָה', plain: 'אני מחפש דירה', translit: 'ani mehapes dira', tr: 'daire arıyorum (erkek)', topic: 'günlük', cefr: 'B1' },
  { id: 'kama-sechar-dira', he: 'כַּמָּה שְׂכַר הַדִּירָה', plain: 'כמה שכר הדירה', translit: 'kama sar hadira', tr: 'kira ne kadar?', literal: 'ne kadar kirası dairenin', topic: 'günlük', cefr: 'B1' },
  { id: 'kolel-arnona', he: 'כּוֹלֵל אַרְנוֹנָה', plain: 'כולל ארנונה', translit: 'kolel arnona', tr: 'emlak vergisi dâhil', literal: 'içeriyor vergi', topic: 'günlük', cefr: 'B2' },
  { id: 'yesh-baaya-bemayim', he: 'יֵשׁ בְּעָיָה בַּמַּיִם', plain: 'יש בעיה במים', translit: 'yeş baaya bamayim', tr: 'suda bir sorun var', topic: 'günlük', cefr: 'B1' },
  { id: 'efshar-letaken', he: 'אֶפְשָׁר לְתַקֵּן', plain: 'אפשר לתקן', translit: 'efşar letaken', tr: 'tamir edilebilir mi?', literal: 'mümkün tamir etmeye', topic: 'günlük', cefr: 'B1' },

  /* --- İş ve resmî işler --- */
  { id: 'ani-mechapes-avoda', he: 'אֲנִי מְחַפֵּשׂ עֲבוֹדָה', plain: 'אני מחפש עבודה', translit: 'ani mehapes avoda', tr: 'iş arıyorum (erkek)', topic: 'günlük', cefr: 'B1' },
  { id: 'yesh-li-nisayon', he: 'יֵשׁ לִי נִסָּיוֹן', plain: 'יש לי ניסיון', translit: 'yeş li nisayon', tr: 'deneyimim var', literal: 'var bende deneyim', topic: 'günlük', cefr: 'B1' },
  { id: 'matay-mathilim', he: 'מָתַי מַתְחִילִים', plain: 'מתי מתחילים', translit: 'matay mathilim', tr: 'ne zaman başlıyoruz?', literal: 'ne zaman başlanıyor', topic: 'zaman', cefr: 'A2' },
  { id: 'ani-tsarich-tor', he: 'צָרִיךְ לִקְבֹּעַ תּוֹר', plain: 'צריך לקבוע תור', translit: 'tsarih likboa tor', tr: 'randevu almak gerek', topic: 'günlük', cefr: 'B1' },
  { id: 'eize-mismachim', he: 'אֵילוּ מִסְמָכִים צְרִיכִים', plain: 'אילו מסמכים צריכים', translit: 'eylu mismahim tsrihim', tr: 'hangi belgeler gerekiyor?', topic: 'günlük', cefr: 'B2' },
  { id: 'ani-lo-batuach', he: 'אֲנִי לֹא בָּטוּחַ', plain: 'אני לא בטוח', translit: 'ani lo batuah', tr: 'emin değilim (erkek)', topic: 'günlük', cefr: 'A2' },

  /* --- Sınıf ve öğrenme --- */
  { id: 'efshar-lachzor-al-ze', he: 'אֶפְשָׁר לַחֲזֹר עַל זֶה', plain: 'אפשר לחזור על זה', translit: 'efşar lahazor al ze', tr: 'bunu tekrar eder misiniz?', literal: 'mümkün dönmeye bunun üzerine', topic: 'sınıf', cefr: 'A2' },
  { id: 'ma-hahevdel', he: 'מָה הַהֶבְדֵּל בֵּין', plain: 'מה ההבדל בין', translit: 'ma hahevdel beyn', tr: '... arasındaki fark ne?', literal: 'ne fark arasında', topic: 'sınıf', cefr: 'B1' },
  { id: 'eich-kotvim-et-ze', he: 'אֵיךְ כּוֹתְבִים אֶת זֶה', plain: 'איך כותבים את זה', translit: 'eyh kotvim et ze', tr: 'bu nasıl yazılır?', literal: 'nasıl yazılıyor bunu', topic: 'sınıf', cefr: 'A2' },
  { id: 'ze-nachon-le-omar', he: 'זֶה נָכוֹן לוֹמַר', plain: 'זה נכון לומר', translit: 'ze nahon lomar', tr: 'böyle demek doğru mu?', literal: 'bu doğru söylemeye', topic: 'sınıf', cefr: 'B1' },
  { id: 'ani-mitrgel', he: 'אֲנִי מִתְרַגֵּל לְאַט', plain: 'אני מתרגל לאט', translit: 'ani mitragel leat', tr: 'yavaş yavaş alışıyorum (erkek)', topic: 'sınıf', cefr: 'B1' },
  { id: 'taus-sheli', he: 'זוֹ הַטָּעוּת שֶׁלִּי', plain: 'זו הטעות שלי', translit: 'zo hataut şeli', tr: 'benim hatam', literal: 'bu hata benim', topic: 'sınıf', cefr: 'A2' },

  /* --- Zaman ve randevu --- */
  { id: 'be-eize-shaa', he: 'בְּאֵיזוֹ שָׁעָה', plain: 'באיזו שעה', translit: 'beeyzo şaa', tr: 'saat kaçta?', literal: 'hangi saatte', topic: 'zaman', cefr: 'A2' },
  { id: 'od-chatsi-shaa', he: 'עוֹד חֲצִי שָׁעָה', plain: 'עוד חצי שעה', translit: 'od hatsi şaa', tr: 'yarım saat sonra', literal: 'daha yarım saat', topic: 'zaman', cefr: 'A2', note: 'עוֹד burada "sonra" anlamı taşır, "daha fazla" değil.' },
  { id: 'lifnei-shavua', he: 'לִפְנֵי שָׁבוּעַ', plain: 'לפני שבוע', translit: 'lifney şavua', tr: 'bir hafta önce', literal: 'önünde hafta', topic: 'zaman', cefr: 'A2' },
  { id: 'meuchar-midai', he: 'מְאֻחָר מִדַּי', plain: 'מאוחר מדי', translit: 'meuhar miday', tr: 'çok geç', literal: 'geç fazlasıyla', topic: 'zaman', cefr: 'A2' },
  { id: 'ani-memaher', he: 'אֲנִי מְמַהֵר', plain: 'אני ממהר', translit: 'ani memaher', tr: 'acelem var (erkek)', literal: 'ben acele ediyorum', topic: 'zaman', cefr: 'A2' },
  { id: 'yesh-li-zman', he: 'יֵשׁ לִי זְמַן', plain: 'יש לי זמן', translit: 'yeş li zman', tr: 'vaktim var', topic: 'zaman', cefr: 'A1' },
  { id: 'ze-dachuf', he: 'זֶה דָּחוּף', plain: 'זה דחוף', translit: 'ze dahuf', tr: 'bu acil', topic: 'zaman', cefr: 'B1' },

  /* --- Duygu ve tepki --- */
  { id: 'ani-gee-becha', he: 'אֲנִי גֵּאֶה בְּךָ', plain: 'אני גאה בך', translit: 'ani gee beha', tr: 'seninle gurur duyuyorum (erkeğe)', literal: 'ben gururlu sende', topic: 'duygu', cefr: 'B1' },
  { id: 'ze-mavhil', he: 'זֶה מַבְהִיל', plain: 'זה מבהיל', translit: 'ze mavhil', tr: 'bu korkutucu', topic: 'duygu', cefr: 'B2' },
  { id: 'ani-mitgaagea', he: 'אֲנִי מִתְגַּעְגֵּעַ', plain: 'אני מתגעגע', translit: 'ani mitgaagea', tr: 'özlüyorum (erkek)', topic: 'duygu', cefr: 'B1', note: 'Kime özlendiği אֶל ile söylenir: מִתְגַּעְגֵּעַ אֵלַיִךְ.' },
  { id: 'ze-mevish', he: 'זֶה מֵבִישׁ', plain: 'זה מביש', translit: 'ze meviş', tr: 'bu utanç verici', topic: 'duygu', cefr: 'B2' },
  { id: 'ani-be-lachats', he: 'אֲנִי בְּלַחַץ', plain: 'אני בלחץ', translit: 'ani belahats', tr: 'stresliyim', literal: 'ben baskıda', topic: 'duygu', cefr: 'B1' },
  { id: 'tirgea', he: 'תִּרְגַּע', plain: 'תרגע', translit: 'tirga', tr: 'sakin ol (erkeğe)', topic: 'duygu', cefr: 'A2', note: 'Gelecek zaman kalıbı emir yerine kullanılır — günlük dilde çok yaygın.' },
  { id: 'ze-meshagea-oti', he: 'זֶה מְשַׁגֵּעַ אוֹתִי', plain: 'זה משגע אותי', translit: 'ze meşagea oti', tr: 'bu beni delirtiyor', topic: 'duygu', cefr: 'B2' },

  /* --- Yardım ve rica --- */
  { id: 'tuchal-laazor-li', he: 'תּוּכַל לַעֲזֹר לִי', plain: 'תוכל לעזור לי', translit: 'tuhal laazor li', tr: 'bana yardım edebilir misin? (erkeğe)', topic: 'nezaket', cefr: 'A2' },
  { id: 'ein-li-musag', he: 'אֵין לִי מֻשָּׂג', plain: 'אין לי מושג', translit: 'eyn li musag', tr: 'hiçbir fikrim yok', literal: 'yok bende kavram', topic: 'günlük', cefr: 'B1' },
  { id: 'ani-esader-et-ze', he: 'אֲנִי אֲסַדֵּר אֶת זֶה', plain: 'אני אסדר את זה', translit: 'ani asader et ze', tr: 'ben hallederim', literal: 'ben düzenleyeceğim bunu', topic: 'günlük', cefr: 'B1' },
  { id: 'tten-li-laasot', he: 'תֵּן לִי לַעֲשׂוֹת', plain: 'תן לי לעשות', translit: 'ten li laasot', tr: 'bırak ben yapayım', literal: 'ver bana yapmaya', topic: 'günlük', cefr: 'B1' },
  { id: 'lo-tsarich', he: 'לֹא צָרִיךְ', plain: 'לא צריך', translit: 'lo tsarih', tr: 'gerek yok', topic: 'nezaket', cefr: 'A1' },
  { id: 'im-kach', he: 'אִם כָּךְ', plain: 'אם כך', translit: 'im kah', tr: 'öyleyse', literal: 'eğer böyle', topic: 'yapı', cefr: 'B1' },
  { id: 'kol-od', he: 'כָּל עוֹד', plain: 'כל עוד', translit: 'kol od', tr: '-dığı sürece', literal: 'tüm daha', topic: 'yapı', cefr: 'B2' },
  { id: 'meaz-she', he: 'מֵאָז שֶׁ', plain: 'מאז ש', translit: 'meaz şe', tr: '-den beri', literal: 'o zamandan ki', topic: 'yapı', cefr: 'B1' },
  { id: 'kedei-she', he: 'כְּדֵי שֶׁ', plain: 'כדי ש', translit: 'kdey şe', tr: '... olsun diye', literal: 'için ki', topic: 'yapı', cefr: 'B1', note: 'Ardından gelecek zaman gelir: כְּדֵי שֶׁתָּבוֹא.' },
  { id: 'lamrot-she', he: 'לַמְרוֹת שֶׁ', plain: 'למרות ש', translit: 'lamrot şe', tr: '-mesine rağmen', topic: 'yapı', cefr: 'B1' },
  { id: 'bimkom-she', he: 'בִּמְקוֹם שֶׁ', plain: 'במקום ש', translit: 'bimkom şe', tr: '-ecek yerde', topic: 'yapı', cefr: 'B2' },
  { id: 'ein-safek', he: 'אֵין סָפֵק', plain: 'אין ספק', translit: 'eyn safek', tr: 'şüphesiz', literal: 'yok şüphe', topic: 'yapı', cefr: 'B2' },
];
