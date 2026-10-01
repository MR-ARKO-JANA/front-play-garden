import { useMedergency } from "@/lib/medergency/store";
import { slotsFor, upcomingDates } from "@/lib/medergency/availability";

export function SlotPicker({
  doctorId,
  date,
  time,
  onDate,
  onTime,
  excludeId,
  readOnly = false,
}: {
  doctorId: string;
  date: string;
  time: string;
  onDate: (d: string) => void;
  onTime: (t: string) => void;
  excludeId?: string;
  readOnly?: boolean;
}) {
  const { availability, appointments } = useMedergency();
  const av = availability[doctorId];
  const dates = upcomingDates(av, 14);
  const slots = date ? slotsFor(doctorId, date, av, appointments, excludeId) : [];
  return (
    <div className="grid gap-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Select date</p>
        <div className="grid grid-cols-7 gap-1.5">
          {dates.map(({ date: iso, d, available }) => (
            <button
              key={iso}
              type="button"
              disabled={!available}
              onClick={() => {
                onDate(iso);
                onTime("");
              }}
              className={`flex flex-col items-center rounded-lg border py-2 text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${date === iso ? "border-primary bg-primary text-primary-foreground" : "bg-card text-foreground hover:border-primary"}`}
              aria-label={`${d.toDateString()}${available ? "" : " (unavailable)"}`}
            >
              <span className="opacity-75">
                {d.toLocaleDateString("en-IN", { weekday: "short" })}
              </span>
              <strong className="text-sm">{d.getDate()}</strong>
              <span className="opacity-75">
                {d.toLocaleDateString("en-IN", { month: "short" })}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Select time</p>
        {!date ? (
          <p className="text-sm text-muted-foreground">Pick an available date to see time slots.</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-muted-foreground">No slots on this date.</p>
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {slots.map((s) => {
              const off = s.booked || s.past;
              return (
                <button
                  key={s.time}
                  type="button"
                  disabled={off || readOnly}
                  onClick={() => onTime(s.time)}
                  className={`rounded-lg border px-2 py-2 text-sm font-medium disabled:cursor-not-allowed ${off ? "bg-muted text-muted-foreground line-through" : time === s.time ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-foreground hover:border-primary"}`}
                >
                  {s.time}
                  {s.booked && <span className="block text-[10px] no-underline">Booked</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
