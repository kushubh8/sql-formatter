"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const formatter_1 = require("../src/formatter");
(0, node_test_1.default)('formats a compact SELECT query', () => {
    strict_1.default.equal((0, formatter_1.formatSql)('select id,name from users where age>18 and status=\'active\';'), `SELECT
  id,
  name
FROM users
WHERE
  age > 18
  AND status = 'active';`);
});
(0, node_test_1.default)('formats joins and order by', () => {
    const result = (0, formatter_1.formatSql)('select u.id from users u left join orders o on u.id=o.user_id order by u.id desc');
    strict_1.default.match(result, /LEFT JOIN/);
    strict_1.default.match(result, /ORDER BY/);
});
(0, node_test_1.default)('preserves string contents and comments', () => {
    const result = (0, formatter_1.formatSql)("select 'a  b' as value -- keep me\nfrom users");
    strict_1.default.match(result, /'a  b'/);
    strict_1.default.match(result, /-- keep me/);
});
(0, node_test_1.default)('supports indentation option and empty input', () => {
    strict_1.default.equal((0, formatter_1.formatSql)('select a,b from t', { indent: 4 }).split('\n')[1], '    a,');
    strict_1.default.equal((0, formatter_1.formatSql)('select a,b from t', { indent: 4 }).split('\n')[2], '    b');
    strict_1.default.equal((0, formatter_1.formatSql)('   '), '');
});
(0, node_test_1.default)('formats a nested SELECT without changing literal content', () => {
    const result = (0, formatter_1.formatSql)('select id from users where id in (select user_id from orders where total>10)');
    strict_1.default.match(result, /IN \(\n\s+SELECT/);
    strict_1.default.match(result, /total > 10/);
});
