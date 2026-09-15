import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Volume2 } from 'lucide-react';
import { VERBS, formCount } from '@/data/catalog';
import { PHRASES } from '@/data/phrases';
import { generateSentence } from '@/engine/sentence';
import { speak } from '@/lib/speech';
import { LEVELS } from '@/app/nav';
import {
  BINYAN_LABEL,
  BINYANIM,
  GIZRA_LABEL,
  type Binyan,
  type CEFR,
  type HebrewVerb,
} from '@/types/hebrew';

/** Seviyeye özel öğretim notu — sayfanın neden bu sırada olduğunu söyler. */
const LEVEL_GUIDE: Record<CEFR, { focus: string; grammar: string[]; goal: string }> = {
  A1: {
    focus:
      'Bu seviyede tek bir şey önemli: şimdiki zamanı oturtmak. İbranicede şimdiki zaman kişi çekmez, yalnızca cinsiyet ve sayı çeker — bu yüzden dört biçim öğrenince bütün fiilleri şimdiki zamanda kullanabilirsin.',
    grammar: [
      'Şimdiki zaman: 4 biçim (eril/dişil × tekil/çoğul)',
      'אֲנִי / אַתָּה / הוּא — şahıs zamirleri',
      'Belirtme: הַ- öneki ("the" gibi)',
      'Olumsuzluk: fiilden önce לֹא',
    ],
    goal: 'Kendini tanıtmak, ne yaptığını söylemek, basit bir şey istemek.',
  },
  A2: {
    focus:
      'Geçmiş zaman devreye giriyor. Şimdiki zamanın aksine geçmiş KİŞİ çeker — sekiz ayrı biçim. İyi haber: ekler bütün binyanlarda aynı, değişen yalnızca gövde.',
    grammar: [
      'Geçmiş zaman: 8 kişi eki (־תִּי, ־תָ, ־נוּ …)',
      'Mastar: לִ־ / לְ־ öneki',
      'Aynı kök, farklı binyan: לוֹמֵד / מְלַמֵּד',
      'İyelik: שֶׁל ile aitlik',
    ],
    goal: 'Bir günü anlatmak, olanı biteni aktarmak, bir sorunu tarif etmek.',
  },
  B1: {
    focus:
      'Gelecek zaman ve hif’il. Gelecek zaman ön ek alır (א/ת/י/נ), geçmiş gibi sonek değil — bu ayrımı görünce tablonun mantığı yerine oturuyor. Hif’il ise "yaptırmak" demek: כָּתַב yazdı, הִכְתִּיב yazdırdı.',
    grammar: [
      'Gelecek zaman: ön ekli çekim',
      'Hif’il — ettirgen kalıp',
      'Hitpa’el — dönüşlü kalıp (הִתְלַבֵּשׁ)',
      'Bağlaçlar: כִּי, אֲבָל, לָכֵן, כְּדֵי',
    ],
    goal: 'Görüş bildirmek, plan yapmak, neden-sonuç kurmak.',
  },
  B2: {
    focus:
      'Edilgen kalıplar (nif’al, pu’al, huf’al) ve yazılı dil. Bu seviyede artık fiili tanımak yetmiyor; hangi binyanda olduğunu görüp cümlenin kimin yaptığını mı yoksa kime yapıldığını mı anlattığını ayırt etmen gerekiyor.',
    grammar: [
      'Nif’al — edilgen / dönüşlü',
      'Pu’al ve Huf’al — salt edilgen',
      'Mastar + edat kalıpları',
      'Resmî yazı dili ve haber İbranicesi',
    ],
    goal: 'Gazete okumak, tartışmaya katılmak, resmî yazışma anlamak.',
  },
  C1: { focus: '', grammar: [], goal: '' },
  C2: { focus: '', grammar: [], goal: '' },
};

function VerbRow({ verb }: { verb: HebrewVerb }) {
  const [open, setOpen] = useState(false);
  const example = generateSentence(verb, 'present', { slot: 'ms' });

  return (
    <li className="card-2 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition hover:brightness-125"
      >
        <span className="he he-vocalized w-28 shrink-0 text-xl">{verb.lemma.vocalized}</span>
        <span
          className="w-24 shrink-0 text-xs italic"
          style={{ color: 'var(--color-brand-300)' }}
        >
          {verb.lemma.translit}
        </span>
        <span className="min-w-0 flex-1 truncate text-sm">{verb.tr.join(', ')}</span>
        <span
          className="hidden shrink-0 rounded px-1.5 py-0.5 text-[10px] sm:block"
          style={{ background: 'var(--surface)', color: 'var(--color-accent-400)' }}
        >
          {BINYAN_LABEL[verb.binyan].tr}
        </span>
      </button>

      {open && (
        <div className="space-y-2 border-t px-3 py-3">
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded px-2 py-1" style={{ background: 'var(--surface)' }}>
              Kök: <span className="he font-semibold">{verb.rootDisplay}</span>
            </span>
            <span className="rounded px-2 py-1" style={{ background: 'var(--surface)' }}>
              {GIZRA_LABEL[verb.gizra].tr}
            </span>
            <span className="rounded px-2 py-1" style={{ background: 'var(--surface)' }}>
              {formCount(verb)} çekim biçimi
            </span>
          </div>

          {example && (
            <div className="flex items-center gap-3 rounded-lg px-3 py-2" style={{ background: 'var(--surface)' }}>
              <div className="min-w-0 flex-1">
                <div className="he he-vocalized text-lg">{example.he}</div>
                <div className="text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
                  {example.translit}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {example.tr}
                </div>
              </div>
              <button
                type="button"
                onClick={() => speak(example.plain)}
                className="card-2 grid size-9 shrink-0 place-items-center transition hover:brightness-125"
                aria-label="Cümleyi seslendir"
              >
                <Volume2 className="size-4" />
              </button>
            </div>
          )}

          <Link
            to={`/verb?id=${encodeURIComponent(verb.id)}`}
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: 'var(--color-brand-300)' }}
          >
            Tam çekim tablosu
            <ArrowLeft className="size-3 rotate-180" />
          </Link>
        </div>
      )}
    </li>
  );
}

export default function LevelPage() {
  const { level: raw } = useParams<{ level: string }>();
  const level = (raw ?? 'a1').toUpperCase() as CEFR;
  const meta = LEVELS.find((l) => l.level === level);
  const guide = LEVEL_GUIDE[level];

  const [binyanFilter, setBinyanFilter] = useState<Binyan | 'all'>('all');
  const [query, setQuery] = useState('');

  const verbs = useMemo(() => VERBS.filter((v) => v.cefr === level), [level]);
  const phrases = useMemo(() => PHRASES.filter((p) => p.cefr === level), [level]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return verbs.filter((v) => {
      if (binyanFilter !== 'all' && v.binyan !== binyanFilter) return false;
      if (!q) return true;
      return (
        v.tr.some((m) => m.toLowerCase().includes(q)) ||
        v.lemma.translit.toLowerCase().includes(q) ||
        v.lemma.plain.includes(q)
      );
    });
  }, [verbs, binyanFilter, query]);

  const binyanCounts = useMemo(() => {
    const m = new Map<Binyan, number>();
    for (const v of verbs) m.set(v.binyan, (m.get(v.binyan) ?? 0) + 1);
    return m;
  }, [verbs]);

  const totalForms = verbs.reduce((n, v) => n + formCount(v), 0);

  if (!meta) {
    return <p className="py-10 text-sm">Böyle bir seviye yok.</p>;
  }

  return (
    <div className="space-y-5">
      <header className="space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span
            className="rounded-lg px-2.5 py-1 text-lg font-bold"
            style={{ background: 'var(--surface-2)', color: 'var(--color-brand-300)' }}
          >
            {level}
          </span>
          <h1 className="text-2xl font-bold tracking-tight">{meta.title.split('—')[1]?.trim()}</h1>
        </div>
        <p className="max-w-3xl text-sm leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          {guide.focus}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card-2 px-4 py-3">
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
            {verbs.length}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            bu seviyede fiil
          </div>
        </div>
        <div className="card-2 px-4 py-3">
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
            {totalForms.toLocaleString('tr-TR')}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            üretilen çekim biçimi
          </div>
        </div>
        <div className="card-2 px-4 py-3">
          <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--color-brand-300)' }}>
            {phrases.length}
          </div>
          <div className="text-[11px]" style={{ color: 'var(--text-dim)' }}>
            kalıp ifade
          </div>
        </div>
      </div>

      {/* Bu seviyede ne öğrenilir */}
      <section className="card space-y-3 p-5">
        <h2 className="text-sm font-semibold">Bu seviyede ne öğreniyorsun</h2>
        <ul className="grid gap-1.5 sm:grid-cols-2">
          {guide.grammar.map((g) => (
            <li key={g} className="flex items-start gap-2 text-sm">
              <span
                className="mt-1.5 size-1.5 shrink-0 rounded-full"
                style={{ background: 'var(--color-accent-400)' }}
              />
              {g}
            </li>
          ))}
        </ul>
        <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
          <strong style={{ color: 'var(--color-brand-300)' }}>Hedef:</strong> {guide.goal}
        </p>
      </section>

      {/* Fiiller */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="mr-auto text-sm font-semibold">Fiiller</h2>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ara…"
            className="card-2 w-40 bg-transparent px-3 py-1.5 text-xs outline-none"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setBinyanFilter('all')}
            className="card-2 px-2.5 py-1 text-xs transition hover:brightness-125"
            style={{
              borderColor: binyanFilter === 'all' ? 'var(--color-brand-400)' : 'var(--border)',
              color: binyanFilter === 'all' ? 'var(--color-brand-300)' : 'var(--text-dim)',
            }}
          >
            Hepsi ({verbs.length})
          </button>
          {BINYANIM.filter((b) => (binyanCounts.get(b) ?? 0) > 0).map((b) => (
            <button
              key={b}
              type="button"
              onClick={() => setBinyanFilter(b)}
              className="card-2 px-2.5 py-1 text-xs transition hover:brightness-125"
              style={{
                borderColor: binyanFilter === b ? 'var(--color-brand-400)' : 'var(--border)',
                color: binyanFilter === b ? 'var(--color-brand-300)' : 'var(--text-dim)',
              }}
            >
              {BINYAN_LABEL[b].tr} ({binyanCounts.get(b)})
            </button>
          ))}
        </div>

        <ul className="space-y-1.5">
          {shown.map((v) => (
            <VerbRow key={v.id} verb={v} />
          ))}
          {shown.length === 0 && (
            <li className="py-6 text-center text-sm" style={{ color: 'var(--text-dim)' }}>
              Eşleşme yok.
            </li>
          )}
        </ul>
      </section>

      {/* Kalıplar */}
      {phrases.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold">Bu seviyenin kalıpları</h2>
          <div className="grid gap-1.5 sm:grid-cols-2">
            {phrases.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => speak(p.plain)}
                className="card-2 flex items-center gap-3 px-3 py-2 text-right transition hover:brightness-125"
              >
                <span className="he he-vocalized flex-1 text-lg">{p.he}</span>
                <span className="flex-1 text-left">
                  <span className="block text-xs italic" style={{ color: 'var(--color-brand-300)' }}>
                    {p.translit}
                  </span>
                  <span className="block text-xs">{p.tr}</span>
                </span>
                <Volume2 className="size-3.5 shrink-0 opacity-50" />
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
