import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/viewings (Get my bookings - client or broker)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const where = role === 'BROKER' ? { brokerId: userId } : { clientId: userId };

    const viewings = await prisma.viewing.findMany({
      where,
      include: {
        property: {
          include: {
            images: { take: 1 }
          }
        },
        client: {
          select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
        },
        broker: {
          select: { id: true, firstName: true, lastName: true, phone: true, avatarUrl: true }
        }
      },
      orderBy: { scheduledTime: 'asc' }
    });

    return res.json({ success: true, data: viewings });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/viewings (Create viewing request)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, scheduledTime, notes } = req.body;
    if (!propertyId || !scheduledTime) {
      return res.status(400).json({ success: false, message: 'propertyId va vaqt talab qilinadi' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Mulk topilmadi' });
    }

    const viewing = await prisma.viewing.create({
      data: {
        propertyId,
        clientId: req.user!.id,
        brokerId: property.brokerId,
        scheduledTime: new Date(scheduledTime),
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        property: true,
        broker: true
      }
    });

    // Notify broker
    await prisma.notification.create({
      data: {
        userId: property.brokerId,
        title: 'Yangi ko‘rish so‘rovi',
        message: `${req.user!.firstName} ${req.user!.lastName} "${property.title}" uyi uchun ko‘rish uchrashuvi belgilashni so‘radi.`,
        type: 'BOOKING',
        link: '/dashboard/viewings'
      }
    });

    return res.status(201).json({ success: true, message: 'Ko‘rish so‘rovi yuborildi', data: viewing });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/viewings/:id/status (Update status: CONFIRMED, CANCELLED, COMPLETED, NO_SHOW)
router.patch('/:id/status', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const viewing = await prisma.viewing.findUnique({
      where: { id },
      include: { property: true }
    });

    if (!viewing) {
      return res.status(404).json({ success: false, message: 'Uchrashuv topilmadi' });
    }

    // Must be either client, broker, or admin
    if (viewing.clientId !== req.user!.id && viewing.brokerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Ruxsat yo‘q' });
    }

    const updated = await prisma.viewing.update({
      where: { id },
      data: { status }
    });

    // Send notification to other party
    const targetUserId = req.user!.id === viewing.clientId ? viewing.brokerId : viewing.clientId;
    const statusText = status === 'CONFIRMED' ? 'tasdiqlandi' : status === 'CANCELLED' ? 'bekor qilindi' : status;

    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: `Uchrashuv holati: ${statusText}`,
        message: `"${viewing.property.title}" bo‘yicha uchrashuv holati ${statusText} deb yangilandi.`,
        type: 'BOOKING'
      }
    });

    return res.json({ success: true, message: 'Holat yangilandi', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
