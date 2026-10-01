import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { MedergencyApp } from "@/components/MedergencyApp";
import { useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/doctor_/onboarding")({
  head: () => ({
    meta: [
      { title: "Doctor Onboarding & Verification | Medergency" },
      {
        name: "description",
        content:
          "Join Medergency as a verified doctor through a secure, guided onboarding experience.",
      },
      { property: "og:title", content: "Doctor Onboarding & Verification | Medergency" },
      {
        property: "og:description",
        content: "A secure, guided onboarding and verification experience for doctors.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Onboarding,
});

function Onboarding() {
  const { completeDoctorOnboarding } = useMedergency();
  const navigate = useNavigate();
  return (
    <MedergencyApp
      onLogin={() => navigate({ to: "/doctor/login" })}
      onFinish={(email, password) => {
        completeDoctorOnboarding(email, password);
        navigate({ to: "/doctor", replace: true });
      }}
    />
  );
}
