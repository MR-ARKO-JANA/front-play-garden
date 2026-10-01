import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  History,
  LogOut,
  ShieldCheck,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Brand,
  DoctorPhoto,
  Panel,
  RequireRole,
  StatusPill,
  formatDate,
} from "@/components/medergency/ui";
import { CallRoom } from "@/components/medergency/CallRoom";
import { NotificationList } from "@/components/medergency/NotificationList";
import { getDoctor, joinWindow, useMedergency, useNow } from "@/lib/medergency/store";
import type { Appointment } from "@/lib/medergency/types";

export const Route = createFileRoute("/doctor")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Doctor Dashboard | Medergency" },
      {
        name: "description",
        content: "Manage consultation requests, availability and video consultations.",
      },
      { property: "og:title", content: "Doctor Dashboard | Medergency" },
      { property: "og:description", content: "Your Medergency doctor workspace." },
    ],
  }),
  component: () => (
    <RequireRole role="doctor">
      <DoctorDashboard />
    </RequireRole>
  ),
});

type Tab = "requests" | "upcoming" | "history" | "availability" | "notifications";
const WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const ALL_SLOTS = [
  "9:00 AM",
  "9:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "3:00 PM",
  "3:30 PM",
  "4:00 PM",
  "4:30 PM",
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
];

function DoctorDashboard() {
  const {
    session,
    appointments,
    patients,
    notifications,
    availability,
    updateAppointment,
    setAvailability,
    logout,
  } = useMedergency();
  const navigate = useNavigate();
  const now = useNow(15000);
  const doctor = getDoctor(session!.userId)!;
  const [tab, setTab] = useState<Tab>("requests");
  const [details, setDetails] = useState<Appointment | null>(null);
  const [call, setCall] = useState<Appointment | null>(null);
  const av = availability[doctor.id] ?? { weekdays: [], slots: [] };
  const [days, setDays] = useState<number[]>(av.weekdays);
  const [slots, setSlots] = useState<string[]>(av.slots);

  const mine = appointments.filter((a) => a.doctorId === doctor.id);
  const patient = (id: string) => patients.find((p) => p.id === id);
  const lists = {
    requests: mine.filter((a) => a.status === "pending"),
    upcoming: mine
      .filter((a) => a.status === "confirmed")
      .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    history: mine.filter((a) => ["completed", "rejected", "cancelled"].includes(a.status)),
  };
  const unread = notifications.filter((n) => n.userId === doctor.id && !n.read).length;
  const signOut = () => {
    logout();
    navigate({ to: "/", replace: true });
  };

  if (call) {
    const p = patient(call.patientId);
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-5xl">
          <CallRoom
            remoteName={p?.fullName ?? "Patient"}
            selfLabel={doctor.name}
            waitingFor={p?.fullName ?? "the patient"}
            onEnd={() => {
              updateAppointment(
                call.id,
                {
                  status: "completed",
                  summary: "Consultation completed. Doctor notes to be added.",
                },
                {
                  userId: call.patientId,
                  title: "Consultation completed",
                  body: `Your consultation with ${doctor.name} is complete.`,
                },
              );
              toast.success("Consultation completed");
              setCall(null);
              setTab("history");
            }}
          />
        </div>
      </div>
    );
  }

  const stats = [
    { label: "New requests", value: lists.requests.length, icon: ClipboardList },
    { label: "Upcoming", value: lists.upcoming.length, icon: CalendarClock },
    {
      label: "Completed",
      value: mine.filter((a) => a.status === "completed").length,
      icon: CheckCircle2,
    },
    { label: "Unread alerts", value: unread, icon: Bell },
  ];

  const Row = ({ a }: { a: Appointment }) => {
    const p = patient(a.patientId);
    const { eligible } = joinWindow(a, now);
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border p-3">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground">{p?.fullName ?? "Patient"}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(a.date)} · {a.time} · {a.reason}
          </p>
        </div>
        <StatusPill status={a.status} />
        <Button size="sm" variant="outline" onClick={() => setDetails(a)}>
          Patient details
        </Button>
        {a.status === "pending" && (
          <>
            <Button
              size="sm"
              onClick={() => {
                updateAppointment(
                  a.id,
                  { status: "confirmed" },
                  {
                    userId: a.patientId,
                    title: "Appointment confirmed",
                    body: `${doctor.name} confirmed ${a.id} for ${formatDate(a.date)} at ${a.time}.`,
                  },
                );
                toast.success("Appointment accepted");
              }}
            >
              Accept
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => {
                updateAppointment(
                  a.id,
                  { status: "rejected", payment: "refunded" },
                  {
                    userId: a.patientId,
                    title: "Appointment declined",
                    body: `${a.id} was declined. Simulated refund issued.`,
                  },
                );
                toast("Appointment declined");
              }}
            >
              Reject
            </Button>
          </>
        )}
        {a.status === "confirmed" && (
          <Button
            size="sm"
            disabled={!eligible}
            title={eligible ? "" : "Opens 10 minutes before start"}
            onClick={() => {
              setCall(a);
            }}
          >
            <Video size={14} />
            Start video
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-card px-4 py-3">
        <Brand compact />
        <Button variant="ghost" onClick={signOut}>
          <LogOut size={15} />
          Logout
        </Button>
      </header>
      <main className="mx-auto grid max-w-5xl gap-4 p-4 pb-10">
        <Panel className="flex flex-wrap items-center gap-4">
          <DoctorPhoto doctor={doctor} size={72} />
          <div className="flex-1">
            <h1 className="flex items-center gap-2 text-xl font-bold text-foreground">
              {doctor.name}
              <ShieldCheck size={18} className="text-primary" />
            </h1>
            <p className="text-sm text-muted-foreground">
              {doctor.qualifications} · {doctor.specialization}
            </p>
            <p className="text-xs text-muted-foreground">{doctor.registration}</p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2 text-sm">
            <p className="text-muted-foreground">Fee</p>
            <p className="font-semibold text-foreground">₹{doctor.fee}</p>
          </div>
        </Panel>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map(({ label, value, icon: Icon }) => (
            <Panel key={label} className="!p-4">
              <Icon size={17} className="text-primary" />
              <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </Panel>
          ))}
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList className="h-auto flex-wrap">
            <TabsTrigger value="requests">Requests ({lists.requests.length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({lists.upcoming.length})</TabsTrigger>
            <TabsTrigger value="history">
              <History size={14} />
              History
            </TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="notifications">Alerts{unread ? ` (${unread})` : ""}</TabsTrigger>
          </TabsList>
        </Tabs>

        {(tab === "requests" || tab === "upcoming" || tab === "history") && (
          <Panel>
            <div className="grid gap-2">
              {lists[tab].length === 0 ? (
                <p className="text-sm text-muted-foreground">Nothing here yet.</p>
              ) : (
                lists[tab].map((a) => <Row key={a.id} a={a} />)
              )}
            </div>
          </Panel>
        )}

        {tab === "availability" && (
          <Panel className="grid gap-4">
            <div>
              <h2 className="font-semibold text-foreground">Working days</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {WEEK.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setDays((x) => (x.includes(i) ? x.filter((y) => y !== i) : [...x, i].sort()))
                    }
                    className={`rounded-full border px-3 py-1 text-sm ${days.includes(i) ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-muted-foreground"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Time slots</h2>
              <p className="text-xs text-muted-foreground">
                Patients only see slots you select here.
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {ALL_SLOTS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setSlots((x) =>
                        x.includes(s)
                          ? x.filter((y) => y !== s)
                          : ALL_SLOTS.filter((y) => x.includes(y) || y === s),
                      )
                    }
                    className={`rounded-lg border py-2 text-sm ${slots.includes(s) ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-foreground"}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="w-fit"
              onClick={() => {
                setAvailability(doctor.id, { weekdays: days, slots });
                toast.success("Availability saved");
              }}
            >
              Save availability
            </Button>
          </Panel>
        )}

        {tab === "notifications" && <NotificationList userId={doctor.id} />}
      </main>

      <Dialog open={!!details} onOpenChange={(o) => !o && setDetails(null)}>
        <DialogContent>
          {details && (
            <>
              <DialogHeader>
                <DialogTitle>{patient(details.patientId)?.fullName}</DialogTitle>
                <DialogDescription>
                  {details.id} · {formatDate(details.date)} at {details.time}
                </DialogDescription>
              </DialogHeader>
              <p className="text-xs text-muted-foreground">
                Only consultation-relevant information is shown.
              </p>
              <dl className="grid gap-2 text-sm">
                {(
                  [
                    ["Reason", details.reason],
                    ["Symptoms", details.symptoms],
                    ["Medical history", details.history],
                    ["Shared reports", details.reports.join(", ")],
                    ["Gender", patient(details.patientId)?.gender],
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
    </div>
  );
}
