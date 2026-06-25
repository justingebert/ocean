import { InvitationProperties, UpstreamCreateInvitationProperties } from "../types/invitation";
import { axiosInstance } from "./client";

export class InvitationClient {
  public static getInvitationsForDatabase = async (
    databaseId: number,
  ): Promise<InvitationProperties[]> => {
    const { data } = await axiosInstance.get<InvitationProperties[]>(
      `databases/${databaseId.toString()}/invitations`,
    );
    return data;
  };

  public static createInvitationForDatabase = async (
    invitation: UpstreamCreateInvitationProperties,
  ): Promise<InvitationProperties> => {
    const { data } = await axiosInstance.post<InvitationProperties>("/invitations", invitation);
    return data;
  };

  public static deleteInvitationForDatabase = async (id: number) => {
    const { data } = await axiosInstance.delete<unknown>(`/invitations/${id.toString()}`);
    return data;
  };
}
