// server/middleware/rateLimit.ts
import rateLimit from "express-rate-limit";
import { Request, Response } from "express";

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    error: "Too Many Requests",
    message: "You have exceeded the 100 requests in 15 minutes limit!",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/api/health", // Skip health checks
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 attempts per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    error: "Too Many Login Attempts",
    message: "Too many failed login attempts. Please try again later.",
  },
  skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Custom rate limiter based on user ID (after authentication)
 */
export const userBasedLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 requests per minute per user
  keyGenerator: (req: Request) => req.user?.uid || req.ip, // Use user ID if authenticated
  message: {
    error: "Rate Limit Exceeded",
    message: "You're making requests too quickly. Please slow down.",
  },
});

/**
 * Limiter for expensive operations (PDF generation, etc.)
 */
export const expensiveOperationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Only 5 PDFs per minute
  message: {
    error: "Rate Limit Exceeded",
    message: "Please wait before generating another report.",
  },
});