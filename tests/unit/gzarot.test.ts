/**
 * Zayıf kök şablonlarının doğruluk kilidi.
 *
 * Bu ailelerdeki hatalar shlemim hatalarından daha tehlikeli: İbranicenin
 * EN SIK fiilleri (קנה, קם, אכל, שמע, ישב) buraya düşüyor. Bir kural
 * yanlışsa öğrenci en çok kullandığı fiili yanlış öğrenir.
 *
 * Beklenen biçimler standart ulpan çekim tablolarıdır.
 */
import { describe, expect, it } from 'vitest';
import { conjugate, isSupported } from '@/engine/binyan';

const norm = (s: string) => s.normalize('NFC');
const V = (s: string) => norm(s);

describe("ל״ה pa'al — ק־נ־ה (satın almak)", () => {
  const t = conjugate(['ק', 'נ', 'ה'], 'paal', 'lamed-hey');

  it('mastar ת ile biter: לִקְנוֹת', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לִקְנוֹת'));
    expect(t.infinitive.plain).toBe('לקנות');
  });

  it('geçmiş: קָנָה / קָנְתָה / קָנִיתִי / קָנוּ', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('קָנָה'));
    expect(V(t.past.hi!.vocalized)).toBe(V('קָנְתָה'));
    expect(V(t.past.ani!.vocalized)).toBe(V('קָנִיתִי'));
    expect(V(t.past.hem!.vocalized)).toBe(V('קָנוּ'));
    expect(t.past.ani!.plain).toBe('קניתי');
  });

  it('şimdiki: קוֹנֶה / קוֹנָה / קוֹנִים / קוֹנוֹת — ה eklerde düşer', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('קוֹנֶה'));
    expect(V(t.present.fs!.vocalized)).toBe(V('קוֹנָה'));
    expect(V(t.present.mp!.vocalized)).toBe(V('קוֹנִים'));
    expect(V(t.present.fp!.vocalized)).toBe(V('קוֹנוֹת'));
    expect(t.present.mp!.plain).toBe('קונים');
  });

  it('gelecek: יִקְנֶה / תִּקְנִי / יִקְנוּ', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יִקְנֶה'));
    expect(V(t.future.at!.vocalized)).toBe(V('תִּקְנִי'));
    expect(V(t.future.hem!.vocalized)).toBe(V('יִקְנוּ'));
  });

  it('emir: קְנֵה / קְנִי / קְנוּ', () => {
    expect(V(t.imperative.ata!.vocalized)).toBe(V('קְנֵה'));
    expect(V(t.imperative.at!.vocalized)).toBe(V('קְנִי'));
    expect(V(t.imperative.atem!.vocalized)).toBe(V('קְנוּ'));
  });
});

describe("ל״ה pa'al — ר־צ־ה (istemek), ש־ת־ה (içmek)", () => {
  it('רָצָה / רוֹצֶה / רוֹצִים', () => {
    const t = conjugate(['ר', 'צ', 'ה'], 'paal', 'lamed-hey');
    expect(V(t.past.hu!.vocalized)).toBe(V('רָצָה'));
    expect(V(t.present.ms!.vocalized)).toBe(V('רוֹצֶה'));
    expect(t.present.mp!.plain).toBe('רוצים');
  });

  it('ש־ת־ה mastarı dageşli: לִשְׁתּוֹת', () => {
    const t = conjugate(['ש', 'ת', 'ה'], 'paal', 'lamed-hey');
    expect(V(t.infinitive.vocalized)).toBe(V('לִשְׁתּוֹת'));
    expect(t.present.ms!.plain).toBe('שותה');
  });
});

describe("ע״ו pa'al — ק־ו־ם (kalkmak)", () => {
  const t = conjugate(['ק', 'ו', 'ם'], 'paal', 'ayin-vav');

  it('mastar: לָקוּם', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לָקוּם'));
    expect(t.infinitive.plain).toBe('לקום');
  });

  it('geçmiş: קָם / קָמָה / קַמְתִּי / קָמוּ', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('קָם'));
    expect(V(t.past.hi!.vocalized)).toBe(V('קָמָה'));
    expect(V(t.past.ani!.vocalized)).toBe(V('קַמְתִּי'));
    expect(V(t.past.hem!.vocalized)).toBe(V('קָמוּ'));
  });

  it('şimdiki: קָם / קָמָה / קָמִים / קָמוֹת', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('קָם'));
    expect(V(t.present.mp!.vocalized)).toBe(V('קָמִים'));
    expect(V(t.present.fp!.vocalized)).toBe(V('קָמוֹת'));
  });

  it('3. tekil eril geçmiş ile şimdiki AYNI yazılır — bu gizranın imzası', () => {
    expect(t.past.hu!.vocalized).toBe(t.present.ms!.vocalized);
  });

  it('gelecek: יָקוּם / תָּקוּמִי', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יָקוּם'));
    expect(V(t.future.at!.vocalized)).toBe(V('תָּקוּמִי'));
  });

  it('emir: קוּם / קוּמִי / קוּמוּ', () => {
    expect(V(t.imperative.ata!.vocalized)).toBe(V('קוּם'));
    expect(V(t.imperative.atem!.vocalized)).toBe(V('קוּמוּ'));
  });
});

describe("ע״י pa'al — ש־י־ר (şarkı söylemek)", () => {
  const t = conjugate(['ש', 'י', 'ר'], 'paal', 'ayin-vav');

  it('orta harf י ise ünlü hirik male olur: לָשִׁיר / שָׁר / יָשִׁיר', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לָשִׁיר'));
    expect(V(t.past.hu!.vocalized)).toBe(V('שָׁר'));
    expect(V(t.future.hu!.vocalized)).toBe(V('יָשִׁיר'));
    expect(t.infinitive.plain).toBe('לשיר');
  });
});

describe("פ״נ pa'al — נ־פ־ל (düşmek)", () => {
  const t = conjugate(['נ', 'פ', 'ל'], 'paal', 'pe-nun');

  it('geçmiş ve şimdiki normal: נָפַל / נוֹפֵל', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('נָפַל'));
    expect(V(t.present.ms!.vocalized)).toBe(V('נוֹפֵל'));
  });

  it('gelecekte נ DÜŞER, פ dageş alır: יִפּוֹל (יִנְפּוֹל değil)', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יִפּוֹל'));
    expect(t.future.hu!.plain).toBe('יפול');
    expect(t.future.hu!.plain).not.toContain('נ');
  });

  it('mastarda נ kalır: לִנְפּוֹל', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לִנְפּוֹל'));
  });
});

describe("פ״י pa'al — י־ש־ב (oturmak)", () => {
  const t = conjugate(['י', 'ש', 'ב'], 'paal', 'pe-yod');

  it('mastarda י düşer ve ת gelir: לָשֶׁבֶת', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לָשֶׁבֶת'));
    expect(t.infinitive.plain).toBe('לשבת');
  });

  it('geçmiş normal: יָשַׁב / יָשַׁבְתִּי', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('יָשַׁב'));
    expect(V(t.past.ani!.vocalized)).toBe(V('יָשַׁבְתִּי'));
  });

  it('şimdiki: יוֹשֵׁב', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('יוֹשֵׁב'));
    expect(t.present.ms!.plain).toBe('יושב');
  });

  it('gelecekte י düşer, ön ek tzere alır: יֵשֵׁב', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יֵשֵׁב'));
    expect(V(t.future.ani!.vocalized)).toBe(V('אֵשֵׁב'));
  });

  it('emir: שֵׁב / שְׁבִי', () => {
    expect(V(t.imperative.ata!.vocalized)).toBe(V('שֵׁב'));
    expect(V(t.imperative.at!.vocalized)).toBe(V('שְׁבִי'));
  });
});

describe("פ״א pa'al — א־כ־ל (yemek)", () => {
  const t = conjugate(['א', 'כ', 'ל'], 'paal', 'pe-alef');

  it('geçmiş: אָכַל / אָכַלְתִּי', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('אָכַל'));
    expect(V(t.past.ani!.vocalized)).toBe(V('אָכַלְתִּי'));
  });

  it('şimdiki: אוֹכֵל / אוֹכֶלֶת', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('אוֹכֵל'));
    expect(V(t.present.fs!.vocalized)).toBe(V('אוֹכֶלֶת'));
    expect(t.present.ms!.plain).toBe('אוכל');
  });

  it('gelecekte א ön ekle kaynaşır: יֹאכַל → יאכל (יואכל DEĞİL)', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יֹאכַל'));
    expect(t.future.hu!.plain).toBe('יאכל');
  });

  it('1. tekilde tek א kalır: אוֹכַל → אוכל', () => {
    expect(V(t.future.ani!.vocalized)).toBe(V('אוֹכַל'));
    expect(t.future.ani!.plain).toBe('אוכל');
  });

  it('mastar: לֶאֱכוֹל', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לֶאֱכוֹל'));
    expect(t.infinitive.plain).toBe('לאכול');
  });
});

describe("ל״א pa'al — מ־צ־א (bulmak)", () => {
  const t = conjugate(['מ', 'צ', 'א'], 'paal', 'lamed-alef');

  it('geçmiş: מָצָא / מָצָאתִי / מָצְאָה', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('מָצָא'));
    expect(V(t.past.ani!.vocalized)).toBe(V('מָצָאתִי'));
    expect(V(t.past.hi!.vocalized)).toBe(V('מָצְאָה'));
  });

  it('şimdiki: מוֹצֵא / מוֹצֵאת / מוֹצְאִים', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('מוֹצֵא'));
    expect(V(t.present.fs!.vocalized)).toBe(V('מוֹצֵאת'));
    expect(V(t.present.mp!.vocalized)).toBe(V('מוֹצְאִים'));
  });

  it('gelecek: יִמְצָא', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יִמְצָא'));
  });

  it('mastar: לִמְצוֹא', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לִמְצוֹא'));
    expect(t.infinitive.plain).toBe('למצוא');
  });
});

describe("ל״גרונית pa'al — ש־מ־ע (duymak)", () => {
  const t = conjugate(['ש', 'מ', 'ע'], 'paal', 'lamed-guttural');

  it('şimdiki erilde kaçak patah: שׁוֹמֵעַ', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('שׁוֹמֵעַ'));
    expect(t.present.ms!.plain).toBe('שומע');
  });

  it('şimdiki dişil: שׁוֹמַעַת', () => {
    expect(V(t.present.fs!.vocalized)).toBe(V('שׁוֹמַעַת'));
  });

  it('geçmiş: שָׁמַע / שָׁמַעְתִּי', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('שָׁמַע'));
    expect(V(t.past.ani!.vocalized)).toBe(V('שָׁמַעְתִּי'));
  });

  it('gelecekte kök ünlüsü patah: יִשְׁמַע', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יִשְׁמַע'));
  });

  it('mastar: לִשְׁמוֹעַ', () => {
    expect(V(t.infinitive.vocalized)).toBe(V('לִשְׁמוֹעַ'));
    expect(t.infinitive.plain).toBe('לשמוע');
  });
});

describe("פ״גרונית pa'al — ע־ב־ד (çalışmak), ח־ש־ב (düşünmek)", () => {
  it('ע kökü hatef patah alır: לַעֲבוֹד / יַעֲבוֹד', () => {
    const t = conjugate(['ע', 'ב', 'ד'], 'paal', 'pe-guttural');
    expect(V(t.infinitive.vocalized)).toBe(V('לַעֲבוֹד'));
    expect(V(t.future.hu!.vocalized)).toBe(V('יַעֲבוֹד'));
    expect(V(t.past.hu!.vocalized)).toBe(V('עָבַד'));
    expect(V(t.present.ms!.vocalized)).toBe(V('עוֹבֵד'));
    expect(t.infinitive.plain).toBe('לעבוד');
  });

  it('ח kökü sessiz şva alır: לַחְשׁוֹב / יַחְשׁוֹב', () => {
    const t = conjugate(['ח', 'ש', 'ב'], 'paal', 'pe-guttural');
    expect(V(t.infinitive.vocalized)).toBe(V('לַחְשׁוֹב'));
    expect(V(t.future.hu!.vocalized)).toBe(V('יַחְשׁוֹב'));
    expect(V(t.present.ms!.vocalized)).toBe(V('חוֹשֵׁב'));
  });
});

describe("ע״גרונית pa'al — ש־א־ל (sormak)", () => {
  const t = conjugate(['ש', 'א', 'ל'], 'paal', 'ayin-guttural');

  it('geçmiş: שָׁאַל', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('שָׁאַל'));
  });

  it('şimdiki: שׁוֹאֵל', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('שׁוֹאֵל'));
    expect(t.present.ms!.plain).toBe('שואל');
  });

  it('gelecekte kök ünlüsü patah: יִשְׁאַל', () => {
    expect(V(t.future.hu!.vocalized)).toBe(V('יִשְׁאַל'));
  });
});

describe("ל״ה pi'el — נ־ס־ה (denemek), ח־כ־ה (beklemek)", () => {
  it('נִסָּה / מְנַסֶּה / לְנַסּוֹת', () => {
    const t = conjugate(['נ', 'ס', 'ה'], 'piel', 'lamed-hey');
    expect(V(t.past.hu!.vocalized)).toBe(V('נִסָּה'));
    expect(V(t.present.ms!.vocalized)).toBe(V('מְנַסֶּה'));
    expect(V(t.infinitive.vocalized)).toBe(V('לְנַסּוֹת'));
    expect(t.past.hu!.plain).toBe('ניסה');
  });

  it('ח־כ־ה → חִכָּה / מְחַכֶּה', () => {
    const t = conjugate(['ח', 'כ', 'ה'], 'piel', 'lamed-hey');
    expect(V(t.past.hu!.vocalized)).toBe(V('חִכָּה'));
    expect(V(t.present.ms!.vocalized)).toBe(V('מְחַכֶּה'));
    expect(t.past.hu!.plain).toBe('חיכה');
  });
});

describe('motor sözleşmesi — desteklenmeyen birleşim reddedilir', () => {
  it('desteklenen birleşimler bildirilir', () => {
    expect(isSupported('paal', 'lamed-hey')).toBe(true);
    expect(isSupported('paal', 'shlemim')).toBe(true);
  });

  it('şablonu olmayan birleşim hata fırlatır, uydurma çekim üretmez', () => {
    expect(isSupported('pual', 'ayin-vav')).toBe(false);
    expect(() => conjugate(['ק', 'ו', 'ם'], 'pual', 'ayin-vav')).toThrow(/şablon yok/);
  });

  it('her zayıf şablon sekiz kişiyi de doldurur', () => {
    const cases: Array<[string[], 'paal' | 'piel', Parameters<typeof conjugate>[2]]> = [
      [['ק', 'נ', 'ה'], 'paal', 'lamed-hey'],
      [['ק', 'ו', 'ם'], 'paal', 'ayin-vav'],
      [['י', 'ש', 'ב'], 'paal', 'pe-yod'],
      [['ש', 'מ', 'ע'], 'paal', 'lamed-guttural'],
      [['נ', 'ס', 'ה'], 'piel', 'lamed-hey'],
    ];
    for (const [root, binyan, gizra] of cases) {
      const t = conjugate(root, binyan, gizra);
      expect(Object.keys(t.past)).toHaveLength(8);
      expect(Object.keys(t.future)).toHaveLength(8);
    }
  });
});

describe("ל״ה hitpa'el metatezi — ש־נ־ה (değişmek)", () => {
  const t = conjugate(['ש', 'נ', 'ה'], 'hitpael', 'lamed-hey');

  it('הִשְׁתַּנָּה üretir, הִתְשַׁנָּה değil', () => {
    expect(V(t.past.hu!.vocalized)).toBe(V('הִשְׁתַּנָּה'));
    expect(t.past.hu!.plain).toBe('השתנה');
  });

  it('şimdiki zamanda da metatez korunur: מִשְׁתַּנֶּה', () => {
    expect(V(t.present.ms!.vocalized)).toBe(V('מִשְׁתַּנֶּה'));
  });

  it('metatez gerektirmeyen kök normal kalır: הִתְנַסָּה', () => {
    const n = conjugate(['נ', 'ס', 'ה'], 'hitpael', 'lamed-hey');
    expect(V(n.past.hu!.vocalized)).toBe(V('הִתְנַסָּה'));
  });
});
