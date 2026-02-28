import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { prisma } from '../../config';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../../utils';
import { UserSanitized } from '../../types';
import { CreateUserInput, UpdateProfileInput } from './users.validation';

const SALT_ROUNDS = 12;

function sanitizeUser(user: {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}): UserSanitized {
  return {
    id: user.id,
    phoneNumber: user.phoneNumber,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function getAllUsers(): Promise<UserSanitized[]> {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return users.map(sanitizeUser);
}

export async function getUserById(id: string): Promise<UserSanitized> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return sanitizeUser(user);
}

export async function createUser(data: CreateUserInput): Promise<UserSanitized> {
  const existing = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });
  if (existing) {
    throw new ConflictError('A user with this phone number already exists');
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      phoneNumber: data.phoneNumber,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role as Role,
    },
  });

  return sanitizeUser(user);
}

export async function deleteUser(
  targetId: string,
  requesterId: string
): Promise<void> {
  if (targetId === requesterId) {
    throw new BadRequestError('Cannot delete your own account');
  }

  const targetUser = await prisma.user.findUnique({ where: { id: targetId } });
  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Check if the first admin (super admin) — simplistic approach: first created admin
  const firstAdmin = await prisma.user.findFirst({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'asc' },
  });

  if (firstAdmin && firstAdmin.id === targetId) {
    throw new ForbiddenError('Cannot delete the super admin');
  }

  await prisma.user.delete({ where: { id: targetId } });
}

export async function deactivateUser(
  targetId: string,
  requesterId: string
): Promise<UserSanitized> {
  if (targetId === requesterId) {
    throw new BadRequestError('Cannot deactivate your own account');
  }

  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: false },
  });

  // Revoke all refresh tokens
  await prisma.refreshToken.deleteMany({ where: { userId: targetId } });

  return sanitizeUser(updated);
}

export async function activateUser(targetId: string): Promise<UserSanitized> {
  const user = await prisma.user.findUnique({ where: { id: targetId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updated = await prisma.user.update({
    where: { id: targetId },
    data: { isActive: true },
  });

  return sanitizeUser(updated);
}

export async function updateProfile(
  userId: string,
  data: UpdateProfileInput
): Promise<UserSanitized> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updateData: Record<string, unknown> = {};

  if (data.firstName !== undefined) {
    updateData.firstName = data.firstName;
  }
  if (data.lastName !== undefined) {
    updateData.lastName = data.lastName;
  }
  if (data.profileImageUrl !== undefined) {
    updateData.profileImageUrl = data.profileImageUrl;
  }
  if (data.password !== undefined) {
    updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return sanitizeUser(updated);
}
