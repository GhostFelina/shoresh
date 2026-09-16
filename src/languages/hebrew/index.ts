/**
 * İbranice dil modülü.
 *
 * Bu dosya `core/language.ts` içindeki sözleşmeyi dolduruyor. Kabuk
 * İbranice hakkında BAŞKA hiçbir şey bilmiyor: menüyü, sayfaları,
 * sayaçları, seslendirmeyi ve tekrar öğelerinin nasıl okunacağını
 * buradan alıyor.
 *
 * Korece eklendiğinde yapılacak iş, aynı sözleşmeyi dolduran
 * `src/languages/korean/index.ts` yazıp kayda eklemek. Kabukta tek satır
 * değişmeyecek.
 */
import { lazy } from 'react';
import {
  BookA,
  BookOpen,
  Gamepad2,
  GraduationCap,
  Home,
  Languages,
  Presentation,
  Quote,
  TrendingUp,
  Type,
  Volume2,
} from 'lucide-react';
import type {
  DescribedItem,
  LanguageModule,
  LanguageNavGroup,
  LanguageRoute,
  LanguageStat,
} from '@/core/language';
import type { CEFR } from '@/core/types';
import { parseItemKey } from '@/engine/srs';
import { unscopeKey } from '@/core/language';
import { speak } from '@/lib/speech';

import { CATALOG_STATS, VERB_BY_ID } from '@he/data/catalog';
import { LEXICON_STATS, WORD_BY_ID } from '@he/data/lexicon';
import { PHRASES } from '@he/data/phrases';
import { WRITTEN_SENTENCES } from '@he/data/sentences';
import { LETTERS, LETTER_BY_ID, NIQQUDIM, NIQQUD_BY_ID } from '@he/data/alefbet';
import { GAMES } from '@he/games/engine';
import { LESSONS } from '@he/teacher/lesson';
import { FORM_LABEL, type HebrewForm } from '@he/types';

/* ------------------------------------------------------------------ *
 * Seviyeler
 * ------------------------------------------------------------------ */

/**
 * Seviye sekmeleri — sol kenar çubuğunun omurgası.
 *
 * NEDEN SEVİYE ÖNCE GELİYOR: Sıfırdan başlayan biri için "hangi fiile
 * bakayım" sorusunun cevabı fiilin kendisinde değil, seviyesinde. Menü
 * konuya göre kurulsaydı öğrenci her girişte 445 fiilin içinden kendi
 * düzeyini ayıklamak zorunda kalırdı.
 *
 * Renkler sabit kod değil, paletten gelen değişkenler: palet değişince
 * seviye renkleri de değişir ve uyum bozulmaz.
 */
export const HEBREW_LEVELS: Array<{
  level: CEFR;
  title: string;
  blurb: string;
  tint: string;
}> = [
  {
    level: 'A1',
    title: 'A1 — Başlangıç',
    blurb: 'İlk cümleler, temel fiiller',
    tint: 'var(--color-brand-400)',
  },
  {
    level: 'A2',
    title: 'A2 — Temel',
    blurb: 'Günlük hayatı anlatma',
    tint: 'var(--color-accent-400)',
  },
  {
    level: 'B1',
    title: 'B1 — Orta',
    blurb: 'Fikir yürütme, neden-sonuç',
    tint: 'var(--accent-fem)',
  },
  {
    level: 'B2',
    title: 'B2 — İleri',
    blurb: 'Tartışma ve resmî dil',
    tint: 'var(--accent-text-alt)',
  },
];

/* ------------------------------------------------------------------ *
 * Menü
 * ------------------------------------------------------------------ */

const nav: LanguageNavGroup[] = [
  {
    id: 'genel',
    title: null,
    items: [{ path: '', label: 'Ana Sayfa', hint: 'Genel bakış', icon: Home, end: true }],
  },
  {
    id: 'seviye',
    title: 'Seviyeler',
    items: HEBREW_LEVELS.map((l) => ({
      path: `seviye/${l.level.toLowerCase()}`,
      label: l.title,
      hint: l.blurb,
      badge: l.level,
      tint: l.tint,
    })),
  },
  {
    id: 'temeller',
    title: 'Temeller',
    items: [
      { path: 'alefbet', label: 'Alef-Bet', hint: '22 harf + 5 sofit', icon: Type },
      { path: 'okuma', label: 'Harekeler', hint: 'Ünlüler ve okuma', icon: BookOpen },
    ],
  },
  {
    id: 'fiil',
    title: 'Fiil Motoru',
    items: [
      { path: 'verb', label: 'VERB Hebrew', hint: 'Kök + binyan + çekim', icon: Languages },
      { path: 'binyanim', label: 'Binyanlar', hint: '7 kalıbın haritası', icon: GraduationCap },
      { path: 'kaliplar', label: 'Kalıplar', hint: 'Hazır ifadeler', icon: Quote },
      { path: 'kelimeler', label: 'Kelimeler', hint: 'İsim, sıfat, zarf', icon: BookA },
    ],
  },
  {
    id: 'pratik',
    title: 'Pratik',
    items: [
      {
        path: 'ogretmen',
        label: 'Öğretmen Modu',
        hint: 'Kural, örnek, alıştırma',
        icon: Presentation,
      },
      { path: 'oyunlar', label: 'Oyunlar', hint: 'Alıştırma oyunları', icon: Gamepad2 },
      { path: 'ses', label: 'Ses', hint: 'Seslendirme ve tanılama', icon: Volume2 },
      { path: 'ilerleme', label: 'İlerleme', hint: 'Ne biliyorsun, ne tekrar', icon: TrendingUp },
    ],
  },
];

/* ------------------------------------------------------------------ *
 * Sayfalar
 * ------------------------------------------------------------------ */

/*
 * Sayfalar LAZY: VERB Hebrew bütün çekim tablosunu kuruyor, Alef-Bet 27
 * harf kartı çiziyor, oyunlar kendi motorunu getiriyor. İlk açılışta
 * hepsini birden indirmek telefonda gereksiz bir bekleme demek.
 */
const routes: LanguageRoute[] = [
  { path: '', element: lazy(() => import('@he/pages/HomePage')) },
  { path: 'seviye/:level', element: lazy(() => import('@he/pages/LevelPage')) },
  { path: 'alefbet', element: lazy(() => import('@he/pages/AlefBetPage')) },
  { path: 'okuma', element: lazy(() => import('@he/pages/ReadingPage')) },
  { path: 'verb', element: lazy(() => import('@he/pages/VerbsPage')) },
  { path: 'binyanim', element: lazy(() => import('@he/pages/BinyanimPage')) },
  { path: 'kaliplar', element: lazy(() => import('@he/pages/PhrasesPage')) },
  { path: 'kelimeler', element: lazy(() => import('@he/pages/WordsPage')) },
  { path: 'ogretmen', element: lazy(() => import('@he/pages/TeacherPage')) },
  { path: 'ogretmen/:lessonId', element: lazy(() => import('@he/pages/TeacherPage')) },
  { path: 'oyunlar', element: lazy(() => import('@he/pages/GamesPage')) },
  { path: 'oyunlar/:gameId', element: lazy(() => import('@he/pages/GamesPage')) },
  { path: 'ses', element: lazy(() => import('@he/pages/SoundPage')) },
  { path: 'ilerleme', element: lazy(() => import('@/pages/ProgressPage')) },
] as LanguageRoute[];

/**
 * Bırakılmış adresler.
 *
 * 'fiiller' sayfası 'verb' olarak yeniden adlandırıldı (kullanıcı
 * sekmenin adının "VERB Hebrew" olmasını istedi). Eski adres bir süre
 * yayındaydı, o yüzden yönlendiriliyor.
 */
const aliases: Record<string, string> = {
  fiiller: 'verb',
};

/* ------------------------------------------------------------------ *
 * Sayaçlar
 * ------------------------------------------------------------------ */

const stats = (): LanguageStat[] => [
  { value: CATALOG_STATS.total, label: 'fiil (kök + binyan)' },
  { value: LEXICON_STATS.total, label: 'kelime' },
  { value: PHRASES.length, label: 'kalıp ifade' },
  { value: CATALOG_STATS.totalForms, label: 'çekim biçimi' },
  { value: LETTERS.length, label: 'alfabe harfi' },
  { value: Object.values(WRITTEN_SENTENCES).flat().length, label: 'örnek cümle' },
  { value: LESSONS.length, label: 'öğretmen dersi' },
  { value: GAMES.length, label: 'alıştırma oyunu' },
];

/* ------------------------------------------------------------------ *
 * Tekrar öğesini okunabilir hâle çevirme
 * ------------------------------------------------------------------ */

/**
 * Anahtarı çözmek DİLİN işi.
 *
 * `verb:כתב:paal:present` teknik bir dizedir; öğrenciye "כּוֹתֵב —
 * yazmak · ŞİMDİKİ" diye gösterilmeli. Korece'de "binyan" diye bir şey
 * olmayacak, kendi eksenleri olacak — bu yüzden çözüm kabukta değil
 * burada.
 *
 * Katalogda bulunamayan anahtar null döner: veri değişip bir öğe
 * kaldırılmışsa eski ilerleme kaydı ekranda çöp olarak görünmesin.
 */
function describeItem(rawKey: string): DescribedItem | null {
  /*
   * Anahtar dil önekli saklanıyor (`he:verb:...`). Önek burada
   * çıkarılıyor; çıkarılmasaydı `parseItemKey` 'he' parçasını tür sanıp
   * hiçbir öğeyi bulamazdı ve ilerleme sayfası boş görünürdü.
   */
  const { key } = unscopeKey(rawKey);
  const { kind, id, axis } = parseItemKey(key);

  if (kind === 'verb') {
    const v = VERB_BY_ID.get(id);
    if (!v) return null;
    const axisLabel = axis && axis in FORM_LABEL ? FORM_LABEL[axis as HebrewForm].short : undefined;
    return {
      native: v.lemma.vocalized,
      meaning: v.tr[0] ?? '',
      ...(axisLabel ? { axis: axisLabel } : {}),
    };
  }
  if (kind === 'word') {
    const w = WORD_BY_ID.get(id);
    if (!w) return null;
    return {
      native: w.vocalized,
      meaning: w.tr[0] ?? '',
      ...(axis === 'gender' ? { axis: 'CİNSİYET' } : {}),
    };
  }
  if (kind === 'phrase') {
    const p = PHRASES.find((x) => x.id === id || x.plain === id);
    return p ? { native: p.he, meaning: p.tr } : null;
  }
  if (kind === 'letter') {
    const l = LETTER_BY_ID.get(id);
    return l ? { native: l.glyph, meaning: l.nameTr } : null;
  }
  if (kind === 'niqqud') {
    const n = NIQQUD_BY_ID.get(id);
    return n ? { native: n.mark, meaning: n.nameTr } : null;
  }
  return null;
}

/* ------------------------------------------------------------------ *
 * Ses paketi içeriği
 * ------------------------------------------------------------------ */

/**
 * Çevrimdışı ses paketine girecek metinler.
 *
 * Fiillerde TAM tablo alınmıyor: 445 fiil × ~24 biçim ≈ 10.700 klip eder
 * ve paket 90 MB'a çıkar. Bunun yerine öğrencinin gerçekten dinlediği
 * biçimler alınıyor — sözlük biçimi, mastar ve şimdiki zamanın dört
 * hâli. Kalanı yine çevrimiçi çalınabilir.
 */
function audioTexts(): Array<{ id: string; label: string; texts: string[] }> {
  const verbForms: string[] = [];
  for (const v of VERB_BY_ID.values()) {
    verbForms.push(v.lemma.plain, v.table.infinitive.plain);
    for (const slot of ['ms', 'fs', 'mp', 'fp'] as const) {
      const c = v.table.present[slot];
      if (c) verbForms.push(c.plain);
    }
  }

  return [
    { id: 'letters', label: 'Harf adları', texts: LETTERS.map((l) => l.nameHe) },
    { id: 'niqqud', label: 'Hareke adları', texts: NIQQUDIM.map((n) => n.nameHe) },
    { id: 'words', label: 'Kelimeler', texts: [...WORD_BY_ID.values()].map((w) => w.plain) },
    { id: 'phrases', label: 'Kalıplar', texts: PHRASES.map((p) => p.plain) },
    { id: 'verbs', label: 'Fiiller (sözlük, mastar, şimdiki)', texts: verbForms },
    {
      id: 'sentences',
      label: 'Örnek cümleler',
      texts: Object.values(WRITTEN_SENTENCES)
        .flat()
        .map((s) => s.plain),
    },
  ];
}

/* ------------------------------------------------------------------ *
 * Modül
 * ------------------------------------------------------------------ */

export const hebrew: LanguageModule = {
  id: 'he',
  name: { tr: 'İbranice', en: 'Hebrew' },
  nativeName: 'עִבְרִית',
  englishName: 'Hebrew',
  direction: 'rtl',
  levels: HEBREW_LEVELS.map((l) => l.level),
  blurb: {
    tr: 'Kökten öğrenilen Modern İbranice — A1’den B2’ye',
    en: 'Modern Hebrew from the root up — A1 to B2',
  },
  nav,
  routes,
  aliases,
  stats,
  describeItem,
  speak: (text, opts) => speak(text, { slow: opts?.slow ?? true }),
  audioTexts,
};
