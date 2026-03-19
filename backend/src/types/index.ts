import { Request } from 'express';

type Role = 'ADMIN' | 'CLIENT';

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
