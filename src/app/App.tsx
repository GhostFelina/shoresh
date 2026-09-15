import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Shell from './Shell';

/**
 * Rotalar lazy: Fiiller sayfası bütün çekim tablosunu kurar, Alef-Bet
 * 27 harf kartı çizer. İlk açılışta hepsini birden indirmek telefonda
 * gereksiz bir bekleme demek.
 */
const HomePage = lazy(() => import('@/pages/HomePage'));
const AlefBetPage = lazy(() => import('@/pages/AlefBetPage'));
const ReadingPage = lazy(() => import('@/pages/ReadingPage'));
const VerbsPage = lazy(() => import('@/pages/VerbsPage'));
const BinyanimPage = lazy(() => import('@/pages/BinyanimPage'));

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
          <Route path="/alefbet" element={<AlefBetPage />} />
          <Route path="/okuma" element={<ReadingPage />} />
          <Route path="/fiiller" element={<VerbsPage />} />
          <Route path="/binyanim" element={<BinyanimPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </Shell>
  );
}
