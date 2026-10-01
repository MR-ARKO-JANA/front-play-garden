import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell, FieldError } from "@/components/medergency/ui";
import { useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient_/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Patient Account | Medergency" },
      {
        name: "description",
        content: "Register as a patient to book video consultations with verified doctors.",
      },
      { property: "og:title", content: "Create Patient Account | Medergency" },
      {
        property: "og:description",
        content: "Register to book consultations with verified doctors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Register,
});

const schema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email").max(255),
    mobile: z
      .string()
      .trim()
      .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
    password: z.string().min(8, "At least 8 characters").max(72),
    confirm: z.string(),
    gender: z.string().optional(),
    dob: z.string().optional(),
    terms: z.literal(true, { message: "Please accept the terms" }),
  })
  .refine((v) => v.password === v.confirm, {
    path: ["confirm"],
    message: "Passwords do not match",
  });

function Register() {
  const { registerPatient } = useMedergency();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirm: "",
    gender: "",
    dob: "",
  });
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ ...form, terms });
    if (!parsed.success) {
      setErrors(Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    const res = registerPatient({
      fullName: form.fullName.trim(),
      email: form.email,
      mobile: form.mobile,
      password: form.password,
      gender: form.gender || undefined,
      dob: form.dob || undefined,
    });
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.success("Account created");
    navigate({ to: "/patient", replace: true });
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Book consultations with verified doctors."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/patient/login" className="font-semibold text-primary">
            Log In
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="grid gap-4" noValidate>
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            className="mt-1.5"
            value={form.fullName}
            onChange={set("fullName")}
            autoComplete="name"
          />
          <FieldError message={errors["fullName"]} />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            value={form.email}
            onChange={set("email")}
            autoComplete="email"
          />
          <FieldError message={errors["email"]} />
        </div>
        <div>
          <Label htmlFor="mobile">Mobile Number</Label>
          <div className="mt-1.5 flex">
            <span className="grid place-items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
              +91
            </span>
            <Input
              id="mobile"
              inputMode="numeric"
              maxLength={10}
              className="rounded-l-none"
              value={form.mobile}
              onChange={(e) =>
                setForm((f) => ({ ...f, mobile: e.target.value.replace(/\D/g, "") }))
              }
            />
          </div>
          <FieldError message={errors["mobile"]} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              className="mt-1.5"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />
            <FieldError message={errors["password"]} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm Password</Label>
            <Input
              id="confirm"
              type="password"
              className="mt-1.5"
              value={form.confirm}
              onChange={set("confirm")}
              autoComplete="new-password"
            />
            <FieldError message={errors["confirm"]} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="gender">
              Gender <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <select
              id="gender"
              value={form.gender}
              onChange={set("gender")}
              className="mt-1.5 h-9 w-full rounded-md border bg-card px-3 text-sm"
            >
              <option value="">Prefer not to say</option>
              <option>Female</option>
              <option>Male</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <Label htmlFor="dob">
              Date of Birth <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input id="dob" type="date" className="mt-1.5" value={form.dob} onChange={set("dob")} />
          </div>
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={terms}
              onCheckedChange={(v) => setTerms(v === true)}
              className="mt-0.5"
            />
            I agree to the Terms & Conditions and Privacy Policy.
          </label>
          <FieldError message={errors["terms"]} />
        </div>
        <Button type="submit" size="lg">
          Create Account
        </Button>
      </form>
    </AuthShell>
  );
}
