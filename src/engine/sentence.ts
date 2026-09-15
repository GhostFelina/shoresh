/**
 * Örnek cümle üreteci.
 *
 * TASARIM KARARI — neden üretiyoruz, elle yazmıyoruz:
 * 352 fiil × 5 zaman = 1760 örnek cümle. Elle yazılsa (a) bitmez,
 * (b) yazılanların doğruluğu tek tek denetlenemez, (c) bir çekim
 * kuralı düzeltilince cümleler eskide kalır. Üretilen cümle ise
 * ÇEKİM TABLOSUNUN KENDİSİNDEN doğar: tablo doğruysa cümle de doğrudur.
 *
 * NE ÜRETİYORUZ: şahıs zamiri + çekilmiş fiil. Bu, İbranicede tam ve
 * dilbilgisel olarak kusursuz bir cümledir — İbranicede şimdiki zamanda
 * "olmak" fiili yoktur, אֲנִי כּוֹתֵב tek başına "ben yazıyorum" demektir.
 *
 * NE ÜRETMİYORUZ: nesneli, bağlamlı, doğal cümleler ("Ona bir mektup
 * yazdım"). Onlar fiilin anlamını, aldığı edatı ve nesnesinin cinsiyetini
 * bilmeyi gerektirir; uydurulursa yanlış olur. O yüzden elle yazılan
 * örnekler `data/sentences.ts` içinde ayrı durur ve varsa ÖNCE o gösterilir.
 */
import {
  PERSON_LABEL,
  PRESENT_LABEL,
  type Conjugation,
  type HebrewForm,
  type HebrewVerb,
  type Person,
  type PresentSlot,
} from '@/types/hebrew';

export interface ExampleSentence {
  /** Harekeli İbranice cümle. */
  he: string;
  /** Harekesiz yazım — seslendirmeye bu gönderilir. */
  plain: string;
  /** Latin harfli okunuş. */
  translit: string;
  /** Türkçe karşılık. */
  tr: string;
  /** Hangi zaman/biçimden üretildi. */
  form: HebrewForm;
  /** Elle mi yazıldı, kalıptan mı üretildi? */
  source: 'written' | 'generated';
}

/** Şahıs zamirlerinin harekeli / harekesiz / okunuş biçimleri. */
const PRONOUN: Record<Person, { he: string; plain: string; translit: string }> = {
  ani: { he: 'אֲנִי', plain: 'אני', translit: 'ani' },
  ata: { he: 'אַתָּה', plain: 'אתה', translit: 'ata' },
  at: { he: 'אַתְּ', plain: 'את', translit: 'at' },
  hu: { he: 'הוּא', plain: 'הוא', translit: 'hu' },
  hi: { he: 'הִיא', plain: 'היא', translit: 'hi' },
  anachnu: { he: 'אֲנַחְנוּ', plain: 'אנחנו', translit: 'anahnu' },
  atem: { he: 'אַתֶּם', plain: 'אתם', translit: 'atem' },
  aten: { he: 'אַתֶּן', plain: 'אתן', translit: 'aten' },
  hem: { he: 'הֵם', plain: 'הם', translit: 'hem' },
};

/** Şimdiki zamanda kişi yerine cinsiyet+sayı çekimi var; uygun zamiri seçer. */
const PRESENT_PRONOUN: Record<PresentSlot, Person> = {
  ms: 'hu',
  fs: 'hi',
  mp: 'hem',
  fp: 'hem',
};

/** "istemek" fiilinin şimdiki zamanı — mastar örneğinde taşıyıcı olarak. */
const WANT: Record<PresentSlot, { he: string; plain: string; translit: string }> = {
  ms: { he: 'רוֹצֶה', plain: 'רוצה', translit: 'rotse' },
  fs: { he: 'רוֹצָה', plain: 'רוצה', translit: 'rotsa' },
  mp: { he: 'רוֹצִים', plain: 'רוצים', translit: 'rotsim' },
  fp: { he: 'רוֹצוֹת', plain: 'רוצות', translit: 'rotsot' },
};

/** Türkçe özne karşılıkları — cümlenin çevirisinde kullanılır. */
const TR_SUBJECT: Record<Person, string> = {
  ani: 'ben',
  ata: 'sen',
  at: 'sen',
  hu: 'o',
  hi: 'o',
  anachnu: 'biz',
  atem: 'siz',
  aten: 'siz',
  hem: 'onlar',
};

/**
 * Türkçe yüklem çekimi.
 *
 * İbranice cümlenin Türkçe karşılığı verilirken fiili mastar hâlinde
 * bırakmak ("ben yazmak") öğretici değil, yanıltıcıdır. Anlam alanındaki
 * ilk karşılık Türkçe kurallarına göre çekiliyor.
 */
function trConjugate(meaning: string, person: Person, form: HebrewForm): string {
  const stem = meaning.replace(/mak$|mek$/u, '');
  const thin = /[eiöü]$/u.test(stem) || /[eiöü][^aıou]*$/u.test(stem);

  // Kişi ekleri — kalın/ince ünlü uyumuna göre.
  const past: Record<Person, string> = thin
    ? { ani: 'dim', ata: 'din', at: 'din', hu: 'di', hi: 'di', anachnu: 'dik', atem: 'diniz', aten: 'diniz', hem: 'diler' }
    : { ani: 'dım', ata: 'dın', at: 'dın', hu: 'dı', hi: 'dı', anachnu: 'dık', atem: 'dınız', aten: 'dınız', hem: 'dılar' };
  const present: Record<Person, string> = thin
    ? { ani: 'iyorum', ata: 'iyorsun', at: 'iyorsun', hu: 'iyor', hi: 'iyor', anachnu: 'iyoruz', atem: 'iyorsunuz', aten: 'iyorsunuz', hem: 'iyorlar' }
    : { ani: 'ıyorum', ata: 'ıyorsun', at: 'ıyorsun', hu: 'ıyor', hi: 'ıyor', anachnu: 'ıyoruz', atem: 'ıyorsunuz', aten: 'ıyorsunuz', hem: 'ıyorlar' };
  const future: Record<Person, string> = thin
    ? { ani: 'eceğim', ata: 'eceksin', at: 'eceksin', hu: 'ecek', hi: 'ecek', anachnu: 'eceğiz', atem: 'eceksiniz', aten: 'eceksiniz', hem: 'ecekler' }
    : { ani: 'acağım', ata: 'acaksın', at: 'acaksın', hu: 'acak', hi: 'acak', anachnu: 'acağız', atem: 'acaksınız', aten: 'acaksınız', hem: 'acaklar' };

  if (form === 'past') return stem + past[person];
  if (form === 'present') return stem + present[person];
  if (form === 'future') return stem + future[person];
  return meaning;
}

/** Bir cümleyi üç yazımıyla birleştirir. */
function build(
  parts: Array<{ he: string; plain: string; translit: string }>,
  tr: string,
  form: HebrewForm,
): ExampleSentence {
  return {
    he: parts.map((p) => p.he).join(' '),
    plain: parts.map((p) => p.plain).join(' '),
    translit: parts.map((p) => p.translit).join(' '),
    tr,
    form,
    source: 'generated',
  };
}

const asPart = (c: Conjugation) => ({
  he: c.vocalized,
  plain: c.plain,
  translit: c.translit,
});

/**
 * Bir fiil için belirtilen biçimde örnek cümle üretir.
 * Tabloda o biçim yoksa (edilgen binyanda emir gibi) null döner.
 */
export function generateSentence(
  verb: HebrewVerb,
  form: HebrewForm,
  opts: { person?: Person; slot?: PresentSlot } = {},
): ExampleSentence | null {
  const meaning = verb.tr[0] ?? '';
  const t = verb.table;

  if (form === 'present') {
    const slot = opts.slot ?? 'ms';
    const c = t.present[slot];
    if (!c) return null;
    const person = PRESENT_PRONOUN[slot];
    const subject = slot === 'fp' ? PRONOUN.hem : PRONOUN[person];
    const trSubject = slot === 'fs' || slot === 'fp' ? TR_SUBJECT[person] : TR_SUBJECT[person];
    return build(
      [subject, asPart(c)],
      `${trSubject} ${trConjugate(meaning, person, 'present')}`,
      form,
    );
  }

  if (form === 'past' || form === 'future') {
    const person = opts.person ?? 'ani';
    const c = (form === 'past' ? t.past : t.future)[person];
    if (!c) return null;
    return build(
      [PRONOUN[person], asPart(c)],
      `${TR_SUBJECT[person]} ${trConjugate(meaning, person, form)}`,
      form,
    );
  }

  if (form === 'infinitive') {
    const slot = opts.slot ?? 'ms';
    const c = t.infinitive;
    if (!c) return null;
    const person = PRESENT_PRONOUN[slot];
    return build(
      [PRONOUN[person === 'hem' ? 'hem' : person], WANT[slot], asPart(c)],
      `${TR_SUBJECT[person]} ${meaning} istiyor`,
      form,
    );
  }

  // Emir kipi — zamir kullanılmaz, doğrudan seslenilir.
  const c = t.imperative[opts.person === 'at' ? 'at' : 'ata'];
  if (!c) return null;
  return build([asPart(c)], `${meaning.replace(/mak$|mek$/u, '')}!`, form);
}

/**
 * Bir fiilin bütün biçimleri için örnek cümle seti.
 * Öğrenci "bu fiili cümlede nasıl kullanırım" sorusunun karşılığını
 * tek bakışta görsün diye her zaman aynı sırada döner.
 */
export function sentenceSet(verb: HebrewVerb): ExampleSentence[] {
  const out: ExampleSentence[] = [];
  const plan: Array<[HebrewForm, { person?: Person; slot?: PresentSlot }]> = [
    ['present', { slot: 'ms' }],
    ['present', { slot: 'fs' }],
    ['past', { person: 'ani' }],
    ['past', { person: 'hu' }],
    ['future', { person: 'ani' }],
    ['future', { person: 'hem' }],
    ['infinitive', { slot: 'ms' }],
    ['imperative', { person: 'ata' }],
  ];
  for (const [form, opts] of plan) {
    const s = generateSentence(verb, form, opts);
    if (s) out.push(s);
  }
  return out;
}

/** Kişi etiketini insan diliyle verir — cümlenin altındaki açıklama. */
export function personCaption(form: HebrewForm, person?: Person, slot?: PresentSlot): string {
  if (form === 'present' && slot) return PRESENT_LABEL[slot].tr;
  if (person) return PERSON_LABEL[person].tr;
  return '';
}
