import {
  BookOpen,
  Gamepad2,
  Presentation,
  GraduationCap,
  Home,
  Languages,
  Quote,
  Type,
  BookA,
  Volume2,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { CEFR } from '@/types/hebrew';

export type NavItem = {
  to: string;
  label: string;
  hint: string;
  icon?: LucideIcon;
  /** Seviye sekmelerinde rozet olarak gösterilen kısa etiket. */
  badge?: string;
  /**
   * Bu girişin kendi rengi — CSS değişkeni adı.
   *
   * NEDEN: Dört seviye sekmesi aynı renkteyken menü tek bir blok gibi
   * görünüyordu ve göz hangi seviyede olduğunu ayırt etmiyordu. Renk
   * sabit bir kod değil, PALETTEN gelen bir değişken; palet değişince
   * seviye renkleri de değişir, uyum bozulmaz.
   */
  tint?: string;
  end?: boolean;
};

export type NavGroup = {
  id: string;
  title: string | null;
  items: NavItem[];
};

/**
 * Seviye sekmeleri — sol kenar çubuğunun omurgası.
 *
 * NEDEN SEVİYE ÖNCE GELİYOR: Sıfırdan başlayan biri için "hangi fiile
 * bakayım" sorusunun cevabı fiilin kendisinde değil, seviyesinde. Menü
 * konuya göre (fiiller / kelimeler / kalıplar) kurulsaydı öğrenci her
 * girişte 350 fiilin içinden kendi düzeyini ayıklamak zorunda kalırdı.
 */
export const LEVELS: Array<{ level: CEFR; title: string; blurb: string; tint: string }> = [
  { level: 'A1', title: 'A1 — Başlangıç', blurb: 'İlk cümleler, temel fiiller', tint: 'var(--color-brand-400)' },
  { level: 'A2', title: 'A2 — Temel', blurb: 'Günlük hayatı anlatma', tint: 'var(--color-accent-400)' },
  { level: 'B1', title: 'B1 — Orta', blurb: 'Fikir yürütme, neden-sonuç', tint: 'var(--accent-fem)' },
  { level: 'B2', title: 'B2 — İleri', blurb: 'Tartışma ve resmî dil', tint: 'var(--accent-text-alt)' },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'genel',
    title: null,
    items: [{ to: '/', label: 'Ana Sayfa', hint: 'Genel bakış', icon: Home, end: true }],
  },
  {
    id: 'seviye',
    title: 'Seviyeler',
    items: LEVELS.map((l) => ({
      to: `/seviye/${l.level.toLowerCase()}`,
      label: l.title,
      hint: l.blurb,
      badge: l.level,
      tint: l.tint,
    })),
  },
  {
    id: 'temeller',
    title: 'Temeller',
    items: [
      { to: '/alefbet', label: 'Alef-Bet', hint: '22 harf + 5 sofit', icon: Type },
      { to: '/okuma', label: 'Harekeler', hint: 'Ünlüler ve okuma', icon: BookOpen },
    ],
  },
  {
    id: 'fiil',
    title: 'Fiil Motoru',
    items: [
      { to: '/verb', label: 'VERB Hebrew', hint: 'Kök + binyan + çekim', icon: Languages },
      { to: '/binyanim', label: 'Binyanlar', hint: '7 kalıbın haritası', icon: GraduationCap },
      { to: '/kaliplar', label: 'Kalıplar', hint: 'Hazır ifadeler', icon: Quote },
      { to: '/kelimeler', label: 'Kelimeler', hint: 'İsim, sıfat, zarf', icon: BookA },
    ],
  },
  {
    id: 'pratik',
    title: 'Pratik',
    items: [
      {
        to: '/ogretmen',
        label: 'Öğretmen Modu',
        hint: 'Kural, örnek, alıştırma',
        icon: Presentation,
      },
      { to: '/oyunlar', label: 'Oyunlar', hint: 'Alıştırma oyunları', icon: Gamepad2 },
      { to: '/ses', label: 'Ses', hint: 'Seslendirme ve tanılama', icon: Volume2 },
      { to: '/ilerleme', label: 'İlerleme', hint: 'Ne biliyorsun, ne tekrar', icon: TrendingUp },
    ],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
