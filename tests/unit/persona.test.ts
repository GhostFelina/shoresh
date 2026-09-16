/**
 * Öğretmenin karşılama cümlesi testleri.
 *
 * NEDEN TEST EDİLİYOR: Bu cümleler öğrencinin gördüğü "öğretmen"in
 * kendisi. Sıraları bozulursa on gün sonra dönen birine "serin sürüyor"
 * denir ve sınıf duygusu bir cümlede yıkılır — ekranı açıp bakmadan
 * fark edilmeyecek bir hata.
 */
import { describe, expect, it } from 'vitest';
import { classroomMood, reactionLine, type MoodInput } from '@he/teacher/persona';

const input = (over: Partial<MoodInput> = {}): MoodInput => ({
  hour: 14,
  streak: 0,
  daysSinceLast: 1,
  placed: true,
  ...over,
});

describe('selamlama saate göre', () => {
  it('sabah, öğleden sonra ve akşam farklı', () => {
    const sabah = classroomMood(input({ hour: 8 })).greeting;
    const oglen = classroomMood(input({ hour: 14 })).greeting;
    const aksam = classroomMood(input({ hour: 21 })).greeting;
    expect(new Set([sabah, oglen, aksam]).size).toBe(3);
  });

  it('gece yarısı da bir karşılığı var — boş dönmez', () => {
    expect(classroomMood(input({ hour: 3 })).greeting.length).toBeGreaterThan(0);
  });
});

describe('durum sırası', () => {
  it('seviye ölçülmemişse her şeyden önce tanışma gelir', () => {
    const mood = classroomMood(input({ placed: false, streak: 12, daysSinceLast: 0 }));
    expect(mood.tone).toBe('tanisma');
  });

  it('uzun aradan sonra dönene "serin sürüyor" denmez', () => {
    // Seri sayacı sıfırlanmadan dönen bir öğrenci bu tuzağa düşürür.
    const mood = classroomMood(input({ daysSinceLast: 11, streak: 5 }));
    expect(mood.tone).toBe('geri-donus');
    expect(mood.line).toContain('11');
  });

  it('hiç çalışmamış ama ölçülmüş öğrenciye ilk ders denir', () => {
    expect(classroomMood(input({ daysSinceLast: null })).tone).toBe('ilk-ders');
  });

  it('üç günlük seri fark edilir', () => {
    const mood = classroomMood(input({ streak: 4, daysSinceLast: 0 }));
    expect(mood.tone).toBe('seri');
    expect(mood.line).toContain('4');
  });

  it('sıradan gün sessizce devam eder', () => {
    expect(classroomMood(input({ streak: 1, daysSinceLast: 2 })).tone).toBe('devam');
  });
});

describe('cevap tepkisi', () => {
  it('yanlışta suçlamaz, birlikte bakmayı önerir', () => {
    const line = reactionLine(false, 0);
    expect(line).toContain('bakalım');
  });

  it('art arda doğruda abartmadan pekiştirir', () => {
    expect(reactionLine(true, 0)).not.toEqual(reactionLine(true, 5));
  });
});
