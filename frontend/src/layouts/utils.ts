import { Navigation, navigation } from "../navigation/navigation.ts";
import { UserProperties } from "../types/user.ts";

export function getNavigationForUser(user: UserProperties | undefined): Navigation[] {
  if (!user) {
    return [];
  }

  return navigation.filter((item) => {
    if (item.requiredPermission === undefined) {
      return true;
    }

    return item.requiredPermission.includes(user.employeeType);
  });
}

export function getNavigationSection(
  items: Navigation[],
  section: Navigation["section"],
): Navigation[] {
  return items.filter((item) => item.section === section);
}

export function getUserInitials(user: UserProperties | undefined): string {
  if (user && user.firstName.length > 0 && user.lastName.length > 0) {
    return user.firstName[0] + user.lastName[0];
  }

  return ":(";
}
