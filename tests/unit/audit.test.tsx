/**
 * Arayüz denetimi.
 *
 * NEDEN OTOMATİK: Gözle bakmak bir kez yapılır ve bir sonraki değişiklikte
 * eskir. Buradaki kontroller her koşuda tekrarlanır ve bozulmayı yakalar.
 * Kapsamı bilinçli olarak "ölçülebilir olan" ile sınırlı: erişilebilir ad,
 * bağlantı hedefi, boş durum, taşma riski. Renk ve boşluk gibi şeyler
 * burada değil, gözle değerlendirilmeli.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';

import Shell from '@/app/Shell';
import HomePage from '@/pages/HomePage';
import LevelPage from '@/pages/LevelPage';
import AlefBetPage from '@/pages/AlefBetPage';
import ReadingPage from '@/pages/ReadingPage';
import VerbsPage from '@/pages/VerbsPage';
import BinyanimPage from '@/pages/BinyanimPage';
import PhrasesPage from '@/pages/PhrasesPage';
import WordsPage from '@/pages/WordsPage';
import GamesPage from '@/pages/GamesPage';
import SoundPage from '@/pages/SoundPage';
import ProgressPage from '@/pages/ProgressPage';
import { NAV_ITEMS } from '@/app/nav';

function renderAt(path: string, element: ReactElement) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/seviye/:level" element={element} />
        <Route path="*" element={element} />
      </Routes>
    </MemoryRouter>,
  );
}

const PAGES: Array<[string, string, ReactElement]> = [
  ['Ana Sayfa', '/', <HomePage />],
  ['Seviye A1', '/seviye/a1', <LevelPage />],
  ['Alef-Bet', '/alefbet', <AlefBetPage />],
  ['Harekeler', '/okuma', <ReadingPage />],
  ['VERB Hebrew', '/verb', <VerbsPage />],
  ['Binyanlar', '/binyanim', <BinyanimPage />],
  ['Kalıplar', '/kaliplar', <PhrasesPage />],
  ['Kelimeler', '/kelimeler', <WordsPage />],
  ['Oyunlar', '/oyunlar', <GamesPage />],
  ['Ses', '/ses', <SoundPage />],
  ['İlerleme', '/ilerleme', <ProgressPage />],
];

describe('her sayfa açılıyor ve içerik basıyor', () => {
  for (const [name, path, element] of PAGES) {
    it(`${name} boş ekran vermiyor`, () => {
      const { container } = renderAt(path, element);
      const text = container.textContent ?? '';
      // Boş ya da neredeyse boş bir sayfa sessiz bir kırılmadır.
      expect(text.trim().length, `${name} neredeyse boş`).toBeGreaterThan(200);
    });

    it(`${name} tek bir ana başlık taşıyor`, () => {
      renderAt(path, element);
      const h1s = screen.queryAllByRole('heading', { level: 1 });
      // Sayfa başlığı ekran okuyucunun ilk tutunduğu yer; iki tane olması
      // kadar sıfır tane olması da yönü kaybettirir.
      expect(h1s.length, `${name} → ${h1s.length} adet h1`).toBe(1);
    });
  }
});

describe('erişilebilirlik — düğmelerin adı var mı', () => {
  for (const [name, path, element] of PAGES) {
    it(`${name} içindeki her düğme okunabilir bir ada sahip`, () => {
      const { container } = renderAt(path, element);
      const nameless: string[] = [];
      for (const btn of container.querySelectorAll('button')) {
        const label =
          btn.getAttribute('aria-label')?.trim() ||
          btn.getAttribute('title')?.trim() ||
          btn.textContent?.trim() ||
          '';
        if (label.length === 0) nameless.push(btn.outerHTML.slice(0, 80));
      }
      expect(nameless, `${name} → adsız düğme:\n${nameless.join('\n')}`).toEqual([]);
    });

    it(`${name} içindeki her giriş alanının açıklaması var`, () => {
      const { container } = renderAt(path, element);
      const bad: string[] = [];
      for (const input of container.querySelectorAll('input')) {
        const described =
          input.getAttribute('aria-label') ||
          input.getAttribute('placeholder') ||
          input.closest('label');
        if (!described) bad.push(input.outerHTML.slice(0, 80));
      }
      expect(bad, `${name} → açıklamasız giriş:\n${bad.join('\n')}`).toEqual([]);
    });
  }
});

describe('bağlantılar', () => {
  const KNOWN = [
    '/',
    '/alefbet',
    '/okuma',
    '/verb',
    '/binyanim',
    '/kaliplar',
    '/kelimeler',
    '/oyunlar',
    '/ses',
    '/ilerleme',
  ];
  const isKnown = (href: string) =>
    KNOWN.includes(href) ||
    href.startsWith('/seviye/') ||
    href.startsWith('/oyunlar/') ||
    href.startsWith('/verb?');

  for (const [name, path, element] of PAGES) {
    it(`${name} içindeki her bağlantı var olan bir sayfaya gidiyor`, () => {
      const { container } = renderAt(path, element);
      const broken: string[] = [];
      for (const a of container.querySelectorAll('a[href]')) {
        const href = a.getAttribute('href') ?? '';
        if (href.startsWith('http') || href.startsWith('#')) continue;
        if (!isKnown(href)) broken.push(href);
      }
      expect(broken, `${name} → tanımsız hedef: ${broken.join(', ')}`).toEqual([]);
    });
  }

  it('kenar çubuğundaki her giriş erişilebilir', () => {
    render(
      <MemoryRouter>
        <Shell>
          <div />
        </Shell>
      </MemoryRouter>,
    );
    const nav = screen.getAllByRole('navigation')[0]!;
    for (const item of NAV_ITEMS) {
      const link = within(nav).queryAllByRole('link', { name: new RegExp(item.label, 'i') });
      expect(link.length, `${item.label} kenar çubuğunda yok`).toBeGreaterThan(0);
    }
  });
});

describe('İbranice metin yönü', () => {
  for (const [name, path, element] of PAGES) {
    it(`${name} içindeki İbranice metinler sağdan sola işaretli`, () => {
      const { container } = renderAt(path, element);
      const HEBREW = /[א-ת]/;
      const unmarked: string[] = [];

      for (const el of container.querySelectorAll('p, span, div, dd, li, summary')) {
        // Yalnızca doğrudan metin taşıyan, çocuğu olmayan öğelere bak.
        if (el.children.length > 0) continue;
        const text = el.textContent ?? '';
        if (!HEBREW.test(text)) continue;
        const marked =
          el.closest('.he') !== null ||
          el.closest('[dir="rtl"]') !== null ||
          el.getAttribute('dir') === 'rtl' ||
          el.getAttribute('dir') === 'auto';
        if (!marked) unmarked.push(text.trim().slice(0, 50));
      }

      expect(
        unmarked,
        `${name} → yönü işaretlenmemiş İbranice metin:\n${unmarked.slice(0, 6).join('\n')}`,
      ).toEqual([]);
    });
  }
});
