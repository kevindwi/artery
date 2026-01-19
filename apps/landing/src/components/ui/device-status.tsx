import { cn } from "@/lib/utils";
import { Badge } from "./badge";

export type StatusVariant = "online" | "offline";

const statusStyles: Record<StatusVariant, { badge: string; dot: string }> = {
  online: {
    badge:
      "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-transparent",
    dot: "bg-emerald-500",
  },
  offline: {
    badge:
      "bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 border-transparent",
    dot: "bg-muted-foreground",
  },
};

function DeviceStatus({
  status,
  variant = "offline",
}: {
  status: string;
  variant?: StatusVariant;
}) {
  const styles = statusStyles[variant];
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.https://ui.shadcn.com/5 rounded-full", styles.badge)}
    >
      <span
        className={cn("size-1.5 rounded-full", styles.dot)}
        aria-hidden="true"
      />
      {status}
    </Badge>
  );
}

export { DeviceStatus, statusStyles };
