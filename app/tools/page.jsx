import prisma from '@/lib/prisma';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ToolsDirectory from '@/components/sections/ToolsDirectory';

export const metadata = {
  title: 'Alat & Web Apps Gratis — M. Dandi Fadli',
  description: 'Kumpulan alat bantu online, utilitas web, dan proyek gratis karya M. Dandi Fadli yang dapat Anda gunakan langsung secara gratis.',
  openGraph: {
    title: 'Alat & Web Apps Gratis — M. Dandi Fadli',
    description: 'Jelajahi dan gunakan kumpulan utilitas web dan alat digital gratis karya M. Dandi Fadli.',
    type: 'website',
  },
};

export const revalidate = 60;

async function getFreeTools() {
  try {
    const tools = await prisma.project.findMany({
      where: {
        tag: 'freeTool',
      },
      include: {
        media: { orderBy: { displayOrder: 'asc' } },
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    });
    return tools;
  } catch (err) {
    console.error('Error fetching free tools:', err);
    return [];
  }
}

export default async function ToolsPage() {
  const tools = await getFreeTools();

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '80vh', paddingTop: '100px' }}>
        <ToolsDirectory tools={tools} />
      </main>
      <Footer />
    </>
  );
}
