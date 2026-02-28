import { Response, NextFunction } from 'express';
import * as reviewsService from './reviews.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const onlyVisible = req.query.all !== 'true';
    const reviews = await reviewsService.getAllReviews(onlyVisible);
    sendSuccess(res, reviews, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getStats(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await reviewsService.getReviewStats();
    sendSuccess(res, stats, 'Review stats retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const review = await reviewsService.createReview(req.user.userId, req.body);
    sendSuccess(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function remove(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await reviewsService.deleteReview(req.params.id);
    sendSuccess(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function toggleVisibility(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const review = await reviewsService.toggleVisibility(req.params.id);
    sendSuccess(res, review, 'Review visibility toggled');
  } catch (error) {
    next(error);
  }
}
