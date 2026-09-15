import {
  BookOpen,
  Gamepad2,
  GraduationCap,
  Home,
  Languages,
  Quote,
  Type,
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
export const LEVELS: Array<{ level: CEFR; title: string; blurb: string }> = [
  { level: 'A1', title: 'A1 — Başlangıç', blurb: 'İlk cümleler, temel fiiller' },
  { level: 'A2', title: 'A2 — Temel', blurb: 'Günlük hayatı anlatma' },
  { level: 'B1', title: 'B1 — Orta', blurb: 'Fikir yürütme, neden-sonuç' },
  { level: 'B2', title: 'B2 — İleri', blurb: 'Tartışma ve resmî dil' },
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
    ],
  },
  {
    id: 'pratik',
    title: 'Pratik',
    items: [{ to: '/oyunlar', label: 'Oyunlar', hint: '6 alıştırma oyunu', icon: Gamepad2 }],
  },
];

export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
