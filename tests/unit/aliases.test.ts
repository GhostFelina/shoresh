/**
 * Yol takma adları tutarlı mı.
 *
 * NEDEN VAR: Takma adlar üç yerde geçiyor ve üçü ayrı teknolojiler:
 *   aliases.ts        → Vite ve Vitest (tek kaynak, paylaşılıyor)
 *   tsconfig.app.json → TypeScript (JSON, içe aktarma yapılamıyor)
 *
 * İlk ikisi artık tek kaynaktan besleniyor ama TypeScript'inki ayrı
 * kalmak zorunda. Ayrı kalınca da sessizce kayabilir: derleyici yolu
 * çözer, çalışma zamanı çözemez (ya da tersi) ve hata ancak o dosya
 * çalıştırıldığında ortaya çıkar.
 *
 * Bu tam olarak bir kez oldu: `@he` takma adı eklenirken yalnızca
 * `vite.config.ts` güncellendi, `vitest.config.ts` unutuldu ve on test
 * dosyası birden "Failed to resolve import" ile çöktü.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { aliases } from '../../aliases';

const root = (p: string): string => resolve(process.cwd(), p);

/** JSON'daki yorumları atıp ayrıştırır — tsconfig yorum taşıyabiliyor. */
function readJsonc(path: string): { compilerOptions?: { paths?: Record<string, string[]> } } {
  const raw = readFileSync(root(path), 'utf-8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');
  return JSON.parse(raw) as { compilerOptions?: { paths?: Record<string, string[]> } };
}

const tsPaths = readJsonc('tsconfig.app.json').compilerOptions?.paths ?? {};

describe('takma adlar', () => {
  it('tek kaynakta en az iki takma ad var', () => {
    expect(Object.keys(aliases).length).toBeGreaterThanOrEqual(2);
    expect(aliases['@']).toBeTruthy();
    expect(aliases['@he']).toBeTruthy();
  });

  it('TypeScript aynı takma adları tanıyor', () => {
    /*
     * `aliases.ts` içindeki her anahtarın tsconfig'de karşılığı olmalı.
     * Olmasaydı çalışma zamanı yolu çözer ama derleyici çözemez.
     */
    const eksik = Object.keys(aliases).filter((k) => !(`${k}/*` in tsPaths));
    expect(eksik, `tsconfig.app.json içinde eksik: ${eksik.join(', ')}`).toEqual([]);
  });

  it('TypeScript fazladan takma ad taşımıyor', () => {
    // Tersi de sorun: derleyicinin bildiği ama çalışma zamanının
    // bilmediği bir yol, derlemede sessizce geçip yayında çöker.
    const fazla = Object.keys(tsPaths)
      .map((k) => k.replace(/\/\*$/, ''))
      .filter((k) => !(k in aliases));
    expect(fazla, `aliases.ts içinde eksik: ${fazla.join(', ')}`).toEqual([]);
  });

  it('her takma ad gerçekten var olan bir klasörü gösteriyor', () => {
    for (const [ad, yol] of Object.entries(aliases)) {
      expect(existsSync(yol), `${ad} → ${yol} bulunamadı`).toBe(true);
    }
  });

  it('iki yapılandırma da paylaşılan kaynağı kullanıyor', () => {
    /*
     * Kaynağı okumak yerine davranışı sınamak daha iyi olurdu ama
     * yapılandırma dosyaları test içinde çalıştırılamıyor. En azından
     * kopyala-yapıştır bir listenin geri gelmediğini denetliyoruz.
     */
    for (const dosya of ['vite.config.ts', 'vitest.config.ts']) {
      const src = readFileSync(root(dosya), 'utf-8');
      expect(src.includes("from './aliases'"), `${dosya} tek kaynağı kullanmıyor`).toBe(true);
      expect(
        /alias:\s*\{/.test(src),
        `${dosya} içinde elle yazılmış takma ad listesi var`,
      ).toBe(false);
    }
  });
});
