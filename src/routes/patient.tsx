import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PatientShell } from "@/components/medergency/PatientShell";
import { RequireRole } from "@/components/medergency/ui";

export const Route = createFileRoute("/patient")({
  ssr: false,
  component: () => (
    <RequireRole role="patient">
      <PatientShell>
        <Outlet />
      </PatientShell>
    </RequireRole>
  ),
});
