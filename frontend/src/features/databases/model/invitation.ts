export interface InvitationProperties {
  id: number;
  instanceId: number;
  userId: number;
  createdAt: Date;
}

export type UpstreamCreateInvitationProperties = Pick<
  InvitationProperties,
  "instanceId" | "userId"
>;

export type InvitedUserProperties = Pick<
  UserProperties,
  "id" | "username" | "firstName" | "lastName"
> &
  Pick<InvitationProperties, "createdAt"> & {
    invitationId: number;
  };

export class Invitation {
  public static getUserIds = (invitations: InvitationProperties[] | undefined): number[] => {
    if (invitations === undefined) {
      return [];
    } else {
      return invitations.map((_) => _.userId);
    }
  };

  public static getInvitedUsers = (
    users: UserProperties[],
    invitations: InvitationProperties[],
  ): InvitedUserProperties[] => {
    return invitations.flatMap((invitation) => {
      const user = users.find((candidate) => candidate.id === invitation.userId);
      return user
        ? [
            {
              id: user.id,
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              createdAt: invitation.createdAt,
              invitationId: invitation.id,
            },
          ]
        : [];
    });
  };
}
import type { UserProperties } from "@/types/user";
