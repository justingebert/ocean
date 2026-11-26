export interface UserProperties {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  mail: string;
  employeeType: string;
}

//TODO refactor
export class User {
  public static getDisplayName = (user: Pick<UserProperties, "firstName" | "lastName">): string => {
    return `${user.firstName} ${user.lastName}`.trim();
  };
}
