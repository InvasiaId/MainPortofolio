import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { projectId, mediaUrl, mediaType, displayOrder } = body;

    if (!projectId || !mediaUrl) {
      return Response.json({ error: 'projectId and mediaUrl required' }, { status: 400 });
    }

    const media = await prisma.projectMedia.create({
      data: {
        projectId: parseInt(projectId),
        mediaUrl,
        mediaType: mediaType || 'image',
        displayOrder: displayOrder || 0,
      },
    });

    return Response.json(media, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to add media' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Media ID required' }, { status: 400 });

    await prisma.projectMedia.delete({ where: { id: parseInt(id) } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
