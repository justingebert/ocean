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
  public static getDisplayName = (user: UserProperties): string => {
    const abbreviation = user.firstName[0] || "?";
    return `${abbreviation}. ${user.lastName}`;
  };
}
