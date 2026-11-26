import { describe, expect, it } from "vitest";

import {
  AdministrationNavigation,
  DatabasesNavigation,
  HelpNavigation,
} from "@/app/navigation/navigation.ts";
import { UserProperties } from "@/types/user.ts";
import { getNavigationForUser, getNavigationSection, getUserInitials } from "./utils.ts";

const baseUser: UserProperties = {
  id: 1,
  username: "jdoe",
  firstName: "John",
  lastName: "Doe",
  mail: "john@example.test",
  employeeType: "Student",
};

describe("AppLayout utilities", () => {
  it("returns no permission-filtered navigation before a user is loaded", () => {
    expect(getNavigationForUser(undefined)).toEqual([]);
  });

  it("filters navigation by required permission", () => {
    const studentNavigation = getNavigationForUser(baseUser);
    const staffNavigation = getNavigationForUser({ ...baseUser, employeeType: "Staff" });

    expect(studentNavigation).not.toContain(AdministrationNavigation);
    expect(staffNavigation).toContain(AdministrationNavigation);
  });

  it("splits navigation by section", () => {
    const items = [DatabasesNavigation, HelpNavigation, AdministrationNavigation];
    expect(getNavigationSection(items, "primary")).toEqual([DatabasesNavigation]);
    expect(getNavigationSection(items, "secondary")).toEqual([
      HelpNavigation,
      AdministrationNavigation,
    ]);
  });

  it("builds user initials with a fallback", () => {
    expect(getUserInitials(baseUser)).toBe("JD");
    expect(getUserInitials(undefined)).toBe(":(");
    expect(getUserInitials({ ...baseUser, firstName: "" })).toBe(":(");
  });
});
