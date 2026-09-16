/**
 * Ödül motoru — XP, rütbe, günlük hedef, rozet.
 *
 * NEDEN SAF FONKSİYONLAR: Bu katman öğrencinin gördüğü sayıları üretiyor.
 * Veritabanına gömülü olsaydı "neden 14 XP aldım" sorusunu kimse
 * cevaplayamazdı ve bir hesap hatası sessizce yıllarca sürerdi. Burada
 * her kural tek başına test edilebiliyor.
 *
 * TASARIM İLKESİ — ŞİŞİRME YOK:
 * Dopamin sistemi kolayca yalana dönüşür: her tıklamaya bol puan veren
 * bir uygulama önce heyecan verir, sonra sayılar anlamını yitirir ve
 * öğrenci onlara bakmayı bırakır. Buradaki ölçüler bilerek dar:
 *  - Yanlış cevap da puan alır (2 XP) ama doğrunun beşte biri kadar.
 *    Hiç vermemek cesaret kırar; eşit vermek öğrenmeyi anlamsızlaştırır.
 *  - İpucu puanı DÜŞÜRÜR ama sıfırlamaz. İpucu bir başarısızlık değil,
 *    daha ucuz bir öğrenme yolu.
 *  - Hız ödülü küçük. Büyük olsaydı öğrenci düşünmek yerine tahmin
 *    ederdi — hızlı yanlış, yavaş doğrudan iyidir gibi bir şey öğretirdik.
 *  - Seri çarpanı %50'de duruyor. Sınırsız olsaydı bir günlük kaçırma
 *    telafi edilemez bir kayıp gibi hissettirirdi.
 */
import type { CEFR } from '@/core/types';

export interface AnswerReward {
  /** Bu cevaptan kazanılan XP. */
  xp: number;
  /** Nereden geldiği — arayüz bunu satır satır gösteriyor. */
  parts: Array<{ label: string; amount: number }>;
}

export interface RewardInput {
  correct: boolean;
  /** Cevap süresi (ms). */
  elapsedMs: number;
  hintsUsed: number;
  /** Sorunun seviyesi — bilinmiyorsa A1 sayılır. */
  cefr?: CEFR;
  /** O anki gün serisi (streak). */
  streak?: number;
}

const BASE_CORRECT = 10;
const BASE_WRONG = 2;
const SPEED_BONUS = 4;
const SPEED_LIMIT_MS = 4000;
const HINT_PENALTY = 4;

/** Seviye çarpanı — zor soru daha çok değer. */
const LEVEL_MULTIPLIER: Record<CEFR, number> = {
  A1: 1,
  A2: 1.1,
  B1: 1.25,
  B2: 1.4,
  C1: 1.5,
  C2: 1.5,
};

/** Seri çarpanı: her gün %8, en fazla %50. */
export function streakMultiplier(streak: number): number {
  return 1 + Math.min(0.5, Math.max(0, streak) * 0.08);
}

export function rewardFor(input: RewardInput): AnswerReward {
  const parts: AnswerReward['parts'] = [];

  const base = input.correct ? BASE_CORRECT : BASE_WRONG;
  parts.push({ label: input.correct ? 'Doğru cevap' : 'Deneme', amount: base });

  let total = base;

  if (input.correct && input.elapsedMs > 0 && input.elapsedMs <= SPEED_LIMIT_MS) {
    parts.push({ label: 'Hızlı', amount: SPEED_BONUS });
    total += SPEED_BONUS;
  }

  if (input.hintsUsed > 0) {
    /*
     * Ceza, kazanılanı SIFIRLAMIYOR: ipucuyla çözmek de öğrenmedir.
     * En düşük değer 1 XP; sıfıra inmesi "bu cevabın hiç değeri yoktu"
     * demek olurdu ve ipucu düğmesini kullanılamaz hâle getirirdi.
     */
    const penalty = Math.min(HINT_PENALTY, total - 1);
    if (penalty > 0) {
      parts.push({ label: 'İpucu', amount: -penalty });
      total -= penalty;
    }
  }

  const levelMul = LEVEL_MULTIPLIER[input.cefr ?? 'A1'];
  if (levelMul !== 1) {
    const extra = Math.round(total * (levelMul - 1));
    if (extra > 0) {
      parts.push({ label: `${input.cefr} seviyesi`, amount: extra });
      total += extra;
    }
  }

  const streakMul = streakMultiplier(input.streak ?? 0);
  if (streakMul > 1) {
    const extra = Math.round(total * (streakMul - 1));
    if (extra > 0) {
      parts.push({ label: `${input.streak} günlük seri`, amount: extra });
      total += extra;
    }
  }

  return { xp: Math.max(1, Math.round(total)), parts };
}

/* ------------------------------------------------------------------ *
 * Rütbeler — kökten ormana
 * ------------------------------------------------------------------ */

export interface Rank {
  /** Bu rütbeye ulaşmak için gereken toplam XP. */
  at: number;
  name: string;
  he: string;
  blurb: string;
}

/**
 * Rütbe adları uygulamanın kendi eğretilemesini sürdürüyor: marka
 * "kök" demek, öğrenme de kökten büyüyen bir ağaç. Rastgele seçilmiş
 * "bronz / gümüş / altın" basamakları burada anlamsız kalırdı; bu
 * adların her biri aynı zamanda öğrenilecek bir İbranice kelime.
 */
export const RANKS: Rank[] = [
  { at: 0, name: 'Tohum', he: 'זֶרַע', blurb: 'Her şey burada başlıyor' },
  { at: 300, name: 'Kök', he: 'שֹׁרֶשׁ', blurb: 'İlk harfler tuttu' },
  { at: 900, name: 'Gövde', he: 'גֶּזַע', blurb: 'Temel kalıplar oturdu' },
  { at: 2000, name: 'Dal', he: 'עָנָף', blurb: 'Cümle kurabiliyorsun' },
  { at: 4000, name: 'Yaprak', he: 'עָלֶה', blurb: 'Kelime dağarcığın genişledi' },
  { at: 7000, name: 'Çiçek', he: 'פֶּרַח', blurb: 'Konuşma akmaya başladı' },
  { at: 11000, name: 'Meyve', he: 'פְּרִי', blurb: 'Zamanların hepsi elinde' },
  { at: 16000, name: 'Ağaç', he: 'אִילָן', blurb: 'Zor kalıplar bile tanıdık' },
  { at: 24000, name: 'Orman', he: 'יַעַר', blurb: 'Artık öğretebilirsin' },
];

export interface RankState {
  rank: Rank;
  index: number;
  next: Rank | null;
  /** Bir sonraki rütbeye kalan XP. Son rütbede 0. */
  remaining: number;
  /** Bu rütbe içindeki ilerleme, 0-1. Son rütbede 1. */
  progress: number;
}

export function rankFor(xp: number): RankState {
  const safe = Math.max(0, xp);
  let index = 0;
  for (let i = 0; i < RANKS.length; i++) {
    if (safe >= RANKS[i]!.at) index = i;
  }
  const rank = RANKS[index]!;
  const next = RANKS[index + 1] ?? null;
  if (!next) return { rank, index, next: null, remaining: 0, progress: 1 };

  const span = next.at - rank.at;
  return {
    rank,
    index,
    next,
    remaining: next.at - safe,
    progress: span > 0 ? (safe - rank.at) / span : 1,
  };
}

/* ------------------------------------------------------------------ *
 * Günlük hedef
 * ------------------------------------------------------------------ */

export const DAILY_GOALS = [
  { id: 'hafif', label: 'Hafif', xp: 40, blurb: 'Günde ~5 dakika' },
  { id: 'duzenli', label: 'Düzenli', xp: 90, blurb: 'Günde ~12 dakika' },
  { id: 'ciddi', label: 'Ciddi', xp: 180, blurb: 'Günde ~25 dakika' },
  { id: 'yogun', label: 'Yoğun', xp: 320, blurb: 'Günde ~45 dakika' },
] as const;

export type DailyGoalId = (typeof DAILY_GOALS)[number]['id'];
export const DEFAULT_GOAL: DailyGoalId = 'duzenli';

export const goalXp = (id: DailyGoalId): number =>
  DAILY_GOALS.find((g) => g.id === id)?.xp ?? 90;

/* ------------------------------------------------------------------ *
 * Rozetler
 * ------------------------------------------------------------------ */

/**
 * Rozet ölçütünün baktığı özet.
 *
 * NEDEN AYRI BİR TİP: Rozetler doğrudan veritabanına baksaydı her
 * rozet için ayrı sorgu gerekirdi ve test etmek için sahte bir
 * veritabanı kurmak zorunda kalırdık. Özet tek seferde hesaplanıyor,
 * rozetler onun üzerinde saf birer koşul.
 */
export interface RewardSnapshot {
  totalXp: number;
  /** Toplam doğru cevap. */
  correct: number;
  attempts: number;
  /** Arka arkaya çalışılan gün. */
  streak: number;
  /** Hiç görülmüş öğe sayısı. */
  touched: number;
  /** Otomatikleşmiş (mastery >= 80) öğe sayısı. */
  strong: number;
  /** Otomatikleşmiş FİİL sayısı. */
  strongVerbs: number;
  /** Görülmüş farklı harf sayısı. */
  lettersSeen: number;
  /** Tamamlanan ders adımı sayısı. */
  lessonAnswers: number;
  /** 3 saniyenin altında verilen doğru cevap sayısı. */
  fastCorrect: number;
  /** Hiç ipucu kullanmadan verilen art arda doğru sayısının en büyüğü. */
  bestCleanRun: number;
  /** Çalışılan farklı gün sayısı. */
  activeDays: number;
}

export interface Badge {
  id: string;
  name: string;
  /** Nasıl kazanılır — ÖNCEDEN görünür, sürpriz değil. */
  how: string;
  /** Kazanıldığında ne anlama geliyor. */
  meaning: string;
  /** Ölçüt. */
  test: (s: RewardSnapshot) => boolean;
  /** İlerleme göstergesi için: şu an / hedef. */
  progress?: (s: RewardSnapshot) => { at: number; of: number };
}

const count = (at: number, of: number) => ({ at: Math.min(at, of), of });

/**
 * Rozetlerin ölçütü ÖNCEDEN gösteriliyor ve ilerleme çubuğu var.
 *
 * Gizli rozet bir kez sürpriz yaratır, sonra "acaba başka ne var"
 * belirsizliğine dönüşür ve öğrenci hedefsiz kalır. Görünür ölçüt ise
 * bir sonraki oturumun sebebidir.
 */
export const BADGES: Badge[] = [
  {
    id: 'ilk-adim',
    name: 'İlk adım',
    how: 'İlk doğru cevabını ver',
    meaning: 'Başladın. En zor kısmı geçtin.',
    test: (s) => s.correct >= 1,
    progress: (s) => count(s.correct, 1),
  },
  {
    id: 'alefbet',
    name: 'Alef-Bet',
    how: '22 harfin hepsini bir kez gör',
    meaning: 'Artık her İbranice kelimeyi harf harf sökebiliyorsun.',
    test: (s) => s.lettersSeen >= 22,
    progress: (s) => count(s.lettersSeen, 22),
  },
  {
    id: 'yuz-dogru',
    name: 'Yüz doğru',
    how: '100 doğru cevap ver',
    meaning: 'Tanıma aşamasını geçtin.',
    test: (s) => s.correct >= 100,
    progress: (s) => count(s.correct, 100),
  },
  {
    id: 'bin-dogru',
    name: 'Bin doğru',
    how: '1.000 doğru cevap ver',
    meaning: 'Bu artık bir alışkanlık.',
    test: (s) => s.correct >= 1000,
    progress: (s) => count(s.correct, 1000),
  },
  {
    id: 'hafta',
    name: 'Yedi gün',
    how: 'Yedi gün arka arkaya çalış',
    meaning: 'Dil öğrenmede süreklilik süreden önemli.',
    test: (s) => s.streak >= 7,
    progress: (s) => count(s.streak, 7),
  },
  {
    id: 'ay',
    name: 'Otuz gün',
    how: 'Otuz gün arka arkaya çalış',
    meaning: 'Bir ay kesintisiz. Çoğu kişi buraya gelemiyor.',
    test: (s) => s.streak >= 30,
    progress: (s) => count(s.streak, 30),
  },
  {
    id: 'kok-ustasi',
    name: 'Kök ustası',
    how: '50 fiili otomatikleştir',
    meaning: 'Çekimi düşünmeden kurabiliyorsun.',
    test: (s) => s.strongVerbs >= 50,
    progress: (s) => count(s.strongVerbs, 50),
  },
  {
    id: 'kelime-avcisi',
    name: 'Kelime avcısı',
    how: '200 farklı öğeyle karşılaş',
    meaning: 'Dağarcığın günlük hayatı karşılıyor.',
    test: (s) => s.touched >= 200,
    progress: (s) => count(s.touched, 200),
  },
  {
    id: 'ogretmenin-gozdesi',
    name: 'Öğretmenin gözdesi',
    how: 'Öğretmen modunda 20 soru cevapla',
    meaning: 'Kuralı görerek öğrendin, ezberleyerek değil.',
    test: (s) => s.lessonAnswers >= 20,
    progress: (s) => count(s.lessonAnswers, 20),
  },
  {
    id: 'seri-atis',
    name: 'Seri atış',
    how: 'İpucusuz 20 doğru cevabı art arda ver',
    meaning: 'Bildiğini gerçekten biliyorsun.',
    test: (s) => s.bestCleanRun >= 20,
    progress: (s) => count(s.bestCleanRun, 20),
  },
  {
    id: 'simsek',
    name: 'Şimşek',
    how: '50 cevabı üç saniyenin altında doğru bil',
    meaning: 'Tanıma refleks hâline geldi.',
    test: (s) => s.fastCorrect >= 50,
    progress: (s) => count(s.fastCorrect, 50),
  },
  {
    id: 'sadik',
    name: 'Sadık',
    how: 'Toplam 60 gün çalış',
    meaning: 'Arada kesilmiş olsa bile geri döndün. Asıl mesele bu.',
    test: (s) => s.activeDays >= 60,
    progress: (s) => count(s.activeDays, 60),
  },
];

export const BADGE_BY_ID = new Map(BADGES.map((b) => [b.id, b]));

/** Ölçütü sağlanan rozetlerin kimlikleri. */
export function earnedBadges(s: RewardSnapshot): string[] {
  return BADGES.filter((b) => b.test(s)).map((b) => b.id);
}
