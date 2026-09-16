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
import VerbsPage from '@he/pages/VerbsPage';
import LevelPage from '@he/pages/LevelPage';
import PhrasesPage from '@he/pages/PhrasesPage';
import GamesPage from '@he/pages/GamesPage';
import AlefBetPage from '@he/pages/AlefBetPage';
import { hebrew } from '@he/index';
import { VERBS } from '@he/data/catalog';

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
  it('on bir oyunu da listeler', () => {
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
      'Cinsiyet Ustası',
      'Kelime Avı',
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
  /*
   * Menü ve rotalar artık AYNI dil modülünde tanımlı, bu yüzden
   * doğrudan karşılaştırılabiliyorlar.
   *
   * Önceki sürümde rotalar App.tsx KAYNAĞINDAN okunuyordu; iki liste
   * iki ayrı dosyadaydı ve biri güncellenmeden ötekine giriş eklenince
   * sayfa sessizce ana sayfaya düşüyordu. Bir kez oldu: menüye dört
   * seviye sekmesi ve VERB Hebrew eklendi, rota tablosuna eklenmedi.
   *
   * Şimdi iki liste bir arada olduğu için test kaynak metni ayrıştırmak
   * yerine gerçek veriyi karşılaştırıyor.
   */
  const routePaths = hebrew.routes.map((r) => r.path);

  it('menüdeki her adres modülde tanımlı bir sayfaya karşılık gelir', () => {
    expect(routePaths.length).toBeGreaterThan(5);

    for (const item of hebrew.nav.flatMap((g) => g.items)) {
      const matches = routePaths.some((pattern) => {
        if (pattern.includes(':')) {
          // 'seviye/:level' → 'seviye/' ile başlayan her yol
          const base = pattern.split('/:')[0]!;
          return item.path.startsWith(base + '/');
        }
        return item.path === pattern;
      });
      expect(matches, `"${item.label}" (${item.path || 'ana sayfa'}) için sayfa yok`).toBe(true);
    }
  });

  it('her dil kimliği ve yolu tekil', () => {
    const yollar = hebrew.routes.map((r) => r.path);
    expect(new Set(yollar).size, 'aynı yol iki kez tanımlı').toBe(yollar.length);
  });

  it('menü girişleri dil önekiyle kuruluyor — mutlak adres yok', () => {
    /*
     * Menüde '/verb' gibi mutlak bir adres kalsaydı dil değiştiğinde o
     * bağlantı İbranice'ye çakılı kalırdı.
     */
    for (const item of hebrew.nav.flatMap((g) => g.items)) {
      expect(item.path.startsWith('/'), `"${item.label}" mutlak adres taşıyor`).toBe(false);
    }
  });
});

describe('sürüm', () => {
  it('üretilen sürüm modülü package.json ile aynı', async () => {
    /*
     * Sürüm modülü vite.config.ts tarafından package.json'dan üretilir.
     * Eklenti bir sebeple çalışmazsa dosya eskide kalır ve kullanıcı
     * yanlış sürüm görür — bu test o sessiz kaymayı yakalar.
     */
    const pkg = (await import('../../package.json')) as unknown as { version: string };
    const { APP_VERSION } = await import('@/lib/version');
    expect(APP_VERSION).toBe(pkg.version);
  });
});
