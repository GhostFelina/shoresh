/**
 * Katalogun bütünlük kilidi.
 *
 * Veri hatası uygulamada "bir şeyler tuhaf" diye değil, burada kırmızı
 * testle görünmeli. `CATALOG_ISSUES` boş DEĞİLSE bir satır reddedilmiş
 * demektir; sebebi test çıktısında yazılı olur.
 */
import { describe, expect, it } from 'vitest';
import { CATALOG_ISSUES, CATALOG_STATS, VERBS, siblingsOf } from '@/data/catalog';
import { conjugate } from '@/engine/binyan';
import { WRITTEN_SENTENCES } from '@/data/sentences';

describe('katalog bütünlüğü', () => {
  it('hiçbir satır reddedilmez', () => {
    const report = CATALOG_ISSUES.map((i) => `${i.line} → ${i.reason}`).join('\n');
    expect(CATALOG_ISSUES.length, `Reddedilen satırlar:\n${report}`).toBe(0);
  });

  it('her fiilin kimliği tekildir', () => {
    expect(new Set(VERBS.map((v) => v.id)).size).toBe(VERBS.length);
  });

  it('her fiilin sözlük biçimi ve Türkçe anlamı doludur', () => {
    for (const v of VERBS) {
      expect(v.lemma.vocalized.length, v.id).toBeGreaterThan(0);
      expect(v.lemma.plain.length, v.id).toBeGreaterThan(0);
      expect(v.lemma.translit.length, v.id).toBeGreaterThan(0);
      expect(v.tr.length, v.id).toBeGreaterThan(0);
    }
  });

  it('harekesiz yazımda hiç hareke kalmaz', () => {
    const MARKS = /[\u05B0-\u05BC\u05C1\u05C2]/;
    for (const v of VERBS) {
      expect(MARKS.test(v.lemma.plain), `${v.id} → ${v.lemma.plain}`).toBe(false);
    }
  });

  it('her fiil sekiz kişilik geçmiş zaman üretir', () => {
    for (const v of VERBS) {
      expect(Object.keys(v.table.past).length, v.id).toBe(8);
    }
  });

  it('şimdiki zaman ya dört biçim taşır ya da hiç yoktur', () => {
    /*
     * "Hiç yok" tek bir fiil için geçerli ve KASITLI: הָיָה ("olmak")
     * modern İvritte şimdiki zamanda kullanılmaz — "ben öğrenciyim"
     * derken fiil yoktur. Aradaki bir sayı (1-3 biçim) ise veri
     * hatasıdır ve burada yakalanır.
     */
    for (const v of VERBS) {
      const n = Object.keys(v.table.present).length;
      expect([0, 4], `${v.id} → ${n} biçim`).toContain(n);
    }
    const noPresent = VERBS.filter((v) => Object.keys(v.table.present).length === 0);
    expect(noPresent.map((v) => v.id)).toEqual(['היה:paal']);
  });

  it('aynı kökün farklı binyanları kardeş olarak bulunur', () => {
    const lamad = VERBS.find((v) => v.id === 'למד:paal');
    expect(lamad).toBeDefined();
    const sibs = siblingsOf(lamad!);
    expect(sibs.some((s) => s.binyan === 'piel')).toBe(true);
  });

  it('dört seviyenin hepsi dolu', () => {
    for (const lvl of ['A1', 'A2', 'B1', 'B2'] as const) {
      expect(CATALOG_STATS.byLevel[lvl], lvl).toBeGreaterThan(20);
    }
  });
});

describe('dört harfli kökler (מרובעים)', () => {
  it("תכנן pi'el: תִּכְנֵן / מְתַכְנֵן / לְתַכְנֵן", () => {
    const t = conjugate(['ת', 'כ', 'נ', 'ן'], 'piel');
    expect(t.past.hu!.vocalized.normalize('NFC')).toBe('תִּכְנֵן'.normalize('NFC'));
    expect(t.present.ms!.vocalized.normalize('NFC')).toBe('מְתַכְנֵן'.normalize('NFC'));
    expect(t.infinitive.vocalized.normalize('NFC')).toBe('לְתַכְנֵן'.normalize('NFC'));
    expect(t.past.hu!.plain).toBe('תכנן');
  });

  it("ארגן hitpa'el: הִתְאַרְגֵּן / מִתְאַרְגֵּן", () => {
    const t = conjugate(['א', 'ר', 'ג', 'ן'], 'hitpael');
    expect(t.past.hu!.vocalized.normalize('NFC')).toBe('הִתְאַרְגֵּן'.normalize('NFC'));
    expect(t.present.ms!.vocalized.normalize('NFC')).toBe('מִתְאַרְגֵּן'.normalize('NFC'));
  });

  it('geçmiş zamanda kişi ekleri doğru bağlanır: תִּכְנַנְתִּי', () => {
    const t = conjugate(['ת', 'כ', 'נ', 'ן'], 'piel');
    expect(t.past.ani!.vocalized.normalize('NFC')).toBe('תִּכְנַנְתִּי'.normalize('NFC'));
  });

  it("dört harfli kök pa'al'de bulunmaz", () => {
    expect(() => conjugate(['ת', 'כ', 'נ', 'ן'], 'paal')).toThrow(/pi'el/);
  });
});

describe('elle yazılmış örnek cümleler', () => {
  it('her anahtar katalogda gerçekten var olan bir fiile işaret eder', () => {
    const ids = new Set(VERBS.map((v) => v.id));
    for (const key of Object.keys(WRITTEN_SENTENCES)) {
      expect(ids.has(key), `${key} katalogda yok`).toBe(true);
    }
  });

  it('her cümle üç yazımını da taşır ve boş değildir', () => {
    for (const [key, list] of Object.entries(WRITTEN_SENTENCES)) {
      expect(list.length, `${key} bos`).toBeGreaterThan(0);
      for (const s of list) {
        expect(s.he.length, key).toBeGreaterThan(0);
        expect(s.plain.length, key).toBeGreaterThan(0);
        expect(s.translit.length, key).toBeGreaterThan(0);
        expect(s.tr.length, key).toBeGreaterThan(0);
      }
    }
  });

  it('harekesiz yazımda hareke kalmaz — seslendirmeye bu gider', () => {
    const MARKS = /[\u05B0-\u05BC\u05C1\u05C2]/;
    for (const [key, list] of Object.entries(WRITTEN_SENTENCES)) {
      for (const s of list) {
        expect(MARKS.test(s.plain), `${key} → ${s.plain}`).toBe(false);
      }
    }
  });
});
