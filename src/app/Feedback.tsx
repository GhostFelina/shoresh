/**
 * Geri bildirim formu — üst bantta, temanın yanında.
 *
 * NEDEN BURADA: Hata her yerde çıkabilir. Form ayrı bir sayfada dursaydı
 * kullanıcı hatayı gördüğü yerden ayrılıp onu aramak zorunda kalır ve
 * çoğu zaman vazgeçerdi. Üst bantta duran düğme, hatayı gördüğü anda
 * bildirmesini sağlıyor.
 *
 * NEDEN SAYFA ADRESİ OTOMATİK GÖNDERİLİYOR: "Çalışmıyor" diyen bir
 * bildirim araştırılamaz. Hangi sayfadan, hangi sürümden geldiği
 * kullanıcıya sorulmadan ekleniyor — sorulsaydı çoğu kişi yanlış
 * hatırlardı.
 *
 * NEDEN İLETİŞİM BİLGİSİ ZORUNLU DEĞİL: Zorunlu olsaydı adını vermek
 * istemeyen biri hiç bildirmezdi. Bildirimin kendisi, kimden geldiğinden
 * daha değerli.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AlertCircle, Check, MessageSquarePlus, Send, X } from 'lucide-react';
import { APP_VERSION } from '@/lib/version';

type Kind = 'hata' | 'istek' | 'soru' | 'oneri';

const KINDS: Array<{ id: Kind; label: string; hint: string }> = [
  { id: 'hata', label: 'Hata', hint: 'Bir şey çalışmıyor ya da yanlış görünüyor' },
  { id: 'istek', label: 'İstek', hint: 'Şunun eklenmesini istiyorum' },
  { id: 'oneri', label: 'Öneri', hint: 'Şu daha iyi olabilir' },
  { id: 'soru', label: 'Soru', hint: 'Bir şey anlamadım' },
];

type Durum = 'yaziliyor' | 'gonderiliyor' | 'gonderildi' | 'hata';

const TASLAK_KEY = 'shoresh.feedbackDraft';

export function FeedbackButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="card-2 grid size-9 place-items-center card-interactive"
      aria-label="Geri bildirim gönder"
      title="Bir hata bildir ya da istekte bulun"
    >
      <MessageSquarePlus className="size-4" />
    </button>
  );
}

export function FeedbackDialog({ onClose }: { onClose: () => void }) {
  const { pathname } = useLocation();
  const [kind, setKind] = useState<Kind>('hata');
  const [message, setMessage] = useState('');
  const [contact, setContact] = useState('');
  const [durum, setDurum] = useState<Durum>('yaziliyor');
  const [hataMetni, setHataMetni] = useState('');
  const [kurulumHazir, setKurulumHazir] = useState<boolean | null>(null);
  const alanRef = useRef<HTMLTextAreaElement>(null);

  /*
   * Kurulum durumu AÇILIŞTA soruluyor. Sorulmasaydı kullanıcı uzun bir
   * bildirim yazıp Gönder'e bastıktan SONRA "kurulum eksik" görürdü ve
   * yazdığı da boşa giderdi.
   */
  useEffect(() => {
    let iptal = false;
    void fetch('/api/feedback?probe=1')
      .then((r) => r.json() as Promise<{ ready?: boolean }>)
      .then((d) => {
        if (!iptal) setKurulumHazir(Boolean(d.ready));
      })
      .catch(() => {
        if (!iptal) setKurulumHazir(false);
      });
    return () => {
      iptal = true;
    };
  }, []);

  /*
   * Yazılan metin taslak olarak saklanıyor. Kutu yanlışlıkla kapanırsa
   * ya da sayfa yenilenirse yazı kaybolmasın — kaybolan bir yazıyı
   * kimse ikinci kez yazmaz.
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(TASLAK_KEY);
      if (raw) {
        const t = JSON.parse(raw) as { kind?: Kind; message?: string; contact?: string };
        if (t.kind) setKind(t.kind);
        if (t.message) setMessage(t.message);
        if (t.contact) setContact(t.contact);
      }
    } catch {
      /* taslak okunamadıysa boş başlar */
    }
    alanRef.current?.focus();
  }, []);

  useEffect(() => {
    if (durum === 'gonderildi') return;
    try {
      localStorage.setItem(TASLAK_KEY, JSON.stringify({ kind, message, contact }));
    } catch {
      /* yazamadıysak taslak bu oturumda kalır */
    }
  }, [kind, message, contact, durum]);

  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', esc);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', esc);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const gonder = useCallback(async () => {
    if (message.trim().length < 3) {
      setHataMetni('Birkaç kelime yazman gerekiyor.');
      setDurum('hata');
      return;
    }
    setDurum('gonderiliyor');
    setHataMetni('');

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kind,
          message: message.trim(),
          contact: contact.trim(),
          page: pathname,
          appVersion: APP_VERSION,
        }),
      });

      if (res.ok) {
        setDurum('gonderildi');
        try {
          localStorage.removeItem(TASLAK_KEY);
        } catch {
          /* silinemediyse önemli değil */
        }
        return;
      }

      /*
       * Hata mesajı SUNUCUDAN geliyor, uydurulmuyor. "Bir şeyler ters
       * gitti" demek kullanıcıya hiçbir şey anlatmaz; kurulum eksikse
       * onu söylemek gerekir.
       */
      const govde = (await res.json().catch(() => ({}))) as { error?: string; detay?: string };
      setHataMetni(govde.error ?? `Sunucu ${res.status} döndü.`);
      setDurum('hata');
    } catch {
      setHataMetni('Bağlantı kurulamadı. İnternetini kontrol edip tekrar dene.');
      setDurum('hata');
    }
  }, [kind, message, contact, pathname]);

  return (
    <div
      className="fixed inset-0 z-[65] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'color-mix(in srgb, var(--bg) 72%, rgb(0 0 0 / 0.6))',
          backdropFilter: 'blur(6px)',
          animation: 'shoresh-fade 220ms ease both',
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="card relative flex w-full max-w-lg flex-col overflow-hidden"
        style={{ animation: 'shoresh-dialog 380ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <div
          className="h-1 w-full shrink-0"
          style={{
            background:
              'linear-gradient(90deg, var(--color-brand-400), var(--accent-fem), var(--color-accent-400))',
            backgroundSize: '200% 100%',
            animation: 'shoresh-sheen 3.2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />

        <header className="flex items-start gap-3 px-5 pb-2 pt-4">
          <span
            className="grid size-9 shrink-0 place-items-center rounded-xl"
            style={{
              background: 'color-mix(in srgb, var(--color-brand-400) 16%, transparent)',
              color: 'var(--accent-text)',
            }}
          >
            <MessageSquarePlus className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="feedback-title" className="text-lg font-semibold">
              Geri bildirim
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
              Ne eklenmesini istersin, ne düzeltilmeli, nerede takıldın?
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="card-2 grid size-8 shrink-0 place-items-center card-interactive"
            aria-label="Kapat"
          >
            <X className="size-4" />
          </button>
        </header>

        {durum === 'gonderildi' ? (
          <div className="space-y-3 px-5 pb-5 pt-2 text-center">
            <span
              className="mx-auto grid size-12 place-items-center rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--color-brand-400) 18%, transparent)',
                color: 'var(--accent-text)',
                animation: 'shoresh-dialog 420ms cubic-bezier(0.16, 1, 0.3, 1) both',
              }}
            >
              <Check className="size-6" />
            </span>
            <p className="text-sm font-semibold">Ulaştı, teşekkürler.</p>
            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Bildirimin kaydedildi. Hangi sayfadan ve hangi sürümden geldiği de yazıldı, yani
              araştırılabilir.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
            >
              Kapat
            </button>
          </div>
        ) : (
          <div className="space-y-3 px-5 pb-4">
            <div className="flex flex-wrap gap-1.5">
              {KINDS.map((k) => (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setKind(k.id)}
                  title={k.hint}
                  className="card-2 card-interactive px-2.5 py-1 text-xs"
                  style={{
                    borderColor: kind === k.id ? 'var(--color-brand-400)' : 'var(--border)',
                    color: kind === k.id ? 'var(--accent-text)' : 'var(--text-dim)',
                  }}
                >
                  {k.label}
                </button>
              ))}
            </div>

            <p className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {KINDS.find((k) => k.id === kind)?.hint}
            </p>

            <textarea
              ref={alanRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              maxLength={4000}
              placeholder="Olabildiğince somut yaz: ne yaptın, ne bekliyordun, ne oldu."
              className="card-2 w-full resize-y p-3 text-sm outline-none"
              style={{ color: 'var(--text)' }}
            />

            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              maxLength={200}
              placeholder="İstersen e-posta ya da ad (zorunlu değil)"
              className="card-2 w-full px-3 py-2 text-sm outline-none"
              style={{ color: 'var(--text)' }}
            />

            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-dim)' }}>
              Bulunduğun sayfa ({pathname}) ve sürüm (v{APP_VERSION}) otomatik ekleniyor —
              sormasak yanlış hatırlanabilirdi.
            </p>

            {kurulumHazir === false && (
              <p
                className="card-2 flex items-start gap-2 p-2.5 text-xs leading-relaxed"
                style={{ borderColor: '#fbbf24' }}
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" style={{ color: '#fbbf24' }} />
                <span>
                  Bildirim sunucusu henüz kurulmadı, bu yüzden gönderim şu an çalışmıyor.
                  Yazdığın metin taslak olarak saklanıyor; kurulum tamamlanınca buradan
                  gönderebilirsin.
                </span>
              </p>
            )}

            {durum === 'hata' && (
              <p
                className="card-2 flex items-start gap-2 p-2.5 text-xs"
                style={{ borderColor: '#f87171', color: 'var(--text)' }}
              >
                <AlertCircle className="mt-0.5 size-3.5 shrink-0" style={{ color: '#f87171' }} />
                <span>{hataMetni}</span>
              </p>
            )}
          </div>
        )}

        {durum !== 'gonderildi' && (
          <footer
            className="flex shrink-0 items-center gap-3 border-t px-5 py-3"
            style={{ background: 'var(--surface-2)' }}
          >
            <span className="numeric text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {message.length} / 4000
            </span>
            <button
              type="button"
              onClick={() => void gonder()}
              disabled={
                durum === 'gonderiliyor' ||
                message.trim().length < 3 ||
                kurulumHazir === false
              }
              className="ms-auto flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-50"
              style={{ background: 'var(--color-brand-500)', color: '#04120f' }}
            >
              <Send className="size-3.5" />
              {durum === 'gonderiliyor' ? 'Gönderiliyor…' : 'Gönder'}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
