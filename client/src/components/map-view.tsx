import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import type { EmergencyService, Incident } from "@shared/schema";
import { MapPin, Phone, Navigation, Plus, AlertTriangle, Crosshair } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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
  const mapRef = useRef<L.Map | null>(null);
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

  // Create custom icons for different service types
  const createServiceIcon = (type: string) => {
    const iconHtml = type === "hospital" ? "🏥" : 
                    type === "police" ? "🚔" : 
                    type === "fire" ? "🚒" : "📍";
    
    return L.divIcon({
      html: `<div style="background: ${type === "hospital" ? "#dc2626" : 
                        type === "police" ? "#2563eb" : 
                        type === "fire" ? "#ea580c" : "#6b7280"}; 
                      color: white; 
                      width: 40px; 
                      height: 40px; 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-size: 18px; 
                      border: 2px solid white; 
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                ${iconHtml}
             </div>`,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
    });
  };

  const createIncidentIcon = () => {
    return L.divIcon({
      html: `<div style="background: #eab308; 
                      color: #92400e; 
                      width: 35px; 
                      height: 35px; 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-size: 16px; 
                      border: 2px solid white; 
                      box-shadow: 0 2px 4px rgba(0,0,0,0.2); 
                      animation: pulse 2s infinite;">
                ⚠️
             </div>`,
      className: 'custom-incident-marker',
      iconSize: [35, 35],
      iconAnchor: [17.5, 35],
    });
  };

  const createUserLocationIcon = () => {
    return L.divIcon({
      html: `<div style="background: #3b82f6; 
                      color: white; 
                      width: 24px; 
                      height: 24px; 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      border: 4px solid white; 
                      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3), 0 4px 12px rgba(59, 130, 246, 0.4);
                      animation: pulse 2s infinite;">
                <div style="width: 8px; height: 8px; background: white; border-radius: 50%;"></div>
             </div>`,
      className: 'user-location-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Component to handle map centering when user location changes
  function MapCenterController({ center }: { center: [number, number] }) {
    const map = useMap();
    
    useEffect(() => {
      if (center) {
        map.setView(center, map.getZoom());
      }
    }, [center, map]);
    
    return null;
  }

  // Component to handle map reference and centering
  function MapController({ userLocation }: { userLocation: Location | null }) {
    const map = useMap();
    
    // Store map reference for external use
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    return null;
  }

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleDirections = (service: EmergencyService) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/dir/${userLocation.latitude},${userLocation.longitude}/${service.latitude},${service.longitude}`;
      window.open(url, '_blank');
    }
  };

  // Default map center (New York City area)
  const defaultCenter: [number, number] = [40.7128, -74.0060];
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.latitude, userLocation.longitude] 
    : defaultCenter;

  return (
    <div className="relative h-96 lg:h-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* User Location with Accuracy Circle */}
        {userLocation && (
          <>
            {/* Accuracy circle */}
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={50} // 50 meter accuracy radius
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 2
              }}
            />
            
            {/* User location marker */}
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserLocationIcon()}
            >
              <Popup>
                <div className="text-center p-2">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="text-blue-600 h-4 w-4" />
                    <span className="font-medium">Your Current Location</span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600">
                      Coordinates: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Accuracy: ±50 meters
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      Live tracking active
                    </p>
                  </div>
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {/* Map controller */}
        <MapController userLocation={userLocation} />

        {/* Emergency Service Markers */}
        {emergencyServices.map((service) => {
          const distance = userLocation 
            ? calculateDistance(
                userLocation.latitude, 
                userLocation.longitude, 
                parseFloat(service.latitude), 
                parseFloat(service.longitude)
              )
            : 0;

          return (
            <Marker
              key={service.id}
              position={[parseFloat(service.latitude), parseFloat(service.longitude)]}
              icon={createServiceIcon(service.type)}
            >
              <Popup>
                <div className="p-2 min-w-48">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-lg">
                      {service.type === "hospital" ? "🏥" : 
                       service.type === "police" ? "🚔" : 
                       service.type === "fire" ? "🚒" : "📍"}
                    </span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{service.type}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <p className="text-sm text-gray-600">{service.address}</p>
                    {userLocation && (
                      <p className="text-sm font-medium text-gray-900">
                        {distance.toFixed(1)} miles away
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleCall(service.phone)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      onClick={() => handleDirections(service)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Navigation className="h-4 w-4 mr-1" />
                      Directions
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Incident Markers */}
        {incidents.map((incident) => (
          <Marker
            key={incident.id}
            position={[parseFloat(incident.latitude), parseFloat(incident.longitude)]}
            icon={createIncidentIcon()}
          >
            <Popup>
              <div className="p-2">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium text-gray-900 capitalize">
                    {incident.type.replace('_', ' ')} Emergency
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-600">
                    Severity: <span className="font-medium capitalize">{incident.severity}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    {incident.address || "Location not specified"}
                  </p>
                  {incident.description && (
                    <p className="text-sm text-gray-700">{incident.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    Status: {incident.status.replace('_', ' ')}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-4 right-4 flex flex-col space-y-3 z-[1000]">
        {userLocation && (
          <Button
            onClick={() => {
              // Center map on user location with high zoom
              if (mapRef.current) {
                mapRef.current.setView([userLocation.latitude, userLocation.longitude], 16);
              }
            }}
            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-xl"
            title="Go to my location"
          >
            <Crosshair className="h-5 w-5" />
          </Button>
        )}
        <Button
          onClick={onReportIncident}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl"
          size="lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
