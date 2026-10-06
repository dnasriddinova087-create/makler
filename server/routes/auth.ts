import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { generateToken, requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Noto‘g‘ri elektron pochta manzili'),
  password: z.string().min(6, 'Parol kamida 6 belgidan iborat bo‘lishi kerak'),
  firstName: z.string().min(2, 'Ism kamida 2 belgidan iborat bo‘lishi kerak'),
  lastName: z.string().min(2, 'Familiya kamida 2 belgidan iborat bo‘lishi kerak'),
  phone: z.string().optional(),
  role: z.enum(['CLIENT', 'BROKER']).default('CLIENT'),
  companyName: z.string().optional(),
  specialization: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Noto‘g‘ri elektron pochta manzili'),
  password: z.string().min(1, 'Parol kiritilishi shart')
});

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Bu email bilan foydalanuvchi allaqachon ro‘yxatdan o‘tgan' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone || null,
        role: validated.role,
        isVerified: validated.role === 'CLIENT', // Clients auto-verified, brokers require document check
        profile: validated.role === 'BROKER' ? {
          create: {
            companyName: validated.companyName || null,
            specialization: validated.specialization || null,
            experienceYears: 1,
            ratingAvg: 5.0,
            totalDeals: 0
          }
        } : undefined
      },
      include: {
        profile: true
      }
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER',
        entity: 'User',
        entityId: user.id,
        details: `Yangi foydalanuvchi ro‘yxatdan o‘tdi: ${user.email} (${user.role})`
      }
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    return res.status(201).json({
      success: true,
      message: 'Muvaffaqiyatli ro‘yxatdan o‘tdingiz!',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server xatosi: ' + error.message });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
      include: { profile: true }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto‘g‘ri' });
    }

    const isValid = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Email yoki parol noto‘g‘ri' });
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    });

    // Log login
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN',
        entity: 'User',
        entityId: user.id,
        details: `${user.email} tizimga kirdi`
      }
    });

    return res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        profile: user.profile
      }
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: error.errors[0].message });
    }
    return res.status(500).json({ success: false, message: 'Server xatosi: ' + error.message });
  }
});

// Current User
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        profile: true,
        verification: true,
        _count: {
          select: {
            favorites: true,
            properties: true,
            notifications: { where: { isRead: false } }
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Foydalanuvchi topilmadi' });
    }

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        profile: user.profile,
        verification: user.verification,
        unreadNotificationsCount: user._count.notifications,
        favoritesCount: user._count.favorites,
        propertiesCount: user._count.properties
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Update Profile
router.put('/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, avatarUrl, bio, companyName, specialization, telegram, experienceYears } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        avatarUrl: avatarUrl || undefined,
        profile: {
          upsert: {
            create: {
              bio,
              companyName,
              specialization,
              telegram,
              experienceYears: experienceYears ? Number(experienceYears) : 0
            },
            update: {
              bio,
              companyName,
              specialization,
              telegram,
              experienceYears: experienceYears ? Number(experienceYears) : undefined
            }
          }
        }
      },
      include: { profile: true }
    });

    return res.json({ success: true, message: 'Profil yangilandi', user: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Account
router.delete('/account', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    await prisma.user.delete({
      where: { id: req.user!.id }
    });
    return res.json({ success: true, message: 'Akkaunt o‘chirildi' });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
