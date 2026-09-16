/**
 * Palet okunabilirlik testleri.
 *
 * NEDEN VAR: Bir kez yaşandı — açık temada marka rengi beyaz üzerinde
 * 1.4:1 kontrastla duruyordu; rakamlar ve bağlantılar okunmuyordu ve
 * bunu ancak ekran görüntüsüne bakınca fark ettik. Beş palet × iki tema
 * elle denetlenemez. Burada her ton, üzerinde gerçekten görüneceği
 * yüzeye karşı ölçülüyor.
 *
 * EŞİKLER (WCAG 2.1):
 *   metin rengi   → 4.5:1  (normal boy yazı)
 *   dolgu/kenar   → 3.0:1  (yüzey ayrımı, metin değil)
 */
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PALETTE,
  PALETTES,
  PALETTE_BY_ID,
  SURFACES,
  colorDistance,
  contrast,
} from '@/lib/palette';

const THEMES = ['dark', 'light'] as const;

describe('palet bütünlüğü', () => {
  it('varsayılan palet listede var', () => {
    expect(PALETTE_BY_ID.has(DEFAULT_PALETTE)).toBe(true);
  });

  it('kimlikler tekil', () => {
    expect(new Set(PALETTES.map((p) => p.id)).size).toBe(PALETTES.length);
  });

  it('en az beş seçenek var — tek renk yorucu', () => {
    expect(PALETTES.length).toBeGreaterThanOrEqual(5);
  });

  it('her ton geçerli altılı onaltılık', () => {
    for (const p of PALETTES) {
      for (const theme of THEMES) {
        for (const [key, value] of Object.entries(p[theme])) {
          expect(value, `${p.id}/${theme}/${key}`).toMatch(/^#[0-9a-f]{6}$/);
        }
      }
    }
  });
});

describe('metin okunabilirliği', () => {
  /*
   * Metin renkleri EN AÇIK yüzeye karşı ölçülüyor (koyu temada
   * --surface-2, açık temada beyaz). En zor durum orası; orada geçen
   * ton öbür yüzeylerde zaten daha rahat okunur.
   */
  const worstSurface = (theme: 'dark' | 'light'): string =>
    theme === 'dark' ? SURFACES.dark.surface2 : SURFACES.light.surface;

  for (const key of ['accentText', 'accentTextAlt', 'accentFem'] as const) {
    it(`${key} her palet ve temada 4.5:1 eşiğini geçiyor`, () => {
      for (const p of PALETTES) {
        for (const theme of THEMES) {
          const ratio = contrast(p[theme][key], worstSurface(theme));
          expect(
            ratio,
            `${p.name} / ${theme} / ${key} = ${ratio.toFixed(2)}:1 (${p[theme][key]})`,
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
    });
  }
});

describe('yüzey renkleri', () => {
  it('marka dolgusu zeminden ayrışıyor — 3:1', () => {
    for (const p of PALETTES) {
      for (const theme of THEMES) {
        const surface = theme === 'dark' ? SURFACES.dark.surface2 : SURFACES.light.surface;
        const ratio = contrast(p[theme].brand400, surface);
        expect(ratio, `${p.name}/${theme} brand400 = ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(
          3,
        );
      }
    }
  });

  /*
   * Burada KONTRAST değil, algısal UZAKLIK ölçülüyor.
   *
   * İlk yazılışında kontrast oranı kullanılmıştı ve Negev paletini
   * hatalı biçimde kırdı: amber ile turkuaz gözle apayrı iki renk ama
   * parlaklıkları eşit olduğu için kontrastları 1.03 çıkıyor. Soru
   * "biri ötekinin üstünde okunur mu" değil, "ikisi birbirine karışır
   * mı" — o da renk uzaklığıyla ölçülür.
   */
  it('iki vurgu ailesi birbirinden ayrışıyor — aynı renk gibi görünmesinler', () => {
    for (const p of PALETTES) {
      for (const theme of THEMES) {
        const d = colorDistance(p[theme].accentText, p[theme].accentTextAlt);
        expect(d, `${p.name}/${theme} iki vurgu çok yakın (${d.toFixed(0)})`).toBeGreaterThan(90);
      }
    }
  });
});

describe('kontrast hesabı', () => {
  it('bilinen değerleri doğru veriyor', () => {
    expect(contrast('#ffffff', '#000000')).toBeCloseTo(21, 1);
    expect(contrast('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
  });
});
