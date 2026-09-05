import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const page = body.page || '/';
    
    // Get client IP to prevent spammy refresh counting
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Prevent counting the same IP on the same page within the last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    const existingView = await prisma.pageView.findFirst({
      where: {
        page: page,
        ipAddress: ipAddress,
        createdAt: { gte: twoHoursAgo },
      },
    });

    if (!existingView) {
      await prisma.pageView.create({
        data: {
          page,
          referrer: body.referrer || null,
          country: body.country || null,
          device: body.device || null,
          browser: body.browser || null,
          sessionId: body.sessionId || null,
          ipAddress,
        },
      });
    }
    
    return Response.json({ success: true }, { status: 201 });
  } catch {
    return Response.json({ success: false }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await getSession();
    if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    let dateFrom = new Date();
    if (period === '7d') dateFrom.setDate(dateFrom.getDate() - 7);
    else if (period === '30d') dateFrom.setDate(dateFrom.getDate() - 30);
    else if (period === '24h') dateFrom.setHours(dateFrom.getHours() - 24);
    else dateFrom.setDate(dateFrom.getDate() - 30);

    const totalViews = await prisma.pageView.count({
      where: { createdAt: { gte: dateFrom } },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayViews = await prisma.pageView.count({
      where: { createdAt: { gte: todayStart } },
    });

    const topPages = await prisma.pageView.groupBy({
      by: ['page'],
      _count: { page: true },
      where: { createdAt: { gte: dateFrom } },
      orderBy: { _count: { page: 'desc' } },
      take: 10,
    });

    const devices = await prisma.pageView.groupBy({
      by: ['device'],
      _count: { device: true },
      where: { createdAt: { gte: dateFrom } },
    });

    const browsers = await prisma.pageView.groupBy({
      by: ['browser'],
      _count: { browser: true },
      where: { createdAt: { gte: dateFrom } },
    });

    const countries = await prisma.pageView.groupBy({
      by: ['country'],
      _count: { country: true },
      where: { createdAt: { gte: dateFrom } },
      orderBy: { _count: { country: 'desc' } },
      take: 10,
    });

    // Daily trend
    const views = await prisma.pageView.findMany({
      where: { createdAt: { gte: dateFrom } },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const dailyTrend = {};
    views.forEach(v => {
      const day = v.createdAt.toISOString().split('T')[0];
      dailyTrend[day] = (dailyTrend[day] || 0) + 1;
    });

    // DB stats
    const projectCount = await prisma.project.count();
    const skillCount = await prisma.skill.count();
    const mediaCount = await prisma.projectMedia.count();

    const projectsByCategory = await prisma.project.groupBy({
      by: ['category'],
      _count: { category: true },
    });

    return Response.json({
      totalViews,
      todayViews,
      topPages: topPages.map(p => ({ page: p.page, count: p._count.page })),
      devices: devices.map(d => ({ device: d.device || 'Unknown', count: d._count.device })),
      browsers: browsers.map(b => ({ browser: b.browser || 'Unknown', count: b._count.browser })),
      countries: countries.map(c => ({ country: c.country || 'Unknown', count: c._count.country })),
      dailyTrend,
      dbStats: { projectCount, skillCount, mediaCount },
      projectsByCategory: projectsByCategory.map(p => ({ category: p.category, count: p._count.category })),
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
