import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertSosAlertSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone, MapPin, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Location {
  latitude: number;
  longitude: number;
}

interface SosModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: Location | null;
}

export function SosModal({ isOpen, onClose, userLocation }: SosModalProps) {
  const [timer, setTimer] = useState(0);
  const [alertId, setAlertId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createSosAlertMutation = useMutation({
    mutationFn: async () => {
      if (!userLocation) {
        throw new Error("Location required for SOS alert");
      }
      
      const data = {
        userId: "anonymous-user",
        latitude: userLocation.latitude.toString(),
        longitude: userLocation.longitude.toString(),
        isActive: true,
      };
      
      const response = await apiRequest("POST", "/api/sos-alerts", data);
      return response.json();
    },
    onSuccess: (data) => {
      setAlertId(data.id);
      queryClient.invalidateQueries({ queryKey: ["/api/sos-alerts"] });
      toast({
        title: "SOS Alert Active",
        description: "Emergency services have been notified of your location.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to activate SOS alert. Please try calling 911 directly.",
        variant: "destructive",
      });
    },
  });

  const deactivateSosAlertMutation = useMutation({
    mutationFn: async () => {
      if (!alertId) return;
      const response = await apiRequest("PATCH", `/api/sos-alerts/${alertId}/deactivate`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sos-alerts"] });
      toast({
        title: "SOS Alert Deactivated",
        description: "Your emergency alert has been cancelled.",
      });
      handleClose();
    },
  });

  useEffect(() => {
    if (isOpen && !alertId) {
      createSosAlertMutation.mutate();
    }
  }, [isOpen]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isOpen) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isOpen]);

  const formatTimer = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleEmergencyCall = () => {
    window.location.href = "tel:911";
  };

  const handleClose = () => {
    setTimer(0);
    setAlertId(null);
    onClose();
  };

  const handleCancelSOS = () => {
    if (alertId) {
      deactivateSosAlertMutation.mutate();
    } else {
      handleClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-sm bg-white emergency-modal">
        <div className="text-center p-6">
          {/* SOS Icon */}
          <div className="mb-6">
            <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SOS Activated</h2>
            <p className="text-gray-600">Emergency services have been notified</p>
          </div>

          {/* Live Location Sharing */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <MapPin className="h-4 w-4 text-red-600 animate-pulse" />
              <span className="text-sm font-medium text-gray-900">Live Location Active</span>
            </div>
            <p className="text-xs text-gray-600">
              Your location is being shared with emergency responders
            </p>
            {userLocation && (
              <p className="text-xs text-gray-500 mt-2">
                {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
              </p>
            )}
          </div>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className="text-3xl font-bold text-red-600 mb-1">
              {formatTimer(timer)}
            </div>
            <p className="text-sm text-gray-600">Emergency response time</p>
          </div>

          {/* Status */}
          {createSosAlertMutation.isPending && (
            <div className="mb-4 text-sm text-gray-600">
              Activating emergency alert...
            </div>
          )}

          {alertId && (
            <div className="mb-4 text-sm text-green-600 font-medium">
              Emergency alert is active (ID: {alertId})
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleEmergencyCall}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              <Phone className="h-4 w-4 mr-2" />
              Call Emergency Services
            </Button>
            
            <Button
              onClick={handleCancelSOS}
              variant="outline"
              disabled={deactivateSosAlertMutation.isPending}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {deactivateSosAlertMutation.isPending ? "Cancelling..." : "Cancel SOS"}
            </Button>
          </div>

          {/* Emergency Instructions */}
          <div className="mt-6 text-xs text-gray-500 text-left">
            <p className="font-medium mb-2">Emergency Tips:</p>
            <ul className="space-y-1">
              <li>• Stay calm and in a safe location if possible</li>
              <li>• Keep your phone charged and nearby</li>
              <li>• Be ready to provide additional information</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
