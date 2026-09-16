/**
 * Etkin dil bağlamı.
 *
 * NEDEN BAĞLAM: Kabuk (menü, üst bant, ilerleme sayfası) hangi dilin
 * açık olduğunu bilmek zorunda ama bunu her bileşene aşağı doğru elden
 * ele taşımak on katman derinliğe kadar gider ve bir katman unutulunca
 * o dal yanlış dili gösterir.
 *
 * NEDEN KAYNAK ADRES: Etkin dil yalnızca bir ayar olsaydı bağlantı
 * paylaşılamazdı — "şu fiile bak" derken adres hangi dilde olduğunu
 * taşımalı. Adres kaynak, `localStorage` yalnızca "en son hangisindeydim"
 * hatırlatıcısı.
 */
import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import {
  defaultLanguage,
  languageById,
  readActiveLanguage,
  writeActiveLanguage,
  type LanguageModule,
} from '@/core/language';
import { migrateKeysToLanguage } from '@/lib/progress';

const LanguageContext = createContext<LanguageModule | null>(null);

/**
 * Etkin dili verir.
 *
 * Dil dışı sayfalarda (gelen kutusu gibi) varsayılan dile düşüyor —
 * null döndürseydi her çağıran yer boş durumu ayrıca ele almak zorunda
 * kalırdı ve biri unutulunca sayfa çökerdi.
 */
export function useLanguage(): LanguageModule {
  const ctx = useContext(LanguageContext);
  const fallback = defaultLanguage();
  if (!ctx && !fallback) {
    throw new Error('Hiç dil kayıtlı değil — core/languages.ts içindeki kayıt çalışmamış.');
  }
  return ctx ?? fallback!;
}

/** Adreste dil var mı? Kabuk menüyü buna göre kuruyor. */
export const useIsInLanguage = (): boolean => useContext(LanguageContext) !== null;

/**
 * Bir dilin sayfalarını o dilin bağlamıyla sarar.
 *
 * MODÜL PARAMETREDEN GELİYOR, ADRESTEN DEĞİL: Rotalar her dil için
 * ayrı ayrı ve düz yolla kuruluyor (`/he`, sonra `/ko`), tek bir
 * `/:lang` deseniyle değil. Bir kez `useParams().lang` okunmaya
 * çalışıldı; düz yolda böyle bir parametre olmadığı için dil hiç
 * bulunamadı, bileşen varsayılan dile yönlendirdi, o da aynı rotaya
 * düştü ve sonsuz yönlendirme kuruldu. Belirti sinsiydi: konsolda tek
 * hata yok, sayfa sadece boş.
 */
export function LanguageRoute({ module: mod }: { module: LanguageModule }) {
  useEffect(() => {
    writeActiveLanguage(mod.id);
    /*
     * Eski kayıtları dil önekli hâle getirir. Bir kez çalışır ve
     * beklenmiyor — göç başarısız olsa bile uygulama açılmalı.
     */
    void migrateKeysToLanguage(mod.id);
  }, [mod]);

  /*
   * Belgenin dili ve yönü de burada kuruluyor. Ekran okuyucular bunu
   * okuyor; yanlışsa İbranice metni Türkçe telaffuzla okumaya çalışır.
   */
  useEffect(() => {
    const prevLang = document.documentElement.lang;
    document.documentElement.lang = 'tr';
    document.documentElement.dataset.learning = mod.id;
    return () => {
      document.documentElement.lang = prevLang;
      delete document.documentElement.dataset.learning;
    };
  }, [mod]);

  return (
    <LanguageContext.Provider value={mod}>
      <Outlet />
    </LanguageContext.Provider>
  );
}

/** Kabuk gibi dil dışı yerlerde belirli bir modülü sunmak için. */
export function ProvideLanguage({
  module,
  children,
}: {
  module: LanguageModule;
  children: ReactNode;
}) {
  const value = useMemo(() => module, [module]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/**
 * Açılışta hangi dile gidilecek.
 *
 * Son kullanılan dil hâlâ kayıtlıysa o, değilse ilk kayıtlı dil. Kayıt
 * silinmiş ya da o dil kaldırılmış olabilir; kontrol edilmeseydi kök
 * adres var olmayan bir dile yönlendirir ve sonsuz döngü kurulurdu.
 */
export function startLanguageId(): string {
  const saved = readActiveLanguage();
  if (saved && languageById(saved)) return saved;
  return defaultLanguage()?.id ?? 'he';
}

/**
 * Dil önekli yol kurar.
 *
 * NEDEN GEREKLİ: Sayfalar birbirine `/oyunlar`, `/ilerleme` gibi mutlak
 * adreslerle bağlanıyordu. Adresler dil önekli hâle gelince bu
 * bağlantıların hepsi kırıldı — üstelik SESSİZCE: tıklayan kişi ana
 * sayfaya düşüyordu, hata görünmüyordu.
 *
 * Bu kanca tek doğru kaynağı veriyor; elle `/he/...` yazmak da işe
 * yarardı ama Korece eklendiğinde o satırlar İbranice'ye çakılı kalırdı.
 */
export function useLanguagePath(): (path: string) => string {
  const dil = useLanguage();
  return (path: string) => {
    const temiz = path.replace(/^\/+/, '');
    return temiz ? `/${dil.id}/${temiz}` : `/${dil.id}`;
  };
}
