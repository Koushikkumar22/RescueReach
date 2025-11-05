import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, ne } from "drizzle-orm"; // ✅ Added: for filters (equals / not equals)
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

import type { IStorage } from "./storage";

// ⚙️ Create Neon SQL client using environment variable
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DbStorage implements IStorage {
  // ============ EMERGENCY SERVICES ============

  async getEmergencyServices(): Promise<EmergencyService[]> {
    return await db.select().from(emergencyServices);
  }

  async getEmergencyServicesByType(type: string): Promise<EmergencyService[]> {
    return await db
      .select()
      .from(emergencyServices)
      .where(eq(emergencyServices.type, type)); // ✅ use eq()
  }

  async createEmergencyService(service: InsertEmergencyService): Promise<EmergencyService> {
    const [inserted] = await db.insert(emergencyServices).values(service).returning();
    return inserted;
  }

  // ============ INCIDENTS ============

  async getIncidents(): Promise<Incident[]> {
    return await db.select().from(incidents);
  }

  async getActiveIncidents(): Promise<Incident[]> {
    return await db
      .select()
      .from(incidents)
      .where(ne(incidents.status, "resolved")); // ✅ Correct filter using ne()
  }

  async getIncident(id: number): Promise<Incident | undefined> {
    const [incident] = await db
      .select()
      .from(incidents)
      .where(eq(incidents.id, id)); // ✅ use eq()
    return incident;
  }

  async createIncident(data: InsertIncident): Promise<Incident> {
    const [inserted] = await db.insert(incidents).values(data).returning();
    return inserted;
  }

  async updateIncidentStatus(id: number, status: string): Promise<Incident | undefined> {
    const [updated] = await db
      .update(incidents)
      .set({
        status,
        resolvedAt: status === "resolved" ? new Date() : null
      })
      .where(eq(incidents.id, id)) // ✅ use eq()
      .returning();
    return updated;
  }

  // ============ SOS ALERTS ============

  async getActiveSosAlerts(): Promise<SosAlert[]> {
    return await db
      .select()
      .from(sosAlerts)
      .where(eq(sosAlerts.isActive, true)); // ✅ use eq()
  }

  async createSosAlert(alert: InsertSosAlert): Promise<SosAlert> {
    const [inserted] = await db.insert(sosAlerts).values(alert).returning();
    return inserted;
  }

  async deactivateSosAlert(id: number): Promise<SosAlert | undefined> {
    const [updated] = await db
      .update(sosAlerts)
      .set({
        isActive: false,
        deactivatedAt: new Date()
      })
      .where(eq(sosAlerts.id, id)) // ✅ use eq()
      .returning();
    return updated;
  }

  // ============ RESPONSE TEAMS ============

  async getResponseTeams(): Promise<ResponseTeam[]> {
    return await db.select().from(responseTeams);
  }

  async getAvailableResponseTeams(): Promise<ResponseTeam[]> {
    return await db
      .select()
      .from(responseTeams)
      .where(eq(responseTeams.status, "available")); // ✅ use eq()
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
        latitude,
        longitude
      })
      .where(eq(responseTeams.id, id)) // ✅ use eq()
      .returning();
    return updated;
  }
}

export const storage = new DbStorage();
