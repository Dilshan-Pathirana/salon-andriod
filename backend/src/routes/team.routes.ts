import { Router } from 'express';
import { prisma } from '../config/db';
import { parsePagination } from './helpers';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [team, total] = await Promise.all([
      prisma.teamMember.findMany({ orderBy: { experienceYears: 'desc' }, skip, take }),
      prisma.teamMember.count(),
    ]);
    res.status(200).json({ success: true, data: team, page, limit, total });
  } catch (error) {
    next(error);
  }
});

export default router;
