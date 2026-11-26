import { describe, expect, it } from "vitest";

import { formatExpiry, isExpiringSoon } from "./databaseListFormat";

describe("isExpiringSoon", () => {
  const now = new Date(2027, 0, 1, 12);

  it("is false for databases that never expire", () => {
    expect(isExpiringSoon(null, now)).toBe(false);
  });

  it("is true 30 days or less before expiry", () => {
    expect(isExpiringSoon(new Date(2027, 0, 31), now)).toBe(true);
    expect(isExpiringSoon(new Date(2026, 11, 31), now)).toBe(true);
  });

  it("is false more than 30 days before expiry", () => {
    expect(isExpiringSoon(new Date(2027, 1, 1), now)).toBe(false);
  });
});

describe("formatExpiry", () => {
  const now = new Date(2027, 0, 1, 12);

  it("says how far away the expiry is", () => {
    expect(formatExpiry(new Date(2027, 6, 1, 12), now)).toBe("in 6 months");
    expect(formatExpiry(new Date(2027, 0, 13, 12), now)).toBe("in 12 days");
  });

  it("says how long ago a database expired", () => {
    expect(formatExpiry(new Date(2026, 11, 29, 12), now)).toBe("3 days ago");
  });
});
