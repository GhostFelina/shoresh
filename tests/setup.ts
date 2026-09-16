import '@testing-library/jest-dom/vitest';
import 'fake-indexeddb/auto';

/*
 * Dilleri kaydet.
 *
 * Testler sayfaları doğrudan çiziyor, `App` bileşeninden geçmiyor —
 * kayıt orada yapıldığı için test ortamında hiç çalışmıyordu ve on
 * sayfa testi birden "Hiç dil kayıtlı değil" ile düştü.
 *
 * Kayıt burada yapılınca her test gerçek dil modülüyle çalışıyor;
 * sahte bir modül kurmak, testin doğruladığı şeyi taklit etmek olurdu.
 */
import { setupLanguages } from '@/core/languages';

setupLanguages();
