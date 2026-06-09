import { ITab } from "../components/Navigation/Tabs/Tab";
import { EngineType, EngineTypeValues } from "../types/engine";

/**
 * Default tab configuration for the database detail view.
 */
const databaseDetailTabs: ITab[] = [
  { id: 1, name: "Overview" },
  { id: 2, name: "Users" },
  { id: 3, name: "Invitations" },
];
/**
 * Retrieves the appropriate detail view tabs based on the database engine type.
 * - **PostgreSQL**: Shows "Overview", "Users", and "Invitations".
 * - **MongoDB**: Shows "Overview" and "Users" (Excludes "Invitations").
 * - **Undefined engine**: Returns an empty array.
 *
 * @param engineType - The database engine type (`PostgreSQL` or `MongoDB`).
 * @returns An array of `ITab` objects specific to the given engine.
 */
export const getDetailViewTabsFor = (engineType: EngineTypeValues | undefined): ITab[] => {
  const postgresqlIds = [1, 2, 3]; // Tabs available for PostgreSQL
  const mongodbIds = [1, 2]; // Tabs available for MongoDB

  if (engineType === EngineType.PostgreSQL) {
    return databaseDetailTabs.filter((tab) => postgresqlIds.includes(tab.id));
  } else if (engineType === EngineType.MongoDB) {
    return databaseDetailTabs.filter((tab) => mongodbIds.includes(tab.id));
  } else if (engineType === undefined) {
    return [];
  } else {
    // Ensures type safety by enforcing exhaustive checks
    const assertNever = (_: never): ITab[] => [];
    return assertNever(engineType);
  }
};
/**
 * Tabs for the settings view.
 */
export const settingsViewTabs: ITab[] = [{ id: 1, name: "Profile" }];
