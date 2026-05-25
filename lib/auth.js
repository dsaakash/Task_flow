import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "a-very-secure-and-long-fallback-secret-for-jwt-signing-12345"
);

// Sign a JWT token (works in Node and Edge runtime)
export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

// Verify a JWT token (works in Node and Edge runtime)
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (err) {
    return null;
  }
}

// Hash a password (for user registration/seeding - Node only)
export async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Compare password with hash (for login - Node only)
export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
