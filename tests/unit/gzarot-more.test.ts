/**
 * İkinci parti gizra şablonları — biçim biçim doğrulama.
 *
 * NEDEN BU KADAR AYRINTILI: Bir şablonun "çalışması" hata fırlatmaması
 * değildir. Yanlış hareke koyan bir şablon da sessizce çalışır ve
 * öğrenciye var olmayan bir kelime öğretir. Bu yüzden her sınıf için
 * mastar, geçmiş (üç kalıp), şimdiki (dört hâl), gelecek ve emir tek tek
 * beklenen biçimle karşılaştırılıyor.
 *
 * Beklenen biçimler ulpan çekim tablolarındaki standart Modern İbranice
 * yazımıdır; tahminle değil, bilinen fiillerle yazıldı.
 */
import { describe, expect, it } from 'vitest';
import { conjugate } from '@/engine/binyan';
import { detectGizra } from '@/engine/detect-gizra';

const split = (root: string): string[] => [...root];

/**
 * Harekeli biçimleri KANONİK sırada karşılaştırır.
 *
 * İbranice birleşen işaretlerin kod noktası sırası serbesttir: בֵּ ile
 * בֵּ ekranda aynı harftir ama farklı dizilerdir. NFC ikisini de aynı
 * kanonik sıraya indirir; testin gördüğü şey artık yazım, dizilim değil.
 */
const n = (x: string | undefined): string => (x ?? '').normalize('NFC');

describe('gizra tespiti — ayin-resh ayrı sınıf', () => {
  it('pi’el ailesinde orta ר/א kendi sınıfına düşer', () => {
    expect(detectGizra(split('ברך'), 'piel')).toBe('ayin-resh');
    expect(detectGizra(split('קרב'), 'hitpael')).toBe('ayin-resh');
    expect(detectGizra(split('תאר'), 'piel')).toBe('ayin-resh');
  });

  it('orta ח/ע hâlâ ayin-guttural — uzama yok, karıştırılmamalı', () => {
    expect(detectGizra(split('שחק'), 'piel')).toBe('ayin-guttural');
    expect(detectGizra(split('רחץ'), 'hitpael')).toBe('ayin-guttural');
  });

  it('pa’al’da orta ר bir zayıflık değildir', () => {
    expect(detectGizra(split('ברח'), 'paal')).toBe('lamed-guttural');
    expect(detectGizra(split('סרק'), 'paal')).toBe('shlemim');
  });
});

describe('nif’al + ל״גרונית — ש־מ־ע', () => {
  const t = conjugate(split('שמע'), 'nifal', 'lamed-guttural');

  it('mastarda tzere değil patah gelir', () => {
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהִשָּׁמַע'));
  });

  it('geçmiş üç kalıpta da doğru', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('נִשְׁמַע'));
    expect(n(t.past.hi?.vocalized)).toBe(n('נִשְׁמְעָה'));
    expect(n(t.past.ani?.vocalized)).toBe(n('נִשְׁמַעְתִּי'));
  });

  it('dişil tekilde segol değil iki patah', () => {
    expect(n(t.present.ms?.vocalized)).toBe(n('נִשְׁמָע'));
    expect(n(t.present.fs?.vocalized)).toBe(n('נִשְׁמַעַת'));
    expect(n(t.present.mp?.vocalized)).toBe(n('נִשְׁמָעִים'));
  });

  it('gelecek ve emir', () => {
    expect(n(t.future.hu?.vocalized)).toBe(n('יִשָּׁמַע'));
    expect(n(t.future.at?.vocalized)).toBe(n('תִּשָּׁמְעִי'));
    expect(n(t.imperative?.ata?.vocalized)).toBe(n('הִשָּׁמַע'));
  });
});

describe('nif’al + פ״גרונית — ע־צ־ר ve ח־ת־ם', () => {
  const atsar = conjugate(split('עצר'), 'nifal', 'pe-guttural');
  const hatam = conjugate(split('חתם'), 'nifal', 'pe-guttural');

  it('ע hatef segol alır, ח şva', () => {
    expect(n(atsar.past.hu?.vocalized)).toBe(n('נֶעֱצַר'));
    expect(n(hatam.past.hu?.vocalized)).toBe(n('נֶחְתַּם'));
  });

  it('hatef, şvadan önce tam ünlüye açılır', () => {
    expect(n(atsar.past.hi?.vocalized)).toBe(n('נֶעֶצְרָה'));
    expect(n(atsar.past.hem?.vocalized)).toBe(n('נֶעֶצְרוּ'));
  });

  it('ekli geçmişte hatef korunur', () => {
    expect(n(atsar.past.ani?.vocalized)).toBe(n('נֶעֱצַרְתִּי'));
  });

  it('şimdiki zaman', () => {
    expect(n(atsar.present.ms?.vocalized)).toBe(n('נֶעֱצָר'));
    expect(n(atsar.present.mp?.vocalized)).toBe(n('נֶעֱצָרִים'));
  });

  it('gelecekte dageş yerine ön ek tzere ile uzar', () => {
    expect(n(atsar.future.hu?.vocalized)).toBe(n('יֵעָצֵר'));
    expect(n(atsar.future.at?.vocalized)).toBe(n('תֵּעָצְרִי'));
    expect(n(atsar.infinitive?.vocalized)).toBe(n('לְהֵעָצֵר'));
  });
});

describe('nif’al + ל״א — מ־צ־א', () => {
  const t = conjugate(split('מצא'), 'nifal', 'lamed-alef');

  it('א sessiz: geçmişte kamatz, ekten önce tzere', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('נִמְצָא'));
    expect(n(t.past.hi?.vocalized)).toBe(n('נִמְצְאָה'));
    expect(n(t.past.ani?.vocalized)).toBe(n('נִמְצֵאתִי'));
    expect(n(t.past.anachnu?.vocalized)).toBe(n('נִמְצֵאנוּ'));
  });

  it('şimdiki zaman — dişil tekil ת ile biter ama tzere taşır', () => {
    expect(n(t.present.ms?.vocalized)).toBe(n('נִמְצָא'));
    expect(n(t.present.fs?.vocalized)).toBe(n('נִמְצֵאת'));
    expect(n(t.present.mp?.vocalized)).toBe(n('נִמְצָאִים'));
  });

  it('gelecek ve mastar', () => {
    expect(n(t.future.hu?.vocalized)).toBe(n('יִמָּצֵא'));
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהִמָּצֵא'));
  });
});

describe('hif’il + פ״א — א־מ־ן', () => {
  const t = conjugate(split('אמן'), 'hifil', 'pe-alef');

  it('ön ek segol, א hatef taşır', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('הֶאֱמִין'));
    expect(n(t.past.hi?.vocalized)).toBe(n('הֶאֱמִינָה'));
    expect(n(t.past.ani?.vocalized)).toBe(n('הֶאֱמַנְתִּי'));
  });

  it('şimdiki ve gelecekte patah + hatef patah', () => {
    expect(n(t.present.ms?.vocalized)).toBe(n('מַאֲמִין'));
    expect(n(t.present.fs?.vocalized)).toBe(n('מַאֲמִינָה'));
    expect(n(t.future.hu?.vocalized)).toBe(n('יַאֲמִין'));
    expect(n(t.future.ani?.vocalized)).toBe(n('אַאֲמִין'));
  });

  it('mastar ve emir', () => {
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהַאֲמִין'));
    expect(n(t.imperative?.ata?.vocalized)).toBe(n('הַאֲמֵן'));
  });
});

describe('hif’il + ל״א — מ־צ־א', () => {
  const t = conjugate(split('מצא'), 'hifil', 'lamed-alef');

  it('yalnız ekli geçmiş ayrışır: patah değil tzere, dageşsiz ek', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('הִמְצִיא'));
    expect(n(t.past.ani?.vocalized)).toBe(n('הִמְצֵאתִי'));
    expect(n(t.past.atem?.vocalized)).toBe(n('הִמְצֵאתֶם'));
  });

  it('kalan biçimler tam kök gibi', () => {
    expect(n(t.present.ms?.vocalized)).toBe(n('מַמְצִיא'));
    expect(n(t.present.fs?.vocalized)).toBe(n('מַמְצִיאָה'));
    expect(n(t.future.hu?.vocalized)).toBe(n('יַמְצִיא'));
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהַמְצִיא'));
  });
});

describe('hitpa’el + ל״גרונית — ק־ל־ח', () => {
  const t = conjugate(split('קלח'), 'hitpael', 'lamed-guttural');

  it('son gırtlaksı patah genuva alır', () => {
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהִתְקַלֵּחַ'));
    expect(n(t.past.hu?.vocalized)).toBe(n('הִתְקַלֵּחַ'));
    expect(n(t.present.ms?.vocalized)).toBe(n('מִתְקַלֵּחַ'));
    expect(n(t.future.hu?.vocalized)).toBe(n('יִתְקַלֵּחַ'));
  });

  it('dişil tekilde segol değil patah', () => {
    expect(n(t.present.fs?.vocalized)).toBe(n('מִתְקַלַּחַת'));
  });

  it('ünlü düşen biçimlerde genuva yok', () => {
    expect(n(t.past.hi?.vocalized)).toBe(n('הִתְקַלְּחָה'));
    expect(n(t.past.ani?.vocalized)).toBe(n('הִתְקַלַּחְתִּי'));
    expect(n(t.present.mp?.vocalized)).toBe(n('מִתְקַלְּחִים'));
  });
});

describe('ע״ר pi’el — ב־ר־ך', () => {
  const t = conjugate(split('ברך'), 'piel', 'ayin-resh');

  it('hirik tzereye, patah kamatza uzar', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('בֵּרֵךְ'));
    expect(n(t.infinitive?.vocalized)).toBe(n('לְבָרֵךְ'));
    expect(n(t.present.ms?.vocalized)).toBe(n('מְבָרֵךְ'));
    expect(n(t.future.hu?.vocalized)).toBe(n('יְבָרֵךְ'));
  });

  it('geçmişin kalan kalıpları', () => {
    expect(n(t.past.hi?.vocalized)).toBe(n('בֵּרְכָה'));
    expect(n(t.past.ani?.vocalized)).toBe(n('בֵּרַכְתִּי'));
  });

  it('şimdiki zamanın dört hâli', () => {
    expect(n(t.present.fs?.vocalized)).toBe(n('מְבָרֶכֶת'));
    expect(n(t.present.mp?.vocalized)).toBe(n('מְבָרְכִים'));
    expect(n(t.present.fp?.vocalized)).toBe(n('מְבָרְכוֹת'));
  });
});

describe('ע״ר hitpa’el — ק־ר־ב ve metatezli צ־ר־ף', () => {
  const karev = conjugate(split('קרב'), 'hitpael', 'ayin-resh');
  const tsaref = conjugate(split('צרף'), 'hitpael', 'ayin-resh');

  it('metatezsiz kök', () => {
    expect(n(karev.infinitive?.vocalized)).toBe(n('לְהִתְקָרֵב'));
    expect(n(karev.past.hu?.vocalized)).toBe(n('הִתְקָרֵב'));
    expect(n(karev.present.ms?.vocalized)).toBe(n('מִתְקָרֵב'));
    expect(n(karev.future.hu?.vocalized)).toBe(n('יִתְקָרֵב'));
  });

  it('ıslıklı ilk harf ת ile yer değiştirir ve צ→ט olur', () => {
    expect(n(tsaref.infinitive?.vocalized)).toBe(n('לְהִצְטָרֵף'));
    expect(n(tsaref.past.hu?.vocalized)).toBe(n('הִצְטָרֵף'));
    expect(n(tsaref.present.ms?.vocalized)).toBe(n('מִצְטָרֵף'));
    expect(n(tsaref.future.hu?.vocalized)).toBe(n('יִצְטָרֵף'));
  });

  it('ekli ve ünlü düşen biçimler', () => {
    expect(n(karev.past.ani?.vocalized)).toBe(n('הִתְקָרַבְתִּי'));
    expect(n(karev.past.hi?.vocalized)).toBe(n('הִתְקָרְבָה'));
    expect(n(karev.present.fs?.vocalized)).toBe(n('מִתְקָרֶבֶת'));
    expect(n(karev.present.mp?.vocalized)).toBe(n('מִתְקָרְבִים'));
  });
});

describe('hif’il + ע״גרונית tam kök şablonuyla çekilir', () => {
  const t = conjugate(split('טען'), 'hifil', 'ayin-guttural');

  it('orta gırtlaksı hirik male taşıyabildiği için kalıp bozulmaz', () => {
    expect(n(t.past.hu?.vocalized)).toBe(n('הִטְעִין'));
    expect(n(t.past.ani?.vocalized)).toBe(n('הִטְעַנְתִּי'));
    expect(n(t.present.ms?.vocalized)).toBe(n('מַטְעִין'));
    expect(n(t.future.hu?.vocalized)).toBe(n('יַטְעִין'));
    expect(n(t.infinitive?.vocalized)).toBe(n('לְהַטְעִין'));
  });
});
