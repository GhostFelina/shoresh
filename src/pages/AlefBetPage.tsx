import { useState } from 'react';
import { Volume2 } from 'lucide-react';
import { FINAL_LETTERS, LETTERS_ALPHABETIC, LETTERS_BY_ORDER, LETTER_BY_ID } from '@/data/alefbet';
import { speak } from '@/lib/speech';
import type { HebrewLetter } from '@/types/hebrew';

function LetterCard({
  letter,
  onSelect,
  active,
}: {
  letter: HebrewLetter;
  onSelect: (l: HebrewLetter) => void;
  active: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(letter)}
      className="card flex flex-col items-center gap-1 p-3 transition hover:brightness-125"
      style={{
        borderColor: active ? 'var(--color-brand-400)' : 'var(--border)',
        background: active ? 'var(--surface-2)' : 'var(--surface)',
      }}
    >
      <span className="he he-serif text-4xl leading-none">{letter.glyph}</span>
      <span className="text-[11px] font-medium">{letter.nameTr}</span>
      <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>
        {letter.sound.withDagesh ? `${letter.sound.withDagesh} / ${letter.sound.plain}` : letter.sound.plain}
      </span>
    </button>
  );
}

export default function AlefBetPage() {
  const [selected, setSelected] = useState<HebrewLetter>(LETTERS_BY_ORDER[0]!);
  const [order, setOrder] = useState<'teaching' | 'alphabetic'>('teaching');

  const list = order === 'teaching' ? LETTERS_BY_ORDER.filter((l) => l.kind !== 'final') : LETTERS_ALPHABETIC;

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Alef-Bet</h1>
        <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
          22 harf, 5 sofit biçim. İbranice sağdan sola yazılır ve yazıda ünlü harf yoktur —
          ünlüler harfin altındaki işaretlerle verilir.
        </p>
      </header>

      <div className="flex gap-2">
        {(
          [
            ['teaching', 'Öğretim sırası'],
            ['alphabetic', 'Alfabetik sıra'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setOrder(key)}
            className="card-2 px-3 py-1.5 text-xs transition hover:brightness-125"
            style={{
              borderColor: order === key ? 'var(--color-brand-400)' : 'var(--border)',
              color: order === key ? 'var(--color-brand-300)' : 'var(--text-dim)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {order === 'teaching' && (
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          Öğretim sırası alfabetik değildir: sesi net ve birbirine benzemeyen harfler önce gelir,
          böylece dördüncü harften sonra gerçek kelime okuyabilirsin.
        </p>
      )}

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
        {list.map((l) => (
          <LetterCard key={l.id} letter={l} onSelect={setSelected} active={l.id === selected.id} />
        ))}
      </div>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Sofit biçimler — kelime sonunda</h2>
        <div className="grid grid-cols-5 gap-2">
          {FINAL_LETTERS.map((l) => (
            <LetterCard key={l.id} letter={l} onSelect={setSelected} active={l.id === selected.id} />
          ))}
        </div>
      </section>

      {/* Seçili harfin ayrıntısı */}
      <section className="card space-y-3 p-5">
        <div className="flex items-start gap-4">
          <span className="he he-serif text-7xl leading-none">{selected.glyph}</span>
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-baseline gap-2">
              <h2 className="text-xl font-bold">{selected.nameTr}</h2>
              <span className="he text-lg" style={{ color: 'var(--color-brand-300)' }}>
                {selected.nameHe}
              </span>
            </div>
            <dl className="flex flex-wrap gap-x-5 gap-y-1 text-xs" style={{ color: 'var(--text-dim)' }}>
              <div>
                <dt className="inline">Ses: </dt>
                <dd className="inline font-medium" style={{ color: 'var(--text)' }}>
                  {selected.sound.withDagesh
                    ? `${selected.sound.withDagesh} (noktalı) / ${selected.sound.plain}`
                    : selected.sound.plain}
                </dd>
              </div>
              <div>
                <dt className="inline">Sayı değeri: </dt>
                <dd className="inline font-medium" style={{ color: 'var(--text)' }}>
                  {selected.gematria}
                </dd>
              </div>
              {selected.finalGlyph && (
                <div>
                  <dt className="inline">Sonda: </dt>
                  <dd className="he inline text-base font-medium" style={{ color: 'var(--text)' }}>
                    {selected.finalGlyph}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <button
            type="button"
            onClick={() => speak(selected.nameHe)}
            className="card-2 grid size-10 shrink-0 place-items-center transition hover:brightness-125"
            aria-label={`${selected.nameTr} harfini seslendir`}
          >
            <Volume2 className="size-4" />
          </button>
        </div>

        {selected.noteTr && <p className="text-sm leading-relaxed">{selected.noteTr}</p>}

        {selected.confusedWith && selected.confusedWith.length > 0 && (
          <div className="card-2 space-y-2 p-3">
            <h3 className="text-xs font-semibold" style={{ color: 'var(--color-brand-300)' }}>
              Karıştırma
            </h3>
            <div className="flex items-center gap-3">
              {selected.confusedWith.map((id) => {
                const other = LETTER_BY_ID.get(id);
                if (!other) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSelected(other)}
                    className="flex items-center gap-2 text-sm transition hover:brightness-125"
                  >
                    <span className="he he-serif text-3xl">{other.glyph}</span>
                    <span style={{ color: 'var(--text-dim)' }}>{other.nameTr}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
