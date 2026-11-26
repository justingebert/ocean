import { differenceInCalendarDays, format } from "date-fns";

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

/** The one date format of the UI, e.g. "6 May 2027". */
export const formatDate = (value: Date): string => {
  return format(value, "d MMM yyyy");
};

export const isExpiringSoon = (expiresAt: Date | null, now: Date = new Date()): boolean => {
  return expiresAt !== null && differenceInCalendarDays(expiresAt, now) <= EXPIRY_WARNING_DAYS;
};
