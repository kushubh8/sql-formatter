# SQL Formatter

A small, dependency-free SQL formatter implemented in TypeScript for the SQL Formatter technical exercise.

## Requirements

- Node.js 18 or newer
- TypeScript compiler (`tsc`) available on your PATH to build the TypeScript source

The implementation itself uses only Node.js built-ins. There are no runtime or test-framework package dependencies. The tests use Node's built-in `node:test` and `node:assert` modules.

## Run

```bash
# Compile
npm run build

# Run tests
npm test

# Format SQL from stdin
printf "select id,name from users where age>18;" | node dist/src/index.js

# Format a SQL file
node dist/src/index.js examples/sample.sql
```

The CLI writes formatted SQL to stdout. It accepts a file path as its first argument; without one, it reads stdin.

## API

```ts
import { formatSql, tokenize } from './src';

const formatted = formatSql('select id,name from users where age>18');
const tokens = tokenize('select id from users');
```

`formatSql(sql, options?)` accepts:

- `indent`: spaces per indentation level (default `2`, clamped to `0..8`)
- `uppercaseKeywords`: uppercase recognized SQL keywords (default `true`)

## Design

The implementation has two deliberately separate stages:

1. **Tokenizer** (`src/tokenizer.ts`) scans the input once and produces typed tokens. It recognizes words, numbers, operators, punctuation, single-quoted strings, common quoted-identifier forms, and line/block comments. Whitespace is discarded because the formatter reconstructs it.
2. **Formatter** (`src/formatter.ts`) applies consistent spacing, clause breaks, comma-separated select-list layout, join breaks, predicate breaks, and basic indentation for nested subqueries.

The tokenizer is intentionally lexical rather than a full SQL parser. That keeps the implementation small, understandable, and useful within the two-hour constraint while avoiding destructive whitespace changes inside literals and comments.

## Scope and limitations

- Targets common SQL query shapes and is not a complete SQL grammar implementation.
- Does not validate SQL, resolve dialect semantics, or guarantee formatting for every vendor-specific construct.
- Quoted strings and identifiers are treated as opaque tokens; their contents are preserved.
- Parenthesis handling is intentionally lightweight. Complex expressions, deeply nested constructs, procedural SQL, dollar-quoted strings, and dialect-specific quoting may need additional lexer rules.
- Unterminated quoted strings/comments are preserved on a best-effort basis rather than rejected.

## Testing strategy

Tests cover lexical token classes, escaped quotes, comments, compact SELECT formatting, joins, boolean predicates, nested subqueries, options, and empty input. Run `npm test` to compile and execute the suite.

## Trade-offs and next steps

Given the timebox, correctness of token boundaries and preservation of quoted content take priority over implementing a complete parser. The next improvements would be:

1. Add dialect-aware lexing (PostgreSQL dollar quotes, MySQL escapes, vendor-specific identifiers).
2. Introduce a lightweight clause/context stack to format CTEs, CASE expressions, window functions, and nested joins more precisely.
3. Add golden-file tests and property tests for idempotence (`formatSql(formatSql(sql)) === formatSql(sql)`).
4. Add configurable keyword casing, line width, and compact/expanded function argument options.
5. Validate behavior against a curated SQL corpus and document supported dialects.

## Engineering note

This tool is a formatter, not a SQL parser or security boundary. It should not be used to validate, rewrite, or execute untrusted SQL.
