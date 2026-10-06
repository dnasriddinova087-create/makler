import { Router, Response } from 'express';
import { prisma } from '../db';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/chat/conversations (All conversations for current user)
router.get('/conversations', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ clientId: userId }, { brokerId: userId }]
      },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true }
        },
        broker: {
          select: { id: true, firstName: true, lastName: true, avatarUrl: true, phone: true, isVerified: true }
        },
        property: {
          select: { id: true, title: true, price: true, images: { take: 1 } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return res.json({ success: true, data: conversations });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/conversations/start (Start or get conversation with broker)
router.post('/conversations/start', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { brokerId, propertyId, initialMessage } = req.body;
    const clientId = req.user!.id;

    if (!brokerId) {
      return res.status(400).json({ success: false, message: 'brokerId talab qilinadi' });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId,
        brokerId,
        propertyId: propertyId || null
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          brokerId,
          propertyId: propertyId || null
        }
      });
    }

    if (initialMessage) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: clientId,
          text: initialMessage
        }
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });
    }

    return res.status(201).json({ success: true, data: conversation });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/chat/conversations/:id/messages
router.get('/conversations/:id/messages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        broker: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        property: { select: { id: true, title: true, price: true, images: { take: 1 } } }
      }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Suhbat topilmadi' });
    }

    if (conversation.clientId !== req.user!.id && conversation.brokerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Ruxsat yo‘q' });
    }

    // Mark messages from others as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: req.user!.id },
        isRead: false
      },
      data: { isRead: true }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' }
    });

    return res.json({
      success: true,
      data: {
        conversation,
        messages
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/chat/messages (Send message)
router.post('/messages', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, text, imageUrl } = req.body;
    if (!conversationId || (!text && !imageUrl)) {
      return res.status(400).json({ success: false, message: 'Xabar matni yoki rasm talab qilinadi' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Suhbat topilmadi' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: req.user!.id,
        text: text || '',
        imageUrl: imageUrl || null
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Notify recipient
    const recipientId = req.user!.id === conversation.clientId ? conversation.brokerId : conversation.clientId;
    await prisma.notification.create({
      data: {
        userId: recipientId,
        title: 'Yangi xabar',
        message: `${req.user!.firstName}: ${text.length > 50 ? text.substring(0, 50) + '...' : text}`,
        type: 'CHAT',
        link: `/chat?convId=${conversationId}`
      }
    });

    return res.status(201).json({ success: true, data: message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
