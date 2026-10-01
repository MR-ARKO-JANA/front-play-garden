import {
  Maximize,
  Mic,
  MicOff,
  Minimize,
  PhoneOff,
  UserRound,
  Video,
  VideoOff,
  Wifi,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * Mock telemedicine room. No media is transmitted — replace the internals with
 * WebRTC / Agora / another provider while keeping the same props.
 */
export function CallRoom({
  remoteName,
  selfLabel,
  remotePhoto,
  waitingFor,
  onEnd,
}: {
  remoteName: string;
  selfLabel: string;
  remotePhoto?: string;
  waitingFor: string;
  onEnd: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<"waiting" | "live">("waiting");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [full, setFull] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("live"), 3500);
    return () => window.clearTimeout(t);
  }, []);
  useEffect(() => {
    if (phase !== "live") return;
    const t = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(t);
  }, [phase]);
  useEffect(() => {
    const h = () => setFull(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", h);
    return () => document.removeEventListener("fullscreenchange", h);
  }, []);

  const toggleFull = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void ref.current?.requestFullscreen?.();
  };
  const mmss = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div
      ref={ref}
      className="relative flex min-h-[70vh] flex-col overflow-hidden rounded-2xl bg-brand-deep text-primary-foreground"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 p-4 text-sm">
        <span className="flex items-center gap-2">
          <Wifi size={16} />
          {phase === "waiting" ? "Waiting room" : "Simulated session · connected"}
        </span>
        <span className="rounded-full bg-primary-foreground/15 px-2.5 py-0.5 font-mono">
          {phase === "live" ? mmss : "--:--"}
        </span>
      </div>
      <div className="relative flex flex-1 items-center justify-center p-4">
        {phase === "waiting" ? (
          <div className="text-center">
            <div className="mx-auto h-14 w-14 animate-pulse rounded-full bg-primary-foreground/20" />
            <p className="mt-4 text-lg font-semibold">Waiting for {waitingFor} to join…</p>
            <p className="text-sm text-primary-foreground/70">You'll be connected automatically.</p>
          </div>
        ) : (
          <div className="text-center">
            {remotePhoto ? (
              <img
                src={remotePhoto}
                alt={remoteName}
                width={160}
                height={160}
                className="mx-auto h-40 w-40 rounded-full object-cover object-top"
              />
            ) : (
              <div className="mx-auto grid h-40 w-40 place-items-center rounded-full bg-primary-foreground/15">
                <UserRound size={64} />
              </div>
            )}
            <p className="mt-3 text-lg font-semibold">{remoteName}</p>
            <p className="text-xs text-primary-foreground/70">
              Video placeholder — no video service connected yet
            </p>
          </div>
        )}
        <div className="absolute bottom-4 right-4 grid h-28 w-40 place-items-center rounded-xl border border-primary-foreground/25 bg-primary-foreground/10 text-xs">
          {cam ? (
            <span className="flex flex-col items-center gap-1">
              <UserRound size={28} />
              {selfLabel}
            </span>
          ) : (
            <span className="flex flex-col items-center gap-1">
              <VideoOff size={22} />
              Camera off
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 p-4">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={() => setMic(!mic)}
          aria-label={mic ? "Mute microphone" : "Unmute microphone"}
        >
          {mic ? <Mic /> : <MicOff />}
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={() => setCam(!cam)}
          aria-label={cam ? "Turn camera off" : "Turn camera on"}
        >
          {cam ? <Video /> : <VideoOff />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-12 w-12 rounded-full"
          onClick={() => {
            if (document.fullscreenElement) void document.exitFullscreen();
            onEnd();
          }}
          aria-label="End call"
        >
          <PhoneOff />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full"
          onClick={toggleFull}
          aria-label="Toggle full screen"
        >
          {full ? <Minimize /> : <Maximize />}
        </Button>
      </div>
    </div>
  );
}
