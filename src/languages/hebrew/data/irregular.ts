/**
 * Düzensiz fiiller — motorun üretemediği, elle yazılmış çekimler.
 *
 * NEDEN ELLE: Çekim motoru kökün harflerinden kalıbı türetir ve bu 350+
 * fiilde çalışıyor. Ama İbranicenin EN SIK kullanılan bir avuç fiili
 * hiçbir kalıba uymaz:
 *   הָלַךְ → יֵלֵךְ  (kök ה־ל־כ ama gelecek zaman פ״י gibi davranır)
 *   לָקַח → יִקַּח  (ל yokmuş gibi, פ״נ gibi çekilir)
 *   נָתַן → לָתֵת  (mastarda kökten tek harf kalır)
 *   אָמַר → לוֹמַר (mastar kökle hiç ilgisiz görünür)
 * Bunlar kural değil, tarihsel kalıntıdır. Kural yazmaya çalışmak her
 * seferinde başka bir fiili bozar; doğrusu olduğu gibi yazmaktır.
 *
 * KAPSAM ÖLÇÜSÜ: Buraya yalnızca SIK kullanılan düzensizler girer.
 * Seyrek bir düzensiz fiili elle yazmak, onu hiç göstermemekten daha
 * iyi değildir — çünkü kimse kullanmaz ama bakımı yine de bize kalır.
 *
 * BİÇİM: her hücre 'harekeli/harekesiz'. Okunuş harekeliden türetilir,
 * o yüzden üçüncü kez yazılmaz. Sıralama sabittir:
 *   geçmiş & gelecek → ani, ata, at, hu, hi, anachnu, atem, hem
 *   şimdiki          → ms, fs, mp, fp
 *   emir             → ata, at, atem
 */
import { transliterate } from '@he/engine/niqqud';
import type {
  Binyan,
  CEFR,
  Conjugation,
  ConjugationTable,
  HebrewScores,
  ImperativeSlot,
  Person,
  PresentSlot,
} from '@he/types';

/** 'harekeli/harekesiz' biçimindeki hücreyi çözer. */
function cell(raw: string): Conjugation {
  const [vocalized, plain] = raw.split('/');
  if (!vocalized || !plain) {
    throw new Error(`Düzensiz fiil hücresi 'harekeli/harekesiz' olmalı: ${raw}`);
  }
  return { vocalized, plain, translit: transliterate(vocalized) };
}

const PERSON_ORDER: Person[] = ['ani', 'ata', 'at', 'hu', 'hi', 'anachnu', 'atem', 'hem'];
const PRESENT_ORDER: PresentSlot[] = ['ms', 'fs', 'mp', 'fp'];
const IMPERATIVE_ORDER: ImperativeSlot[] = ['ata', 'at', 'atem'];

function persons(cells: string[]): Partial<Record<Person, Conjugation>> {
  const out: Partial<Record<Person, Conjugation>> = {};
  PERSON_ORDER.forEach((p, i) => {
    const raw = cells[i];
    if (raw) out[p] = cell(raw);
  });
  return out;
}

function present(cells: string[]): Partial<Record<PresentSlot, Conjugation>> {
  const out: Partial<Record<PresentSlot, Conjugation>> = {};
  PRESENT_ORDER.forEach((s, i) => {
    const raw = cells[i];
    if (raw) out[s] = cell(raw);
  });
  return out;
}

function imperatives(cells: string[]): Partial<Record<ImperativeSlot, Conjugation>> {
  const out: Partial<Record<ImperativeSlot, Conjugation>> = {};
  IMPERATIVE_ORDER.forEach((s, i) => {
    const raw = cells[i];
    if (raw) out[s] = cell(raw);
  });
  return out;
}

export interface IrregularSeed {
  root: string[];
  binyan: Binyan;
  tr: string[];
  cefr: CEFR;
  scores: HebrewScores;
  /** Bu fiili neden düzensiz sayıyoruz — öğrenciye gösterilir. */
  why: string;
  infinitive?: string;
  past: string[];
  presentForms: string[];
  future: string[];
  imperative?: string[];
}

const S = (
  frequency: number,
  ulpan: number,
  speaking: number,
  written: number,
): HebrewScores => ({ frequency, ulpan, speaking, written });

export const IRREGULAR_SEEDS: IrregularSeed[] = [
  {
    root: ['ה', 'ל', 'כ'],
    binyan: 'paal',
    tr: ['gitmek', 'yürümek'],
    cefr: 'A1',
    scores: S(97, 99, 98, 90),
    why: 'Geçmiş ve şimdiki zaman düzenli, ama gelecek zaman ile mastarda ilk harf ה düşer ve fiil פ״י gibi çekilir: לָלֶכֶת, יֵלֵךְ.',
    infinitive: 'לָלֶכֶת/ללכת',
    past: [
      'הָלַכְתִּי/הלכתי',
      'הָלַכְתָּ/הלכת',
      'הָלַכְתְּ/הלכת',
      'הָלַךְ/הלך',
      'הָלְכָה/הלכה',
      'הָלַכְנוּ/הלכנו',
      'הֲלַכְתֶּם/הלכתם',
      'הָלְכוּ/הלכו',
    ],
    presentForms: ['הוֹלֵךְ/הולך', 'הוֹלֶכֶת/הולכת', 'הוֹלְכִים/הולכים', 'הוֹלְכוֹת/הולכות'],
    future: [
      'אֵלֵךְ/אלך',
      'תֵּלֵךְ/תלך',
      'תֵּלְכִי/תלכי',
      'יֵלֵךְ/ילך',
      'תֵּלֵךְ/תלך',
      'נֵלֵךְ/נלך',
      'תֵּלְכוּ/תלכו',
      'יֵלְכוּ/ילכו',
    ],
    imperative: ['לֵךְ/לך', 'לְכִי/לכי', 'לְכוּ/לכו'],
  },

  {
    root: ['ה', 'י', 'ה'],
    binyan: 'paal',
    tr: ['olmak'],
    cefr: 'A1',
    scores: S(96, 99, 95, 96),
    why: 'ŞİMDİKİ ZAMANI YOKTUR. İbranicede "ben öğrenciyim" derken fiil kullanılmaz: אֲנִי סְטוּדֶנְט. Fiil yalnızca geçmiş ve gelecekte ortaya çıkar.',
    infinitive: 'לִהְיוֹת/להיות',
    past: [
      'הָיִיתִי/הייתי',
      'הָיִיתָ/היית',
      'הָיִית/היית',
      'הָיָה/היה',
      'הָיְתָה/הייתה',
      'הָיִינוּ/היינו',
      'הֱיִיתֶם/הייתם',
      'הָיוּ/היו',
    ],
    // Şimdiki zaman kasten boş — bu fiilin öğretilecek en önemli özelliği.
    presentForms: [],
    future: [
      'אֶהְיֶה/אהיה',
      'תִּהְיֶה/תהיה',
      'תִּהְיִי/תהיי',
      'יִהְיֶה/יהיה',
      'תִּהְיֶה/תהיה',
      'נִהְיֶה/נהיה',
      'תִּהְיוּ/תהיו',
      'יִהְיוּ/יהיו',
    ],
    imperative: ['הֱיֵה/היה', 'הֲיִי/היי', 'הֱיוּ/היו'],
  },

  {
    root: ['ב', 'ו', 'א'],
    binyan: 'paal',
    tr: ['gelmek'],
    cefr: 'A1',
    scores: S(95, 98, 96, 88),
    why: 'Hem içi boş kök (ע״ו) hem son harfi א. İki zayıflık üst üste gelince hiçbir kalıp tutmuyor: geçmişte בָּאתִי, gelecekte יָבוֹא.',
    infinitive: 'לָבוֹא/לבוא',
    past: [
      'בָּאתִי/באתי',
      'בָּאתָ/באת',
      'בָּאת/באת',
      'בָּא/בא',
      'בָּאָה/באה',
      'בָּאנוּ/באנו',
      'בָּאתֶם/באתם',
      'בָּאוּ/באו',
    ],
    presentForms: ['בָּא/בא', 'בָּאָה/באה', 'בָּאִים/באים', 'בָּאוֹת/באות'],
    future: [
      'אָבוֹא/אבוא',
      'תָּבוֹא/תבוא',
      'תָּבוֹאִי/תבואי',
      'יָבוֹא/יבוא',
      'תָּבוֹא/תבוא',
      'נָבוֹא/נבוא',
      'תָּבוֹאוּ/תבואו',
      'יָבוֹאוּ/יבואו',
    ],
    imperative: ['בּוֹא/בוא', 'בּוֹאִי/בואי', 'בּוֹאוּ/בואו'],
  },

  {
    root: ['נ', 'ת', 'ן'],
    binyan: 'paal',
    tr: ['vermek'],
    cefr: 'A1',
    scores: S(93, 96, 94, 88),
    why: 'Mastarda kökten tek harf kalır: לָתֵת. Gelecekte ilk נ düşer, son נ ekle kaynaşır: יִתֵּן, נָתַתִּי.',
    infinitive: 'לָתֵת/לתת',
    past: [
      'נָתַתִּי/נתתי',
      'נָתַתָּ/נתת',
      'נָתַתְּ/נתת',
      'נָתַן/נתן',
      'נָתְנָה/נתנה',
      'נָתַנּוּ/נתנו',
      'נְתַתֶּם/נתתם',
      'נָתְנוּ/נתנו',
    ],
    presentForms: ['נוֹתֵן/נותן', 'נוֹתֶנֶת/נותנת', 'נוֹתְנִים/נותנים', 'נוֹתְנוֹת/נותנות'],
    future: [
      'אֶתֵּן/אתן',
      'תִּתֵּן/תתן',
      'תִּתְּנִי/תתני',
      'יִתֵּן/ייתן',
      'תִּתֵּן/תתן',
      'נִתֵּן/ניתן',
      'תִּתְּנוּ/תתנו',
      'יִתְּנוּ/ייתנו',
    ],
    imperative: ['תֵּן/תן', 'תְּנִי/תני', 'תְּנוּ/תנו'],
  },

  {
    root: ['ל', 'ק', 'ח'],
    binyan: 'paal',
    tr: ['almak'],
    cefr: 'A1',
    scores: S(92, 95, 93, 86),
    why: 'Gelecek zamanda ilk harf ל sanki נ imiş gibi düşer ve ק dageş alır: יִקַּח. Emir kipi de kısalır: קַח.',
    infinitive: 'לָקַחַת/לקחת',
    past: [
      'לָקַחְתִּי/לקחתי',
      'לָקַחְתָּ/לקחת',
      'לָקַחְתְּ/לקחת',
      'לָקַח/לקח',
      'לָקְחָה/לקחה',
      'לָקַחְנוּ/לקחנו',
      'לְקַחְתֶּם/לקחתם',
      'לָקְחוּ/לקחו',
    ],
    presentForms: ['לוֹקֵחַ/לוקח', 'לוֹקַחַת/לוקחת', 'לוֹקְחִים/לוקחים', 'לוֹקְחוֹת/לוקחות'],
    future: [
      'אֶקַּח/אקח',
      'תִּקַּח/תיקח',
      'תִּקְּחִי/תיקחי',
      'יִקַּח/ייקח',
      'תִּקַּח/תיקח',
      'נִקַּח/ניקח',
      'תִּקְּחוּ/תיקחו',
      'יִקְּחוּ/ייקחו',
    ],
    imperative: ['קַח/קח', 'קְחִי/קחי', 'קְחוּ/קחו'],
  },

  {
    root: ['י', 'ד', 'ע'],
    binyan: 'paal',
    tr: ['bilmek', 'tanımak (bilgi olarak)'],
    cefr: 'A1',
    scores: S(94, 97, 95, 88),
    why: 'Hem ilk harfi י hem son harfi ע. Mastar ת ile biter (לָדַעַת), gelecekte י düşer ve kök ünlüsü patah olur: יֵדַע.',
    infinitive: 'לָדַעַת/לדעת',
    past: [
      'יָדַעְתִּי/ידעתי',
      'יָדַעְתָּ/ידעת',
      'יָדַעְתְּ/ידעת',
      'יָדַע/ידע',
      'יָדְעָה/ידעה',
      'יָדַעְנוּ/ידענו',
      'יְדַעְתֶּם/ידעתם',
      'יָדְעוּ/ידעו',
    ],
    presentForms: ['יוֹדֵעַ/יודע', 'יוֹדַעַת/יודעת', 'יוֹדְעִים/יודעים', 'יוֹדְעוֹת/יודעות'],
    future: [
      'אֵדַע/אדע',
      'תֵּדַע/תדע',
      'תֵּדְעִי/תדעי',
      'יֵדַע/ידע',
      'תֵּדַע/תדע',
      'נֵדַע/נדע',
      'תֵּדְעוּ/תדעו',
      'יֵדְעוּ/ידעו',
    ],
    imperative: ['דַּע/דע', 'דְּעִי/דעי', 'דְּעוּ/דעו'],
  },

  {
    root: ['י', 'כ', 'ל'],
    binyan: 'paal',
    tr: ['-ebilmek', 'muktedir olmak'],
    cefr: 'A1',
    scores: S(90, 95, 92, 84),
    why: 'MASTARI VE EMİR KİPİ YOKTUR — kendisi zaten başka bir mastarla kullanılır: אֲנִי יָכוֹל לָלֶכֶת. Gelecek zamanı şuruk alır: אוּכַל.',
    past: [
      'יָכֹלְתִּי/יכולתי',
      'יָכֹלְתָּ/יכולת',
      'יָכֹלְתְּ/יכולת',
      'יָכוֹל/יכול',
      'יָכְלָה/יכלה',
      'יָכֹלְנוּ/יכולנו',
      'יְכָלְתֶּם/יכולתם',
      'יָכְלוּ/יכלו',
    ],
    presentForms: ['יָכוֹל/יכול', 'יְכוֹלָה/יכולה', 'יְכוֹלִים/יכולים', 'יְכוֹלוֹת/יכולות'],
    future: [
      'אוּכַל/אוכל',
      'תּוּכַל/תוכל',
      'תּוּכְלִי/תוכלי',
      'יוּכַל/יוכל',
      'תּוּכַל/תוכל',
      'נוּכַל/נוכל',
      'תּוּכְלוּ/תוכלו',
      'יוּכְלוּ/יוכלו',
    ],
  },

  {
    root: ['י', 'צ', 'א'],
    binyan: 'paal',
    tr: ['çıkmak', 'dışarı çıkmak'],
    cefr: 'A1',
    scores: S(88, 92, 90, 84),
    why: 'Hem ilk harfi י hem son harfi א. Mastar ת ile biter: לָצֵאת. Gelecekte י düşer: יֵצֵא.',
    infinitive: 'לָצֵאת/לצאת',
    past: [
      'יָצָאתִי/יצאתי',
      'יָצָאתָ/יצאת',
      'יָצָאת/יצאת',
      'יָצָא/יצא',
      'יָצְאָה/יצאה',
      'יָצָאנוּ/יצאנו',
      'יְצָאתֶם/יצאתם',
      'יָצְאוּ/יצאו',
    ],
    presentForms: ['יוֹצֵא/יוצא', 'יוֹצֵאת/יוצאת', 'יוֹצְאִים/יוצאים', 'יוֹצְאוֹת/יוצאות'],
    future: [
      'אֵצֵא/אצא',
      'תֵּצֵא/תצא',
      'תֵּצְאִי/תצאי',
      'יֵצֵא/יצא',
      'תֵּצֵא/תצא',
      'נֵצֵא/נצא',
      'תֵּצְאוּ/תצאו',
      'יֵצְאוּ/יצאו',
    ],
    imperative: ['צֵא/צא', 'צְאִי/צאי', 'צְאוּ/צאו'],
  },

  {
    root: ['א', 'מ', 'ר'],
    binyan: 'paal',
    tr: ['söylemek', 'demek'],
    cefr: 'A1',
    scores: S(94, 96, 94, 92),
    why: 'Mastarı kökle ilgisiz görünür: לוֹמַר. Gelecekte iki א tek א’ya iner ve "o" sesi çıkar: יֹאמַר.',
    infinitive: 'לוֹמַר/לומר',
    past: [
      'אָמַרְתִּי/אמרתי',
      'אָמַרְתָּ/אמרת',
      'אָמַרְתְּ/אמרת',
      'אָמַר/אמר',
      'אָמְרָה/אמרה',
      'אָמַרְנוּ/אמרנו',
      'אֲמַרְתֶּם/אמרתם',
      'אָמְרוּ/אמרו',
    ],
    presentForms: ['אוֹמֵר/אומר', 'אוֹמֶרֶת/אומרת', 'אוֹמְרִים/אומרים', 'אוֹמְרוֹת/אומרות'],
    future: [
      'אֹמַר/אומר',
      'תֹּאמַר/תאמר',
      'תֹּאמְרִי/תאמרי',
      'יֹאמַר/יאמר',
      'תֹּאמַר/תאמר',
      'נֹאמַר/נאמר',
      'תֹּאמְרוּ/תאמרו',
      'יֹאמְרוּ/יאמרו',
    ],
    imperative: ['אֱמֹר/אמור', 'אִמְרִי/אמרי', 'אִמְרוּ/אמרו'],
  },

  {
    root: ['נ', 'ס', 'ע'],
    binyan: 'paal',
    tr: ['seyahat etmek', 'yola çıkmak'],
    cefr: 'A1',
    scores: S(89, 94, 91, 80),
    why: 'Hem ilk harfi נ hem son harfi ע. Gelecekte נ düşer ve ס dageş alır: יִסַּע. Emir kısalır: סַע.',
    infinitive: 'לִנְסֹעַ/לנסוע',
    past: [
      'נָסַעְתִּי/נסעתי',
      'נָסַעְתָּ/נסעת',
      'נָסַעְתְּ/נסעת',
      'נָסַע/נסע',
      'נָסְעָה/נסעה',
      'נָסַעְנוּ/נסענו',
      'נְסַעְתֶּם/נסעתם',
      'נָסְעוּ/נסעו',
    ],
    presentForms: ['נוֹסֵעַ/נוסע', 'נוֹסַעַת/נוסעת', 'נוֹסְעִים/נוסעים', 'נוֹסְעוֹת/נוסעות'],
    future: [
      'אֶסַּע/אסע',
      'תִּסַּע/תיסע',
      'תִּסְּעִי/תיסעי',
      'יִסַּע/ייסע',
      'תִּסַּע/תיסע',
      'נִסַּע/ניסע',
      'תִּסְּעוּ/תיסעו',
      'יִסְּעוּ/ייסעו',
    ],
    imperative: ['סַע/סע', 'סְעִי/סעי', 'סְעוּ/סעו'],
  },

  {
    root: ['ע', 'ל', 'ה'],
    binyan: 'paal',
    tr: ['çıkmak (yukarı)', 'binmek', 'mal olmak'],
    cefr: 'A2',
    scores: S(84, 88, 86, 82),
    why: 'Hem ilk harfi gırtlaksı ע hem son harfi ה. Gelecekte ön ek patah, ע hatef alır: יַעֲלֶה. "Kaç para?" sorusu da bu fiille kurulur: כַּמָּה זֶה עוֹלֶה.',
    infinitive: 'לַעֲלוֹת/לעלות',
    past: [
      'עָלִיתִי/עליתי',
      'עָלִיתָ/עלית',
      'עָלִית/עלית',
      'עָלָה/עלה',
      'עָלְתָה/עלתה',
      'עָלִינוּ/עלינו',
      'עֲלִיתֶם/עליתם',
      'עָלוּ/עלו',
    ],
    presentForms: ['עוֹלֶה/עולה', 'עוֹלָה/עולה', 'עוֹלִים/עולים', 'עוֹלוֹת/עולות'],
    future: [
      'אֶעֱלֶה/אעלה',
      'תַּעֲלֶה/תעלה',
      'תַּעֲלִי/תעלי',
      'יַעֲלֶה/יעלה',
      'תַּעֲלֶה/תעלה',
      'נַעֲלֶה/נעלה',
      'תַּעֲלוּ/תעלו',
      'יַעֲלוּ/יעלו',
    ],
    imperative: ['עֲלֵה/עלה', 'עֲלִי/עלי', 'עֲלוּ/עלו'],
  },

  {
    root: ['ח', 'י', 'ה'],
    binyan: 'paal',
    tr: ['yaşamak'],
    cefr: 'A2',
    scores: S(76, 78, 76, 80),
    why: 'Şimdiki zamanı kalıba uymaz: חַי / חַיָּה. Son harf ה ve orta harf י birlikte kalıbı kırar.',
    infinitive: 'לִחְיוֹת/לחיות',
    past: [
      'חָיִיתִי/חייתי',
      'חָיִיתָ/חיית',
      'חָיִית/חיית',
      'חַי/חי',
      'חָיְתָה/חיתה',
      'חָיִינוּ/חיינו',
      'חֲיִיתֶם/חייתם',
      'חָיוּ/חיו',
    ],
    presentForms: ['חַי/חי', 'חַיָּה/חיה', 'חַיִּים/חיים', 'חַיּוֹת/חיות'],
    future: [
      'אֶחְיֶה/אחיה',
      'תִּחְיֶה/תחיה',
      'תִּחְיִי/תחיי',
      'יִחְיֶה/יחיה',
      'תִּחְיֶה/תחיה',
      'נִחְיֶה/נחיה',
      'תִּחְיוּ/תחיו',
      'יִחְיוּ/יחיו',
    ],
  },

  {
    root: ['ש', 'ו', 'ב'],
    binyan: 'paal',
    tr: ['geri dönmek'],
    cefr: 'A2',
    scores: S(82, 86, 84, 80),
    why: 'İçi boş kök; geçmiş 3. tekil eril ile şimdiki aynı yazılır: שָׁב. Günlük dilde çoğu zaman חָזַר tercih edilir.',
    infinitive: 'לָשׁוּב/לשוב',
    past: [
      'שַׁבְתִּי/שבתי',
      'שַׁבְתָּ/שבת',
      'שַׁבְתְּ/שבת',
      'שָׁב/שב',
      'שָׁבָה/שבה',
      'שַׁבְנוּ/שבנו',
      'שַׁבְתֶּם/שבתם',
      'שָׁבוּ/שבו',
    ],
    presentForms: ['שָׁב/שב', 'שָׁבָה/שבה', 'שָׁבִים/שבים', 'שָׁבוֹת/שבות'],
    future: [
      'אָשׁוּב/אשוב',
      'תָּשׁוּב/תשוב',
      'תָּשׁוּבִי/תשובי',
      'יָשׁוּב/ישוב',
      'תָּשׁוּב/תשוב',
      'נָשׁוּב/נשוב',
      'תָּשׁוּבוּ/תשובו',
      'יָשׁוּבוּ/ישובו',
    ],
    imperative: ['שׁוּב/שוב', 'שׁוּבִי/שובי', 'שׁוּבוּ/שובו'],
  },

  {
    root: ['נ', 'ג', 'ש'],
    binyan: 'paal',
    tr: ['yaklaşmak', 'yanaşmak'],
    cefr: 'B1',
    scores: S(58, 54, 56, 64),
    why: 'Gelecekte ve emirde ilk נ tamamen düşer: יִגַּשׁ, גַּשׁ.',
    infinitive: 'לָגֶשֶׁת/לגשת',
    past: [
      'נִגַּשְׁתִּי/ניגשתי',
      'נִגַּשְׁתָּ/ניגשת',
      'נִגַּשְׁתְּ/ניגשת',
      'נִגַּשׁ/ניגש',
      'נִגְּשָׁה/ניגשה',
      'נִגַּשְׁנוּ/ניגשנו',
      'נִגַּשְׁתֶּם/ניגשתם',
      'נִגְּשׁוּ/ניגשו',
    ],
    presentForms: ['נִגָּשׁ/ניגש', 'נִגֶּשֶׁת/ניגשת', 'נִגָּשִׁים/ניגשים', 'נִגָּשׁוֹת/ניגשות'],
    future: [
      'אֶגַּשׁ/אגש',
      'תִּגַּשׁ/תיגש',
      'תִּגְּשִׁי/תיגשי',
      'יִגַּשׁ/ייגש',
      'תִּגַּשׁ/תיגש',
      'נִגַּשׁ/ניגש',
      'תִּגְּשׁוּ/תיגשו',
      'יִגְּשׁוּ/ייגשו',
    ],
    imperative: ['גַּשׁ/גש', 'גְּשִׁי/גשי', 'גְּשׁוּ/גשו'],
  },
];

/** Bir tohumdan kanonik çekim tablosu kurar. */
export function tableFromSeed(seed: IrregularSeed): ConjugationTable {
  const past = persons(seed.past);
  const presentTable = present(seed.presentForms);
  return {
    // Mastarı olmayan fiillerde (יָכוֹל) sözlük biçimi 3. tekil erildir.
    infinitive: seed.infinitive ? cell(seed.infinitive) : past.hu!,
    past,
    present: presentTable,
    future: persons(seed.future),
    imperative: seed.imperative ? imperatives(seed.imperative) : {},
  };
}

export const IRREGULAR_COUNT = IRREGULAR_SEEDS.length;
