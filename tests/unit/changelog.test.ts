/**
 * Sürüm notu testleri.
 *
 * NEDEN: Bu veri kullanıcının gördüğü TEK sürüm kaydı. Bir sürüm
 * atlanırsa ya da numara package.json ile tutmazsa kutu ya hiç açılmaz
 * ya da yanlış sürümü anlatır — ikisi de sessizce olur.
 */
import { describe, expect, it } from 'vitest';
import { LATEST, RELEASES, releasesSince } from '@/data/changelog';
import { APP_VERSION } from '@/lib/version';

const SEMVER = /^\d+\.\d+\.\d+$/;

const toNumbers = (v: string): number[] => v.split('.').map(Number);

function isNewer(a: string, b: string): boolean {
  const [a1, a2, a3] = toNumbers(a) as [number, number, number];
  const [b1, b2, b3] = toNumbers(b) as [number, number, number];
  if (a1 !== b1) return a1 > b1;
  if (a2 !== b2) return a2 > b2;
  return a3 > b3;
}

describe('sürüm notu verisi', () => {
  it('en yeni not, uygulamanın sürümüyle aynı', () => {
    /*
     * Bu testin kırılması "notu yazmayı unuttun" demektir. package.json
     * yükseltilip not eklenmezse kutu eski sürümü anlatır; not eklenip
     * sürüm yükseltilmezse kutu hiç açılmaz.
     */
    expect(LATEST.version, 'changelog.ts en üstteki sürüm package.json ile aynı olmalı').toBe(
      APP_VERSION,
    );
  });

  it('numaralar semver ve tekil', () => {
    for (const r of RELEASES) expect(r.version, r.title).toMatch(SEMVER);
    expect(new Set(RELEASES.map((r) => r.version)).size).toBe(RELEASES.length);
  });

  it('yeniden eskiye sıralı', () => {
    for (let i = 1; i < RELEASES.length; i++) {
      const newer = RELEASES[i - 1]!.version;
      const older = RELEASES[i]!.version;
      expect(isNewer(newer, older), `${newer} > ${older} olmalı`).toBe(true);
    }
  });

  it('her sürümde başlık, özet, en az bir madde ve en az bir kazanım var', () => {
    for (const r of RELEASES) {
      expect(r.title.trim().length, r.version).toBeGreaterThan(3);
      expect(r.summary.trim().length, r.version).toBeGreaterThan(25);
      expect(r.changes.length, `${r.version} maddesiz`).toBeGreaterThan(0);
      // "Bu sana ne kazandırıyor" bölümü boş kalırsa not bir iş listesine
      // dönüşür; kutunun asıl işi o bölümdür.
      expect(r.benefits.length, `${r.version} kazanımsız`).toBeGreaterThan(0);
      for (const b of r.benefits) {
        expect(b.text.trim().length, `${r.version}/${b.title} çok kısa`).toBeGreaterThan(40);
      }
    }
  });

  it('yayın anları geçerli ve yeniden eskiye', () => {
    /*
     * Karşılaştırma `date` değil `releasedAt` üzerinden: bir günde birden
     * çok sürüm çıkabiliyor ve gün alanı o sırayı taşıyamıyor. İlk
     * yazılışında gün alanı kullanılmıştı ve 1.8.0 için yanlış bir gün
     * yazıldığı sessizce fark edilmemişti; bu test onu yakaladı.
     */
    for (const r of RELEASES) {
      expect(Number.isNaN(new Date(r.date).getTime()), `${r.version} date`).toBe(false);
      expect(Number.isNaN(new Date(r.releasedAt).getTime()), `${r.version} releasedAt`).toBe(false);
      // Gün alanı, yayın anının günüyle aynı olmalı.
      expect(r.releasedAt.startsWith(r.date), `${r.version} gün ile an tutmuyor`).toBe(true);
    }
    for (let i = 1; i < RELEASES.length; i++) {
      const newer = new Date(RELEASES[i - 1]!.releasedAt).getTime();
      const older = new Date(RELEASES[i]!.releasedAt).getTime();
      expect(newer, `${RELEASES[i - 1]!.version} > ${RELEASES[i]!.version}`).toBeGreaterThan(older);
    }
  });
});

describe('hangi notlar gösterilecek', () => {
  it('hiç görmemiş kullanıcıya yalnızca son sürüm gösterilir', () => {
    // Bütün geçmişi açmak ilk açılışta duvar gibi bir metin olurdu.
    expect(releasesSince(null)).toEqual([LATEST]);
  });

  it('atlanan sürümler de gösterilir — bir hafta açmayan üçünü birden görür', () => {
    const third = RELEASES[2]!.version;
    const shown = releasesSince(third);
    expect(shown.map((r) => r.version)).toEqual([RELEASES[0]!.version, RELEASES[1]!.version]);
  });

  it('güncel kullanıcıya hiçbir şey gösterilmez', () => {
    expect(releasesSince(LATEST.version)).toEqual([]);
  });

  it('bilinmeyen sürüm kaydı bütün geçmişi açmaz', () => {
    // Elle silinmiş kayıt ya da ileri sürümden geri dönüş.
    expect(releasesSince('0.0.1')).toEqual([LATEST]);
  });
});

describe('zaman damgası', () => {
  it('derleme anı geçerli bir ISO tarihi', async () => {
    const { BUILD_TIME } = await import('@/lib/version');
    expect(Number.isNaN(new Date(BUILD_TIME).getTime())).toBe(false);
  });

  it('göreli süreyi doğru anlatıyor', async () => {
    const { formatBuildTime } = await import('@/lib/version');
    const now = new Date('2026-09-16T12:00:00Z');
    expect(formatBuildTime('2026-09-16T11:59:30Z', now)).toContain('az önce');
    expect(formatBuildTime('2026-09-16T11:30:00Z', now)).toContain('30 dakika önce');
    expect(formatBuildTime('2026-09-16T09:00:00Z', now)).toContain('3 saat önce');
    expect(formatBuildTime('2026-09-14T12:00:00Z', now)).toContain('2 gün önce');
  });

  it('bozuk değerde çökmüyor', async () => {
    const { formatBuildTime } = await import('@/lib/version');
    expect(formatBuildTime('bu bir tarih değil')).toBe('bilinmiyor');
  });
});
