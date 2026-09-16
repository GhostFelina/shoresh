/**
 * Yapay zekâ bağlamı testleri.
 *
 * NEDEN BU TESTLER ÖNEMLİ: Bu dosyanın tek işi, dil modelinin İbranice
 * UYDURMASINI engellemek. Bağlam bozulursa model kendi hafızasından
 * çekmeye başlar ve öğrenciye var olmayan bir çekim öğretir — üstelik
 * öğrenci bunu fark edemez. Kural şu: modele verilen her İbranice biçim
 * uygulamanın kendi doğrulanmış verisinden gelir ve öğrencinin
 * seviyesinin üstüne çıkmaz.
 */
import { describe, expect, it } from 'vitest';
import { chatRequest, explainRequest, teacherContext } from '@/features/teacher/ai-context';
import { parseDegerlendirme } from '@/lib/ai';
import { VERBS } from '@/data/catalog';
import { wordsUpToLevel } from '@/data/lexicon';
import type { PlacementResult } from '@/features/teacher/placement';

const bos: PlacementResult['skills'] = {
  harf: { asked: 3, correct: 3 },
  hareke: { asked: 3, correct: 2 },
  kelime: { asked: 3, correct: 2 },
  kok: { asked: 3, correct: 1 },
  fiil: { asked: 3, correct: 1 },
  cumle: { asked: 3, correct: 2 },
};

const placement: PlacementResult = {
  level: 'A1',
  ability: 1.4,
  confidence: 'orta',
  skills: bos,
  weak: ['kok', 'fiil'],
  strong: ['harf'],
  correct: 11,
  total: 18,
  at: Date.now(),
};

describe('bağlam kuralları', () => {
  it('modele "listenin dışına çıkma" talimatı her zaman giriyor', () => {
    const c = teacherContext({ level: 'A1', placement });
    expect(c).toContain('DIŞINA ÇIKMA');
  });

  it('öğrencinin seviyesinin üstündeki fiil bağlama girmez', () => {
    const c = teacherContext({ level: 'A1', placement });
    const ustSeviye = VERBS.filter((v) => v.cefr === 'B2');
    // B2 fiillerinden hiçbiri A1 öğrencisinin bağlamında görünmemeli.
    for (const v of ustSeviye.slice(0, 40)) {
      expect(c).not.toContain(`${v.lemma.vocalized} (${v.lemma.translit})`);
    }
  });

  it('öğrencinin seviyesinin üstündeki kelime bağlama girmez', () => {
    const c = teacherContext({ level: 'A1', placement });
    const a1 = new Set(wordsUpToLevel('A1').map((w) => w.vocalized));
    const ustSeviye = wordsUpToLevel('B2').filter((w) => !a1.has(w.vocalized));
    for (const w of ustSeviye.slice(0, 40)) {
      expect(c).not.toContain(`${w.vocalized} (${w.translit})`);
    }
  });

  it('zayıf alanlar bağlama yazılıyor — öğretmen neyi bilmediğini bilmeli', () => {
    const c = teacherContext({ level: 'A1', placement });
    expect(c).toContain('Zorlandığı alanlar');
    expect(c).toContain('Fiil çekimi');
  });

  it('seviye ölçülmemişse bu açıkça söyleniyor, uydurulmuyor', () => {
    const c = teacherContext({ level: 'A1', placement: null });
    expect(c).toContain('henüz ölçülmedi');
  });

  it('aynı gün aynı bağlam, ertesi gün farklı', () => {
    // Aynı oturumda iki soru soran öğrenci iki ayrı kelime evreni görmesin;
    // ama bağlam da haftalarca donmuş kalmasın.
    const gun1a = teacherContext({ level: 'A2', placement, now: new Date(2026, 8, 17, 9) });
    const gun1b = teacherContext({ level: 'A2', placement, now: new Date(2026, 8, 17, 22) });
    const gun2 = teacherContext({ level: 'A2', placement, now: new Date(2026, 8, 18, 9) });
    expect(gun1a).toBe(gun1b);
    expect(gun2).not.toBe(gun1a);
  });

  it('bağlam makul uzunlukta kalıyor — her istek hızlı dönmeli', () => {
    const c = teacherContext({ level: 'B2', placement });
    expect(c.length).toBeLessThan(6000);
  });
});

describe('istek kurma', () => {
  it('sohbet geçmişi son turlarla sınırlı', () => {
    const uzun = Array.from({ length: 20 }, (_, i) => ({
      role: (i % 2 === 0 ? 'ogrenci' : 'ogretmen') as 'ogrenci' | 'ogretmen',
      text: `mesaj${i}`,
    }));
    const r = chatRequest('BAĞLAM', uzun, 'yeni soru');
    expect(r).toContain('mesaj19');
    expect(r).not.toContain('mesaj10');
    expect(r).toContain('yeni soru');
  });

  it('açıklama isteği doğru cevabı ve öğrencinin cevabını birlikte taşıyor', () => {
    const r = explainRequest({
      context: 'BAĞLAM',
      soru: 'Geçmiş zaman nasıl?',
      ogrencininCevabi: 'כותב',
      dogruCevap: 'כתב',
      olgu: "Pa'al geçmiş zaman kalıbı",
    });
    expect(r).toContain('כותב');
    expect(r).toContain('כתב');
    expect(r).toContain('Motorun bildiği kural');
  });
});

describe('değerlendirme çözümü', () => {
  it('düz JSON okunuyor', () => {
    const d = parseDegerlendirme('{"puan": 80, "not": "iyi", "dogru_yanlar": ["a"], "eksik_yanlar": []}');
    expect(d.puan).toBe(80);
    expect(d.not).toBe('iyi');
    expect(d.dogruYanlar).toEqual(['a']);
  });

  it('kod bloğuna sarılmış JSON da okunuyor', () => {
    const d = parseDegerlendirme('```json\n{"puan": 55, "not": "olur"}\n```');
    expect(d.puan).toBe(55);
  });

  it('JSON değilse öğrenciye ham metin gösterilmiyor ama geri bildirim kayboluyor da', () => {
    // Model bazen düpedüz düz yazı döner. O zaman not alanına geçiyor;
    // puan `null` kalıyor ve arayüz puan göstermiyor — uydurma bir puan
    // basmaktansa puansız geri bildirim vermek dürüst olan.
    const d = parseDegerlendirme('Cevabın büyük ölçüde doğru ama fiil çekimi eksik.');
    expect(d.puan).toBeNull();
    expect(d.not).toContain('fiil çekimi');
  });

  it('aralık dışı puan kırpılıyor', () => {
    expect(parseDegerlendirme('{"puan": 340, "not": ""}').puan).toBe(100);
    expect(parseDegerlendirme('{"puan": -20, "not": ""}').puan).toBe(0);
  });
});
