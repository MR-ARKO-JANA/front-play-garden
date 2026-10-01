import doctor1 from "@/assets/doctor-portrait.png";
import doctor2 from "@/assets/doctor-2.jpg";
import doctor3 from "@/assets/doctor-3.jpg";
import doctor4 from "@/assets/doctor-4.jpg";
import doctor5 from "@/assets/doctor-5.jpg";
import type {
  Appointment,
  AppNotification,
  Doctor,
  DoctorAvailability,
  MedicalRecord,
  PatientProfile,
} from "./types";

// All people and data below are fictional sample data for the prototype.
export const DEMO_PATIENT_EMAIL = "patient@demo.in";
export const DEMO_DOCTOR_EMAIL = "rahul@demo.in";
export const DEMO_PASSWORD = "demo1234";
export const CURRENT_DOCTOR_ID = "d1";

export const doctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Rahul Sharma",
    email: DEMO_DOCTOR_EMAIL,
    photo: doctor2,
    qualifications: "MBBS, MD (General Medicine)",
    specialization: "General Physician",
    experience: 8,
    fee: 499,
    languages: ["English", "Hindi", "Bengali"],
    hospital: "Sample City Clinic, Kolkata",
    bio: "General physician focused on everyday illnesses, fevers, lifestyle conditions and preventive care. Believes in clear explanations and practical follow-up plans.",
    registration: "Sample Reg. No. WB-0000 (NMC)",
    verification: "approved",
    sampleRating: 4.9,
  },
  {
    id: "d2",
    name: "Dr. Ananya Iyer",
    email: "ananya@demo.in",
    photo: doctor3,
    qualifications: "MBBS, MD (Dermatology)",
    specialization: "Dermatologist",
    experience: 6,
    fee: 699,
    languages: ["English", "Tamil", "Hindi"],
    hospital: "Sample Skin Care Centre, Chennai",
    bio: "Dermatologist treating acne, eczema, hair loss and skin allergies with evidence-based care.",
    registration: "Sample Reg. No. TN-0000 (NMC)",
    verification: "approved",
    sampleRating: 4.8,
  },
  {
    id: "d3",
    name: "Dr. Vikram Rao",
    email: "vikram@demo.in",
    photo: doctor4,
    qualifications: "MBBS, MD, DM (Cardiology)",
    specialization: "Cardiologist",
    experience: 22,
    fee: 999,
    languages: ["English", "Hindi", "Telugu"],
    hospital: "Sample Heart Institute, Hyderabad",
    bio: "Senior cardiologist experienced in hypertension, chest pain evaluation and long-term heart health management.",
    registration: "Sample Reg. No. TS-0000 (NMC)",
    verification: "approved",
    sampleRating: 4.9,
  },
  {
    id: "d4",
    name: "Dr. Priya Menon",
    email: "priya@demo.in",
    photo: doctor5,
    qualifications: "MBBS, DCH, MD (Paediatrics)",
    specialization: "Pediatrician",
    experience: 10,
    fee: 599,
    languages: ["English", "Malayalam", "Hindi"],
    hospital: "Sample Children's Clinic, Kochi",
    bio: "Paediatrician caring for newborns to teens — growth, vaccinations, nutrition and common childhood illnesses.",
    registration: "Sample Reg. No. KL-0000 (NMC)",
    verification: "approved",
    sampleRating: 4.7,
  },
  {
    id: "d5",
    name: "Dr. Sneha Kulkarni",
    email: "sneha@demo.in",
    photo: doctor1,
    qualifications: "MBBS, MS (Obstetrics & Gynaecology)",
    specialization: "Gynecologist",
    experience: 12,
    fee: 799,
    languages: ["English", "Marathi", "Hindi"],
    hospital: "Sample Women's Hospital, Pune",
    bio: "Gynaecologist supporting women's health, pregnancy care and hormonal concerns.",
    registration: "Sample Reg. No. MH-0000 (NMC)",
    verification: "approved",
    sampleRating: 4.8,
  },
  {
    id: "d6",
    name: "Dr. Arjun Mehta",
    email: "arjun@demo.in",
    photo: doctor2,
    qualifications: "MBBS, MD (Psychiatry)",
    specialization: "Psychiatrist",
    experience: 4,
    fee: 899,
    languages: ["English", "Gujarati"],
    hospital: "Sample Wellness Clinic, Ahmedabad",
    bio: "Psychiatrist — profile under review.",
    registration: "",
    verification: "pending",
    sampleRating: 0,
  },
];

export const defaultAvailability: Record<string, DoctorAvailability> = {
  d1: {
    weekdays: [1, 2, 3, 4, 5, 6],
    slots: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "4:00 PM", "4:30 PM"],
  },
  d2: { weekdays: [1, 3, 5], slots: ["11:00 AM", "11:30 AM", "12:00 PM", "5:00 PM"] },
  d3: { weekdays: [2, 4, 6], slots: ["9:00 AM", "9:30 AM", "6:00 PM", "6:30 PM"] },
  d4: {
    weekdays: [0, 1, 2, 3, 4, 5],
    slots: ["10:00 AM", "10:30 AM", "3:00 PM", "3:30 PM", "4:00 PM"],
  },
  d5: { weekdays: [1, 2, 4, 5], slots: ["12:00 PM", "12:30 PM", "4:00 PM", "4:30 PM"] },
  d6: { weekdays: [], slots: [] },
};

export const specializations = [
  "General Physician",
  "Dermatologist",
  "Cardiologist",
  "Pediatrician",
  "Gynecologist",
  "Psychiatrist",
];
export const allLanguages = [
  "English",
  "Hindi",
  "Bengali",
  "Tamil",
  "Telugu",
  "Malayalam",
  "Marathi",
  "Gujarati",
];

export const toISODate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const formatTime = (d: Date) => {
  const h = d.getHours(),
    m = d.getMinutes();
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

/** Builds seed data relative to "now". Called lazily (never at module scope). */
export function buildSeed() {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    return toISODate(d);
  };
  const soon = new Date(now.getTime() + 5 * 60000);
  soon.setMinutes(Math.ceil(soon.getMinutes() / 5) * 5, 0, 0);
  const iso = now.toISOString();

  const patients: PatientProfile[] = [
    {
      id: "p1",
      fullName: "Aarav Patel",
      email: DEMO_PATIENT_EMAIL,
      mobile: "9800000000",
      password: DEMO_PASSWORD,
      gender: "Male",
      dob: "1994-06-12",
      address: "Sample Street, Mumbai",
    },
    {
      id: "p2",
      fullName: "Meera Nair",
      email: "meera@demo.in",
      mobile: "9800000001",
      password: DEMO_PASSWORD,
    },
  ];
  const appointments: Appointment[] = [
    {
      id: "MED-10421",
      patientId: "p1",
      doctorId: "d1",
      date: toISODate(soon),
      time: formatTime(soon),
      reason: "Recurring headaches",
      symptoms: "Mild headache in the evenings",
      reports: [],
      status: "confirmed",
      payment: "paid",
      paymentMethod: "UPI",
      type: "Video Consultation",
      createdAt: iso,
    },
    {
      id: "MED-10422",
      patientId: "p1",
      doctorId: "d2",
      date: day(3),
      time: "11:30 AM",
      reason: "Skin rash on arms",
      reports: [],
      status: "pending",
      payment: "paid",
      paymentMethod: "Card",
      type: "Video Consultation",
      createdAt: iso,
    },
    {
      id: "MED-10398",
      patientId: "p1",
      doctorId: "d4",
      date: day(-12),
      time: "10:00 AM",
      reason: "Seasonal allergy follow-up",
      reports: [],
      status: "completed",
      payment: "paid",
      paymentMethod: "UPI",
      type: "Video Consultation",
      createdAt: iso,
      summary: "Sample summary: continue current care, review in 4 weeks.",
    },
    {
      id: "MED-10377",
      patientId: "p1",
      doctorId: "d3",
      date: day(-20),
      time: "9:00 AM",
      reason: "Routine BP check",
      reports: [],
      status: "cancelled",
      payment: "refunded",
      type: "Video Consultation",
      createdAt: iso,
    },
    {
      id: "MED-10430",
      patientId: "p2",
      doctorId: "d1",
      date: day(1),
      time: "4:00 PM",
      reason: "Fever for two days",
      symptoms: "Fever, body ache",
      reports: ["temperature-log.pdf"],
      status: "pending",
      payment: "paid",
      paymentMethod: "UPI",
      type: "Video Consultation",
      createdAt: iso,
    },
    {
      id: "MED-10390",
      patientId: "p2",
      doctorId: "d1",
      date: day(-6),
      time: "10:30 AM",
      reason: "Cough and cold",
      reports: [],
      status: "completed",
      payment: "paid",
      type: "Video Consultation",
      createdAt: iso,
      summary: "Sample summary placeholder.",
    },
  ];
  const records: MedicalRecord[] = [
    {
      id: "r1",
      patientId: "p1",
      name: "Prescription – Dr. Priya Menon.pdf",
      category: "Prescriptions",
      fileType: "PDF",
      uploadedAt: day(-12),
    },
    {
      id: "r2",
      patientId: "p1",
      name: "CBC blood test.pdf",
      category: "Lab Reports",
      fileType: "PDF",
      uploadedAt: day(-30),
    },
    {
      id: "r3",
      patientId: "p1",
      name: "Allergy history.jpg",
      category: "Medical History",
      fileType: "JPG",
      uploadedAt: day(-45),
    },
  ];
  const notifications: AppNotification[] = [
    {
      id: "n1",
      userId: "p1",
      title: "Upcoming consultation reminder",
      body: `Your video consultation with Dr. Rahul Sharma starts at ${formatTime(soon)} today.`,
      createdAt: iso,
      read: false,
    },
    {
      id: "n2",
      userId: "p1",
      title: "Appointment successfully booked",
      body: "Your request with Dr. Ananya Iyer is awaiting doctor confirmation.",
      createdAt: iso,
      read: false,
    },
    {
      id: "n3",
      userId: "p1",
      title: "Payment confirmation (test mode)",
      body: "Simulated payment of ₹699 recorded for MED-10422.",
      createdAt: iso,
      read: true,
    },
    {
      id: "n4",
      userId: "p1",
      title: "Consultation completed",
      body: "Your consultation with Dr. Priya Menon is complete.",
      createdAt: iso,
      read: true,
    },
    {
      id: "n5",
      userId: "d1",
      title: "New consultation request",
      body: "Meera Nair requested a consultation.",
      createdAt: iso,
      read: false,
    },
  ];
  return { patients, appointments, records, notifications, availability: defaultAvailability };
}
