import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
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
    return Response.json({ error: 'Gagal mengambil data profil.' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Akses tidak diizinkan.' }, { status: 401 });

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'profile') {
      const sanitized = sanitizeObject(data);
      const updateData = {
        name: sanitized.name,
        tagline: sanitized.tagline,
        bio: sanitized.bio,
        photoUrl: sanitized.photoUrl || null,
        heroPhotoUrl: sanitized.heroPhotoUrl || null,
        resumeUrl: sanitized.resumeUrl || null,
        contactEmail: sanitized.contactEmail || null
      };

      let profile = await prisma.profile.findFirst();
      if (profile) {
        profile = await prisma.profile.update({
          where: { id: profile.id },
          data: updateData,
        });
      } else {
        profile = await prisma.profile.create({ data: updateData });
      }
      revalidatePath('/', 'page');
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

    return Response.json({ error: 'Jenis permintaan tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error("Profile API Error Vercel:", error);
    return Response.json({ 
      error: 'Gagal memperbarui profil.',
    }, { status: 500 });
  }
}
