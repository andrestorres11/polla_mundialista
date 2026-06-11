import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'polla-mundialista-2026-secret-key'
);

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    isAdmin: user.isAdmin,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return token;
}

export async function getSession() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  const cookieStore = cookies();
  cookieStore.delete('session');
}
