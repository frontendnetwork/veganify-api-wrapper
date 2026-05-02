import Veganify from "../lib";

describe("Veganify Instance Management", () => {
  beforeEach(() => {
    Veganify.resetInstance();
    jest.clearAllMocks();
  });

  afterEach(() => {
    Veganify.resetInstance();
  });

  it("should maintain singleton pattern", () => {
    const instance1 = Veganify.getInstance();
    const instance2 = Veganify.getInstance();
    expect(instance1).toBe(instance2);
  });

  it("should maintain configuration across instances", () => {
    const instance1 = Veganify.getInstance({ staging: true });
    const instance2 = Veganify.getInstance();
    expect(instance2).toBe(instance1);
  });

  it("should reset the singleton so the next call creates a fresh instance", () => {
    const instance1 = Veganify.getInstance({ staging: true });
    Veganify.resetInstance();
    const instance2 = Veganify.getInstance({ staging: false });
    expect(instance2).not.toBe(instance1);
  });

  it("should accept new config after reset", () => {
    Veganify.getInstance({ cacheTTL: 5000 });
    Veganify.resetInstance();
    // New instance should be created with a different config without throwing
    const freshInstance = Veganify.getInstance({ cacheTTL: 999 });
    expect(freshInstance).toBeDefined();
  });
});
