import crypto from 'crypto';
import { Schema, model } from 'mongoose';

export type RefreshTokenDocument = {
  tokenHash: string;
  userId: string;
  expiresAt: Date;
};

const refreshTokenSchema = new Schema<RefreshTokenDocument>(
  {
    tokenHash: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL auto-delete
  },
  { timestamps: true }
);

export const RefreshToken = model<RefreshTokenDocument>('RefreshToken', refreshTokenSchema);

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
