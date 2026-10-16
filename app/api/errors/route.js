import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getClientIp, rateLimit } from '@/lib/sanitize';

export async function POST(request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`errors:${ip}`, 10, 60 * 1000);
    if (!limit.allowed) {
      return Response.json({ success: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const body = await request.json();
    await prisma.errorLog.create({
      data: {
        errorMessage: String(body.errorMessage || 'Kesalahan tidak diketahui').slice(0, 500),
        errorStack: body.errorStack ? String(body.errorStack).slice(0, 2000) : null,
        page: body.page ? String(body.page).slice(0, 200) : null,
        userAgent: body.userAgent ? String(body.userAgent).slice(0, 300) : null,
      },
    });
    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ success: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const errors = await prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    return Response.json(errors);
  } catch {
    return Response.json({ error: 'Gagal mengambil catatan kesalahan.' }, { status: 500 });
  }
}
