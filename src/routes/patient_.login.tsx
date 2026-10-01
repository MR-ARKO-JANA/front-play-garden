import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/medergency/ui";
import { useMedergency } from "@/lib/medergency/store";
import { DEMO_PASSWORD, DEMO_PATIENT_EMAIL } from "@/lib/medergency/mock-data";

export const Route = createFileRoute("/patient_/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Patient Login | Medergency" },
      { name: "description", content: "Log in to your Medergency patient account." },
      { property: "og:title", content: "Patient Login | Medergency" },
      {
        property: "og:description",
        content: "Access your appointments, consultations and records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Login,
});

function Login() {
  const { loginPatient } = useMedergency();
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [forgot, setForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id.trim() || !password) {
      setError("Enter your email/mobile and password.");
      return;
    }
    const res = loginPatient(id, password, remember);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate({ to: "/patient", replace: true });
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Log in to manage your consultations."
      footer={
        <>
          New to Medergency?{" "}
          <Link to="/patient/register" className="font-semibold text-primary">
            Register Now
          </Link>
          <p className="mt-3">
            Are you a doctor?{" "}
            <Link to="/doctor/login" className="font-semibold text-primary">
              Doctor login
            </Link>
          </p>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div>
          <Label htmlFor="id">Email or Mobile Number</Label>
          <Input
            id="id"
            className="mt-1.5"
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="username"
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
            autoComplete="current-password"
          />
          <FieldError message={error} />
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(v) => setRemember(v === true)} />
            Remember me
          </label>
          <button
            type="button"
            className="font-medium text-primary"
            onClick={() => setForgot(true)}
          >
            Forgot password?
          </button>
        </div>
        <Button type="submit" size="lg">
          Login
        </Button>
        <button
          type="button"
          onClick={() => {
            setId(DEMO_PATIENT_EMAIL);
            setPassword(DEMO_PASSWORD);
          }}
          className="rounded-lg border border-dashed p-3 text-left text-xs text-muted-foreground hover:bg-muted"
        >
          <strong className="text-foreground">Demo account:</strong> {DEMO_PATIENT_EMAIL} /{" "}
          {DEMO_PASSWORD} — tap to fill
        </button>
      </form>
      <Dialog open={forgot} onOpenChange={setForgot}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset password</DialogTitle>
            <DialogDescription>
              Enter your email. In this prototype no email is actually sent.
            </DialogDescription>
          </DialogHeader>
          <Input
            type="email"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <DialogFooter>
            <Button
              disabled={!/\S+@\S+\.\S+/.test(resetEmail)}
              onClick={() => {
                setForgot(false);
                toast.success("If an account exists, a reset link would be sent (simulated).");
              }}
            >
              Send reset link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AuthShell>
  );
}
