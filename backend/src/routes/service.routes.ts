import { Router } from 'express';
import { prisma } from '../config/db';
import { authenticate, parsePagination, requireAdmin, sanitize } from './helpers';

const router = Router();
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

router.get('/', async (req, res, next) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const where = includeInactive ? {} : { isActive: true };
    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [services, total] = await Promise.all([
      prisma.service.findMany({ where, orderBy: { price: 'asc' }, skip, take }),
      prisma.service.count({ where }),
    ]);
    res.status(200).json({ success: true, data: services, page, limit, total, message: 'Services retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/category/:category', async (req, res, next) => {
  try {
    const items = await prisma.service.findMany({
      where: {
        category: req.params.category.toUpperCase() as any,
        isActive: true,
      },
    });
    res.status(200).json({ success: true, data: items, message: 'Services retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid service id' });
      return;
    }
    const item = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!item) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }
    res.status(200).json({ success: true, data: item, message: 'Service retrieved successfully' });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const payload = req.body as {
      name: string;
      description?: string;
      duration?: number;
      durationMinutes?: number;
      price: number;
      category: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
      icon?: string;
      isActive?: boolean;
    };

    const created = await prisma.service.create({
      data: {
        name: sanitize(String(payload.name).trim()),
        description: sanitize(String(payload.description ?? '').trim()),
        durationMinutes: payload.durationMinutes ?? payload.duration ?? 30,
        price: Number(payload.price ?? 0),
        category: payload.category ?? 'HAIRCUT',
        icon: payload.icon ?? 'Scissors',
        isActive: payload.isActive ?? true,
      },
    });

    res.status(201).json({ success: true, data: created, message: 'Service created successfully' });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid service id' });
      return;
    }
    const payload = req.body as {
      name?: string;
      description?: string;
      duration?: number;
      durationMinutes?: number;
      price?: number;
      category?: 'HAIRCUT' | 'BEARD' | 'COMBO' | 'PREMIUM';
      icon?: string;
      isActive?: boolean;
    };

    const updateData: Record<string, unknown> = {};
    if (payload.name !== undefined) updateData.name = sanitize(String(payload.name).trim());
    if (payload.description !== undefined) updateData.description = sanitize(String(payload.description).trim());
    if (payload.durationMinutes !== undefined || payload.duration !== undefined) {
      updateData.durationMinutes = payload.durationMinutes ?? payload.duration;
    }
    if (payload.price !== undefined) updateData.price = payload.price;
    if (payload.category !== undefined) updateData.category = payload.category;
    if (payload.icon !== undefined) updateData.icon = payload.icon;
    if (payload.isActive !== undefined) updateData.isActive = payload.isActive;

    const exists = await prisma.service.findUnique({ where: { id: req.params.id } });
    if (!exists) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    const updated = await prisma.service.update({ where: { id: req.params.id }, data: updateData });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Service not found' });
      return;
    }

    res.status(200).json({ success: true, data: updated, message: 'Service updated successfully' });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!uuidRegex.test(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid service id' });
      return;
    }
    await prisma.service.deleteMany({ where: { id: req.params.id } });
    res.status(200).json({ success: true, data: null, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
