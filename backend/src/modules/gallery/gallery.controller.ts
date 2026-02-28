import { Request, Response, NextFunction } from 'express';
import * as galleryService from './gallery.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const items = await galleryService.getAllItems(includeInactive);
    sendSuccess(res, items, 'Gallery items retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const items = await galleryService.getItemsByCategory(req.params.category);
    sendSuccess(res, items, 'Gallery items retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await galleryService.getItemById(req.params.id);
    sendSuccess(res, item, 'Gallery item retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await galleryService.createItem(req.body);
    sendSuccess(res, item, 'Gallery item created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const item = await galleryService.updateItem(req.params.id, req.body);
    sendSuccess(res, item, 'Gallery item updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await galleryService.deleteItem(req.params.id);
    sendSuccess(res, null, 'Gallery item deleted successfully');
  } catch (error) {
    next(error);
  }
}
