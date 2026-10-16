import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeObject } from '@/lib/sanitize';

const VALID_TYPES = ['work', 'education', 'certification'];

export async function GET() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return Response.json(experiences);
  } catch {
    return Response.json({ error: 'Gagal mengambil data pengalaman.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const body = await request.json();
    const data = sanitizeObject(body);

    if (!data.title || !data.organization || !data.period) {
      return Response.json({ error: 'Judul, instansi, dan periode wajib diisi.' }, { status: 400 });
    }

    if (data.type && !VALID_TYPES.includes(data.type)) {
      return Response.json({ error: 'Tipe pengalaman tidak valid.' }, { status: 400 });
    }

    const exp = await prisma.experience.create({
      data: {
        title: data.title,
        organization: data.organization,
        period: data.period,
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        type: data.type || 'work',
        displayOrder: parseInt(data.displayOrder) || 0,
      },
    });

    return Response.json(exp, { status: 201 });
  } catch {
    return Response.json({ error: 'Gagal menambahkan pengalaman.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = sanitizeObject(body);

    if (!id) return Response.json({ error: 'ID wajib diisi.' }, { status: 400 });

    if (data.type && !VALID_TYPES.includes(data.type)) {
      return Response.json({ error: 'Tipe pengalaman tidak valid.' }, { status: 400 });
    }

    const exp = await prisma.experience.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.organization && { organization: data.organization }),
        ...(data.period && { period: data.period }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.type && { type: data.type }),
        ...(data.displayOrder !== undefined && { displayOrder: parseInt(data.displayOrder) || 0 }),
      },
    });

    return Response.json(exp);
  } catch {
    return Response.json({ error: 'Gagal memperbarui pengalaman.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'ID wajib disertakan.' }, { status: 400 });

    await prisma.experience.delete({ where: { id: parseInt(id) } });
    return Response.json({ success: true });
  } catch {
    return Response.json({ error: 'Gagal menghapus pengalaman.' }, { status: 500 });
  }
}
