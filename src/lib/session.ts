import { jwtVerify, SignJWT } from 'jose';

/**
 * Session primitives shared by the Node runtime and the edge middleware.
 * This module must stay free of Prisma and bcrypt so it can run at the edge.
 */

export const SESSION_COOKIE = 'rk_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export type SessionUser = { id: string; email: string; name: string; role: string };

function secret() {
  return new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-fallback-change-me');
}

export async function signSessionToken(user: SessionUser) {
  return new SignJWT({ ...user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

/** Returns null for a missing, malformed or expired token. */
export async function verifySessionToken(token: string | undefined): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}
