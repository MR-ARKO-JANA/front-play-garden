import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  CalendarCheck,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/medergency/ui";
import heroDoctor from "@/assets/doctor-3.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Medergency — Online Consultations with Verified Doctors" },
      {
        name: "description",
        content:
          "Book video consultations with verified doctors, or join Medergency as a doctor. Life Deserves Care.",
      },
      { property: "og:title", content: "Medergency — Online Consultations with Verified Doctors" },
      {
        property: "og:description",
        content:
          "Patients find verified doctors and book video consultations. Doctors join through guided verification.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex h-18 max-w-6xl items-center justify-between px-5 py-4">
        <Brand />
        <div className="flex gap-2">
          <Button variant="ghost" asChild>
            <Link to="/patient/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link to="/patient/register">Register</Link>
          </Button>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[1.1fr_0.9fr] md:pt-12">
        <section>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <ShieldCheck size={14} />
            Only verified doctors can accept bookings
          </span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-brand-deep sm:text-5xl">
            Care from verified doctors, <span className="text-primary">wherever you are.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base text-muted-foreground">
            Find the right specialist, book a video consultation and keep your medical records in
            one private place.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <RoleCard
              icon={<UserRound />}
              title="Continue as Patient"
              copy="Find doctors, book and join consultations."
              login="/patient/login"
              register="/patient/register"
            />
            <RoleCard
              icon={<Stethoscope />}
              title="Join as Doctor"
              copy="Get verified and start consulting patients."
              login="/doctor/login"
              register="/doctor/onboarding"
              dark
            />
          </div>
        </section>
        <section className="relative hidden md:block">
          <div className="overflow-hidden rounded-3xl border bg-secondary shadow-sm">
            <img
              src={heroDoctor}
              alt="A doctor ready for a video consultation"
              width={816}
              height={816}
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
          <div className="absolute -left-8 bottom-10 rounded-xl border bg-card p-3 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Video size={16} className="text-primary" />
              Video consultation
            </p>
            <p className="text-xs text-muted-foreground">Join from any device</p>
          </div>
          <div className="absolute -right-4 top-8 rounded-xl border bg-card p-3 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <CalendarCheck size={16} className="text-success" />
              Book in minutes
            </p>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        Prototype — all doctors, patients and bookings shown are sample data.
      </footer>
    </div>
  );
}

function RoleCard({
  icon,
  title,
  copy,
  login,
  register,
  dark = false,
}: {
  icon: React.ReactNode;
  title: string;
  copy: string;
  login: "/patient/login" | "/doctor/login";
  register: "/patient/register" | "/doctor/onboarding";
  dark?: boolean;
}) {
  return (
    <div
      className={`flex flex-col rounded-2xl border p-5 ${dark ? "border-brand-deep bg-brand-deep text-primary-foreground" : "bg-card"}`}
    >
      <span
        className={`grid h-11 w-11 place-items-center rounded-xl ${dark ? "bg-primary-foreground/15" : "bg-secondary text-primary"}`}
      >
        {icon}
      </span>
      <h2 className="mt-4 flex items-center gap-1.5 text-lg font-semibold">
        {title}
        {dark && <BadgeCheck size={17} />}
      </h2>
      <p
        className={`mt-1 text-sm ${dark ? "text-primary-foreground/75" : "text-muted-foreground"}`}
      >
        {copy}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button asChild variant={dark ? "secondary" : "default"}>
          <Link to={register}>{dark ? "Join Now" : "Register"}</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className={
            dark
              ? "border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
              : ""
          }
        >
          <Link to={login}>Log In</Link>
        </Button>
      </div>
    </div>
  );
}
