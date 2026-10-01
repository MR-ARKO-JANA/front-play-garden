import { createFileRoute } from "@tanstack/react-router";
import { NotificationList } from "@/components/medergency/NotificationList";
import { PageTitle } from "@/components/medergency/ui";
import { useMedergency } from "@/lib/medergency/store";

export const Route = createFileRoute("/patient/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications | Medergency" },
      { name: "description", content: "Booking, payment and consultation updates." },
      { property: "og:title", content: "Notifications | Medergency" },
      { property: "og:description", content: "Your Medergency updates." },
    ],
  }),
  component: function NotificationsRoute() {
    const { session } = useMedergency();
    return (
      <div>
        <PageTitle
          title="Notifications"
          subtitle="Sample notifications — no real notification service is connected yet."
        />
        <NotificationList userId={session!.userId} />
      </div>
    );
  },
});
