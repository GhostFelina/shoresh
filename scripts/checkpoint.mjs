/**
 * Checkpoint — sürüm yedeği alır.
 *
 * NEDEN GIT YETMİYOR: Git depo bozulursa, yanlışlıkla `reset --hard`
 * yapılırsa ya da GitHub'a erişilemezse elde bir şey kalmıyor. Depodan
 * BAĞIMSIZ, açılıp doğrudan çalıştırılabilir bir kopya gerekiyor.
 *
 * NEDEN SADECE ZIP DE YETMİYOR: Zip'in içinde ne olduğunu, hangi
 * commit'ten alındığını ve o an testlerin geçip geçmediğini bilmezsen
 * geri dönerken neye döndüğünü bilemezsin. Her yedek yanında bir künye
 * dosyası taşıyor.
 *
 * İKİ KATMAN:
 *   1. Git etiketi (tag) — GitHub'da durur, `git checkout v1.16.0` ile dönülür
 *   2. Masaüstü arşivi   — depodan bağımsız, `Shoresh-Yedek` klasöründe
 *
 * KULLANIM
 *   node scripts/checkpoint.mjs            → yedek al
 *   node scripts/checkpoint.mjs --list     → yedekleri listele
 *   node scripts/checkpoint.mjs --no-tag   → yalnızca arşiv, etiket açma
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ROOT = process.cwd();
const BACKUP_DIR = join(homedir(), 'Desktop', 'Shoresh-Yedek');

/** Kaç yedek saklanır. Fazlası diski doldurur, azı geri dönüşü kısıtlar. */
const KEEP = 12;

const sh = (cmd, allowFail = false) => {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (err) {
    if (allowFail) return '';
    throw err;
  }
};

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf-8'));
const version = pkg.version;

/* ------------------------------------------------------------------ *
 * Listeleme
 * ------------------------------------------------------------------ */

if (process.argv.includes('--list')) {
  if (!existsSync(BACKUP_DIR)) {
    console.log('Henüz yedek yok:', BACKUP_DIR);
    process.exit(0);
  }
  const files = readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith('.zip'))
    .map((f) => ({ f, t: statSync(join(BACKUP_DIR, f)).mtimeMs, mb: statSync(join(BACKUP_DIR, f)).size / 1048576 }))
    .sort((a, b) => b.t - a.t);

  console.log(`${files.length} yedek — ${BACKUP_DIR}\n`);
  for (const { f, t, mb } of files) {
    console.log(`  ${new Date(t).toLocaleString('tr-TR')}  ${mb.toFixed(1)} MB  ${f}`);
  }
  console.log('\nGit etiketleri:');
  console.log(sh('git tag --sort=-creatordate', true).split('\n').slice(0, 12).map((t) => '  ' + t).join('\n'));
  process.exit(0);
}

/* ------------------------------------------------------------------ *
 * Yedek alma
 * ------------------------------------------------------------------ */

const dirty = sh('git status --porcelain', true);
if (dirty) {
  /*
   * Kirli çalışma ağacından yedek almak YASAK DEĞİL ama uyarılıyor:
   * yedeğin künyesindeki commit, içindeki dosyalarla tutmaz. Bilerek
   * yapılıyorsa sorun yok; farkında olmadan yapılıyorsa geri dönüşte
   * kafa karışıklığı çıkar.
   */
  console.warn('UYARI: calisma agaci temiz degil. Yedek, commit edilmemis degisiklikleri de icerecek.');
}

const commit = sh('git rev-parse HEAD', true) || 'commit-yok';
const shortCommit = commit.slice(0, 8);
const branch = sh('git rev-parse --abbrev-ref HEAD', true) || 'dal-yok';
const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const name = `shoresh-v${version}-${stamp}-${shortCommit}`;

mkdirSync(BACKUP_DIR, { recursive: true });

/*
 * Arşiv `git archive` ile DEĞİL, dosya kopyasıyla alınıyor.
 * `git archive` yalnızca commit edilmiş dosyaları alır; yedeğin amacı
 * tam olarak o anki durumu dondurmak — commit edilmemiş bir düzeltmenin
 * kaybolması yedeği anlamsız kılar.
 *
 * node_modules ve dist dışarıda: ikisi de `npm ci` ve `npm run build`
 * ile yeniden üretilebiliyor ve arşivi yüz kat büyütüyorlar.
 */
const EXCLUDE = ['node_modules', 'dist', '.git', 'screenshots', 'test-results', 'playwright-report'];

const zipPath = join(BACKUP_DIR, `${name}.zip`);
const excludeArgs = EXCLUDE.map((e) => `'${e}'`).join(', ');

console.log('Yedek aliniyor:', zipPath);

/*
 * Windows'ta PowerShell'in Compress-Archive'i kullanılıyor — ek bir araç
 * kurmayı gerektirmiyor. `-Force` varsa üzerine yazar; ad zaman damgası
 * taşıdığı için çakışma zaten beklenmiyor.
 */
const ps = `
$ErrorActionPreference = 'Stop'
$src = '${ROOT.replace(/\\/g, '\\\\')}'
$dst = '${zipPath.replace(/\\/g, '\\\\')}'
$exclude = @(${excludeArgs})
$items = Get-ChildItem -LiteralPath $src -Force | Where-Object { $exclude -notcontains $_.Name }
Compress-Archive -Path $items.FullName -DestinationPath $dst -CompressionLevel Optimal -Force
`;

try {
  execSync(`powershell -NoProfile -NonInteractive -Command "${ps.replace(/\n/g, '; ').replace(/"/g, '\\"')}"`, {
    stdio: ['ignore', 'pipe', 'pipe'],
  });
} catch (err) {
  console.error('Arsiv olusturulamadi:', String(err).slice(0, 400));
  process.exit(1);
}

const sizeMb = statSync(zipPath).size / 1048576;

/* ------------------------------------------------------------------ *
 * Künye — geri dönerken neye döndüğünü bilmek için
 * ------------------------------------------------------------------ */

const tests = sh('npm run -s test 2>&1', true);
const testLine = /Tests\s+(\d+)\s+passed/.exec(tests.replace(/\[[0-9;]*m/g, ''));

const info = {
  surum: version,
  alinmaAni: new Date().toISOString(),
  commit,
  dal: branch,
  calismaAgaciTemizMi: dirty === '',
  gecenTest: testLine ? Number(testLine[1]) : null,
  arsiv: zipPath,
  boyutMb: Number(sizeMb.toFixed(2)),
  geriDonus: [
    `Git ile:      git checkout v${version}`,
    `Arsiv ile:    ${zipPath} dosyasini acip 'npm ci' calistir`,
    `Commit'e don: git checkout ${shortCommit}`,
  ],
};

writeFileSync(join(BACKUP_DIR, `${name}.json`), JSON.stringify(info, null, 2), 'utf-8');

/* ------------------------------------------------------------------ *
 * Eski yedekleri budama
 * ------------------------------------------------------------------ */

const zips = readdirSync(BACKUP_DIR)
  .filter((f) => f.endsWith('.zip'))
  .map((f) => ({ f, t: statSync(join(BACKUP_DIR, f)).mtimeMs }))
  .sort((a, b) => b.t - a.t);

for (const { f } of zips.slice(KEEP)) {
  rmSync(join(BACKUP_DIR, f), { force: true });
  rmSync(join(BACKUP_DIR, f.replace(/\.zip$/, '.json')), { force: true });
  console.log('  eski yedek silindi:', f);
}

/* ------------------------------------------------------------------ *
 * Git etiketi — GitHub tarafındaki checkpoint
 * ------------------------------------------------------------------ */

if (!process.argv.includes('--no-tag')) {
  const tag = `v${version}`;
  const exists = sh(`git tag -l ${tag}`, true);
  if (exists) {
    console.log(`Etiket ${tag} zaten var, dokunulmadi.`);
  } else {
    sh(`git tag -a ${tag} -m "Checkpoint v${version} - ${info.gecenTest ?? '?'} test"`, true);
    const pushed = sh(`git push origin ${tag} 2>&1`, true);
    console.log(`Etiket olusturuldu: ${tag}${pushed.includes('error') ? ' (push basarisiz)' : ' ve GitHub a gonderildi'}`);
  }
}

console.log(`\nTamam. ${sizeMb.toFixed(1)} MB · ${info.gecenTest ?? '?'} test · commit ${shortCommit}`);
console.log('Geri donus yollari kunyede:', join(BACKUP_DIR, `${name}.json`));
