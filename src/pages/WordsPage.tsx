import { useMemo, useState } from 'react';
import { AlertTriangle, Search, Volume2 } from 'lucide-react';
import {
  HOMOGRAPHS,
  LEXICON_STATS,
  TOPICS,
  WORDS,
  WORD_CLASS_LABEL,
} from '@/data/lexicon';
import { speak } from '@/lib/speech';
import { MixedText } from '@/components/MixedText';
import type { CEFR, HebrewWord, WordClass } from '@/types/hebrew';

const LEVELS: CEFR[] = ['A1', 'A2', 'B1', 'B2'];
const CLASSES: WordClass[] = ['noun', 'adjective', 'adverb', 'preposition', 'number'];

/** Cinsiyet rozeti — İbranicede uyumun kaynağı, göz ardı edilemez. */
function GenderBadge({ gender }: { gender: HebrewWord['gender'] }) {
  if (!gender) return null;
  const isM = gender === 'm';
  return (
    <span
      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
      style={{
        background: 'var(--surface)',
        color: isM ? 'var(--color-accent-400)' : '#f0abfc',
      }}
      title={isM ? 'eril — sıfat da eril olur' : 'dişil — sıfat da dişil olur'}
    >
      {isM ? 'eril' : 'dişil'}
    </span>
  );
}

function WordRow({ word }: { word: HebrewWord }) {
  return (
    <li className="card-2 flex items-center gap-3 px-3 py-2.5">
      <button
        type="button"
        onClick={() => speak(word.plain)}
        className="group flex min-w-0 flex-1 items-center gap-3 text-right"
      >
        <span className="he he-vocalized he-serif w-32 shrink-0 text-xl">{word.vocalized}</span>
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
            {word.translit}
          </span>
          <span className="block truncate text-sm">{word.tr.join(', ')}</span>
          {word.noteTr && (
            <span className="block text-[11px]" style={{ color: 'var(--text-dim)' }}>
              <MixedText>{word.noteTr}</MixedText>
            </span>
          )}
        </span>
        <Volume2 className="size-3.5 shrink-0 opacity-0 transition group-hover:opacity-70" />
      </button>

      {word.plural && (
        <span
          className="hidden shrink-0 text-right sm:block"
          title="çoğul biçim"
        >
          <span className="block text-[9px]" style={{ color: 'var(--text-dim)' }}>
            çoğul
          </span>
          <span className="he block text-sm">{word.plural.plain}</span>
        </span>
      )}

      <GenderBadge gender={word.gender} />
      <span
        className="hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] sm:block"
        style={{ background: 'var(--surface)', color: 'var(--text-dim)' }}
      >
        {WORD_CLASS_LABEL[word.wordClass]}
      </span>
      <span className="shrink-0 text-[10px]" style={{ color: 'var(--text-dim)' }}>
        {word.cefr}
      </span>
    </li>
  );
}

export default function WordsPage() {
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState<string | 'all'>('all');
  const [wordClass, setWordClass] = useState<WordClass | 'all'>('all');
  const [level, setLevel] = useState<CEFR | 'all'>('all');

  const topicCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const w of WORDS) m.set(w.topic, (m.get(w.topic) ?? 0) + 1);
    return m;
  }, []);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WORDS.filter((w) => {
      if (topic !== 'all' && w.topic !== topic) return false;
      if (wordClass !== 'all' && w.wordClass !== wordClass) return false;
      if (level !== 'all' && w.cefr !== level) return false;
      if (!q) return true;
      return (
        w.tr.some((t) => t.toLowerCase().includes(q)) ||
        w.translit.toLowerCase().includes(q) ||
        w.plain.includes(q)
      );
    });
  }, [query, topic, wordClass, level]);

  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="title-gradient text-2xl font-bold tracking-tight">Kelimeler</h1>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Fiiller kökten üretilir, isimler üretilmez. İbranicede isim de kökten doğar
          (<span className="he">כ־ת־ב</span> → <span className="he">מִכְתָּב</span> "mektup") ama
          hangi kalıbın hangi anlamı vereceği öngörülemez — bu yüzden isimler veri olarak durur.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          [LEXICON_STATS.total, 'kelime'],
          [LEXICON_STATS.byClass.noun, 'isim'],
          [LEXICON_STATS.byClass.adjective, 'sıfat'],
          [LEXICON_STATS.topics, 'konu'],
        ].map(([v, l]) => (
          <div key={l as string} className="card-2 px-4 py-3">
            <div
              className="text-2xl numeric font-bold"
              style={{ color: 'var(--color-brand-300)' }}
            >
              {v as number}
            </div>
            <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
              {l as string}
            </div>
          </div>
        ))}
      </div>

      {/* Cinsiyet uyarısı — İbranicenin en çok ihmal edilen yanı */}
      <section className="card-2 space-y-1 p-4">
        <h2 className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#fbbf24' }}>
          <AlertTriangle className="size-3.5" />
          Cinsiyeti kelimeyle birlikte öğren
        </h2>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          İbranicede cinsiyetsiz isim yoktur ve sıfat, sayı, fiil hepsi isme uyar:{' '}
          <span className="he">בַּיִת גָּדוֹל</span> ama <span className="he">דִּירָה גְּדוֹלָה</span>.
          Kelimeyi cinsiyetiyle ezberlemezsen sonradan ayıklamak çok daha zor —
          listede {LEXICON_STATS.masculine} eril, {LEXICON_STATS.feminine} dişil kelime var.
        </p>
      </section>

      {/* Süzgeçler */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <label className="card-2 flex flex-1 items-center gap-2 px-3 py-2 sm:max-w-xs">
            <Search className="size-4 shrink-0" style={{ color: 'var(--text-dim)' }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Türkçe, okunuş veya İbranice ara…"
              className="w-full bg-transparent text-sm outline-none"
            />
          </label>
          <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
            {shown.length} / {WORDS.length}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(['all', ...LEVELS] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className="card-2 px-2.5 py-1 text-xs card-interactive"
              style={{
                borderColor: level === l ? 'var(--color-brand-400)' : 'var(--border)',
                color: level === l ? 'var(--color-brand-300)' : 'var(--text-dim)',
              }}
            >
              {l === 'all' ? 'Tüm seviyeler' : l}
            </button>
          ))}
          {(['all', ...CLASSES] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setWordClass(c)}
              className="card-2 px-2.5 py-1 text-xs card-interactive"
              style={{
                borderColor: wordClass === c ? 'var(--color-accent-400)' : 'var(--border)',
                color: wordClass === c ? 'var(--color-accent-400)' : 'var(--text-dim)',
              }}
            >
              {c === 'all' ? 'Tüm türler' : WORD_CLASS_LABEL[c]}
            </button>
          ))}
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
            Tüm konular
          </button>
          {TOPICS.map((t) => (
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
              {t} ({topicCounts.get(t)})
            </button>
          ))}
        </div>
      </div>

      <ul className="space-y-1.5">
        {shown.map((w) => (
          <WordRow key={w.id} word={w} />
        ))}
        {shown.length === 0 && (
          <li className="py-8 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
            Eşleşme yok.
          </li>
        )}
      </ul>

      {/* Eş yazımlılar */}
      {HOMOGRAPHS.length > 0 && (
        <section className="card space-y-2 p-5">
          <h2 className="text-sm font-semibold">Harekesiz yazımı aynı olanlar</h2>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
            İbranice okumanın en zor yanı: harekesiz metinde bu kelimeleri ancak cümleden
            ayırt edebilirsin. Hangisi olduğunu harfler söylemez, bağlam söyler.
          </p>
          <div className="space-y-1.5">
            {HOMOGRAPHS.map((g) => (
              <div key={g.plain} className="card-2 px-3 py-2">
                <div className="he he-serif mb-1 text-lg">{g.plain}</div>
                <div className="flex flex-wrap gap-3">
                  {g.words.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => speak(w.plain)}
                      className="flex items-baseline gap-2 text-sm card-interactive"
                    >
                      <span className="he he-vocalized text-lg">{w.vocalized}</span>
                      <span className="text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
                        {w.translit}
                      </span>
                      <span className="text-xs">{w.tr[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
