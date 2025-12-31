import { addDays, addMinutes, format, isBefore, parse, startOfDay, isSameDay, subDays, isAfter } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import { StoreOverride, StoreTime } from '../types/api';
import { matchApiDate } from './dateHelpers';

/**
 * Generates 15-minute interval time slots between startTime and endTime.
 * The output slots are filtered to only include those that fall on the targetDate in the targetTimezone.
 */
export const generateTimeSlots = (
  baseDate: Date,
  startTime: string,
  endTime: string,
  targetTimezone: string,
  targetDate: Date
): string[] => {
  const slots: string[] = [];
  const startStr = startTime.substring(0, 5);
  const endStr = endTime.substring(0, 5);

  // Parse API times as NYC wall-clock times
  const nycStart = fromZonedTime(parse(startStr, 'HH:mm', baseDate), 'America/New_York');
  const nycEnd = fromZonedTime(parse(endStr, 'HH:mm', baseDate), 'America/New_York');

  if (!nycStart || !nycEnd || isNaN(nycStart.getTime()) || isNaN(nycEnd.getTime()) || !isBefore(nycStart, nycEnd)) {
    return [];
  }

  let currentNYC = nycStart;
  while (isBefore(currentNYC, nycEnd)) {
    try {
      const zonedTime = toZonedTime(currentNYC, targetTimezone);
      
      // Only include the slot if it falls on the selected date in the LOCAL timezone
      if (!isNaN(zonedTime.getTime()) && isSameDay(zonedTime, targetDate)) {
        slots.push(format(zonedTime, 'HH:mm'));
      }
    } catch {
      // Skip invalid slots
    }
    
    currentNYC = addMinutes(currentNYC, 15);
    if (slots.length > 96) break;
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
 * Handles multiple time ranges per day and converts slots to targetTimezone.
 * Crucially handles cross-day shifts (e.g., NYC Monday late night appearing on India Tuesday).
 */
export const getStoreAvailability = (
  date: Date,
  times: StoreTime[],
  overrides: StoreOverride[],
  targetTimezone: string
): AvailabilityResult => {
  const targetDateStart = startOfDay(date);
  const now = new Date();
  
  // To correctly find slots for 'targetDate', we need to check:
  // 1. Schedules/Overrides for 'targetDate' (which might shift forward/backward)
  // 2. Schedules/Overrides for 'targetDate - 1 day' (which might shift forward into targetDate)
  // 3. Schedules/Overrides for 'targetDate + 1 day' (which might shift backward into targetDate)
  
  const datesToCheck = [
    subDays(targetDateStart, 1),
    targetDateStart,
    addDays(targetDateStart, 1),
  ];

  let allSlots: string[] = [];

  datesToCheck.forEach(checkDate => {
    const { dayOfWeek, day, month } = matchApiDate(checkDate);
    const baseDate = startOfDay(checkDate);

    // Check Overrides for this checkDate
    const dayOverrides = overrides.filter((o) => o.day === day && o.month === month);
    if (dayOverrides.length > 0) {
      const openOverrides = dayOverrides.filter(o => o.is_open);
      openOverrides.forEach(o => {
        const slots = generateTimeSlots(baseDate, o.start_time, o.end_time, targetTimezone, targetDateStart);
        allSlots = [...allSlots, ...slots];
      });
    } else {
      // Check Standard Schedule if no overrides
      const daySchedules = times.filter((t) => t.day_of_week === dayOfWeek && t.is_open);
      daySchedules.forEach(s => {
        const slots = generateTimeSlots(baseDate, s.start_time, s.end_time, targetTimezone, targetDateStart);
        allSlots = [...allSlots, ...slots];
      });
    }
  });

  const uniqueSlots = Array.from(new Set(allSlots)).sort();
  
  // Filter out past slots if the target date is today in the target timezone
  const filteredSlots = uniqueSlots.filter(slot => {
    const nowInTargetTz = toZonedTime(now, targetTimezone);
    
    // If the selected date is not today (or earlier) in target timezone, show all
    if (!isSameDay(date, nowInTargetTz)) {
      return isAfter(date, nowInTargetTz) || isSameDay(date, nowInTargetTz);
    }
    
    const [hours, minutes] = slot.split(':').map(Number);
    const slotDate = new Date(date);
    slotDate.setHours(hours, minutes, 0, 0);
    
    return isAfter(slotDate, nowInTargetTz);
  });
  
  return {
    isOpen: filteredSlots.length > 0,
    slots: filteredSlots,
    status: filteredSlots.length > 0 ? 'open' : 'closed',
  };
};

/**
 * Finds the next time the store will open from the perspective of NYC time.
 */
export const getNextOpeningTime = (
  nowInNYC: Date,
  times: StoreTime[],
  overrides: StoreOverride[]
): Date | null => {
  // Check next 14 days to be safe
  for (let i = 0; i < 14; i++) {
    const checkDate = addDays(nowInNYC, i);
    const { dayOfWeek, day, month } = matchApiDate(checkDate);
    const baseDate = startOfDay(checkDate);

    // 1. Check Overrides
    const dayOverrides = overrides.filter((o) => o.day === day && o.month === month);
    if (dayOverrides.length > 0) {
      const openOverrides = dayOverrides
        .filter((o) => o.is_open)
        .map((o) => {
          const [h, m] = o.start_time.split(':').map(Number);
          const openDate = new Date(baseDate);
          openDate.setHours(h, m, 0, 0);
          return fromZonedTime(openDate, 'America/New_York');
        })
        .filter((d) => isAfter(d, nowInNYC))
        .sort((a, b) => a.getTime() - b.getTime());

      if (openOverrides.length > 0) return openOverrides[0];
      if (dayOverrides.some((o) => o.is_open)) continue; // Found opening today but it's in the past
    } else {
      // 2. Weekly Schedule
      const daySchedules = times
        .filter((t) => t.day_of_week === dayOfWeek && t.is_open)
        .map((s) => {
          const [h, m] = s.start_time.split(':').map(Number);
          const openDate = new Date(baseDate);
          openDate.setHours(h, m, 0, 0);
          return fromZonedTime(openDate, 'America/New_York');
        })
        .filter((d) => isAfter(d, nowInNYC))
        .sort((a, b) => a.getTime() - b.getTime());

      if (daySchedules.length > 0) return daySchedules[0];
    }
  }

  return null;
};
export const isStoreOpenNow = (
  now: Date,
  times: StoreTime[],
  overrides: StoreOverride[]
): boolean => {
  const { dayOfWeek, day, month } = matchApiDate(now);
  const currentTimeStr = format(now, 'HH:mm');
  
  // Helper to check if current time is within a range
  const isWithin = (start: string, end: string) => {
    // Simple string comparison works for HH:mm 24h format
    return currentTimeStr >= start.substring(0, 5) && currentTimeStr < end.substring(0, 5);
  };

  // 1. Overrides
  const dayOverrides = overrides.filter((o) => o.day === day && o.month === month);
  if (dayOverrides.length > 0) {
    return dayOverrides.some(o => o.is_open && isWithin(o.start_time, o.end_time));
  }

  // 2. Weekly Schedule
  const daySchedules = times.filter((t) => t.day_of_week === dayOfWeek);
  return daySchedules.some(s => s.is_open && isWithin(s.start_time, s.end_time));
};
