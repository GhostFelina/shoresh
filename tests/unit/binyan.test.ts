/**
 * Çekim motorunun doğruluk kilidi.
 *
 * Buradaki beklenen biçimler ulpan dilbilgisi tablolarının standart
 * çekimleridir. Motor bir kuralı bozarsa test düşer — üretilen 2000
 * fiilin tamamı bu şablonlardan çıktığı için tek bir hata binlerce
 * yanlış biçim demektir. Bu yüzden kilit burada.
 */
import { describe, expect, it } from 'vitest';
import { conjugate } from '@/engine/binyan';
import { stripNiqqud } from '@/engine/niqqud';

/** Harekeli karşılaştırmada görünmez fark olmasın diye normalize eder. */
const norm = (s: string) => s.normalize('NFC');

describe("pa'al — כ־ת־ב (yazmak)", () => {
  const t = conjugate(['כ', 'ת', 'ב'], 'paal');

  it('mastar: לִכְתּוֹב', () => {
    expect(norm(t.infinitive.vocalized)).toBe(norm('לִכְתּוֹב'));
    expect(t.infinitive.plain).toBe('לכתוב');
  });

  it('geçmiş 3. tekil eril: כָּתַב', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('כָּתַב'));
    expect(t.past.hu!.plain).toBe('כתב');
  });

  it('geçmiş 1. tekil: כָּתַבְתִּי', () => {
    expect(norm(t.past.ani!.vocalized)).toBe(norm('כָּתַבְתִּי'));
    expect(t.past.ani!.plain).toBe('כתבתי');
  });

  it('geçmiş 3. tekil dişil: כָּתְבָה', () => {
    expect(norm(t.past.hi!.vocalized)).toBe(norm('כָּתְבָה'));
  });

  it('geçmiş 3. çoğul: כָּתְבוּ', () => {
    expect(norm(t.past.hem!.vocalized)).toBe(norm('כָּתְבוּ'));
  });

  it('şimdiki dört biçim: כּוֹתֵב / כּוֹתֶבֶת / כּוֹתְבִים / כּוֹתְבוֹת', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('כּוֹתֵב'));
    expect(norm(t.present.fs.vocalized)).toBe(norm('כּוֹתֶבֶת'));
    expect(norm(t.present.mp.vocalized)).toBe(norm('כּוֹתְבִים'));
    expect(norm(t.present.fp.vocalized)).toBe(norm('כּוֹתְבוֹת'));
    expect(t.present.ms.plain).toBe('כותב');
    expect(t.present.mp.plain).toBe('כותבים');
  });

  it('gelecek: אֶכְתּוֹב / תִּכְתּוֹב / יִכְתּוֹב / נִכְתּוֹב', () => {
    expect(norm(t.future.ani!.vocalized)).toBe(norm('אֶכְתּוֹב'));
    expect(norm(t.future.ata!.vocalized)).toBe(norm('תִּכְתּוֹב'));
    expect(norm(t.future.hu!.vocalized)).toBe(norm('יִכְתּוֹב'));
    expect(norm(t.future.anachnu!.vocalized)).toBe(norm('נִכְתּוֹב'));
  });

  it('gelecek sonekli: תִּכְתְּבִי / יִכְתְּבוּ', () => {
    expect(norm(t.future.at!.vocalized)).toBe(norm('תִּכְתְּבִי'));
    expect(norm(t.future.hem!.vocalized)).toBe(norm('יִכְתְּבוּ'));
    // Ön ekteki hirik harekesiz yazımda yod ALMAZ.
    expect(t.future.at!.plain).toBe('תכתבי');
  });

  it('emir: כְּתוֹב / כִּתְבִי / כִּתְבוּ', () => {
    expect(norm(t.imperative.ata!.vocalized)).toBe(norm('כְּתוֹב'));
    expect(norm(t.imperative.at!.vocalized)).toBe(norm('כִּתְבִי'));
    // Kapalı hecedeki hirik yod almaz: כתבי, כיתבי değil.
    expect(t.imperative.at!.plain).toBe('כתבי');
  });
});

describe("pa'al — ש־מ־ר (korumak): begadkefat olmayan orta harf dageş almaz", () => {
  const t = conjugate(['ש', 'מ', 'ר'], 'paal');

  it('mastar: לִשְׁמוֹר — מ dageşsiz', () => {
    expect(norm(t.infinitive.vocalized)).toBe(norm('לִשְׁמוֹר'));
    expect(t.infinitive.plain).toBe('לשמור');
  });

  it('şimdiki: שׁוֹמֵר', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('שׁוֹמֵר'));
    expect(t.present.ms.plain).toBe('שומר');
  });
});

describe("pi'el — ד־ב־ר (konuşmak)", () => {
  const t = conjugate(['ד', 'ב', 'ר'], 'piel');

  it('geçmiş 3. tekil eril: דִּבֵּר → דיבר', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('דִּבֵּר'));
    // Kök harfindeki hirik harekesiz yazımda yod alır.
    expect(t.past.hu!.plain).toBe('דיבר');
  });

  it('geçmiş 1. tekil: דִּבַּרְתִּי — tzere patah’a iner', () => {
    expect(norm(t.past.ani!.vocalized)).toBe(norm('דִּבַּרְתִּי'));
    expect(t.past.ani!.plain).toBe('דיברתי');
  });

  it('şimdiki: מְדַבֵּר / מְדַבֶּרֶת / מְדַבְּרִים', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('מְדַבֵּר'));
    expect(norm(t.present.fs.vocalized)).toBe(norm('מְדַבֶּרֶת'));
    expect(norm(t.present.mp.vocalized)).toBe(norm('מְדַבְּרִים'));
    expect(t.present.ms.plain).toBe('מדבר');
  });

  it('mastar: לְדַבֵּר', () => {
    expect(norm(t.infinitive.vocalized)).toBe(norm('לְדַבֵּר'));
    expect(t.infinitive.plain).toBe('לדבר');
  });

  it('gelecek: אֲדַבֵּר / יְדַבֵּר', () => {
    expect(norm(t.future.ani!.vocalized)).toBe(norm('אֲדַבֵּר'));
    expect(norm(t.future.hu!.vocalized)).toBe(norm('יְדַבֵּר'));
  });
});

describe("pi'el — ס־פ־ר (anlatmak): hirik yod kuralı", () => {
  const t = conjugate(['ס', 'פ', 'ר'], 'piel');

  it('סִפֵּר → סיפר', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('סִפֵּר'));
    expect(t.past.hu!.plain).toBe('סיפר');
  });
});

describe("hif'il — כ־ת־ב (yazdırmak)", () => {
  const t = conjugate(['כ', 'ת', 'ב'], 'hifil');

  it('geçmiş 3. tekil eril: הִכְתִּיב', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('הִכְתִּיב'));
    expect(t.past.hu!.plain).toBe('הכתיב');
  });

  it('geçmiş 1. tekil: הִכְתַּבְתִּי — yod düşer', () => {
    expect(norm(t.past.ani!.vocalized)).toBe(norm('הִכְתַּבְתִּי'));
  });

  it('şimdiki: מַכְתִּיב', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('מַכְתִּיב'));
    expect(t.present.ms.plain).toBe('מכתיב');
  });

  it('mastar: לְהַכְתִּיב', () => {
    expect(norm(t.infinitive.vocalized)).toBe(norm('לְהַכְתִּיב'));
  });

  it('gelecek: יַכְתִּיב', () => {
    expect(norm(t.future.hu!.vocalized)).toBe(norm('יַכְתִּיב'));
  });
});

describe("nif'al — כ־ת־ב (yazılmak)", () => {
  const t = conjugate(['כ', 'ת', 'ב'], 'nifal');

  it('geçmiş: נִכְתַּב', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('נִכְתַּב'));
    // Ön ekteki hirik yod almaz.
    expect(t.past.hu!.plain).toBe('נכתב');
  });

  it('şimdiki: נִכְתָּב', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('נִכְתָּב'));
  });

  it('gelecek: יִכָּתֵב', () => {
    expect(norm(t.future.hu!.vocalized)).toBe(norm('יִכָּתֵב'));
  });
});

describe("hitpa'el — ל־ב־ש (giyinmek)", () => {
  const t = conjugate(['ל', 'ב', 'ש'], 'hitpael');

  it('geçmiş: הִתְלַבֵּשׁ', () => {
    expect(norm(t.past.hu!.vocalized)).toBe(norm('הִתְלַבֵּשׁ'));
    expect(t.past.hu!.plain).toBe('התלבש');
  });

  it('şimdiki: מִתְלַבֵּשׁ / מִתְלַבֶּשֶׁת', () => {
    expect(norm(t.present.ms.vocalized)).toBe(norm('מִתְלַבֵּשׁ'));
    expect(norm(t.present.fs.vocalized)).toBe(norm('מִתְלַבֶּשֶׁת'));
  });

  it('mastar: לְהִתְלַבֵּשׁ', () => {
    expect(norm(t.infinitive.vocalized)).toBe(norm('לְהִתְלַבֵּשׁ'));
  });
});

describe("hitpa'el metatezi — ıslıklı kök harfi ת ile yer değiştirir", () => {
  it('ס־ד־ר → הִסְתַּדֵּר (הִתְסַדֵּר değil)', () => {
    const t = conjugate(['ס', 'ד', 'ר'], 'hitpael');
    expect(norm(t.past.hu!.vocalized)).toBe(norm('הִסְתַּדֵּר'));
    expect(t.past.hu!.plain).toBe('הסתדר');
  });

  it('ש־מ־ש → הִשְׁתַּמֵּשׁ', () => {
    const t = conjugate(['ש', 'מ', 'ש'], 'hitpael');
    expect(norm(t.past.hu!.vocalized)).toBe(norm('הִשְׁתַּמֵּשׁ'));
    expect(t.past.hu!.plain).toBe('השתמש');
  });

  it('ז־ק־ן → הִזְדַּקֵּן (ת → ד sesli uyumu)', () => {
    const t = conjugate(['ז', 'ק', 'ן'], 'hitpael');
    expect(t.past.hu!.plain).toBe('הזדקן');
  });

  it('şimdiki zamanda da metatez korunur: מִשְׁתַּמֵּשׁ', () => {
    const t = conjugate(['ש', 'מ', 'ש'], 'hitpael');
    expect(norm(t.present.ms.vocalized)).toBe(norm('מִשְׁתַּמֵּשׁ'));
  });
});

describe('sofit — kelime sonundaki harf biçim değiştirir', () => {
  it('ש־ל־ח geçmiş 2. tekil dişil: שָׁלַחְתְּ', () => {
    const t = conjugate(['ש', 'ל', 'ח'], 'paal');
    expect(t.past.at!.plain).toBe('שלחת');
  });

  it('כ־ת־ב mastarı sonda ב ile biter, sofit uygulanmaz', () => {
    const t = conjugate(['כ', 'ת', 'ב'], 'paal');
    expect(t.infinitive.plain.endsWith('ב')).toBe(true);
  });

  it('ש־כ־ן şimdiki eril: son נ sofit olur → שוכן', () => {
    const t = conjugate(['ש', 'כ', 'ן'], 'paal');
    expect(t.present.ms.plain.endsWith('ן')).toBe(true);
  });
});

describe('harekesizleştirme ve okunuş', () => {
  it('stripNiqqud bütün işaretleri siler', () => {
    expect(stripNiqqud('כָּתַבְתִּי')).toBe('כתבתי');
  });

  it('okunuş Türkçe ses değerleriyle üretilir', () => {
    const t = conjugate(['כ', 'ת', 'ב'], 'paal');
    expect(t.past.hu!.translit).toBe('katav');
    expect(t.present.ms.translit).toBe('kotev');
  });

  it('ש harfi ş olarak okunur', () => {
    const t = conjugate(['ש', 'מ', 'ר'], 'paal');
    expect(t.past.hu!.translit).toBe('şamar');
  });

  it('dageşli ב b, dageşsiz ב v okunur', () => {
    const t = conjugate(['כ', 'ת', 'ב'], 'paal');
    expect(t.past.hu!.translit.endsWith('v')).toBe(true);
  });
});

describe('motor sözleşmesi', () => {
  it('üç ya da dört harfli olmayan kök reddedilir', () => {
    expect(() => conjugate(['ק', 'ו'], 'paal')).toThrow(/üç ya da dört harfli/);
  });

  it('edilgen binyanlarda emir kipi üretilmez', () => {
    const t = conjugate(['ד', 'ב', 'ר'], 'pual');
    expect(Object.keys(t.imperative)).toHaveLength(0);
  });

  it('her etken binyan sekiz kişiyi de doldurur', () => {
    for (const b of ['paal', 'piel', 'hifil', 'hitpael', 'nifal'] as const) {
      const t = conjugate(['כ', 'ת', 'ב'], b);
      expect(Object.keys(t.past)).toHaveLength(8);
      expect(Object.keys(t.future)).toHaveLength(8);
    }
  });
});
