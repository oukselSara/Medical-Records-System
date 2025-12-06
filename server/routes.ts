// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== PUBLIC ROUTES ====================
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  
  // ==================== BASIC ROUTES ====================
  
  // Example route for patients (no auth for now)
  app.get("/api/patients", (req, res) => {
    res.json({ message: "Patients endpoint - integrate Firestore here" });
  });

  app.get("/api/prescriptions", (req, res) => {
    res.json({ message: "Prescriptions endpoint" });
  });

  app.get("/api/treatments", (req, res) => {
    res.json({ message: "Treatments endpoint" });
  });

  return httpServer;
}