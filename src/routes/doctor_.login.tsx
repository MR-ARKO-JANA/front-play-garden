import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/medergency/ui";
import { useMedergency } from "@/lib/medergency/store";
import { DEMO_DOCTOR_EMAIL, DEMO_PASSWORD } from "@/lib/medergency/mock-data";

export const Route = createFileRoute("/doctor_/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Doctor Login | Medergency" },
      { name: "description", content: "Doctors log in to manage consultations on Medergency." },
      { property: "og:title", content: "Doctor Login | Medergency" },
      {
        property: "og:description",
        content: "Access your doctor dashboard and consultation requests.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DoctorLogin,
});

function DoctorLogin() {
  const { loginDoctor } = useMedergency();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notRegistered, setNotRegistered] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotRegistered(false);
    if (!/\S+@\S+\.\S+/.test(email) || !password) {
      setError("Enter your registered email and password.");
      return;
    }
    const res = loginDoctor(email, password);
    if (res.ok) {
      navigate({ to: "/doctor", replace: true });
      return;
    }
    if (res.error === "not_registered") {
      setError("");
      setNotRegistered(true);
      return;
    }
    setError(res.error);
  };

  return (
    <AuthShell
      title="Doctor login"
      subtitle="Manage your consultations and availability."
      footer={
        <>
          Not registered yet?{" "}
          <Link to="/doctor/onboarding" className="font-semibold text-primary">
            Join as Doctor
          </Link>
          <p className="mt-3">
            Are you a patient?{" "}
            <Link to="/patient/login" className="font-semibold text-primary">
              Patient login
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div>
          <Label htmlFor="email">Registered Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="pw">Password</Label>
          <Input
            id="pw"
            type="password"
            className="mt-1.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FieldError message={error} />
        </div>
        {notRegistered && (
          <div className="rounded-lg bg-secondary p-3 text-sm text-secondary-foreground">
            No doctor account found for this email. Complete onboarding and verification first.
            <Button
              className="mt-3 w-full"
              onClick={() => navigate({ to: "/doctor/onboarding" })}
              type="button"
            >
              Start Doctor Onboarding
            </Button>
          </div>
        )}
        <Button type="submit" size="lg">
          Login
        </Button>
        <button
          type="button"
          onClick={() => {
            setEmail(DEMO_DOCTOR_EMAIL);
            setPassword(DEMO_PASSWORD);
          }}
          className="rounded-lg border border-dashed p-3 text-left text-xs text-muted-foreground hover:bg-muted"
        >
          <strong className="text-foreground">Demo doctor:</strong> {DEMO_DOCTOR_EMAIL} /{" "}
          {DEMO_PASSWORD} — tap to fill
        </button>
      </form>
    </AuthShell>
  );
}
