import bcrypt from 'bcryptjs';
import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RefreshToken, hashToken } from '../models/RefreshToken';
import { User } from '../models/User';
import {
  AuthPayload,
  AuthRequest,
  authenticate,
  sanitize,
  sanitizeUser,
  signAccessToken,
  signRefreshToken,
} from './helpers';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

router.post('/register', authLimiter, async (req, res, next) => {
  try {
    const { phoneNumber, password, firstName, lastName } = req.body as {
      phoneNumber: string;
      password: string;
      firstName: string;
      lastName: string;
    };

    if (!phoneNumber || !password || !firstName || !lastName) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    if (!/^(0\d{9}|\+94\d{9})$/.test(String(phoneNumber))) {
      res.status(400).json({ success: false, message: 'Phone number must be 0XXXXXXXXX or +94XXXXXXXXX format' });
      return;
    }

    if (String(password).length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
      return;
    }

    const cleanFirst = sanitize(String(firstName).trim());
    const cleanLast = sanitize(String(lastName).trim());
    if (cleanFirst.length < 1 || cleanFirst.length > 50 || cleanLast.length < 1 || cleanLast.length > 50) {
      res.status(400).json({ success: false, message: 'First and last name are required (max 50 characters each)' });
      return;
    }

    const exists = await User.findOne({ phoneNumber }).lean();
    if (exists) {
      res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      phoneNumber,
      passwordHash,
      firstName: cleanFirst,
      lastName: cleanLast,
      role: 'CLIENT',
      profileImageUrl: null,
      isActive: true,
    });

    const payload: AuthPayload = { userId: String(user._id), role: user.role };
    const refreshToken = signRefreshToken(payload);
    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ tokenHash: hashToken(refreshToken), userId: String(user._id), expiresAt: tokenExpiresAt });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: sanitizeUser(user),
        accessToken: signAccessToken(payload),
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, async (req, res, next) => {
  try {
    const { phoneNumber, password } = req.body as {
      phoneNumber: string;
      password: string;
    };

    if (!phoneNumber || !password) {
      res.status(400).json({ success: false, message: 'Phone number and password are required' });
      return;
    }

    const user = await User.findOne({ phoneNumber });
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid phone number or password' });
      return;
    }

    if (!user.isActive) {
      res.status(401).json({ success: false, message: 'Account has been deactivated' });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: 'Invalid phone number or password' });
      return;
    }

    const payload: AuthPayload = { userId: String(user._id), role: user.role };
    const refreshToken = signRefreshToken(payload);
    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ tokenHash: hashToken(refreshToken), userId: String(user._id), expiresAt: tokenExpiresAt });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: sanitizeUser(user),
        accessToken: signAccessToken(payload),
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh', authLimiter, async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (!refreshToken) {
      res.status(400).json({ success: false, message: 'Refresh token is required' });
      return;
    }

    let decoded: AuthPayload;
    try {
      decoded = jwt.verify(refreshToken, env.jwtRefreshSecret) as AuthPayload;
    } catch {
      res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      return;
    }

    const tokenHash = hashToken(refreshToken);
    const stored = await RefreshToken.findOneAndDelete({ tokenHash, userId: decoded.userId });
    if (!stored) {
      await RefreshToken.deleteMany({ userId: decoded.userId });
      res.status(401).json({ success: false, message: 'Refresh token already used or revoked' });
      return;
    }

    const payload: AuthPayload = { userId: decoded.userId, role: decoded.role };
    const newRefreshToken = signRefreshToken(payload);
    const tokenExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await RefreshToken.create({ tokenHash: hashToken(newRefreshToken), userId: decoded.userId, expiresAt: tokenExpiresAt });

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        accessToken: signAccessToken(payload),
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', async (req, res, next) => {
  try {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await RefreshToken.deleteOne({ tokenHash: hashToken(String(refreshToken)) });
    }
    res.status(200).json({ success: true, message: 'Logged out successfully', data: null });
  } catch (error) {
    next(error);
  }
});

router.post('/logout-all', authenticate, async (req: AuthRequest, res, next) => {
  try {
    await RefreshToken.deleteMany({ userId: req.auth!.userId });
    res.status(200).json({ success: true, message: 'Logged out of all devices', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
