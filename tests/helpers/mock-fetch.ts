import { mock } from "bun:test";

/**
 * A `bun:test` mock that is assignable to `globalThis.fetch`.
 *
 * bun-types extends the global `fetch` with a `preconnect` namespace member;
 * a bare `mock()` lacks it, so a no-op `preconnect` is attached to satisfy
 * the type. The mock's call signature stays loose (the default `mock()`
 * generic), so stubbed payloads can be plain object literals instead of full
 * `Response` objects.
 */
export type FetchMock = ReturnType<typeof mock> & typeof globalThis.fetch;

export const mockFetch = (): FetchMock =>
  Object.assign(mock(), {
    preconnect: () => {
      // Intentionally not implemented: preconnecting is irrelevant to tests.
    },
  });
