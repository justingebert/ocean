import { describe, expect, it } from "vitest";

import { formatDate } from "./format";

describe("formatDate", () => {
  it("formats as day, short month and year", () => {
    expect(formatDate(new Date(2027, 4, 6))).toBe("6 May 2027");
  });
});
