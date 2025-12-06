// server/middleware/logging.ts
import { Request, Response, NextFunction } from "express";
import morgan from "morgan";

/**
 * Custom request logging middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  
  // Log request
  console.log(`➡️  ${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
    user: req.user?.email,
  });

  // Capture response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? "🔴" : "✅";
    
    console.log(
      `${statusColor} ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`
    );
  });

  next();
}

/**
 * Morgan middleware for production logging
 */
export const morganLogger = morgan("combined", {
  skip: (req) => req.url?.startsWith("/vite"), // Skip Vite HMR
});

/**
 * Audit log for sensitive operations
 */
export function auditLog(action: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Log to database or audit service
    console.log("📝 AUDIT:", {
      action,
      user: req.user?.email,
      uid: req.user?.uid,
      timestamp: new Date().toISOString(),
      ip: req.ip,
      resource: req.params,
    });
    
    next();
  };
}