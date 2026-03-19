import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { User } from '../models/User';
import {
  AuthRequest,
  Role,
  authenticate,
  parsePagination,
  requireAdmin,
  sanitize,
  sanitizeUser,
} from './helpers';

const router = Router();

router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await User.findById(req.auth!.userId).lean();
    if (!user) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Profile retrieved successfully', data: sanitizeUser(user) });
  } catch (error) {
    next(error);
  }
});

router.put('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const updateBody = req.body as {
      firstName?: string;
      lastName?: string;
      password?: string;
      currentPassword?: string;
      profileImageUrl?: string | null;
    };

    const data: Record<string, unknown> = {};
    if (updateBody.firstName !== undefined) {
      const name = sanitize(String(updateBody.firstName).trim());
      if (name.length < 1 || name.length > 50) {
        res.status(400).json({ success: false, message: 'First name must be 1-50 characters' });
        return;
      }
      data.firstName = name;
    }
    if (updateBody.lastName !== undefined) {
      const name = sanitize(String(updateBody.lastName).trim());
      if (name.length < 1 || name.length > 50) {
        res.status(400).json({ success: false, message: 'Last name must be 1-50 characters' });
        return;
      }
      data.lastName = name;
    }
    if (updateBody.profileImageUrl !== undefined) data.profileImageUrl = updateBody.profileImageUrl;
    if (updateBody.password) {
      if (String(updateBody.password).length < 8) {
        res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
        return;
      }
      if (!updateBody.currentPassword) {
        res.status(400).json({ success: false, message: 'Current password is required to set a new password' });
        return;
      }
      const user = await User.findById(req.auth!.userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'Profile not found' });
        return;
      }
      const valid = await bcrypt.compare(updateBody.currentPassword, user.passwordHash);
      if (!valid) {
        res.status(401).json({ success: false, message: 'Current password is incorrect' });
        return;
      }
      data.passwordHash = await bcrypt.hash(updateBody.password, 10);
    }

    const updated = await User.findByIdAndUpdate(req.auth!.userId, data, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'Profile not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Profile updated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.get('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = parsePagination(req.query as any);
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(take).lean(),
      User.countDocuments(),
    ]);
    res.status(200).json({ success: true, message: 'Users retrieved successfully', data: users.map(sanitizeUser), page, limit, total });
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { phoneNumber, password, firstName, lastName, role } = req.body as {
      phoneNumber: string;
      password: string;
      firstName: string;
      lastName: string;
      role: Role;
    };

    if (!phoneNumber || !password || !firstName || !lastName || !role) {
      res.status(400).json({ success: false, message: 'Missing required fields' });
      return;
    }

    if (!/^(0\d{9}|\+94\d{9})$/.test(String(phoneNumber))) {
      res.status(400).json({ success: false, message: 'Phone number must be 0XXXXXXXXX or +94XXXXXXXXX format' });
      return;
    }

    const validRoles: Role[] = ['ADMIN', 'CLIENT'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ success: false, message: 'Invalid role. Must be ADMIN or CLIENT' });
      return;
    }

    const exists = await User.findOne({ phoneNumber }).lean();
    if (exists) {
      res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
      return;
    }

    const created = await User.create({
      phoneNumber,
      passwordHash: await bcrypt.hash(password, 10),
      firstName: sanitize(String(firstName).trim()),
      lastName: sanitize(String(lastName).trim()),
      role,
      profileImageUrl: null,
      isActive: true,
    });

    res.status(201).json({ success: true, message: 'User created successfully', data: sanitizeUser(created) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }

    const update = req.body as {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      role?: Role;
      isActive?: boolean;
    };

    if (update.role !== undefined) {
      const validRoles: Role[] = ['ADMIN', 'CLIENT'];
      if (!validRoles.includes(update.role)) {
        res.status(400).json({ success: false, message: 'Invalid role. Must be ADMIN or CLIENT' });
        return;
      }
    }

    if (update.phoneNumber) {
      const duplicate = await User.findOne({ phoneNumber: update.phoneNumber, _id: { $ne: req.params.id } }).lean();
      if (duplicate) {
        res.status(409).json({ success: false, message: 'A user with this phone number already exists' });
        return;
      }
    }

    const sanitizedUpdate: Record<string, unknown> = {};
    if (update.firstName !== undefined) sanitizedUpdate.firstName = sanitize(String(update.firstName).trim());
    if (update.lastName !== undefined) sanitizedUpdate.lastName = sanitize(String(update.lastName).trim());
    if (update.phoneNumber !== undefined) sanitizedUpdate.phoneNumber = update.phoneNumber;
    if (update.role !== undefined) sanitizedUpdate.role = update.role;
    if (update.isActive !== undefined) sanitizedUpdate.isActive = update.isActive;

    const updated = await User.findByIdAndUpdate(req.params.id, sanitizedUpdate, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User updated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }

    if (req.auth!.userId === req.params.id) {
      res.status(400).json({ success: false, message: 'Cannot delete your own account' });
      return;
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully', data: null });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/deactivate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User deactivated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

router.put('/:id/activate', authenticate, requireAdmin, async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400).json({ success: false, message: 'Invalid user id' });
      return;
    }
    const updated = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true }).lean();
    if (!updated) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'User activated successfully', data: sanitizeUser(updated) });
  } catch (error) {
    next(error);
  }
});

export default router;
