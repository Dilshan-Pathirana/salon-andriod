import { Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { sendSuccess } from '../../utils';
import { AuthenticatedRequest } from '../../types';

export async function getAllUsers(
  _req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await usersService.getAllUsers();
    sendSuccess(res, users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function getUserById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.getUserById(req.params.id);
    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
}

export async function createUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.createUser(req.body);
    sendSuccess(res, user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    await usersService.deleteUser(req.params.id, req.user.userId);
    sendSuccess(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function deactivateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const user = await usersService.deactivateUser(req.params.id, req.user.userId);
    sendSuccess(res, user, 'User deactivated successfully');
  } catch (error) {
    next(error);
  }
}

export async function activateUser(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = await usersService.activateUser(req.params.id);
    sendSuccess(res, user, 'User activated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateUserByAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const user = await usersService.updateUserByAdmin(req.params.id, req.user.userId, req.body);
    sendSuccess(res, user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const user = await usersService.updateProfile(req.user.userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function getMyProfile(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) throw new Error('Auth required');
    const user = await usersService.getUserById(req.user.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
}
