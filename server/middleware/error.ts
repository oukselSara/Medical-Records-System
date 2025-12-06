// server/middleware/error.ts
import { Request, Response, NextFunction } from "express";

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  statusCode: number;
  
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
  }
}

/**
 * Not Found middleware - catches 404s
 */
export function notFound(req: Request, res: Response, next: NextFunction) {
  const error = new ApiError(404, `Route ${req.originalUrl} not found`);
  next(error);
}

/**
 * Global error handler middleware
 * Must be defined AFTER all routes
 */
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error details
  console.error("❌ Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.email,
  });

  // Determine status code
  const statusCode = err.statusCode || err.status || 500;

  // Send error response
  res.status(statusCode).json({
    error: err.name || "Error",
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
}

/**
 * Async handler wrapper to catch errors in async route handlers
 * Usage: app.get('/api/patients', asyncHandler(async (req, res) => { ... }))
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}