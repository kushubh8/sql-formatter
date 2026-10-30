import { Token } from './types';
/**
 * Converts SQL text into loss-minimizing lexical tokens. It deliberately does
 * not attempt to validate SQL grammar or dialect-specific semantics.
 */
export declare function tokenize(sql: string): Token[];
