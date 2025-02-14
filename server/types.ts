import { User, InsertUser, Availability, InsertAvailability, Appointment, InsertAppointment } from "@shared/schema";
import session from "express-session";

export interface IStorage {
  sessionStore: session.Store;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getStylists(): Promise<User[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  getAvailabilities(stylistId: number): Promise<Availability[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  getAppointments(stylistId: number): Promise<Appointment[]>;
  deleteAvailability(id: number): Promise<void>;
  deleteAppointment(id: number): Promise<void>;
}