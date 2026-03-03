import { Schema, model } from 'mongoose';

export type UserDocument = {
  phoneNumber: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'CLIENT';
  profileImageUrl?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    phoneNumber: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['ADMIN', 'CLIENT'], default: 'CLIENT' },
    profileImageUrl: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = model<UserDocument>('User', userSchema);