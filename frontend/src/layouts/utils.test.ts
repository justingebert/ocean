import { describe, expect, it } from "vitest";

import { FAQNavigation, ReportingNavigation, SettingsNavigation } from "../constants/menu.ts";
import { UserProperties } from "../types/user.ts";
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

    expect(studentNavigation).not.toContain(ReportingNavigation);
    expect(staffNavigation).toContain(ReportingNavigation);
  });

  it("splits navigation by section", () => {
    expect(getNavigationSection([SettingsNavigation, FAQNavigation], "secondary")).toEqual([
      SettingsNavigation,
      FAQNavigation,
    ]);
    expect(getNavigationSection([SettingsNavigation, FAQNavigation], "primary")).toEqual([]);
  });

  it("builds user initials with a fallback", () => {
    expect(getUserInitials(baseUser)).toBe("JD");
    expect(getUserInitials(undefined)).toBe(":(");
    expect(getUserInitials({ ...baseUser, firstName: "" })).toBe(":(");
  });
});
