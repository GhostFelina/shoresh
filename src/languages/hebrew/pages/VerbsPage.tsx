/**
 * VERB Hebrew — fiil çalışma alanı.
 *
 * NEDEN YENİDEN YAZILDI: Sayfa kabuğun 1024px sınırı içinde üçe
 * bölününce çekim tablosuna ~700px kalıyordu ve 1440px ekranda sağ taraf
 * boş duruyordu. Kullanıcının bildirdiği "çok dar ve basık" görüntüsünün
 * sebebi buydu. İkinci sorun daha derindi: sayfa aynı anda TEK zaman
 * gösteriyordu ve fiili tanımak için sekmeler arasında gidip gelmek
 * gerekiyordu.
 *
 * ŞİMDİ NE VAR — üç bölmeli çalışma alanı:
 *   sol    fiil listesi + arama + binyan/seviye/gizra süzgeçleri
 *   orta   fiilin künyesi + BÜTÜN zamanlar yan yana
 *   sağ    kök ailesi, tuzak notu, örnek cümleler (geniş ekranda)
 *
 * NEDEN BÜTÜN ZAMANLAR AYNI ANDA: Bir fiili "bilmek" onun bir zamanını
 * bilmek değil, zamanlar arasındaki İLİŞKİYİ görmek demek — geçmişte
 * ekin sonda, gelecekte başta olduğunu ancak ikisi yan yanayken fark
 * edersin. Sekme arkasına saklanan bilgi karşılaştırılamaz.
 *
 * Dar ekranda zaman seçici geri geliyor: telefonda dört tabloyu yan yana
 * koymak okunamaz bir sonuç verirdi.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Languages, MessageSquareText, Search, Volume2, X } from 'lucide-react';
import { CATALOG_STATS, VERBS, siblingsOf } from '@he/data/catalog';
import { sentenceSet } from '@he/engine/sentence';
import { writtenFor } from '@he/data/sentences';
import { speak } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';
import { usePageWidth } from '@/app/Layout';
import {
  BINYAN_LABEL,
  BINYANIM,
  FORM_LABEL,
  GIZRA_LABEL,
  HEBREW_FORMS,
  IMPERATIVE_LABEL,
  MODERN_PERSONS,
  PERSON_LABEL,
  PRESENT_LABEL,
  PRESENT_SLOTS,
  type Binyan,
  type CEFR,
  type Conjugation,
  type HebrewForm,
  type HebrewVerb,
} from '@he/types';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];

/**
 * Kartların ekrandaki sırası.
 *
 * `HEBREW_FORMS` sırası veri sırasıdır (mastar önce). Burada ÖĞRENME
 * sırası kullanılıyor: şimdiki zaman ilk öğrenilen ve en sık kullanılan
 * biçim, mastar ile emir ise sona bırakılıyor.
 */
const FORM_ORDER: HebrewForm[] = ['present', 'past', 'future', 'infinitive', 'imperative'];

/* ------------------------------------------------------------------ *
 * Tek çekilmiş biçim
 * ------------------------------------------------------------------ */

/**
 * Bir satır: etiket · harekeli · okunuş.
 *
 * Harekesiz yazım BİLEREK kaldırıldı. Üç sütun yan yana durunca göz
 * hangisine bakacağını şaşırıyordu ve harekesiz biçim zaten harekelinin
 * işaretleri silinmiş hâli — öğrenci için yeni bilgi taşımıyor. Sözlük
 * biçiminin harekesiz yazımı künyede bir kez gösteriliyor, yeter.
 */
function Cell({ label, c }: { label: string; c: Conjugation | undefined }) {
  if (!c) return null;
  return (
    <button
      type="button"
      onClick={() => void speak(c.plain)}
      title={`${c.plain} — dinlemek için tıkla`}
      className="group flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start transition"
      style={{ background: 'transparent' }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--surface-2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span
        className="w-20 shrink-0 text-[11px] leading-tight"
        style={{ color: 'var(--text-dim)' }}
      >
        {label}
      </span>
      {/*
        İbranice biçim etiketin HEMEN yanında duruyor, sütunun sağ ucunda
        değil. `flex-1` verilmişti ve geniş kartta etiket ile biçim
        arasında göz taramayı zorlaştıran büyük bir boşluk kalıyordu —
        okuyan kişi hangi etiketin hangi biçime ait olduğunu satır boyunca
        izlemek zorundaydı.
      */}
      <span className="he he-vocalized shrink-0 text-lg font-medium">{c.vocalized}</span>
      <span
        className="ms-auto hidden shrink-0 ps-2 text-[11px] italic sm:block"
        style={{ color: 'var(--accent-text)' }}
      >
        {c.translit}
      </span>
      <Volume2 className="size-3 shrink-0 opacity-0 transition group-hover:opacity-60" />
    </button>
  );
}

/** Bir zamanın bütün biçimleri — tek kart. */
function FormCard({ verb, form }: { verb: HebrewVerb; form: HebrewForm }) {
  const t = verb.table;

  const satirlar = (() => {
    if (form === 'infinitive') return [{ k: 'mastar', label: 'mastar', c: t.infinitive }];
    if (form === 'present') {
      return PRESENT_SLOTS.map((s) => ({ k: s, label: PRESENT_LABEL[s].tr, c: t.present[s] }));
    }
    if (form === 'imperative') {
      return (['ata', 'at', 'atem'] as const).map((s) => ({
        k: s,
        label: IMPERATIVE_LABEL[s].tr,
        c: t.imperative[s],
      }));
    }
    const tablo = form === 'past' ? t.past : t.future;
    return MODERN_PERSONS.map((p) => ({ k: p, label: PERSON_LABEL[p].tr, c: tablo[p] }));
  })();

  const dolu = satirlar.filter((r) => r.c);

  /*
   * Boş tablo GİZLENMİYOR, açıklanıyor. הָיָה fiilinin modern İvritte
   * şimdiki zamanı yoktur ve bu, o fiilin öğretilecek en önemli
   * özelliğidir — kartı hiç göstermemek o bilgiyi de yok ederdi.
   */
  if (dolu.length === 0) {
    return (
      <div className="card-2 space-y-1 p-3">
        <h3 className="text-xs font-semibold" style={{ color: 'var(--text-dim)' }}>
          {FORM_LABEL[form].tr}
        </h3>
        <p className="text-[11px] leading-relaxed" style={{ color: 'var(--accent-fem)' }}>
          Bu fiilin bu zamanı yoktur — eksik veri değil, dilin kendisi böyle.
        </p>
      </div>
    );
  }

  return (
    <div className="card-2 space-y-0.5 p-2.5">
      <h3
        className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: 'var(--accent-text)' }}
      >
        {FORM_LABEL[form].tr}
      </h3>
      {dolu.map((r) => (
        <Cell key={r.k} label={r.label} c={r.c} />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Örnek cümleler
 * ------------------------------------------------------------------ */

function Examples({ verb }: { verb: HebrewVerb }) {
  const yazili = writtenFor(verb.id);
  const uretilen = useMemo(() => sentenceSet(verb), [verb]);
  const hepsi = yazili.length > 0 ? yazili : uretilen;

  if (hepsi.length === 0) return null;

  return (
    <section className="card space-y-2 p-3">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold">
        <MessageSquareText className="size-3.5" style={{ color: 'var(--accent-text)' }} />
        Örnek cümleler
        {yazili.length === 0 && (
          <span className="text-[10px] font-normal" style={{ color: 'var(--text-dim)' }}>
            · kalıptan üretildi
          </span>
        )}
      </h3>
      <ul className="space-y-1.5">
        {hepsi.slice(0, 6).map((s) => (
          <li key={s.plain}>
            <button
              type="button"
              onClick={() => void speak(s.plain)}
              className="card-2 w-full space-y-0.5 p-2 text-start card-interactive"
            >
              <span className="he he-vocalized block text-sm">{s.he}</span>
              <span className="block text-[11px]" style={{ color: 'var(--text-dim)' }}>
                {s.tr}
              </span>
              {'note' in s && s.note && (
                <span className="block text-[10px]" style={{ color: 'var(--accent-text-alt)' }}>
                  <MixedText>{s.note}</MixedText>
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ *
 * Sayfa
 * ------------------------------------------------------------------ */

export default function VerbsPage() {
  usePageWidth('wide');

  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [binyanFilter, setBinyanFilter] = useState<Binyan | null>(null);
  const [levelFilter, setLevelFilter] = useState<CEFR | null>(null);
  const [form, setForm] = useState<HebrewForm>('present');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedId = params.get('v');
  const setSelectedId = (id: string) => {
    const next = new URLSearchParams(params);
    next.set('v', id);
    // `replace`: her fiil seçimi tarayıcı geçmişine girmemeli, yoksa
    // geri düğmesi kullanılamaz hâle gelir.
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    return VERBS.filter((v) => {
      if (binyanFilter && v.binyan !== binyanFilter) return false;
      if (levelFilter && v.cefr !== levelFilter) return false;
      if (!q) return true;
      return (
        v.tr.some((t) => t.toLocaleLowerCase('tr').includes(q)) ||
        v.lemma.translit.toLocaleLowerCase('tr').includes(q) ||
        v.lemma.plain.includes(q) ||
        v.root.join('').includes(q) ||
        v.rootDisplay.includes(q)
      );
    });
  }, [query, binyanFilter, levelFilter]);

  const verb = VERBS.find((v) => v.id === selectedId) ?? filtered[0];
  const siblings = verb ? siblingsOf(verb) : [];

  /*
   * Süzgeç değişince seçili fiil listeden düşmüş olabilir. Düşmüşse
   * listenin ilkine geçiliyor — aksi hâlde sağ taraf listede olmayan bir
   * fiili gösterir ve kullanıcı neyi seçtiğini kaybeder.
   */
  useEffect(() => {
    if (!verb) return;
    if (!filtered.some((v) => v.id === verb.id) && filtered[0]) {
      setSelectedId(filtered[0].id);
    }
    // setSelectedId her çizimde yeniden kuruluyor; bağımlılığa alınırsa döngü olur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered, verb?.id]);

  /** Listede ok tuşlarıyla gezinme — uzun listede fare zorunlu olmasın. */
  const onListKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const i = filtered.findIndex((v) => v.id === verb?.id);
    const next = e.key === 'ArrowDown' ? i + 1 : i - 1;
    const hedef = filtered[Math.max(0, Math.min(filtered.length - 1, next))];
    if (hedef) {
      setSelectedId(hedef.id);
      listRef.current
        ?.querySelector(`[data-id="${CSS.escape(hedef.id)}"]`)
        ?.scrollIntoView({ block: 'nearest' });
    }
  };

  const suzgecVar = binyanFilter !== null || levelFilter !== null;

  return (
    <div className="space-y-4">
      {/*
        GİRİŞ ŞERİDİ. Eskiden burada çıplak bir başlık ve bir paragraf
        vardı; sayfa "nerede başlıyorum" hissi vermiyordu. Şerit hem
        sayfayı açıyor hem de motorun ölçeğini sayıyla söylüyor — bu
        sayfanın bütün iddiası o iki sayının çarpımı.
      */}
      <header className="hero flex flex-wrap items-center gap-x-6 gap-y-4 p-5 sm:p-6">
        <span className="icon-chip icon-chip-lg">
          <Languages className="size-6" />
        </span>

        <div className="min-w-0 flex-1 space-y-1">
          <h1 className="title-gradient text-2xl font-bold tracking-tight sm:text-3xl">
            VERB Hebrew
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
            Kök + binyan çiftinden bütün çekim tablosu üretilir. Her biçim tıklanınca
            seslendirilir.
          </p>
        </div>

        <div className="flex items-center gap-6 sm:gap-8">
          <div>
            <div className="kpi text-2xl leading-none sm:text-3xl">
              {CATALOG_STATS.total.toLocaleString('tr-TR')}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              kök + binyan
            </div>
          </div>
          <div>
            <div className="kpi text-2xl leading-none sm:text-3xl">
              {CATALOG_STATS.totalForms.toLocaleString('tr-TR')}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: 'var(--text-dim)' }}>
              üretilmiş çekim biçimi
            </div>
          </div>
        </div>
      </header>

      {/*
        Üç bölme. Orta bölme `minmax(0,1fr)` ile tanımlı: sadece `1fr`
        verilseydi içindeki uzun İbranice satırlar sütunu şişirip sağ
        bölmeyi ekrandan taşırdı.
      */}
      <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)] 2xl:grid-cols-[17rem_minmax(0,1fr)_21rem]">
        {/* ---------- Sol: liste ve süzgeçler ---------- */}
        <aside className="space-y-2 lg:sticky lg:top-20 lg:self-start">
          <label className="card-2 flex items-center gap-2 px-3 py-2">
            <Search className="size-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Türkçe, okunuş veya kök ara…"
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Fiil ara"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} aria-label="Aramayı temizle">
                <X className="size-3.5" style={{ color: 'var(--text-dim)' }} />
              </button>
            )}
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((o) => !o)}
              className="card-2 card-interactive flex items-center gap-1.5 px-2.5 py-1 text-xs"
              style={{ borderColor: suzgecVar ? 'var(--color-brand-400)' : 'var(--border)' }}
              aria-expanded={filtersOpen}
            >
              <Filter className="size-3.5" />
              Süzgeç
              {suzgecVar && (
                <span
                  className="size-1.5 rounded-full"
                  style={{ background: 'var(--color-brand-400)' }}
                />
              )}
            </button>
            <span className="numeric text-xs" style={{ color: 'var(--text-dim)' }}>
              {filtered.length} / {VERBS.length}
            </span>
            {suzgecVar && (
              <button
                type="button"
                onClick={() => {
                  setBinyanFilter(null);
                  setLevelFilter(null);
                }}
                className="ms-auto text-xs underline underline-offset-2"
                style={{ color: 'var(--accent-text)' }}
              >
                temizle
              </button>
            )}
          </div>

          {filtersOpen && (
            <div
              className="card-2 space-y-2 p-2.5"
              style={{ animation: 'shoresh-pop 180ms cubic-bezier(0.2, 0.9, 0.3, 1.2)' }}
            >
              <div className="space-y-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-dim)' }}>
                  Binyan
                </span>
                <div className="flex flex-wrap gap-1">
                  {BINYANIM.filter((b) => CATALOG_STATS.byBinyan[b] > 0).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setBinyanFilter((c) => (c === b ? null : b))}
                      className="rounded px-1.5 py-0.5 text-[11px] transition"
                      style={{
                        background: binyanFilter === b ? 'var(--surface)' : 'transparent',
                        color: binyanFilter === b ? 'var(--accent-text)' : 'var(--text-dim)',
                        boxShadow:
                          binyanFilter === b ? 'inset 0 0 0 1px var(--color-brand-400)' : 'none',
                      }}
                    >
                      {BINYAN_LABEL[b].tr}{' '}
                      <span className="numeric opacity-60">{CATALOG_STATS.byBinyan[b]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase" style={{ color: 'var(--text-dim)' }}>
                  Seviye
                </span>
                <div className="flex flex-wrap gap-1">
                  {LEVELS.map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLevelFilter((c) => (c === l ? null : l))}
                      className="rounded px-1.5 py-0.5 text-[11px] transition"
                      style={{
                        background: levelFilter === l ? 'var(--surface)' : 'transparent',
                        color: levelFilter === l ? 'var(--accent-text)' : 'var(--text-dim)',
                        boxShadow:
                          levelFilter === l ? 'inset 0 0 0 1px var(--color-brand-400)' : 'none',
                      }}
                    >
                      {l} <span className="numeric opacity-60">{CATALOG_STATS.byLevel[l]}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/*
            Liste ekran yüksekliğine göre uzuyor. Önceki sürümde 28rem'e
            sabitlenmişti ve 900px ekranda listenin altında boşluk kalırken
            içeride kaydırma gerekiyordu.
          */}
          <ul
            ref={listRef}
            onKeyDown={onListKey}
            className="space-y-1 overflow-y-auto pe-1 lg:max-h-[calc(100dvh-16rem)]"
            style={{ maxHeight: '28rem' }}
            tabIndex={0}
            aria-label="Fiil listesi"
          >
            {filtered.map((v) => {
              const active = v.id === verb?.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    data-id={v.id}
                    onClick={() => setSelectedId(v.id)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-start transition"
                    style={{
                      background: active ? 'var(--surface-2)' : 'transparent',
                      boxShadow: active ? 'inset 2px 0 0 var(--color-brand-400)' : 'none',
                    }}
                  >
                    <span className="he he-vocalized shrink-0 text-base">{v.lemma.vocalized}</span>
                    <span
                      className="min-w-0 flex-1 truncate text-xs"
                      style={{ color: active ? 'var(--text)' : 'var(--text-dim)' }}
                    >
                      {v.tr[0]}
                    </span>
                    <span
                      className="shrink-0 text-[10px]"
                      style={{ color: 'var(--accent-text-alt)' }}
                    >
                      {BINYAN_LABEL[v.binyan].tr}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-1 py-4 text-sm" style={{ color: 'var(--text-dim)' }}>
                Eşleşme yok. Süzgeçleri temizlemeyi dene.
              </li>
            )}
          </ul>
        </aside>

        {/* ---------- Orta: künye ve çekimler ---------- */}
        {verb && (
          <section className="min-w-0 space-y-3">
            <div className="card space-y-2.5 p-4">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <button
                  type="button"
                  onClick={() => void speak(verb.lemma.plain)}
                  className="he he-vocalized he-serif text-4xl font-bold transition hover:opacity-70"
                  title="Dinle"
                >
                  {verb.lemma.vocalized}
                </button>
                <span className="text-lg italic" style={{ color: 'var(--accent-text)' }}>
                  {verb.lemma.translit}
                </span>
                <span className="text-lg">{verb.tr.join(', ')}</span>
                <span className="he ms-auto text-sm" style={{ color: 'var(--text-dim)' }}>
                  {verb.lemma.plain}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="card-2 px-2 py-0.5">
                  Kök <span className="he font-semibold">{verb.rootDisplay}</span>
                </span>
                <span className="card-2 px-2 py-0.5">
                  {BINYAN_LABEL[verb.binyan].tr}{' '}
                  <span className="he">{BINYAN_LABEL[verb.binyan].he}</span>
                </span>
                <span className="card-2 px-2 py-0.5">{verb.cefr}</span>
                <span
                  className="card-2 px-2 py-0.5"
                  style={{
                    color: verb.gizra === 'irregular' ? 'var(--accent-fem)' : 'var(--text-dim)',
                  }}
                >
                  <span className="he">{GIZRA_LABEL[verb.gizra].he}</span> ·{' '}
                  {GIZRA_LABEL[verb.gizra].tr}
                </span>
                <span className="ms-auto" style={{ color: 'var(--text-dim)' }}>
                  {BINYAN_LABEL[verb.binyan].sense}
                </span>
              </div>
            </div>

            {/*
              Dar ekranda tek zaman + seçici, geniş ekranda hepsi yan yana.
              Telefonda dört tabloyu yan yana koymak okunamaz olurdu; geniş
              ekranda ise sekme arkasına saklamak karşılaştırmayı engelliyor.
            */}
            <div className="flex flex-wrap gap-1.5 lg:hidden">
              {HEBREW_FORMS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm(f)}
                  className="card-2 px-2.5 py-1 text-xs card-interactive"
                  style={{
                    borderColor: form === f ? 'var(--color-brand-400)' : 'var(--border)',
                    color: form === f ? 'var(--accent-text)' : 'var(--text-dim)',
                  }}
                >
                  {FORM_LABEL[f].tr}
                </button>
              ))}
            </div>

            {/*
              Kartlar TEK KEZ çiziliyor; dar ekran için ayrı bir kopya
              yok. Önce dar ve geniş düzen ayrı ayrı çiziliyordu ve
              belgede her zaman kartı İKİ KEZ bulunuyordu — ekran
              okuyucu bütün çekim tablosunu iki kez okuyordu. Birim
              testi "aynı metinden birden çok öğe" diyerek yakaladı.

              Dar ekranda yalnızca seçili zaman görünüyor, geniş ekranda
              hepsi. Görünürlük CSS'te; DOM'da tek kopya var.
            */}
            <div className="grid gap-3 lg:grid-cols-2">
              {FORM_ORDER.map((f) => (
                <div key={f} className={f === form ? '' : 'hidden lg:block'}>
                  <FormCard verb={verb} form={f} />
                </div>
              ))}
            </div>

          </section>
        )}

        {/* ----------  Bağlam bölmesi  ----------
            TEK düğüm olarak duruyor, iki kez çizilmiyor.
            İlk yazımda dar ve geniş düzen için ayrı ayrı çizilmişti;
            belgede aynı bölüm İKİ KEZ bulunuyordu ve ekran okuyucu
            örnek cümleleri iki kez okuyordu. Birim testi "aynı metinden
            birden çok öğe" diyerek yakaladı.
            Yeri CSS ile değişiyor: geniş ekranda üçüncü sütun, dar
            ekranda çekim tablolarının altı. */}
        {verb && (
          <aside className="space-y-3 lg:col-start-2 2xl:sticky 2xl:top-20 2xl:col-start-3 2xl:row-start-1 2xl:self-start">
            <Context verb={verb} siblings={siblings} onSelect={setSelectedId} />
          </aside>
        )}
      </div>
    </div>
  );
}

/** Kök ailesi, tuzak notu ve örnekler — iki yerde kullanıldığı için ayrı. */
function Context({
  verb,
  siblings,
  onSelect,
}: {
  verb: HebrewVerb;
  siblings: HebrewVerb[];
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {/*
        Düzensiz fiillerde NEDEN düzensiz olduğu söylenmeli. "Bu fiil
        düzensiz, ezberle" demek öğretmek değildir; kalıbın tam olarak
        nerede kırıldığını göstermek öğretir.
      */}
      {verb.gizra === 'irregular' && verb.traps?.[0] && (
        <section
          className="card space-y-1 p-3"
          style={{ boxShadow: 'inset 3px 0 0 var(--accent-fem)' }}
        >
          <h3 className="text-xs font-semibold" style={{ color: 'var(--accent-fem)' }}>
            Bu fiil düzensiz
          </h3>
          <p className="text-[11px] leading-relaxed">
            <MixedText>{verb.traps[0].note}</MixedText>
          </p>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="card space-y-1.5 p-3">
          <h3 className="text-xs font-semibold" style={{ color: 'var(--accent-text)' }}>
            Aynı kök, başka binyan
          </h3>
          <p className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
            Kök anlamın çekirdeğini taşır; kalıp ona yön verir.
          </p>
          <ul className="space-y-1">
            {siblings.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className="card-2 flex w-full items-center gap-2 px-2 py-1.5 text-start card-interactive"
                >
                  <span className="he he-vocalized text-sm">{s.lemma.vocalized}</span>
                  <span className="min-w-0 flex-1 truncate text-[11px]">{s.tr[0]}</span>
                  <span className="shrink-0 text-[10px]" style={{ color: 'var(--accent-text-alt)' }}>
                    {BINYAN_LABEL[s.binyan].tr}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Examples verb={verb} />
    </>
  );
}
