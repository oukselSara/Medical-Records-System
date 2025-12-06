import { z } from "zod";

export const userRoles = ["doctor", "nurse", "pharmacist" ] as const;
export type UserRole = typeof userRoles[number];

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().optional(),
  role: z.enum(userRoles),
  department: z.string().optional(),
  licenseNumber: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;
export type InsertUser = Omit<User, "id">;

export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string(),
  gender: z.enum(["male", "female", "other"]),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  allergies: z.array(z.string()).default([]),
  medicalHistory: z.array(z.string()).default([]),
  currentMedications: z.array(z.string()).default([]),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  status: z.enum(["active", "inactive", "critical"]).default("active"),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedBy: z.string().optional(),
  updatedAt: z.string().optional(),
});

export type Patient = z.infer<typeof patientSchema>;
export type InsertPatient = Omit<Patient, "id" | "createdAt">;

export const prescriptionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  medication: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  duration: z.string(),
  instructions: z.string().optional(),
  prescribedBy: z.string(),
  prescribedByName: z.string(),
  status: z.enum(["active", "completed", "cancelled", "pending"]).default("pending"),
  dispensed: z.boolean().default(false),
  dispensedAt: z.string().optional(),
  dispensedBy: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Prescription = z.infer<typeof prescriptionSchema>;
export type InsertPrescription = Omit<Prescription, "id" | "createdAt">;

export const treatmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  patientName: z.string(),
  treatmentType: z.string(),
  description: z.string(),
  diagnosis: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).default("scheduled"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  createdBy: z.string(),
  createdByName: z.string(),
  assignedTo: z.string().optional(),
  assignedToName: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type Treatment = z.infer<typeof treatmentSchema>;
export type InsertTreatment = Omit<Treatment, "id" | "createdAt">;

export const notificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: z.enum(["info", "success", "warning", "error"]),
  read: z.boolean().default(false),
  readAt: z.string().optional(),
  createdAt: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;
export type InsertNotification = Omit<Notification, "id" | "createdAt">;

export const insertPatientSchema = patientSchema.omit({ id: true, createdAt: true });
export const insertPrescriptionSchema = prescriptionSchema.omit({ id: true, createdAt: true });
export const insertTreatmentSchema = treatmentSchema.omit({ id: true, createdAt: true });
export const insertNotificationSchema = notificationSchema.omit({ id: true, createdAt: true });
