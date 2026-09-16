/**
 * Seviye tespit sınavı — uyarlamalı (adaptive).
 *
 * NEDEN SABİT SINAV DEĞİL: Sabit 40 soruluk bir sınav, sıfırdan başlayan
 * birine anlamadığı 30 soruyu sordurur ve sınavı bırakmasına yol açar;
 * B2 öğrencisine de bildiği 30 kolay soruyu sordurur ve hiçbir şey
 * ölçmez. Uyarlamalı sınav her cevaptan sonra tahminini günceller ve
 * bir sonraki soruyu TAM O TAHMİNİN ÜSTÜNE kurar — 18 soruda dört
 * seviyeyi ayırt etmenin tek dürüst yolu bu.
 *
 * NEDEN SORULAR YENİDEN YAZILMADI: `features/games/engine.ts` içinde
 * on bir soru üreteci zaten duruyor ve hepsi ölçülen öğeyi (`itemKey`)
 * veriyor. Sınava özel soru yazılsaydı iki ayrı soru havuzu olur, biri
 * düzeltilince öteki eskirdi.
 *
 * NEDEN YAZMALI SORU YOK: Sınavda İbranice yazmak, dilbilgisini değil
 * KLAVYE kullanmayı ölçer. Harfleri tanıyan ama ekran klavyesine alışık
 * olmayan bir öğrenci "bilmiyor" sayılırdı. Yazma becerisi derslerde ve
 * oyunlarda ölçülüyor, burada değil.
 *
 * NEDEN DİNLEME SORUSU YOK: Seslendirme cihaz sesine ve ağa bağlı
 * (bkz. AI_HANDOFF §6). Sesin çalışmadığı bir telefonda dinleme sorusu
 * otomatik yanlış sayılır ve öğrenciyi bir alt seviyeye atardı. Sınav,
 * cihazın kusurunu öğrencinin kusuru gibi göstermemeli.
 */
import {
  binyanDonusturucu,
  binyanEsleme,
  cinsiyetUstasi,
  cumleKurucu,
  harekeUstasi,
  harfAvi,
  kelimeAvi,
  kelimeEsleme,
  kokAvcisi,
  type Question,
  type Rng,
} from '@he/games/engine';
import type { CEFR } from '@he/types';

/* ------------------------------------------------------------------ *
 * Ölçülen beceriler
 * ------------------------------------------------------------------ */

export type SkillId = 'harf' | 'hareke' | 'kelime' | 'kok' | 'fiil' | 'cumle';

export const SKILL_LABEL: Record<SkillId, string> = {
  harf: 'Harf tanıma',
  hareke: 'Hareke ve okuma',
  kelime: 'Kelime bilgisi',
  kok: 'Kök ve binyan',
  fiil: 'Fiil çekimi',
  cumle: 'Cümle kurma',
};

/** Beceri eksikse öğrenciye ne söyleneceği — rapor bunu okur. */
export const SKILL_ADVICE: Record<SkillId, string> = {
  harf: 'Önce harfleri ayırt etmen gerekiyor; benzer yazılan harfler karışıyor.',
  hareke: 'Harfleri tanıyorsun ama harekeleri okumak ayrı bir adım.',
  kelime: 'Dilbilgisi oturmuş, kelime dağarcığın onu taşımıyor.',
  kok: 'Kökü görmek İbranicede her şeyi kolaylaştırır; burada zorlanıyorsun.',
  fiil: 'Çekim kalıpları henüz oturmamış — en çok kazanç burada.',
  cumle: 'Parçaları biliyorsun, sıraya dizmek eksik kalıyor.',
};

const DIFFICULTY_CEFR: Record<number, CEFR> = { 1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2' };

/**
 * Bir becerinin anlamlı olduğu zorluk aralığı.
 *
 * NEDEN ARALIK VAR: "Bu harf hangisi" sorusunun B2 karşılığı yoktur —
 * zorlaştırmak için uydurulan bir harf sorusu, seviyeyi değil sabrı
 * ölçer. Aynı şekilde fiil çekimi A1'in ilk haftasında sorulmaz.
 */
interface SkillSpec {
  id: SkillId;
  min: number;
  max: number;
  make: (rng: Rng, level: CEFR) => Question;
}

const SPECS: SkillSpec[] = [
  { id: 'harf', min: 1, max: 2, make: (rng) => harfAvi(rng) },
  { id: 'hareke', min: 1, max: 3, make: (rng, level) => harekeUstasi(rng, level) },
  {
    id: 'kelime',
    min: 1,
    max: 4,
    make: (rng, level) => (rng() < 0.5 ? kelimeEsleme(rng, level) : kelimeAvi(rng, level)),
  },
  {
    id: 'kok',
    min: 2,
    max: 4,
    make: (rng, level) => (rng() < 0.5 ? kokAvcisi(rng, level) : binyanEsleme(rng, level)),
  },
  {
    id: 'fiil',
    min: 2,
    max: 4,
    make: (rng, level) => (rng() < 0.5 ? cinsiyetUstasi(rng, level) : binyanDonusturucu(rng, level)),
  },
  { id: 'cumle', min: 2, max: 4, make: (rng, level) => cumleKurucu(rng, level) },
];

/* ------------------------------------------------------------------ *
 * Sınav durumu
 * ------------------------------------------------------------------ */

export const PLACEMENT_LENGTH = 18;

/**
 * Başlangıç tahmini A1 ile A2 arasında.
 *
 * NEDEN ORTADAN DEĞİL: Sınava giren çoğunluk yeni başlıyor. Ortadan
 * (B1) başlansaydı yeni başlayan ilk dört soruyu üst üste kaybeder ve
 * sınavı bırakırdı. Aşağıdan başlamak yanlış tahmini yalnızca birkaç
 * soru geciktirir; yukarıdan başlamak öğrenciyi kaybettirir.
 */
const START_ABILITY = 1.8;

export interface PlacementAnswer {
  skill: SkillId;
  difficulty: number;
  correct: boolean;
  elapsedMs: number;
  /** Cevaptan SONRAKİ yetenek tahmini — güven hesabı bu izi okur. */
  abilityAfter: number;
}

export interface PlacementState {
  ability: number;
  answers: PlacementAnswer[];
  /** Aynı öğe iki kez sorulmasın diye. */
  askedKeys: string[];
}

export interface PlacementItem {
  question: Question;
  skill: SkillId;
  difficulty: number;
  /** Kaçıncı soru (1 tabanlı) — arayüz "6 / 18" yazar. */
  index: number;
}

export function startPlacement(): PlacementState {
  return { ability: START_ABILITY, answers: [], askedKeys: [] };
}

export function isPlacementDone(state: PlacementState): boolean {
  return state.answers.length >= PLACEMENT_LENGTH;
}

/**
 * Adım büyüklüğü — başta büyük, sonra küçük.
 *
 * NEDEN AZALIYOR: İlk cevaplar hiçbir şey bilinmezken geliyor, tahmini
 * hızla doğru bölgeye taşımalı. Son cevaplar ise zaten doğru bölgede;
 * orada büyük adım, tek bir dikkatsizlik yüzünden öğrenciyi bir seviye
 * aşağı atardı.
 */
function stepSize(answered: number): number {
  return Math.max(0.28, 1.15 * Math.pow(0.88, answered));
}

/** Zorluğu `d` olan bir soruyu, yeteneği `ability` olanın bilme olasılığı. */
function expected(ability: number, difficulty: number): number {
  return 1 / (1 + Math.exp(difficulty - ability));
}

/**
 * Cevabı işler ve yeni durumu döndürür.
 *
 * Durum DEĞİŞTİRİLMEZ, yenisi üretilir: React'te doğrudan değiştirilen
 * bir nesne yeniden çizim tetiklemez ve sınav ekranda donmuş görünür.
 */
export function applyAnswer(
  state: PlacementState,
  item: PlacementItem,
  correct: boolean,
  elapsedMs: number,
): PlacementState {
  const k = stepSize(state.answers.length);
  const p = expected(state.ability, item.difficulty);
  const ability = state.ability + k * ((correct ? 1 : 0) - p);

  return {
    ability,
    answers: [
      ...state.answers,
      { skill: item.skill, difficulty: item.difficulty, correct, elapsedMs, abilityAfter: ability },
    ],
    askedKeys: [...state.askedKeys, item.question.itemKey],
  };
}

/**
 * Sıradaki soruyu kurar.
 *
 * Zorluk tahmine göre, beceri ise EN AZ SORULANA göre seçilir. İkisi de
 * tahmine göre seçilseydi sınav on sekiz soruyu tek bir beceriye
 * harcayabilir ve "kelimen iyi ama çekimin zayıf" gibi bir rapor
 * üretemezdi.
 */
export function nextItem(state: PlacementState, rng: Rng): PlacementItem | null {
  const target = Math.min(4, Math.max(1, Math.round(state.ability)));

  const eligible = SPECS.filter((s) => target >= s.min && target <= s.max);

  /*
   * İLK SORU ISINMA SORUSUDUR: yalnızca en tabandan başlayan becerilerden
   * (harf, hareke, kelime) seçilir.
   *
   * NEDEN: Sınava giren biri ilk ekranda karışık bir cümleyi sıraya
   * dizmekle karşılaşırsa, ölçüm başlamadan sınavı bırakır. Ölçüm
   * açısından da kayıp yok — ilk soru tahmini zaten en az etkileyen
   * sorudur, çünkü ondan sonra on yedi soru daha var.
   */
  const warmUp = state.answers.length === 0 ? eligible.filter((s) => s.min === 1) : eligible;

  const pool = warmUp.length > 0 ? warmUp : eligible.length > 0 ? eligible : SPECS;

  const askedPerSkill = new Map<SkillId, number>();
  for (const a of state.answers) askedPerSkill.set(a.skill, (askedPerSkill.get(a.skill) ?? 0) + 1);

  const fewest = Math.min(...pool.map((s) => askedPerSkill.get(s.id) ?? 0));
  const candidates = pool.filter((s) => (askedPerSkill.get(s.id) ?? 0) === fewest);
  const spec = candidates[Math.floor(rng() * candidates.length)] ?? pool[0]!;

  const level = DIFFICULTY_CEFR[target] ?? 'A1';
  const seen = new Set(state.askedKeys);

  // Üreteç rastgele seçtiği için aynı öğeye denk gelebilir; birkaç kez
  // deneyip vazgeçiyoruz. Sonsuz döngü yerine tekrar eden bir soru
  // daha iyidir — sınav asla takılmamalı.
  for (let attempt = 0; attempt < 12; attempt++) {
    const question = spec.make(rng, level);
    if (!seen.has(question.itemKey)) {
      return { question, skill: spec.id, difficulty: target, index: state.answers.length + 1 };
    }
  }

  return {
    question: spec.make(rng, level),
    skill: spec.id,
    difficulty: target,
    index: state.answers.length + 1,
  };
}

/* ------------------------------------------------------------------ *
 * Sonuç
 * ------------------------------------------------------------------ */

export type Confidence = 'düşük' | 'orta' | 'yüksek';

export interface SkillScore {
  asked: number;
  correct: number;
}

export interface PlacementResult {
  level: CEFR;
  /** Sürekli tahmin (1–4) — seviyenin neresinde olduğunu gösterir. */
  ability: number;
  confidence: Confidence;
  skills: Record<SkillId, SkillScore>;
  /** Seviyesinin altında kalan beceriler — ders planı buradan kurulur. */
  weak: SkillId[];
  strong: SkillId[];
  correct: number;
  total: number;
  /** epoch ms. */
  at: number;
}

/**
 * Yetenek sayısını seviyeye çevirir.
 *
 * NEDEN EŞİKLER ORTADAN DEĞİL YUKARIDAN: Yetenek sayısı "yarısını
 * doğru yaptığın zorluk" demektir. B1 sorularının hepsini bilip B2'nin
 * hiçbirini bilmeyen öğrencinin sayısı 3.5 çıkar — ortadan bölen bir
 * eşik onu B2 sayardı. Oysa o öğrenci sağlam bir B1'dir. Seviye,
 * ZORLANMADAN yapabildiğin en yüksek basamaktır; ölçüldü ve test
 * "B1 ve altını bilen B2 çıkmaz" diye bunu zorluyor.
 */
export function levelFromAbility(ability: number): CEFR {
  const a = Math.min(4, Math.max(1, ability));
  if (a < 1.8) return 'A1';
  if (a < 2.8) return 'A2';
  if (a < 3.7) return 'B1';
  return 'B2';
}

/**
 * Güven — tahminin son üçte birde ne kadar oturduğuna bakar.
 *
 * NEDEN DOĞRU SAYISINA BAKMIYOR: Uyarlamalı sınavda herkes yaklaşık
 * yarısını doğru yapar; doğru sayısı seviyeyi değil sınavın ayarını
 * ölçer. Asıl soru şu: son sorularda tahmin hâlâ zıplıyor muydu?
 */
function confidenceOf(state: PlacementState): Confidence {
  const tail = state.answers.slice(-6).map((a) => a.abilityAfter);
  if (tail.length < 4) return 'düşük';
  const spread = Math.max(...tail) - Math.min(...tail);
  if (spread < 0.45) return 'yüksek';
  if (spread < 0.95) return 'orta';
  return 'düşük';
}

export function finishPlacement(state: PlacementState): PlacementResult {
  const skills = {} as Record<SkillId, SkillScore>;
  for (const s of SPECS) skills[s.id] = { asked: 0, correct: 0 };
  for (const a of state.answers) {
    const row = skills[a.skill];
    row.asked += 1;
    if (a.correct) row.correct += 1;
  }

  // İki sorudan azına bakıp "zayıf" demek haksızlık: tek bir dikkatsizlik
  // beceriyi sıfır gösterir. Bu yüzden eşik iki soru.
  const rated = (Object.keys(skills) as SkillId[]).filter((k) => skills[k].asked >= 2);
  const weak = rated.filter((k) => skills[k].correct / skills[k].asked < 0.5);
  const strong = rated.filter((k) => skills[k].correct / skills[k].asked >= 0.8);

  return {
    level: levelFromAbility(state.ability),
    ability: Math.min(4, Math.max(1, state.ability)),
    confidence: confidenceOf(state),
    skills,
    weak,
    strong,
    correct: state.answers.filter((a) => a.correct).length,
    total: state.answers.length,
    at: Date.now(),
  };
}

/* ------------------------------------------------------------------ *
 * Kayıt
 * ------------------------------------------------------------------ */

const KEY = 'shoresh.placement';

/**
 * NEDEN localStorage: Sonuç tek ve küçük bir nesne, açılışta HEMEN
 * gerekiyor (sınıf hangi seviyeyi göstereceğini bilmeli). IndexedDB
 * eşzamansız olduğu için sayfa önce yanlış seviyeyle çizilir, sonra
 * zıplardı. Cevapların kendisi zaten `attempts` tablosuna yazılıyor.
 */
export function readPlacement(): PlacementResult | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlacementResult;
    if (!parsed || typeof parsed.level !== 'string' || !parsed.skills) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePlacement(result: PlacementResult): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(result));
  } catch {
    /* gizli pencerede yazılamaz — sonuç oturumluk kalır, sınav yine çalışır */
  }
}

export function clearPlacement(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* yok sayılır */
  }
}

/**
 * Tohumlu rastgelelik (mulberry32).
 *
 * `lesson.ts` içinde aynısının özel bir kopyası var. Ortak bir yere
 * taşımak doğru olurdu ama o dosya şu an başka bir oturum tarafından
 * düzenleniyor; aynı anda iki yerden değiştirmek iş kaybı demek.
 * Taşıma, iki dal birleşince yapılacak.
 */
export function makeRng(seed: number): Rng {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x ^= x + Math.imul(x ^ (x >>> 7), 61 | x);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
