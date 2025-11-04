// OpenStreetMap Overpass API service for real emergency services data
import type { EmergencyService, InsertEmergencyService } from "@shared/schema";

interface OverpassElement {
  type: string;
  id: number;
  lat: number;
  lon: number;
  tags: {
    amenity?: string;
    emergency?: string;
    name?: string;
    'addr:street'?: string;
    'addr:housenumber'?: string;
    'addr:city'?: string;
    'addr:postcode'?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
  };
}

interface OverpassResponse {
  version: number;
  generator: string;
  elements: OverpassElement[];
}

export class OverpassService {
  private readonly baseUrl = 'https://overpass-api.de/api/interpreter';
  
  async getNearbyEmergencyServices(latitude: number, longitude: number, radiusMeters: number = 10000): Promise<EmergencyService[]> {
    const query = this.buildOverpassQuery(latitude, longitude, radiusMeters);
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(query)}`,
      });

      if (!response.ok) {
        throw new Error(`Overpass API request failed: ${response.status}`);
      }

      const data: OverpassResponse = await response.json();
      return this.processOverpassData(data.elements);
    } catch (error) {
      console.error('Error fetching emergency services from Overpass API:', error);
      throw error;
    }
  }

  private buildOverpassQuery(latitude: number, longitude: number, radiusMeters: number): string {
    return `
      [out:json][timeout:25];
      (
        node[amenity=hospital](around:${radiusMeters},${latitude},${longitude});
        node[amenity=clinic](around:${radiusMeters},${latitude},${longitude});
        node[amenity=police](around:${radiusMeters},${latitude},${longitude});
        node[amenity=fire_station](around:${radiusMeters},${latitude},${longitude});
        node[emergency=ambulance_station](around:${radiusMeters},${latitude},${longitude});
        way[amenity=hospital](around:${radiusMeters},${latitude},${longitude});
        way[amenity=clinic](around:${radiusMeters},${latitude},${longitude});
        way[amenity=police](around:${radiusMeters},${latitude},${longitude});
        way[amenity=fire_station](around:${radiusMeters},${latitude},${longitude});
        way[emergency=ambulance_station](around:${radiusMeters},${latitude},${longitude});
      );
      out center;
    `;
  }

  private processOverpassData(elements: OverpassElement[]): EmergencyService[] {
    const services: EmergencyService[] = [];
    let idCounter = 1;

    for (const element of elements) {
      const service = this.convertElementToService(element, idCounter);
      if (service) {
        services.push(service);
        idCounter++;
      }
    }

    return services;
  }

  private convertElementToService(element: OverpassElement, id: number): EmergencyService | null {
    const { tags, lat, lon } = element;
    
    // Skip elements without a name
    if (!tags.name) {
      return null;
    }

    // Determine service type
    const serviceType = this.determineServiceType(tags);
    if (!serviceType) {
      return null;
    }

    // Build address from components
    const address = this.buildAddress(tags);

    // Get center coordinates for ways
    const latitude = lat ? lat.toString() : '0';
    const longitude = lon ? lon.toString() : '0';

    return {
      id,
      name: tags.name,
      type: serviceType,
      latitude,
      longitude,
      address: address || 'Address not available',
      phone: tags.phone || 'Phone not available',
      isActive: true,
    };
  }

  private determineServiceType(tags: any): string | null {
    if (tags.amenity === 'hospital' || tags.amenity === 'clinic') {
      return 'hospital';
    }
    if (tags.amenity === 'police') {
      return 'police';
    }
    if (tags.amenity === 'fire_station') {
      return 'fire';
    }
    if (tags.emergency === 'ambulance_station') {
      return 'hospital'; // Treat ambulance stations as medical services
    }
    return null;
  }

  private buildAddress(tags: any): string | null {
    const parts: string[] = [];
    
    if (tags['addr:housenumber']) {
      parts.push(tags['addr:housenumber']);
    }
    if (tags['addr:street']) {
      parts.push(tags['addr:street']);
    }
    if (tags['addr:city']) {
      parts.push(tags['addr:city']);
    }
    if (tags['addr:postcode']) {
      parts.push(tags['addr:postcode']);
    }

    return parts.length > 0 ? parts.join(', ') : null;
  }
}

export const overpassService = new OverpassService();
