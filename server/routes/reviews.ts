import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/reviews
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId, propertyId, rating, comment, roleScope } = req.body;
    if (!comment || !rating) {
      return res.status(400).json({ success: false, message: 'Reyting va sharh matni talab qilinadi' });
    }

    const review = await prisma.review.create({
      data: {
        authorId: req.user!.id,
        targetUserId: targetUserId || null,
        propertyId: propertyId || null,
        rating: Math.min(5, Math.max(1, Number(rating))),
        comment,
        roleScope: roleScope || 'BROKER'
      }
    });

    // Update target broker's ratingAvg if broker
    if (targetUserId) {
      const avg = await prisma.review.aggregate({
        where: { targetUserId },
        _avg: { rating: true }
      });
      if (avg._avg.rating) {
        await prisma.profile.updateMany({
          where: { userId: targetUserId },
          data: { ratingAvg: Math.round(avg._avg.rating * 10) / 10 }
        });
      }
    }

    return res.status(201).json({ success: true, message: 'Sharh qoldirildi', data: review });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
