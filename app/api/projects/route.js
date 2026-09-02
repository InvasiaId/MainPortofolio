import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeObject, isValidUrl } from '@/lib/sanitize';

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
    return Response.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = sanitizeObject(body);

    if (!data.title || !data.category) {
      return Response.json({ error: 'Title and category are required' }, { status: 400 });
    }

    if (data.projectUrl && !isValidUrl(data.projectUrl)) {
      return Response.json({ error: 'Invalid project URL' }, { status: 400 });
    }

    if (data.repoUrl && !isValidUrl(data.repoUrl)) {
      return Response.json({ error: 'Invalid repo URL' }, { status: 400 });
    }

    const project = await prisma.project.create({
      data: {
        title: data.title,
        category: data.category,
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
    return Response.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = sanitizeObject(body);

    if (!id) return Response.json({ error: 'Project ID required' }, { status: 400 });

    if (data.projectUrl && !isValidUrl(data.projectUrl)) {
      return Response.json({ error: 'Invalid project URL' }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.category && { category: data.category }),
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
    return Response.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Project ID required' }, { status: 400 });

    await prisma.project.delete({ where: { id: parseInt(id) } });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
