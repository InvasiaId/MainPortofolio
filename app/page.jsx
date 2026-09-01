import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import About from '@/components/sections/About';
import Skills from '@/components/sections/Skills';
import Projects from '@/components/sections/Projects';
import Contact from '@/components/sections/Contact';
import AnalyticsTracker from '@/components/ui/AnalyticsTracker';

export const revalidate = 60; // ISR: revalidate every 60 seconds

async function getData() {
  try {
    const [profile, socialLinks, skills, projects] = await Promise.all([
      prisma.profile.findFirst(),
      prisma.socialLink.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.skill.findMany({ orderBy: { displayOrder: 'asc' } }),
      prisma.project.findMany({
        include: { media: { orderBy: { displayOrder: 'asc' } } },
        orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      }),
    ]);
    return { profile, socialLinks, skills, projects };
  } catch {
    return { profile: null, socialLinks: [], skills: [], projects: [] };
  }
}

export default async function HomePage() {
  const { profile, socialLinks, skills, projects } = await getData();

  return (
    <>
      <Navbar />
      <main>
        <Hero profile={profile} socialLinks={socialLinks} />
        <About profile={profile} />
        <Skills skills={skills} />
        <Projects projects={projects} />
        <Contact socialLinks={socialLinks} />
      </main>
      <Footer />
      <AnalyticsTracker />
    </>
  );
}
