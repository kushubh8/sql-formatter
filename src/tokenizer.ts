import { Token, TokenType } from './types';

/**
 * Converts SQL text into loss-minimizing lexical tokens. It deliberately does
 * not attempt to validate SQL grammar or dialect-specific semantics.
 */
export function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (type: TokenType, start: number, end: number): void => {
    tokens.push({ type, value: sql.slice(start, end) });
  };

  while (i < sql.length) {
    const ch = sql[i];
    if (/\s/.test(ch)) { i++; continue; }

    // -- line comments
    if (ch === '-' && sql[i + 1] === '-') {
      const start = i;
      i += 2;
      while (i < sql.length && sql[i] !== '\n' && sql[i] !== '\r') i++;
      push('comment', start, i);
      continue;
    }

    // /* block comments */, including a best-effort scan of unterminated input
    if (ch === '/' && sql[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < sql.length && !(sql[i] === '*' && sql[i + 1] === '/')) i++;
      if (i < sql.length) i += 2;
      push('comment', start, i);
      continue;
    }

    // Single-quoted strings; doubled quotes are SQL escapes.
    if (ch === "'") {
      const start = i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
        if (sql[i] === "'") { i++; break; }
        i++;
      }
      push('string', start, i);
      continue;
    }

    // Quoted identifiers: "name", `name`, and [name].
    if (ch === '"' || ch === '`' || ch === '[') {
      const start = i;
      const close = ch === '[' ? ']' : ch;
      i++;
      while (i < sql.length) {
        if (sql[i] === close) {
          if (sql[i + 1] === close && close !== ']') { i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      push('quotedIdentifier', start, i);
      continue;
    }

    if (/[A-Za-z_#$]/.test(ch)) {
      const start = i++;
      while (i < sql.length && /[A-Za-z0-9_#$]/.test(sql[i])) i++;
      push('word', start, i);
      continue;
    }

    if (/\d/.test(ch) || (ch === '.' && /\d/.test(sql[i + 1] ?? ''))) {
      const start = i++;
      while (i < sql.length && /[\d.]/.test(sql[i])) i++;
      if (/[eE]/.test(sql[i] ?? '')) {
        i++;
        if (/[+-]/.test(sql[i] ?? '')) i++;
        while (i < sql.length && /\d/.test(sql[i])) i++;
      }
      push('number', start, i);
      continue;
    }

    const three = sql.slice(i, i + 3);
    const two = sql.slice(i, i + 2);
    if (['->>', '#>>', '!~~'].includes(three)) { push('operator', i, i + 3); i += 3; continue; }
    if (['<=', '>=', '<>', '!=', '||', '::', '->', '#>', '+=', '-=', '*=', '/=', '&&', '??'].includes(two)) {
      push('operator', i, i + 2); i += 2; continue;
    }
    if (',;().'.includes(ch)) { push('punctuation', i, i + 1); i++; continue; }
    if ('+-*/%=<>!~^|&'.includes(ch)) { push('operator', i, i + 1); i++; continue; }

    // Preserve unfamiliar characters rather than silently dropping input.
    push('punctuation', i, i + 1);
    i++;
  }

  return tokens;
}
