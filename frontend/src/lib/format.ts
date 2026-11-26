import { format } from "date-fns";

/** The one date format of the UI, e.g. "6 May 2027". */
export const formatDate = (value: Date): string => {
  return format(value, "d MMM yyyy");
};
