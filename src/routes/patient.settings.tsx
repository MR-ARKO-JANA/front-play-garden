import { createFileRoute } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FieldError, PageTitle, Panel } from "@/components/medergency/ui";
import { useSignOut } from "@/components/medergency/PatientShell";
import { useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/settings")({
  head: () => ({
    meta: [
      { title: "Settings | Medergency" },
      {
        name: "description",
        content: "Change your password, notification and privacy preferences.",
      },
      { property: "og:title", content: "Settings | Medergency" },
      { property: "og:description", content: "Manage your Medergency account settings." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { changePassword } = useMedergency();
  const signOut = useSignOut();
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [err, setErr] = useState("");
  const [prefs, setPrefs] = useState({
    "Appointment reminders": true,
    "Booking & payment updates": true,
    "Health tips & offers": false,
  });
  const [privacy, setPrivacy] = useState({
    "Share my records with doctors I book": true,
    "Allow anonymised usage analytics": false,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.next.length < 8) return setErr("New password must be at least 8 characters.");
    if (pw.next !== pw.confirm) return setErr("Passwords do not match.");
    const r = changePassword(pw.current, pw.next);
    if (!r.ok) return setErr(r.error);
    setErr("");
    setPw({ current: "", next: "", confirm: "" });
    toast.success("Password changed");
  };

  return (
    <div className="grid max-w-2xl gap-4">
      <PageTitle title="Settings" />
      <Panel>
        <h2 className="mb-3 font-semibold text-foreground">Change password</h2>
        <form onSubmit={submit} className="grid gap-3">
          {(["current", "next", "confirm"] as const).map((k) => (
            <div key={k}>
              <Label htmlFor={k}>
                {k === "current"
                  ? "Current password"
                  : k === "next"
                    ? "New password"
                    : "Confirm new password"}
              </Label>
              <Input
                id={k}
                type="password"
                className="mt-1.5"
                value={pw[k]}
                onChange={(e) => setPw({ ...pw, [k]: e.target.value })}
              />
            </div>
          ))}
          <FieldError message={err} />
          <Button type="submit" className="w-fit">
            Update password
          </Button>
        </form>
      </Panel>
      <Panel>
        <h2 className="mb-3 font-semibold text-foreground">Notification preferences</h2>
        {Object.entries(prefs).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between py-2 text-sm text-foreground">
            {k}
            <Switch
              checked={v}
              onCheckedChange={(c) => {
                setPrefs({ ...prefs, [k]: c });
                toast.success("Preference saved");
              }}
            />
          </label>
        ))}
      </Panel>
      <Panel>
        <h2 className="mb-3 font-semibold text-foreground">Privacy</h2>
        {Object.entries(privacy).map(([k, v]) => (
          <label key={k} className="flex items-center justify-between py-2 text-sm text-foreground">
            {k}
            <Switch
              checked={v}
              onCheckedChange={(c) => {
                setPrivacy({ ...privacy, [k]: c });
                toast.success("Privacy setting saved");
              }}
            />
          </label>
        ))}
      </Panel>
      <Button variant="outline" className="w-fit text-destructive" onClick={signOut}>
        <LogOut size={15} />
        Logout
      </Button>
    </div>
  );
}
