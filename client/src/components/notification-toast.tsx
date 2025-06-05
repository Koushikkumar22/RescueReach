import { useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "emergency";
  timestamp: Date;
}

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "emergency":
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (notification.type) {
      case "success":
        return "border-l-green-500";
      case "warning":
        return "border-l-orange-500";
      case "emergency":
        return "border-l-red-500";
      default:
        return "border-l-blue-500";
    }
  };

  return (
    <div className={`fixed top-20 right-4 max-w-sm bg-white border-l-4 ${getBorderColor()} rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-right duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700 p-0 h-auto font-medium"
            >
              View Details
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 ml-3 p-0 h-auto"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
