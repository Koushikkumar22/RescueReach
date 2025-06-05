import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { EmergencyService, Incident } from "@shared/schema";
import { MapPin, Phone, Navigation, Plus, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Location {
  latitude: number;
  longitude: number;
}

interface MapViewProps {
  userLocation: Location | null;
  onSOSActivation: () => void;
  onReportIncident: () => void;
}

export function MapView({ userLocation, onSOSActivation, onReportIncident }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedService, setSelectedService] = useState<EmergencyService | null>(null);

  const { data: emergencyServices = [] } = useQuery<EmergencyService[]>({
    queryKey: ["/api/emergency-services"],
  });

  const { data: incidents = [] } = useQuery<Incident[]>({
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
        return "🏥";
      case "police":
        return "🚔";
      case "fire":
        return "🚒";
      default:
        return "📍";
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "hospital":
        return "bg-red-600 text-white";
      case "police":
        return "bg-blue-600 text-white";
      case "fire":
        return "bg-orange-600 text-white";
      default:
        return "bg-gray-600 text-white";
    }
  };

  const handleServiceClick = (service: EmergencyService) => {
    setSelectedService(service);
  };

  const handleDirections = (service: EmergencyService) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${service.latitude},${service.longitude}`;
      window.open(url, '_blank');
    }
  };

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="relative h-96 lg:h-full bg-gray-200 overflow-hidden">
      {/* Simulated Map Background */}
      <div 
        ref={mapRef}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=1080')",
        }}
      >
        {/* Map Overlay */}
        <div className="absolute inset-0 bg-blue-50 bg-opacity-60" />
      </div>

      {/* User Location Indicator */}
      {userLocation && (
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <div className="flex items-center space-x-2">
            <MapPin className="text-blue-600 h-4 w-4" />
            <span className="text-sm font-medium">Your Location</span>
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
          </div>
        </div>
      )}

      {/* Emergency Service Markers */}
      {emergencyServices.map((service, index) => {
        const distance = userLocation 
          ? calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              parseFloat(service.latitude), 
              parseFloat(service.longitude)
            )
          : 0;

        // Position markers in a grid pattern for visual representation
        const positions = [
          { top: '20%', left: '15%' },
          { top: '35%', right: '20%' },
          { bottom: '40%', left: '25%' },
          { top: '60%', right: '15%' },
          { top: '25%', right: '35%' },
          { bottom: '25%', right: '30%' },
        ];
        
        const position = positions[index % positions.length];

        return (
          <div
            key={service.id}
            className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20`}
            style={position}
            onClick={() => handleServiceClick(service)}
          >
            <div className={`emergency-marker ${service.type} w-12 h-12 ${getServiceColor(service.type)} rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-lg`}>
              {getServiceIcon(service.type)}
            </div>
            {userLocation && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">
                {distance.toFixed(1)} mi
              </div>
            )}
          </div>
        );
      })}

      {/* Incident Markers */}
      {incidents.map((incident, index) => {
        // Position incident markers differently
        const incidentPositions = [
          { top: '45%', right: '25%' },
          { top: '70%', left: '40%' },
          { top: '30%', left: '60%' },
        ];
        
        const position = incidentPositions[index % incidentPositions.length];

        return (
          <div
            key={incident.id}
            className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 z-20"
            style={position}
          >
            <div className="emergency-marker incident w-10 h-10 bg-yellow-500 text-yellow-900 rounded-full shadow-lg animate-pulse flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-yellow-100 border border-yellow-300 rounded px-2 py-1 text-xs shadow-lg whitespace-nowrap">
              {incident.type} - {incident.severity}
            </div>
          </div>
        );
      })}

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-3 z-30">
        <Button
          onClick={onReportIncident}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Service Details Modal */}
      {selectedService && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
          <Card className="w-full max-w-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full ${getServiceColor(selectedService.type)} flex items-center justify-center text-sm`}>
                    {getServiceIcon(selectedService.type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                    <p className="text-sm text-gray-600 capitalize">{selectedService.type}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedService(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </Button>
              </div>
              
              <div className="space-y-3 mb-4">
                <p className="text-sm text-gray-600">{selectedService.address}</p>
                {userLocation && (
                  <p className="text-sm font-medium text-gray-900">
                    {calculateDistance(
                      userLocation.latitude,
                      userLocation.longitude,
                      parseFloat(selectedService.latitude),
                      parseFloat(selectedService.longitude)
                    ).toFixed(1)} miles away
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={() => handleCall(selectedService.phone)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button
                  onClick={() => handleDirections(selectedService)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  <Navigation className="h-4 w-4 mr-2" />
                  Directions
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
