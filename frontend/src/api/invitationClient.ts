import { InvitationProperties, UpstreamCreateInvitationProperties } from "../types/invitation";
import { axiosInstance } from "./client";

export class InvitationClient {
  /**
   * Fetches all invitations associated with a specific database.
   * @param databaseId - The unique identifier of the database.
   * @returns A promise that resolves to an array of invitation properties.
   */
  public static getInvitationsForDatabase = async (
    databaseId: number,
  ): Promise<InvitationProperties[]> => {
    const { data } = await axiosInstance.get<InvitationProperties[]>(
      `databases/${databaseId.toString()}/invitations`,
    );
    return data;
  };

  /**
   * Creates an invitation for a database.
   * @param invitation - The properties required to create an invitation.
   * @returns A promise that resolves to the created invitation properties.
   */
  public static createInvitationForDatabase = async (
    invitation: UpstreamCreateInvitationProperties,
  ): Promise<InvitationProperties> => {
    const { data } = await axiosInstance.post<InvitationProperties>("/invitations", invitation);
    return data;
  };

  /**
   * Deletes an invitation by its unique ID.
   * @param id - The unique identifier of the invitation to delete.
   * @returns A promise that resolves to a deletion response.
   */
  public static deleteInvitationForDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(`/invitations/${id.toString()}`);
    return data;
  };
}
