import { mock, type Mock } from "bun:test";

/**
 * A `bun:test` mock that is assignable to `globalThis.fetch`.
 *
 * bun-types extends the global `fetch` with a `preconnect` namespace member;
 * a bare `mock()` lacks it, so a no-op `preconnect` is attached to satisfy
 * the type. The mock is never typed with the real `Response`, so stubbed
 * payloads can stay plain object literals.
 */
export type FetchMock = Mock<(...args: any[]) => any> & typeof globalThis.fetch;

export const mockFetch = (): FetchMock =>
  Object.assign(mock(), { preconnect: () => {} });
