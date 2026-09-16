/**
 * Düzensiz fiillerin ve okunuş kurallarının kilidi.
 *
 * Buradaki fiiller İbranicenin EN SIK kullanılanları. Bir tanesi bozulursa
 * öğrenci en çok ihtiyaç duyduğu fiili yanlış öğrenir — bu yüzden her biri
 * ayrı ayrı sınanıyor.
 */
import { describe, expect, it } from 'vitest';
import { VERBS, VERB_BY_ID, CATALOG_STATS } from '@/data/catalog';
import { IRREGULAR_SEEDS } from '@/data/irregular';
import { transliterate } from '@/engine/niqqud';

const V = (s: string) => s.normalize('NFC');

describe('düzensiz fiiller katalogda', () => {
  it('hepsi eklendi ve düzensiz olarak işaretlendi', () => {
    expect(CATALOG_STATS.irregular).toBe(IRREGULAR_SEEDS.length);
    for (const seed of IRREGULAR_SEEDS) {
      const id = `${seed.root.join('')}:${seed.binyan}`;
      const v = VERB_BY_ID.get(id);
      expect(v, `${id} katalogda yok`).toBeDefined();
      expect(v!.gizra).toBe('irregular');
      expect(v!.source).toBe('explicit');
      // Neden düzensiz olduğu öğrenciye söylenmeli.
      expect(v!.traps?.[0]?.note.length ?? 0).toBeGreaterThan(20);
    }
  });

  it('en sık fiiller doğru çekiliyor', () => {
    const cases: Array<[string, string, string, string]> = [
      // id, geçmiş 3.tekil eril, şimdiki eril, gelecek 3.tekil eril
      ['הלכ:paal', 'הָלַךְ', 'הוֹלֵךְ', 'יֵלֵךְ'],
      ['בוא:paal', 'בָּא', 'בָּא', 'יָבוֹא'],
      ['נתן:paal', 'נָתַן', 'נוֹתֵן', 'יִתֵּן'],
      ['לקח:paal', 'לָקַח', 'לוֹקֵחַ', 'יִקַּח'],
      ['ידע:paal', 'יָדַע', 'יוֹדֵעַ', 'יֵדַע'],
      ['יצא:paal', 'יָצָא', 'יוֹצֵא', 'יֵצֵא'],
      ['אמר:paal', 'אָמַר', 'אוֹמֵר', 'יֹאמַר'],
      ['נסע:paal', 'נָסַע', 'נוֹסֵעַ', 'יִסַּע'],
    ];
    for (const [id, past, present, future] of cases) {
      const v = VERB_BY_ID.get(id);
      expect(v, id).toBeDefined();
      expect(V(v!.table.past.hu!.vocalized), `${id} geçmiş`).toBe(V(past));
      expect(V(v!.table.present.ms!.vocalized), `${id} şimdiki`).toBe(V(present));
      expect(V(v!.table.future.hu!.vocalized), `${id} gelecek`).toBe(V(future));
    }
  });

  it('הָיָה fiilinin şimdiki zamanı YOKTUR — bu kasıtlı', () => {
    const haya = VERB_BY_ID.get('היה:paal');
    expect(haya).toBeDefined();
    expect(Object.keys(haya!.table.present)).toHaveLength(0);
    // Ama geçmiş ve gelecek tamdır.
    expect(Object.keys(haya!.table.past)).toHaveLength(8);
    expect(Object.keys(haya!.table.future)).toHaveLength(8);
  });

  it('יָכוֹל fiilinin mastarı ve emir kipi yoktur', () => {
    const yachol = VERB_BY_ID.get('יכל:paal');
    expect(yachol).toBeDefined();
    expect(Object.keys(yachol!.table.imperative)).toHaveLength(0);
  });

  it('mastarlar doğru — kökten türetilemeyenler dahil', () => {
    const cases: Array<[string, string]> = [
      ['הלכ:paal', 'לָלֶכֶת'],
      ['נתן:paal', 'לָתֵת'],
      ['לקח:paal', 'לָקַחַת'],
      ['ידע:paal', 'לָדַעַת'],
      ['אמר:paal', 'לוֹמַר'],
      ['בוא:paal', 'לָבוֹא'],
      ['היה:paal', 'לִהְיוֹת'],
    ];
    for (const [id, inf] of cases) {
      expect(V(VERB_BY_ID.get(id)!.table.infinitive.vocalized), id).toBe(V(inf));
    }
  });
});

describe('okunuş — kelime sonundaki ה sessizdir', () => {
  it('ל״ה fiilleri sondaki h olmadan okunur', () => {
    expect(transliterate('קָנָה')).toBe('kana');
    expect(transliterate('עָשָׂה')).toBe('asa');
    expect(transliterate('רוֹצֶה')).toBe('rotse');
    expect(transliterate('הָיָה')).toBe('haya');
    expect(transliterate('רָאָה')).toBe('raa');
  });

  it('kelime başındaki ve ortasındaki ה okunur', () => {
    expect(transliterate('הוֹלֵךְ').startsWith('h')).toBe(true);
    expect(transliterate('מַהֵר')).toContain('h');
  });

  it('katalogdaki hiçbir ל״ה fiili sonda h ile bitmez', () => {
    const lamedHey = VERBS.filter((v) => v.gizra === 'lamed-hey');
    expect(lamedHey.length).toBeGreaterThan(10);
    for (const v of lamedHey) {
      expect(v.lemma.translit.endsWith('h'), `${v.id} → ${v.lemma.translit}`).toBe(false);
    }
  });
});
