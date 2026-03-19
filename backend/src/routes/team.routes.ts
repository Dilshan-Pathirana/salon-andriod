import { Router } from 'express';
import { TeamMember } from '../models/TeamMember';
import { parsePagination } from './helpers';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [team, total] = await Promise.all([
      TeamMember.find().sort({ experienceYears: -1 }).skip(skip).limit(take).lean(),
      TeamMember.countDocuments(),
    ]);
    res.status(200).json({ success: true, data: team, page, limit, total });
  } catch (error) {
    next(error);
  }
});

export default router;
