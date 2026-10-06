import { Router, Request, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// Get all regions with districts and mahallas
router.get('/', async (_req: Request, res: Response) => {
  try {
    const regions = await prisma.region.findMany({
      include: {
        districts: {
          include: {
            mahallas: true
          }
        }
      },
      orderBy: { nameUz: 'asc' }
    });

    return res.json({ success: true, data: regions });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add new Region
router.post('/', requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { nameUz, nameRu, code } = req.body;
    if (!nameUz || !code) {
      return res.status(400).json({ success: false, message: 'Hudud nomi va kodi talab qilinadi' });
    }

    const region = await prisma.region.create({
      data: { nameUz, nameRu, code: code.toUpperCase() }
    });

    return res.status(201).json({ success: true, data: region });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add new District
router.post('/:regionId/districts', requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { regionId } = req.params;
    const { nameUz, nameRu } = req.body;
    if (!nameUz) {
      return res.status(400).json({ success: false, message: 'Tuman nomi talab qilinadi' });
    }

    const district = await prisma.district.create({
      data: { regionId, nameUz, nameRu }
    });

    return res.status(201).json({ success: true, data: district });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Admin: Add new Mahalla
router.post('/districts/:districtId/mahallas', requireRole(['ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { districtId } = req.params;
    const { nameUz } = req.body;
    if (!nameUz) {
      return res.status(400).json({ success: false, message: 'Mahalla nomi talab qilinadi' });
    }

    const mahalla = await prisma.mahalla.create({
      data: { districtId, nameUz }
    });

    return res.status(201).json({ success: true, data: mahalla });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
