import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquareText, Search, Volume2 } from 'lucide-react';
import { CATALOG_STATS, VERBS, siblingsOf } from '@/data/catalog';
import { sentenceSet } from '@/engine/sentence';
import { writtenFor } from '@/data/sentences';
import { speak } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';
import {
  BINYAN_LABEL,
  FORM_LABEL,
  GIZRA_LABEL,
  HEBREW_FORMS,
  IMPERATIVE_LABEL,
  MODERN_PERSONS,
  PERSON_LABEL,
  PRESENT_LABEL,
  PRESENT_SLOTS,
  type Conjugation,
  type HebrewForm,
  type HebrewVerb,
} from '@/types/hebrew';

/** Tek bir çekilmiş biçim — harekeli, harekesiz ve okunuşuyla. */
function Cell({ label, c }: { label: string; c: Conjugation | undefined }) {
  if (!c) return null;
  return (
    <button
      type="button"
      onClick={() => speak(c.plain)}
      className="card-2 group flex w-full items-center gap-3 px-3 py-2 text-right card-interactive"
    >
      <span className="w-24 shrink-0 text-left text-[11px]" style={{ color: 'var(--text-dim)' }}>
        {label}
      </span>
      <span className="he he-vocalized flex-1 text-xl font-medium">{c.vocalized}</span>
      <span className="he hidden flex-1 text-base sm:block" style={{ color: 'var(--text-dim)' }}>
        {c.plain}
      </span>
      <span className="w-28 shrink-0 text-left text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
        {c.translit}
      </span>
      <Volume2 className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-70" />
    </button>
  );
}

function FormBlock({ verb, form }: { verb: HebrewVerb; form: HebrewForm }) {
  const t = verb.table;

  if (form === 'infinitive') {
    return <Cell label="mastar" c={t.infinitive} />;
  }
  if (form === 'present') {
    return (
      <div className="space-y-1">
        {PRESENT_SLOTS.map((s) => (
          <Cell key={s} label={PRESENT_LABEL[s].tr} c={t.present[s]} />
        ))}
      </div>
    );
  }
  if (form === 'imperative') {
    const entries = Object.entries(t.imperative);
    if (entries.length === 0) {
      return (
        <p className="px-1 text-xs" style={{ color: 'var(--text-dim)' }}>
          Bu binyanda emir kipi yoktur — edilgen bir kalıba emir verilemez.
        </p>
      );
    }
    return (
      <div className="space-y-1">
        {entries.map(([slot, c]) => (
          <Cell
            key={slot}
            label={IMPERATIVE_LABEL[slot as keyof typeof IMPERATIVE_LABEL].tr}
            c={c}
          />
        ))}
      </div>
    );
  }

  const table = form === 'past' ? t.past : t.future;
  return (
    <div className="space-y-1">
      {MODERN_PERSONS.map((p) => (
        <Cell key={p} label={PERSON_LABEL[p].tr} c={table[p]} />
      ))}
    </div>
  );
}


/**
 * Örnek cümleler — çekim tablosundan üretilir.
 *
 * Tablo tek başına "bu biçim var" der; cümle "bu biçim nerede kullanılır"
 * der. İkisi yan yana olmazsa öğrenci כּוֹתֵב biçimini tanır ama cümle
 * kuramaz.
 */
function Examples({ verb }: { verb: HebrewVerb }) {
  const written = writtenFor(verb.id);
  const generated = sentenceSet(verb);
  if (written.length === 0 && generated.length === 0) return null;

  return (
    <section className="card space-y-3 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <MessageSquareText className="size-4" style={{ color: 'var(--color-accent-400)' }} />
        Örnek cümleler
      </h3>

      {/* Elle yazılmış cümleler — nesnesi ve bağlamı olanlar önce gelir. */}
      {written.length > 0 && (
        <ul className="space-y-1.5">
          {written.map((s, i) => (
            <li key={`w-${i}`} className="card-2 px-3 py-2.5">
              <button
                type="button"
                onClick={() => speak(s.plain)}
                className="group flex w-full items-start gap-3 text-left"
              >
                <span
                  className="w-16 shrink-0 text-[10px] uppercase tracking-wide"
                  style={{ color: 'var(--text-dim)' }}
                >
                  {FORM_LABEL[s.form].short}
                </span>
                <span className="min-w-0 flex-1 space-y-0.5">
                  <span className="he he-vocalized block text-lg leading-relaxed">{s.he}</span>
                  <span className="block text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
                    {s.translit}
                  </span>
                  <span className="block text-sm">{s.tr}</span>
                </span>
                <Volume2 className="mt-1 size-3.5 shrink-0 opacity-0 transition group-hover:opacity-70" />
              </button>
              {s.note && (
                <p
                  className="mt-1.5 border-t pt-1.5 text-[11px] leading-snug"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <MixedText>{s.note}</MixedText>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Çekim tablosundan üretilen cümleler */}
      {generated.length > 0 && (
        <details className="group" open={written.length === 0}>
          <summary
            className="cursor-pointer text-[11px] select-none"
            style={{ color: 'var(--text-dim)' }}
          >
            Çekim tablosundan üretilen {generated.length} cümle
            {written.length > 0 ? ' — her kişi ve zaman için' : ''}
          </summary>
          <p className="pt-1.5 text-[11px]" style={{ color: 'var(--text-dim)' }}>
            Bu cümleler fiilin kendi çekim tablosundan doğar: tablo doğruysa cümle de doğrudur.
          </p>
          <ul className="space-y-1 pt-1.5">
            {generated.map((s, i) => (
              <li key={`g-${s.form}-${i}`}>
                <button
                  type="button"
                  onClick={() => speak(s.plain)}
                  className="card-2 group/g flex w-full items-center gap-3 px-3 py-2 text-left card-interactive"
                >
                  <span
                    className="w-16 shrink-0 text-[10px] uppercase tracking-wide"
                    style={{ color: 'var(--text-dim)' }}
                  >
                    {FORM_LABEL[s.form].short}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="he he-vocalized block text-lg">{s.he}</span>
                    <span
                      className="block text-[11px] italic"
                      style={{ color: 'var(--color-brand-300)' }}
                    >
                      {s.translit}
                    </span>
                  </span>
                  <span className="w-32 shrink-0 text-xs" style={{ color: 'var(--text-dim)' }}>
                    {s.tr}
                  </span>
                  <Volume2 className="size-3.5 shrink-0 opacity-0 transition group-hover/g:opacity-70" />
                </button>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}

export default function VerbsPage() {
  /**
   * Seçili fiil adres çubuğunda tutuluyor. Seviye sayfasından "tam çekim
   * tablosu" bağlantısıyla gelen kullanıcı doğrudan o fiile düşsün diye;
   * ayrıca bağlantı paylaşılabilir hâle geliyor.
   */
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const selectedId = params.get('id') ?? VERBS[0]?.id ?? '';
  const setSelectedId = (id: string) => setParams({ id }, { replace: true });
  const [form, setForm] = useState<HebrewForm>('present');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VERBS;
    return VERBS.filter(
      (v) =>
        v.tr.some((m) => m.toLowerCase().includes(q)) ||
        v.lemma.translit.toLowerCase().includes(q) ||
        v.lemma.plain.includes(q) ||
        v.root.join('').includes(q),
    );
  }, [query]);

  const verb = VERBS.find((v) => v.id === selectedId) ?? filtered[0];
  const siblings = verb ? siblingsOf(verb) : [];

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">VERB Hebrew</h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          {CATALOG_STATS.total} kök+binyan çifti, kural motoruyla üretilmiş{' '}
          {CATALOG_STATS.totalForms.toLocaleString('tr-TR')} çekim biçimi. Her biçim tıklanınca seslendirilir.
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        {/* Fiil listesi */}
        <aside className="space-y-2">
          <label className="card-2 flex items-center gap-2 px-3 py-2">
            <Search className="size-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Türkçe, okunuş veya kök ara…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>

          <ul className="max-h-[28rem] space-y-1 overflow-y-auto pr-1">
            {filtered.map((v) => {
              const active = v.id === verb?.id;
              return (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(v.id)}
                    className="card-2 flex w-full items-center gap-2 px-3 py-2 card-interactive"
                    style={{
                      borderColor: active ? 'var(--color-brand-400)' : 'var(--border)',
                    }}
                  >
                    <span className="he he-vocalized text-lg">{v.lemma.vocalized}</span>
                    <span className="mr-auto truncate text-xs" style={{ color: 'var(--text-dim)' }}>
                      {v.tr[0]}
                    </span>
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px]"
                      style={{ background: 'var(--surface)', color: 'var(--color-accent-400)' }}
                    >
                      {BINYAN_LABEL[v.binyan].tr}
                    </span>
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && (
              <li className="px-1 py-4 text-sm" style={{ color: 'var(--text-dim)' }}>
                Eşleşme yok.
              </li>
            )}
          </ul>
        </aside>

        {/* Çekim tablosu */}
        {verb && (
          <section className="space-y-3">
            <div className="card space-y-3 p-4">
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="he he-vocalized he-serif text-4xl font-bold">
                  {verb.lemma.vocalized}
                </span>
                <span className="text-lg italic" style={{ color: 'var(--color-brand-300)' }}>
                  {verb.lemma.translit}
                </span>
                <span className="text-lg">{verb.tr.join(', ')}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="card-2 px-2 py-1">
                  Kök: <span className="he font-semibold">{verb.rootDisplay}</span>
                </span>
                <span className="card-2 px-2 py-1">
                  Binyan: <span className="font-semibold">{BINYAN_LABEL[verb.binyan].tr}</span>{' '}
                  <span className="he">{BINYAN_LABEL[verb.binyan].he}</span>
                </span>
                <span className="card-2 px-2 py-1">{verb.cefr}</span>
                <span
                  className="card-2 px-2 py-1"
                  style={{
                    color:
                      verb.gizra === 'irregular' ? '#fbbf24' : 'var(--text-dim)',
                  }}
                >
                  {GIZRA_LABEL[verb.gizra].tr}
                </span>
              </div>

              <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {BINYAN_LABEL[verb.binyan].sense}
              </p>

              {/* Düzensiz fiillerde NEDEN düzensiz olduğu söylenmeli.
                  "Bu fiil düzensiz, ezberle" demek öğretmek değildir;
                  kalıbın tam olarak nerede kırıldığını göstermek öğretir. */}
              {verb.gizra === 'irregular' && verb.traps?.[0] && (
                <div
                  className="space-y-1 rounded-lg p-3"
                  style={{
                    background: 'var(--surface-2)',
                    boxShadow: 'inset 3px 0 0 #fbbf24',
                  }}
                >
                  <h3 className="text-xs font-semibold" style={{ color: '#fbbf24' }}>
                    Bu fiil düzensiz
                  </h3>
                  <p className="text-xs leading-relaxed">
                    <MixedText>{verb.traps[0].note}</MixedText>
                  </p>
                </div>
              )}

              {siblings.length > 0 && (
                <div className="card-2 space-y-1 p-3">
                  <h3 className="text-xs font-semibold" style={{ color: 'var(--color-brand-300)' }}>
                    Aynı kök, başka binyan — anlam değişir
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {siblings.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedId(s.id)}
                        className="flex items-center gap-2 rounded px-2 py-1 text-sm card-interactive"
                        style={{ background: 'var(--surface)' }}
                      >
                        <span className="he he-vocalized">{s.lemma.vocalized}</span>
                        <span style={{ color: 'var(--text-dim)' }}>{s.tr[0]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Zaman seçici */}
            <div className="flex flex-wrap gap-1.5">
              {HEBREW_FORMS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setForm(f)}
                  className="card-2 px-3 py-1.5 text-xs card-interactive"
                  style={{
                    borderColor: form === f ? 'var(--color-brand-400)' : 'var(--border)',
                    color: form === f ? 'var(--color-brand-300)' : 'var(--text-dim)',
                  }}
                >
                  {FORM_LABEL[f].tr}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <FormBlock verb={verb} form={form} />
            </div>

            <Examples verb={verb} />
          </section>
        )}
      </div>
    </div>
  );
}
