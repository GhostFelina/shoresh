/**
 * Renk paletleri.
 *
 * NEDEN CSS'TE DEĞİL BURADA: Renkler CSS dosyasında sabit dursaydı
 * okunabilirliklerini hiçbir şey denetlemezdi. Bir kez yaşandı —
 * açık temada marka rengi beyaz üzerinde 1.4:1 kontrastla duruyordu ve
 * rakamlar okunmuyordu. Renkler veri olunca birim test her tonu WCAG
 * eşiğine sokabiliyor; artık "güzel görünüyor" değil, ÖLÇÜLÜYOR.
 *
 * İKİ AYRI EKSEN:
 *   tema  — koyu / açık. Zemin ve metin rengini belirler.
 *   palet — marka ailesi. Vurgu renklerini belirler.
 * İkisi bağımsız: her palet hem koyu hem açık temada çalışır, bu yüzden
 * her palet iki ton takımı taşır.
 *
 * NEDEN BİRDEN ÇOK PALET: Tek renk üzerine kurulu bir arayüz uzun
 * kullanımda yorucu olur; öğrenci her gün aynı ekrana bakıyor. Palet
 * seçimi bir süs değil, uygulamayı kendine ait kılmanın en ucuz yolu.
 */

export interface PaletteTones {
  /** Açık marka tonu — koyu zeminde metin, açık zeminde dolgu. */
  brand300: string;
  brand400: string;
  brand500: string;
  accent400: string;
  accent500: string;
  /** METİN için marka rengi — zemin rengiyle AYNI olmak zorunda değil. */
  accentText: string;
  accentTextAlt: string;
  /** Dişil rozetleri — erilden ayrışsın ama okunur kalsın. */
  accentFem: string;
}

export interface Palette {
  id: string;
  name: string;
  blurb: string;
  dark: PaletteTones;
  light: PaletteTones;
}

export const PALETTES: Palette[] = [
  {
    id: 'shoresh',
    name: 'Şoreş',
    blurb: 'Turkuaz ve indigo — kuruluş rengi',
    dark: {
      brand300: '#5eead4',
      brand400: '#2dd4bf',
      brand500: '#14b8a6',
      accent400: '#818cf8',
      accent500: '#6366f1',
      accentText: '#5eead4',
      accentTextAlt: '#a5b4fc',
      accentFem: '#f0abfc',
    },
    light: {
      brand300: '#5eead4',
      brand400: '#0d9488',
      brand500: '#0f766e',
      accent400: '#6366f1',
      accent500: '#4f46e5',
      accentText: '#0f766e',
      accentTextAlt: '#4338ca',
      accentFem: '#a21caf',
    },
  },
  {
    id: 'negev',
    name: 'Negev',
    blurb: 'Çöl kumu ve gün batımı',
    dark: {
      brand300: '#fcd34d',
      brand400: '#fbbf24',
      brand500: '#f59e0b',
      accent400: '#fb923c',
      accent500: '#ea580c',
      accentText: '#fcd34d',
      accentTextAlt: '#5eead4',
      accentFem: '#f9a8d4',
    },
    light: {
      brand300: '#fcd34d',
      brand400: '#b45309',
      brand500: '#92400e',
      accent400: '#0d9488',
      accent500: '#0f766e',
      accentText: '#b45309',
      accentTextAlt: '#0f766e',
      accentFem: '#be185d',
    },
  },
  {
    id: 'zeytin',
    name: 'Zeytin',
    blurb: 'Zeytin yeşili ve altın',
    dark: {
      brand300: '#bef264',
      brand400: '#a3e635',
      brand500: '#84cc16',
      accent400: '#fbbf24',
      accent500: '#d97706',
      accentText: '#bef264',
      accentTextAlt: '#fcd34d',
      accentFem: '#fda4af',
    },
    light: {
      brand300: '#bef264',
      brand400: '#65a30d',
      brand500: '#4d7c0f',
      accent400: '#f59e0b',
      accent500: '#d97706',
      accentText: '#4d7c0f',
      accentTextAlt: '#b45309',
      accentFem: '#be123c',
    },
  },
  {
    id: 'akdeniz',
    name: 'Akdeniz',
    blurb: 'Derin mavi ve camgöbeği',
    dark: {
      brand300: '#7dd3fc',
      brand400: '#38bdf8',
      brand500: '#0ea5e9',
      accent400: '#22d3ee',
      accent500: '#06b6d4',
      accentText: '#7dd3fc',
      accentTextAlt: '#fcd34d',
      accentFem: '#f5d0fe',
    },
    light: {
      brand300: '#7dd3fc',
      brand400: '#0284c7',
      brand500: '#0369a1',
      accent400: '#06b6d4',
      accent500: '#0891b2',
      accentText: '#0369a1',
      accentTextAlt: '#a16207',
      accentFem: '#86198f',
    },
  },
  {
    id: 'nar',
    name: 'Nar',
    blurb: 'Nar kırmızısı ve mor',
    dark: {
      brand300: '#fda4af',
      brand400: '#fb7185',
      brand500: '#e11d48',
      accent400: '#c084fc',
      accent500: '#9333ea',
      accentText: '#fda4af',
      accentTextAlt: '#d8b4fe',
      accentFem: '#fbcfe8',
    },
    light: {
      brand300: '#fda4af',
      brand400: '#e11d48',
      brand500: '#be123c',
      accent400: '#a855f7',
      accent500: '#9333ea',
      accentText: '#be123c',
      accentTextAlt: '#7e22ce',
      accentFem: '#a21caf',
    },
  },
];

export const PALETTE_BY_ID = new Map(PALETTES.map((p) => [p.id, p]));
export const DEFAULT_PALETTE = 'shoresh';

/**
 * Temaların zemin renkleri.
 *
 * Kontrast testinin karşılaştırma yüzeyi bunlar. CSS'teki değerlerle
 * aynı olmalı; ayrı düşerlerse test yanlış bir zemine göre ölçer ve
 * geçtiği hâlde ekranda okunmayan bir renk kalabilir.
 */
export const SURFACES = {
  dark: { bg: '#04060c', surface: '#080c16', surface2: '#0c1120' },
  light: { bg: '#f4f7fb', surface: '#ffffff', surface2: '#eef2f9' },
} as const;

/* ------------------------------------------------------------------ *
 * Kontrast ölçümü — WCAG 2.1
 * ------------------------------------------------------------------ */

function channel(v: number): number {
  const c = v / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

/** İki rengin kontrast oranı — 1 (aynı) ile 21 (siyah/beyaz) arası. */
export function contrast(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
};

/**
 * İki rengin GÖZLE ayırt edilebilirliği — 0 (aynı) ile ~765 arası.
 *
 * NEDEN KONTRAST ORANI DEĞİL: Kontrast yalnızca parlaklığa bakar.
 * Amber (#fcd34d) ile turkuaz (#5eead4) gözle bambaşka iki renktir ama
 * parlaklıkları neredeyse eşit olduğu için kontrast oranları 1.03 çıkar.
 * "Bu iki vurgu birbirine karışır mı" sorusunun cevabı orada değil.
 *
 * Kullanılan ölçü “redmean”: ucuz ama gözün kırmızıya duyarlılığını
 * hesaba katan, RGB uzaklığından belirgin biçimde daha isabetli bir
 * yaklaşım. Tam bir renk uzayı dönüşümüne burada gerek yok — soru
 * “ne kadar farklı” değil, “yeterince farklı mı”.
 */
export function colorDistance(a: string, b: string): number {
  const [r1, g1, b1] = rgb(a);
  const [r2, g2, b2] = rgb(b);
  const rMean = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt(
    (2 + rMean / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rMean) / 256) * db * db,
  );
}

/* ------------------------------------------------------------------ *
 * Uygulama
 * ------------------------------------------------------------------ */

/** CSS değişken adları — `index.css` içindeki varsayılanlarla aynı. */
const VARS: Array<[keyof PaletteTones, string]> = [
  ['brand300', '--color-brand-300'],
  ['brand400', '--color-brand-400'],
  ['brand500', '--color-brand-500'],
  ['accent400', '--color-accent-400'],
  ['accent500', '--color-accent-500'],
  ['accentText', '--accent-text'],
  ['accentTextAlt', '--accent-text-alt'],
  ['accentFem', '--accent-fem'],
];

/**
 * Paleti belgeye uygular.
 *
 * Değişkenler `documentElement` üzerine SATIR İÇİ yazılıyor; satır içi
 * bildirim her CSS kuralını yendiği için tema bloklarıyla sıralama
 * yarışına girmiyoruz. CSS'teki değerler yalnızca ilk boyamada, JS
 * çalışmadan önce geçerli — yani sayfa hiçbir zaman renksiz açılmıyor.
 */
export function applyPalette(paletteId: string, theme: 'dark' | 'light'): void {
  if (typeof document === 'undefined') return;
  const palette = PALETTE_BY_ID.get(paletteId) ?? PALETTE_BY_ID.get(DEFAULT_PALETTE)!;
  const tones = theme === 'light' ? palette.light : palette.dark;
  const root = document.documentElement;
  for (const [key, cssVar] of VARS) root.style.setProperty(cssVar, tones[key]);
  root.dataset.palette = palette.id;
}
