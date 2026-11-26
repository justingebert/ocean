import { describe, expect, it } from "vitest";

import { getGreeting } from "./greeting";

// January 2027: the 1st is a Friday, the 3rd a Sunday, the 6th a Wednesday.
const at = (day: number, hour = 9) => new Date(2027, 0, day, hour);

const allGreetings = (now: Date) =>
  new Set([0, 0.2, 0.4, 0.6, 0.8, 0.99].map((roll) => getGreeting("Sabine", roll, now)));

describe("getGreeting", () => {
  it("greets by part of the day", () => {
    expect(getGreeting("Sabine", 0, at(6, 8))).toBe("Good morning, Sabine");
    expect(getGreeting("Sabine", 0, at(6, 12))).toBe("Good afternoon, Sabine");
    expect(getGreeting("Sabine", 0, at(6, 18))).toBe("Good evening, Sabine");
  });

  it("picks from the everyday greetings on other days", () => {
    expect(allGreetings(at(6))).toEqual(
      new Set(["Good morning, Sabine", "Back at it, Sabine", "Sabine returns!"]),
    );
  });

  it("adds the Friday and Sunday greetings only on their day", () => {
    expect(allGreetings(at(1))).toContain("Happy Friday, Sabine");
    expect(allGreetings(at(1))).not.toContain("Sunday session, Sabine?");
    expect(allGreetings(at(3))).toContain("Sunday session, Sabine?");
    expect(allGreetings(at(3))).not.toContain("Happy Friday, Sabine");
  });

  it("falls back to the part of the day without a name", () => {
    expect(getGreeting(undefined, 0.9, at(1, 8))).toBe("Good morning");
    expect(getGreeting("", 0.9, at(6, 8))).toBe("Good morning");
  });
});
