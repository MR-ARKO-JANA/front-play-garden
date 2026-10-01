import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  CalendarDays,
  CalendarPlus,
  CheckCircle2,
  Clock3,
  FolderHeart,
  Search,
  Stethoscope,
  UsersRound,
  Video,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DoctorCard, DoctorPhoto, Panel, StatusPill, formatDate } from "@/components/medergency/ui";
import { DoctorFilters, applyFilters, emptyFilters } from "@/components/medergency/DoctorFilters";
import { doctors } from "@/lib/medergency/mock-data";
import { getDoctor, joinWindow, useMedergency, useNow } from "@/lib/medergency/store";
import { nextOpenSlots } from "@/lib/medergency/availability";

export const Route = createFileRoute("/patient/")({
  head: () => ({
    meta: [
      { title: "Patient Dashboard | Medergency" },
      {
        name: "description",
        content: "Your appointments, consultations and verified doctors in one place.",
      },
      { property: "og:title", content: "Patient Dashboard | Medergency" },
      { property: "og:description", content: "Manage appointments and find verified doctors." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { currentPatient, appointments, availability } = useMedergency();
  const navigate = useNavigate();
  const now = useNow(15000);
  const [q, setQ] = useState("");
  const [filters, setFilters] = useState(emptyFilters);
  const mine = appointments.filter((a) => a.patientId === currentPatient?.id);
  const upcoming = mine
    .filter((a) => a.status === "confirmed" || a.status === "pending")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const featured = useMemo(
    () => applyFilters(doctors, filters, availability, appointments).slice(0, 6),
    [filters, availability, appointments],
  );

  const stats = [
    {
      label: "Upcoming Appointments",
      value: mine.filter((a) => a.status === "confirmed").length,
      icon: CalendarDays,
    },
    {
      label: "Completed Consultations",
      value: mine.filter((a) => a.status === "completed").length,
      icon: CheckCircle2,
    },
    {
      label: "Pending Appointments",
      value: mine.filter((a) => a.status === "pending").length,
      icon: Clock3,
    },
    {
      label: "Available Doctors",
      value: doctors.filter((d) => d.verification === "approved").length,
      icon: UsersRound,
    },
  ];
  const actions = [
    { to: "/patient/doctors", label: "Find a Doctor", icon: Stethoscope },
    { to: "/patient/doctors", label: "Book Appointment", icon: CalendarPlus },
    { to: "/patient/consultations", label: "My Consultations", icon: Video },
    { to: "/patient/records", label: "Medical Records", icon: FolderHeart },
  ] as const;

  return (
    <div className="grid gap-5">
      <section
        className="rounded-2xl p-5 text-primary-foreground sm:p-7"
        style={{ background: "var(--gradient-success)" }}
      >
        <h1 className="text-2xl font-bold sm:text-3xl">
          Hello, {currentPatient?.fullName.split(" ")[0]}!
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/80">
          Find the right doctor and take care of your health.
        </p>
        <form
          className="mt-5 flex max-w-xl flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/patient/doctors", search: { q } });
          }}
        >
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search doctors, specialties..."
              className="h-11 bg-card pl-9 text-foreground"
            />
          </div>
          <Button type="submit" variant="secondary" size="lg" className="h-11">
            Find a Doctor
          </Button>
        </form>
      </section>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {actions.map(({ to, label, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:border-primary"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-secondary text-primary">
              <Icon size={19} />
            </span>
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Panel key={label} className="!p-4">
            <Icon size={17} className="text-primary" />
            <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </Panel>
        ))}
      </div>

      <Panel>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Upcoming appointments</h2>
          <Link to="/patient/appointments" className="text-sm font-medium text-primary">
            View all
          </Link>
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No upcoming appointments.{" "}
            <Link to="/patient/doctors" className="font-medium text-primary">
              Book one now
            </Link>
            .
          </p>
        ) : (
          <div className="grid gap-2">
            {upcoming.slice(0, 3).map((a) => {
              const d = getDoctor(a.doctorId)!;
              const { eligible } = joinWindow(a, now);
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-lg border p-3">
                  <DoctorPhoto doctor={d} size={44} />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(a.date)} · {a.time}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                  <Button size="sm" variant={eligible ? "default" : "outline"} asChild>
                    <Link
                      to="/patient/consultation/$appointmentId"
                      params={{ appointmentId: a.id }}
                    >
                      {eligible ? "Join now" : "Details"}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Featured doctors</h2>
          <Link to="/patient/doctors" className="text-sm font-medium text-primary">
            See all
          </Link>
        </div>
        <DoctorFilters value={filters} onChange={setFilters} />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((d) => (
            <DoctorCard
              key={d.id}
              doctor={d}
              nextSlots={nextOpenSlots(d.id, availability[d.id], appointments)}
            />
          ))}
          {featured.length === 0 && (
            <p className="text-sm text-muted-foreground">No doctors match these filters.</p>
          )}
        </div>
      </section>
    </div>
  );
}
