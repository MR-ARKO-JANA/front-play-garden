import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  CreditCard,
  FileUp,
  Landmark,
  Loader2,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DoctorPhoto,
  FieldError,
  Panel,
  StatusPill,
  VerifiedBadge,
  formatDate,
} from "@/components/medergency/ui";
import { SlotPicker } from "@/components/medergency/SlotPicker";
import { getDoctor, useMedergency } from "@/lib/medergency/store";
import type { Appointment } from "@/lib/medergency/types";

export const Route = createFileRoute("/patient/book/$doctorId")({
  validateSearch: z.object({ date: z.string().optional(), time: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Book a Consultation | Medergency" },
      {
        name: "description",
        content: "Choose a date and time, add details and confirm your video consultation.",
      },
      { property: "og:title", content: "Book a Consultation | Medergency" },
      { property: "og:description", content: "Book a video consultation with a verified doctor." },
    ],
  }),
  component: Booking,
});

const steps = ["Date & Time", "Details", "Summary", "Payment", "Confirmed"];
const methods = [
  { id: "UPI", icon: Smartphone, label: "UPI" },
  { id: "Card", icon: CreditCard, label: "Credit / Debit Card" },
  { id: "Net Banking", icon: Landmark, label: "Net Banking" },
  { id: "Wallet", icon: Wallet, label: "Wallet" },
];

/** Simulated payment gateway. Swap for Razorpay order creation + checkout later. */
function simulatePayment(shouldFail: boolean) {
  return new Promise<{ ok: boolean }>((resolve) =>
    window.setTimeout(() => resolve({ ok: !shouldFail }), 1400),
  );
}

function Booking() {
  const { doctorId } = Route.useParams();
  const search = Route.useSearch();
  const doctor = getDoctor(doctorId);
  const { currentPatient, createAppointment } = useMedergency();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(search.date && search.time ? 1 : 0);
  const [date, setDate] = useState(search.date ?? "");
  const [time, setTime] = useState(search.time ?? "");
  const [reason, setReason] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState("");
  const [reports, setReports] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [method, setMethod] = useState("UPI");
  const [paying, setPaying] = useState(false);
  const [payFailed, setPayFailed] = useState(false);
  const [booked, setBooked] = useState<Appointment | null>(null);

  if (!doctor || doctor.verification !== "approved") {
    return (
      <Panel>
        <p className="font-medium text-foreground">This doctor can't be booked right now.</p>
        <p className="text-sm text-muted-foreground">
          Only doctors with approved verification accept bookings.
        </p>
        <Button asChild className="mt-4">
          <Link to="/patient/doctors">Browse verified doctors</Link>
        </Button>
      </Panel>
    );
  }

  const pay = async (fail: boolean) => {
    setPaying(true);
    setPayFailed(false);
    const res = await simulatePayment(fail);
    setPaying(false);
    if (!res.ok) {
      setPayFailed(true);
      return;
    }
    setBooked(
      createAppointment({
        patientId: currentPatient!.id,
        doctorId,
        date,
        time,
        reason: reason.trim(),
        symptoms: symptoms.trim() || undefined,
        history: history.trim() || undefined,
        reports,
        status: "pending",
        payment: "paid",
        paymentMethod: method,
      }),
    );
    setStep(4);
  };

  const summaryRows: [string, React.ReactNode][] = [
    ["Doctor", doctor.name],
    ["Date", date ? formatDate(date) : "—"],
    ["Time", time || "—"],
    ["Consultation type", "Video Consultation"],
    ["Consultation fee", `₹${doctor.fee}`],
    ["Payment status", booked ? <StatusPill status="paid" /> : <StatusPill status="unpaid" />],
  ];

  return (
    <div className="mx-auto max-w-3xl">
      {step < 4 && (
        <button
          type="button"
          onClick={() =>
            step === 0
              ? navigate({ to: "/patient/doctors/$doctorId", params: { doctorId } })
              : setStep(step - 1)
          }
          className="mb-4 flex items-center gap-1 text-sm font-medium text-primary"
        >
          <ArrowLeft size={15} />
          Back
        </button>
      )}
      <ol className="mb-5 flex gap-1.5">
        {steps.map((s, i) => (
          <li key={s} className="flex-1">
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-primary" : "bg-border"}`} />
            <span
              className={`mt-1 hidden text-[11px] sm:block ${i <= step ? "text-primary" : "text-muted-foreground"}`}
            >
              {s}
            </span>
          </li>
        ))}
      </ol>

      <Panel className="mb-4 flex items-center gap-3 !p-3">
        <DoctorPhoto doctor={doctor} size={52} />
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{doctor.name}</p>
            <VerifiedBadge doctor={doctor} />
          </div>
          <p className="text-sm text-muted-foreground">
            {doctor.specialization} · ₹{doctor.fee}
          </p>
        </div>
      </Panel>

      {step === 0 && (
        <Panel>
          <SlotPicker
            doctorId={doctorId}
            date={date}
            time={time}
            onDate={setDate}
            onTime={setTime}
          />
          <Button
            className="mt-5 w-full"
            size="lg"
            disabled={!date || !time}
            onClick={() => setStep(1)}
          >
            Continue
          </Button>
        </Panel>
      )}

      {step === 1 && (
        <Panel className="grid gap-4">
          <h2 className="font-semibold text-foreground">Consultation details</h2>
          <div>
            <Label htmlFor="reason">Reason for consultation</Label>
            <Textarea
              id="reason"
              className="mt-1.5"
              maxLength={300}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Fever for two days"
            />
            <FieldError message={error} />
          </div>
          <div>
            <Label htmlFor="sym">
              Symptoms <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="sym"
              className="mt-1.5"
              maxLength={500}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="his">
              Relevant medical history{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="his"
              className="mt-1.5"
              maxLength={500}
              value={history}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>
          <div>
            <Label>
              Medical reports <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              onChange={(e) => {
                setReports((r) => [...r, ...Array.from(e.target.files ?? []).map((f) => f.name)]);
                e.target.value = "";
              }}
            />
            <Button
              type="button"
              variant="outline"
              className="mt-1.5 w-full border-dashed"
              onClick={() => fileRef.current?.click()}
            >
              <FileUp size={16} />
              Upload reports
            </Button>
            <ul className="mt-2 grid gap-1">
              {reports.map((r) => (
                <li
                  key={r}
                  className="flex items-center justify-between rounded-md bg-muted px-3 py-1.5 text-sm text-foreground"
                >
                  {r}
                  <button
                    type="button"
                    aria-label={`Remove ${r}`}
                    onClick={() => setReports((x) => x.filter((y) => y !== r))}
                  >
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <Button
            size="lg"
            onClick={() => {
              if (reason.trim().length < 3) {
                setError("Please describe the reason for your consultation.");
                return;
              }
              setError("");
              setStep(2);
            }}
          >
            Review booking
          </Button>
        </Panel>
      )}

      {step === 2 && (
        <Panel>
          <h2 className="mb-3 font-semibold text-foreground">Booking summary</h2>
          <dl className="divide-y">
            {summaryRows.map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
            <p className="text-muted-foreground">Reason</p>
            <p className="text-foreground">{reason}</p>
          </div>
          <Button className="mt-5 w-full" size="lg" onClick={() => setStep(3)}>
            Proceed to payment
          </Button>
        </Panel>
      )}

      {step === 3 && (
        <div className="grid gap-4 md:grid-cols-[1.3fr_1fr]">
          <Panel>
            <h2 className="font-semibold text-foreground">Payment method</h2>
            <p className="mt-1 rounded-md bg-secondary px-3 py-2 text-xs text-secondary-foreground">
              Test mode — no payment gateway is connected and no real money will be charged.
            </p>
            <div className="mt-4 grid gap-2">
              {methods.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMethod(id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left text-sm font-medium ${method === id ? "border-primary bg-secondary text-secondary-foreground" : "bg-card text-foreground"}`}
                >
                  <Icon size={18} />
                  {label}
                  {method === id && <Check size={16} className="ml-auto" />}
                </button>
              ))}
            </div>
            {payFailed && (
              <div className="mt-4 flex gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <XCircle size={18} className="shrink-0" />
                <div>
                  <p className="font-semibold">Simulated payment failed</p>
                  <p>Nothing was charged. You can try again.</p>
                </div>
              </div>
            )}
            <Button className="mt-5 w-full" size="lg" disabled={paying} onClick={() => pay(false)}>
              {paying ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Processing…
                </>
              ) : (
                `Pay ₹${doctor.fee} (simulated)`
              )}
            </Button>
            <button
              type="button"
              disabled={paying}
              onClick={() => pay(true)}
              className="mt-2 w-full text-center text-xs text-muted-foreground underline"
            >
              Simulate a failed payment
            </button>
          </Panel>
          <Panel className="h-fit">
            <h2 className="mb-2 font-semibold text-foreground">Order summary</h2>
            <div className="grid gap-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultation fee</span>
                <span className="text-foreground">₹{doctor.fee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Platform fee</span>
                <span className="text-foreground">₹0</span>
              </div>
              <div className="flex justify-between border-t pt-2 font-semibold">
                <span className="text-foreground">Total</span>
                <span className="text-foreground">₹{doctor.fee}</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {formatDate(date)} · {time}
            </p>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck size={14} />
              Ready for Razorpay integration
            </p>
          </Panel>
        </div>
      )}

      {step === 4 && booked && (
        <Panel className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
            <Check size={32} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">Booking request sent</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Simulated payment recorded. {doctor.name} will confirm your appointment.
          </p>
          <dl className="mx-auto mt-5 max-w-sm divide-y text-left">
            {(
              [
                ["Booking ID", booked.id],
                ["Doctor", `${doctor.name} · ${doctor.specialization}`],
                ["Date", formatDate(booked.date)],
                ["Time", booked.time],
                ["Status", <StatusPill key="s" status={booked.status} />],
                ["Payment", <StatusPill key="p" status={booked.payment} />],
              ] as [string, React.ReactNode][]
            ).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2 text-sm">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-medium text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mx-auto mt-6 grid max-w-sm gap-2">
            <Button
              size="lg"
              disabled
              title="Available once the doctor confirms and the appointment time is near"
            >
              Join Consultation
            </Button>
            <p className="text-xs text-muted-foreground">
              Join opens 10 minutes before a confirmed appointment.
            </p>
            <Button variant="outline" asChild>
              <Link to="/patient/appointments">View my appointments</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link to="/patient">Back to dashboard</Link>
            </Button>
          </div>
        </Panel>
      )}
    </div>
  );
}
