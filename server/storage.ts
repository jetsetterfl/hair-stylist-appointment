import { IStorage } from "./types";
import { User, InsertUser, Availability, InsertAvailability, Appointment, InsertAppointment } from "@shared/schema";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { users, availabilities, appointments } from "@shared/schema";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const [availability] = await db
      .insert(availabilities)
      .values(insertAvailability)
      .returning();
    return availability;
  }

  async getAvailabilities(stylistId: number): Promise<Availability[]> {
    return db.select().from(availabilities).where(eq(availabilities.stylistId, stylistId));
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db
      .insert(appointments)
      .values(insertAppointment)
      .returning();
    return appointment;
  }

  async getAppointments(stylistId: number): Promise<Appointment[]> {
    return db.select().from(appointments).where(eq(appointments.stylistId, stylistId));
  }

  async deleteAvailability(id: number): Promise<void> {
    await db.delete(availabilities).where(eq(availabilities.id, id));
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }
}

export const storage = new DatabaseStorage();