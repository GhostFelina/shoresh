/**
 * Yapay zekâya verilen bağlam — öğrencinin kim olduğu ve KULLANABİLECEĞİ
 * İbranice.
 *
 * NEDEN "KULLANABİLECEĞİN İBRANİCE" LİSTESİ VAR — bu dosyanın asıl işi:
 * Dil modelleri İbranice çekimde ikna edici biçimde yanılır. Öğrenci de
 * yanlış olduğunu anlayamaz; anlayabilseydi zaten öğrenmeye ihtiyacı
 * olmazdı. Bu yüzden modele "İbranice biliyorsun, kullan" demiyoruz;
 * kullanacağı biçimleri ÖNÜNE KOYUYORUZ. Listedeki her biçim çekim
 * motorundan geliyor ve motorun ürettiği her biçim testten geçiyor.
 * Model artık hatırlamıyor, okuyor.
 *
 * NEDEN SEVİYEYE GÖRE SÜZÜLÜYOR: A1 öğrencisiyle konuşurken B2
 * kelimesi kullanan bir öğretmen, öğretmiyor; gösteriş yapıyor.
 *
 * NEDEN RASTGELE DEĞİL, GÜNE GÖRE SABİT: Aynı oturumda iki soru soran
 * öğrenci, iki farklı kelime evreniyle karşılaşmasın. Gün değişince
 * liste tazeleniyor ki öğretmen hep aynı on kelimeyi tekrarlamasın.
 */
import { VERBS } from '@/data/catalog';
import { wordsUpToLevel } from '@/data/lexicon';
import { PHRASES } from '@/data/phrases';
import { SKILL_LABEL, type PlacementResult } from '@/features/teacher/placement';
import { BINYAN_LABEL, type CEFR } from '@/types/hebrew';

const ORDER: CEFR[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

/** Bağlama girecek örnek sayısı — bağlam ne kadar uzunsa cevap o kadar yavaş. */
const VERB_COUNT = 18;
const WORD_COUNT = 22;
const PHRASE_COUNT = 8;

/** Güne sabitlenmiş tohum: aynı gün aynı liste, ertesi gün yenisi. */
function daySeed(now = new Date()): number {
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function pickEvenly<T>(arr: readonly T[], count: number, seed: number): T[] {
  if (arr.length <= count) return [...arr];
  const out: T[] = [];
  // Eşit aralıklarla geziniyoruz: baştan `count` tane almak listenin
  // hep aynı ucunu gösterirdi (veri dosyaları konuya göre sıralı).
  const step = arr.length / count;
  const offset = seed % Math.max(1, Math.floor(step));
  for (let i = 0; i < count; i++) {
    out.push(arr[Math.min(arr.length - 1, Math.floor(i * step) + offset)]!);
  }
  return out;
}

export interface ContextInput {
  level: CEFR;
  placement: PlacementResult | null;
  streak?: number;
  lessonsDone?: number;
  /** Açık olan dersin başlığı — varsa konuşma ona bağlanır. */
  lessonTitle?: string;
  now?: Date;
}

/**
 * Öğrenci tanıtımı + izin verilen İbranice.
 *
 * Çıktı düz metin: modele giden şey zaten metin, ayrıca bir biçim
 * uydurmanın kazancı yok.
 */
export function teacherContext(input: ContextInput): string {
  const { level, placement, streak = 0, lessonsDone = 0, lessonTitle } = input;
  const seed = daySeed(input.now);
  const max = ORDER.indexOf(level);

  const verbs = pickEvenly(
    VERBS.filter((v) => ORDER.indexOf(v.cefr) <= max),
    VERB_COUNT,
    seed,
  );
  const words = pickEvenly(wordsUpToLevel(level), WORD_COUNT, seed);
  const phrases = pickEvenly(
    PHRASES.filter((p) => ORDER.indexOf(p.cefr) <= max),
    PHRASE_COUNT,
    seed,
  );

  const satirlar: string[] = [];

  satirlar.push('ÖĞRENCİ');
  satirlar.push(`Seviye: ${level}${placement ? ` (sınavla ölçüldü, güven: ${placement.confidence})` : ' (henüz ölçülmedi)'}`);

  if (placement && placement.weak.length > 0) {
    satirlar.push(`Zorlandığı alanlar: ${placement.weak.map((k) => SKILL_LABEL[k]).join(', ')}`);
  }
  if (placement && placement.strong.length > 0) {
    satirlar.push(`İyi olduğu alanlar: ${placement.strong.map((k) => SKILL_LABEL[k]).join(', ')}`);
  }
  satirlar.push(`Tamamladığı ders: ${lessonsDone} · aralıksız çalışma: ${streak} gün`);
  if (lessonTitle) satirlar.push(`Şu an açık olan ders: ${lessonTitle}`);

  satirlar.push('');
  satirlar.push('KULLANABİLECEĞİN İBRANİCE — bu listenin DIŞINA ÇIKMA.');
  satirlar.push('Listede olmayan bir biçim gerekirse "bu biçimi burada gösteremiyorum" de.');
  satirlar.push('');

  satirlar.push('Fiiller (sözlük biçimi = 3. tekil eril geçmiş):');
  for (const v of verbs) {
    satirlar.push(
      `  ${v.lemma.vocalized} (${v.lemma.translit}) = "${v.tr[0]}" · kök ${v.rootDisplay} · ${BINYAN_LABEL[v.binyan].tr} · ${v.cefr}`,
    );
  }

  satirlar.push('');
  satirlar.push('Kelimeler:');
  for (const w of words) {
    satirlar.push(`  ${w.vocalized} (${w.translit}) = "${w.tr[0]}" · ${w.topic} · ${w.cefr}`);
  }

  if (phrases.length > 0) {
    satirlar.push('');
    satirlar.push('Kalıplar:');
    for (const p of phrases) {
      satirlar.push(`  ${p.he} (${p.translit}) = "${p.tr}"`);
    }
  }

  return satirlar.join('\n');
}

/** Sohbet isteği — bağlam + geçmiş + yeni soru. */
export function chatRequest(
  context: string,
  history: Array<{ role: 'ogrenci' | 'ogretmen'; text: string }>,
  question: string,
): string {
  const gecmis = history
    .slice(-6) // Son üç tur yeter: daha uzunu cevabı yavaşlatır, konuyu dağıtır.
    .map((m) => `${m.role === 'ogrenci' ? 'Öğrenci' : 'Sen'}: ${m.text}`)
    .join('\n');

  return [
    context,
    '',
    gecmis ? `KONUŞMA GEÇMİŞİ\n${gecmis}` : '',
    '',
    `ÖĞRENCİNİN YENİ SORUSU\n${question}`,
  ]
    .filter(Boolean)
    .join('\n');
}

/** Yanlış cevabın açıklaması — olgular motordan geliyor. */
export function explainRequest(input: {
  context: string;
  soru: string;
  ogrencininCevabi: string;
  dogruCevap: string;
  olgu?: string;
}): string {
  return [
    input.context,
    '',
    'YANLIŞ CEVAPLANAN SORU',
    `Soru: ${input.soru}`,
    `Öğrencinin cevabı: ${input.ogrencininCevabi}`,
    `Doğru cevap: ${input.dogruCevap}`,
    input.olgu ? `Motorun bildiği kural: ${input.olgu}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
