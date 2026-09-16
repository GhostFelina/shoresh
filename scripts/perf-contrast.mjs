/**
 * Açık/koyu temada GERÇEK kontrastı ölçer.
 *
 * NEDEN VAR: Kullanıcı "açık tema bozuk" dedi. Palet birim testi her
 * tonu WCAG eşiğinden geçiriyor ve geçiyor — yani sorun paletin
 * TANIMINDA değil, KULLANIMINDA. Bir öğe paletten gelmeyen sabit bir
 * renk taşıyorsa ya da koyu temaya göre yazılmış bir `rgba(255,…)`
 * kullanıyorsa birim testi bunu asla göremez; yalnızca çizilmiş
 * sayfada ölçülebilir.
 *
 * Ne yapıyor: her sayfayı iki temada da açıyor, görünür her metin
 * düğümünün HESAPLANMIŞ rengini ve arkasındaki gerçek zemini alıp
 * kontrast oranını hesaplıyor. Eşiğin altındakileri seçiciyle birlikte
 * yazıyor.
 *
 * Kullanım: node scripts/perf-contrast.mjs
 */
import { chromium } from '@playwright/test';

const PORT = process.env.SHORESH_PORT ?? '5400';
const KOK = `http://localhost:${PORT}`;

const SAYFALAR = [
  '/he',
  '/he/verb',
  '/he/ogretmen',
  '/he/kelimeler',
  '/he/ilerleme',
  '/he/oyunlar',
  '/he/alefbet',
];

/** WCAG 2.1 bağıl parlaklık. */
const olcum = `(() => {
  const luma = (r, g, b) => {
    const f = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const ayikla = (renk) => {
    const m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)(?:,\\s*([\\d.]+))?\\)/.exec(renk);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };

  /*
   * Gerçek zemin: öğenin kendi zemini saydamsa ataya çıkılıyor.
   * Bunu yapmayan bir ölçüm "zemin saydam, kontrast sonsuz" der ve
   * asıl bozuk yeri atlar.
   */
  const zemin = (el) => {
    let d = el;
    while (d) {
      const st = getComputedStyle(d);
      /*
       * GEÇİŞLİ ZEMİN ÖLÇÜLEMİYOR. linear-gradient bir görüntü;
       * backgroundColor saydam kalıyor ve düz bir okuma yapılırsa
       * ölçüm sayfanın zeminine kadar tırmanıp "1.07:1" gibi anlamsız
       * bir sonuç üretiyor — birincil düğme tam olarak böyle yanlış
       * bildirildi. Bu öğeler atlanıyor ve SAYILIYOR; sessizce
       * geçilseydi gerçek bir sorun da saklanabilirdi. Dolu düğmenin
       * kontrastı zaten birim testinde ölçülüyor
       * (tests/unit/semantic-colors.test.ts).
       */
      if (st.backgroundImage && st.backgroundImage !== 'none') return null;
      const c = ayikla(st.backgroundColor);
      if (c && c.a > 0.5) return c;
      d = d.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };

  const kisaSecici = (el) => {
    const parcalar = [];
    let d = el;
    for (let i = 0; i < 3 && d && d.tagName !== 'BODY'; i++) {
      parcalar.unshift(d.tagName.toLowerCase() + (d.className && typeof d.className === 'string'
        ? '.' + d.className.trim().split(/\\s+/).slice(0, 2).join('.')
        : ''));
      d = d.parentElement;
    }
    return parcalar.join(' > ');
  };

  const sonuc = [];
  let olculemeyen = 0;
  for (const el of document.querySelectorAll('main *, header *, aside *')) {
    // Yalnızca kendi metnini taşıyan öğeler; kapsayıcıları saymıyoruz.
    const kendiMetni = [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent.trim())
      .join('');
    if (kendiMetni.length < 2) continue;

    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) continue;
    const st = getComputedStyle(el);
    if (st.visibility === 'hidden' || st.opacity === '0' || st.display === 'none') continue;
    /*
     * Geçişli başlıklar ATLANIYOR: metin rengi bilerek saydam, görünen
     * renk zemin geçişinden geliyor. Ölçüm bunu bilmezse her sayfa
     * başlığını "1.04:1" diye bildirir ve gerçek bulguları gömer.
     */
    if (st.webkitTextFillColor === 'rgba(0, 0, 0, 0)' || st.backgroundClip === 'text') continue;

    const on = ayikla(st.color);
    if (!on) continue;
    const arka = zemin(el);
    if (!arka) {
      olculemeyen++;
      continue;
    }
    const l1 = luma(on.r, on.g, on.b);
    const l2 = luma(arka.r, arka.g, arka.b);
    const oran = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

    // Büyük metin için eşik 3:1, normal metin için 4.5:1.
    const punto = parseFloat(st.fontSize);
    const kalin = parseInt(st.fontWeight, 10) >= 700;
    const buyuk = punto >= 24 || (punto >= 18.66 && kalin);
    const esik = buyuk ? 3 : 4.5;

    if (oran < esik) {
      sonuc.push({
        secici: kisaSecici(el),
        metin: kendiMetni.slice(0, 40),
        oran: Math.round(oran * 100) / 100,
        esik,
        renk: st.color,
        zemin: \`rgb(\${arka.r}, \${arka.g}, \${arka.b})\`,
      });
    }
  }
  return { sonuc, olculemeyen };
})()`;

const tarayici = await chromium.launch();
const sayfa = await tarayici.newPage({ viewport: { width: 1440, height: 900 } });

let toplam = 0;
let atlanan = 0;
for (const tema of ['light', 'dark']) {
  console.log(`\n===== ${tema.toUpperCase()} TEMA =====`);
  for (const yol of SAYFALAR) {
    /*
     * TEMA SAYFA AÇILMADAN yazılıyor. Açıldıktan sonra yazmak, satır içi
     * palet tonları yüzünden "beyaz zemin + koyu tema renkleri" melezi
     * üretiyor ve ölçümü anlamsız kılıyor.
     */
    await sayfa.addInitScript((t) => {
      try {
        localStorage.setItem('shoresh.theme', t);
        localStorage.setItem('shoresh.seenVersion', '999.999.999');
      } catch {
        /* özel pencerede yazılamayabilir; ölçüm yine de yapılır */
      }
    }, tema);

    await sayfa.goto(KOK + yol, { waitUntil: 'domcontentloaded' });
    await sayfa.waitForTimeout(900);

    const gercekTema = await sayfa.evaluate(() => document.documentElement.dataset.theme ?? '(yok)');
    const { sonuc: bulgular, olculemeyen } = await sayfa.evaluate(olcum);
    toplam += bulgular.length;
    atlanan += olculemeyen;

    if (bulgular.length === 0) {
      const not = olculemeyen > 0 ? `  (${olculemeyen} geçişli zemin atlandı)` : '';
      console.log(`  ${yol}  (data-theme=${gercekTema})  temiz${not}`);
      continue;
    }
    console.log(`  ${yol}  (data-theme=${gercekTema})  ${bulgular.length} sorun:`);
    const gorulen = new Set();
    for (const b of bulgular) {
      const anahtar = b.secici + b.renk;
      if (gorulen.has(anahtar)) continue;
      gorulen.add(anahtar);
      console.log(
        `    ${b.oran}:1 (eşik ${b.esik}) · ${b.renk} üzerinde ${b.zemin}\n` +
          `      ${b.secici}\n      "${b.metin}"`,
      );
    }
  }
}

await tarayici.close();
console.log(`\nToplam eşik altı metin: ${toplam}`);
