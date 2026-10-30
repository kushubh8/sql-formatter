declare module 'node:fs' {
  export function readFileSync(path: string | number, encoding?: string): string;
}
declare module 'node:test' {
  interface TestContext {}
  type TestFn = (name: string, fn: (context: TestContext) => void | Promise<void>) => void;
  const test: TestFn;
  export default test;
}
declare module 'node:assert/strict' {
  const assert: {
    equal(actual: unknown, expected: unknown, message?: string): void;
    deepEqual(actual: unknown, expected: unknown, message?: string): void;
    match(actual: string, regexp: RegExp, message?: string): void;
  };
  export default assert;
}
declare const require: { main: unknown };
declare const module: unknown;
declare const process: {
  argv: string[];
  stdin: number;
  stdout: { write(value: string): void };
};
