import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  await prisma.adminUser.upsert({
    where: { email: 'admin@portfolio.com' },
    update: {},
    create: {
      email: 'admin@portfolio.com',
      passwordHash,
    },
  });

  // Create default profile
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Your Name',
      tagline: 'Full-Stack Developer & Designer',
      bio: 'Passionate developer with experience in web, mobile, 3D design, video production, graphic design, and hardware/IoT projects.',
    },
  });

  // Create default social links
  const socials = [
    { platform: 'linkedin', url: 'https://linkedin.com/in/yourname', icon: 'linkedin' },
    { platform: 'github', url: 'https://github.com/yourname', icon: 'github' },
    { platform: 'dribbble', url: 'https://dribbble.com/yourname', icon: 'dribbble' },
    { platform: 'instagram', url: 'https://instagram.com/yourname', icon: 'instagram' },
    { platform: 'tiktok', url: 'https://tiktok.com/@yourname', icon: 'tiktok' },
  ];

  for (let i = 0; i < socials.length; i++) {
    await prisma.socialLink.create({
      data: { ...socials[i], displayOrder: i },
    });
  }

  console.log('✅ Seed complete! Admin: admin@portfolio.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
