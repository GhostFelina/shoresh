/**
 * Öğretmene sor — sınıfın konuşan köşesi.
 *
 * NEDEN DERSLERİN İÇİNE DEĞİL AYRI BİR PANEL: Ders akışı belirli ve
 * ölçülebilir (kural → örnek → ipuçlu soru → ipuçsuz soru). Serbest
 * sohbet o akışı bozar. Öğrencinin aklına takılan şey ise ders bitene
 * kadar beklemez; bu yüzden sınıfta her zaman açık duran ama derse
 * karışmayan bir köşe var.
 *
 * NEDEN "BAĞLI DEĞİL" AÇIKÇA YAZIYOR: Anahtar yokken paneli gizlemek
 * en kolay yol olurdu. Ama gizlenen özellik, kullanıcı için var olmayan
 * özelliktir; birileri "hani yapay zekâ vardı" diye sorduğunda cevabı
 * ekranda bulmalı. Dürüst boşluk, sessiz boşluktan iyidir.
 *
 * NEDEN CEVAP GELİRKEN İPTAL EDİLEBİLİYOR: Model bazen uzun düşünür.
 * İptali olmayan bir bekleme, donmuş arayüzden ayırt edilemez.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { AiError, aiErrorLine, aiReady, askAi } from '@/lib/ai';
import { chatRequest, teacherContext } from '@he/teacher/ai-context';
import { MixedText } from '@/components/MixedText';
import { readPlacement } from '@he/teacher/placement';
import type { CEFR } from '@he/types';

interface Mesaj {
  role: 'ogrenci' | 'ogretmen';
  text: string;
}

const KEY = 'shoresh.chat';

/** Sohbeti cihazda tutar — panele dönünce konuşma kaybolmasın. */
function readChat(): Mesaj[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Mesaj[];
    return Array.isArray(parsed) ? parsed.slice(-20) : [];
  } catch {
    return [];
  }
}

function writeChat(list: Mesaj[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list.slice(-20)));
  } catch {
    /* gizli pencerede yazılamaz — sohbet oturumluk kalır */
  }
}

/**
 * Hazır sorular.
 *
 * NEDEN VAR: Boş bir metin kutusu, "ne sorsam" diye düşündürür ve çoğu
 * kişi hiçbir şey sormaz. Bu üç soru, öğretmenin NE YAPABİLDİĞİNİ de
 * gösteriyor — yardım metni yazmadan.
 */
const HAZIR = [
  'Bugün ne çalışmalıyım?',
  'Binyan ne demek, basitçe anlatır mısın?',
  'Benimle kısa bir pratik yap.',
];

export function TeacherChat({
  level,
  lessonsDone,
  streak,
}: {
  level: CEFR;
  lessonsDone: number;
  streak: number;
}) {
  const [ready, setReady] = useState<boolean | null>(null);
  const [mesajlar, setMesajlar] = useState<Mesaj[]>(() => readChat());
  const [taslak, setTaslak] = useState('');
  const [bekliyor, setBekliyor] = useState(false);
  const [hata, setHata] = useState<string | null>(null);
  const iptal = useRef<AbortController | null>(null);
  const son = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    void aiReady().then(setReady);
  }, []);

  // Yeni mesajda en alta kaydır — konuşma akıyor gibi dursun.
  useEffect(() => {
    son.current?.scrollIntoView({ block: 'nearest' });
  }, [mesajlar, bekliyor]);

  useEffect(() => () => iptal.current?.abort(), []);

  const gonder = useCallback(
    async (soru: string) => {
      const temiz = soru.trim();
      if (!temiz || bekliyor) return;

      const yeni: Mesaj[] = [...mesajlar, { role: 'ogrenci', text: temiz }];
      setMesajlar(yeni);
      writeChat(yeni);
      setTaslak('');
      setHata(null);
      setBekliyor(true);

      const controller = new AbortController();
      iptal.current = controller;

      try {
        const context = teacherContext({
          level,
          placement: readPlacement(),
          streak,
          lessonsDone,
        });
        const cevap = await askAi('sohbet', chatRequest(context, mesajlar, temiz), {
          signal: controller.signal,
        });
        const sonrasi: Mesaj[] = [...yeni, { role: 'ogretmen', text: cevap }];
        setMesajlar(sonrasi);
        writeChat(sonrasi);
      } catch (err) {
        if (err instanceof AiError && err.kind === 'iptal') {
          // İptal kullanıcının kendi kararı; hata gibi göstermek yanlış olur.
          setMesajlar(yeni);
        } else {
          setHata(aiErrorLine(err));
          if (err instanceof AiError && err.kind === 'anahtar-yok') setReady(false);
        }
      } finally {
        setBekliyor(false);
        iptal.current = null;
      }
    },
    [mesajlar, bekliyor, level, streak, lessonsDone],
  );

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-4 shrink-0" style={{ color: 'var(--accent-text)' }} />
        <h2 className="text-sm font-semibold">Öğretmene sor</h2>
        {ready === true && (
          <span
            className="size-1.5 rounded-full"
            style={{ background: 'var(--color-brand-400)' }}
            title="Yapay zekâ öğretmen bağlı"
          />
        )}
        {mesajlar.length > 0 && (
          <button
            type="button"
            onClick={() => {
              setMesajlar([]);
              writeChat([]);
            }}
            className="ms-auto text-xs underline-offset-2 hover:underline"
            style={{ color: 'var(--text-dim)' }}
          >
            sohbeti temizle
          </button>
        )}
      </div>

      {ready === false ? (
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Yapay zekâ öğretmen şu an bağlı değil. Dersler, alıştırmalar ve seviye tespit
          sınavı bundan etkilenmiyor — hepsi cihazında çalışıyor.
        </p>
      ) : (
        <>
          {mesajlar.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                Takıldığın yeri sor; seviyeni ve eksik alanlarını biliyorum.
              </p>
              <ul className="flex flex-wrap gap-2">
                {HAZIR.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      disabled={ready === null}
                      onClick={() => void gonder(s)}
                      className="card-2 card-interactive px-3 py-1.5 text-xs disabled:opacity-50"
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {mesajlar.length > 0 && (
            <ul className="max-h-80 space-y-2.5 overflow-y-auto pe-1">
              {mesajlar.map((m, i) => (
                <li
                  key={i}
                  className={m.role === 'ogrenci' ? 'flex justify-end' : 'flex justify-start'}
                >
                  <span
                    className="max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed"
                    style={
                      m.role === 'ogrenci'
                        ? { background: 'var(--surface-2)' }
                        : { border: '1px solid var(--border)' }
                    }
                  >
                    {/* Öğretmenin cevabında İbranice geçebilir; yön doğru olmalı. */}
                    <MixedText>{m.text}</MixedText>
                  </span>
                </li>
              ))}
              <div ref={son} />
            </ul>
          )}

          {bekliyor && (
            <p className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-dim)' }}>
              <Loader2 className="size-3.5 animate-spin" />
              öğretmen yazıyor…
              <button
                type="button"
                onClick={() => iptal.current?.abort()}
                className="inline-flex items-center gap-1 underline-offset-2 hover:underline"
              >
                <X className="size-3" /> vazgeç
              </button>
            </p>
          )}

          {hata && (
            <p className="text-xs" style={{ color: 'var(--accent-fem)' }}>
              {hata}
            </p>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void gonder(taslak);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={taslak}
              onChange={(e) => setTaslak(e.target.value)}
              disabled={bekliyor || ready === null}
              placeholder={ready === null ? 'bağlantı kontrol ediliyor…' : 'Sorunu yaz…'}
              className="card-2 min-w-0 flex-1 px-3 py-2 text-sm outline-none"
              style={{ color: 'var(--text)' }}
              aria-label="Öğretmene sorulacak soru"
            />
            <button
              type="submit"
              disabled={bekliyor || !taslak.trim()}
              className="card-2 card-interactive grid size-9 shrink-0 place-items-center disabled:opacity-40"
              aria-label="Gönder"
            >
              {bekliyor ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </button>
          </form>

          <p className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
            <Sparkles className="size-3" />
            Öğretmen yalnızca uygulamadaki doğrulanmış İbranice biçimleri kullanır; emin
            olmadığı yerde bunu söyler.
          </p>
        </>
      )}
    </section>
  );
}
