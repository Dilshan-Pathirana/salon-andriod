import { Request, Response, NextFunction } from 'express';
import * as sessionService from './session.service';
import { sendSuccess } from '../../utils';

export async function getSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.query as { date?: string };
    const session = await sessionService.getSession(date);
    sendSuccess(res, session, 'Session status retrieved');
  } catch (error) {
    next(error);
  }
}

export async function openSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.body;
    const session = await sessionService.openSession(date);
    sendSuccess(res, session, 'Session opened successfully');
  } catch (error) {
    next(error);
  }
}

export async function closeSession(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.query as { date?: string };
    const session = await sessionService.closeSession(date);
    sendSuccess(res, session, 'Session closed successfully');
  } catch (error) {
    next(error);
  }
}

export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { date } = req.query as { date?: string };
    const stats = await sessionService.getDashboardStats(date);
    sendSuccess(res, stats, 'Dashboard stats retrieved');
  } catch (error) {
    next(error);
  }
}
