import { createFileRoute } from "@tanstack/react-router";
import { MedergencyApp } from "../components/MedergencyApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Doctor Onboarding & Verification | Medergency" },
      { name: "description", content: "Join Medergency as a verified doctor through a secure, guided onboarding experience." },
      { property: "og:title", content: "Doctor Onboarding & Verification | Medergency" },
      { property: "og:description", content: "A secure, guided onboarding and verification experience for doctors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return <MedergencyApp />;
}
