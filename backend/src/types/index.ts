import { Request } from 'express';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface UserSanitized {
  id: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: Role;
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}
