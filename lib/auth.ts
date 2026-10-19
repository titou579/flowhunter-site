import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'dev-secret-change-me-please-xxxxxxxxxxxxxxxxxxxxxx'
);
const COOKIE = 'session';

export async function signSession(username: string): Promise<string> {
  return await new SignJWT({ u: username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function isAuthed(): Promise<boolean> {
  const c = cookies().get(COOKIE);
  if (!c) return false;
  return verifySession(c.value);
}

export const SESSION_COOKIE = COOKIE;

export function adminPath(): string {
  return process.env.ADMIN_PATH || 'admin.flowhunter';
}
