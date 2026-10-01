import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { DoctorPhoto, PageTitle, Panel, StatusPill, formatDate } from "@/components/medergency/ui";
import { getDoctor, joinWindow, useMedergency, useNow } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/consultations")({
  head: () => ({
    meta: [
      { title: "My Consultations | Medergency" },
      {
        name: "description",
        content: "Join confirmed video consultations and review past sessions.",
      },
      { property: "og:title", content: "My Consultations | Medergency" },
      { property: "og:description", content: "Your video consultations in one place." },
    ],
  }),
  component: Consultations,
});

function Consultations() {
  const { appointments, currentPatient } = useMedergency();
  const now = useNow(15000);
  const mine = appointments.filter(
    (a) => a.patientId === currentPatient?.id && ["confirmed", "completed"].includes(a.status),
  );
  return (
    <div>
      <PageTitle
        title="Consultations"
        subtitle="Video consultations that are confirmed or completed."
      />
      <div className="grid gap-3">
        {mine.length === 0 && (
          <Panel>
            <p className="text-sm text-muted-foreground">No consultations yet.</p>
          </Panel>
        )}
        {mine.map((a) => {
          const d = getDoctor(a.doctorId)!;
          const { eligible } = joinWindow(a, now);
          return (
            <Panel key={a.id} className="flex flex-wrap items-center gap-3">
              <DoctorPhoto doctor={d} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{d.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(a.date)} · {a.time}
                </p>
              </div>
              <StatusPill status={a.status} />
              <Button size="sm" variant={eligible ? "default" : "outline"} asChild>
                <Link to="/patient/consultation/$appointmentId" params={{ appointmentId: a.id }}>
                  {a.status === "completed" ? "View summary" : eligible ? "Join now" : "Open"}
                </Link>
              </Button>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
