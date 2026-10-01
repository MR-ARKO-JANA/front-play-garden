import { appointmentStart } from "./store";
import { toISODate } from "./mock-data";
import type { Appointment, DoctorAvailability } from "./types";

/** Next `days` calendar dates, flagged by whether the doctor works that weekday. */
export function upcomingDates(av: DoctorAvailability | undefined, days = 14) {
  const out: { date: string; available: boolean; d: Date }[] = [];
  const base = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
    out.push({
      date: toISODate(d),
      d,
      available: Boolean(av?.weekdays.includes(d.getDay()) && av.slots.length),
    });
  }
  return out;
}

/** Slots generated from the doctor's configured availability, marking booked and past ones. */
export function slotsFor(
  doctorId: string,
  date: string,
  av: DoctorAvailability | undefined,
  appointments: Appointment[],
  excludeId?: string,
) {
  const [y, m, d] = date.split("-").map(Number);
  const day = new Date(y!, (m ?? 1) - 1, d).getDay();
  if (!av?.weekdays.includes(day)) return [];
  const booked = new Set(
    appointments
      .filter(
        (a) =>
          a.doctorId === doctorId &&
          a.date === date &&
          a.id !== excludeId &&
          ["pending", "confirmed"].includes(a.status),
      )
      .map((a) => a.time),
  );
  const now = Date.now();
  return av.slots.map((time) => ({
    time,
    booked: booked.has(time),
    past: appointmentStart({ date, time }).getTime() < now,
  }));
}

export function nextOpenSlots(
  doctorId: string,
  av: DoctorAvailability | undefined,
  appointments: Appointment[],
) {
  for (const { date, available } of upcomingDates(av, 7)) {
    if (!available) continue;
    const open = slotsFor(doctorId, date, av, appointments)
      .filter((s) => !s.booked && !s.past)
      .map((s) => s.time);
    if (open.length) return open;
  }
  return [];
}
