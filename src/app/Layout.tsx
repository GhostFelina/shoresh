/**
 * Sayfa genişliği — sayfanın kendi kararı.
 *
 * NEDEN GEREKLİ: Kabuk bütün içeriği `max-w-5xl` (1024px) ile
 * sınırlıyordu. Okuma ağırlıklı sayfalar için bu DOĞRU — uzun satır
 * okumayı yorar, 70-80 karakter ideal ölçüdür. Ama VERB sayfası bir
 * okuma sayfası değil, bir ÇALIŞMA ALANI: solda fiil listesi, ortada
 * çekim tablosu, sağda bağlam. 1024px içinde üçe bölününce tabloya
 * ~700px kalıyordu ve 1440px ekranda sağ taraf boş duruyordu.
 * Kullanıcının bildirdiği "çok dar ve basık" görüntüsünün sebebi buydu.
 *
 * NEDEN KABUK ROTAYA BAKMIYOR: "Şu adresler geniş olsun" listesi kabuğa
 * yazılsaydı her yeni sayfada iki dosya düzenlemek gerekirdi ve biri
 * unutulurdu. Kararı sayfanın kendisi veriyor; kabuk yalnızca uyguluyor.
 */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

export type PageWidth = 'normal' | 'wide';

const WIDTH_CLASS: Record<PageWidth, string> = {
  /** Okuma ölçüsü — satır uzunluğu göz için rahat kalsın. */
  normal: 'max-w-5xl',
  /** Çalışma alanı — geniş ekranı kullan ama sonsuza kadar uzama. */
  wide: 'max-w-[112rem]',
};

const WidthContext = createContext<{
  width: PageWidth;
  setWidth: (w: PageWidth) => void;
}>({ width: 'normal', setWidth: () => {} });

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [width, setWidth] = useState<PageWidth>('normal');
  const value = useMemo(() => ({ width, setWidth }), [width]);
  return <WidthContext.Provider value={value}>{children}</WidthContext.Provider>;
}

/**
 * Sayfa kendi genişliğini bildirir.
 *
 * Sayfadan çıkarken `normal`'a DÖNÜYOR: dönmeseydi geniş bir sayfadan
 * dar bir sayfaya geçince dar sayfa geniş kalırdı ve satırlar okunmaz
 * uzunlukta olurdu.
 */
export function usePageWidth(w: PageWidth): void {
  const { setWidth } = useContext(WidthContext);
  useEffect(() => {
    setWidth(w);
    return () => setWidth('normal');
  }, [w, setWidth]);
}

/** Kabuk bunu okuyup ana bölgeye uyguluyor. */
export function usePageWidthClass(): string {
  return WIDTH_CLASS[useContext(WidthContext).width];
}
