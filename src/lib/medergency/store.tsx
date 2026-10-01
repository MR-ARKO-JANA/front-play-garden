import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildSeed, CURRENT_DOCTOR_ID, DEMO_PASSWORD, doctors } from "./mock-data";
import type {
  Appointment,
  AppNotification,
  DoctorAvailability,
  MedicalRecord,
  PatientProfile,
  Role,
  Session,
} from "./types";

/**
 * Mock service layer + app state.
 * Every action below is the single place a real API call would go later
 * (e.g. `registerPatient` -> POST /patients). UI never touches storage directly.
 */
interface DataState {
  patients: PatientProfile[];
  appointments: Appointment[];
  records: MedicalRecord[];
  notifications: AppNotification[];
  availability: Record<string, DoctorAvailability>;
  registeredDoctors: { email: string; password: string; doctorId: string }[];
}

const STORAGE_KEY = "medergency-demo-v1";
const SESSION_KEY = "medergency-session";
const uid = (p: string) =>
  `${p}-${Date.now().toString(36)}${Math.floor(performance.now() * 1000)
    .toString(36)
    .slice(-4)}`;

type Result = { ok: true } | { ok: false; error: string };

interface Store extends DataState {
  ready: boolean;
  session: Session | null;
  currentPatient: PatientProfile | null;
  registerPatient: (p: Omit<PatientProfile, "id">) => Result;
  loginPatient: (identifier: string, password: string, remember: boolean) => Result;
  loginDoctor: (email: string, password: string) => Result | { ok: false; error: "not_registered" };
  completeDoctorOnboarding: (email?: string, password?: string) => void;
  logout: () => void;
  createAppointment: (a: Omit<Appointment, "id" | "createdAt" | "type">) => Appointment;
  updateAppointment: (
    id: string,
    patch: Partial<Appointment>,
    notice?: { userId: string; title: string; body: string },
  ) => void;
  addRecord: (r: Omit<MedicalRecord, "id" | "uploadedAt">) => void;
  deleteRecord: (id: string) => void;
  notify: (userId: string, title: string, body: string) => void;
  markRead: (id: string) => void;
  markAllRead: (userId: string) => void;
  clearNotifications: (userId: string) => void;
  updateProfile: (patch: Partial<PatientProfile>) => void;
  changePassword: (current: string, next: string) => Result;
  setAvailability: (doctorId: string, a: DoctorAvailability) => void;
}

const Ctx = createContext<Store | null>(null);

function initialData(): DataState {
  const seed = buildSeed();
  return {
    ...seed,
    registeredDoctors: [
      { email: doctors[0]!.email, password: DEMO_PASSWORD, doctorId: CURRENT_DOCTOR_ID },
    ],
  };
}

export function MedergencyProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DataState | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      setData(saved ? (JSON.parse(saved) as DataState) : initialData());
      const s =
        window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY);
      if (s) setSession(JSON.parse(s) as Session);
    } catch {
      setData(initialData());
    }
  }, []);

  useEffect(() => {
    if (data) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const saveSession = useCallback((s: Session | null) => {
    setSession(s);
    window.localStorage.removeItem(SESSION_KEY);
    window.sessionStorage.removeItem(SESSION_KEY);
    if (s)
      (s.remember ? window.localStorage : window.sessionStorage).setItem(
        SESSION_KEY,
        JSON.stringify(s),
      );
  }, []);

  const mutate = useCallback(
    (fn: (d: DataState) => DataState) => setData((d) => (d ? fn(d) : d)),
    [],
  );
  const d = data ?? {
    patients: [],
    appointments: [],
    records: [],
    notifications: [],
    availability: {},
    registeredDoctors: [],
  };

  const notifyRaw = (userId: string, title: string, body: string): AppNotification => ({
    id: uid("n"),
    userId,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
  });

  const store: Store = {
    ...d,
    ready: data !== null,
    session,
    currentPatient:
      session?.role === "patient"
        ? (d.patients.find((p) => p.id === session.userId) ?? null)
        : null,
    registerPatient: (p) => {
      const email = p.email.trim().toLowerCase();
      if (d.patients.some((x) => x.email.toLowerCase() === email))
        return { ok: false, error: "An account with this email already exists." };
      if (d.patients.some((x) => x.mobile === p.mobile))
        return { ok: false, error: "This mobile number is already registered." };
      const patient = { ...p, email, id: uid("p") };
      mutate((s) => ({
        ...s,
        patients: [...s.patients, patient],
        notifications: [
          notifyRaw(
            patient.id,
            "Welcome to Medergency",
            "Your patient account is ready. Find a verified doctor to get started.",
          ),
          ...s.notifications,
        ],
      }));
      saveSession({ role: "patient", userId: patient.id, remember: true });
      return { ok: true };
    },
    loginPatient: (identifier, password, remember) => {
      const id = identifier.trim().toLowerCase().replace(/^\+91/, "");
      const p = d.patients.find((x) => x.email.toLowerCase() === id || x.mobile === id);
      if (!p || p.password !== password)
        return { ok: false, error: "Incorrect email/mobile or password." };
      saveSession({ role: "patient", userId: p.id, remember });
      return { ok: true };
    },
    loginDoctor: (email, password) => {
      const doc = d.registeredDoctors.find((x) => x.email === email.trim().toLowerCase());
      if (!doc) return { ok: false, error: "not_registered" };
      if (doc.password !== password) return { ok: false, error: "Incorrect password." };
      saveSession({ role: "doctor", userId: doc.doctorId, remember: true });
      return { ok: true };
    },
    completeDoctorOnboarding: (email, password) => {
      // Prototype: the onboarded profile maps onto the sample doctor account.
      if (email)
        mutate((s) => ({
          ...s,
          registeredDoctors: [
            ...s.registeredDoctors.filter((x) => x.email !== email.toLowerCase()),
            {
              email: email.toLowerCase(),
              password: password || DEMO_PASSWORD,
              doctorId: CURRENT_DOCTOR_ID,
            },
          ],
        }));
      saveSession({ role: "doctor", userId: CURRENT_DOCTOR_ID, remember: true });
    },
    logout: () => saveSession(null),
    createAppointment: (a) => {
      const appt: Appointment = {
        ...a,
        id: `MED-${Math.floor(10000 + (Date.now() % 90000))}`,
        createdAt: new Date().toISOString(),
        type: "Video Consultation",
      };
      const doctor = doctors.find((x) => x.id === a.doctorId);
      const patient = d.patients.find((x) => x.id === a.patientId);
      mutate((s) => ({
        ...s,
        appointments: [appt, ...s.appointments],
        notifications: [
          notifyRaw(
            a.patientId,
            "Appointment successfully booked",
            `Request sent to ${doctor?.name} for ${a.date} at ${a.time}. Awaiting doctor confirmation.`,
          ),
          notifyRaw(
            a.patientId,
            "Payment confirmation (test mode)",
            `Simulated payment of ₹${doctor?.fee} recorded for ${appt.id}. No real money was charged.`,
          ),
          notifyRaw(
            a.doctorId,
            "New consultation request",
            `${patient?.fullName ?? "A patient"} requested ${a.date} at ${a.time}.`,
          ),
          ...s.notifications,
        ],
      }));
      return appt;
    },
    updateAppointment: (id, patch, notice) =>
      mutate((s) => ({
        ...s,
        appointments: s.appointments.map((x) => (x.id === id ? { ...x, ...patch } : x)),
        notifications: notice
          ? [notifyRaw(notice.userId, notice.title, notice.body), ...s.notifications]
          : s.notifications,
      })),
    addRecord: (r) =>
      mutate((s) => ({
        ...s,
        records: [
          { ...r, id: uid("r"), uploadedAt: new Date().toISOString().slice(0, 10) },
          ...s.records,
        ],
      })),
    deleteRecord: (id) => mutate((s) => ({ ...s, records: s.records.filter((x) => x.id !== id) })),
    notify: (userId, title, body) =>
      mutate((s) => ({
        ...s,
        notifications: [notifyRaw(userId, title, body), ...s.notifications],
      })),
    markRead: (id) =>
      mutate((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
      })),
    markAllRead: (userId) =>
      mutate((s) => ({
        ...s,
        notifications: s.notifications.map((n) => (n.userId === userId ? { ...n, read: true } : n)),
      })),
    clearNotifications: (userId) =>
      mutate((s) => ({ ...s, notifications: s.notifications.filter((n) => n.userId !== userId) })),
    updateProfile: (patch) =>
      session &&
      mutate((s) => ({
        ...s,
        patients: s.patients.map((p) => (p.id === session.userId ? { ...p, ...patch } : p)),
      })),
    changePassword: (current, next) => {
      const p = d.patients.find((x) => x.id === session?.userId);
      if (!p || p.password !== current)
        return { ok: false, error: "Current password is incorrect." };
      mutate((s) => ({
        ...s,
        patients: s.patients.map((x) => (x.id === p.id ? { ...x, password: next } : x)),
      }));
      return { ok: true };
    },
    setAvailability: (doctorId, a) =>
      mutate((s) => ({ ...s, availability: { ...s.availability, [doctorId]: a } })),
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useMedergency() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useMedergency must be used inside MedergencyProvider");
  return ctx;
}

export const getDoctor = (id: string) => doctors.find((x) => x.id === id);

export function appointmentStart(a: Pick<Appointment, "date" | "time">) {
  const [y, m, day] = a.date.split("-").map(Number);
  const match = /(\d+):(\d+)\s*(AM|PM)/.exec(a.time);
  let h = Number(match?.[1] ?? 0);
  const min = Number(match?.[2] ?? 0);
  if (match?.[3] === "PM" && h !== 12) h += 12;
  if (match?.[3] === "AM" && h === 12) h = 0;
  return new Date(y!, (m ?? 1) - 1, day, h, min);
}

/** Join window: 10 minutes before until 30 minutes after the start time. */
export function joinWindow(a: Appointment, now: number) {
  const start = appointmentStart(a).getTime();
  return {
    start,
    eligible: a.status === "confirmed" && now >= start - 10 * 60000 && now <= start + 30 * 60000,
  };
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), interval);
    return () => window.clearInterval(t);
  }, [interval]);
  return now;
}

export function useRoleLabel(role: Role) {
  return useMemo(() => (role === "patient" ? "Patient" : "Doctor"), [role]);
}
