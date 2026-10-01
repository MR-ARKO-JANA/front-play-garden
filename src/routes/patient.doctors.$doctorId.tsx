import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, GraduationCap, Languages, Star, Video } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DoctorPhoto, Panel, VerifiedBadge } from "@/components/medergency/ui";
import { SlotPicker } from "@/components/medergency/SlotPicker";
import { getDoctor } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/doctors/$doctorId")({
  loader: ({ params }) => {
    const doctor = getDoctor(params.doctorId);
    if (!doctor) throw notFound();
    return { name: doctor.name, specialization: doctor.specialization };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — ${loaderData.specialization} | Medergency` },
          {
            name: "description",
            content: `View ${loaderData.name}'s profile and book a video consultation.`,
          },
          { property: "og:title", content: `${loaderData.name} | Medergency` },
          {
            property: "og:description",
            content: `${loaderData.specialization} available for video consultations.`,
          },
        ]
      : [{ title: "Doctor not found" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <Panel>
      <p className="text-foreground">Doctor not found.</p>
      <Link to="/patient/doctors" className="text-primary">
        Back to doctors
      </Link>
    </Panel>
  ),
  component: Profile,
});

function Profile() {
  const { doctorId } = Route.useParams();
  const doctor = getDoctor(doctorId)!;
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const approved = doctor.verification === "approved";
  return (
    <div className="grid gap-5">
      <Link
        to="/patient/doctors"
        className="flex items-center gap-1 text-sm font-medium text-primary"
      >
        <ArrowLeft size={15} />
        All doctors
      </Link>
      <Panel>
        <div className="flex flex-col gap-5 sm:flex-row">
          <DoctorPhoto doctor={doctor} size={128} />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">{doctor.name}</h1>
              <VerifiedBadge doctor={doctor} />
            </div>
            <p className="font-medium text-primary">
              {doctor.specialization} · {doctor.experience} years experience
            </p>
            <div className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <GraduationCap size={15} />
                {doctor.qualifications}
              </p>
              <p className="flex items-center gap-2">
                <Building2 size={15} />
                {doctor.hospital}
              </p>
              <p className="flex items-center gap-2">
                <Languages size={15} />
                {doctor.languages.join(", ")}
              </p>
              <p className="flex items-center gap-2">
                <Video size={15} />
                Video Consultation
              </p>
              {approved && (
                <p className="flex items-center gap-2">
                  <Star size={15} />
                  {doctor.sampleRating} (sample rating, not real reviews)
                </p>
              )}
            </div>
          </div>
          <div className="rounded-xl bg-muted p-4 sm:w-48">
            <p className="text-xs text-muted-foreground">Consultation fee</p>
            <p className="text-2xl font-bold text-foreground">₹{doctor.fee}</p>
            <Button
              className="mt-3 w-full"
              disabled={!approved}
              onClick={() =>
                navigate({
                  to: "/patient/book/$doctorId",
                  params: { doctorId },
                  search: date && time ? { date, time } : {},
                })
              }
            >
              Book Appointment
            </Button>
          </div>
        </div>
      </Panel>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        <Panel>
          <h2 className="mb-2 font-semibold text-foreground">About</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{doctor.bio}</p>
          {approved && <p className="mt-3 text-xs text-muted-foreground">{doctor.registration}</p>}
        </Panel>
        <Panel>
          <h2 className="mb-3 font-semibold text-foreground">Availability calendar</h2>
          {approved ? (
            <SlotPicker
              doctorId={doctorId}
              date={date}
              time={time}
              onDate={setDate}
              onTime={setTime}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              This doctor's verification is still pending, so booking is not available yet.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
