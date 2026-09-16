/**
 * Yönlendirme.
 *
 * ADRESLER DİL ÖNEKLİ: `/he/verb`, `/he/oyunlar`. Önek olmasaydı ikinci
 * dil eklendiğinde `/verb` adresi iki dile birden ait olur ve hangisini
 * açacağı bir ayara bağlanırdı — yani bağlantı paylaşılamazdı. Önekle
 * adres kendi kendini anlatıyor.
 *
 * SAYFA LİSTESİ BURADA DEĞİL: Her dil kendi sayfalarını modülünde
 * bildiriyor (`LanguageModule.routes`). Buraya yazılsaydı yeni dil
 * eklemek bu dosyayı da düzenlemek olurdu ve bir gün biri unutulurdu.
 */
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Shell from './Shell';
import { RewardProvider } from './Rewards';
import { LayoutProvider } from './Layout';
import { LanguageRoute, startLanguageId } from './LanguageContext';
import { setupLanguages } from '@/core/languages';
import { hasLanguage, languages } from '@/core/language';

setupLanguages();

const InboxPage = lazy(() => import('@/pages/InboxPage'));

function Loading() {
  return (
    <div className="grid place-items-center py-24 text-sm" style={{ color: 'var(--text-dim)' }}>
      Yükleniyor…
    </div>
  );
}

/**
 * Dil öneki olmayan eski adresleri kurtarır.
 *
 * Uygulama bir süre `/verb`, `/oyunlar` gibi adreslerle yayındaydı ve o
 * bağlantılar yer imlerinde, ekran görüntülerinde, sohbet geçmişinde
 * duruyor olabilir. Doğrudan ana sayfaya atmak yerine aynı sayfanın dil
 * önekli hâline götürüyoruz: `/verb` → `/he/verb`.
 */
function LegacyOrNotFound() {
  const { pathname, search } = useLocation();
  const dil = startLanguageId();
  const ilkParca = pathname.split('/').filter(Boolean)[0];

  // Zaten dil önekli ama sayfa bulunamadıysa o dilin ana sayfasına.
  if (ilkParca && hasLanguage(ilkParca)) {
    return <Navigate to={`/${ilkParca}`} replace />;
  }
  const hedef = pathname === '/' ? `/${dil}` : `/${dil}${pathname}`;
  return <Navigate to={`${hedef}${search}`} replace />;
}

export default function App() {
  return (
    <RewardProvider>
      <LayoutProvider>
        <Shell>
          <Suspense fallback={<Loading />}>
            <Routes>
              {/* Kök adres son kullanılan dile gider. */}
              <Route path="/" element={<Navigate to={`/${startLanguageId()}`} replace />} />

              {/*
                Gelen kutusu DİL DIŞI: bildirimler öğrenilen dile değil
                projeyi yürütene ait. Menüde de yok.
              */}
              <Route path="/gelen-kutusu" element={<InboxPage />} />

              {languages().map((dil) => (
                <Route key={dil.id} path={`/${dil.id}`} element={<LanguageRoute module={dil} />}>
                  {Object.entries(dil.aliases ?? {}).map(([eski, yeni]) => (
                    <Route
                      key={`alias-${eski}`}
                      path={eski}
                      element={<Navigate to={`/${dil.id}/${yeni}`} replace />}
                    />
                  ))}
                  {dil.routes.map((r) =>
                    r.path === '' ? (
                      <Route key="index" index element={<r.element />} />
                    ) : (
                      <Route key={r.path} path={r.path} element={<r.element />} />
                    ),
                  )}
                </Route>
              ))}

              <Route path="*" element={<LegacyOrNotFound />} />
            </Routes>
          </Suspense>
        </Shell>
      </LayoutProvider>
    </RewardProvider>
  );
}
