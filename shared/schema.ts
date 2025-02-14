import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isStyleOwner: boolean("is_style_owner").default(false).notNull(),
});

export const availabilities = pgTable("availabilities", {
  id: serial("id").primaryKey(),
  stylistId: integer("stylist_id").notNull(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  stylistId: integer("stylist_id").notNull(),
  clientName: text("client_name").notNull(),
  clientEmail: text("client_email").notNull(),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isStyleOwner: true,
});

export const insertAvailabilitySchema = createInsertSchema(availabilities);
export const insertAppointmentSchema = createInsertSchema(appointments)
  .extend({
    clientName: z.string().min(1, "Name is required"),
    clientEmail: z.string().email("Valid email is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    date: z.string().min(1, "Date is required"), // Expect string from frontend
  });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Availability = typeof availabilities.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;