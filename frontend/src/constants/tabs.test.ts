import { describe, expect, it } from "vitest";

import { EngineType } from "../types/engine";
import { getDetailViewTabsFor } from "./tabs";

describe("getDetailViewTabsFor", () => {
  it("returns all database detail tabs for PostgreSQL", () => {
    expect(getDetailViewTabsFor(EngineType.PostgreSQL).map((tab) => tab.value)).toEqual([
      "overview",
      "users",
      "invitations",
    ]);
  });

  it("omits invitations for MongoDB", () => {
    expect(getDetailViewTabsFor(EngineType.MongoDB).map((tab) => tab.value)).toEqual([
      "overview",
      "users",
    ]);
  });

  it("returns no tabs while the database is unavailable", () => {
    expect(getDetailViewTabsFor(undefined)).toEqual([]);
  });
});
