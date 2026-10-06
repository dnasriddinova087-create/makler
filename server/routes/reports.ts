import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/reports (File report on property or user)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetId, reason, description } = req.body;
    if (!targetType || !targetId || !reason || !description) {
      return res.status(400).json({ success: false, message: 'Barcha maydonlar to‘ldirilishi shart' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        targetType, // PROPERTY, USER
        targetId,
        reason,     // FAKE_PROPERTY, FAKE_BROKER, WRONG_PRICE, SCAM, OFFENSIVE, OTHER
        description
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SUBMIT_REPORT',
        entity: 'Report',
        entityId: report.id,
        details: `Shikoyat qoldirildi: ${reason} (${targetType})`
      }
    });

    return res.status(201).json({ success: true, message: 'Shikoyatingiz qabul qilindi va moderatorlar tomonidan ko‘rib chiqiladi', data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
