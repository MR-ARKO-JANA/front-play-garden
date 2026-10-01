import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Brand, Panel, RequireRole, StatusPill, formatDate } from "@/components/medergency/ui";
import { getDoctor, useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/doctor")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Doctor Dashboard | Medergency" },
    { name: "description", content: "Manage consultation requests and upcoming consultations." },
    { property: "og:title", content: "Doctor Dashboard | Medergency" },
    { property: "og:description", content: "Your Medergency doctor workspace." },
  ] }),
  component: () => <RequireRole role="doctor"><DoctorDashboard /></RequireRole>,
});

function DoctorDashboard() {
  const { session, appointments, patients, updateAppointment, logout } = useMedergency();
  const navigate = useNavigate();
  const doctor = getDoctor(session!.userId)!;
  const mine = appointments.filter((a) => a.doctorId === doctor.id);
  const name = (id: string) => patients.find((p) => p.id === id)?.fullName ?? "Patient";
  const groups = [
    ["Incoming requests", mine.filter((a) => a.status === "pending")],
    ["Upcoming consultations", mine.filter((a) => a.status === "confirmed")],
    ["Consultation history", mine.filter((a) => a.status === "completed")],
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b bg-card px-4 py-3"><Brand compact /><Button variant="ghost" onClick={() => { logout(); navigate({ to: "/", replace: true }); }}><LogOut size={15} />Logout</Button></header>
      <main className="mx-auto grid max-w-4xl gap-4 p-4">
        <h1 className="text-2xl font-bold text-foreground">Welcome, {doctor.name}</h1>
        {groups.map(([title, list]) => (
          <Panel key={title}>
            <h2 className="mb-3 font-semibold text-foreground">{title} ({list.length})</h2>
            {list.length === 0 && <p className="text-sm text-muted-foreground">Nothing here yet.</p>}
            <div className="grid gap-2">{list.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
                <div className="flex-1"><p className="font-medium text-foreground">{name(a.patientId)}</p><p className="text-xs text-muted-foreground">{formatDate(a.date)} · {a.time} · {a.reason}</p></div>
                <StatusPill status={a.status} />
                {a.status === "pending" && <>
                  <Button size="sm" onClick={() => { updateAppointment(a.id, { status: "confirmed" }, { userId: a.patientId, title: "Appointment confirmed", body: `${doctor.name} confirmed ${a.id}.` }); toast.success("Accepted"); }}>Accept</Button>
                  <Button size="sm" variant="outline" className="text-destructive" onClick={() => { updateAppointment(a.id, { status: "rejected", payment: "refunded" }, { userId: a.patientId, title: "Appointment declined", body: `${a.id} was declined. Simulated refund issued.` }); toast("Declined"); }}>Reject</Button>
                </>}
              </div>
            ))}</div>
          </Panel>
        ))}
      </main>
    </div>
  );
}
