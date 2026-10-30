"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokenize = exports.formatSql = void 0;
const node_fs_1 = require("node:fs");
const formatter_1 = require("./formatter");
var formatter_2 = require("./formatter");
Object.defineProperty(exports, "formatSql", { enumerable: true, get: function () { return formatter_2.formatSql; } });
var tokenizer_1 = require("./tokenizer");
Object.defineProperty(exports, "tokenize", { enumerable: true, get: function () { return tokenizer_1.tokenize; } });
if (require.main === module) {
    const input = process.argv[2];
    const sql = input ? (0, node_fs_1.readFileSync)(input, 'utf8') : (0, node_fs_1.readFileSync)(0, 'utf8');
    process.stdout.write((0, formatter_1.formatSql)(sql) + '\n');
}
