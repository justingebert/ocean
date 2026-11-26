import { describe, expect, it } from "vitest";

import { getGreeting } from "./greeting";

describe("getGreeting", () => {
  it("greets by part of the day", () => {
    expect(getGreeting("Sabine", new Date(2027, 0, 1, 8))).toBe("Good morning, Sabine");
    expect(getGreeting("Sabine", new Date(2027, 0, 1, 12))).toBe("Good afternoon, Sabine");
    expect(getGreeting("Sabine", new Date(2027, 0, 1, 18))).toBe("Good evening, Sabine");
  });

  it("leaves out a missing name", () => {
    expect(getGreeting(undefined, new Date(2027, 0, 1, 8))).toBe("Good morning");
    expect(getGreeting("", new Date(2027, 0, 1, 8))).toBe("Good morning");
  });
});
