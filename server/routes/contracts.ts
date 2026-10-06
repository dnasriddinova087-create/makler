import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/contracts (List contracts for current user)
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    const where = role === 'ADMIN'
      ? {}
      : role === 'BROKER'
      ? { brokerId: userId }
      : { tenantId: userId };

    const contracts = await prisma.contract.findMany({
      where,
      include: {
        property: {
          include: { images: { take: 1 } }
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true }
        },
        broker: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true }
        },
        handoverAct: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json({ success: true, data: contracts });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/contracts/:id (Contract details + Handover Act)
router.get('/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const contract = await prisma.contract.findUnique({
      where: { id },
      include: {
        property: {
          include: { images: true }
        },
        tenant: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true }
        },
        broker: {
          select: { id: true, firstName: true, lastName: true, phone: true, email: true }
        },
        handoverAct: true
      }
    });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Shartnoma topilmadi' });
    }

    if (contract.tenantId !== req.user!.id && contract.brokerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Ushbu shartnomani ko‘rishga ruxsatingiz yo‘q' });
    }

    return res.json({ success: true, data: contract });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts (Create new contract draft)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      propertyId,
      tenantId,
      landlordName,
      landlordPhone,
      startDate,
      endDate,
      rentAmount,
      paymentDate,
      depositAmount,
      utilitiesIncluded,
      furnitureList,
      additionalTerms
    } = req.body;

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      include: { region: true, district: true, mahalla: true }
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Mulk topilmadi' });
    }

    const contractCount = await prisma.contract.count();
    const contractNumber = `IJARA-${new Date().getFullYear()}-${String(contractCount + 1).padStart(4, '0')}`;

    const isBrokerCreator = req.user!.role === 'BROKER';

    const contract = await prisma.contract.create({
      data: {
        contractNumber,
        landlordName: landlordName || 'Uy egasi',
        landlordPhone: landlordPhone || '+998900000000',
        tenantId: tenantId || req.user!.id,
        brokerId: property.brokerId,
        propertyId,
        regionName: property.region.nameUz,
        districtName: property.district.nameUz,
        mahallaName: property.mahalla?.nameUz || null,
        address: property.address,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        rentAmount: Number(rentAmount || property.price),
        paymentDate: Number(paymentDate || 1),
        depositAmount: Number(depositAmount || 0),
        utilitiesIncluded: utilitiesIncluded || 'Alohida to‘lanadi',
        furnitureList: furnitureList || 'Shartnomadagi ro‘yxat bo‘yicha',
        additionalTerms: additionalTerms || 'IJARA.UZ platformasining standart xavfsiz shartlari asosida',
        status: 'PENDING',
        brokerApproved: isBrokerCreator,
        tenantApproved: !isBrokerCreator
      }
    });

    // Notify other party
    const targetUserId = isBrokerCreator ? (tenantId || req.user!.id) : property.brokerId;
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: 'Yangi shartnoma loyihasi',
        message: `${contractNumber} raqamli ijara shartnomasi yaratildi va tasdiqlash uchun kutmoqda.`,
        type: 'CONTRACT',
        link: `/contracts/${contract.id}`
      }
    });

    return res.status(201).json({ success: true, message: 'Shartnoma yaratildi', data: contract });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/contracts/:id/approve (Tenant or Broker approves contract)
router.patch('/:id/approve', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const contract = await prisma.contract.findUnique({ where: { id } });

    if (!contract) {
      return res.status(404).json({ success: false, message: 'Shartnoma topilmadi' });
    }

    const isTenant = contract.tenantId === req.user!.id;
    const isBroker = contract.brokerId === req.user!.id || req.user!.role === 'ADMIN';

    if (!isTenant && !isBroker) {
      return res.status(403).json({ success: false, message: 'Ruxsat yo‘q' });
    }

    const updateData: any = {};
    if (isTenant) updateData.tenantApproved = true;
    if (isBroker) updateData.brokerApproved = true;

    // If both sides approved, activate contract
    const willBeActive = (isTenant && contract.brokerApproved) || (isBroker && contract.tenantApproved);
    if (willBeActive) {
      updateData.status = 'ACTIVE';
      // Mark property as RENTED
      await prisma.property.update({
        where: { id: contract.propertyId },
        data: { status: 'RENTED' }
      });
    }

    const updated = await prisma.contract.update({
      where: { id },
      data: updateData,
      include: { handoverAct: true }
    });

    return res.json({ success: true, message: 'Shartnoma tasdiqlandi!', data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/contracts/:id/handover (Create or update Handover Act)
router.post('/:id/handover', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id: contractId } = req.params;
    const { meterGas, meterElectricity, meterWater, propertyCondition, furnitureNotes } = req.body;

    const contract = await prisma.contract.findUnique({ where: { id: contractId } });
    if (!contract) {
      return res.status(404).json({ success: false, message: 'Shartnoma topilmadi' });
    }

    const isTenant = contract.tenantId === req.user!.id;
    const isBroker = contract.brokerId === req.user!.id || req.user!.role === 'ADMIN';

    const act = await prisma.handoverAct.upsert({
      where: { contractId },
      create: {
        contractId,
        meterGas,
        meterElectricity,
        meterWater,
        propertyCondition,
        furnitureNotes,
        tenantApproved: isTenant,
        brokerApproved: isBroker,
        signedDate: new Date()
      },
      update: {
        meterGas: meterGas || undefined,
        meterElectricity: meterElectricity || undefined,
        meterWater: meterWater || undefined,
        propertyCondition: propertyCondition || undefined,
        furnitureNotes: furnitureNotes || undefined,
        tenantApproved: isTenant ? true : undefined,
        brokerApproved: isBroker ? true : undefined,
        signedDate: new Date()
      }
    });

    return res.json({ success: true, message: 'Qabul qilish akti saqlandi', data: act });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
