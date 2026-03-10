/**
 * Parse a time string "HH:MM" into total minutes from midnight.
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert total minutes from midnight into "HH:MM" format.
 */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Generate time slots from startTime to endTime with given duration.
 * @returns Array of "HH:MM" strings
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMins: number
): string[] {
  const slots: string[] = [];
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  for (let m = startMinutes; m + durationMins <= endMinutes; m += durationMins) {
    slots.push(minutesToTime(m));
  }

  return slots;
}

/**
 * Get today's date as a Date object with time zeroed out, using IST (UTC+5:30).
 * This ensures correct date boundary behaviour for the Sri Lanka timezone.
 */
export function getTodayDate(): Date {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
}

/**
 * Parse a date string "YYYY-MM-DD" into a Date object (UTC).
 */
export function parseDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Format a Date to "YYYY-MM-DD".
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is in the future (compared to today UTC).
 */
export function isFutureDate(date: Date): boolean {
  const today = getTodayDate();
  return date.getTime() > today.getTime();
}

/**
 * Check if a date is today (UTC).
 */
export function isToday(date: Date): boolean {
  const today = getTodayDate();
  return date.getTime() === today.getTime();
}

/**
 * Format time "HH:MM" to "HH:MM AM/PM"
 */
export function formatTimeAmPm(time: string): string {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${m.toString().padStart(2, '0')} ${ampm}`;
}
