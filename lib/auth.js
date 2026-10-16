import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

const rawSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production'
  ? (() => {
      console.warn('CRITICAL SECURITY WARNING: JWT_SECRET is not configured in production. Using ephemeral secret.');
      return 'prod-ephemeral-' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    })()
  : 'dev-secret-key-local-only');

const JWT_SECRET = new TextEncoder().encode(rawSecret);
const TOKEN_NAME = 'portfolio_admin_token';
const TOKEN_EXPIRY = '24h';

export async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function signJWT(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_NAME);
  if (!token) return null;
  return verifyJWT(token.value);
}

export async function setSessionCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_NAME);
}
