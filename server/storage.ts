import {
  emergencyServices,
  incidents,
  sosAlerts,
  responseTeams,
  type EmergencyService,
  type InsertEmergencyService,
  type Incident,
  type InsertIncident,
  type SosAlert,
  type InsertSosAlert,
  type ResponseTeam,
  type InsertResponseTeam
} from "@shared/schema";

export interface IStorage {
  // Emergency Services
  getEmergencyServices(): Promise<EmergencyService[]>;
  getEmergencyServicesByType(type: string): Promise<EmergencyService[]>;
  createEmergencyService(service: InsertEmergencyService): Promise<EmergencyService>;

  // Incidents
  getIncidents(): Promise<Incident[]>;
  getActiveIncidents(): Promise<Incident[]>;
  getIncident(id: number): Promise<Incident | undefined>;
  createIncident(incident: InsertIncident): Promise<Incident>;
  updateIncidentStatus(id: number, status: string): Promise<Incident | undefined>;

  // SOS Alerts
  getActiveSosAlerts(): Promise<SosAlert[]>;
  createSosAlert(alert: InsertSosAlert): Promise<SosAlert>;
  deactivateSosAlert(id: number): Promise<SosAlert | undefined>;

  // Response Teams
  getResponseTeams(): Promise<ResponseTeam[]>;
  getAvailableResponseTeams(): Promise<ResponseTeam[]>;
  updateResponseTeamStatus(
    id: number,
    status: string,
    latitude?: string,
    longitude?: string
  ): Promise<ResponseTeam | undefined>;
}

export class MemStorage implements IStorage {
  private emergencyServices: Map<number, EmergencyService>;
  private incidents: Map<number, Incident>;
  private sosAlerts: Map<number, SosAlert>;
  private responseTeams: Map<number, ResponseTeam>;
  private currentId: number;

  constructor() {
    this.emergencyServices = new Map();
    this.incidents = new Map();
    this.sosAlerts = new Map();
    this.responseTeams = new Map();
    this.currentId = 1;
    this.seedData();
  }

  private seedData() {
    // Seed emergency services
    const services: InsertEmergencyService[] = [
      {
        name: "General Hospital",
        type: "hospital",
        latitude: "40.7138",
        longitude: "-74.0070",
        address: "123 Medical Center Dr",
        phone: "555-0101",
        isActive: true
      },
      {
        name: "Police Station",
        type: "police",
        latitude: "40.7118",
        longitude: "-74.0050",
        address: "456 Safety Blvd",
        phone: "555-0102",
        isActive: true
      },
      {
        name: "Fire Department",
        type: "fire",
        latitude: "40.7108",
        longitude: "-74.0080",
        address: "789 Fire Station Rd",
        phone: "555-0103",
        isActive: true
      },
      {
        name: "Central Hospital",
        type: "hospital",
        latitude: "40.7158",
        longitude: "-74.0040",
        address: "321 Health Ave",
        phone: "555-0104",
        isActive: true
      },
      {
        name: "North Police Precinct",
        type: "police",
        latitude: "40.7148",
        longitude: "-74.0090",
        address: "654 Law Enforcement Way",
        phone: "555-0105",
        isActive: true
      },
      {
        name: "West Fire Station",
        type: "fire",
        latitude: "40.7098",
        longitude: "-74.0060",
        address: "987 Rescue Lane",
        phone: "555-0106",
        isActive: true
      }
    ];

    // ✅ FIX: Ensure `isActive` is always defined as boolean
    services.forEach(service => {
      const id = this.currentId++;
      this.emergencyServices.set(id, {
        ...service,
        id,
        isActive: service.isActive ?? true
      });
    });

    // Seed response teams
    const teams: InsertResponseTeam[] = [
      {
        name: "Ambulance Unit 1",
        type: "ambulance",
        status: "available",
        latitude: "40.7138",
        longitude: "-74.0070",
        assignedIncidentId: null
      },
      {
        name: "Fire Truck 7",
        type: "fire_truck",
        status: "available",
        latitude: "40.7108",
        longitude: "-74.0080",
        assignedIncidentId: null
      },
      {
        name: "Patrol Unit 23",
        type: "police_unit",
        status: "available",
        latitude: "40.7118",
        longitude: "-74.0050",
        assignedIncidentId: null
      }
    ];

    teams.forEach(team => {
      const id = this.currentId++;
      this.responseTeams.set(id, { ...team, id });
    });
  }

  // =====================
  // Emergency Services
  // =====================

  async getEmergencyServices(): Promise<EmergencyService[]> {
    return Array.from(this.emergencyServices.values()).filter(service => service.isActive);
  }

  async getEmergencyServicesByType(type: string): Promise<EmergencyService[]> {
    return Array.from(this.emergencyServices.values()).filter(
      service => service.type === type && service.isActive
    );
  }

  async createEmergencyService(insertService: InsertEmergencyService): Promise<EmergencyService> {
    const id = this.currentId++;
    const service: EmergencyService = {
      ...insertService,
      id,
      isActive: insertService.isActive ?? true
    };
    this.emergencyServices.set(id, service);
    return service;
  }

  // =====================
  // Incidents
  // =====================

  async getIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values());
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return Array.from(this.incidents.values()).filter(
      incident => incident.status !== "resolved"
    );
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    return this.incidents.get(id);
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const id = this.currentId++;
    const incident: Incident = {
      ...insertIncident,
      id,
      createdAt: new Date(),
      resolvedAt: null
    };
    this.incidents.set(id, incident);
    return incident;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const incident = this.incidents.get(id);
    if (incident) {
      incident.status = status;
      if (status === "resolved") {
        incident.resolvedAt = new Date();
      }
      this.incidents.set(id, incident);
      return incident;
    }
    return undefined;
  }

  // =====================
  // SOS Alerts
  // =====================

  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return Array.from(this.sosAlerts.values()).filter(alert => alert.isActive);
  }

  async createSosAlert(insertAlert: InsertSosAlert): Promise<SosAlert> {
    const id = this.currentId++;
    const alert: SosAlert = {
      ...insertAlert,
      id,
      createdAt: new Date(),
      deactivatedAt: null,
      isActive: insertAlert.isActive ?? true
    };
    this.sosAlerts.set(id, alert);
    return alert;
  }

  async deactivateSosAlert(id: number): Promise<SosAlert | undefined> {
    const alert = this.sosAlerts.get(id);
    if (alert) {
      alert.isActive = false;
      alert.deactivatedAt = new Date();
      this.sosAlerts.set(id, alert);
      return alert;
    }
    return undefined;
  }

  // =====================
  // Response Teams
  // =====================

  async getResponseTeams(): Promise<ResponseTeam[]> {
    return Array.from(this.responseTeams.values());
  }

  async getAvailableResponseTeams(): Promise<ResponseTeam[]> {
    return Array.from(this.responseTeams.values()).filter(
      team => team.status === "available"
    );
  }

  async updateResponseTeamStatus(
    id: number,
    status: string,
    latitude?: string,
    longitude?: string
  ): Promise<ResponseTeam | undefined> {
    const team = this.responseTeams.get(id);
    if (team) {
      team.status = status;
      team.latitude = latitude ?? team.latitude ?? null;
      team.longitude = longitude ?? team.longitude ?? null;
      this.responseTeams.set(id, team);
      return team;
    }
    return undefined;
  }
}

export const storage = new MemStorage();
