/**
 * Sözlük tabloları — tek toplama noktası.
 *
 * Konu dosyaları burada birleşir; `lexicon.ts` yalnızca bu diziyi bilir.
 * Yeni bir konu dosyası eklemek için tek satır yeter.
 */
import { CORE_TABLES } from './lexicon-core';
import { EXTRA_TABLES } from './lexicon-extra';
import { WIDE_TABLES } from './lexicon-wide';

export const LEXICON_TABLES = [...CORE_TABLES, ...EXTRA_TABLES, ...WIDE_TABLES];
