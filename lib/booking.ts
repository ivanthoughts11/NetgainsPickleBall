export const OPEN_HOUR = 6;
export const CLOSE_HOUR = 22;
export const HOURLY_RATE = Number(process.env.NEXT_PUBLIC_HOURLY_RATE || 500);

export function slotsForDate() {
  return Array.from({ length: CLOSE_HOUR - OPEN_HOUR }, (_, i) => {
    const hour = OPEN_HOUR + i;
    const next = hour + 1;
    return { startTime: `${String(hour).padStart(2,'0')}:00`, endTime: `${String(next).padStart(2,'0')}:00` };
  });
}

export function isValidDate(value: string) {
  const d = new Date(`${value}T00:00:00`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0,10) === value;
}

export function isValidTime(value: string) { return /^([01]\d|2[0-3]):00$/.test(value); }
export function reference() { return `NG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }
