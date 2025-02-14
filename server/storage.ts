import { IStorage } from "./types";
import { User, InsertUser, Availability, InsertAvailability, Appointment, InsertAppointment } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private availabilities: Map<number, Availability>;
  private appointments: Map<number, Appointment>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.availabilities = new Map();
    this.appointments = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createAvailability(insertAvailability: InsertAvailability): Promise<Availability> {
    const id = this.currentId++;
    const availability: Availability = { ...insertAvailability, id };
    this.availabilities.set(id, availability);
    return availability;
  }

  async getAvailabilities(stylistId: number): Promise<Availability[]> {
    return Array.from(this.availabilities.values()).filter(
      (avail) => avail.stylistId === stylistId
    );
  }

  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const id = this.currentId++;
    const appointment: Appointment = { ...insertAppointment, id };
    this.appointments.set(id, appointment);
    return appointment;
  }

  async getAppointments(stylistId: number): Promise<Appointment[]> {
    return Array.from(this.appointments.values()).filter(
      (appt) => appt.stylistId === stylistId
    );
  }

  async deleteAvailability(id: number): Promise<void> {
    this.availabilities.delete(id);
  }

  async deleteAppointment(id: number): Promise<void> {
    this.appointments.delete(id);
  }
}

export const storage = new MemStorage();
