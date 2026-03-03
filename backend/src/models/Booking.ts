import { Schema, model } from 'mongoose';

export type BookingDocument = {
  userId?: string;
  fullName: string;
  email: string;
  phone: string;
  serviceName: string;
  date: string;
  time: string;
  notes: string;
  status: 'BOOKED' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  queuePosition: number;
  isReserved: boolean;
};

const bookingSchema = new Schema<BookingDocument>(
  {
    userId: { type: String, default: null },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: { type: String, default: '' },
    status: {
      type: String,
      enum: ['BOOKED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
      default: 'BOOKED',
    },
    queuePosition: { type: Number, default: 0 },
    isReserved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Booking = model<BookingDocument>('Booking', bookingSchema);
