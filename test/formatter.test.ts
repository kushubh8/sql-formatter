import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSql } from '../src/formatter';

test('formats a compact SELECT query', () => {
  assert.equal(formatSql('select id,name from users where age>18 and status=\'active\';'),
`SELECT
  id,
  name
FROM users
WHERE
  age > 18
  AND status = 'active';`);
});

test('formats joins and order by', () => {
  const result = formatSql('select u.id from users u left join orders o on u.id=o.user_id order by u.id desc');
  assert.match(result, /LEFT JOIN/);
  assert.match(result, /ORDER BY/);
});

test('preserves string contents and comments', () => {
  const result = formatSql("select 'a  b' as value -- keep me\nfrom users");
  assert.match(result, /'a  b'/);
  assert.match(result, /-- keep me/);
});

test('supports indentation option and empty input', () => {
  assert.equal(formatSql('select a,b from t', { indent: 4 }).split('\n')[1], '    a,');
  assert.equal(formatSql('select a,b from t', { indent: 4 }).split('\n')[2], '    b');
  assert.equal(formatSql('   '), '');
});

test('formats a nested SELECT without changing literal content', () => {
  const result = formatSql('select id from users where id in (select user_id from orders where total>10)');
  assert.match(result, /IN \(\n\s+SELECT/);
  assert.match(result, /total > 10/);
});
