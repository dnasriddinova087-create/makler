import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Require ADMIN role for all routes in this file
router.use(requireRole(['ADMIN']));

// GET /api/admin/stats
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalBrokers,
      totalProperties,
      pendingProperties,
      activeContracts,
      totalReports,
      pendingReports,
      recentAuditLogs
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'BROKER' } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: 'PENDING' } }),
      prisma.contract.count({ where: { status: 'ACTIVE' } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { firstName: true, lastName: true, email: true } } }
      })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalBrokers,
        totalProperties,
        pendingProperties,
        activeContracts,
        totalReports,
        pendingReports,
        recentAuditLogs
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', async (_req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        verification: true,
        _count: {
          select: { properties: true, contractsAsBroker: true, contractsAsTenant: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/users/:id/verify (Verify or reject broker)
router.patch('/users/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // VERIFIED, REJECTED

    const isVerified = status === 'VERIFIED';

    const user = await prisma.user.update({
      where: { id },
      data: {
        isVerified,
        verification: {
          upsert: {
            create: {
              status,
              verifiedAt: isVerified ? new Date() : null,
              reviewerNote: note || null
            },
            update: {
              status,
              verifiedAt: isVerified ? new Date() : null,
              reviewerNote: note || null
            }
          }
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: id,
        title: isVerified ? 'Verifikatsiya tasdiqlandi!' : 'Verifikatsiya rad etildi',
        message: isVerified
          ? 'Tabriklaymiz! Sizning maklerlik profilingiz rasman tasdiqlandi va ishonch belgisi (badge) berildi.'
          : `Afsuski, profilingiz tasdiqlanmadi. Izoh: ${note || 'Hujjatlar mos kelmadi.'}`,
        type: 'INFO'
      }
    });

    return res.json({ success: true, message: 'Verifikatsiya yangilandi', data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/properties (All properties including DRAFT, PENDING, REJECTED)
router.get('/properties', async (_req: AuthRequest, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      include: {
        region: true,
        district: true,
        broker: {
          select: { id: true, firstName: true, lastName: true, email: true, phone: true }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: properties });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/properties/:id/status (APPROVE, REJECT, ARCHIVE)
router.patch('/properties/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // APPROVED, REJECTED, ARCHIVED

    const property = await prisma.property.update({
      where: { id },
      data: { status }
    });

    await prisma.notification.create({
      data: {
        userId: property.brokerId,
        title: `E’lon holati: ${status}`,
        message: `"${property.title}" nomli e’loningiz ${status === 'APPROVED' ? 'tasdiqlandi va platformada e’lon qilindi' : 'moderatsiyadan o‘tmadi'}.`,
        type: 'PROPERTY'
      }
    });

    return res.json({ success: true, message: 'E’lon holati yangilandi', data: property });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/reports
router.get('/reports', async (_req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: {
          select: { firstName: true, lastName: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, data: reports });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/admin/reports/:id/resolve
router.patch('/reports/:id/resolve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // RESOLVED, DISMISSED

    const report = await prisma.report.update({
      where: { id },
      data: { status }
    });

    return res.json({ success: true, message: 'Shikoyat ko‘rib chiqildi', data: report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', async (_req: AuthRequest, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true, role: true }
        }
      }
    });
    return res.json({ success: true, data: logs });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'Foydalanuvchi muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/properties/:id
router.delete('/properties/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, message: 'E’lon muvaffaqiyatli o‘chirildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
