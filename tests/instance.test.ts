import Veganify from "../lib";

describe("Veganify Instance Management", () => {
  let veganify: Veganify;

  beforeEach(() => {
    veganify = Veganify.getInstance({ staging: true });
    veganify.clearCache();
    jest.clearAllMocks();
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
});
