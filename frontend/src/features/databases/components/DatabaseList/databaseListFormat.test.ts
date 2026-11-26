import { describe, expect, it } from "vitest";

import { formatExpiryDate, isExpiringSoon } from "./databaseListFormat";

describe("formatExpiryDate", () => {
  it("formats as DD.MM.YYYY", () => {
    expect(formatExpiryDate(new Date(2027, 4, 6))).toBe("06.05.2027");
  });
});

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
