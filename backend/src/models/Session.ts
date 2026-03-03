import { Schema, model } from 'mongoose';

export type SessionDocument = {
  date: string;
  isClosed: boolean;
};

const sessionSchema = new Schema<SessionDocument>(
  {
    date: { type: String, required: true, unique: true },
    isClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Session = model<SessionDocument>('Session', sessionSchema);