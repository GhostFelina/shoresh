/**
 * PROJECT_STATE.md üretir — projenin ÖLÇÜLEBİLİR durumu.
 *
 * NEDEN ÜRETİLİYOR, ELLE YAZILMIYOR: Devir belgesindeki sayılar (kaç
 * fiil, kaç test, hangi sürüm) elle yazılsaydı ilk değişiklikte eskirdi
 * ve devralan kişi yanlış bir tabloya göre karar verirdi. Eski bir belge,
 * belge olmamasından daha tehlikelidir.
 *
 * `AI_HANDOFF.md` ise ELLE yazılır: orada sayı değil KARAR ve GEREKÇE
 * var, onlar kendiliğinden değişmiyor.
 *
 * KULLANIM: node scripts/state.mjs
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const sh = (cmd) => {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
};

const strip = (s) => s.replace(/\[[0-9;]*m/g, '');

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));

console.log('Durum olculuyor...');

/* --- İçerik sayıları: gerçek modüllerden, tahminle değil --- */
const probe = `
import { CATALOG_STATS, VERBS } from '@/data/catalog';
import { LEXICON_STATS } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import { WRITTEN_SENTENCES } from '@/data/sentences';
import { LETTERS, NIQQUDIM } from '@/data/alefbet';
import { GAMES } from '@/features/games/engine';
import { LESSONS } from '@/features/teacher/lesson';
import { RELEASES } from '@/data/changelog';
import { PALETTES } from '@/lib/palette';
import { BADGES, RANKS } from '@/engine/reward';
import { describe, it } from 'vitest';
describe('durum', () => {
  it('olc', () => {
    console.log('__STATE__' + JSON.stringify({
      fiil: VERBS.length,
      kok: CATALOG_STATS.distinctRoots,
      cekim: CATALOG_STATS.totalForms,
      binyan: CATALOG_STATS.byBinyan,
      gizra: Object.keys(CATALOG_STATS.byGizra).length,
      kelime: LEXICON_STATS.total,
      konu: LEXICON_STATS.topics,
      kalip: PHRASES.length,
      cumle: Object.values(WRITTEN_SENTENCES).flat().length,
      harf: LETTERS.length,
      hareke: NIQQUDIM.length,
      oyun: GAMES.length,
      ders: LESSONS.length,
      surum: RELEASES.length,
      palet: PALETTES.length,
      rozet: BADGES.length,
      rutbe: RANKS.length,
    }));
  });
});
`;
writeFileSync(join(ROOT, 'tests/unit/_state.test.ts'), probe, 'utf-8');
const probeOut = strip(sh('npx vitest run tests/unit/_state.test.ts 2>&1'));
sh('node -e "require(\'fs\').unlinkSync(\'tests/unit/_state.test.ts\')"');

const m = /__STATE__(\{.*\})/.exec(probeOut);
const stats = m ? JSON.parse(m[1]) : {};

/* --- Test sayısı --- */
const testOut = strip(sh('npm run -s test 2>&1'));
const testCount = /Tests\s+(\d+)\s+passed/.exec(testOut)?.[1] ?? '?';
const testFiles = /Test Files\s+(\d+)\s+passed/.exec(testOut)?.[1] ?? '?';
const testsFailed = /Tests\s+\d+\s+failed/.test(testOut);

/* --- Kod büyüklüğü --- */
const countLines = (dir) => {
  let n = 0;
  const walk = (d) => {
    for (const e of readdirSync(join(ROOT, d), { withFileTypes: true })) {
      if (e.name === 'node_modules') continue;
      const p = `${d}/${e.name}`;
      if (e.isDirectory()) walk(p);
      else if (/\.(ts|tsx)$/.test(e.name)) n += readFileSync(join(ROOT, p), 'utf-8').split('\n').length;
    }
  };
  walk(dir);
  return n;
};

const srcLines = countLines('src');
const testLines = countLines('tests');

/* --- Git --- */
const commit = sh('git rev-parse --short HEAD');
const branch = sh('git rev-parse --abbrev-ref HEAD');
const lastCommits = sh('git log -8 --format="%ad · %s" --date=format:"%d.%m %H:%M"');
const tags = sh('git tag --sort=-creatordate').split('\n').filter(Boolean).slice(0, 8);
const dirty = sh('git status --porcelain');

/* --- Yazım --- */
const now = new Date().toLocaleString('tr-TR');

const binyanRows = Object.entries(stats.binyan ?? {})
  .filter(([, n]) => n > 0)
  .map(([k, n]) => `${k} ${n}`)
  .join(' · ');

const out = `<!--
  OTOMATİK ÜRETİLİR — elle düzenleme.
  Yenilemek için: npm run state

  Buradaki her sayı projenin kendisinden ölçüldü. Elle yazılsaydı ilk
  değişiklikte eskir ve devralan yanlış bir tabloya göre karar verirdi.
  KARARLAR ve GEREKÇELER burada değil, AI_HANDOFF.md içinde.
-->

# Shoresh — ölçülen durum

**Üretim anı:** ${now}
**Sürüm:** v${pkg.version} · **Dal:** ${branch} · **Commit:** ${commit}
**Çalışma ağacı:** ${dirty ? '⚠ TEMİZ DEĞİL (commit edilmemiş değişiklik var)' : 'temiz'}

## Testler

| | |
|---|---|
| Durum | ${testsFailed ? '⚠ KIRIK' : 'hepsi geçiyor'} |
| Birim testi | ${testCount} |
| Test dosyası | ${testFiles} |
| Kaynak satırı | ${srcLines.toLocaleString('tr-TR')} |
| Test satırı | ${testLines.toLocaleString('tr-TR')} |

## İçerik

| Ne | Kaç |
|---|---|
| Fiil (kök + binyan) | ${stats.fiil ?? '?'} |
| Farklı kök | ${stats.kok ?? '?'} |
| Üretilen çekim biçimi | ${(stats.cekim ?? 0).toLocaleString('tr-TR')} |
| Kelime | ${stats.kelime ?? '?'} (${stats.konu ?? '?'} konu) |
| Kalıp | ${stats.kalip ?? '?'} |
| Elle yazılmış örnek cümle | ${stats.cumle ?? '?'} |
| Harf / hareke | ${stats.harf ?? '?'} / ${stats.hareke ?? '?'} |
| Alıştırma oyunu | ${stats.oyun ?? '?'} |
| Öğretmen modu dersi | ${stats.ders ?? '?'} |

**Binyan dağılımı:** ${binyanRows || '?'}
**Desteklenen gizra sınıfı:** ${stats.gizra ?? '?'}

## Sistemler

| | |
|---|---|
| Renk paleti | ${stats.palet ?? '?'} |
| Rozet | ${stats.rozet ?? '?'} |
| Rütbe | ${stats.rutbe ?? '?'} |
| Kayda geçmiş sürüm | ${stats.surum ?? '?'} |

## Son commit'ler

\`\`\`
${lastCommits}
\`\`\`

## Checkpoint etiketleri

${tags.length ? tags.map((t) => `- \`${t}\``).join('\n') : '_henüz etiket yok_'}

---

_Kararlar, gerekçeler ve devam yordamı için: **AI_HANDOFF.md**_
`;

writeFileSync(join(ROOT, 'PROJECT_STATE.md'), out, 'utf-8');
console.log('PROJECT_STATE.md yazildi.');
console.log(`  v${pkg.version} · ${testCount} test · ${stats.fiil ?? '?'} fiil · ${stats.kelime ?? '?'} kelime · ${stats.ders ?? '?'} ders`);
