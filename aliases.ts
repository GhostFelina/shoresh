/**
 * Yol takma adları — TEK kaynak.
 *
 * NEDEN AYRI DOSYA: Takma adlar `vite.config.ts` ve `vitest.config.ts`
 * içinde AYRI AYRI yazılıydı. Dil modülü eklenip `@he` takma adı
 * geldiğinde yalnızca biri güncellendi ve on test dosyası birden
 * "Failed to resolve import" ile çöktü. İki listenin ayrı düşmesi
 * kaçınılmazdı; tek kaynak olunca imkânsız.
 *
 * `tsconfig.app.json` içindeki `paths` hâlâ ayrı duruyor — TypeScript
 * JSON istiyor ve oradan içe aktarma yapılamıyor. Birim testi ikisinin
 * eşleştiğini denetliyor (tests/unit/aliases.test.ts).
 */
import { fileURLToPath, URL } from 'node:url';

const at = (rel: string): string => fileURLToPath(new URL(rel, import.meta.url));

export const aliases: Record<string, string> = {
  '@': at('./src'),
  /*
   * Dil modülüne kısa yol. '@' ile ÇAKIŞMAZ: eşleşme yol sınırında
   * yapılıyor (importee === key ya da key + '/' ile başlamalı), yani
   * '@he/data/x' asla '@' anahtarına düşmüyor.
   */
  '@he': at('./src/languages/hebrew'),
};
