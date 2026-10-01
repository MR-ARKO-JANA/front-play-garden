import { Link, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Clock3, Languages, Loader2, Star } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useMedergency } from "@/lib/medergency/store";
import type { AppointmentStatus, Doctor, PaymentStatus, Role } from "@/lib/medergency/types";

export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link
      to="/"
      className={`brand-lockup ${inverse ? "brand-lockup-inverse" : ""} justify-start`}
      aria-label="Medergency home"
    >
      <div className="brand-mark" aria-hidden="true">
        <span>M</span>
        <i />
      </div>
      <div className="text-left">
        <strong className={compact ? "text-base" : "text-lg"}>Medergency</strong>
        {!compact && <small>Life Deserves Care</small>}
      </div>
    </Link>
  );
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-xl border bg-card p-4 text-card-foreground shadow-sm sm:p-5 ${className}`}
    >
      {children}
    </section>
  );
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function VerifiedBadge({ doctor }: { doctor: Doctor }) {
  if (doctor.verification === "approved")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
        <BadgeCheck size={13} />
        Verified
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
      <Clock3 size={12} />
      Verification pending
    </span>
  );
}

const statusStyles: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-secondary text-secondary-foreground",
  completed: "bg-success/15 text-success",
  cancelled: "bg-destructive/10 text-destructive",
  rejected: "bg-destructive/10 text-destructive",
  paid: "bg-success/15 text-success",
  failed: "bg-destructive/10 text-destructive",
  unpaid: "bg-muted text-muted-foreground",
  refunded: "bg-muted text-muted-foreground",
};
const statusLabel: Record<string, string> = {
  pending: "Awaiting doctor",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Declined",
  paid: "Paid (test)",
  failed: "Payment failed",
  unpaid: "Unpaid",
  refunded: "Refunded (test)",
};
export function StatusPill({ status }: { status: AppointmentStatus | PaymentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusStyles[status]}`}
    >
      {statusLabel[status]}
    </span>
  );
}

export function DoctorPhoto({ doctor, size = 64 }: { doctor: Doctor; size?: number }) {
  return (
    <img
      src={doctor.photo}
      alt={`Portrait of ${doctor.name}`}
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-xl bg-secondary object-cover object-top"
      style={{ width: size, height: size }}
    />
  );
}

export function DoctorCard({ doctor, nextSlots }: { doctor: Doctor; nextSlots?: string[] }) {
  const bookable = doctor.verification === "approved";
  return (
    <Panel className="flex flex-col gap-3">
      <div className="flex gap-3">
        <DoctorPhoto doctor={doctor} size={72} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-semibold text-foreground">{doctor.name}</h3>
            <VerifiedBadge doctor={doctor} />
          </div>
          <p className="text-sm font-medium text-primary">{doctor.specialization}</p>
          <p className="truncate text-xs text-muted-foreground">{doctor.qualifications}</p>
          {bookable && (
            <p className="mt-1 text-[11px] text-muted-foreground">{doctor.registration}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-2 text-center text-xs">
        <div>
          <strong className="block text-sm text-foreground">{doctor.experience} yrs</strong>
          <span className="text-muted-foreground">Experience</span>
        </div>
        <div>
          <strong className="block text-sm text-foreground">₹{doctor.fee}</strong>
          <span className="text-muted-foreground">Fee</span>
        </div>
        <div>
          {bookable ? (
            <>
              <strong className="flex items-center justify-center gap-0.5 text-sm text-foreground">
                <Star size={12} className="fill-current" />
                {doctor.sampleRating}
              </strong>
              <span className="text-muted-foreground">Sample rating</span>
            </>
          ) : (
            <>
              <strong className="block text-sm text-foreground">—</strong>
              <span className="text-muted-foreground">Rating</span>
            </>
          )}
        </div>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Languages size={13} />
        {doctor.languages.join(", ")}
      </p>
      {nextSlots && (
        <div className="flex flex-wrap gap-1.5">
          {nextSlots.length ? (
            nextSlots.slice(0, 4).map((s) => (
              <span key={s} className="rounded-md border px-2 py-0.5 text-[11px] text-foreground">
                {s}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              {bookable ? "No slots available soon" : "Not available for booking yet"}
            </span>
          )}
        </div>
      )}
      <div className="mt-auto grid grid-cols-2 gap-2">
        <Button variant="outline" asChild>
          <Link to="/patient/doctors/$doctorId" params={{ doctorId: doctor.id }}>
            View Profile
          </Link>
        </Button>
        {bookable ? (
          <Button asChild>
            <Link to="/patient/book/$doctorId" params={{ doctorId: doctor.id }}>
              Book
            </Link>
          </Button>
        ) : (
          <Button disabled>Unavailable</Button>
        )}
      </div>
    </Panel>
  );
}

export function FullLoader() {
  return (
    <div className="grid min-h-screen place-items-center bg-background">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );
}

/** Client-side role gate for the mock session. Replace with server-verified auth when a backend exists. */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { ready, session } = useMedergency();
  const navigate = useNavigate();
  const allowed = ready && session?.role === role;
  useEffect(() => {
    if (!ready || allowed) return;
    if (session)
      navigate({ to: session.role === "patient" ? "/patient" : "/doctor", replace: true });
    else navigate({ to: role === "patient" ? "/patient/login" : "/doctor/login", replace: true });
  }, [ready, allowed, session, role, navigate]);
  if (!allowed) return <FullLoader />;
  return <>{children}</>;
}

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <main className="app-stage">
      <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm sm:p-8">
        <Brand />
        <h1 className="mt-6 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
      </div>
    </main>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  return message ? <p className="mt-1 text-xs text-destructive">{message}</p> : null;
}

export function formatDate(
  iso: string,
  opts: Intl.DateTimeFormatOptions = {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  },
) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d).toLocaleDateString("en-IN", opts);
}
