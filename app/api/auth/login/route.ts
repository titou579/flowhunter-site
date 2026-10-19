import { NextResponse } from 'next/server';
import { signSession, SESSION_COOKIE } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();
  const U = process.env.ADMIN_USER;
  const P = process.env.ADMIN_PASS;
  if (!U || !P) {
    return NextResponse.json({ error: 'Credentials non configurés' }, { status: 500 });
  }
  if (username !== U || password !== P) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
  }
  const token = await signSession(username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}
