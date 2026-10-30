import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenize } from '../src/tokenizer';

test('tokenizes words, numbers, operators and punctuation', () => {
  assert.deepEqual(tokenize('select id from users where age>=18;').map(t => t.value),
    ['select', 'id', 'from', 'users', 'where', 'age', '>=', '18', ';']);
});

test('keeps quoted strings and escaped quotes intact', () => {
  const tokens = tokenize("select 'it''s fine', \"MixedCase\" from t");
  assert.equal(tokens[1].value, "'it''s fine'");
  assert.equal(tokens[3].value, '"MixedCase"');
});

test('recognizes line and block comments', () => {
  const tokens = tokenize('select 1 -- note\n/* block */ from t');
  assert.deepEqual(tokens.filter(t => t.type === 'comment').map(t => t.value), ['-- note', '/* block */']);
});
