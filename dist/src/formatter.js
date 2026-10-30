"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSql = void 0;
const tokenizer_1 = require("./tokenizer");
const KEYWORDS = new Set([
    'SELECT', 'DISTINCT', 'ALL', 'FROM', 'WHERE', 'GROUP', 'BY', 'HAVING',
    'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET', 'FETCH', 'FIRST', 'NEXT', 'ROWS',
    'ONLY', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE', 'RETURNING',
    'CREATE', 'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'DATABASE', 'AS',
    'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'LIKE', 'ILIKE', 'BETWEEN', 'EXISTS',
    'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ON', 'JOIN', 'INNER', 'LEFT', 'RIGHT',
    'FULL', 'OUTER', 'CROSS', 'NATURAL', 'UNION', 'INTERSECT', 'EXCEPT', 'WITH',
    'RECURSIVE', 'OVER', 'PARTITION', 'WINDOW', 'UNBOUNDED', 'PRECEDING', 'FOLLOWING',
    'CURRENT', 'ROW', 'NULLS', 'FIRST', 'LAST', 'CONFLICT', 'DO', 'NOTHING',
    'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'DEFAULT',
    'CONSTRAINT', 'CASCADE', 'BEGIN', 'COMMIT', 'ROLLBACK', 'TRANSACTION',
]);
const MAJOR = new Set(['SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'INSERT', 'UPDATE', 'DELETE', 'VALUES', 'SET', 'RETURNING', 'UNION', 'INTERSECT', 'EXCEPT']);
const JOIN_WORDS = new Set(['JOIN', 'INNER', 'LEFT', 'RIGHT', 'FULL', 'CROSS', 'NATURAL']);
const CLAUSE_CONTINUATIONS = new Set(['BY']);
function isWord(token, value) {
    return token?.type === 'word' && token.value.toUpperCase() === value;
}
/** Formats common SQL constructs while preserving literals, comments and identifiers. */
function formatSql(sql, options = {}) {
    const indentSize = Math.max(0, Math.min(8, Math.floor(options.indent ?? 2)));
    const uppercase = options.uppercaseKeywords ?? true;
    const tokens = (0, tokenizer_1.tokenize)(sql);
    if (tokens.length === 0)
        return '';
    let output = '';
    let depth = 0;
    let lineStart = true;
    let previous;
    let previousWord = '';
    let pendingSpace = false;
    const indent = () => ' '.repeat(depth * indentSize);
    const trimRight = () => { output = output.replace(/[ \t]+$/g, ''); };
    const newline = () => {
        trimRight();
        if (output.length > 0 && !output.endsWith('\n'))
            output += '\n';
        lineStart = true;
        pendingSpace = false;
    };
    const write = (value) => {
        if (lineStart) {
            output += indent();
            lineStart = false;
        }
        else if (pendingSpace && output.length && !output.endsWith('\n') && !output.endsWith(' '))
            output += ' ';
        output += value;
        pendingSpace = false;
    };
    const writeCommaSeparatedToken = (value) => {
        write(value);
    };
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        const rawUpper = token.type === 'word' ? token.value.toUpperCase() : '';
        const next = tokens[i + 1];
        const nextUpper = next?.type === 'word' ? next.value.toUpperCase() : '';
        const prevUpper = previous?.type === 'word' ? previous.value.toUpperCase() : '';
        if (token.type === 'comment') {
            if (!lineStart)
                newline();
            write(token.value);
            newline();
            previous = token;
            previousWord = '';
            continue;
        }
        // Treat GROUP BY / ORDER BY as one clause and keep BY on the same line.
        if (token.type === 'word' && CLAUSE_CONTINUATIONS.has(rawUpper) && ['GROUP', 'ORDER', 'PARTITION'].includes(prevUpper)) {
            write(uppercase ? rawUpper : token.value);
            pendingSpace = true;
            depth++;
            previous = token;
            previousWord = rawUpper;
            continue;
        }
        if (token.type === 'word' && MAJOR.has(rawUpper)) {
            if (['UNION', 'INTERSECT', 'EXCEPT'].includes(rawUpper)) {
                depth = Math.max(0, depth - 1);
                newline();
                write(uppercase ? rawUpper : token.value);
                newline();
                depth++;
            }
            else {
                if (['FROM', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'OFFSET', 'RETURNING', 'VALUES'].includes(rawUpper)) {
                    depth = Math.max(0, depth - 1);
                }
                newline();
                write(uppercase ? rawUpper : token.value);
                if (['SELECT', 'WHERE', 'HAVING', 'SET', 'VALUES'].includes(rawUpper)) {
                    newline();
                    depth++;
                }
                else {
                    pendingSpace = true;
                }
            }
            previous = token;
            previousWord = rawUpper;
            continue;
        }
        if (token.type === 'word' && JOIN_WORDS.has(rawUpper)) {
            if (rawUpper === 'JOIN' && ['LEFT', 'RIGHT', 'FULL', 'INNER', 'CROSS', 'NATURAL'].includes(prevUpper)) {
                write(uppercase ? rawUpper : token.value);
            }
            else {
                newline();
                write(uppercase ? rawUpper : token.value);
            }
            pendingSpace = true;
            previous = token;
            previousWord = rawUpper;
            continue;
        }
        if (token.type === 'punctuation') {
            if (token.value === '(') {
                // Function calls stay compact; subqueries start on a new indented line.
                const isSubquery = isWord(next, 'SELECT') || isWord(next, 'WITH');
                if (isSubquery) {
                    pendingSpace = true;
                    write('(');
                    depth++;
                    newline();
                }
                else {
                    if (previous && (previous.type === 'word' || previous.type === 'quotedIdentifier' || previous.value === ')'))
                        pendingSpace = false;
                    write('(');
                }
            }
            else if (token.value === ')') {
                if (depth > 0 && lineStart)
                    depth--;
                else if (depth > 0 && output.endsWith('\n'))
                    depth--;
                write(')');
            }
            else if (token.value === ',') {
                trimRight();
                output += ',';
                newline();
            }
            else if (token.value === ';') {
                trimRight();
                output += ';';
                newline();
            }
            else if (token.value === '.') {
                trimRight();
                output += '.';
            }
            previous = token;
            previousWord = '';
            continue;
        }
        if (token.type === 'operator') {
            pendingSpace = true;
            write(token.value);
            pendingSpace = true;
            previous = token;
            previousWord = '';
            continue;
        }
        let value = token.value;
        if (token.type === 'word' && uppercase && KEYWORDS.has(rawUpper))
            value = rawUpper;
        // AND / OR are easier to scan as separate predicates.
        if (token.type === 'word' && ['AND', 'OR'].includes(rawUpper)) {
            newline();
            write(value);
            pendingSpace = true;
        }
        else {
            if (previous?.value === '(' || previous?.value === '.')
                pendingSpace = false;
            else if (previous && previous.value !== ',')
                pendingSpace = true;
            write(value);
        }
        previous = token;
        previousWord = token.type === 'word' ? rawUpper : '';
    }
    trimRight();
    return output.trim();
}
exports.formatSql = formatSql;
