
'use server';

import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-me';
const COOKIE_NAME = 'session';

interface SessionPayload {
  userId: string;
  iat: number;
  exp: number;
}

export async function createSession(userId: string) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const session = await encrypt({ userId });
  
  console.log(`[createSession] Creating session for user: ${userId}`);

  cookies().set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expires,
    sameSite: 'lax',
    path: '/',
  });
  
  console.log(`[createSession] Cookie set for user: ${userId}`);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME)?.value;
  console.log(`[getSession] Reading cookie: ${sessionCookie ? 'found' : 'not found'}`);
  
  if (!sessionCookie) return null;
  
  try {
    const decoded = await decrypt(sessionCookie);
    if (decoded) {
        console.log(`[getSession] Successfully decrypted session for user: ${decoded.userId}`);
    }
    return decoded;
  } catch (error) {
    console.error('[getSession] Error decrypting session:', error);
    return null;
  }
}

export async function deleteSession() {
  console.log('[deleteSession] Deleting session cookie.');
  cookies().set(COOKIE_NAME, '', { expires: new Date(0) });
}

async function encrypt(payload: { userId: string }): Promise<string> {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function decrypt(token: string): Promise<SessionPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return decoded;
  } catch (error) {
    console.error('[decrypt] Failed to verify JWT:', error);
    return null;
  }
}

export async function requireAuth() {
    const session = await getSession();
    if (!session) {
        console.log('[requireAuth] No session found, redirecting to /login');
        redirect('/login');
    }
    return session.userId;
}
