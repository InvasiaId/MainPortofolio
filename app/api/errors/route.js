import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    await prisma.errorLog.create({
      data: {
        errorMessage: body.errorMessage || 'Unknown error',
        errorStack: body.errorStack || null,
        page: body.page || null,
        userAgent: body.userAgent || null,
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
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    const errors = await prisma.errorLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 100),
    });

    return Response.json(errors);
  } catch {
    return Response.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}
