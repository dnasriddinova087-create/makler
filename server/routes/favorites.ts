import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/favorites (Get current user's favorites)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      include: {
        property: {
          include: {
            images: { orderBy: { order: 'asc' } },
            region: true,
            district: true,
            broker: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({
      success: true,
      data: favorites.map((f) => f.property)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/favorites/toggle
router.post('/toggle', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId } = req.body;
    if (!propertyId) {
      return res.status(400).json({ success: false, message: 'propertyId talab qilinadi' });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user!.id,
          propertyId
        }
      }
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id }
      });
      return res.json({ success: true, saved: false, message: 'Sevimlilardan o‘chirildi' });
    } else {
      await prisma.favorite.create({
        data: {
          userId: req.user!.id,
          propertyId
        }
      });
      return res.json({ success: true, saved: true, message: 'Sevimlilarga qo‘shildi' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/favorites/ids (Only favorite IDs for fast client checking)
router.get('/ids', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.user!.id },
      select: { propertyId: true }
    });
    return res.json({
      success: true,
      ids: favorites.map((f) => f.propertyId)
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
