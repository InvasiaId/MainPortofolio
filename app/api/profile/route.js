import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { sanitizeObject } from '@/lib/sanitize';

export async function GET() {
  try {
    const profile = await prisma.profile.findFirst();
    const socialLinks = await prisma.socialLink.findMany({
      orderBy: { displayOrder: 'asc' },
    });
    return Response.json({ profile, socialLinks });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'profile') {
      const sanitized = sanitizeObject(data);
      let profile = await prisma.profile.findFirst();
      if (profile) {
        profile = await prisma.profile.update({
          where: { id: profile.id },
          data: sanitized,
        });
      } else {
        profile = await prisma.profile.create({ data: sanitized });
      }
      return Response.json(profile);
    }

    if (type === 'social_links') {
      // Replace all social links
      await prisma.socialLink.deleteMany();
      if (data.links && data.links.length > 0) {
        await prisma.socialLink.createMany({
          data: data.links.map((link, i) => ({
            platform: link.platform,
            url: link.url,
            icon: link.icon,
            displayOrder: i,
          })),
        });
      }
      const socialLinks = await prisma.socialLink.findMany({
        orderBy: { displayOrder: 'asc' },
      });
      return Response.json(socialLinks);
    }

    return Response.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
