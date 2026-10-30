"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = __importDefault(require("node:test"));
const strict_1 = __importDefault(require("node:assert/strict"));
const tokenizer_1 = require("../src/tokenizer");
(0, node_test_1.default)('tokenizes words, numbers, operators and punctuation', () => {
    strict_1.default.deepEqual((0, tokenizer_1.tokenize)('select id from users where age>=18;').map(t => t.value), ['select', 'id', 'from', 'users', 'where', 'age', '>=', '18', ';']);
});
(0, node_test_1.default)('keeps quoted strings and escaped quotes intact', () => {
    const tokens = (0, tokenizer_1.tokenize)("select 'it''s fine', \"MixedCase\" from t");
    strict_1.default.equal(tokens[1].value, "'it''s fine'");
    strict_1.default.equal(tokens[3].value, '"MixedCase"');
});
(0, node_test_1.default)('recognizes line and block comments', () => {
    const tokens = (0, tokenizer_1.tokenize)('select 1 -- note\n/* block */ from t');
    strict_1.default.deepEqual(tokens.filter(t => t.type === 'comment').map(t => t.value), ['-- note', '/* block */']);
});
