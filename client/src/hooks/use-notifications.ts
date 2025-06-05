import { useState, useCallback } from "react";
import type { Notification } from "@/components/notification-toast";

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((
    title: string, 
    message: string, 
    type: Notification["type"] = "info"
  ) => {
    const notification: Notification = {
      id: Date.now().toString(),
      title,
      message,
      type,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showNotification,
    dismissNotification,
    clearAllNotifications,
  };
}
