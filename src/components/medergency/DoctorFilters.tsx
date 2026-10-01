import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { allLanguages, specializations } from "@/lib/medergency/mock-data";
import { nextOpenSlots } from "@/lib/medergency/availability";
import type { Appointment, Doctor, DoctorAvailability } from "@/lib/medergency/types";

export interface Filters {
  specialization: string;
  availability: string;
  fee: string;
  experience: string;
  language: string;
  sort: string;
  q: string;
}
export const emptyFilters: Filters = {
  specialization: "",
  availability: "",
  fee: "",
  experience: "",
  language: "",
  sort: "",
  q: "",
};

export function applyFilters(
  list: Doctor[],
  f: Filters,
  av: Record<string, DoctorAvailability>,
  appts: Appointment[],
) {
  const q = f.q.trim().toLowerCase();
  const out = list.filter((d) => {
    if (q && !`${d.name} ${d.specialization} ${d.qualifications}`.toLowerCase().includes(q))
      return false;
    if (f.specialization && d.specialization !== f.specialization) return false;
    if (f.language && !d.languages.includes(f.language)) return false;
    if (f.fee === "lt600" && d.fee >= 600) return false;
    if (f.fee === "600-800" && (d.fee < 600 || d.fee > 800)) return false;
    if (f.fee === "gt800" && d.fee <= 800) return false;
    if (f.experience && d.experience < Number(f.experience)) return false;
    if (f.availability === "available" && nextOpenSlots(d.id, av[d.id], appts).length === 0)
      return false;
    return true;
  });
  const soon = (d: Doctor) => (nextOpenSlots(d.id, av[d.id], appts).length ? 0 : 1);
  if (f.sort === "fee-asc") out.sort((a, b) => a.fee - b.fee);
  if (f.sort === "fee-desc") out.sort((a, b) => b.fee - a.fee);
  if (f.sort === "availability") out.sort((a, b) => soon(a) - soon(b));
  return out;
}

const sel = "h-9 rounded-md border bg-card px-2.5 text-sm text-foreground";

export function DoctorFilters({
  value,
  onChange,
  withSort = false,
}: {
  value: Filters;
  onChange: (f: Filters) => void;
  withSort?: boolean;
}) {
  const set = (k: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) =>
    onChange({ ...value, [k]: e.target.value });
  return (
    <div className="flex flex-wrap gap-2">
      <select
        aria-label="Specialization"
        className={sel}
        value={value.specialization}
        onChange={set("specialization")}
      >
        <option value="">All specialties</option>
        {specializations.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select
        aria-label="Availability"
        className={sel}
        value={value.availability}
        onChange={set("availability")}
      >
        <option value="">Any availability</option>
        <option value="available">Available this week</option>
      </select>
      <select aria-label="Consultation fee" className={sel} value={value.fee} onChange={set("fee")}>
        <option value="">Any fee</option>
        <option value="lt600">Under ₹600</option>
        <option value="600-800">₹600 – ₹800</option>
        <option value="gt800">Above ₹800</option>
      </select>
      <select
        aria-label="Experience"
        className={sel}
        value={value.experience}
        onChange={set("experience")}
      >
        <option value="">Any experience</option>
        <option value="5">5+ years</option>
        <option value="10">10+ years</option>
        <option value="20">20+ years</option>
      </select>
      <select
        aria-label="Language"
        className={sel}
        value={value.language}
        onChange={set("language")}
      >
        <option value="">Any language</option>
        {allLanguages.map((l) => (
          <option key={l}>{l}</option>
        ))}
      </select>
      {withSort && (
        <select aria-label="Sort" className={sel} value={value.sort} onChange={set("sort")}>
          <option value="">Sort: Relevance</option>
          <option value="availability">Soonest available</option>
          <option value="fee-asc">Fee: low to high</option>
          <option value="fee-desc">Fee: high to low</option>
        </select>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-9"
        onClick={() => onChange({ ...emptyFilters, q: value.q })}
      >
        <RotateCcw size={14} />
        Reset
      </Button>
    </div>
  );
}
