// Core entities. Shapes are designed to map 1:1 onto future API responses.
export type Role = "patient" | "doctor";

export interface Session {
  role: Role;
  userId: string;
  remember: boolean;
}

export interface PatientProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  password: string; // mock only — never store plain passwords with a real backend
  gender?: string | undefined;
  dob?: string | undefined;
  address?: string | undefined;
}

export type VerificationStatus = "approved" | "pending" | "rejected";

export interface DoctorAvailability {
  weekdays: number[]; // 0 = Sunday
  slots: string[]; // "10:00 AM"
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  photo: string;
  qualifications: string;
  specialization: string;
  experience: number;
  fee: number;
  languages: string[];
  hospital: string;
  bio: string;
  registration: string; // public-safe registration label
  verification: VerificationStatus;
  sampleRating: number;
}

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "rejected";
export type PaymentStatus = "paid" | "failed" | "unpaid" | "refunded";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:00 AM"
  reason: string;
  symptoms?: string | undefined;
  history?: string | undefined;
  reports: string[];
  status: AppointmentStatus;
  payment: PaymentStatus;
  paymentMethod?: string | undefined;
  type: "Video Consultation";
  createdAt: string;
  summary?: string | undefined;
}

export type RecordCategory =
  "Prescriptions" | "Lab Reports" | "Medical History" | "Other Documents";

export interface MedicalRecord {
  id: string;
  patientId: string;
  name: string;
  category: RecordCategory;
  fileType: string;
  uploadedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}
