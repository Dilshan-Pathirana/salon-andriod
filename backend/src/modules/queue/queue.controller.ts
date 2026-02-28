import { Request, Response, NextFunction } from 'express';
import * as queueService from './queue.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getLiveQueue(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.query as { date?: string };
    const queue = await queueService.getLiveQueue(date);
    sendSuccess(res, queue, 'Live queue retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function reorderQueue(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await queueService.reorderQueue(req.body);
    sendSuccess(res, result, 'Queue reordered successfully');
  } catch (error) {
    next(error);
  }
}
