import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CallRoom } from "@/components/medergency/CallRoom";
import {
  DoctorPhoto,
  Panel,
  StatusPill,
  VerifiedBadge,
  formatDate,
} from "@/components/medergency/ui";
import { getDoctor, joinWindow, useMedergency, useNow } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/consultation/$appointmentId")({
  head: () => ({
    meta: [
      { title: "Video Consultation | Medergency" },
      { name: "description", content: "Join your video consultation with a verified doctor." },
      { property: "og:title", content: "Video Consultation | Medergency" },
      { property: "og:description", content: "Your consultation room." },
    ],
  }),
  component: Consultation,
});

function Consultation() {
  const { appointmentId } = Route.useParams();
  const { appointments, currentPatient, updateAppointment } = useMedergency();
  const now = useNow(1000);
  const [inCall, setInCall] = useState(false);
  const appt = appointments.find(
    (a) => a.id === appointmentId && a.patientId === currentPatient?.id,
  );
  if (!appt)
    return (
      <Panel>
        <p className="text-foreground">Consultation not found.</p>
        <Link to="/patient/appointments" className="text-sm text-primary">
          Back to appointments
        </Link>
      </Panel>
    );
  const doctor = getDoctor(appt.doctorId)!;
  const { eligible, start } = joinWindow(appt, now);
  const diff = start - now;

  if (inCall)
    return (
      <CallRoom
        remoteName={doctor.name}
        remotePhoto={doctor.photo}
        selfLabel="You"
        waitingFor={doctor.name}
        onEnd={() => {
          updateAppointment(
            appt.id,
            {
              status: "completed",
              summary: "Consultation summary will appear here once the doctor adds notes.",
            },
            {
              userId: appt.patientId,
              title: "Consultation completed",
              body: `Your consultation with ${doctor.name} is complete.`,
            },
          );
          setInCall(false);
        }}
      />
    );

  if (appt.status === "completed")
    return (
      <Panel className="mx-auto max-w-xl text-center">
        <CheckCircle2 size={48} className="mx-auto text-success" />
        <h1 className="mt-3 text-2xl font-bold text-foreground">Consultation completed</h1>
        <div className="mx-auto mt-4 flex max-w-xs items-center gap-3 rounded-xl border p-3 text-left">
          <DoctorPhoto doctor={doctor} size={48} />
          <div>
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg bg-muted p-4 text-left text-sm">
          <p className="font-semibold text-foreground">Consultation summary</p>
          <p className="mt-1 text-muted-foreground">
            {appt.summary ?? "The doctor's notes will appear here."}
          </p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <Button asChild>
            <Link to="/patient/book/$doctorId" params={{ doctorId: doctor.id }}>
              Book follow-up
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/patient">Return to Dashboard</Link>
          </Button>
        </div>
      </Panel>
    );

  const countdown =
    diff > 0
      ? `${Math.floor(diff / 3600000)}h ${Math.floor((diff % 3600000) / 60000)}m ${Math.floor((diff % 60000) / 1000)}s`
      : "Started";
  return (
    <Panel className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        <DoctorPhoto doctor={doctor} size={64} />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-foreground">{doctor.name}</h1>
            <VerifiedBadge doctor={doctor} />
          </div>
          <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-muted-foreground">Scheduled</p>
          <p className="font-semibold text-foreground">
            {formatDate(appt.date, { day: "numeric", month: "short" })} · {appt.time}
          </p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-muted-foreground">Starts in</p>
          <p className="flex items-center gap-1 font-semibold text-foreground">
            <Clock3 size={14} />
            {countdown}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Status:</span>
        <StatusPill status={appt.status} />
      </div>
      <Button
        className="mt-5 w-full"
        size="lg"
        disabled={!eligible}
        onClick={() => setInCall(true)}
      >
        Join Consultation
      </Button>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {appt.status === "pending"
          ? "Waiting for the doctor to confirm this appointment."
          : eligible
            ? "The consultation window is open."
            : "Join opens 10 minutes before the scheduled time."}
      </p>
    </Panel>
  );
}
