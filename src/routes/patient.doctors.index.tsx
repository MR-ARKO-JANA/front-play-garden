import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { DoctorCard, PageTitle } from "@/components/medergency/ui";
import { DoctorFilters, applyFilters, emptyFilters } from "@/components/medergency/DoctorFilters";
import { doctors } from "@/lib/medergency/mock-data";
import { useMedergency } from "@/lib/medergency/store";
import { nextOpenSlots } from "@/lib/medergency/availability";

export const Route = createFileRoute("/patient/doctors/")({
  validateSearch: z.object({ q: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Find a Doctor | Medergency" },
      {
        name: "description",
        content: "Search verified doctors by name, specialty, fee, experience and language.",
      },
      { property: "og:title", content: "Find a Doctor | Medergency" },
      {
        property: "og:description",
        content: "Search and book verified doctors for video consultations.",
      },
    ],
  }),
  component: FindDoctor,
});

function FindDoctor() {
  const { q } = Route.useSearch();
  const { availability, appointments } = useMedergency();
  const [filters, setFilters] = useState({ ...emptyFilters, q: q ?? "" });
  const list = useMemo(
    () => applyFilters(doctors, filters, availability, appointments),
    [filters, availability, appointments],
  );
  return (
    <div>
      <PageTitle
        title="Find a Doctor"
        subtitle="Only doctors with approved verification can be booked."
      />
      <div className="relative mb-3">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Search by doctor name or specialty"
          className="h-11 bg-card pl-9"
          aria-label="Search doctors"
        />
      </div>
      <DoctorFilters value={filters} onChange={setFilters} withSort />
      <p className="mt-4 text-sm text-muted-foreground">
        {list.length} doctor{list.length === 1 ? "" : "s"} found · ratings shown are sample data
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((d) => (
          <DoctorCard
            key={d.id}
            doctor={d}
            nextSlots={nextOpenSlots(d.id, availability[d.id], appointments)}
          />
        ))}
      </div>
    </div>
  );
}
