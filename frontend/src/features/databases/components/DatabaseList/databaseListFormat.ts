import { differenceInCalendarDays } from "date-fns";

export const getDatabaseEngineTitle = (value: string): string => {
  if (value === "P") {
    return "PostgreSQL";
  } else if (value === "M") {
    return "MongoDB";
  } else {
    return "Unknown";
  }
};

/** Databases expiring within this many days are highlighted. */
export const EXPIRY_WARNING_DAYS = 30;

export const isExpiringSoon = (expiresAt: Date | null, now: Date = new Date()): boolean => {
  return expiresAt !== null && differenceInCalendarDays(expiresAt, now) <= EXPIRY_WARNING_DAYS;
};
