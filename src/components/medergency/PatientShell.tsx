import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  FolderHeart,
  Home,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  Stethoscope,
  UserRound,
  Video,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useMedergency } from "@/lib/medergency/store";
import { Brand } from "./ui";

const side = [
  { to: "/patient", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/patient/doctors", label: "Find Doctors", icon: Stethoscope },
  { to: "/patient/appointments", label: "My Appointments", icon: CalendarDays },
  { to: "/patient/consultations", label: "Consultations", icon: Video },
  { to: "/patient/records", label: "Medical Records", icon: FolderHeart },
  { to: "/patient/notifications", label: "Notifications", icon: Bell },
  { to: "/patient/profile", label: "My Profile", icon: UserRound },
  { to: "/patient/settings", label: "Settings", icon: Settings },
] as const;
const bottom = [
  { to: "/patient", label: "Home", icon: Home, exact: true },
  { to: "/patient/doctors", label: "Doctors", icon: Stethoscope },
  { to: "/patient/appointments", label: "Appointments", icon: ClipboardList },
  { to: "/patient/records", label: "Records", icon: FolderHeart },
  { to: "/patient/profile", label: "Profile", icon: UserRound },
] as const;

export function useSignOut() {
  const { logout } = useMedergency();
  const navigate = useNavigate();
  return () => {
    logout();
    navigate({ to: "/", replace: true });
  };
}

export function PatientShell({ children }: { children: ReactNode }) {
  const { currentPatient, notifications, session } = useMedergency();
  const navigate = useNavigate();
  const signOut = useSignOut();
  const [q, setQ] = useState("");
  const unread = notifications.filter((n) => n.userId === session?.userId && !n.read).length;
  const initials = (currentPatient?.fullName ?? "P")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Brand compact />
          <form
            className="relative mx-auto hidden max-w-md flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/patient/doctors", search: { q } });
            }}
          >
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search doctors, specialties..."
              className="pl-9"
              aria-label="Search doctors"
            />
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link
              to="/patient/notifications"
              className="icon-button"
              aria-label={`Notifications, ${unread} unread`}
            >
              <Bell size={19} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-secondary">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {initials}
                </span>
                <span className="hidden text-sm font-medium text-foreground sm:inline">
                  {currentPatient?.fullName}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="truncate">{currentPatient?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => navigate({ to: "/patient/profile" })}>
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => navigate({ to: "/patient/settings" })}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut} className="text-destructive">
                  <LogOut size={15} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-24 pt-5 lg:pb-10">
        <aside className="sticky top-21 hidden h-fit w-56 shrink-0 lg:block">
          <nav className="flex flex-col gap-1 rounded-xl border bg-card p-2">
            {side.map(({ to, label, icon: Icon, ...rest }) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: "exact" in rest }}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                activeProps={{ className: "bg-secondary text-secondary-foreground" }}
              >
                <Icon size={17} />
                {label}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </nav>
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t bg-card lg:hidden">
        {bottom.map(({ to, label, icon: Icon, ...rest }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: "exact" in rest }}
            className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-muted-foreground"
            activeProps={{ className: "text-primary" }}
          >
            <Icon size={20} />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
