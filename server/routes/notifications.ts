import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/notifications
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: req.user!.id, isRead: false }
    });

    return res.json({
      success: true,
      data: notifications,
      unreadCount
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/:id/read
router.patch('/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.notification.updateMany({
      where: { id, userId: req.user!.id },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'O‘qilgan deb belgilandi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/notifications/read-all
router.patch('/read-all', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true }
    });
    return res.json({ success: true, message: 'Barcha bildirishnomalar o‘qildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
