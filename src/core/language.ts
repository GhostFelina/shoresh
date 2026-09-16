/**
 * Dil modülü sözleşmesi.
 *
 * NEDEN VAR: Uygulama İbranice ile başladı ama ileride başka diller
 * gelecek. Kabuk (menü, yönlendirme, ödül göstergesi, ilerleme sayfası)
 * doğrudan İbranice dosyalarını içeri alsaydı, ikinci dil eklemek kabuğun
 * her parçasına "hangi dil?" koşulu serpmek olurdu ve her yeni dilde o
 * koşulların biri unutulurdu.
 *
 * Burada tersi yapılıyor: kabuk YALNIZCA bu sözleşmeyi biliyor. Bir dil
 * eklemek, bu arayüzü dolduran bir dosya yazıp kayda eklemek demek.
 *
 * İKİ EKSEN KARIŞTIRILMIYOR:
 *   ÖĞRENİLEN dil (he, ko…) → bu dosya
 *   ARAYÜZ dili (tr, en…)   → ayrı bir katman
 * İkisi bağımsız: İngilizce arayüzle İbranice öğrenmek de, Türkçe
 * arayüzle Korece öğrenmek de mümkün olmalı.
 */
import type { ComponentType, LazyExoticComponent } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { CEFR, ScriptDirection } from './types';
import type { ItemKey } from '@/engine/srs';

/** Sol menüde tek bir giriş. */
export interface LanguageNavItem {
  /** Dil önekinden SONRAKİ yol: 'verb', 'oyunlar', 'seviye/a1'. */
  path: string;
  label: string;
  hint: string;
  icon?: LucideIcon;
  /** Seviye sekmelerinde rozet olarak görünen kısa etiket. */
  badge?: string;
  /** Girişin kendi rengi — CSS değişkeni adı. */
  tint?: string;
  /** Yalnızca tam eşleşmede etkin sayılsın mı? */
  end?: boolean;
}

export interface LanguageNavGroup {
  id: string;
  title: string | null;
  items: LanguageNavItem[];
}

/** Dilin kendi sayfası. */
export interface LanguageRoute {
  /** Dil önekinden SONRAKİ yol deseni: '', 'verb', 'seviye/:level'. */
  path: string;
  element: LazyExoticComponent<ComponentType<unknown>>;
}

/** Ana sayfadaki sayaç. */
export interface LanguageStat {
  value: number;
  label: string;
}

/**
 * Bir tekrar öğesinin okunabilir hâli.
 *
 * İlerleme sayfası `verb:כתב:paal:present` gibi teknik bir anahtarı
 * öğrenciye gösteremez. Anahtarı çözmek DİLİN işi: Korece'de "binyan"
 * diye bir şey yok, kendi eksenleri olacak.
 */
export interface DescribedItem {
  /** Hedef dildeki yazım. */
  native: string;
  /** Arayüz dilindeki karşılık. */
  meaning: string;
  /** Hangi eksende çalışıldığı — 'ŞİMDİKİ', 'CİNSİYET' gibi. */
  axis?: string;
}

export interface LanguageModule {
  /** Kısa kod ve URL öneki: 'he', 'ko'. */
  id: string;
  /** Arayüzde görünen ad — arayüz diline göre. */
  name: { tr: string; en: string };
  /** Dilin kendi adı: 'עברית', '한국어'. */
  nativeName: string;
  /**
   * İngilizce adı — sekme ve menü başlıklarında kullanılıyor.
   * Kullanıcının istediği "Hebrew / Korean" yazısı burası.
   */
  englishName: string;
  /** Yazım yönü — kabuk gövde yönünü buna göre kuruyor. */
  direction: ScriptDirection;
  /** Bu dilde içeriği olan seviyeler. */
  levels: CEFR[];
  /** Kısa tanıtım — dil seçicide görünür. */
  blurb: { tr: string; en: string };

  /** Sol menü. */
  nav: LanguageNavGroup[];
  /** Sayfalar. */
  routes: LanguageRoute[];

  /**
   * Bırakılmış adresler: eski yol → şimdiki yol (ikisi de dil önekinden
   * sonrası). Bir sayfa yeniden adlandırıldığında eski bağlantı yer
   * imlerinde, ekran görüntülerinde ve sohbet geçmişinde kalıyor;
   * burada bildirilirse kırılmıyor.
   */
  aliases?: Record<string, string>;
  /** Ana sayfa sayaçları. */
  stats: () => LanguageStat[];

  /**
   * Tekrar öğesini okunabilir hâle çevirir.
   * Katalogda bulunamayan anahtar için null — veri değişip bir öğe
   * kaldırılmışsa eski kayıt ekranda çöp olarak görünmesin.
   */
  describeItem: (key: ItemKey) => DescribedItem | null;

  /** Hedef dildeki metni seslendirir. */
  speak: (text: string, opts?: { slow?: boolean }) => Promise<void>;

  /**
   * Çevrimdışı ses paketine girecek metinler.
   * Dile özgü: İbranicede harf adları ve çekimler, Korece'de hece
   * blokları olacak.
   */
  audioTexts: () => Array<{ id: string; label: string; texts: string[] }>;
}

/* ------------------------------------------------------------------ *
 * Kayıt
 * ------------------------------------------------------------------ */

const registry = new Map<string, LanguageModule>();
let order: string[] = [];

/**
 * Bir dili kaydeder.
 *
 * Kayıt sırası menüdeki sırayı belirliyor. Aynı kimlikle ikinci kez
 * kayıt ÜZERİNE YAZMIYOR, hata veriyor: sessizce üzerine yazsaydı iki
 * dil aynı kodu kullandığında biri görünmez olur ve sebebi
 * anlaşılmazdı.
 */
export function registerLanguage(mod: LanguageModule): void {
  if (registry.has(mod.id)) {
    throw new Error(`Dil kimliği zaten kayıtlı: ${mod.id}`);
  }
  registry.set(mod.id, mod);
  order.push(mod.id);
}

/** Yalnızca testler için — kayıt defterini boşaltır. */
export function resetLanguages(): void {
  registry.clear();
  order = [];
}

export const languages = (): LanguageModule[] =>
  order.map((id) => registry.get(id)!).filter(Boolean);

export const languageById = (id: string): LanguageModule | undefined => registry.get(id);

export const hasLanguage = (id: string): boolean => registry.has(id);

/** İlk kayıtlı dil — hiçbir seçim yapılmamışsa açılan. */
export const defaultLanguage = (): LanguageModule | undefined => languages()[0];

/* ------------------------------------------------------------------ *
 * Etkin dil tercihi
 * ------------------------------------------------------------------ */

const ACTIVE_KEY = 'shoresh.language';

/**
 * Son kullanılan dil.
 *
 * Adres çubuğunda dil zaten var (`/he/...`), ama kök adrese (`/`)
 * girildiğinde hangi dile gidileceğini bu belirliyor — öğrenci her
 * açılışta dil seçmek zorunda kalmasın.
 */
export function readActiveLanguage(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

export function writeActiveLanguage(id: string): void {
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch {
    /* yazamadıysak varsayılan dile düşer, uygulama çalışmaya devam eder */
  }
}

/**
 * Tekrar anahtarına dil öneki ekler.
 *
 * NEDEN GEREKLİ: Anahtarlar `verb:כתב:paal:present` biçimindeydi ve dil
 * bilgisi taşımıyordu. Korece eklendiğinde `word:사과:noun` ile İbranice
 * bir kelime aynı ada düşebilir ve iki dilin ilerlemesi birbirine
 * karışırdı. Önek bunu kökten engelliyor.
 */
export const scopedKey = (languageId: string, key: ItemKey): ItemKey =>
  key.startsWith(`${languageId}:`) ? key : `${languageId}:${key}`;

/** Önekli anahtardan dili ve asıl anahtarı ayırır. */
export function unscopeKey(key: ItemKey): { languageId: string | null; key: ItemKey } {
  const i = key.indexOf(':');
  if (i === -1) return { languageId: null, key };
  const head = key.slice(0, i);
  return hasLanguage(head) ? { languageId: head, key: key.slice(i + 1) } : { languageId: null, key };
}
