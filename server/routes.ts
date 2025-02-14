import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertAvailabilitySchema, insertAppointmentSchema } from "@shared/schema";
import { sendAppointmentConfirmation } from "./email";
import { format } from "date-fns";

function requireAuth(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
  if (!req.isAuthenticated()) {
    res.sendStatus(401);
    return;
  }
  next();
}

export function registerRoutes(app: Express): Server {
  setupAuth(app);

  // Get all stylists
  app.get("/api/stylists", async (req, res) => {
    const stylists = await storage.getStylists();
    console.log("Fetched stylists:", stylists);
    res.json(stylists);
  });

  // Availability routes
  app.post("/api/availability", requireAuth, async (req, res) => {
    const result = insertAvailabilitySchema.safeParse(req.body);
    if (!result.success) return res.status(400).send(result.error.message);

    const availability = await storage.createAvailability(result.data);
    console.log("Created availability:", availability);
    res.json(availability);
  });

  app.get("/api/availability/:stylistId", async (req, res) => {
    const stylistId = parseInt(req.params.stylistId);
    console.log("Fetching availability for stylist ID:", stylistId);

    if (isNaN(stylistId)) {
      console.log("Invalid stylist ID:", req.params.stylistId);
      return res.status(400).send("Invalid stylist ID");
    }

    const availabilities = await storage.getAvailabilities(stylistId);
    console.log(`Fetched availabilities for stylist ${stylistId}:`, availabilities);
    res.json(availabilities);
  });

  app.delete("/api/availability/:id", requireAuth, async (req, res) => {
    await storage.deleteAvailability(parseInt(req.params.id));
    res.sendStatus(200);
  });

  // Appointment routes
  app.post("/api/appointment", async (req, res) => {
    console.log("Received appointment request:", req.body);

    const result = insertAppointmentSchema.safeParse(req.body);
    if (!result.success) {
      console.error("Validation error:", result.error);
      return res.status(400).send(result.error.message);
    }

    try {
      const appointment = await storage.createAppointment(result.data);
      console.log("Created appointment:", appointment);

      // Get stylist info and send confirmation email
      const stylist = await storage.getUser(appointment.stylistId);
      if (stylist) {
        await sendAppointmentConfirmation({
          clientName: appointment.clientName,
          clientEmail: appointment.clientEmail,
          date: format(new Date(appointment.date), "PPPP"),
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          stylistName: stylist.username
        });
      }

      res.json(appointment);
    } catch (error) {
      console.error("Failed to create appointment:", error);
      res.status(500).send(error instanceof Error ? error.message : "Failed to create appointment");
    }
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