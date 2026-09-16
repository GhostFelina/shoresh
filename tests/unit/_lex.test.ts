import { describe, it } from 'vitest';
import { LEXICON_STATS, LEXICON_ISSUES } from '@/data/lexicon';
describe('l',()=>{it('l',()=>{
  console.log('KELIME:',LEXICON_STATS.total,'| KONU:',LEXICON_STATS.topics,'| E:',LEXICON_STATS.masculine,'D:',LEXICON_STATS.feminine);
  console.log('TUR:',JSON.stringify(LEXICON_STATS.byClass));
  console.log('SEVIYE:',JSON.stringify(LEXICON_STATS.byLevel));
  for (const i of LEXICON_ISSUES) console.log('RED:',i.line,'||',i.reason);
});});
