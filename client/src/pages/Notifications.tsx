import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { notificationsCollection } from "@/lib/firestore";
import { GlassCard } from "@/components/GlassCard";
import { SkeletonList } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { Notification } from "@shared/schema";
import {
  Bell,
  CheckCircle,
  Info,
  AlertTriangle,
  XCircle,
  Trash2,
  CheckCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", user?.id],
    queryFn: () => (user ? notificationsCollection.getByUser(user.id) : Promise.resolve([])),
    enabled: !!user,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsCollection.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsCollection.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
      toast({ title: "Notification deleted" });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.read);
      await Promise.all(unread.map((n) => notificationsCollection.markAsRead(n.id)));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications", user?.id] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const typeConfig = {
    info: {
      icon: Info,
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      iconColor: "text-blue-500",
      borderColor: "border-blue-200 dark:border-blue-800",
    },
    success: {
      icon: CheckCircle,
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
      iconColor: "text-emerald-500",
      borderColor: "border-emerald-200 dark:border-emerald-800",
    },
    warning: {
      icon: AlertTriangle,
      bgColor: "bg-amber-50 dark:bg-amber-950/30",
      iconColor: "text-amber-500",
      borderColor: "border-amber-200 dark:border-amber-800",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-50 dark:bg-red-950/30",
      iconColor: "text-red-500",
      borderColor: "border-red-200 dark:border-red-800",
    },
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            <Bell className="w-8 h-8 text-pink-500" />
            Notifications
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-pink-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with the latest activities
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="border-pink-200 text-pink-600"
            onClick={() => markAllAsReadMutation.mutate()}
            disabled={markAllAsReadMutation.isPending}
            data-testid="button-mark-all-read"
          >
            <CheckCheck className="w-4 h-4 mr-2" /> Mark All as Read
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <Bell className="w-16 h-16 mx-auto text-pink-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            No notifications
          </h3>
          <p className="text-muted-foreground">
            You're all caught up! New notifications will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {notifications.map((notification, index) => {
              const config = typeConfig[notification.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <GlassCard
                    className={cn(
                      "p-4 transition-all duration-200",
                      !notification.read && "ring-1 ring-pink-200 dark:ring-pink-800"
                    )}
                    data-testid={`notification-${notification.id}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={cn(
                          "flex items-center justify-center w-10 h-10 rounded-full",
                          config.bgColor
                        )}
                      >
                        <Icon className={cn("w-5 h-5", config.iconColor)} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3
                              className={cn(
                                "font-medium text-gray-800 dark:text-white",
                                !notification.read && "font-semibold"
                              )}
                            >
                              {notification.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-pink-500 rounded-full flex-shrink-0 mt-2" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(notification.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            {!notification.read && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 text-xs text-pink-600 hover:bg-pink-50"
                                onClick={() => markAsReadMutation.mutate(notification.id)}
                                data-testid={`button-mark-read-${notification.id}`}
                              >
                                <CheckCircle className="w-3 h-3 mr-1" /> Mark as read
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs text-red-600 hover:bg-red-50"
                              onClick={() => deleteMutation.mutate(notification.id)}
                              data-testid={`button-delete-${notification.id}`}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
