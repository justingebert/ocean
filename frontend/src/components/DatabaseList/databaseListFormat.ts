import { formatDistance } from "date-fns";

export const getDatabaseEngineTitle = (value: string): string => {
  if (value === "P") {
    return "PostgreSQL";
  } else if (value === "M") {
    return "MongoDB";
  } else {
    return "Unknown";
  }
};

/**
 * Formats the database creation date into a human-readable format.
 *
 * @param value - The date the database was created.
 * @returns A formatted string representing the relative time (e.g., "3 days ago").
 */
export const getDatabaseCreatedAt = (value: Date): string => {
  return formatDistance(value, new Date(), { addSuffix: true });
};
