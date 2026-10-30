export type TokenType = 'word' | 'number' | 'string' | 'quotedIdentifier' | 'operator' | 'punctuation' | 'comment';
export interface Token {
    type: TokenType;
    value: string;
}
export interface FormatOptions {
    /** Number of spaces per indentation level. Defaults to 2. */
    indent?: number;
    /** Uppercase recognized SQL keywords. Defaults to true. */
    uppercaseKeywords?: boolean;
}
