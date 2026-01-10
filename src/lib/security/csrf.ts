// CSRF token management
import crypto from "crypto"

export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken))
}
