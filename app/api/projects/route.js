import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeObject, isValidUrl } from '@/lib/sanitize';

const PROJECT_TAGS = ['mainProject', 'funProject'];

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const where = {};
    if (category && category !== 'all') where.category = category;
    if (featured === 'true') where.featured = true;

    const projects = await prisma.project.findMany({
      where,
      include: { media: { orderBy: { displayOrder: 'asc' } } },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });

    return Response.json(projects);
  } catch (error) {
    return Response.json({ error: 'Gagal mengambil data proyek.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const body = await request.json();
    const data = sanitizeObject(body);

    if (!data.title || !data.category) {
      return Response.json({ error: 'Judul dan kategori wajib diisi.' }, { status: 400 });
    }

    if (data.tag && !PROJECT_TAGS.includes(data.tag)) {
      return Response.json({ error: 'Jenis proyek tidak valid.' }, { status: 400 });
    }

    if (data.projectUrl && !isValidUrl(data.projectUrl)) {
      return Response.json({ error: 'Tautan proyek tidak valid.' }, { status: 400 });
    }

    if (data.repoUrl && !isValidUrl(data.repoUrl)) {
      return Response.json({ error: 'Tautan repositori tidak valid.' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        category: data.category,
        tag: data.tag || 'mainProject',
        description: data.description || '',
        techStack: data.techStack || [],
        projectUrl: data.projectUrl || null,
        repoUrl: data.repoUrl || null,
        model3dUrl: data.model3dUrl || null,
        featured: data.featured || false,
        displayOrder: data.displayOrder || 0,
        media: {
          create: Array.isArray(data.media) ? data.media.map(m => ({
            mediaUrl: m.mediaUrl,
            mediaType: m.mediaType || 'image',
            displayOrder: m.displayOrder || 0
          })) : []
        }
      },
      include: { media: true },
    });

    return Response.json(project, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Gagal membuat proyek.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = sanitizeObject(body);

    if (!id) return Response.json({ error: 'ID proyek wajib diisi.' }, { status: 400 });

    if (data.tag !== undefined && !PROJECT_TAGS.includes(data.tag)) {
      return Response.json({ error: 'Jenis proyek tidak valid.' }, { status: 400 });
    }

    if (data.projectUrl && !isValidUrl(data.projectUrl)) {
      return Response.json({ error: 'Tautan proyek tidak valid.' }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.category && { category: data.category }),
        ...(data.tag !== undefined && { tag: data.tag }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.techStack && { techStack: data.techStack }),
        ...(data.projectUrl !== undefined && { projectUrl: data.projectUrl || null }),
        ...(data.repoUrl !== undefined && { repoUrl: data.repoUrl || null }),
        ...(data.model3dUrl !== undefined && { model3dUrl: data.model3dUrl || null }),
        ...(data.featured !== undefined && { featured: data.featured }),
        ...(data.displayOrder !== undefined && { displayOrder: data.displayOrder }),
      },
      include: { media: true },
    });

    return Response.json(project);
  } catch (error) {
    return Response.json({ error: 'Gagal memperbarui proyek.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'ID proyek wajib diisi.' }, { status: 400 });

    await prisma.project.delete({ where: { id: parseInt(id) } });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Gagal menghapus proyek.' }, { status: 500 });
  }
}
