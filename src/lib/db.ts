/**
 * Kalıcı veri katmanı — IndexedDB (Dexie).
 *
 * NEDEN localStorage DEĞİL: İlerleme kaydı binlerce satır olacak (her öğe
 * için bir SRS durumu, her cevap için bir kayıt). localStorage eşzamanlı
 * çalışır ve her yazmada ana iş parçacığını kilitler; ayrıca ~5 MB sınırı
 * var. IndexedDB eşzamansız, büyük ve yapılandırılmış veri için tasarlanmış.
 *
 * NEDEN SUNUCU YOK: Uygulamanın tamamı çevrimdışı çalışabiliyor — alfabe,
 * sözlük, çekim motoru, ses paketi. İlerlemenin sunucuya bağlanması bu
 * özelliği kırardı ve öğrenci uçakta çalışamazdı. Veri cihazda durur.
 * Cihazlar arası eşitleme ileride eklenirse bu katmanın üstüne gelir,
 * yerine değil.
 */
import Dexie, { type Table } from 'dexie';
import type { SrsState } from '@/engine/srs';

/** Tek bir cevabın ham kaydı — istatistiğin ve rapor sayfasının kaynağı. */
export interface AttemptRecord {
  id?: number;
  /** Öğe anahtarı — `verb:כתב:paal:present` gibi. */
  key: string;
  /** Hangi oyunda verildi. */
  gameId: string;
  correct: boolean;
  elapsedMs: number;
  hintsUsed: number;
  /** epoch ms. */
  at: number;
  /** YYYY-MM-DD, yerel gün — günlük gruplama için. */
  day: string;
}

/** Bir öğenin birikmiş öğrenme durumu. */
export interface ProgressRecord {
  key: string;
  /** SRS kartı JSON olarak; Dexie karmaşık nesneyi olduğu gibi saklar. */
  srs: SrsState;
  /** Son güncelleme — epoch ms. */
  updatedAt: number;
  /** Bir sonraki tekrar zamanı — epoch ms. Sorgu bunun üzerinden gider. */
  dueAt: number;
}

/** Günlük özet — seri (streak) ve grafik için. */
export interface DayRecord {
  day: string;
  attempts: number;
  correct: number;
  /** Bugün ilk kez görülen öğe sayısı. */
  learned: number;
  /** Toplam çalışma süresi (ms). */
  studyMs: number;
  /**
   * O gün kazanılan XP.
   *
   * NEDEN GÜNLÜK TUTULUYOR: Günlük hedef bunu okuyor ve toplam XP de
   * bunların toplamı. Ayrı bir "toplam" sayacı tutulsaydı iki değer
   * birbirinden kayabilir ve hangisinin doğru olduğu bilinemezdi.
   *
   * Eski kayıtlarda bu alan YOK; okuyan her yer `?? 0` uygulamalı.
   */
  xp?: number;
}

/** Kazanılmış rozet — yalnızca kazanılanlar yazılır. */
export interface BadgeRecord {
  id: string;
  /** Kazanıldığı an — epoch ms. */
  unlockedAt: number;
  /** Kullanıcıya kutlama gösterildi mi? */
  celebrated: boolean;
}

class ShoreshDb extends Dexie {
  attempts!: Table<AttemptRecord, number>;
  progress!: Table<ProgressRecord, string>;
  days!: Table<DayRecord, string>;
  badges!: Table<BadgeRecord, string>;

  constructor() {
    super('shoresh');
    /*
     * `dueAt` ayrı bir alan olarak İNDEKSLENİYOR, SRS kartının içinden
     * okunmuyor. Sebebi: "bugün tekrar edilecekler" sorgusu uygulamanın
     * en sık sorgusu ve binlerce kaydı tek tek açıp içine bakmak
     * gerekmesin. İndeks sayesinde doğrudan aralık sorgusu yapılıyor.
     */
    this.version(1).stores({
      attempts: '++id, key, day, at',
      progress: 'key, dueAt, updatedAt',
      days: 'day',
    });

    /*
     * Sürüm 2 — rozet tablosu.
     *
     * Dexie yalnızca DEĞİŞEN tabloları yeniden bildirmeyi ister; eskiler
     * olduğu gibi taşınır. `DayRecord.xp` alanı indekssiz olduğu için
     * şema bildirimi gerektirmiyor, ama sürüm yine de yükseltiliyor:
     * yeni tablo eklendi ve iki değişikliği aynı sürümde tutmak,
     * ileride "hangi sürümde ne oldu" sorusunu cevaplanabilir kılıyor.
     */
    this.version(2).stores({
      badges: 'id, unlockedAt',
    });
  }
}

export const db = new ShoreshDb();

/** Yerel güne göre YYYY-MM-DD. */
export function today(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Veritabanı kullanılabilir mi?
 *
 * Gizli sekmede, site verisi kapalıyken ya da eski bir tarayıcıda
 * IndexedDB açılmayabilir. Bu durumda uygulama ÇALIŞMAYA DEVAM ETMELİ —
 * yalnızca ilerleme kaydedilmez. Öğrenme içeriği zaten cihazda.
 */
let available: boolean | null = null;

export async function dbAvailable(): Promise<boolean> {
  if (available !== null) return available;
  try {
    await db.open();
    available = true;
  } catch {
    available = false;
  }
  return available;
}

/** Bütün ilerlemeyi siler. Geri alınamaz. */
export async function wipeProgress(): Promise<void> {
  if (!(await dbAvailable())) return;
  await db.transaction('rw', db.attempts, db.progress, db.days, db.badges, async () => {
    await db.attempts.clear();
    await db.progress.clear();
    await db.days.clear();
    await db.badges.clear();
  });
}
