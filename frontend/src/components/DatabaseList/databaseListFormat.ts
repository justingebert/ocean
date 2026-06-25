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

export const getDatabaseCreatedAt = (value: Date): string => {
  return formatDistance(value, new Date(), { addSuffix: true });
};
