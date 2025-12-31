import { addMinutes, format, isBefore, parse, startOfDay } from 'date-fns';
import { StoreOverride, StoreTime } from '../types/api';
import { matchApiDate } from './dateHelpers';

/**
 * Generates 15-minute interval time slots between startTime and endTime.
 * @param baseDate The date to use for parsing times.
 * @param startTime String in "HH:mm" or "HH:mm:ss" format.
 * @param endTime String in "HH:mm" or "HH:mm:ss" format.
 */
export const generateTimeSlots = (
  baseDate: Date,
  startTime: string,
  endTime: string
): string[] => {
  const slots: string[] = [];
  
  // Normalize time strings (strip seconds if present for parsing)
  const startStr = startTime.substring(0, 5);
  const endStr = endTime.substring(0, 5);

  const start = parse(startStr, 'HH:mm', baseDate);
  const end = parse(endStr, 'HH:mm', baseDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || !isBefore(start, end)) {
    return [];
  }

  let current = start;
  while (isBefore(current, end) || format(current, 'HH:mm') === endStr) {
    slots.push(format(current, 'HH:mm'));
    current = addMinutes(current, 15);
    
    // Safety break to prevent infinite loops if something goes wrong
    if (slots.length > 96) break; // 24 hours / 15 mins
    
    // If the next slot is after the end time, stop
    if (isBefore(end, current) && format(current, 'HH:mm') !== endStr) {
        break;
    }
  }

  return slots;
};

interface AvailabilityResult {
  isOpen: boolean;
  slots: string[];
  status: 'open' | 'closed';
}

/**
 * Determines store availability and generates slots for a specific date.
 */
export const getStoreAvailability = (
  date: Date,
  times: StoreTime[],
  overrides: StoreOverride[]
): AvailabilityResult => {
  const { dayOfWeek, day, month } = matchApiDate(date);
  const baseDate = startOfDay(date);

  // 1. Priority Check: Overrides
  const override = overrides.find((o) => o.day === day && o.month === month);

  if (override) {
    if (!override.is_open) {
      return { isOpen: false, slots: [], status: 'closed' };
    }
    const slots = generateTimeSlots(baseDate, override.start_time, override.end_time);
    return {
      isOpen: slots.length > 0,
      slots,
      status: slots.length > 0 ? 'open' : 'closed',
    };
  }

  // 2. Standard Check: Weekly Schedule
  const schedule = times.find((t) => t.day_of_week === dayOfWeek);

  if (!schedule || !schedule.is_open) {
    return { isOpen: false, slots: [], status: 'closed' };
  }

  const slots = generateTimeSlots(baseDate, schedule.start_time, schedule.end_time);
  return {
    isOpen: slots.length > 0,
    slots,
    status: slots.length > 0 ? 'open' : 'closed',
  };
};
