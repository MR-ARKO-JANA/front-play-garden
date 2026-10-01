import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMedergency } from "@/lib/medergency/store";
import { Panel } from "./ui";

export function NotificationList({ userId }: { userId: string }) {
  const { notifications, markRead, markAllRead, clearNotifications } = useMedergency();
  const mine = notifications.filter((n) => n.userId === userId);
  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={!mine.some((n) => !n.read)}
          onClick={() => markAllRead(userId)}
        >
          <Check size={14} />
          Mark all as read
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive"
          disabled={!mine.length}
          onClick={() => clearNotifications(userId)}
        >
          Clear all
        </Button>
      </div>
      <div className="grid gap-2">
        {mine.length === 0 && (
          <Panel>
            <p className="text-sm text-muted-foreground">You're all caught up.</p>
          </Panel>
        )}
        {mine.map((n) => (
          <Panel
            key={n.id}
            className={`flex gap-3 !p-3 ${n.read ? "" : "border-primary/40 bg-secondary/40"}`}
          >
            <span
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${n.read ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
            >
              <Bell size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground">
                {n.title}
                {!n.read && <span className="ml-2 text-[11px] font-medium text-primary">New</span>}
              </p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {new Date(n.createdAt).toLocaleString("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            </div>
            {!n.read && (
              <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>
                Mark read
              </Button>
            )}
          </Panel>
        ))}
      </div>
    </div>
  );
}
