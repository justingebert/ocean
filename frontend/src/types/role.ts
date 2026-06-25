export interface RoleProperties {
  id: number;
  instanceId: number;
  name: string;
  password: string;
}

export type UpstreamCreateRoleProperties = Pick<RoleProperties, "instanceId"> & {
  roleName: string;
};
