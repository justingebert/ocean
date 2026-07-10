import { EngineType, type EngineTypeValues } from "../types/engine";

export type DatabaseDetailTabValue = "overview" | "users" | "invitations";

export interface DatabaseDetailTab {
  value: DatabaseDetailTabValue;
  name: string;
}

const databaseDetailTabs: ReadonlyArray<DatabaseDetailTab> = [
  { value: "overview", name: "Overview" },
  { value: "users", name: "Users" },
  { value: "invitations", name: "Invitations" },
];

export const getDetailViewTabsFor = (
  engineType: EngineTypeValues | undefined,
): ReadonlyArray<DatabaseDetailTab> => {
  if (engineType === EngineType.PostgreSQL) {
    return databaseDetailTabs;
  } else if (engineType === EngineType.MongoDB) {
    return databaseDetailTabs.filter((tab) => tab.value !== "invitations");
  } else if (engineType === undefined) {
    return [];
  } else {
    const assertNever = (_: never): ReadonlyArray<DatabaseDetailTab> => [];
    return assertNever(engineType);
  }
};
