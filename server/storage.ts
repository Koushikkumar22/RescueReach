import { db } from "./db"; // make sure you have db.ts exporting drizzle(dbClient)
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
  type InsertResponseTeam,
} from "@shared/schema";
import { eq, ne } from "drizzle-orm";

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

export class DbStorage implements IStorage {
  // =====================
  // Emergency Services
  // =====================

  async getEmergencyServices(): Promise<EmergencyService[]> {
    return await db
      .select()
      .from(emergencyServices)
      .where(eq(emergencyServices.isActive, true));
  }

  async getEmergencyServicesByType(type: string): Promise<EmergencyService[]> {
    return await db
      .select()
      .from(emergencyServices)
      .where(eq(emergencyServices.type, type));
  }

  async createEmergencyService(service: InsertEmergencyService): Promise<EmergencyService> {
    const [result] = await db.insert(emergencyServices).values(service).returning();
    return result;
  }

  // =====================
  // Incidents
  // =====================

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents);
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(ne(incidents.status, "resolved"));
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [result] = await db.select().from(incidents).where(eq(incidents.id, id));
    return result;
  }

  async createIncident(insertIncident: InsertIncident): Promise<Incident> {
    const [incident] = await db
      .insert(incidents)
      .values({
        ...insertIncident,
        status: insertIncident.status ?? "reported",
        createdAt: new Date(),
      })
      .returning();
    return incident;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const [updated] = await db
      .update(incidents)
      .set({
        status,
        resolvedAt: status === "resolved" ? new Date() : null,
      })
      .where(eq(incidents.id, id))
      .returning();
    return updated;
  }

  // =====================
  // SOS Alerts
  // =====================

  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return await db
      .select()
      .from(sosAlerts)
      .where(eq(sosAlerts.isActive, true));
  }

  async createSosAlert(insertAlert: InsertSosAlert): Promise<SosAlert> {
    const [alert] = await db
      .insert(sosAlerts)
      .values({
        ...insertAlert,
        createdAt: new Date(),
        isActive: insertAlert.isActive ?? true,
      })
      .returning();
    return alert;
  }

  async deactivateSosAlert(id: number): Promise<SosAlert | undefined> {
    const [updated] = await db
      .update(sosAlerts)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
      })
      .where(eq(sosAlerts.id, id))
      .returning();
    return updated;
  }

  // =====================
  // Response Teams
  // =====================

  async getResponseTeams(): Promise<ResponseTeam[]> {
    return await db.select().from(responseTeams);
  }

  async getAvailableResponseTeams(): Promise<ResponseTeam[]> {
    return await db
      .select()
      .from(responseTeams)
      .where(eq(responseTeams.status, "available"));
  }

  async updateResponseTeamStatus(
    id: number,
    status: string,
    latitude?: string,
    longitude?: string
  ): Promise<ResponseTeam | undefined> {
    const [updated] = await db
      .update(responseTeams)
      .set({
        status,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      })
      .where(eq(responseTeams.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
