import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/brokers (List all verified brokers)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const brokers = await prisma.user.findMany({
      where: { role: 'BROKER' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        profile: true,
        _count: {
          select: {
            properties: { where: { status: 'APPROVED' } },
            reviewsReceived: true,
            contractsAsBroker: { where: { status: 'ACTIVE' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: brokers });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/brokers/:id (Broker profile with listings and reviews)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const broker = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        isVerified: true,
        profile: true,
        properties: {
          where: { status: 'APPROVED' },
          include: {
            images: { orderBy: { order: 'asc' } },
            region: true,
            district: true
          }
        },
        reviewsReceived: {
          include: {
            author: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            properties: true,
            contractsAsBroker: true
          }
        }
      }
    });

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Makler topilmadi' });
    }

    return res.json({ success: true, data: broker });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/brokers/my/stats (Broker dashboard statistics)
router.get('/my/stats', requireRole(['BROKER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const brokerId = req.user!.id;

    const [listingsCount, viewingsCount, activeContractsCount, totalViewsAggregate, pendingViewings] = await Promise.all([
      prisma.property.count({ where: { brokerId } }),
      prisma.viewing.count({ where: { brokerId } }),
      prisma.contract.count({ where: { brokerId, status: 'ACTIVE' } }),
      prisma.property.aggregate({
        where: { brokerId },
        _sum: { views: true }
      }),
      prisma.viewing.findMany({
        where: { brokerId, status: 'PENDING' },
        include: {
          client: {
            select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
          },
          property: {
            select: { id: true, title: true, price: true, address: true }
          }
        },
        take: 5,
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const totalViews = totalViewsAggregate._sum.views || 0;

    return res.json({
      success: true,
      data: {
        totalViews,
        listingsCount,
        viewingsCount,
        activeContractsCount,
        savedCount: Math.round(totalViews * 0.12), // approximate ratio
        pendingViewings
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
