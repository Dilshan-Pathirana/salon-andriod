import { Request, Response, NextFunction } from 'express';
import * as servicesService from './services.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const services = await servicesService.getAllServices(includeInactive);
    sendSuccess(res, services, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = req.params.category.toUpperCase() as any;
    const services = await servicesService.getServicesByCategory(category);
    sendSuccess(res, services, 'Services retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await servicesService.getServiceById(req.params.id);
    sendSuccess(res, service, 'Service retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await servicesService.createService(req.body);
    sendSuccess(res, service, 'Service created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const service = await servicesService.updateService(req.params.id, req.body);
    sendSuccess(res, service, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await servicesService.deleteService(req.params.id);
    sendSuccess(res, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
}
