import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db-storage"; // ✅ using Neon PostgreSQL
import { overpassService } from "./overpass-service";
import { insertIncidentSchema, insertSosAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Emergency Services routes
  app.get("/api/emergency-services", async (req, res) => {
    try {
      const { lat, lon, useReal } = req.query;

      if (lat && lon && useReal === "true") {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lon as string);

        if (isNaN(latitude) || isNaN(longitude)) {
          return res.status(400).json({ message: "Invalid coordinates provided" });
        }

        const realServices = await overpassService.getNearbyEmergencyServices(latitude, longitude);
        return res.json(realServices);
      }

      const services = await storage.getEmergencyServices();
      res.json(services);
    } catch (error) {
      console.error("❌ Error fetching emergency services:", error);
      res.status(500).json({ message: "Failed to fetch emergency services", error: (error as Error).message });
    }
  });

  app.get("/api/emergency-services/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const services = await storage.getEmergencyServicesByType(type);
      res.json(services);
    } catch (error) {
      console.error("❌ Error fetching emergency services by type:", error);
      res.status(500).json({ message: "Failed to fetch emergency services by type", error: (error as Error).message });
    }
  });

  // Incidents routes
  app.get("/api/incidents", async (req, res) => {
    try {
      const incidents = await storage.getIncidents();
      res.json(incidents);
    } catch (error) {
      console.error("❌ Error fetching incidents:", error);
      res.status(500).json({ message: "Failed to fetch incidents", error: (error as Error).message });
    }
  });

  // ✅ Step 1: Added detailed logging here
  app.get("/api/incidents/active", async (req, res) => {
    try {
      const incidents = await storage.getActiveIncidents();
      res.json(incidents);
    } catch (err) {
      console.error("❌ Error fetching active incidents:", err);
      res.status(500).json({ message: "Server error", error: (err as Error).message });
    }
  });

  app.post("/api/incidents", async (req, res) => {
    try {
      const validatedData = insertIncidentSchema.parse(req.body);
      const incident = await storage.createIncident(validatedData);
      res.status(201).json(incident);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid incident data", errors: error.errors });
      } else {
        console.error("❌ Error creating incident:", error);
        res.status(500).json({ message: "Failed to create incident", error: (error as Error).message });
      }
    }
  });

  app.patch("/api/incidents/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const incident = await storage.updateIncidentStatus(parseInt(id), status);
      if (!incident) {
        return res.status(404).json({ message: "Incident not found" });
      }

      res.json(incident);
    } catch (error) {
      console.error("❌ Error updating incident status:", error);
      res.status(500).json({ message: "Failed to update incident status", error: (error as Error).message });
    }
  });

  // SOS Alerts routes
  app.get("/api/sos-alerts", async (req, res) => {
    try {
      const alerts = await storage.getActiveSosAlerts();
      res.json(alerts);
    } catch (error) {
      console.error("❌ Error fetching SOS alerts:", error);
      res.status(500).json({ message: "Failed to fetch SOS alerts", error: (error as Error).message });
    }
  });

  app.post("/api/sos-alerts", async (req, res) => {
    try {
      const validatedData = insertSosAlertSchema.parse(req.body);
      const alert = await storage.createSosAlert(validatedData);
      res.status(201).json(alert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid SOS alert data", errors: error.errors });
      } else {
        console.error("❌ Error creating SOS alert:", error);
        res.status(500).json({ message: "Failed to create SOS alert", error: (error as Error).message });
      }
    }
  });

  app.patch("/api/sos-alerts/:id/deactivate", async (req, res) => {
    try {
      const { id } = req.params;
      const alert = await storage.deactivateSosAlert(parseInt(id));

      if (!alert) {
        return res.status(404).json({ message: "SOS alert not found" });
      }

      res.json(alert);
    } catch (error) {
      console.error("❌ Error deactivating SOS alert:", error);
      res.status(500).json({ message: "Failed to deactivate SOS alert", error: (error as Error).message });
    }
  });

  // Response Teams routes
  app.get("/api/response-teams", async (req, res) => {
    try {
      const teams = await storage.getResponseTeams();
      res.json(teams);
    } catch (error) {
      console.error("❌ Error fetching response teams:", error);
      res.status(500).json({ message: "Failed to fetch response teams", error: (error as Error).message });
    }
  });

  app.get("/api/response-teams/available", async (req, res) => {
    try {
      const teams = await storage.getAvailableResponseTeams();
      res.json(teams);
    } catch (error) {
      console.error("❌ Error fetching available response teams:", error);
      res.status(500).json({ message: "Failed to fetch available response teams", error: (error as Error).message });
    }
  });

  app.patch("/api/response-teams/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, latitude, longitude } = req.body;

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const team = await storage.updateResponseTeamStatus(
        parseInt(id),
        status,
        latitude,
        longitude
      );

      if (!team) {
        return res.status(404).json({ message: "Response team not found" });
      }

      res.json(team);
    } catch (error) {
      console.error("❌ Error updating response team status:", error);
      res.status(500).json({ message: "Failed to update response team status", error: (error as Error).message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
