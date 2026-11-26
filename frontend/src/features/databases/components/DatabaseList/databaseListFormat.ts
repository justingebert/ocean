import { differenceInCalendarDays, format, formatDistance } from "date-fns";

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

/** Databases expiring within this many days are highlighted. */
export const EXPIRY_WARNING_DAYS = 30;

export const formatExpiryDate = (value: Date): string => {
  return format(value, "dd.MM.yyyy");
};

export const isExpiringSoon = (expiresAt: Date | null, now: Date = new Date()): boolean => {
  return expiresAt !== null && differenceInCalendarDays(expiresAt, now) <= EXPIRY_WARNING_DAYS;
};
