import { Request, Response, NextFunction } from 'express';
import * as scheduleService from './schedule.service';
import { sendSuccess } from '../../utils';

export async function getScheduleByDate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const schedule = await scheduleService.getScheduleByDate(req.params.date);
    if (!schedule) {
      sendSuccess(res, null, 'No schedule found for this date');
      return;
    }
    sendSuccess(res, schedule, 'Schedule retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getScheduleRange(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate } = req.query as {
      startDate?: string;
      endDate?: string;
    };
    const schedules = await scheduleService.getScheduleRange(startDate, endDate);
    sendSuccess(res, schedules, 'Schedules retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function upsertSchedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const forceSlotChange = req.query.forceSlotChange === 'true';
    const schedule = await scheduleService.upsertSchedule(req.body, forceSlotChange);
    sendSuccess(res, schedule, 'Schedule saved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getAvailableDays(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { startDate, endDate } = req.query as {
      startDate: string;
      endDate: string;
    };

    if (!startDate || !endDate) {
      sendSuccess(res, [], 'startDate and endDate query params are required');
      return;
    }

    const days = await scheduleService.getAvailableDays(startDate, endDate);
    sendSuccess(res, days, 'Available days retrieved successfully');
  } catch (error) {
    next(error);
  }
}
