import { InvitationProperties } from "./invitation";

/**
 * Defines the properties of a user in the system.
 */
export interface UserProperties {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  mail: string;
  employeeType: string;
}
/**
 * Defines the properties of an invited user.
 * Combines user properties with invitation metadata.
 */
export type InvitedUserProperties = Pick<
  UserProperties,
  "id" | "username" | "firstName" | "lastName"
> &
  Pick<InvitationProperties, "createdAt"> & {
    invitationId: number;
  };
/**
 * Utility class for user-related operations.
 */
export class User {
  /**
   * Generates a display name for a user.
   * Format: "F. Lastname" (e.g., "J. Doe").
   * If the first name is missing, defaults to "?. Lastname".
   *
   * @param user - The user object.
   * @returns The formatted display name.
   */
  public static getDisplayName = (user: UserProperties): string => {
    const abbreviation = user.firstName[0] || "?";
    return `${abbreviation}. ${user.lastName}`;
  };
  /**
   * Retrieves a list of invited users by matching user IDs with invitations.
   *
   * @param users - Array of users in the system.
   * @param invitations - Array of invitations sent to users.
   * @returns An array of invited user properties.
   */
  public static getInvitedUsers = (
    users: UserProperties[],
    invitations: InvitationProperties[],
  ): InvitedUserProperties[] => {
    const result: InvitedUserProperties[] = [];
    for (const invitation of invitations) {
      const user = users.find((_) => _.id === invitation.userId);
      if (user) {
        const invitedUser: InvitedUserProperties = {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          id: user.id,
          createdAt: invitation.createdAt,
          invitationId: invitation.id,
        };
        result.push(invitedUser);
      }
    }
    return result;
  };
}
