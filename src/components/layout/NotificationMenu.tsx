/**
 * NotificationMenu
 *
 * Notification dropdown for the commerce header.
 * - Desktop (sm+): absolute dropdown anchored to the bell icon.
 * - Mobile (<sm): opens a right-side Drawer via React Portal.
 *
 * Displays real notifications from useNotifications() with unread count,
 * recent notification items (max 7), mark-all-as-read, per-item mark-as-read
 * via explicit button, and a "View all" navigation action.
 */

import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Clock,
  FileText,
  Heart,
  Package,
  Shield,
  Tag,
} from "lucide-react";
import { Drawer, Popover } from "@/components/ui";
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
} from "@/hooks/account";
import { useNotificationStore } from "@/store/notificationStore";
import type { Notification, NotificationCategory } from "@/types/account";
import { cn } from "@/utils/cn";
import type { RefObject } from "react";

interface NotificationMenuProps {
  isOpen: boolean;
  onClose: () => void;
  /** Anchor element (the header bell button) for the desktop popover. */
  anchorRef?: RefObject<HTMLButtonElement | null>;
}

const CATEGORY_ICONS: Record<NotificationCategory, typeof Package> = {
  order: Package,
  prescription: FileText,
  promotion: Tag,
  health: Heart,
  system: Shield,
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  order: "bg-brand-50 text-brand-600",
  prescription: "bg-info-50 text-info-600",
  promotion: "bg-warning-50 text-warning-600",
  health: "bg-success-50 text-success-600",
  system: "bg-surface-100 text-surface-600",
};

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  return `${day}d ago`;
}

/* ── Loading skeleton ── */

function DropdownSkeleton() {
  return (
    <div className="divide-y divide-surface-100">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-start gap-3 px-4 py-3">
          <div className="mt-0.5 h-7 w-7 shrink-0 animate-pulse rounded-full bg-surface-200" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-1/2 animate-pulse rounded bg-surface-200" />
            <div className="h-3 w-3/4 animate-pulse rounded bg-surface-100" />
          </div>
          <div className="h-3 w-8 shrink-0 animate-pulse rounded bg-surface-100" />
        </div>
      ))}
    </div>
  );
}

/* ── Notification item ── */

function NotificationItem({
  notification,
  isRead,
  onMarkRead,
}: {
  notification: Notification;
  isRead: boolean;
  onMarkRead: (id: string) => void;
}) {
  const Icon = CATEGORY_ICONS[notification.category];
  return (
    <div
      className={cn(
        "group relative flex items-start gap-2.5 px-4 py-2.5 transition-colors",
        "hover:bg-surface-50 focus-within:bg-surface-50",
        !isRead && "bg-brand-50/30",
      )}
      tabIndex={0}
    >
      <div
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
          CATEGORY_COLORS[notification.category],
        )}
      >
        <Icon size={13} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <h4
            className={cn(
              "text-xs leading-snug",
              isRead ? "font-medium text-surface-600" : "font-semibold text-surface-900",
            )}
          >
            {notification.title}
          </h4>
          {!isRead && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600"
              aria-label="Unread"
            />
          )}
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-surface-400 line-clamp-1">
          {notification.message}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span className="flex items-center gap-0.5 text-[10px] text-surface-300">
          <Clock size={9} />
          {formatRelativeTime(notification.createdAt)}
        </span>
        {!isRead && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onMarkRead(notification.id);
            }}
            className="text-[10px] font-medium text-brand-600 opacity-0 transition-opacity hover:text-brand-700 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
            aria-label={`Mark "${notification.title}" as read`}
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Main component ── */

export default function NotificationMenu({
  isOpen,
  onClose,
  anchorRef,
}: NotificationMenuProps) {
  const navigate = useNavigate();
  const { data: unreadCount = 0 } = useUnreadNotificationCount();
  const { data: allNotifications = [], isLoading } = useNotifications();
  const readIds = useNotificationStore((s) => s.readIds);
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const markAsRead = useMarkNotificationAsRead();

  // Show max 7 recent notifications in the dropdown preview
  const recentNotifications = allNotifications
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 7);

  // onClose() triggers a state update that unmounts this component.
  // If navigate() is called in the same synchronous block, the component
  // unmounts before React Router can process the navigation.
  // Deferring navigate() to the next microtask ensures the route change
  // completes after the component's close cycle.
  const viewAll = () => {
    onClose();
    setTimeout(() => navigate("/notifications"), 0);
  };

  const handleMarkRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllRead = () => {
    markAllAsRead.mutate();
  };

  /* ── Dropdown content (shared between desktop + mobile) ── */

  const dropdownContent = (
    <>
      {/* Notification list */}
      {isLoading ? (
        <DropdownSkeleton />
      ) : recentNotifications.length > 0 ? (
        <div className="max-h-80 overflow-y-auto overscroll-contain">
          <div className="divide-y divide-surface-100">
            {recentNotifications.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                isRead={readIds.has(n.id) || n.read}
                onMarkRead={handleMarkRead}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-8 text-center">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-100">
            <Bell size={18} className="text-surface-400" />
          </div>
          <p className="mt-2 text-sm font-medium text-surface-700">No notifications</p>
          <p className="mt-0.5 text-xs text-surface-400">
            Order updates and offers will appear here
          </p>
        </div>
      )}

      {/* View all */}
      {recentNotifications.length > 0 && (
        <div className="border-t border-surface-100 px-4 py-2.5">
          <button
            type="button"
            onClick={viewAll}
            className="w-full rounded-lg px-3 py-2 text-center text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
          >
            View all notifications
          </button>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* ── Desktop popover (sm+) ── */}
      <Popover
        open={isOpen}
        onOpenChange={(o) => {
          if (!o) onClose();
        }}
        anchorRef={anchorRef}
        placement="bottom-end"
        role="menu"
        ariaLabel="Notifications"
        className="hidden w-96 sm:block"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-100 px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-surface-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-danger-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1 text-[11px] font-medium text-surface-500 transition-colors hover:text-brand-600 disabled:opacity-50"
            >
              <CheckCheck size={13} />
              Mark all read
            </button>
          )}
        </div>

        {dropdownContent}
      </Popover>

      {/* ── Mobile drawer (<sm) ── */}
      <Drawer isOpen={isOpen} onClose={onClose} side="right" title="Notifications">
        {/* Mobile header with mark-all */}
        {!isLoading && unreadCount > 0 && (
          <div className="flex items-center justify-end border-b border-surface-100 px-5 py-2.5">
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllAsRead.isPending}
              className="flex items-center gap-1 text-xs font-medium text-surface-500 transition-colors hover:text-brand-600 disabled:opacity-50"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          </div>
        )}

        <div className="flex flex-1 flex-col">{dropdownContent}</div>
      </Drawer>
    </>
  );
}
