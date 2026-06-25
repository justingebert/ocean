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

export class Invitation {
  public static getUserIds = (invitations: InvitationProperties[] | undefined): number[] => {
    if (invitations === undefined) {
      return [];
    } else {
      return invitations.map((_) => _.userId);
    }
  };
}
