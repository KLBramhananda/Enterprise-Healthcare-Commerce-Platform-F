import { useState, useMemo } from "react";
import {
  Bell,
  CheckCheck,
  Package,
  FileText,
  Tag,
  Heart,
  Shield,
  CheckCircle,
  Mail,
  AlertCircle,
} from "lucide-react";
import { Container, Button, EmptyState } from "@/components/ui";
import { Breadcrumb } from "@/components/layout";
import { usePageTitle } from "@/hooks/layout/usePageTitle";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
} from "@/hooks/account";
import { useNotificationStore } from "@/store/notificationStore";
import type { NotificationCategory } from "@/types/account";
import { cn } from "@/utils/cn";

const CATEGORIES: { key: NotificationCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "order", label: "Orders" },
  { key: "prescription", label: "Prescriptions" },
  { key: "promotion", label: "Promotions" },
  { key: "health", label: "Health" },
  { key: "system", label: "System" },
];

const CATEGORY_ICONS: Record<NotificationCategory, typeof Package> = {
  order: Package,
  prescription: FileText,
  promotion: Tag,
  health: Heart,
  system: Shield,
};

const CATEGORY_ICON_BG: Record<NotificationCategory, string> = {
  order: "bg-brand-50 text-brand-600",
  prescription: "bg-info-50 text-info-600",
  promotion: "bg-warning-50 text-warning-600",
  health: "bg-success-50 text-success-600",
  system: "bg-surface-100 text-surface-600",
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffSec = Math.floor((now - then) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWk = Math.floor(diffDay / 7);
  if (diffWk < 4) return `${diffWk}w ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  const diffYr = Math.floor(diffDay / 365);
  return `${diffYr}y ago`;
}

export default function NotificationsPage() {
  usePageTitle("Notifications");

  const [activeCategory, setActiveCategory] = useState<NotificationCategory | "all">("all");

  const { data: allNotifications = [], isLoading, isError, refetch } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const isRead = useNotificationStore((s) => s.isRead);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allNotifications.length };
    for (const n of allNotifications) {
      counts[n.category] = (counts[n.category] || 0) + 1;
    }
    return counts;
  }, [allNotifications]);

  const filteredNotifications = useMemo(() => {
    if (activeCategory === "all") return allNotifications;
    return allNotifications.filter((n) => n.category === activeCategory);
  }, [allNotifications, activeCategory]);

  const isNotificationRead = (id: string, serverRead: boolean) => {
    return isRead(id) || serverRead;
  };

  return (
    <div className="bg-surface-50 pb-12">
      <Container>
        <Breadcrumb items={[{ label: "Home", path: "/" }, { label: "Notifications" }]} />

        <div className="mt-6 flex flex-col gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Bell size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-surface-900">Notifications</h1>
                <p className="text-sm text-surface-500">
                  {unreadCount > 0
                    ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                    : "All caught up"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
              >
                <CheckCheck size={16} className="mr-1.5" />
                Mark all as read
              </Button>
            )}
          </div>

          <div className="flex gap-1 overflow-x-auto rounded-xl border border-surface-200 bg-surface-0 p-1">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.key] || 0;
              const isActive = activeCategory === cat.key;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key as NotificationCategory | "all")}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-brand-600 text-white shadow-sm"
                      : "text-surface-600 hover:bg-surface-100 hover:text-surface-900",
                  )}
                >
                  {cat.label}
                  {count > 0 && (
                    <span
                      className={cn(
                        "ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-semibold",
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-surface-100 text-surface-600",
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl border border-surface-200 bg-surface-0 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-surface-200" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/3 rounded bg-surface-200" />
                      <div className="h-3 w-2/3 rounded bg-surface-100" />
                      <div className="h-3 w-1/4 rounded bg-surface-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-danger-200 bg-danger-50 p-12 text-center">
              <AlertCircle size={40} className="text-danger-400" />
              <h2 className="mt-4 text-lg font-semibold text-surface-900">
                Failed to load notifications
              </h2>
              <p className="mt-1 max-w-sm text-sm text-surface-500">
                We couldn't fetch your notifications. Please check your connection and try again.
              </p>
              <Button onClick={() => refetch()} className="mt-5">
                Try again
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              title="No notifications"
              description={`You have no ${activeCategory === "all" ? "" : activeCategory + " "}notifications yet.`}
              action={<Mail size={24} className="text-surface-300" />}
            />
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const read = isNotificationRead(notification.id, notification.read);
                const Icon = CATEGORY_ICONS[notification.category];

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "rounded-xl border border-surface-200 bg-surface-0 p-4 transition-all hover:shadow-sm",
                      !read && "border-l-4 border-l-brand-600 bg-brand-50/30",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center",
                          CATEGORY_ICON_BG[notification.category],
                        )}
                      >
                        <Icon size={18} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h3
                                className={cn(
                                  "text-sm leading-snug",
                                  read
                                    ? "font-medium text-surface-700"
                                    : "font-semibold text-surface-900",
                                )}
                              >
                                {notification.title}
                              </h3>
                              {!read && (
                                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand-600" />
                              )}
                            </div>
                            <p className="mt-1 text-sm text-surface-500 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>

                          <span className="flex-shrink-0 text-xs text-surface-400">
                            {formatRelativeTime(notification.createdAt)}
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          {notification.actionUrl && (
                            <a
                              href={notification.actionUrl}
                              className="text-sm font-medium text-brand-600 hover:text-brand-700 hover:underline"
                            >
                              View details
                            </a>
                          )}
                          {!read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsRead.mutate(notification.id)}
                              disabled={markAsRead.isPending}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Mark as read
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
