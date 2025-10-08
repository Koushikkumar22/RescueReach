import { useState, useEffect } from "react";
import { MapView } from "@/components/map-view";
import { EmergencyControlsPanel } from "@/components/emergency-controls-panel";
import { IncidentReportModal } from "@/components/incident-report-modal";
import { SosModal } from "@/components/sos-modal";
import { EmergencyServicesDashboard } from "@/components/emergency-services-dashboard";
import { NotificationToast } from "@/components/notification-toast";
import { useNotifications } from "@/hooks/use-notifications";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Siren, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EmergencyLocator() {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { location, error: locationError } = useGeolocation();
  const { notifications, showNotification, dismissNotification } = useNotifications();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const handleSOSActivation = () => {
    setShowSosModal(true);
    showNotification("SOS Activated", "Siren services have been notified", "emergency");
  };

  const handleReportIncident = () => {
    setShowReportModal(true);
  };

  const handleIncidentReported = () => {
    setShowReportModal(false);
    showNotification("Incident Reported", "Your incident has been reported to authorities", "success");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-red-600 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 p-2 rounded-lg">
                <Siren className="text-white h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">RescueReach</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Connection Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium text-gray-700">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDashboard(!showDashboard)}
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative flex">
        {/* Map View */}
        <div className="flex-1 relative">
          <MapView 
            userLocation={location}
            onSOSActivation={handleSOSActivation}
            onReportIncident={handleReportIncident}
          />
          
          {/* Location Status */}
          <div className="absolute top-4 left-4 z-50">
            {locationError ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm font-medium">Location access required</span>
                </div>
                <p className="text-xs mt-1">Please enable location services for emergency features</p>
              </div>
            ) : location ? (
              <div className="bg-blue-50 border border-blue-300 text-blue-800 px-4 py-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live location active</span>
                </div>
                <p className="text-xs mt-1">
                  Your location: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                </p>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-3 rounded-lg shadow-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Getting your location...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Siren Controls Panel - Mobile Bottom Sheet / Desktop Sidebar */}
        <EmergencyControlsPanel
          onSOSActivation={handleSOSActivation}
          onReportIncident={handleReportIncident}
          userLocation={location}
        />

        {/* Siren Services Dashboard - Desktop Only */}
        <div className={`hidden lg:block ${showDashboard ? 'lg:w-96' : 'lg:w-0'} transition-all duration-300 overflow-hidden`}>
          <EmergencyServicesDashboard />
        </div>
      </main>

      {/* Modals */}
      <IncidentReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onIncidentReported={handleIncidentReported}
        userLocation={location}
      />

      <SosModal
        isOpen={showSosModal}
        onClose={() => setShowSosModal(false)}
        userLocation={location}
      />

      {/* Floating SOS Button */}
      <button
        onClick={handleSOSActivation}
        className="fixed bottom-8 left-8 z-[1000] w-20 h-20 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl emergency-pulse hover:scale-110 transition-all duration-200 flex flex-col items-center justify-center group"
        title="Emergency SOS"
      >
        <Siren className="h-8 w-8 mb-1 group-hover:animate-bounce" />
        <span className="text-xs font-bold">SOS</span>
      </button>

      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}
