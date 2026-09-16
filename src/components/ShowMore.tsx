import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Uzun listeleri parça parça gösterir.
 *
 * NEDEN GEREKLİ: Kelimeler sayfası 353 satırın tamamını birden çiziyordu
 * ve sayfa 24.000 pikseli aşıyordu. İki ayrı sorun:
 *  1. Kullanılamaz — aradığın kelimeye kaydırarak ulaşmak imkânsız.
 *  2. Yavaş — 353 kart + her birinde düğme ve rozet, ilk boyamayı uzatıyor.
 *
 * NEDEN SANALLAŞTIRMA (virtualization) DEĞİL: Sanallaştırma kaydırma
 * konumuna göre satır ekleyip çıkarır; sayfa içi arama (Ctrl+F) ve ekran
 * okuyucu için listeyi kırar. Burada asıl ihtiyaç "hepsini aynı anda
 * çizme" idi, "sonsuz kaydırmayı hızlandırma" değil — süzgeçler zaten
 * listeyi daraltıyor. Basit bir "daha fazla göster" hem erişilebilir
 * kalıyor hem de sorunu çözüyor.
 *
 * Süzgeç değişince sayaç kendiliğinden sıfırlanır: `resetKey` farklıysa
 * kullanıcı yeni bir listeye bakıyordur, önceki "daha fazla" durumu
 * anlamsızdır.
 */
export function useShowMore<T>(items: T[], step = 60, resetKey?: unknown) {
  const [limit, setLimit] = useState(step);

  useEffect(() => {
    setLimit(step);
  }, [resetKey, step]);

  return {
    visible: items.slice(0, limit),
    hidden: Math.max(0, items.length - limit),
    showMore: () => setLimit((n) => n + step),
    showAll: () => setLimit(items.length),
  };
}

export function ShowMoreButton({
  hidden,
  onMore,
  onAll,
  step = 60,
}: {
  hidden: number;
  onMore: () => void;
  onAll: () => void;
  step?: number;
}) {
  if (hidden === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
      <button
        type="button"
        onClick={onMore}
        className="card-2 flex items-center gap-2 px-4 py-2 text-sm card-interactive"
      >
        <ChevronDown className="size-4" />
        {Math.min(step, hidden)} tane daha
      </button>
      <button
        type="button"
        onClick={onAll}
        className="px-3 py-2 text-xs"
        style={{ color: 'var(--text-dim)' }}
      >
        kalan {hidden.toLocaleString('tr-TR')} tanenin hepsini göster
      </button>
    </div>
  );
}
