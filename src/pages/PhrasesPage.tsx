import { useMemo, useState } from 'react';
import { Volume2 } from 'lucide-react';
import { PHRASES, PHRASE_TOPICS, TOPIC_LABEL, type PhraseTopic } from '@/data/phrases';
import { speak } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';

export default function PhrasesPage() {
  const [topic, setTopic] = useState<PhraseTopic | 'all'>('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const m = new Map<PhraseTopic, number>();
    for (const p of PHRASES) m.set(p.topic, (m.get(p.topic) ?? 0) + 1);
    return m;
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PHRASES.filter((p) => {
      if (topic !== 'all' && p.topic !== topic) return false;
      if (!q) return true;
      return (
        p.tr.toLowerCase().includes(q) ||
        p.translit.toLowerCase().includes(q) ||
        p.plain.includes(q)
      );
    });
  }, [topic, query]);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">Kalıplar</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Bunlar kelime değil, parça. <span className="he">מַה נִּשְׁמָע</span> kelime kelime "ne
          duyuluyor" demektir ama anlamı "naber"dir. Çekim motorundan geçmezler, sözlükten de
          çıkarılamazlar — olduğu gibi öğrenilirler.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Türkçe veya okunuş ara…"
          className="card-2 w-56 bg-transparent px-3 py-1.5 text-xs outline-none"
        />
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          {shown.length} / {PHRASES.length} kalıp
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setTopic('all')}
          className="card-2 px-2.5 py-1 text-xs card-interactive"
          style={{
            borderColor: topic === 'all' ? 'var(--color-brand-400)' : 'var(--border)',
            color: topic === 'all' ? 'var(--color-brand-300)' : 'var(--text-dim)',
          }}
        >
          Hepsi
        </button>
        {PHRASE_TOPICS.filter((t) => (counts.get(t) ?? 0) > 0).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTopic(t)}
            className="card-2 px-2.5 py-1 text-xs card-interactive"
            style={{
              borderColor: topic === t ? 'var(--color-brand-400)' : 'var(--border)',
              color: topic === t ? 'var(--color-brand-300)' : 'var(--text-dim)',
            }}
          >
            {TOPIC_LABEL[t]} ({counts.get(t)})
          </button>
        ))}
      </div>

      <ul className="space-y-1.5">
        {shown.map((p) => (
          <li key={p.id} className="card-2 px-3 py-2.5">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="he he-vocalized he-serif text-xl">{p.he}</div>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="text-sm italic" style={{ color: 'var(--color-brand-300)' }}>
                    {p.translit}
                  </span>
                  <span className="text-sm font-medium">{p.tr}</span>
                </div>
                {p.literal && (
                  <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
                    Birebir: <MixedText>{p.literal}</MixedText>
                  </div>
                )}
                {p.note && (
                  <div className="mt-1 text-[11px] leading-snug" style={{ color: 'var(--text-dim)' }}>
                    <MixedText>{p.note}</MixedText>
                  </div>
                )}
              </div>
              <span
                className="shrink-0 rounded px-1.5 py-0.5 text-[10px]"
                style={{ background: 'var(--surface)', color: 'var(--color-accent-400)' }}
              >
                {p.cefr}
              </span>
              <button
                type="button"
                onClick={() => speak(p.plain)}
                className="card grid size-9 shrink-0 place-items-center card-interactive"
                aria-label={`${p.tr} kalıbını seslendir`}
              >
                <Volume2 className="size-4" />
              </button>
            </div>
          </li>
        ))}
        {shown.length === 0 && (
          <li className="py-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
            Eşleşme yok.
          </li>
        )}
      </ul>
    </div>
  );
}
