import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emergencyServices = pgTable("emergency_services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // hospital, police, fire, ambulance
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  isActive: boolean("is_active").notNull().default(true),
});

export const incidents = pgTable("incidents", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // medical, fire, crime, accident
  severity: text("severity").notNull(), // low, medium, high
  description: text("description"),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  address: text("address"),
  reportedBy: text("reported_by").notNull(),
  status: text("status").notNull().default("reported"), // reported, acknowledged, in_progress, resolved
  photoUrl: text("photo_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

export const sosAlerts = pgTable("sos_alerts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  deactivatedAt: timestamp("deactivated_at"),
});

export const responseTeams = pgTable("response_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // ambulance, fire_truck, police_unit
  status: text("status").notNull().default("available"), // available, en_route, busy
  latitude: decimal("latitude", { precision: 10, scale: 8 }),
  longitude: decimal("longitude", { precision: 11, scale: 8 }),
  assignedIncidentId: integer("assigned_incident_id"),
});

// Insert schemas
export const insertEmergencyServiceSchema = createInsertSchema(emergencyServices).omit({
  id: true,
});

export const insertIncidentSchema = createInsertSchema(incidents).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
}).extend({
  type: z.enum(["medical", "fire", "crime", "accident"]),
  severity: z.enum(["low", "medium", "high"]),
  status: z.enum(["reported", "acknowledged", "in_progress", "resolved"]).optional(),
});

export const insertSosAlertSchema = createInsertSchema(sosAlerts).omit({
  id: true,
  createdAt: true,
  deactivatedAt: true,
});

export const insertResponseTeamSchema = createInsertSchema(responseTeams).omit({
  id: true,
});

// Types
export type EmergencyService = typeof emergencyServices.$inferSelect;
export type InsertEmergencyService = z.infer<typeof insertEmergencyServiceSchema>;

export type Incident = typeof incidents.$inferSelect;
export type InsertIncident = z.infer<typeof insertIncidentSchema>;

export type SosAlert = typeof sosAlerts.$inferSelect;
export type InsertSosAlert = z.infer<typeof insertSosAlertSchema>;

export type ResponseTeam = typeof responseTeams.$inferSelect;
export type InsertResponseTeam = z.infer<typeof insertResponseTeamSchema>;
