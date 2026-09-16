/**
 * Ürün adı gerçekten tek kaynaktan mı geliyor.
 *
 * NEDEN VAR: Ad altı ayrı yerde elle yazılıydı — kenar çubuğu, çekmece,
 * üst bant, alt bilgi, `index.html` ve PWA künyesi. "Shoresh"ten
 * "Cortexia Language 2"ye geçerken ilk denemede ikisi atlandı ve
 * uygulamanın her yeri yeni adı gösterirken sekme başlığı eski adda
 * kaldı. Kullanıcı adı yine değiştireceğini söyledi; o gün bu testin
 * kırılması, eksik kalan yeri gösterecek.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { BRAND, brandWithVersion } from '../../src/core/brand';

const oku = (p: string): string => readFileSync(resolve(process.cwd(), p), 'utf-8');

describe('marka', () => {
  it('ad, kısa ad ve motto dolu', () => {
    expect(BRAND.name.trim().length).toBeGreaterThan(2);
    expect(BRAND.short.trim().length).toBeGreaterThan(2);
    expect(BRAND.motto.trim().length).toBeGreaterThan(5);
    expect(BRAND.promise.trim().length).toBeGreaterThan(10);
  });

  it('kısa ad dar yerlere sığacak kadar kısa', () => {
    // Üst bantta sürüm rozetiyle yan yana duruyor; uzarsa taşıyor.
    expect(BRAND.short.length).toBeLessThanOrEqual(16);
  });

  it('sürümle birlikte tek satır kuruluyor', () => {
    expect(brandWithVersion('1.2.3')).toBe(`${BRAND.name} v1.2.3`);
  });

  it('kabuk adı elle yazmıyor, marka kaynağından alıyor', () => {
    const shell = oku('src/app/Shell.tsx');
    expect(shell.includes("from '@/core/brand'"), 'Shell marka kaynağını kullanmıyor').toBe(true);
    /*
     * Metin içinde elle yazılmış ad aranıyor. Yorum satırlarında geçmesi
     * serbest değil — bilerek: yorumdaki eski ad da yanıltıcı.
     */
    expect(shell.includes(BRAND.name), 'Shell içinde elle yazılmış ürün adı var').toBe(false);
  });

  it('PWA künyesi ile sekme başlığı aynı kaynaktan besleniyor', () => {
    /*
     * İkisi de derleme zamanında yazılıyor ve ikisi de `vite.config.ts`
     * üzerinden geçiyor. Kaynak yerine davranışı sınamak daha iyi
     * olurdu ama yapılandırma dosyası test içinde çalıştırılamıyor.
     */
    const cfg = oku('vite.config.ts');
    expect(cfg.includes("from './src/core/brand'"), 'vite marka kaynağını okumuyor').toBe(true);
    expect(cfg.includes('name: BRAND.name'), 'PWA künyesinde ad elle yazılı').toBe(true);
    expect(cfg.includes('transformIndexHtml'), 'sekme başlığı enjekte edilmiyor').toBe(true);
  });

  it('depolama öneki ada BAĞLANMADI', () => {
    /*
     * BU TESTİN SEBEBİ: Ad değiştiğinde `shoresh.` önekini de
     * değiştirmek akla yatkın görünüyor. Yapılsaydı uygulamayı kullanan
     * herkesin ilerlemesi, serisi ve tekrar takvimi bir yükseltmede
     * silinirdi — anahtar bir kimlik değil, bir adres.
     */
    const progress = oku('src/lib/progress.ts');
    expect(progress.includes('shoresh.'), 'depolama öneki değişmiş').toBe(true);
    expect(progress.includes('cortexia.'), 'depolama öneki ada bağlanmış').toBe(false);
  });
});
