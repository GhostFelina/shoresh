import { BookOpen, GraduationCap, Home, Languages, Type, type LucideIcon } from 'lucide-react';

export type NavItem = {
  to: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  end?: boolean;
};

/**
 * Gezinme sırası öğrenme sırasıdır: önce harfleri tanı, sonra harekeyle
 * oku, sonra fiil kalıplarına geç. Sıfırdan başlayan biri için menüyü
 * alfabetik ya da "önem sırasına" göre dizmek, okuyamadığı bir sayfayı
 * ilk sıraya koymak demektir.
 */
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Ana Sayfa', hint: 'Bugünkü ders', icon: Home, end: true },
  { to: '/alefbet', label: 'Alef-Bet', hint: '22 harf + 5 sofit', icon: Type },
  { to: '/okuma', label: 'Harekeler', hint: 'Ünlüler ve okuma', icon: BookOpen },
  { to: '/fiiller', label: 'Fiiller', hint: 'Kök + binyan çekimi', icon: Languages },
  { to: '/binyanim', label: 'Binyanlar', hint: '7 kalıp haritası', icon: GraduationCap },
];
