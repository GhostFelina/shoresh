/**
 * Gelen kutusu — gönderilen bildirimler.
 *
 * NEDEN PAROLA KAPISI: Bildirimler kişisel şeyler içerebiliyor (ad,
 * e-posta, "şurada takıldım" gibi). Adres tahmin edilebilir olduğu için
 * sayfanın kendisi bir gizlilik sağlamaz; kapı sunucuda.
 *
 * NEDEN PAROLA SUNUCUDA DOĞRULANIYOR: İstemcide karşılaştırılsaydı
 * parola tarayıcıya gitmek zorunda kalırdı ve hiçbir şey korumazdı.
 * Burada parola yalnızca isteğin başlığında gidiyor; doğrulama
 * `api/feedback.js` içinde, gizli anahtarla birlikte sunucuda.
 *
 * NEDEN MENÜDE YOK: Bu sayfa öğrenciye ait değil, projeyi yürütene ait.
 * Menüde dursaydı her kullanıcı bir parola kapısıyla karşılaşır ve
 * uygulamanın bir parçası olduğunu sanırdı.
 */
import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Check, Inbox, Loader2, RefreshCw } from 'lucide-react';
import { usePageWidth } from '@/app/Layout';
import { MixedText } from '@/components/MixedText';

interface Item {
  id: string;
  created_at: string;
  kind: string;
  message: string;
  contact: string | null;
  page: string | null;
  app_version: string | null;
  user_agent: string | null;
  handled: boolean;
}

const KIND_TINT: Record<string, string> = {
  hata: 'var(--accent-fem)',
  istek: 'var(--color-brand-400)',
  oneri: 'var(--color-accent-400)',
  soru: 'var(--accent-text-alt)',
};

const KEY_STORE = 'shoresh.inboxKey';

const zaman = (iso: string): string =>
  new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));

export default function InboxPage() {
  usePageWidth('wide');

  const [key, setKey] = useState(() => {
    try {
      return sessionStorage.getItem(KEY_STORE) ?? '';
    } catch {
      return '';
    }
  });
  const [girildi, setGirildi] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [durum, setDurum] = useState<'bos' | 'yukleniyor' | 'hazir' | 'hata'>('bos');
  const [hata, setHata] = useState('');
  const [sadeceOkunmamis, setSadeceOkunmamis] = useState(false);

  const yukle = useCallback(
    async (parola: string) => {
      setDurum('yukleniyor');
      setHata('');
      try {
        const res = await fetch(`/api/feedback?key=${encodeURIComponent(parola)}`);
        const govde = (await res.json().catch(() => ({}))) as {
          items?: Item[];
          error?: string;
          detay?: string;
        };

        if (!res.ok) {
          setHata(govde.error ?? `Sunucu ${res.status} döndü.`);
          setDurum('hata');
          setGirildi(false);
          return;
        }
        setItems(govde.items ?? []);
        setDurum('hazir');
        setGirildi(true);
        try {
          sessionStorage.setItem(KEY_STORE, parola);
        } catch {
          /* saklanamadıysa yenilemede tekrar sorulur */
        }
      } catch {
        setHata('Bağlantı kurulamadı.');
        setDurum('hata');
      }
    },
    [],
  );

  // Parola oturumda saklıysa doğrudan aç.
  useEffect(() => {
    if (key) void yukle(key);
    // Yalnızca ilk açılışta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isaretle = async (id: string, handled: boolean) => {
    // İyimser güncelleme: sunucu yanıtı beklenmiyor, liste anında dönüyor.
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, handled } : i)));
    try {
      await fetch(`/api/feedback?key=${encodeURIComponent(key)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, handled }),
      });
    } catch {
      /* başarısız olursa yenilemede gerçek durum görünür */
    }
  };

  if (!girildi) {
    return (
      <section className="mx-auto max-w-sm space-y-4 py-16">
        <header className="space-y-1 text-center">
          <Inbox className="mx-auto size-8" style={{ color: 'var(--accent-text)' }} />
          <h1 className="text-lg font-semibold">Gelen kutusu</h1>
          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
            Bu sayfa kullanıcı bildirimlerini gösteriyor ve parolayla açılıyor.
          </p>
        </header>

        <form
          className="space-y-2"
          onSubmit={(e) => {
            e.preventDefault();
            void yukle(key);
          }}
        >
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="Parola"
            className="card-2 w-full px-3 py-2 text-sm outline-none"
            style={{ color: 'var(--text)' }}
            autoFocus
          />
          <button
            type="submit"
            disabled={durum === 'yukleniyor' || key.length === 0}
            className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
            style={{ background: 'var(--color-brand-500)', color: 'var(--on-accent)' }}
          >
            {durum === 'yukleniyor' ? 'Açılıyor…' : 'Aç'}
          </button>
        </form>

        {durum === 'hata' && (
          <p
            className="card-2 flex items-start gap-2 p-2.5 text-xs"
            style={{ borderColor: 'var(--danger)' }}
          >
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" style={{ color: 'var(--danger)' }} />
            <span>{hata}</span>
          </p>
        )}
      </section>
    );
  }

  const gosterilen = sadeceOkunmamis ? items.filter((i) => !i.handled) : items;
  const okunmamis = items.filter((i) => !i.handled).length;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center gap-3">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-semibold">Gelen kutusu</h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            {items.length} bildirim · {okunmamis} okunmamış
          </p>
        </div>

        <button
          type="button"
          onClick={() => setSadeceOkunmamis((v) => !v)}
          className="card-2 card-interactive ms-auto px-3 py-1.5 text-xs"
          style={{ borderColor: sadeceOkunmamis ? 'var(--color-brand-400)' : 'var(--border)' }}
        >
          {sadeceOkunmamis ? 'Hepsini göster' : 'Sadece okunmamış'}
        </button>

        <button
          type="button"
          onClick={() => void yukle(key)}
          className="card-2 card-interactive flex items-center gap-1.5 px-3 py-1.5 text-xs"
        >
          {durum === 'yukleniyor' ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <RefreshCw className="size-3.5" />
          )}
          Yenile
        </button>
      </header>

      {gosterilen.length === 0 ? (
        <p className="card p-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
          {items.length === 0 ? 'Henüz bildirim yok.' : 'Okunmamış bildirim yok.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {gosterilen.map((i) => (
            <li
              key={i.id}
              className="card space-y-2 p-4"
              style={{ opacity: i.handled ? 0.6 : 1 }}
            >
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span
                  className="rounded px-1.5 py-0.5 font-semibold"
                  style={{
                    color: KIND_TINT[i.kind] ?? 'var(--text-dim)',
                    background: `color-mix(in srgb, ${KIND_TINT[i.kind] ?? 'var(--border)'} 14%, transparent)`,
                  }}
                >
                  {i.kind}
                </span>
                <span style={{ color: 'var(--text-dim)' }}>{zaman(i.created_at)}</span>
                {i.page && (
                  <span className="card-2 px-1.5 py-0.5" style={{ color: 'var(--text-dim)' }}>
                    {i.page}
                  </span>
                )}
                {i.app_version && (
                  <span className="numeric" style={{ color: 'var(--text-dim)' }}>
                    v{i.app_version}
                  </span>
                )}
                {i.contact && (
                  <span style={{ color: 'var(--accent-text)' }}>{i.contact}</span>
                )}

                <button
                  type="button"
                  onClick={() => void isaretle(i.id, !i.handled)}
                  className="card-2 card-interactive ms-auto flex items-center gap-1 px-2 py-0.5"
                  style={{ color: i.handled ? 'var(--accent-text)' : 'var(--text-dim)' }}
                >
                  <Check className="size-3" />
                  {i.handled ? 'okundu' : 'okundu işaretle'}
                </button>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-relaxed">
                <MixedText>{i.message}</MixedText>
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
