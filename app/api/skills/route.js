import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeObject } from '@/lib/sanitize';

export async function GET() {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return Response.json(skills);
  } catch (error) {
    return Response.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const data = sanitizeObject(body);

    const skill = await prisma.skill.create({
      data: {
        name: data.name,
        icon: data.icon || '',
        category: data.category || 'general',
        proficiency: data.proficiency || 50,
        displayOrder: data.displayOrder || 0,
      },
    });

    return Response.json(skill, { status: 201 });
  } catch (error) {
    return Response.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { id, ...data } = sanitizeObject(body);

    if (!id) return Response.json({ error: 'Skill ID required' }, { status: 400 });

    const skill = await prisma.skill.update({
      where: { id: parseInt(id) },
      data,
    });

    return Response.json(skill);
  } catch (error) {
    return Response.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return Response.json({ error: 'Skill ID required' }, { status: 400 });

    await prisma.skill.delete({ where: { id: parseInt(id) } });
    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
