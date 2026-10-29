import { describe, expect, it } from "vitest";

import { defaultLoginFlower, LOGIN_FLOWER_IDS, loginFlowerOfTheDay } from "./login-flower";

describe("login flower", () => {
  it("every rotating flower exists in the catalog with artwork", () => {
    for (let i = 0; i < LOGIN_FLOWER_IDS.length; i++) {
      const entry = loginFlowerOfTheDay(new Date(2026, 0, 1 + i));
      expect(entry.artwork.src).toMatch(/^\/flowers\/art\/.+\.webp$/);
    }
  });

  it("stays the same all day and changes the next day", () => {
    const morning = loginFlowerOfTheDay(new Date(2026, 9, 29, 0, 5));
    const night = loginFlowerOfTheDay(new Date(2026, 9, 29, 23, 55));
    const tomorrow = loginFlowerOfTheDay(new Date(2026, 9, 30, 9, 0));
    expect(night.id).toBe(morning.id);
    expect(tomorrow.id).not.toBe(morning.id);
  });

  it("only ever picks from the hand-picked list", () => {
    const ids = new Set<string>(LOGIN_FLOWER_IDS);
    for (let d = 0; d < 400; d++) {
      expect(ids.has(loginFlowerOfTheDay(new Date(2026, 0, 1 + d)).id)).toBe(true);
    }
  });

  it("falls back to the hercai menekşe", () => {
    expect(defaultLoginFlower().name).toBe("Hercai menekşe");
  });
});
