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

  // Seed profile
  await prisma.profile.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'M. Dandi Fadli',
      tagline: 'Full-Stack Web Developer | 3D & Interactive Media',
      bio: 'Mahasiswa Teknik Komputer di Politeknik Negeri Sriwijaya dengan pengalaman membangun web application full-stack menggunakan React, Node.js, Laravel, dan CodeIgniter 4. Terbiasa mengerjakan siklus pengembangan penuh mulai dari perancangan antarmuka yang responsif, backend, integrasi basis data, hingga deployment.',
      contactEmail: 'dandifadli7@gmail.com',
      whatsappNumber: '6289508287018',
    },
  });

  // Seed social links
  const socials = [
    { platform: 'linkedin', url: 'https://www.linkedin.com/in/m-dandi-fadli-250398273/', icon: 'linkedin' },
    { platform: 'github', url: 'https://github.com/InvasiaId', icon: 'github' },
    { platform: 'dribbble', url: 'https://dribbble.com/m--dandi-fadli', icon: 'dribbble' },
    { platform: 'instagram', url: 'https://www.instagram.com/__mdandi', icon: 'instagram' },
    { platform: 'tiktok', url: 'https://tiktok.com/@situspraktis', icon: 'tiktok' },
  ];

  for (let i = 0; i < socials.length; i++) {
    const existing = await prisma.socialLink.findFirst({ where: { platform: socials[i].platform } });
    if (!existing) {
      await prisma.socialLink.create({
        data: { ...socials[i], displayOrder: i },
      });
    }
  }

  console.log('✅ Inisialisasi database selesai.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
