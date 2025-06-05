import { useQuery } from "@tanstack/react-query";
import { Phone, AlertTriangle, Navigation, Hospital, Shield, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { EmergencyService, Incident } from "@shared/schema";

interface Location {
  latitude: number;
  longitude: number;
}

interface EmergencyControlsPanelProps {
  onSOSActivation: () => void;
  onReportIncident: () => void;
  userLocation: Location | null;
}

export function EmergencyControlsPanel({ 
  onSOSActivation, 
  onReportIncident, 
  userLocation 
}: EmergencyControlsPanelProps) {
  const { data: emergencyServices = [] } = useQuery<EmergencyService[]>({
    queryKey: ["/api/emergency-services"],
  });

  const { data: recentIncidents = [] } = useQuery<Incident[]>({
    queryKey: ["/api/incidents/active"],
  });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "hospital":
        return <Hospital className="h-4 w-4" />;
      case "police":
        return <Shield className="h-4 w-4" />;
      case "fire":
        return <Flame className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "hospital":
        return "bg-red-600 hover:bg-red-700";
      case "police":
        return "bg-blue-600 hover:bg-blue-700";
      case "fire":
        return "bg-orange-600 hover:bg-orange-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      case "low":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  const handleCall911 = () => {
    window.location.href = "tel:911";
  };

  const handleDirectionsToService = (service: EmergencyService) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${service.latitude},${service.longitude}`;
      window.open(url, '_blank');
    }
  };

  const nearbyServices = emergencyServices
    .map(service => ({
      ...service,
      distance: userLocation ? calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        parseFloat(service.latitude),
        parseFloat(service.longitude)
      ) : 0
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-2xl lg:relative lg:w-96 lg:min-h-screen lg:border-l lg:border-t-0 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* SOS Button */}
        <div className="text-center">
          <Button
            onClick={onSOSActivation}
            className="w-32 h-32 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-xl transition-all duration-200 transform hover:scale-105 focus:ring-4 focus:ring-red-300"
            size="lg"
          >
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-8 w-8 mb-2" />
              <span className="text-lg font-bold">SOS</span>
            </div>
          </Button>
          <p className="text-sm text-gray-600 mt-3">Tap for immediate emergency assistance</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={onReportIncident}
            className="flex flex-col items-center p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-20"
          >
            <AlertTriangle className="h-6 w-6 mb-2" />
            <span className="font-medium text-sm">Report Incident</span>
          </Button>
          <Button
            onClick={handleCall911}
            className="flex flex-col items-center p-4 bg-green-600 hover:bg-green-700 text-white rounded-xl h-20"
          >
            <Phone className="h-6 w-6 mb-2" />
            <span className="font-medium text-sm">Call 911</span>
          </Button>
        </div>

        {/* Nearby Services */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Nearby Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {nearbyServices.length > 0 ? (
              nearbyServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${getServiceColor(service.type)} text-white`}>
                      {getServiceIcon(service.type)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{service.name}</p>
                      <p className="text-xs text-gray-600">
                        {userLocation ? `${service.distance.toFixed(1)} miles away` : 'Distance unknown'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDirectionsToService(service)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Navigation className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                Loading emergency services...
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Incidents */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Incidents</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentIncidents.length > 0 ? (
              recentIncidents.slice(0, 3).map((incident) => (
                <div
                  key={incident.id}
                  className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {incident.type.replace('_', ' ')} Emergency
                      </p>
                      <Badge variant={getSeverityColor(incident.severity)} className="text-xs">
                        {incident.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 truncate">
                      {incident.address || 'Location not specified'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTimeAgo(new Date(incident.createdAt))}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                No recent incidents
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
