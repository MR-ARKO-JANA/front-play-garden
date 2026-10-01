import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorPhoto, PageTitle, Panel, StatusPill, formatDate } from "@/components/medergency/ui";
import { SlotPicker } from "@/components/medergency/SlotPicker";
import { getDoctor, joinWindow, useMedergency, useNow } from "@/lib/medergency/store";
import type { Appointment } from "@/lib/medergency/types";

export const Route = createFileRoute("/patient/appointments")({
  head: () => ({
    meta: [
      { title: "My Appointments | Medergency" },
      { name: "description", content: "View, reschedule, cancel and join your consultations." },
      { property: "og:title", content: "My Appointments | Medergency" },
      {
        property: "og:description",
        content: "Manage your upcoming, completed and cancelled appointments.",
      },
    ],
  }),
  component: Appointments,
});

type Tab = "upcoming" | "completed" | "cancelled";

function Appointments() {
  const { appointments, currentPatient, updateAppointment } = useMedergency();
  const now = useNow(15000);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [details, setDetails] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState<Appointment | null>(null);
  const [resched, setResched] = useState<Appointment | null>(null);
  const [confirmResched, setConfirmResched] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const mine = appointments.filter((a) => a.patientId === currentPatient?.id);
  const lists: Record<Tab, Appointment[]> = {
    upcoming: mine
      .filter((a) => a.status === "pending" || a.status === "confirmed")
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    completed: mine.filter((a) => a.status === "completed"),
    cancelled: mine.filter((a) => a.status === "cancelled" || a.status === "rejected"),
  };

  const doCancel = () => {
    if (!cancelling) return;
    updateAppointment(
      cancelling.id,
      {
        status: "cancelled",
        payment: cancelling.payment === "paid" ? "refunded" : cancelling.payment,
      },
      {
        userId: currentPatient!.id,
        title: "Appointment cancelled",
        body: `${cancelling.id} was cancelled. Simulated refund initiated.`,
      },
    );
    toast.success("Appointment cancelled");
    setCancelling(null);
  };
  const doResched = () => {
    if (!resched) return;
    updateAppointment(
      resched.id,
      { date: newDate, time: newTime, status: "pending" },
      {
        userId: currentPatient!.id,
        title: "Appointment rescheduled",
        body: `${resched.id} moved to ${formatDate(newDate)} at ${newTime}. Awaiting doctor confirmation.`,
      },
    );
    toast.success("Appointment rescheduled");
    setConfirmResched(false);
    setResched(null);
  };

  return (
    <div>
      <PageTitle
        title="My Appointments"
        action={
          <Button asChild>
            <Link to="/patient/doctors">Book new</Link>
          </Button>
        }
      />
      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList>
          {(["upcoming", "completed", "cancelled"] as Tab[]).map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">
              {t} ({lists[t].length})
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <div className="mt-4 grid gap-3">
        {lists[tab].length === 0 && (
          <Panel>
            <p className="text-sm text-muted-foreground">No {tab} appointments.</p>
          </Panel>
        )}
        {lists[tab].map((a) => {
          const d = getDoctor(a.doctorId)!;
          const { eligible } = joinWindow(a, now);
          return (
            <Panel key={a.id} className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 gap-3">
                <DoctorPhoto doctor={d} size={56} />
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">{d.name}</p>
                  <p className="text-sm text-primary">{d.specialization}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(a.date)} · {a.time} · {a.type}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <StatusPill status={a.status} />
                    <StatusPill status={a.payment} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:justify-end">
                <Button size="sm" variant="outline" onClick={() => setDetails(a)}>
                  View Details
                </Button>
                {tab === "upcoming" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setResched(a);
                        setNewDate("");
                        setNewTime("");
                      }}
                    >
                      Reschedule
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive"
                      onClick={() => setCancelling(a)}
                    >
                      Cancel
                    </Button>
                    {eligible ? (
                      <Button size="sm" asChild>
                        <Link
                          to="/patient/consultation/$appointmentId"
                          params={{ appointmentId: a.id }}
                        >
                          Join Video
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        disabled
                        title="Opens 10 minutes before a confirmed appointment"
                      >
                        Join Video
                      </Button>
                    )}
                  </>
                )}
                {tab === "completed" && (
                  <Button size="sm" asChild>
                    <Link to="/patient/book/$doctorId" params={{ doctorId: d.id }}>
                      Book follow-up
                    </Link>
                  </Button>
                )}
              </div>
            </Panel>
          );
        })}
      </div>

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent>
          {details && (
            <>
              <DialogHeader>
                <DialogTitle>Appointment {details.id}</DialogTitle>
                <DialogDescription>
                  {getDoctor(details.doctorId)?.name} · {formatDate(details.date)} at {details.time}
                </DialogDescription>
              </DialogHeader>
              <dl className="grid gap-2 text-sm">
                {(
                  [
                    ["Reason", details.reason],
                    ["Symptoms", details.symptoms],
                    ["Medical history", details.history],
                    ["Reports", details.reports.join(", ")],
                    ["Payment method", details.paymentMethod],
                    ["Consultation summary", details.summary],
                  ] as [string, string | undefined][]
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="text-foreground">{v}</dd>
                    </div>
                  ))}
              </dl>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!resched && !confirmResched} onOpenChange={(o) => !o && setResched(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reschedule appointment</DialogTitle>
            <DialogDescription>
              Choose a new slot with {resched && getDoctor(resched.doctorId)?.name}.
            </DialogDescription>
          </DialogHeader>
          {resched && (
            <SlotPicker
              doctorId={resched.doctorId}
              date={newDate}
              time={newTime}
              onDate={setNewDate}
              onTime={setNewTime}
              excludeId={resched.id}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setResched(null)}>
              Close
            </Button>
            <Button disabled={!newDate || !newTime} onClick={() => setConfirmResched(true)}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmResched} onOpenChange={setConfirmResched}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm reschedule?</AlertDialogTitle>
            <AlertDialogDescription>
              Move to {newDate && formatDate(newDate)} at {newTime}. The doctor will need to confirm
              again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Back</AlertDialogCancel>
            <AlertDialogAction onClick={doResched}>Reschedule</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!cancelling} onOpenChange={(o) => !o && setCancelling(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this appointment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel {cancelling?.id}. A simulated refund will be recorded.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep appointment</AlertDialogCancel>
            <AlertDialogAction
              onClick={doCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancel appointment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
