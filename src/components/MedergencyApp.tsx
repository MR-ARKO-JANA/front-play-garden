import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleUserRound,
  Clock3,
  Eye,
  EyeOff,
  FileBadge2,
  FileText,
  Home,
  IndianRupee,
  Languages,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Phone,
  ShieldCheck,
  Stethoscope,
  Upload,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import doctorPortrait from "../assets/doctor-portrait.png";

type FormState = Record<string, string>;

const stepLabels = ["Sign Up", "Details", "Documents", "Verification", "Approved", "Go Live"];

function BrandLogo({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div className={`brand-lockup ${inverse ? "brand-lockup-inverse" : ""}`}>
      <div className="brand-mark" aria-hidden="true">
        <span>M</span>
        <i />
      </div>
      <div>
        <strong className={compact ? "text-sm" : "text-lg"}>Medergency</strong>
        {!compact && <small>Life Deserves Care</small>}
      </div>
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "light";
}) {
  return (
    <button
      type="button"
      className={`primary-button ${variant === "light" ? "primary-button-light" : ""}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
  required = true,
  error,
  right,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  type?: string;
  icon?: ReactNode;
  required?: boolean;
  error?: boolean;
  right?: ReactNode;
}) {
  return (
    <label className="field-label">
      <span>
        {label}
        {!required && <em> (Optional)</em>}
      </span>
      <div className={`field-shell ${error ? "field-error" : ""}`}>
        {icon && <span className="field-icon">{icon}</span>}
        <input
          name={name}
          type={type}
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          placeholder={placeholder}
          aria-invalid={error}
        />
        {right}
      </div>
      {error && <small className="error-copy">This field is required</small>}
    </label>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  options: string[];
  error?: boolean;
}) {
  return (
    <label className="field-label">
      <span>{label}</span>
      <div className={`field-shell ${error ? "field-error" : ""}`}>
        <select
          value={value}
          onChange={(event) => onChange(name, event.target.value)}
          aria-invalid={error}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
        <ChevronDown className="select-icon" size={16} />
      </div>
      {error && <small className="error-copy">Please make a selection</small>}
    </label>
  );
}

function ScreenHeading({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}) {
  return (
    <div className="screen-heading">
      {icon && <div className="heading-icon">{icon}</div>}
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}

function AppHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="app-header">
      {step > 0 && step < 12 ? (
        <button type="button" className="icon-button" onClick={onBack} aria-label="Go back">
          <ArrowLeft size={20} />
        </button>
      ) : (
        <span className="icon-spacer" />
      )}
      <BrandLogo compact />
      <span className="icon-spacer" />
    </header>
  );
}

function StepProgress({ step }: { step: number }) {
  const mapped =
    step <= 2 ? 0 : step <= 6 ? 1 : step <= 9 ? 2 : step <= 11 ? 3 : step === 12 ? 4 : 5;
  return (
    <div className="progress-strip" aria-label={`Progress: ${stepLabels[mapped]}`}>
      {stepLabels.map((label, index) => (
        <div key={label} className={`progress-node ${index <= mapped ? "active" : ""}`}>
          <span>{index < mapped ? <Check size={11} /> : index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}

function FormScreen({
  children,
  title,
  subtitle,
  onNext,
  action = "Next",
  canContinue = true,
  submitted = false,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  onNext: () => void;
  action?: string;
  canContinue?: boolean;
  submitted?: boolean;
}) {
  return (
    <div className="form-screen">
      <ScreenHeading title={title} subtitle={subtitle} />
      <div className="form-stack">{children}</div>
      {!canContinue && submitted && (
        <p className="form-message">Please complete all required information.</p>
      )}
      <div className="sticky-action">
        <PrimaryButton onClick={onNext}>{action}</PrimaryButton>
      </div>
    </div>
  );
}

function ChoiceChips({
  values,
  selected,
  onChange,
  multiple = false,
}: {
  values: string[];
  selected: string[];
  onChange: (values: string[]) => void;
  multiple?: boolean;
}) {
  const toggle = (value: string) => {
    if (!multiple) return onChange([value]);
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value],
    );
  };
  return (
    <div className="chip-row">
      {values.map((value) => (
        <button
          type="button"
          key={value}
          className={`choice-chip ${selected.includes(value) ? "selected" : ""}`}
          onClick={() => toggle(value)}
        >
          {value}
        </button>
      ))}
    </div>
  );
}

function UploadRow({
  title,
  optional = false,
  file,
  onUpload,
}: {
  title: string;
  optional?: boolean;
  file?: string | undefined;
  onUpload: (name: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="upload-row">
      <FileText size={20} />
      <div className="upload-copy">
        <strong>{title}</strong>
        <small className={optional ? "optional" : "required"}>
          {file || (optional ? "Optional" : "Required")}
        </small>
      </div>
      <input
        ref={ref}
        type="file"
        className="sr-only"
        accept="image/*,.pdf"
        onChange={(event) => {
          const nextFile = event.target.files?.[0];
          if (nextFile) onUpload(nextFile.name);
        }}
      />
      <button type="button" className="upload-button" onClick={() => ref.current?.click()}>
        {file ? <Check size={14} /> : <Upload size={14} />} {file ? "Done" : "Upload"}
      </button>
    </div>
  );
}

function WelcomeScreen({
  onNext,
  onLogin,
}: {
  onNext: () => void;
  onLogin?: (() => void) | undefined;
}) {
  return (
    <div className="welcome-screen">
      <BrandLogo />
      <div className="welcome-copy">
        <h1>
          Join Medergency
          <br />
          as a Doctor
        </h1>
        <p>Be a part of a trusted healthcare platform and make a real impact.</p>
      </div>
      <div className="portrait-glow">
        <img src={doctorPortrait} width={768} height={1024} alt="A professional female doctor" />
      </div>
      <div className="welcome-actions">
        <PrimaryButton onClick={onNext}>Create Account</PrimaryButton>
        <p>
          Already have an account?{" "}
          <button type="button" onClick={onLogin ?? onNext}>
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}

function VerificationScreen({ onNext }: { onNext: () => void }) {
  const items = [
    "Identity Verification",
    "Medical Registration Verification",
    "Qualification Verification",
    "Document Verification",
    "Blacklist / Status Check",
  ];
  const [completed, setCompleted] = useState(4);
  useEffect(() => {
    const timer = window.setTimeout(() => setCompleted(5), 2200);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <div className="status-screen">
      <div className="status-clock">
        <Clock3 size={38} />
      </div>
      <ScreenHeading
        title={completed === 5 ? "Verification Complete" : "Verification in Progress"}
        subtitle={
          completed === 5
            ? "All checks have been completed successfully."
            : "Your documents are under review. This usually takes 1–3 working days."
        }
      />
      <div className="checklist">
        {items.map((item, index) => (
          <div className="check-row" key={item}>
            <CheckCircle2 className={index < completed ? "complete" : "pending"} size={19} />
            <span>{item}</span>
            <small>{index < completed ? "Completed" : "Pending"}</small>
          </div>
        ))}
      </div>
      <div className="notice">
        {completed === 5
          ? "Your approval is ready to view."
          : "You will be notified once the verification is completed."}
      </div>
      <div className="sticky-action">
        <PrimaryButton disabled={completed < 5} onClick={onNext}>
          View Approval
        </PrimaryButton>
      </div>
    </div>
  );
}

function VerifiedScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="verified-screen">
      <BrandLogo inverse />
      <div className="verified-center">
        <div className="success-orbit">
          <Check size={42} />
        </div>
        <h1>Doctor Verified!</h1>
        <h2>Welcome to Medergency!</h2>
        <p>
          Your profile has been successfully verified. You can now start accepting consultations and
          helping patients.
        </p>
      </div>
      <PrimaryButton variant="light" onClick={onNext}>
        Go to Dashboard
      </PrimaryButton>
    </div>
  );
}

function DashboardScreen() {
  const [active, setActive] = useState("Home");
  const nav = [
    ["Consultation Requests", UsersRound],
    ["My Schedule", CalendarDays],
    ["Earnings", IndianRupee],
    ["Profile Settings", CircleUserRound],
  ] as const;
  return (
    <div className="dashboard-screen">
      <header className="dashboard-header">
        <BrandLogo compact />
        <button type="button" className="icon-button" aria-label="Notifications">
          <Bell size={19} />
          <i />
        </button>
      </header>
      <div className="profile-card">
        <div className="profile-top">
          <img
            src={doctorPortrait}
            width={768}
            height={1024}
            alt="Sample doctor profile"
            loading="lazy"
          />
          <div>
            <div className="verified-name">
              <h1>Dr. Rahul Sharma</h1>
              <ShieldCheck size={16} />
            </div>
            <p>MBBS, MD · General Medicine</p>
            <span className="registration">REG: SAMPLE-2026 · NMC</span>
          </div>
        </div>
        <div className="profile-stats">
          <div>
            <strong>8 yrs</strong>
            <small>Experience</small>
          </div>
          <div>
            <strong>English</strong>
            <small>Hindi, Bengali</small>
          </div>
          <div>
            <strong>4.9</strong>
            <small>Rating</small>
          </div>
        </div>
        <div className="availability">
          <span>Today's Availability</span>
          <strong>10:00 AM – 6:00 PM</strong>
          <em>Available</em>
        </div>
      </div>
      {active !== "Home" && (
        <div className="active-panel">
          <strong>{active}</strong>
          <p>Your {active.toLowerCase()} overview is ready.</p>
        </div>
      )}
      <nav className="dashboard-list">
        {nav.map(([label, Icon], index) => (
          <button type="button" key={label} onClick={() => setActive(label)}>
            <Icon size={19} />
            <span>{label}</span>
            {index === 0 && <b>3</b>}
            <ChevronRight size={17} />
          </button>
        ))}
      </nav>
      <nav className="bottom-nav">
        {[
          ["Home", Home],
          ["Consultations", Stethoscope],
          ["Profile", UserRound],
        ].map(([label, Icon]) => {
          const NavIcon = Icon as typeof Home;
          return (
            <button
              type="button"
              key={label as string}
              className={active === label ? "active" : ""}
              onClick={() => setActive(label as string)}
            >
              <NavIcon size={19} />
              <small>{label as string}</small>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

export function MedergencyApp({
  onFinish,
  onLogin,
}: { onFinish?: (email?: string, password?: string) => void; onLogin?: () => void } = {}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>({});
  const [submitted, setSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [gender, setGender] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>(["English"]);
  const [identity, setIdentity] = useState("Aadhaar Card");
  const [declarations, setDeclarations] = useState<boolean[]>([false, false, false]);
  const [files, setFiles] = useState<Record<string, string>>({});
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const update = (name: string, value: string) =>
    setForm((current) => ({ ...current, [name]: value }));
  const goNext = () => {
    setSubmitted(false);
    setStep((current) => Math.min(13, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const goBack = () => {
    setSubmitted(false);
    setStep((current) => Math.max(0, current - 1));
  };
  const requireFields = (fields: string[], extra = true) => {
    setSubmitted(true);
    if (fields.every((field) => Boolean(form[field]?.trim())) && extra) goNext();
  };
  const missing = (name: string) => submitted && !form[name]?.trim();
  const setFile = (name: string, fileName: string) =>
    setFiles((current) => ({ ...current, [name]: fileName }));

  const otpChange = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, "").slice(-1);
    update(`otp${index}`, value);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  let content: ReactNode;
  if (step === 0) content = <WelcomeScreen onNext={goNext} onLogin={onLogin} />;
  else if (step === 1)
    content = (
      <FormScreen
        title="Create Your Account"
        subtitle="Please provide your basic details."
        onNext={() => requireFields(["fullName", "mobile", "email", "password"])}
        canContinue={["fullName", "mobile", "email", "password"].every((key) => Boolean(form[key]))}
        submitted={submitted}
      >
        <Field
          label="Full Name"
          name="fullName"
          value={form["fullName"] || ""}
          onChange={update}
          placeholder="Enter your full name"
          icon={<UserRound size={17} />}
          error={missing("fullName")}
        />
        <Field
          label="Mobile Number"
          name="mobile"
          value={form["mobile"] || ""}
          onChange={update}
          placeholder="+91 98765 43210"
          type="tel"
          icon={<Phone size={17} />}
          error={missing("mobile")}
        />
        <Field
          label="Email Address"
          name="email"
          value={form["email"] || ""}
          onChange={update}
          placeholder="you@domain.com"
          type="email"
          icon={<Mail size={17} />}
          error={missing("email")}
        />
        <Field
          label="Create Password"
          name="password"
          value={form["password"] || ""}
          onChange={update}
          placeholder="Min. 8 characters"
          type={showPassword ? "text" : "password"}
          icon={<LockKeyhole size={17} />}
          error={missing("password")}
          right={
            <button
              type="button"
              className="field-action"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />
        <p className="legal-copy">
          By creating an account, you agree to our <b>Terms & Conditions</b> and{" "}
          <b>Privacy Policy</b>.
        </p>
      </FormScreen>
    );
  else if (step === 2)
    content = (
      <FormScreen
        title="Verify Your Mobile Number"
        subtitle="We have sent a 6-digit OTP to +91 98765 43210."
        action="Verify"
        onNext={() => requireFields(["otp0", "otp1", "otp2", "otp3", "otp4", "otp5"])}
        canContinue={[0, 1, 2, 3, 4, 5].every((i) => Boolean(form[`otp${i}`]))}
        submitted={submitted}
      >
        <div className="otp-row">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <input
              key={index}
              ref={(node) => {
                otpRefs.current[index] = node;
              }}
              value={form[`otp${index}`] || ""}
              onChange={(event) => otpChange(index, event)}
              inputMode="numeric"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>
        <button type="button" className="resend-button">
          Resend OTP <span>(00:45)</span>
        </button>
      </FormScreen>
    );
  else if (step === 3)
    content = (
      <FormScreen
        title="Personal Information"
        subtitle="Tell us about yourself."
        onNext={() => requireFields(["dob", "address", "city"], gender.length > 0)}
        submitted={submitted}
      >
        <Field
          label="Date of Birth"
          name="dob"
          value={form["dob"] || ""}
          onChange={update}
          type="date"
          icon={<CalendarDays size={17} />}
          error={missing("dob")}
        />
        <div className="field-label">
          <span>Gender</span>
          <ChoiceChips
            values={["Male", "Female", "Other"]}
            selected={gender}
            onChange={setGender}
          />
          {submitted && gender.length === 0 && (
            <small className="error-copy">Please make a selection</small>
          )}
        </div>
        <Field
          label="Current Address"
          name="address"
          value={form["address"] || ""}
          onChange={update}
          placeholder="Enter your address"
          icon={<MapPin size={17} />}
          error={missing("address")}
        />
        <SelectField
          label="City"
          name="city"
          value={form["city"] || ""}
          onChange={update}
          options={["Kolkata", "Mumbai", "New Delhi", "Bengaluru", "Chennai"]}
          error={missing("city")}
        />
      </FormScreen>
    );
  else if (step === 4)
    content = (
      <FormScreen
        title="Medical Registration"
        subtitle="Enter registration details as per your Medical Council."
        onNext={() => requireFields(["council", "registration", "state", "registrationDate"])}
        submitted={submitted}
      >
        <SelectField
          label="Medical Council / Authority"
          name="council"
          value={form["council"] || ""}
          onChange={update}
          options={[
            "National Medical Commission",
            "West Bengal Medical Council",
            "Maharashtra Medical Council",
          ]}
          error={missing("council")}
        />
        <Field
          label="Registration Number"
          name="registration"
          value={form["registration"] || ""}
          onChange={update}
          placeholder="Enter registration number"
          icon={<FileBadge2 size={17} />}
          error={missing("registration")}
        />
        <SelectField
          label="Registration State"
          name="state"
          value={form["state"] || ""}
          onChange={update}
          options={["West Bengal", "Maharashtra", "Delhi", "Karnataka"]}
          error={missing("state")}
        />
        <Field
          label="Registration Date"
          name="registrationDate"
          value={form["registrationDate"] || ""}
          onChange={update}
          type="date"
          icon={<CalendarDays size={17} />}
          error={missing("registrationDate")}
        />
      </FormScreen>
    );
  else if (step === 5)
    content = (
      <FormScreen
        title="Education & Qualification"
        subtitle="Add your medical qualifications."
        onNext={() => requireFields(["qualification", "college", "year"], Boolean(files["degree"]))}
        submitted={submitted}
      >
        <SelectField
          label="Primary Qualification"
          name="qualification"
          value={form["qualification"] || ""}
          onChange={update}
          options={["MBBS", "BDS", "BAMS", "BHMS"]}
          error={missing("qualification")}
        />
        <Field
          label="Medical College"
          name="college"
          value={form["college"] || ""}
          onChange={update}
          placeholder="Enter medical college"
          error={missing("college")}
        />
        <Field
          label="Year of Completion"
          name="year"
          value={form["year"] || ""}
          onChange={update}
          type="number"
          placeholder="2018"
          error={missing("year")}
        />
        <UploadRow
          title="Degree Certificate"
          file={files["degree"]}
          onUpload={(name) => setFile("degree", name)}
        />
        <SelectField
          label="Post Graduate Qualification (Optional)"
          name="postgrad"
          value={form["postgrad"] || ""}
          onChange={update}
          options={["MD", "MS", "DNB", "Diploma"]}
        />
      </FormScreen>
    );
  else if (step === 6)
    content = (
      <FormScreen
        title="Specialization"
        subtitle="Select your area of expertise."
        onNext={() => requireFields(["specialization", "experience"], languages.length > 0)}
        submitted={submitted}
      >
        <SelectField
          label="Specialization"
          name="specialization"
          value={form["specialization"] || ""}
          onChange={update}
          options={["General Medicine", "Cardiology", "Dermatology", "Pediatrics"]}
          error={missing("specialization")}
        />
        <SelectField
          label="Years of Experience"
          name="experience"
          value={form["experience"] || ""}
          onChange={update}
          options={["0–2 Years", "3–5 Years", "6–10 Years", "10+ Years"]}
          error={missing("experience")}
        />
        <div className="field-label">
          <span>Languages Spoken</span>
          <ChoiceChips
            values={["English", "Hindi", "Bengali", "+ Add"]}
            selected={languages}
            onChange={setLanguages}
            multiple
          />
        </div>
      </FormScreen>
    );
  else if (step === 7)
    content = (
      <FormScreen
        title="Identity Verification"
        subtitle="Upload your government ID proof."
        onNext={() => {
          setSubmitted(true);
          if (files["identity"]) goNext();
        }}
        submitted={submitted}
      >
        <div className="document-options">
          {["Aadhaar Card", "PAN Card", "Passport"].map((item) => (
            <button
              type="button"
              key={item}
              className={identity === item ? "selected" : ""}
              onClick={() => setIdentity(item)}
            >
              <FileText size={18} />
              <span>{item}</span>
              <i>{identity === item && <Check size={12} />}</i>
            </button>
          ))}
        </div>
        <label className="drop-zone">
          <Upload size={24} />
          <strong>Tap to upload or drag and drop</strong>
          <small>JPG, PNG, PDF · Max 5 MB</small>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) setFile("identity", file.name);
            }}
          />
          {files["identity"] && (
            <em>
              <Check size={13} /> {files["identity"]}
            </em>
          )}
        </label>
      </FormScreen>
    );
  else if (step === 8)
    content = (
      <FormScreen
        title="Document Upload"
        subtitle="Upload the following documents."
        onNext={() => {
          setSubmitted(true);
          if (["registrationDoc", "mbbs", "photo", "signature"].every((key) => files[key]))
            goNext();
        }}
        submitted={submitted}
      >
        <UploadRow
          title="Medical Registration Certificate"
          file={files["registrationDoc"]}
          onUpload={(name) => setFile("registrationDoc", name)}
        />
        <UploadRow
          title="MBBS Degree Certificate"
          file={files["mbbs"]}
          onUpload={(name) => setFile("mbbs", name)}
        />
        <UploadRow
          title="PG Degree Certificate"
          optional
          file={files["pg"]}
          onUpload={(name) => setFile("pg", name)}
        />
        <UploadRow
          title="Professional Photo"
          file={files["photo"]}
          onUpload={(name) => setFile("photo", name)}
        />
        <UploadRow
          title="Signature Sample"
          file={files["signature"]}
          onUpload={(name) => setFile("signature", name)}
        />
      </FormScreen>
    );
  else if (step === 9)
    content = (
      <FormScreen
        title="Professional Profile"
        subtitle="Complete your professional profile."
        onNext={() => requireFields(["hospital", "professionalAddress", "availability"])}
        submitted={submitted}
      >
        <Field
          label="Hospital / Clinic Affiliation"
          name="hospital"
          value={form["hospital"] || ""}
          onChange={update}
          placeholder="Apollo Hospital"
          error={missing("hospital")}
        />
        <Field
          label="Professional Address"
          name="professionalAddress"
          value={form["professionalAddress"] || ""}
          onChange={update}
          placeholder="Kolkata, West Bengal"
          icon={<MapPin size={17} />}
          error={missing("professionalAddress")}
        />
        <div className="field-label">
          <span>Consultation Languages</span>
          <ChoiceChips
            values={["English", "Hindi", "Bengali"]}
            selected={languages}
            onChange={setLanguages}
            multiple
          />
        </div>
        <SelectField
          label="Availability"
          name="availability"
          value={form["availability"] || ""}
          onChange={update}
          options={[
            "Mon–Fri, 10:00 AM – 6:00 PM",
            "Weekends, 9:00 AM – 1:00 PM",
            "Custom schedule",
          ]}
          error={missing("availability")}
        />
      </FormScreen>
    );
  else if (step === 10)
    content = (
      <FormScreen
        title="Declaration"
        subtitle="I confirm that:"
        action="Submit"
        onNext={() => {
          setSubmitted(true);
          if (declarations.every(Boolean)) goNext();
        }}
        canContinue={declarations.every(Boolean)}
        submitted={submitted}
      >
        <div className="declaration-list">
          {[
            "I am a duly registered medical practitioner and the information and documents submitted by me are genuine and current.",
            "I agree to provide telemedicine consultations as per NMC guidelines, professional ethics, and applicable laws.",
            "I understand that Medergency may suspend or terminate my account if any information is found to be invalid, fraudulent, expired or misleading.",
          ].map((copy, index) => (
            <label key={copy}>
              <input
                type="checkbox"
                checked={declarations[index]}
                onChange={() =>
                  setDeclarations((items) =>
                    items.map((item, itemIndex) => (itemIndex === index ? !item : item)),
                  )
                }
              />
              <span>
                <Check size={12} />
              </span>
              <p>{copy}</p>
            </label>
          ))}
        </div>
      </FormScreen>
    );
  else if (step === 11) content = <VerificationScreen onNext={goNext} />;
  else if (step === 12)
    content = (
      <VerifiedScreen
        onNext={onFinish ? () => onFinish(form["email"], form["password"]) : goNext}
      />
    );
  else content = <DashboardScreen />;

  return (
    <main className="app-stage">
      <div className={`phone-app ${step === 12 ? "phone-app-verified" : ""}`}>
        {step > 0 && step < 12 && (
          <>
            <AppHeader step={step} onBack={goBack} />
            <StepProgress step={step} />
          </>
        )}
        {content}
      </div>
    </main>
  );
}
