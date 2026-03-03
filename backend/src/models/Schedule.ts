import { Schema, model } from 'mongoose';

export type ScheduleDocument = {
  date: string;
  status: 'OPEN' | 'CLOSED' | 'HOLIDAY';
  startTime: string;
  endTime: string;
  slotDurationMins: number;
};

const scheduleSchema = new Schema<ScheduleDocument>(
  {
    date: { type: String, required: true, unique: true },
    status: { type: String, enum: ['OPEN', 'CLOSED', 'HOLIDAY'], default: 'OPEN' },
    startTime: { type: String, required: true, default: '09:00' },
    endTime: { type: String, required: true, default: '18:00' },
    slotDurationMins: { type: Number, required: true, default: 30 },
  },
  { timestamps: true }
);

export const Schedule = model<ScheduleDocument>('Schedule', scheduleSchema);