/**
 * Defines the properties of a role in the system.
 */
export interface RoleProperties {
  id: number;
  instanceId: number;
  name: string;
  password: string;
}
/**
 * Defines the required properties for creating a new role.
 */
export type UpstreamCreateRoleProperties = Pick<
  RoleProperties,
  "instanceId"
> & { roleName: string };