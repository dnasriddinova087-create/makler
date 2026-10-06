import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/properties (Filter, Search, Sort, Pagination)
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      search,
      regionId,
      districtId,
      mahallaId,
      propertyType,
      rooms,
      minPrice,
      maxPrice,
      furnished,
      rentPeriod,
      amenityIds,
      sort = 'newest',
      page = '1',
      limit = '9'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 9));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {
      status: 'APPROVED' // Only approved properties publicly visible
    };

    if (search) {
      where.OR = [
        { title: { contains: String(search) } },
        { description: { contains: String(search) } },
        { address: { contains: String(search) } }
      ];
    }

    if (regionId) where.regionId = String(regionId);
    if (districtId) where.districtId = String(districtId);
    if (mahallaId) where.mahallaId = String(mahallaId);
    if (propertyType && propertyType !== 'ALL') where.propertyType = String(propertyType);
    if (rentPeriod && rentPeriod !== 'ALL') where.rentPeriod = String(rentPeriod);

    if (rooms && rooms !== 'ALL') {
      const r = String(rooms);
      if (r === '4+') {
        where.rooms = { gte: 4 };
      } else {
        where.rooms = parseInt(r, 10);
      }
    }

    if (furnished !== undefined && furnished !== 'ALL') {
      where.furnished = furnished === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(String(minPrice));
      if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
    }

    if (amenityIds) {
      const ids = Array.isArray(amenityIds) ? amenityIds : String(amenityIds).split(',');
      where.amenities = {
        some: {
          amenityId: { in: ids }
        }
      };
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    else if (sort === 'price_desc') orderBy = { price: 'desc' };
    else if (sort === 'views') orderBy = { views: 'desc' };
    else if (sort === 'rating') orderBy = { rating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };

    const [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        include: {
          images: { orderBy: { order: 'asc' } },
          region: true,
          district: true,
          mahalla: true,
          broker: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              isVerified: true,
              profile: true
            }
          },
          amenities: {
            include: { amenity: true }
          }
        },
        orderBy,
        skip,
        take: limitNum
      })
    ]);

    return res.json({
      success: true,
      data: properties,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/properties/amenities
router.get('/amenities/list', async (_req: Request, res: Response) => {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, data: amenities });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/properties/my/listings (Broker's own listings)
router.get('/my/listings', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      where: { brokerId: req.user!.id },
      include: {
        images: { orderBy: { order: 'asc' } },
        region: true,
        district: true,
        mahalla: true,
        _count: {
          select: {
            viewings: true,
            favorites: true,
            contracts: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: properties });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/properties/:id (Details & increment views)
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Increment view counter
    const property = await prisma.property.update({
      where: { id },
      data: { views: { increment: 1 } },
      include: {
        images: { orderBy: { order: 'asc' } },
        region: true,
        district: true,
        mahalla: true,
        broker: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            avatarUrl: true,
            isVerified: true,
            profile: true
          }
        },
        amenities: {
          include: { amenity: true }
        },
        reviews: {
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
        }
      }
    });

    return res.json({ success: true, data: property });
  } catch (error: any) {
    return res.status(404).json({ success: false, message: 'Mulk topilmadi' });
  }
});

// POST /api/properties (Create wizard)
const propertySchema = z.object({
  title: z.string().min(5, 'Sarlavha kamida 5 belgidan iborat bo‘lishi kerak'),
  description: z.string().min(20, 'Tavsif kamida 20 belgidan iborat bo‘lishi kerak'),
  price: z.number().positive('Narx musbat son bo‘lishi kerak'),
  currency: z.enum(['UZS', 'USD']).default('UZS'),
  rentPeriod: z.enum(['MONTHLY', 'DAILY', 'SHORT_TERM', 'LONG_TERM']).default('MONTHLY'),
  propertyType: z.enum(['APARTMENT', 'HOUSE', 'YARD', 'DORM', 'OTHER']).default('APARTMENT'),
  rooms: z.number().int().min(1),
  area: z.number().positive(),
  floor: z.number().int().optional(),
  totalFloors: z.number().int().optional(),
  furnished: z.boolean().default(true),
  address: z.string().min(5),
  regionId: z.string(),
  districtId: z.string(),
  mahallaId: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  status: z.enum(['DRAFT', 'PENDING', 'APPROVED']).default('APPROVED'),
  images: z.array(z.string()).min(1, 'Kamida 1 ta rasm talab etiladi'),
  amenityIds: z.array(z.string()).optional()
});

router.post('/', requireRole(['BROKER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const validated = propertySchema.parse(req.body);

    const property = await prisma.property.create({
      data: {
        title: validated.title,
        description: validated.description,
        price: validated.price,
        currency: validated.currency,
        rentPeriod: validated.rentPeriod,
        propertyType: validated.propertyType,
        rooms: validated.rooms,
        area: validated.area,
        floor: validated.floor,
        totalFloors: validated.totalFloors,
        furnished: validated.furnished,
        address: validated.address,
        regionId: validated.regionId,
        districtId: validated.districtId,
        mahallaId: validated.mahallaId || undefined,
        latitude: validated.latitude,
        longitude: validated.longitude,
        status: validated.status,
        brokerId: req.user!.id,
        images: {
          create: validated.images.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            order: idx
          }))
        },
        amenities: validated.amenityIds ? {
          create: validated.amenityIds.map((amenityId) => ({
            amenityId
          }))
        } : undefined
      },
      include: {
        images: true,
        amenities: true
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_PROPERTY',
        entity: 'Property',
        entityId: property.id,
        details: `Yangi e'lon qo'shildi: ${property.title}`
      }
    });

    return res.status(201).json({ success: true, message: 'E’lon muvaffaqiyatli saqlandi!', data: property });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/properties/:id (Update)
router.put('/:id', requireRole(['BROKER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'E’lon topilmadi' });
    }

    if (existing.brokerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Faqat o‘z e’loningizni tahrirlashingiz mumkin' });
    }

    const { images, amenityIds, ...rest } = req.body;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...rest,
        images: images ? {
          deleteMany: {},
          create: images.map((url: string, idx: number) => ({
            url,
            isPrimary: idx === 0,
            order: idx
          }))
        } : undefined
      },
      include: {
        images: true,
        region: true,
        district: true
      }
    });

    return res.json({ success: true, message: 'E’lon yangilandi', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/properties/:id
router.delete('/:id', requireRole(['BROKER', 'ADMIN']), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const existing = await prisma.property.findUnique({ where: { id } });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'E’lon topilmadi' });
    }

    if (existing.brokerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Faqat o‘z e’loningizni o‘chirishingiz mumkin' });
    }

    await prisma.property.delete({ where: { id } });

    return res.json({ success: true, message: 'E’lon o‘chirildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
