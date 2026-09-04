import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_jwt_secret'; // should be set in env
const JWT_EXPIRES_IN = '7d';

/**
 * Hash a plain password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a plain password against a bcrypt hash or plain text password.
 */
export async function verifyPassword(hashOrPass: string, inputPass: string): Promise<boolean> {
  if (!hashOrPass || !inputPass) return false;

  let target = hashOrPass.trim();
  if (
    (target.startsWith('"') && target.endsWith('"')) ||
    (target.startsWith("'") && target.endsWith("'"))
  ) {
    target = target.slice(1, -1).trim();
  }

  const input = inputPass.trim();

  // Direct plain text match (if user set plain text password in Vercel env var)
  if (target === input || hashOrPass === inputPass) {
    return true;
  }

  // Bcrypt comparison
  const isBcrypt =
    target.startsWith("$2a$") ||
    target.startsWith("$2b$") ||
    target.startsWith("$2y$");

  if (isBcrypt) {
    try {
      const match = await bcrypt.compare(input, target);
      if (match) return true;
      return await bcrypt.compare(inputPass, target);
    } catch (err) {
      console.error("bcrypt error:", err);
    }
  }

  try {
    return await bcrypt.compare(input, target);
  } catch {
    return false;
  }
}

/**
 * Generate a signed JWT for the admin user.
 */
export function generateAdminToken(): string {
  return jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token and return payload or null.
 */
export function verifyAdminToken(token: string): any | null {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
