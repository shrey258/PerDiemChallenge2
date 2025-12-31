import { format, addDays, getDay, getDate, getMonth, getHours } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

/**
 * Returns the current moment, converted to the target timezone.
 */
export const getNowInTimezone = (timezone: string): Date => {
  return toZonedTime(new Date(), timezone);
};

/**
 * Returns an array of the next 30 dates relative to the target timezone.
 */
export const generateNext30Days = (timezone: string): Date[] => {
  const now = getNowInTimezone(timezone);
  return Array.from({ length: 30 }, (_, i) => addDays(now, i));
};

/**
 * Formats a date into a readable string (e.g., "5:00 PM").
 * Assumes the input 'date' is already shifted to the target timezone (Wall Clock time).
 */
export const formatTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

/**
 * Returns a specific greeting based on the hour in the target timezone.
 */
export const getGreetingMessage = (timezone: string): string => {
  const now = getNowInTimezone(timezone);
  const hour = getHours(now);
  const isNYC = timezone === 'America/New_York';
  const city = isNYC ? 'NYC' : 'Local';

  if (hour >= 5 && hour < 10) {
    return `Good Morning, ${city}!`;
  } else if (hour >= 10 && hour < 12) {
    return `Late Morning Vibes! ${city}`;
  } else if (hour >= 12 && hour < 17) {
    return `Good Afternoon, ${city}!`;
  } else if (hour >= 17 && hour < 21) {
    return `Good Evening, ${city}!`;
  } else {
    return `Night Owl in ${city}!`;
  }
};

/**
 * Returns an object with dayOfWeek, day, and month (1-indexed) from the given date.
 */
export const matchApiDate = (date: Date) => {
  return {
    dayOfWeek: getDay(date), // 0-6
    day: getDate(date),
    month: getMonth(date) + 1, // JS is 0-indexed, API is 1-indexed
  };
};
