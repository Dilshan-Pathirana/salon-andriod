import { Request, Response, NextFunction } from 'express';
import * as businessInfoService from './business-info.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await businessInfoService.getAll();
    sendSuccess(res, items, 'Business info retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await businessInfoService.getByCategory(req.params.category);
    sendSuccess(res, items, 'Business info retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function upsert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await businessInfoService.upsert(req.body);
    sendSuccess(res, item, 'Business info updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function bulkUpsert(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await businessInfoService.bulkUpsert(req.body);
    sendSuccess(res, items, 'Business info updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await businessInfoService.remove(req.params.key);
    sendSuccess(res, null, 'Business info removed successfully');
  } catch (error) {
    next(error);
  }
}
