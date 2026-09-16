/**
 * Devir belgesi testleri.
 *
 * NEDEN: `AI_HANDOFF.md` bir sonraki geliştiricinin (insan ya da yapay
 * zekâ) projeyi kodu baştan sona okumadan devralmasını sağlıyor. Ama
 * belge iddialarda bulunuyor: "şu dosya şurada", "şu komut var", "şu
 * adres canlı". Dosya taşınınca ya da komut adı değişince belge sessizce
 * yalan söylemeye başlar — ve eski bir devir belgesi, belge olmamasından
 * DAHA TEHLİKELİDİR, çünkü devralan ona güvenip yanlış yere bakar.
 *
 * Buradaki testler belgenin iddialarını gerçekle karşılaştırıyor.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = (p: string): string => resolve(process.cwd(), p);
const read = (p: string): string => readFileSync(root(p), 'utf-8');

const HANDOFF = read('AI_HANDOFF.md');
const pkg = JSON.parse(read('package.json')) as {
  version: string;
  scripts: Record<string, string>;
};

describe('devir belgesi var ve dolu', () => {
  it('iki belge de yerinde', () => {
    expect(existsSync(root('AI_HANDOFF.md')), 'AI_HANDOFF.md yok').toBe(true);
    expect(existsSync(root('PROJECT_STATE.md')), 'PROJECT_STATE.md yok — npm run state').toBe(
      true,
    );
  });

  it('bütün bölümler duruyor', () => {
    // Bölüm başlıkları silinirse belge iskeletini kaybeder.
    for (const baslik of [
      'Otuz saniyede',
      'Değiştirilemez kurallar',
      'Mimarinin tek cümlesi',
      'Yaşanmış tuzaklar',
      'Nerede ne var',
      'Sürüm yordamı',
      'Sıradaki işler',
      'Nasıl çalışılıyor',
      'Codex CLI ile devralma',
    ]) {
      expect(HANDOFF.includes(baslik), `"${baslik}" bölümü kayıp`).toBe(true);
    }
  });

  it('devralmak için yeterince ayrıntılı', () => {
    // Kabaca bir alt sınır: belge kısalırsa iş görmez hâle gelir.
    expect(HANDOFF.split('\n').length).toBeGreaterThan(200);
  });
});

describe('belgedeki komutlar gerçekten var', () => {
  /*
   * Belgede `npm run X` diye geçen her komut package.json'da tanımlı
   * olmalı. Olmayan bir komut, devralanın ilk denemesinde duvara
   * toslaması demek.
   */
  const komutlar = [...HANDOFF.matchAll(/npm run ([a-z:]+)/g)].map((m) => m[1]!);

  it('belgede komut geçiyor', () => {
    expect(komutlar.length).toBeGreaterThan(4);
  });

  it('hepsi package.json içinde tanımlı', () => {
    const eksik = [...new Set(komutlar)].filter((k) => !(k in pkg.scripts));
    expect(eksik, `package.json'da olmayan komutlar: ${eksik.join(', ')}`).toEqual([]);
  });

  it('devir için gereken komutlar mevcut', () => {
    for (const k of ['dev', 'verify', 'test', 'build', 'state', 'checkpoint']) {
      expect(pkg.scripts[k], `"${k}" komutu tanımlı değil`).toBeTruthy();
    }
  });
});

describe('belgedeki dosya yolları gerçekten var', () => {
  /*
   * "Nerede ne var" bölümündeki harita, devralanın kodu taramadan yol
   * bulmasını sağlıyor. Bir dosya taşınıp harita güncellenmezse o
   * kazanım kaybolur — üstelik fark edilmeden.
   *
   * Harita bir AĞAÇ olarak yazılı (girinti ile), düz yol listesi olarak
   * değil — öyle okunması daha kolay. Test de ağacı girintiden okuyup
   * yolları yeniden kuruyor. Düz eşleşme arayan ilk yazımda yalnızca üç
   * yol yakalanıyordu ve test hiçbir şey korumuyordu.
   */
  function mapPaths(text: string): string[] {
    /*
     * "Nerede ne var" başlığından SONRAKİ ilk kod bloğu alınıyor.
     * İlk yazımda belgedeki ilk kod bloğu alınmıştı ve o, §0'daki komut
     * listesiydi — test "Konum", "Depo" gibi satırları dosya yolu sanıp
     * kırıldı. Doğru blok başlıkla bulunur, sırayla değil.
     */
    const afterHeading = text.split('Nerede ne var')[1] ?? '';
    const block = afterHeading.split('```')[1] ?? '';
    const stack: string[] = [];
    const out: string[] = [];

    for (const raw of block.split(/\r?\n/)) {
      // Satırın adı: girintiden sonraki ilk simge. Açıklama boşlukla ayrılı.
      const m = /^(\s*)([\w.-]+\/?)(?:\s|$)/.exec(raw);
      if (!m) continue;
      const depth = Math.floor(m[1]!.length / 2);
      const name = m[2]!;

      stack.length = depth;
      if (name.endsWith('/')) {
        stack[depth] = name.slice(0, -1);
        continue;
      }
      // Virgülle biten satırlar birden çok dosya sayıyor (roots-a1..b2.ts gibi)
      if (name.includes('..') || raw.includes('*')) continue;
      out.push([...stack.slice(0, depth), name].filter(Boolean).join('/'));
    }
    return out;
  }

  const yollar = [
    ...mapPaths(HANDOFF),
    ...[...HANDOFF.matchAll(/`((?:src|api|scripts|tests)\/[\w./-]+\.(?:ts|tsx|js|mjs))`/g)].map(
      (m) => m[1]!,
    ),
  ];

  it('haritadan yollar okunabiliyor', () => {
    expect(new Set(yollar).size, `yalnızca ${yollar.length} yol okundu`).toBeGreaterThan(20);
  });

  it('hepsi diskte duruyor', () => {
    const eksik = [...new Set(yollar)].filter((p) => !existsSync(root(p)));
    expect(eksik, `belgede yazan ama bulunmayan dosyalar: ${eksik.join(', ')}`).toEqual([]);
  });
});

describe('durum belgesi güncel', () => {
  const STATE = read('PROJECT_STATE.md');

  it('üretilen sürüm package.json ile aynı', () => {
    /*
     * Kırılırsa: `npm run state` çalıştırılmamış. Durum belgesi eski
     * sürümü gösteriyorsa devralan yanlış bir tabloya bakıyor demektir.
     */
    expect(
      STATE.includes(`v${pkg.version}`),
      `PROJECT_STATE.md v${pkg.version} yerine eski sürümü gösteriyor — npm run state`,
    ).toBe(true);
  });

  it('elle düzenlenmemesi gerektiğini söylüyor', () => {
    expect(STATE.includes('OTOMATİK ÜRETİLİR')).toBe(true);
  });
});

describe('yedekleme yordamı', () => {
  it('checkpoint betiği yerinde', () => {
    expect(existsSync(root('scripts/checkpoint.mjs'))).toBe(true);
    expect(existsSync(root('scripts/state.mjs'))).toBe(true);
  });

  it('checkpoint iki katmanı da anlatıyor — git etiketi ve masaüstü arşivi', () => {
    const src = read('scripts/checkpoint.mjs');
    expect(src.includes('git tag'), 'git etiketi katmanı yok').toBe(true);
    expect(src.includes('Compress-Archive'), 'arşiv katmanı yok').toBe(true);
    // node_modules yedeğe girerse arşiv yüz kat büyür.
    expect(src.includes('node_modules'), 'node_modules dışlanmıyor').toBe(true);
  });
});
