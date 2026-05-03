/**
 * Defines the properties of an invitation.
 */
export interface InvitationProperties {
    id: number;
    instanceId: number;
    userId: number;
    createdAt: Date;
}
/**
 * Defines the required properties for creating a new invitation.
 */
export type UpstreamCreateInvitationProperties = Pick<InvitationProperties,"instanceId" | "userId">;
/**
 * Utility class for handling invitation-related operations.
 */
export class Invitation {
    /**
     * Extracts user IDs from a list of invitations.
     * @param invitations - An array of invitation objects (or `undefined`).
     * @returns An array of user IDs extracted from the invitations.
     */
    public static getUserIds = (invitations: InvitationProperties[] | undefined): number[] => {
        if (invitations === undefined) {
            return []
        } else {
            return invitations.map(_ => _.userId)
        }
    }
}