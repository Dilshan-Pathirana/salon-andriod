import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import sanitizeHtml from 'sanitize-html';
import { env } from '../config/env';
import { Booking } from '../models/Booking';

export type Role = 'ADMIN' | 'CLIENT';

export type AuthPayload = {
  userId: string;
  role: Role;
};

export type AuthRequest = Request & { auth?: AuthPayload };

/** Strip all HTML tags from user input to prevent stored XSS */
export function sanitize(input: string): string {
  return sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
}

export function todayString(): string {
  const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
  const ist = new Date(Date.now() + IST_OFFSET_MS);
  return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
}

export function parsePagination(query: { page?: string; limit?: string }): { skip: number; take: number; page: number; limit: number } {
  const page = Math.max(1, parseInt(query.page || '1', 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '50', 10) || 50));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function sanitizeUser(user: {
  _id: unknown;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: Role;
  profileImageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
}) {
  return {
    id: String(user._id),
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user.phoneNumber,
    role: user.role,
    profileImageUrl: user.profileImageUrl ?? null,
    isActive: user.isActive,
    createdAt: user.createdAt ?? new Date(),
  };
}

export function signAccessToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, { expiresIn: '15m' });
}

export function signRefreshToken(payload: AuthPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, { expiresIn: '30d' });
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access token is required' });
    return;
  }

  const token = authHeader.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthPayload;
    req.auth = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'ADMIN') {
    res.status(403).json({ success: false, message: 'Admin access required' });
    return;
  }
  next();
}

export async function resequenceQueue(date: string): Promise<void> {
  const active = await Booking.find({
    date,
    status: { $in: ['BOOKED', 'IN_SERVICE'] },
  })
    .sort({ time: 1, createdAt: 1 })
    .lean();

  await Promise.all(
    active.map((row, index) =>
      Booking.updateOne(
        { _id: row._id },
        { $set: { queuePosition: index + 1 } },
      )
    )
  );
}
