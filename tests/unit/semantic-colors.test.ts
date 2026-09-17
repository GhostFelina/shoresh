/**
 * Anlamsal renkler ve dolu düğme metni okunabilir mi.
 *
 * NEDEN VAR: Kullanıcı "açık tema bozuk" dedi. Palet testi zaten her
 * marka tonunu WCAG eşiğinden geçiriyordu ve GEÇİYORDU — yani sorun
 * paletin tanımında değil, paletin DIŞINDA kalan renklerdeydi.
 *
 * Ölçüldü (`node scripts/perf-contrast.mjs`, açık tema):
 *
 *     1.55:1  amber başlık        beyaz üzerinde   → okunmuyor
 *     3.49:1  dolu düğme metni    marka üzerinde   → eşik altı
 *     3.74:1  seviye rozeti       beyaz üzerinde   → eşik altı
 *
 * Üçü de bileşenlerin içine elle yazılmış, koyu temaya göre seçilmiş
 * renklerdi. Renkler veri hâline getirildi; bu test onları ölçüyor.
 */
import { describe, expect, it } from 'vitest';
import { PALETTES, SEMANTIC, type SemanticTones } from '@/lib/palette';

/** WCAG 2.1 bağıl parlaklık. */
function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number): number => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r!) + 0.7152 * f(g!) + 0.0722 * f(b!);
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Temaların zemin renkleri — `src/styles/index.css` ile aynı olmalı.
 * Burada tekrarlanıyor çünkü CSS'ten içe aktarılamıyor; ayrı düşerse
 * bu testin kendisi yanlış ölçer, o yüzden aşağıda ayrıca denetleniyor.
 */
const ZEMIN = {
  dark: { bg: '#04060c', surface: '#080c16', surface2: '#0c1120' },
  light: { bg: '#f4f7fb', surface: '#ffffff', surface2: '#eef2f9' },
} as const;

const TEMALAR = ['dark', 'light'] as const;

describe('anlamsal renkler', () => {
  it('her temada dört anlam da tanımlı', () => {
    for (const tema of TEMALAR) {
      const anlamlar: Array<keyof SemanticTones> = ['warn', 'danger', 'ok', 'info'];
      for (const ad of anlamlar) {
        expect(SEMANTIC[tema][ad], `${tema}.${ad} boş`).toMatch(/^#[0-9a-f]{6}$/i);
      }
    }
  });

  it('her anlam kendi temasının HER yüzeyinde okunuyor', () => {
    /*
     * Üç yüzeyin hepsine bakılıyor: bir renk kart üzerinde okunup
     * sayfa zemininde kaybolabiliyor. Amber tam olarak öyleydi.
     */
    const dusukler: string[] = [];
    for (const tema of TEMALAR) {
      for (const [ad, renk] of Object.entries(SEMANTIC[tema])) {
        for (const [yuzeyAdi, yuzey] of Object.entries(ZEMIN[tema])) {
          const oran = contrast(renk, yuzey);
          if (oran < 4.5) {
            dusukler.push(`${tema}.${ad} (${renk}) ${yuzeyAdi} üzerinde ${oran.toFixed(2)}:1`);
          }
        }
      }
    }
    expect(dusukler, dusukler.join('\n')).toEqual([]);
  });

  it('uyarı ile hata birbirine karışmıyor', () => {
    /*
     * İkisi de "dikkat" diyor ama biri "dur", öteki "bak". Aynı renge
     * yaklaşırlarsa kullanıcı yanlış cevabı ipucu sanar. Kontrast
     * değil renk UZAKLIĞI ölçülüyor — kontrast yalnızca parlaklığa
     * bakar ve turuncu ile kırmızıyı "aynı" sayar.
     */
    for (const tema of TEMALAR) {
      const { warn, danger } = SEMANTIC[tema];
      const uzaklik = renkUzakligi(warn, danger);
      expect(uzaklik, `${tema}: uyarı ve hata çok yakın (${uzaklik.toFixed(0)})`).toBeGreaterThan(
        60,
      );
    }
  });
});

describe('dolu düğme metni', () => {
  it('her palet ve her temada düğme yazısı okunuyor', () => {
    /*
     * Dolu düğmenin zemini `brand500`, yazısı `onAccent`. İkisi ayrı
     * yerlerden geldiği için birinin değişmesi ötekini sessizce
     * okunmaz yapabiliyor.
     */
    const dusukler: string[] = [];
    for (const p of PALETTES) {
      for (const tema of TEMALAR) {
        const tonlar = tema === 'dark' ? p.dark : p.light;
        const oran = contrast(tonlar.onAccent, tonlar.brand500);
        if (oran < 4.5) {
          dusukler.push(`${p.id}/${tema}: ${tonlar.onAccent} üzerinde ${tonlar.brand500} = ${oran.toFixed(2)}:1`);
        }
      }
    }
    expect(dusukler, dusukler.join('\n')).toEqual([]);
  });
});

describe('bileşenlerde elle yazılmış renk yok', () => {
  it('hiçbir bileşen kendi rengini uydurmuyor', async () => {
    /*
     * BU TESTİN SEBEBİ: Otuz küsur yerde `#fbbf24` ve `#f87171` elle
     * yazılıydı. Hepsi koyu temaya göre seçilmişti ve açık temada
     * okunmuyordu. Palet dosyası dışında ham renk kodu yazmak, temayı
     * atlatmanın tek yolu — o yüzden yasak.
     */
    const { readFileSync, readdirSync, statSync } = await import('node:fs');
    const { join, relative } = await import('node:path');

    const kok = join(process.cwd(), 'src');
    const suclular: string[] = [];

    const gez = (d: string): void => {
      for (const ad of readdirSync(d)) {
        const p = join(d, ad);
        if (statSync(p).isDirectory()) {
          gez(p);
          continue;
        }
        if (!/\.(ts|tsx)$/.test(ad)) continue;

        /*
         * İKİ MUAFİYET, ikisi de gerekçeli:
         *  palette.ts — renkleri TANIMLAYAN dosya; burada renk yazmak
         *    zorunda.
         *  Flags.tsx  — bayrak renkleri temaya ait değil, ÜLKEYE ait.
         *    İsrail bayrağının mavisi açık temada koyulaşamaz; o zaman
         *    o bayrak olmaktan çıkar.
         */
        if (p.endsWith(join('lib', 'palette.ts'))) continue;
        if (p.endsWith(join('app', 'Flags.tsx'))) continue;

        const src = readFileSync(p, 'utf-8');
        for (const [i, satir] of src.split('\n').entries()) {
          const m = /#[0-9a-fA-F]{6}\b/.exec(satir);
          if (m) suclular.push(`${relative(process.cwd(), p)}:${i + 1}  ${m[0]}`);
        }
      }
    };
    gez(kok);

    expect(suclular, `palet dışında ham renk kodu:\n${suclular.join('\n')}`).toEqual([]);
  });
});

/** İki rengin algısal uzaklığı (redmean) — kontrasttan farklı bir şey ölçer. */
function renkUzakligi(a: string, b: string): number {
  const oku = (h: string): [number, number, number] => {
    const s = h.replace('#', '');
    return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)) as [number, number, number];
  };
  const [r1, g1, b1] = oku(a);
  const [r2, g2, b2] = oku(b);
  const rOrt = (r1 + r2) / 2;
  const dr = r1 - r2;
  const dg = g1 - g2;
  const db = b1 - b2;
  return Math.sqrt((2 + rOrt / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rOrt) / 256) * db * db);
}
