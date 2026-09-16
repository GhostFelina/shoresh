import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Shell from './Shell';

/**
 * Rotalar lazy: VERB Hebrew sayfası bütün çekim tablosunu kurar, Alef-Bet
 * 27 harf kartı çizer, oyunlar kendi motorunu getirir. İlk açılışta
 * hepsini birden indirmek telefonda gereksiz bir bekleme demek.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const LevelPage = lazy(() => import('@/pages/LevelPage'));
const AlefBetPage = lazy(() => import('@/pages/AlefBetPage'));
const ReadingPage = lazy(() => import('@/pages/ReadingPage'));
const VerbsPage = lazy(() => import('@/pages/VerbsPage'));
const BinyanimPage = lazy(() => import('@/pages/BinyanimPage'));
const PhrasesPage = lazy(() => import('@/pages/PhrasesPage'));
const WordsPage = lazy(() => import('@/pages/WordsPage'));
const GamesPage = lazy(() => import('@/pages/GamesPage'));
const SoundPage = lazy(() => import('@/pages/SoundPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));

function Loading() {
  return (
    <div className="grid place-items-center py-24 text-sm" style={{ color: 'var(--text-dim)' }}>
      Yükleniyor…
    </div>
  );
}

export default function App() {
  return (
    <Shell>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<HomePage />} />

          {/* Seviye sekmeleri — sol menünün omurgası */}
          <Route path="/seviye/:level" element={<LevelPage />} />

          <Route path="/alefbet" element={<AlefBetPage />} />
          <Route path="/okuma" element={<ReadingPage />} />

          <Route path="/verb" element={<VerbsPage />} />
          <Route path="/binyanim" element={<BinyanimPage />} />
          <Route path="/kaliplar" element={<PhrasesPage />} />
          <Route path="/kelimeler" element={<WordsPage />} />

          <Route path="/oyunlar" element={<GamesPage />} />
          <Route path="/oyunlar/:gameId" element={<GamesPage />} />
          <Route path="/ses" element={<SoundPage />} />
          <Route path="/ilerleme" element={<ProgressPage />} />

          {/* Eski bağlantılar kırılmasın */}
          <Route path="/fiiller" element={<Navigate to="/verb" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
