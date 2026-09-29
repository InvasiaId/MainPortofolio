import prisma from '@/lib/prisma';
import { verifyPassword, signJWT, setSessionCookie, clearSessionCookie, getSession } from '@/lib/auth';
import { rateLimit } from '@/lib/sanitize';

export async function POST(request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return Response.json(
        { error: `Terlalu banyak percobaan masuk. Coba lagi dalam ${limit.retryAfter} detik.` },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();
    if (!email || !password) {
      return Response.json({ error: 'Email dan kata sandi wajib diisi.' }, { status: 400 });
    }

    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user) {
      return Response.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: 'Email atau kata sandi salah.' }, { status: 401 });
    }

    const token = await signJWT({ userId: user.id, email: user.email });
    await setSessionCookie(token);

    return Response.json({ success: true, user: { id: user.id, email: user.email } });
  } catch (error) {
    return Response.json({ error: 'Gagal masuk.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return Response.json({ authenticated: false }, { status: 401 });
    }
    return Response.json({ authenticated: true, user: session });
  } catch {
    return Response.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    await clearSessionCookie();
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Gagal keluar.' }, { status: 500 });
  }
}
