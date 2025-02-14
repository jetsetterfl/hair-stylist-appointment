import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAvailabilitySchema, insertAppointmentSchema } from "@shared/schema";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Availability routes
  app.post("/api/availability", requireAuth, async (req, res) => {
    const result = insertAvailabilitySchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.message);
    
    const availability = await storage.createAvailability(result.data);
    res.json(availability);
  });

  app.get("/api/availability/:stylistId", async (req, res) => {
    const availabilities = await storage.getAvailabilities(parseInt(req.params.stylistId));
    res.json(availabilities);
  });

  app.delete("/api/availability/:id", requireAuth, async (req, res) => {
    await storage.deleteAvailability(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Appointment routes
  app.post("/api/appointment", async (req, res) => {
    const result = insertAppointmentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.message);
    
    const appointment = await storage.createAppointment(result.data);
    res.json(appointment);
  });

  app.get("/api/appointments/:stylistId", requireAuth, async (req, res) => {
    const appointments = await storage.getAppointments(parseInt(req.params.stylistId));
    res.json(appointments);
  });

  app.delete("/api/appointment/:id", requireAuth, async (req, res) => {
    await storage.deleteAppointment(parseInt(req.params.id));
    res.sendStatus(200);
  });

  const httpServer = createServer(app);
  return httpServer;
}
