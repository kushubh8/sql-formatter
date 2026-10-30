import { readFileSync } from 'node:fs';
import { formatSql } from './formatter';

export { formatSql } from './formatter';
export { tokenize } from './tokenizer';
export type { FormatOptions, Token, TokenType } from './types';

if (require.main === module) {
  const input = process.argv[2];
  const sql = input ? readFileSync(input, 'utf8') : readFileSync(0, 'utf8');
  process.stdout.write(formatSql(sql) + '\n');
}
