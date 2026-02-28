import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { prisma, config } from '../../config';
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
  NotFoundError,
} from '../../utils';
import { TokenPair, JwtPayload, UserSanitized } from '../../types';
import { RegisterInput, LoginInput } from './auth.validation';

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

function generateAccessToken(userId: string, role: Role): string {
  return jwt.sign(
    { userId, role } as JwtPayload,
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry as unknown as number }
  );
}

function generateRefreshToken(userId: string, role: Role): string {
  return jwt.sign(
    { userId, role } as JwtPayload,
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry as unknown as number }
  );
}

function getRefreshTokenExpiry(): Date {
  // Parse "7d" → 7 days
  const match = config.jwt.refreshExpiry.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000,
  };

  return new Date(Date.now() + value * (multipliers[unit] || multipliers.d));
}

export async function register(data: RegisterInput): Promise<{
  user: UserSanitized;
  tokens: TokenPair;
}> {
  // Check if user already exists
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
      profileImageUrl: data.profileImageUrl ?? null,
    },
  });

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

export async function login(data: LoginInput): Promise<{
  user: UserSanitized;
  tokens: TokenPair;
}> {
  const user = await prisma.user.findUnique({
    where: { phoneNumber: data.phoneNumber },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid phone number or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid phone number or password');
  }

  const accessToken = generateAccessToken(user.id, user.role);
  const refreshToken = generateRefreshToken(user.id, user.role);

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: sanitizeUser(user),
    tokens: { accessToken, refreshToken },
  };
}

export async function refreshAccessToken(oldRefreshToken: string): Promise<TokenPair> {
  // Verify the token
  let decoded: JwtPayload;
  try {
    decoded = jwt.verify(oldRefreshToken, config.jwt.refreshSecret) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  // Check if token exists in DB
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    // Token reuse detected — revoke all tokens for user (security)
    await prisma.refreshToken.deleteMany({
      where: { userId: decoded.userId },
    });
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new UnauthorizedError('Refresh token has expired');
  }

  if (!storedToken.user.isActive) {
    throw new UnauthorizedError('Account has been deactivated');
  }

  // Token rotation: delete old, create new
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  const newAccessToken = generateAccessToken(storedToken.user.id, storedToken.user.role);
  const newRefreshToken = generateRefreshToken(storedToken.user.id, storedToken.user.role);

  await prisma.refreshToken.create({
    data: {
      userId: storedToken.user.id,
      token: newRefreshToken,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
}

export async function logout(refreshToken: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
}

export async function logoutAll(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
}
