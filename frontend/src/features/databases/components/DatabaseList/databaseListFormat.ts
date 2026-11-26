import { differenceInCalendarDays, formatDistanceStrict } from "date-fns";

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

/** Expiry relative to now, e.g. "in 6 months", "in 12 days", "3 days ago". */
export const formatExpiry = (expiresAt: Date, now: Date = new Date()): string => {
  return formatDistanceStrict(expiresAt, now, { addSuffix: true });
};
