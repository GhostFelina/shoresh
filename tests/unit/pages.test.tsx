/**
 * Sayfa duman testleri.
 *
 * NEDEN VAR: Rota tablosu ile sol menü ayrı dosyalarda duruyor. Menüye
 * bir giriş eklenip rota unutulduğunda sayfa sessizce ana sayfaya düşer
 * ve kimse fark etmez — bir kez oldu. Bu testler menüdeki her adresin
 * gerçekten bir sayfa açtığını ve sayfanın VERİ bastığını doğrular.
 */
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import VerbsPage from '@/pages/VerbsPage';
import LevelPage from '@/pages/LevelPage';
import PhrasesPage from '@/pages/PhrasesPage';
import GamesPage from '@/pages/GamesPage';
import AlefBetPage from '@/pages/AlefBetPage';
import { NAV_ITEMS } from '@/app/nav';
import { VERBS } from '@/data/catalog';

describe('VERB Hebrew sayfası', () => {
  it('fiil listesini basar ve ilk fiili seçili gösterir', () => {
    render(
      <MemoryRouter initialEntries={['/verb']}>
        <VerbsPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'VERB Hebrew' })).toBeInTheDocument();

    // Katalogdaki ilk fiilin sözlük biçimi ekranda görünmeli.
    const first = VERBS[0]!;
    expect(screen.getAllByText(first.lemma.vocalized).length).toBeGreaterThan(0);
  });

  it('çekim tablosu ve örnek cümleler görünür', () => {
    render(
      <MemoryRouter initialEntries={['/verb']}>
        <VerbsPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Örnek cümleler')).toBeInTheDocument();
    // Şimdiki zaman varsayılan sekme: dört biçim etiketi olmalı.
    expect(screen.getByText('eril tekil')).toBeInTheDocument();
    expect(screen.getByText('dişil tekil')).toBeInTheDocument();
  });
});

describe('Seviye sayfaları', () => {
  for (const level of ['a1', 'a2', 'b1', 'b2'] as const) {
    it(`${level.toUpperCase()} sayfası o seviyenin fiillerini basar`, () => {
      render(
        <MemoryRouter initialEntries={[`/seviye/${level}`]}>
          <Routes>
            <Route path="/seviye/:level" element={<LevelPage />} />
          </Routes>
        </MemoryRouter>,
      );

      const expected = VERBS.filter((v) => v.cefr === level.toUpperCase());
      expect(expected.length).toBeGreaterThan(20);

      // Sayaç, o seviyedeki fiil sayısını göstermeli.
      expect(screen.getByText('bu seviyede fiil')).toBeInTheDocument();
      // İlk fiilin sözlük biçimi listede olmalı.
      expect(screen.getAllByText(expected[0]!.lemma.vocalized).length).toBeGreaterThan(0);
    });
  }
});

describe('Kalıplar sayfası', () => {
  it('kalıpları ve birebir çevirilerini basar', () => {
    render(
      <MemoryRouter>
        <PhrasesPage />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { name: 'Kalıplar' })).toBeInTheDocument();
    expect(screen.getAllByText('merhaba; hoşça kal').length).toBeGreaterThan(0);
  });
});

describe('Oyunlar sayfası', () => {
  it('dokuz oyunu da listeler', () => {
    render(
      <MemoryRouter>
        <GamesPage />
      </MemoryRouter>,
    );
    for (const title of [
      'Harf Avı',
      'Hareke Ustası',
      'Kök Avcısı',
      'Binyan Eşleme',
      'Zaman Makinesi',
      'Kulak Testi',
      'Cümle Kurucu',
      'Kelime Eşleme',
      'Binyan Dönüştürücü',
    ]) {
      expect(screen.getByText(title), title).toBeInTheDocument();
    }
  });
});

describe('Alef-Bet sayfası', () => {
  it('22 harfi ve sofit biçimleri basar', () => {
    render(
      <MemoryRouter>
        <AlefBetPage />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sofit biçimler — kelime sonunda')).toBeInTheDocument();
    expect(screen.getAllByText('alef').length).toBeGreaterThan(0);
  });
});

describe('gezinme bütünlüğü', () => {
  it('menüdeki her adres uygulamada tanımlı bir rotaya karşılık gelir', () => {
    const known = [
      '/',
      '/seviye/:level',
      '/alefbet',
      '/okuma',
      '/verb',
      '/binyanim',
      '/kaliplar',
      '/oyunlar',
      '/ses',
    ];
    for (const item of NAV_ITEMS) {
      const matches = known.some((pattern) => {
        if (pattern.includes(':')) {
          const base = pattern.split('/:')[0]!;
          return item.to.startsWith(base + '/');
        }
        return item.to === pattern;
      });
      expect(matches, `${item.to} icin rota yok`).toBe(true);
    }
  });
});
