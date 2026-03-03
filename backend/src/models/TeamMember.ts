import { Schema, model } from 'mongoose';

export type TeamMemberDocument = {
  name: string;
  title: string;
  experienceYears: number;
  avatar: string;
  portfolio: string[];
};

const teamMemberSchema = new Schema<TeamMemberDocument>(
  {
    name: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    experienceYears: { type: Number, required: true },
    avatar: { type: String, required: true },
    portfolio: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export const TeamMember = model<TeamMemberDocument>('TeamMember', teamMemberSchema);
