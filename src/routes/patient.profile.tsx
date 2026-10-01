import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, Pencil } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FieldError, PageTitle, Panel } from "@/components/medergency/ui";
import { useSignOut } from "@/components/medergency/PatientShell";
import { useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/profile")({
  head: () => ({
    meta: [
      { title: "My Profile | Medergency" },
      { name: "description", content: "View and update your personal information." },
      { property: "og:title", content: "My Profile | Medergency" },
      { property: "og:description", content: "Manage your Medergency patient profile." },
    ],
  }),
  component: Profile,
});

const schema = z.object({
  fullName: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit number"),
  dob: z.string().optional(),
  gender: z.string().optional(),
  address: z.string().trim().max(250).optional(),
});

function Profile() {
  const { currentPatient, updateProfile } = useMedergency();
  const signOut = useSignOut();
  const p = currentPatient!;
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: p.fullName,
    email: p.email,
    mobile: p.mobile,
    dob: p.dob ?? "",
    gender: p.gender ?? "",
    address: p.address ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set =
    (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = () => {
    const r = schema.safeParse(form);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    updateProfile(r.data);
    setEditing(false);
    toast.success("Profile updated");
  };
  const rows: [string, keyof typeof form, string][] = [
    ["Full Name", "fullName", "text"],
    ["Email", "email", "email"],
    ["Mobile Number", "mobile", "tel"],
    ["Date of Birth", "dob", "date"],
    ["Address", "address", "text"],
  ];

  return (
    <div className="max-w-2xl">
      <PageTitle
        title="My Profile"
        action={
          !editing && (
            <Button variant="outline" onClick={() => setEditing(true)}>
              <Pencil size={15} />
              Edit Profile
            </Button>
          )
        }
      />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          {rows.map(([label, key, type]) => (
            <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
              <Label htmlFor={key}>{label}</Label>
              {editing ? (
                <>
                  <Input
                    id={key}
                    type={type}
                    className="mt-1.5"
                    value={form[key]}
                    onChange={set(key)}
                  />
                  <FieldError message={errors[key]} />
                </>
              ) : (
                <p className="mt-1 text-sm text-foreground">
                  {(key === "mobile" ? `+91 ${p.mobile}` : p[key]) || "—"}
                </p>
              )}
            </div>
          ))}
          <div>
            <Label htmlFor="gender">Gender</Label>
            {editing ? (
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
            ) : (
              <p className="mt-1 text-sm text-foreground">{p.gender || "—"}</p>
            )}
          </div>
        </div>
        {editing && (
          <div className="mt-5 flex gap-2">
            <Button onClick={save}>Save changes</Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </Panel>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" asChild>
          <Link to="/patient/settings">Password & preferences</Link>
        </Button>
        <Button variant="ghost" className="text-destructive" onClick={signOut}>
          <LogOut size={15} />
          Logout
        </Button>
      </div>
    </div>
  );
}
