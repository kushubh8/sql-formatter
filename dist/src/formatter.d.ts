import { FormatOptions } from './types';
/** Formats common SQL constructs while preserving literals, comments and identifiers. */
export declare function formatSql(sql: string, options?: FormatOptions): string;
