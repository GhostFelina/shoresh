/**
 * Ödev kartı ve karne.
 *
 * NEDEN ÖDEV KENDİLİĞİNDEN VERİLİYOR: Öğretmen ödev verir; öğrenci
 * ödev İSTEMEZ. "Bana ödev ver" düğmesi koymak, işi yine öğrencinin
 * iradesine bırakmak olurdu — zaten çözmeye çalıştığımız sorun buydu.
 * Sınıfa girildiğinde o güne ödev yoksa bir tane yazılıyor.
 *
 * NEDEN "TESLİM ET" HER ZAMAN AÇIK: Yarım ödev de teslim edilebilir;
 * notu ona göre çıkar. Kilitlenseydi eksik kalan bir madde yüzünden
 * öğrenci ödevi hiç kapatamaz, karne de boş kalırdı. Gerçek sınıfta da
 * eksik ödev teslim edilir.
 */
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguagePath } from '@/app/LanguageContext';
import { Check, ClipboardCheck, GraduationCap, Loader2 } from 'lucide-react';
import {
  buildAssignment,
  readAssignments,
  submitAssignment,
  taskProgress,
  todaysAssignment,
  writeAssignments,
  type Assignment,
  type AssignmentEvidence,
} from '@he/teacher/assignments';
import { collectEvidence } from '@he/teacher/assignment-data';
import { readPlacement } from '@he/teacher/placement';
import { readLessonProgress, type LessonMeta } from '@he/teacher/lesson';
import { MixedText } from '@/components/MixedText';
import { dueItems } from '@/lib/progress';
import { today } from '@/lib/db';
import type { CEFR } from '@he/types';

const KIND_LABEL: Record<string, string> = {
  ders: 'ders',
  oyun: 'alıştırma',
  tekrar: 'tekrar',
};

export function Homework({ level, lessons }: { level: CEFR; lessons: LessonMeta[] }) {
  const navigate = useNavigate();
  // Ödev hedefleri dil öneksiz veri; önek burada ekleniyor.
  const yol = useLanguagePath();
  const [odev, setOdev] = useState<Assignment | null>(null);
  const [kanit, setKanit] = useState<AssignmentEvidence | null>(null);
  const [gecmis, setGecmis] = useState<Assignment[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);

  const yenile = useCallback(async () => {
    const gun = today();
    const liste = readAssignments();
    let bugunku = todaysAssignment(liste, gun);

    // Ödev yoksa yaz. Seviye ölçülmemişse ödev verilmiyor: hangi dersi
    // vereceğini bilmeyen bir öğretmen, rastgele ödev vermemeli.
    const placement = readPlacement();
    if (!bugunku && placement) {
      const due = await dueItems(40);
      const yeni = buildAssignment({
        day: gun,
        now: Date.now(),
        level,
        placement,
        progress: readLessonProgress(),
        lessons,
        dueKeys: due.map((d) => d.key),
      });
      if (yeni) {
        bugunku = yeni;
        writeAssignments([...liste, yeni]);
      }
    }

    setOdev(bugunku);
    setGecmis(readAssignments().filter((a) => a.result));
    if (bugunku) setKanit(await collectEvidence(bugunku.assignedAt));
    setYukleniyor(false);
  }, [level, lessons]);

  useEffect(() => {
    void yenile();
  }, [yenile]);

  const teslimEt = () => {
    if (!odev || !kanit) return;
    const guncel = submitAssignment(odev, kanit, Date.now(), today());
    const liste = readAssignments().map((a) => (a.id === guncel.id ? guncel : a));
    writeAssignments(liste);
    setOdev(guncel);
    setGecmis(liste.filter((a) => a.result));
  };

  if (yukleniyor) {
    return (
      <section className="card p-5">
        <p className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-dim)' }}>
          <Loader2 className="size-4 animate-spin" /> ödev hazırlanıyor…
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-2">
        <h2 className="text-sm font-semibold">Ödev</h2>
        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
          yapıldığı ölçülüyor — işaretleme yok
        </span>
      </div>

      {!odev ? (
        <p className="card-2 p-4 text-xs leading-relaxed" style={{ color: 'var(--text-dim)' }}>
          Ödev vermek için önce seviyeni bilmem gerek. Seviye tespit sınavını bitirince
          her gün ödevin hazır olacak.
        </p>
      ) : odev.result ? (
        <article className="card space-y-2 p-5">
          <div className="flex items-baseline gap-2">
            <GraduationCap className="size-4" style={{ color: 'var(--accent-text)' }} />
            <h3 className="text-sm font-semibold">Bugünün ödevi teslim edildi</h3>
            <span className="ms-auto numeric text-lg font-bold" style={{ color: 'var(--accent-text)' }}>
              {odev.result.score}
            </span>
          </div>
          <p className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
            {odev.result.letter}
            {!odev.result.onTime && ' · geç teslim'}
          </p>
          <p className="text-sm leading-relaxed">{odev.result.comment}</p>
        </article>
      ) : (
        <article className="card space-y-3 p-5">
          <div className="flex flex-wrap items-baseline gap-2">
            <ClipboardCheck className="size-4 shrink-0" style={{ color: 'var(--accent-text)' }} />
            <h3 className="text-sm font-semibold">{odev.title}</h3>
            <span className="ms-auto text-[11px]" style={{ color: 'var(--text-dim)' }}>
              teslim: {odev.dueDay}
            </span>
          </div>

          <p
            className="border-s-2 ps-2.5 text-xs italic leading-relaxed"
            style={{ borderColor: 'var(--border)', color: 'var(--text-dim)' }}
          >
            {odev.reason}
          </p>

          <ul className="space-y-2">
            {odev.tasks.map((t, i) => {
              const p = kanit
                ? taskProgress(t, kanit)
                : { done: 0, need: t.need, complete: false, task: t };
              return (
                <li key={`${t.kind}-${i}`}>
                  <button
                    type="button"
                    onClick={() => navigate(yol(t.to))}
                    className="card-2 card-interactive flex w-full items-center gap-3 p-3 text-start"
                  >
                    <span
                      className="grid size-6 shrink-0 place-items-center rounded-full text-[10px] font-bold"
                      style={
                        p.complete
                          ? { background: 'var(--color-brand-500)', color: '#04120f' }
                          : { border: '1px solid var(--border)', color: 'var(--text-dim)' }
                      }
                    >
                      {p.complete ? <Check className="size-3.5" /> : i + 1}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] uppercase tracking-wide" style={{ color: 'var(--text-dim)' }}>
                        {KIND_LABEL[t.kind]}
                      </span>
                      <span className="block truncate text-sm">
                        <MixedText>{t.title}</MixedText>
                      </span>
                    </span>

                    <span className="numeric shrink-0 text-xs" style={{ color: 'var(--text-dim)' }}>
                      {p.done}/{p.need}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={teslimEt}
            className="card-2 card-interactive w-full py-2 text-sm font-semibold"
          >
            Ödevi teslim et
          </button>
        </article>
      )}

      {/* Karne — geçmiş notlar. Tek tek ödevler değil, gidişat görünsün. */}
      {gecmis.length > 0 && (
        <details className="card p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Karne ({gecmis.length} ödev)
          </summary>
          <ul className="mt-3 space-y-1.5">
            {gecmis
              .slice()
              .reverse()
              .slice(0, 12)
              .map((a) => (
                <li key={a.id} className="flex items-baseline gap-2 text-xs">
                  <span className="numeric" style={{ color: 'var(--text-dim)' }}>
                    {a.assignedDay}
                  </span>
                  <span>{a.result!.letter}</span>
                  <span className="numeric ms-auto font-semibold" style={{ color: 'var(--accent-text)' }}>
                    {a.result!.score}
                  </span>
                </li>
              ))}
          </ul>
        </details>
      )}
    </section>
  );
}
